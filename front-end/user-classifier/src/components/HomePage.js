import React, { useState } from 'react';

const HomePage = ({ onSubmitUrl }) => {
  const [inputUrl, setInputUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitUrl(inputUrl);
  };

  return (
    <div className="home-page">
      <h1 className="mb-4">Enter Website URL</h1>
      <form onSubmit={handleSubmit} className="d-flex justify-content-center">
        <input
          type="text"
          className="form-control me-2"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter website URL"
          required
          style={{ maxWidth: '400px' }}
        />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default HomePage;