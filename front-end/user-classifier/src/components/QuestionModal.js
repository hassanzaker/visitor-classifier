import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaArrowLeft, FaArrowRight, FaCheck, FaAngleDoubleRight } from 'react-icons/fa';

// Set the root element for accessibility (required by react-modal)
Modal.setAppElement('#root');

// The QuestionModal component handles displaying questions, collecting answers, and submitting responses.
const QuestionModal = ({ isOpen, questions, onClose, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the index of the current question
  const [answers, setAnswers] = useState([]); // Store user-selected answers for each question
  const [localQuestions, setLocalQuestions] = useState([]); // Local state to hold questions for rendering

  // Update local questions and reset answers when `questions` prop changes
  useEffect(() => {
    if (questions.length > 0) {
      setLocalQuestions(questions);
      setAnswers(Array(questions.length).fill([])); // Initialize answers as an array of empty arrays
    }
  }, [questions]);

  // Get the current question object or an empty object if not available
  const currentQuestion = localQuestions[currentQuestionIndex] || {};

  // Handle changes in checkbox selection for multi-choice answers
  const handleOptionChange = (option) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      const currentAnswers = updatedAnswers[currentQuestionIndex] || [];

      // Add or remove option from the current question's answers
      if (currentAnswers.includes(option)) {
        updatedAnswers[currentQuestionIndex] = currentAnswers.filter((o) => o !== option);
      } else {
        updatedAnswers[currentQuestionIndex] = [...currentAnswers, option];
      }

      return updatedAnswers;
    });
  };

  // Move to the next question if it exists
  const handleNext = () => {
    if (currentQuestionIndex < localQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Move to the previous question if it exists
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Move directly to the last question in the list
  const handleLast = () => {
    if (currentQuestionIndex < localQuestions.length - 1) {
      setCurrentQuestionIndex(localQuestions.length - 1);
    }
  };

  // Submit all answers, reset the current question index, and close the modal
  const handleSubmit = () => {
    setCurrentQuestionIndex(0);
    onSubmit(answers); // Call onSubmit with collected answers
    onClose(); // Close the modal
  };

  return (
    <Modal
      isOpen={isOpen} // Controls the visibility of the modal
      onRequestClose={onClose} // Allows closing the modal by clicking outside or pressing Esc
      contentLabel="Questions Modal" // Label for accessibility
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)', // Center the modal on the screen
          width: '500px',   // Modal width
          padding: '20px', // Padding around the content
          borderRadius: '8px', // Rounded corners for a nicer look
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Shadow for visual depth
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background overlay
        },
      }}
    >
      <div className="modal-content p-4">
        {localQuestions.length > 0 ? ( // Check if questions are loaded
          <>
            <h4 className="modal-title mb-4">Question {currentQuestionIndex + 1}</h4>
            <p>{currentQuestion.question}</p>
            
            {/* Display options as a list of checkboxes */}
            <div className="list-group mb-4">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="list-group-item">
                  <input
                    type="checkbox"
                    checked={answers[currentQuestionIndex]?.includes(option) || false} // Set checkbox based on answer state
                    onChange={() => handleOptionChange(option)} // Toggle option on change
                    className="form-check-input me-2"
                  />
                  {option}
                </label>
              ))}
            </div>
            
            {/* Navigation buttons: Previous, Next, Last, and Submit */}
            <div className="d-flex justify-content-between">
              <button onClick={handlePrevious} className="btn btn-secondary" disabled={currentQuestionIndex === 0}>
                <FaArrowLeft /> Previous
              </button>
              {currentQuestionIndex < localQuestions.length - 1 ? (
                <div className="d-flex gap-2">
                  <button onClick={handleNext} className="btn btn-primary">
                    Next <FaArrowRight />
                  </button>
                  <button onClick={handleLast} className="btn btn-primary">
                    Last <FaAngleDoubleRight />
                  </button>
                </div>
              ) : (
                <button onClick={handleSubmit} className="btn btn-success">
                  Submit <FaCheck />
                </button>
              )}
            </div>
          </>
        ) : (
          <p>Loading question...</p> // Show a loading message while questions are loading
        )}
      </div>
    </Modal>
  );
};

export default QuestionModal;