import json

import redis
from flask_caching import Cache
from openai import OpenAI
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from flask import Flask, request, jsonify, Response
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()  # Load environment variables from .env file
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize Flask and Redis
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


app.config['CACHE_TYPE'] = 'RedisCache'
app.config['CACHE_REDIS_HOST'] = 'localhost'
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_DEFAULT_TIMEOUT'] = 86400  # Cache timeout in seconds (1 day)

# Configure caching
cache = Cache(app)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

client = OpenAI()


@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    data = request.json
    url = data.get('url')
    user_response = data.get('answers')

    if not user_response:
        return jsonify({'error': 'answers are required'}), 400

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    categories_text = redis_client.get("categories_" + url)
    if not categories_text:
        return jsonify({"error": "No category data found for the given URL"}), 404

    try:
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
                    )
                },
                {
                    "role": "user",
                    "content": (
                        "Here are the user's responses to the questions:\n\n"
                        f"{user_response}\n\n"
                        "Classify the user based on the answers provided. Assign labels within each category that align with the user's preferences."
                    )
                }
            ],
            temperature=0.7,
            max_tokens=300,
            top_p=1
        )

        labels = response.choices[0].message.content.strip()
        labels = labels.replace("```json", "").replace("```", "").strip()
        print()

        try:
            labels_json = json.loads(labels)  # Parse the JSON string into a Python dictionary
        except json.JSONDecodeError as e:
            return jsonify({"error": "Failed to parse JSON", "details": str(e)}), 500

        # Return the JSON response
        return jsonify(labels_json)

    except Exception as e:
        return jsonify({'error': str(e)}), 500





@app.route('/scrape', methods=['POST'])
def scrape_website():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    cached_questions = redis_client.get(url)
    if cached_questions:
        return jsonify(eval(cached_questions)), 200

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

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a model designed to generate questions that help classify users' interests and industries based on content themes. "
                        "Your goal is to create questions that reveal information across four categories "
                        f"{categories_text}"
                        " . A user may belong to multiple labels in each category. "
                        "Generate 7 questions based on the provided content, each aiming to identify the most relevant labels across "
                        "these categories. Questions should be broad enough to apply to various users but specific enough to gather useful "
                        "information. Structure each question as a multiple-choice format with several options, allowing users to select "
                        "one or more responses. Output should follow this structure: "
                        "`{questions: [{'question': 'Question text here?', 'options': ['Option 1', 'Option 2', 'Option 3', ...]}, ...]}`. "
                        "Ensure options are relevant to the content and representative of diverse user interests and backgrounds."
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

        try:
            text_data_json = json.loads(questions_text)  # Parse the JSON string into a Python dictionary
        except json.JSONDecodeError as e:
            return jsonify({"error": "Failed to parse JSON", "details": str(e)}), 500

        # Return the JSON response
        return jsonify(text_data_json)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        driver.quit()


@app.route('/')
def home():
    return "Welcome!"

