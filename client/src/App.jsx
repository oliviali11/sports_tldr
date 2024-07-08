import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';
import './index.css';

const App = () => {
  const [url, setUrl] = useState('');
  const [keyMoments, setKeyMoments] = useState('');

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleProcess = async () => {
    try {
      const response = await axios.post('http://localhost:8000/process', { url });
      setKeyMoments(response.data.key_moments);
    } catch (error) {
      console.error('Error processing video:', error);
      setKeyMoments('Failed to process video. Please try again.');
    }
  };

  return (
    <div className="bg-image min-h-screen flex flex-col items-center justify-center">
      <input
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder="Enter YouTube video URL"
        className="mb-4 px-3 py-2 border rounded"
      />
      <button onClick={handleProcess} className="bg-blue-500 text-white px-4 py-2 rounded">
        Process Video
      </button>
      <div className="mt-4">
        <h2>Key Moments Summary:</h2>
        <pre>{keyMoments}</pre>
      </div>
    </div>
  );
};

export default App;

