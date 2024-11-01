import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import FunnyLoader from './components/FunnyLoader';
import './App.css';

import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import axios from 'axios';
import InfoWindow from './components/InfoWindow';

// Set axios Default URL
// axios.defaults.baseURL = 'http://127.0.0.1:5000/flask/';
axios.defaults.baseURL = 'https://api.movielads.net/flask/';


const App = () => {
  const [userId, setUserid] = useState({});
  const [chats, setChats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(''); // Stores the loading message to be displayed
  const [url, setUrl] = useState(""); // Stores the website URL entered by the user
  const [questions, setQuestions] = useState([]); // Stores questions fetched from the backend
  const [summary, setSummary] = useState('');

  useEffect(() => {
    fetchData(); // Call the async function
  }, []);


  useEffect(() => {
    console.log(activeChat);
    if (activeChat)
      getQuestions();
    else
      fetchData();
  }, [activeChat]);

  // Define the async function inside useEffect
  const fetchData = async () => {
    try {
      const response = await axios.get("/user");
      setUserid(response.data.userId);
      setChatNames(response.data.sites);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };

  const getQuestions = async () => {
    setLoadingMessage(`Loading ${activeChat}`); // Set loading message with site name
    setLoading(true); // Enable loading spinner

    try {
      const response = await axios.get('/question', {
        params: {
          url: activeChat
        }
      });

      setLoading(false); // Stop loading spinner
      setQuestions(response.data.questions); // Store the fetched questions
      setSummary(response.data.summary);
      if (response.data.categories) {
        setCategories(response.data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      toast.error("Error fetching questions. Please try again."); // Show error toast if request fails
      setLoading(false); // Stop loading spinner
    }
  };


  const handleSubmitUrl = async (inputUrl) => {
    console.log(inputUrl);
    setUrl(inputUrl); // Store the input URL
    setLoadingMessage(`Fetching from ${getSiteName(inputUrl)}`); // Set loading message with site name
    setLoading(true); // Enable loading spinner

    try {
      // Send a POST request to fetch questions for the given URL
      const response = await axios.post('/scrape', { url: inputUrl });

      // Delay to simulate loading before showing questions
      // setTimeout(() => {
      setLoading(false); // Stop loading spinner
      setQuestions(response.data.questions); // Store the fetched questions
      setSummary(response.data.summary);
      setActiveChat(getSiteName(inputUrl));
      fetchData();
      // }, 1000);
    } catch (error) {
      toast.error("Error fetching questions. Please try again."); // Show error toast if request fails
      setLoading(false); // Stop loading spinner
    }
  };

  // Handle answers submission to the backend
  const handleSubmitAnswers = async (answers) => {
    setLoadingMessage(`Submitting Answers`); // Set loading message
    setLoading(true); // Enable loading spinner

    try {
      // Send a POST request with answers to the backend
      const url = activeChat;
      const response = await axios.post('/submit_answer', { url, answers });
      setCategories(response.data.categories);

    } catch (error) {
      toast.error("Error submitting answers. Please try again."); // Show error toast if request fails
    } finally {
      setLoading(false);
    }
  };


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

  const setChatNames = (sites) => {
    const chats = [];
    let counter = 0;
    sites.forEach(site => {
      chats.push(site);
    });
    setChats(chats);
  };

  if (loading) {
    return <FunnyLoader message={loadingMessage} />;
  }


  return (
    <div className="app-container">
      {/* Toast container for displaying notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar chats={chats} setActiveChat={setActiveChat} activeChat={activeChat} />
      {loading ?
        <FunnyLoader message={loadingMessage} />
        :
        <InfoWindow
          chats={chats} getSiteName={getSiteName}
          handleSubmitUrl={handleSubmitUrl} activeChat={activeChat}
          categories={categories} userId={userId}
          setActiveChat={setActiveChat}
          questions={questions}
          onSubmitAnswer={handleSubmitAnswers}
          summary={summary}
        />
      }
    </div>
  );
}

export default App;