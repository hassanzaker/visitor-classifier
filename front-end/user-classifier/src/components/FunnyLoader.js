import React from 'react';
import './FunnyLoader.css'; // Import the CSS styles for the component

const FunnyLoader = ({message}) => {
  return (
    <div className="funny-loader d-flex flex-column align-items-center">
      <div className="spinner-wrapper">
        <div className="spinner spinner-1"></div>
        <div className="spinner spinner-2"></div>
        <div className="spinner spinner-3"></div>
      </div>
      <div className="loading-message">
        <span>{message}</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    </div>
  );
}

export default FunnyLoader;