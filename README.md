This project leverages a variety of tools and technologies to provide a robust user classification tool. The backend is built with Flask, and I use Playwright for web scraping, allowing the application to handle dynamic web content efficiently. For processing tasks like generating questions, summarizing, and categorizing, I’ve integrated OpenAI’s GPT-4 model (gpt-4o-mini). This backend is hosted on an AWS EC2 instance alongside another Django project, with Nginx as the web server to route requests; the Flask application is accessible at https://api.movielads.net/flask/. Caching is handled by Redis, where I store data on recently searched URLs for quicker responses, and I use DynamoDB to manage user data, identifying each user by their IP address for simplicity (this could be updated if more specific user tracking is required). The frontend is built with React, where I’ve integrated components from an existing project hosted on AWS Amplify, allowing both applications to share a consistent UI. The classification tool is available at https://movielads.net/classifier/, with the frontend source code accessible on GitHub at https://github.com/hassanzaker/movielads-front.


# User Classifier Project

This project is a **User Classification Tool** that uses web scraping and OpenAI's GPT model to classify users based on their responses to dynamically generated questions. The project consists of a backend built with Flask and a frontend created using React.

The website is accessible through [https://movielads.net/classifier/](https://movielads.net/classifier/).

## Project Structure

```
user-classifier/
├── backend/
│   ├── app.py               # Main backend application file (Flask API)
│   ├── test.json            # Sample JSON file for testing purposes
│   └── .idea/               # IDE configuration files (can be ignored)
├── front-end/user-classifier/
│   ├── public/              # Public files for React frontend
│   ├── src/                 # Source files for React components
│   ├── .gitignore           # Git ignore file for frontend
│   ├── README.md            # Readme file for frontend
│   ├── package.json         # Node.js package manager configuration
│   └── package-lock.json    # Dependency lockfile
└── .gitignore               # Git ignore file for main project
└── README.md                # Main Readme file for project
```

## Getting Started

### Prerequisites

- **Backend**: Python 3.x, Flask, Redis, OpenAI API key, ChromeDriver (for Selenium)
- **Frontend**: Node.js, npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd user-classifier
   ```

2. **Set up Backend**

   - Navigate to the backend folder:

     ```bash
     cd backend
     ```

   - Install dependencies:

     ```bash
     pip install -r requirements.txt
     ```

   - Set up environment variables (e.g., for the OpenAI API key) in a `.env` file.

   - Start the Flask server:

     ```bash
     python app.py
     ```

3. **Set up Frontend**

   - Navigate to the frontend folder:

     ```bash
     cd front-end/user-classifier
     ```

   - Install dependencies:

     ```bash
     npm install
     ```

   - Start the React development server:

     ```bash
     npm start
     ```

### Usage

1. **Access the Application**: Open your browser and go to `http://localhost:3000`.
2. **Enter Website URL**: On the home page, enter the URL of the website you wish to analyze.
3. **Answer Questions**: After submitting the URL, questions will be generated based on the website content. Answer them to classify the user based on interests and preferences.
4. **View Results**: After submission, classification results are displayed in a toast notification.

### Project Flow

1. **Backend (Flask)**: The backend scrapes content from a user-provided URL using Selenium and processes it to generate categories and questions using the OpenAI GPT model. Redis is used to cache responses for faster processing on repeated URLs.
2. **Frontend (React)**: The frontend provides an interactive interface for users to submit a URL, answer generated questions, and view classification results.

### Technologies Used

- **Frontend**: React, Bootstrap, Axios, React-Icons, React-Toastify
- **Backend**: Flask, Redis, OpenAI API, Selenium, BeautifulSoup
- **Caching**: Redis

## Contributing

Feel free to submit issues or pull requests to improve this project.

## License

This project is licensed under the MIT License.
