import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';
import './index.css';

const App = () => {
  const [url, setUrl] = useState('');
  const [keyMoments, setKeyMoments] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleProcess = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/process', { url });
      setKeyMoments(response.data.key_moments);
    } catch (error) {
      console.error('Error processing video:', error);
      setKeyMoments('Failed to process video. Please try again.');
    } finally {
      setIsLoading(false); // Set loading state back to false after request completes
    }
  };

  return (
    <div className="bg-image min-h-screen flex flex-col items-center justify-center">
      <h1 className='text-5xl font-anton text-white mb-4 shadow-text-red'>SportsTLDR</h1>
      <input
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder="Enter YouTube video URL"
        className="mb-4 px-3 py-2 border rounded"
      />
      <button onClick={handleProcess} className="bg-white text-black font-anton px-4 py-2 rounded hover:bg-gray-200">
      {isLoading ? 'Processing...' : 'Process Video'}
      </button>
      <div className="mt-4 ml-4 text-white font-anton">
        <h2 className='text-2xl mb-4'>Key Moments Summary:</h2>
        <div className="whitespace-pre-wrap break-words max-w-full leading-relaxed">
          {keyMoments}
        </div>
      </div>
    </div>
  );
};

export default App;

