import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

function UploadVideo() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(res.data.message);
      if (res.data.file_url) {
        // Trigger the download of the highlight video
        const videoResponse = await axios.get(res.data.file_url, {
          responseType: 'blob',
        });
        const videoBlob = new Blob([videoResponse.data], { type: 'video/mp4' });
        saveAs(videoBlob, 'highlights.mp4');
      }
    } catch (err) {
      console.error(err);
      setResponse('An error occurred while uploading the video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Video'}
      </button>
      {response && <div>{response}</div>}
    </div>
  );
}

export default UploadVideo;

