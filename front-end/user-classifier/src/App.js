import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './components/HomePage';
import QuestionModal from './components/QuestionModal';
import LoadingSpinner from './components/LoadingSpinner';
import FunnyLoader from './components/FunnyLoader';


const App = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [url, setUrl] = useState("");

  const getSiteName = (url) => {
    // Create a URL object to easily access parts of the URL
    const urlObj = new URL(url);
    let hostname = urlObj.hostname; // Extract the hostname, e.g., "www.sitename.com"
  
    // Remove "www." if it exists
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4); // Removes the first 4 characters ("www.")
    }
  
    return hostname;
  }

  const handleSubmitUrl = async (inputUrl) => {
    setUrl(inputUrl);


    setLoadingMessage(`Fetching from ${getSiteName(inputUrl)}`);
    setLoading(true);
    setShowModal(false);
    

    try {
      const response = await axios.post('http://127.0.0.1:5000/scrape', { url: inputUrl });
      setTimeout(() => {
        setLoading(false);
        setQuestions(response.data.questions);
        setShowModal(true);
      }, 1000);
    } catch (error) {
      toast.error("Error fetching questions. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmitAnswers = async (answers) => {
    setLoadingMessage(`Submittig Answers`);
    setLoading(true);
    setShowModal(false);
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/submit_answer', { url, answers });
      const formattedCategories = response.data.categories
        .map(categoryObj => `${categoryObj.category}: ${categoryObj.labels.join(", ")}`)
        .join("\n\n");

      toast.success(formattedCategories, {
        className: "toast-container",
        bodyClassName: "toast-message",
        position: "top-center",
        autoClose: 5000
      });

      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      toast.error("Error submitting answers. Please try again.");
    }
  };

  return (
    <div className="container text-center mt-5">
      <ToastContainer />
      {loading ? <FunnyLoader message={loadingMessage}/> : <HomePage onSubmitUrl={handleSubmitUrl} />}
      <QuestionModal
        isOpen={showModal}
        questions={questions}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitAnswers}
      />
    </div>
  );
}

export default App;