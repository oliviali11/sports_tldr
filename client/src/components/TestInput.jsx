import React, { useState } from 'react';
import axios from 'axios';

function TextInput() {
  const [transcript, setTranscript] = useState('');
  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setTranscript(e.target.value);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/analyze', { transcript });
      setHighlights(res.data.highlights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea className='mt-8 font-anton' value={transcript} onChange={handleChange} rows="10" cols="50" placeholder="Enter sports game transcript here..."></textarea>
      <div className='text-3xl'>
      <button onClick={handleAnalyze} disabled={loading} className='mt-4 text-white font-anton border border-white rounded-md hover:bg-gray-100 px-4 py-2'>
        <div className='flex font-anton'>
        {loading ? 'Analyzing...' : 'Analyze Transcript'}
        </div>
      </button>
      </div>
      {highlights && (
        <div>
          <h3 className='mt-8 font-anton text-3xl'>Highlights</h3>
          <p className='mt-4 font-anton'>{highlights}</p>
        </div>
      )}
    </div>
  );
}

export default TextInput;
