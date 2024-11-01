import json
import uuid
from datetime import timedelta

import redis
from flask_caching import Cache
from openai import OpenAI
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from flask import Flask, request, jsonify, Response, session, make_response
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
from flask_cors import CORS

from dynamoDBUtils import *

import secrets


# Set up logging
logging.basicConfig(filename='/var/log/flaskapp.log', level=logging.DEBUG, 
                    format='%(asctime)s %(levelname)s: %(message)s')

# Log when Flask app starts
logging.info("Starting Flask app")


# Load environment variables (such as API keys)
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize Flask application and enable CORS for all routes
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure Redis cache
app.config['CACHE_TYPE'] = 'RedisCache'
app.config['CACHE_REDIS_HOST'] = 'localhost'
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_DEFAULT_TIMEOUT'] = 86400  # Cache timeout in seconds (1 day)
cache = Cache(app)

# Initialize Redis client and OpenAI client
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
client = OpenAI()

@app.route('/flask/user', methods=['GET'])
def get_user_data():
    try:
	logging.info(request.remote_addr)
        user_id = request.remote_addr
        data = get_visitor(user_id)

        if data:
            categories = []
            sites = []

            # Iterate through each site in the user's data
            for site in data.get("sites", []):
                for category in site.get("categories", []):
                    # Append each category name to the categories list
                    categories.append({'site': site['address'], 'category': category['category'], 'labels': category['labels']})
                sites.append(site['address'])
            return jsonify({
                "userId": user_id,
                "sites": sites,
                "categories": categories
            }), 200
        else:
            return jsonify({
                "userId": user_id,
                "sites": [],
                "categories": []
            }), 200
    except Exception as e:
        return jsonify({'error': 'user data not found!', 'err': str(e)}), 404

@app.route('/flask/question', methods=['GET'])
def get_question():
    try:
        url = request.args.get('url')
        user_id = request.remote_addr
        visitor = get_visitor(user_id)

        # Iterate through each site in the user's data
        for site in visitor.get("sites", []):
            if site['address'] == url:
                return jsonify(site), 200
        else:
            return jsonify({'error': "item not found"}), 404

    except Exception as e:
        return jsonify({'error': 'user data not found!', 'err': str(e)}), 400

@app.route('/flask/submit_answer', methods=['POST'])
def submit_answer():
    """Process user's answers, classify based on responses, and return classification labels."""
    data = request.json
    url = data.get('url')
    user_id = request.remote_addr
    user_response = data.get('answers')

    # Validate required data fields
    if not user_response:
        return jsonify({'error': 'answers are required'}), 400
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    # Retrieve cached category data
    categories_text = redis_client.get("categories_" + url)

    questions = json.loads(redis_client.get(url))['questions']
    for i in range(len(questions)):
        questions[i]['answers'] = user_response[i]

    if not categories_text:
        return jsonify({"error": "No category data found for the given URL"}), 404

    try:
        # Send request to OpenAI for classification
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a model that classifies users based on their answers to questions related to specific categories. "
                        "The categories and their potential labels are as follows:\n"
                        f"{categories_text}\n\n"
                        "Each user may belong to multiple labels in each category. "
                        "Your task is to analyze the user's responses and assign the most relevant labels within each category. "
                        "Output should follow this structure:\n"
                        "`{\"categories\": [{\"category\": \"Category Name\", \"labels\": [\"Label 1\", \"Label 2\", ...]}, ...]}`."
                        " Make sure that each label accurately reflects the user's preferences and engagement levels within each category."
                        "You should only choose among available labels. You can use the answer of questions for classifying all categories.  "

                    )
                },
                {
                    "role": "user",
                    "content": (
                        "Here are the user's responses to the questions:\n\n"
                        f"{questions}\n\n"
                        "Classify the user based on the answers provided. Assign labels within each category that align with the user's preferences."
                    )
                }
            ],
            temperature=0.7,
            max_tokens=300,
            top_p=1
        )



        # Parse and clean response
        labels = response.choices[0].message.content.strip()
        labels = labels.replace("```json", "").replace("```", "").strip() # Convert to JSON dictionary
        labels_json = json.loads(labels)  # Parse the JSON string into a Python dictionary
        x = add_categories(str(user_id), url, questions, labels_json['categories'])
        return jsonify(labels_json)  # Send JSON response back to client

    except Exception as e:
        return jsonify({'error': str(e)}), 500




def read_page_content(url):
    """Use Selenium to fetch and parse website content into readable text."""
    try:
        # Set up Selenium driver
        service = webdriver.chrome.service.Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service)
        driver.get(url)
        driver.implicitly_wait(10)

        # Get page source and parse it with BeautifulSoup
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        text_content = soup.get_text()
        return text_content, driver
    except Exception as e:
        raise e


def fetch_categories_from_gpt(text_content, url):
    """Request OpenAI GPT to generate categories based on the website's content theme."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI model tasked with identifying relevant classification categories and associated labels based on the theme of a given website. "
                        "For each website, generate two or three specific categories that would help classify user interests, preferences, or engagement levels. "
                        "Additionally, provide possible labels within each category that represent various user segments or preferences. "
                        "For example, if the theme is 'movies and cinema,' suitable categories could include 'favorite genres,' 'favorite actors,' and 'level of engagement with movies,' "
                        "with labels like 'Action,' 'Comedy,' 'Drama,' or 'Frequent Viewer,' 'Casual Viewer,' 'New Release Enthusiast.' "
                        "If the theme is 'sports,' categories could include 'favorite sport,' 'level of physical activity,' or 'favorite teams,' "
                        "with labels like 'Soccer,' 'Basketball,' 'Active Participant,' 'Fan,' 'Team Supporter.' "
                        "Think about classifications that capture user identity, preferences, or engagement within the theme. "
                        "Output should be structured as: `{categories: [{'category': 'Category Name', 'labels': ['Label 1', 'Label 2', ...]}, ...]}`."
                    )
                },
                {
                    "role": "user",
                    "content": text_content[:1500]
                }
            ],
            temperature=0.7,
            max_tokens=300,
            top_p=1
        )

        categories = response.choices[0].message.content.strip()
        categories = categories.replace("```json", "").replace("```", "").strip()
        categories_text = [q.strip() for q in categories.split("\n") if q.strip()]

        # Cache the categories with the categories_URL as the key
        redis_client.setex("categories_" + url, 86400, str(categories_text))  # Cache for 1 day (86400 seconds)


        return categories_text
    except Exception as e:
        raise e


def generate_questions_from_gpt(categories_text, text_content, url):
    """Request OpenAI GPT to generate classification questions based on content categories."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a model designed to generate questions that help classify users' interests and industries based on content themes. "
                        f"This shows the structure of the categories: {categories_text}"
                        " . A user may belong to multiple labels in each category. "
                        "Generate 7 questions based on the provided content, each aiming to identify the most relevant labels across "
                        "these categories. Questions should be broad enough to apply to various users but specific enough to gather useful "
                        "information. Structure each question as a multiple-choice format with several options, allowing users to select "
                        "one or more responses. Output should follow this structure: "
                        "`{questions: [{'question': 'Question text here?', 'options': ['Option 1', 'Option 2', 'Option 3', ...]}, ...]}`. "
                        "Ensure options are relevant to the content and representative of diverse user interests and backgrounds."
                        "Try these questions to not be limited to one category. Questions can be multi dimensional."
                    )
                },
                {
                    "role": "user",
                    "content": text_content[:1500]
                }
            ],
            temperature=0.7,
            max_tokens=700,
            top_p=1
        )
        questions_text = response.choices[0].message.content.strip()
        questions_text = questions_text.replace("```json", "").replace("```", "").strip()

        # Cache the generated questions with the URL as the key
        redis_client.setex(url, 86400, str(questions_text))  # Cache for 1 day (86400 seconds)

        return questions_text

    except Exception as e:
        raise e


def get_website_summary(text_content, url):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a model designed to generate questions that to summarize a website's context. "
                        "Your goal is to summarize the provided text and try to have followings in your summarization. "
                        f"A small overview of what website does by enhancing on its main theme, and a short list of what it provides."
                        " Give me a text as Answer. The text should not be more than 300 characters."
                    )
                },
                {
                    "role": "user",
                    "content": text_content
                }
            ],
            temperature=0.7,
            max_tokens=400,
            top_p=1
        )
        summary = response.choices[0].message.content.strip()
        print(summary)
        redis_client.setex(url + '_summary', 86400, str(summary))

        return summary
    except Exception as e:
        raise e

@app.route('/flask/scrape', methods=['POST'])
def scrape_website():
    """Scrapes website content, generates categories and questions, and caches the results."""
    data = request.json
    url = data.get('url')
    user_id = request.remote_addr
    print("user_id", user_id)
    site_name = get_site_name(url)

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    cached_questions = redis_client.get(site_name)
    if cached_questions:
        return jsonify(eval(cached_questions)), 200   # Return cached questions if available

    try:
        text_content, driver = read_page_content(url)  # Fetch website content
        summary = get_website_summary(text_content, site_name)
        categories_text = fetch_categories_from_gpt(text_content, site_name)  # Get classification categories
        questions_text = generate_questions_from_gpt(categories_text, text_content, site_name)  # Generate questions

        questions = json.loads(questions_text)
        questions['summary'] = summary
        add_url(str(user_id), site_name, questions['questions'], summary)
        # Convert question data to JSON for response
        return jsonify(questions)

    except Exception as e:
        return jsonify({'error': str(e.__traceback__)}), 500

    finally:
        driver.quit()


@app.route('/flask/home')
def home():
    """Root endpoint with a welcome message."""
    return "Welcome!"

