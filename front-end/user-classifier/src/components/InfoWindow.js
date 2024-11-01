import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';

const InfoWindow = ({ activeChat, setActiveChat, chats, getSiteName, handleSubmitUrl, userId, categories, summary, questions, onSubmitAnswer }) => {
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [localCategories, setLocalCategories] = useState([]);
  const [localQuestions, setLocalQuestions] = useState([]);
  const [inputUrl, setInputUrl] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setLocalQuestions(questions);

      setAnswers(Array(questions.length).fill([])); // Initialize answers as an array of empty arrays
    }
  }, [questions]);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const currentQuestion = localQuestions[currentQuestionIndex] || {};

  const toggleCategory = (index) => {
    setExpandedCategories((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const siteName = getSiteName(inputUrl);
    if (chats.some(chat => chat.name === siteName)) {
      setActiveChat(siteName);
    } else {
      handleSubmitUrl(inputUrl);
    }
  };

  const handleOptionChange = (option) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      const currentAnswers = updatedAnswers[currentQuestionIndex] || [];

      if (currentAnswers.includes(option)) {
        updatedAnswers[currentQuestionIndex] = currentAnswers.filter((o) => o !== option);
      } else {
        updatedAnswers[currentQuestionIndex] = [...currentAnswers, option];
      }

      return updatedAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < localQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleLast = () => {
    if (currentQuestionIndex < localQuestions.length - 1) {
      setCurrentQuestionIndex(localQuestions.length - 1);
    }
  };

  const handleFirst = () => {
    setCurrentQuestionIndex(0);
  };

  const isLastQuestion = currentQuestionIndex === localQuestions.length - 1;


  const handleSubmitAnswer = () => {
    onSubmitAnswer(answers);
  };


  return (
    <div className="info-window">
      {activeChat ? (
        <>
          <div style={{ margin: '20px' }}>
            <h2>Categories and labels for <b>{activeChat}</b></h2>
          </div>

          <div >
            <p>{summary}</p>
          </div>

          <div className="categories-section">
            {localCategories.map((category, index) => (
              <div key={index} className="category-container">
                <div
                  className="category-name"
                  onClick={() => toggleCategory(index)}
                >
                  {expandedCategories.includes(index) ? '-' : '+'} {category.category}
                </div>
                {expandedCategories.includes(index) && (
                  <ul className="labels-list">
                    {category.labels.map((label, i) => (
                      <li key={i} className="label-item">
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Question Section */}
          {localQuestions.length > 0 ? (
            <div className="question-section">
              <h4>Question {currentQuestionIndex + 1}</h4>
              <p>{localQuestions[currentQuestionIndex]?.question}</p>

              <div className="options">
                {localQuestions[currentQuestionIndex]?.options.map((option, index) => (
                  <label key={index} className="option-item">
                    <input
                      type="checkbox"
                      checked={answers[currentQuestionIndex]?.includes(option) || false}
                      onChange={() => handleOptionChange(option)}
                      className="form-check-input"
                    />
                    {option}
                  </label>
                ))}
              </div>

              <div className="navigation-buttons">
                <button onClick={handleFirst} disabled={currentQuestionIndex === 0}>
                  <FaAngleDoubleLeft /> First
                </button>

                <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                  <FaArrowLeft /> Previous
                </button>

                <button onClick={handleNext} disabled={isLastQuestion} >
                  Next <FaArrowRight />
                </button>

                <button onClick={handleLast} disabled={isLastQuestion} >
                  Last <FaAngleDoubleRight />
                </button>

                <button onClick={handleSubmitAnswer} className="submit-button" >
                  Submit <FaCheck />
                </button>
              </div>
            </div>
          ) : (
            <p>Loading questions...</p>
          )}
        </>
      ) : (
        <>
          <div style={{ marginLeft: '20px' }}>
            <h2>Categories and labels for user with userId = <b>{userId}</b></h2>
          </div>

          <div className="categories-section">
            {localCategories.map((category, index) => (
              <div key={index} className="category-container">
                <div
                  className="category-name"
                  onClick={() => toggleCategory(index)}
                >
                  {expandedCategories.includes(index) ? '-' : '+'} {category.category}
                  <span style={{ fontSize: '0.9em', color: '#575252', marginLeft: '8px' }}>
                    ({category.site})
                  </span>
                </div>
                {expandedCategories.includes(index) && (
                  <ul className="labels-list">
                    {category.labels.map((label, i) => (
                      <li key={i} className="label-item">
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="input-area">
            <form onSubmit={handleSubmit} className="input-group">
              <input
                type="text"
                className="form-control"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter website's URL..."
                required
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default InfoWindow;