import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';

function YouTube() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const [highlights, setHighlights] = useState('')
  const [player, setPlayer] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:8000/search?query=${query}`);
      setVideos(res.data);
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred while searching for videos.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (videoId) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const res = await axios.post('http://localhost:8000/process', { url });
      setHighlights(res.data.highlights);
      alert('Highlight detected!');
      setSelectedVideoId(videoId);
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred while processing the video.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load the YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // This function gets called when the YouTube IFrame API is ready to use
    window.onYouTubeIframeAPIReady = () => {
      if (selectedVideoId) {
        const newPlayer = new window.YT.Player('player', {
          height: '360',
          width: '640',
          videoId: selectedVideoId,
          events: {
            onReady: handleCanvasRender,
          },
        });
        setPlayer(newPlayer);
      }
    };
  }, []);

  useEffect(() => {
    if (player && selectedVideoId) {
      player.loadVideoById(selectedVideoId);
      handleCanvasRender();
    }
  }, [selectedVideoId]);

  const handleCanvasRender = () => {
    const canvas = canvasRef.current;
    if (canvas && player) {
      const ctx = canvas.getContext('2d');
      const draw = () => {
        try {
          ctx.drawImage(player.getIframe(), 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(draw);
        } catch (e) {
          console.error('Error drawing video frame:', e);
        }
      };
      draw();
    }
  };

  return (
    <Container>
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a sports game on YouTube..."
          className='font-anton'
        />
        <div className='mt-4 font-anton'>
        <button className='text-white border border-white rounded-md hover:bg-gray-100 px-4 py-2' onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        </div>
        {error && (
          <div style={{ color: 'red' }}>
            <p>{error}</p>
          </div>
        )}
        {videos.length > 0 && (
          <div>
            <h3>Search Results</h3>
            <ul>
              {videos.map((video, index) => (
                <li key={index}>
                  <p>{video.title}</p>
                  <button onClick={() => handleProcess(video.id)}>Process Video</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Container>
  );
}

export default YouTube;


