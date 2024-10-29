import React, { useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

import HomePage from './components/HomePage';
import QuestionModal from './components/QuestionModal';
import LoadingSpinner from './components/LoadingSpinner';
import FunnyLoader from './components/FunnyLoader';


// Set axios Default URL
axios.defaults.baseURL = 'http://127.0.0.1:5000/';


// Main App component
const App = () => {
  // State variables
  const [questions, setQuestions] = useState([]); // Stores questions fetched from the backend
  const [loading, setLoading] = useState(false); // Controls loading state
  const [showModal, setShowModal] = useState(false); // Controls the visibility of the QuestionModal
  const [loadingMessage, setLoadingMessage] = useState(''); // Stores the loading message to be displayed
  const [url, setUrl] = useState(""); // Stores the website URL entered by the user

  // Function to extract just the site name from a full URL
  const getSiteName = (url) => {
    const urlObj = new URL(url); // Create a URL object to access URL parts
    let hostname = urlObj.hostname; // Extract the hostname, e.g., "www.sitename.com"

    // Remove "www." if it exists to get just "sitename.com"
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4); // Remove the first 4 characters ("www.")
    }

    return hostname;
  };

  // Handle URL submission and fetch questions
  const handleSubmitUrl = async (inputUrl) => {
    setUrl(inputUrl); // Store the input URL
    setLoadingMessage(`Fetching from ${getSiteName(inputUrl)}`); // Set loading message with site name
    setLoading(true); // Enable loading spinner
    setShowModal(false); // Hide the modal until questions are fetched

    try {
      // Send a POST request to fetch questions for the given URL
      const response = await axios.post('/scrape', { url: inputUrl });

      // Delay to simulate loading before showing questions
      setTimeout(() => {
        setLoading(false); // Stop loading spinner
        setQuestions(response.data.questions); // Store the fetched questions
        setShowModal(true); // Show the QuestionModal with questions
      }, 1000);
    } catch (error) {
      toast.error("Error fetching questions. Please try again."); // Show error toast if request fails
      setLoading(false); // Stop loading spinner
    }
  };

  // Handle answers submission to the backend
  const handleSubmitAnswers = async (answers) => {
    setLoadingMessage(`Submitting Answers`); // Set loading message
    setLoading(true); // Enable loading spinner
    setShowModal(false); // Hide the modal while submitting answers

    try {
      // Send a POST request with answers to the backend
      const response = await axios.post('/submit_answer', { url, answers });

      // Format the categories and labels into a readable string
      const formattedCategories = response.data.categories
        .map(categoryObj => `${categoryObj.category}: ${categoryObj.labels.join(", ")}`)
        .join("\n\n");

      // Show a success toast with formatted categories and labels
      toast.success(formattedCategories, {
        duration: 4000,
        style: {
            background: '#4caf50',
            color: '#fff',
        }
      });
      // Delay to keep loading spinner for a brief time before stopping
      setTimeout(() => {
        setLoading(false); // Stop loading spinner
      }, 500);
    } catch (error) {
      toast.error("Error submitting answers. Please try again."); // Show error toast if request fails
    }
  };

  return (
    <div className="container text-center mt-5">
      {/* Toast container for displaying notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Show FunnyLoader during loading, otherwise display the HomePage component */}
      {loading ? <FunnyLoader message={loadingMessage} /> : <HomePage onSubmitUrl={handleSubmitUrl} />}

      {/* QuestionModal component to display questions */}
      <QuestionModal
        isOpen={showModal} // Control visibility of modal
        questions={questions} // Pass questions to modal
        onClose={() => setShowModal(false)} // Close modal handler
        onSubmit={handleSubmitAnswers} // Submit answers handler
      />
    </div>
  );
}

export default App;