from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import logging
import os

app = Flask(__name__)
cors = CORS(app, origins='*')

# Initialize logging
logging.basicConfig(level=logging.DEBUG)

# Check if CUDA (GPU) is available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the tokenizer and model
model_name = "t5-small"  # You can also use "t5-base" for better quality
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name).to(device)


# YouTube API configuration
YOUTUBE_API_KEY = 'AIzaSyA0ELGrExW8Ol0Lx4ZO6EVcEduB8SWmrKQ'  # Replace with your actual YouTube Data API key
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

def get_key_moments(transcript):
    try:
        # Create a prompt for the LLM
        prompt = f"Give a summary of key moments in the following sports game transcript, include timestamps whenever you talk about a moment:\n\n{transcript}"

        # Tokenize the prompt
        inputs = tokenizer(prompt, return_tensors="pt", max_length=1024, truncation=True).to(device)

        # Generate the output using the model
        summary_ids = model.generate(inputs["input_ids"], max_length=1024, min_length=30, length_penalty=2.0, num_beams=4, early_stopping=True)
        output = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        return output
    except Exception as e:
        logging.error(f"Error generating key moments: {str(e)}")
        return None

@app.route('/search', methods=['GET'])
def search_videos():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Missing query parameter'}), 400

    try:
        response = youtube.search().list(
            q=query,
            part='snippet',
            maxResults=10,
            type='video'
        ).execute()

        videos = [{'title': item['snippet']['title'], 'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}"} for item in response['items']]
        return jsonify(videos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/process', methods=['POST'])
def process_video():
    logging.debug("Processing video...")
    data = request.get_json()
    logging.debug(f"Received data: {data}")

    url = data.get('url')
    logging.debug(f"Video URL: {url}")

    if not url:
        return jsonify({'error': 'Missing URL parameter'}), 400

    video_id = url.split('v=')[-1]
    logging.debug(f"Video ID: {video_id}")

    try:
        # Get the transcript from the YouTube video
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = ' '.join([f"{t['start']}s: {t['text']}" for t in transcript])
        logging.debug(f"Transcript text: {transcript_text[:500]}")  # Log the first 500 characters

        # Get key moments using LLM
        key_moments = get_key_moments(transcript_text)
        if key_moments is None:
            return jsonify({'error': 'Failed to generate key moments'}), 500
        logging.debug(f"Key moments: {key_moments}")

        return jsonify({"key_moments": key_moments})
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logging.debug("Starting Flask server...")
    app.run(debug=True, port=8000)







