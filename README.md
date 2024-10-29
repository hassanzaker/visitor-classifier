
# User Classifier Project

This project is a **User Classification Tool** that uses web scraping and OpenAI's GPT model to classify users based on their responses to dynamically generated questions. The project consists of a backend built with Flask and a frontend created using React.

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
