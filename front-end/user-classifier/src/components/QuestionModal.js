import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaArrowLeft, FaArrowRight, FaCheck, FaAngleDoubleRight } from 'react-icons/fa';

Modal.setAppElement('#root');

const QuestionModal = ({ isOpen, questions, onClose, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [localQuestions, setLocalQuestions] = useState([]);

  useEffect(() => {
    if (questions.length > 0) {
      setLocalQuestions(questions);
      setAnswers(Array(questions.length).fill([]));
    }
  }, [questions]);

  const currentQuestion = localQuestions[currentQuestionIndex] || {};

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

  const handleSubmit = () => {
    setCurrentQuestionIndex(0);
    onSubmit(answers);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Questions Modal"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',   // Adjust width as needed
          padding: '20px',
          borderRadius: '8px', // Add some rounded corners
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
        },
      }}
    >
      <div className="modal-content p-4">
        {localQuestions.length > 0 ? (
          <>
            <h4 className="modal-title mb-4">Question {currentQuestionIndex + 1}</h4>
            <p>{currentQuestion.question}</p>
            
            <div className="list-group mb-4">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="list-group-item">
                  <input
                    type="checkbox"
                    checked={answers[currentQuestionIndex]?.includes(option) || false}
                    onChange={() => handleOptionChange(option)}
                    className="form-check-input me-2"
                  />
                  {option}
                </label>
              ))}
            </div>
            
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
          <p>Loading question...</p>
        )}
      </div>
    </Modal>
  );
}

export default QuestionModal;