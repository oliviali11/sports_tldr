import React from 'react';
import UploadVideo from './components/UploadVideo';
import { useState, useEffect } from 'react';
import axios from 'axios'
import YouTube from './components/Youtube';
import TextInput from './components/TestInput';
import './styles.css'
{
  /* The following line can be included in your src/index.js or App.js file */
}
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  return (
    <div className="flex bg-image min-h-screen">
    <div className="ml-8 mt-32 flex flex-col w-full"> {/* Adjust margin-top and centering as needed */}
      <h1 className="text-white text-7xl font-anton mb-8">Sports TLDR</h1>
      <hr />
      <div className="w-full max-w-screen-lg mt-8 overflow-y-auto pb-16"> {/* Adjust max-width as needed */}
      <YouTube />
      <TextInput />
      </div>
    </div>
  </div>
  );
}

export default App;


