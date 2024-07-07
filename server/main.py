from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import moviepy.editor as mp
import speech_recognition as sr
from googleapiclient.discovery import build

app = Flask(__name__)
cors = CORS(app, origins='*')

summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

# YouTube API configuration
YOUTUBE_API_KEY = 'AIzaSyBkWISqhPfctWXnWR498MujnIuwQOJZG-w'  # Replace with your actual YouTube Data API key
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

@app.route("/api/users", methods=['GET'])
def users():
    return jsonify(
        {
            "users": [
                'arpan',
                'zach',
                'jessie'
            ]
        }
    )

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

        videos = []
        for item in response['items']:
            video = {
                'title': item['snippet']['title'],
                'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}"
            }
            videos.append(video)

        return jsonify(videos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/process', methods=['POST'])
def process_video():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'Missing URL parameter'}), 400

    # Mock implementation of processing the video
    # You need to implement actual video processing using a library such as moviepy

    # Use NLP to extract highlights (mock implementation)
    mock_transcript = ("the last big French penalty shoots out was at the European championships last summer and they lost to Switzerland because kilan mbappe failed against Yan s with their final penalty this time having twice already scored from the spot and three times in all having" +  
    "scored mbappe steps up first andle mppe rattles it in on his day of no error when you hit it that hard even though the keeper guesses the right way it's going to be a difficult one it's a decent touch on it but now we're near enough interesting that the two top men are going" +
    "first well Messi went first against the Netherlands he went first also in last Summer's copper America shoots out in Brazilia against Colombia in the semi-final and on both occasions he [Applause] scored Messi with such Immaculate Poise how do you do that how do you do this in these" +
    "circumstances next up is [Music] kingan ear spitting whistles keman Great Stop Martinez is punching the air again massive character massive moment that's twice his guess right with mbappe couldn't do much about it he could with this one he a big lad he's got a Long Reach well for" +
    "Argentina Pao dybala came off the bench with this kick of the ball in mind dybala to the middle some can barely watch yeah not easy when you've only been on the pitch a few minutes as he has not an easy situation that Mar in mouth perhaps sitting it down the [Applause] middle William charmi has scored one of the goals of this competition against" + 
    "England in the quarterfinals Martinez is trying to get in his head he hasn't helped with the return of the ball he will do what it [Applause] takes not a nail left to be chewed trus jacket wide and Argentina are on the castp easy to say now but never looked entirely confident waiting for that he thrives on these situations")

    highlights = summarizer(mock_transcript, max_length=150, min_length=50, do_sample=False)

    highlights_text = ' '.join([highlight['summary_text'] for highlight in highlights])

    return jsonify({"highlights": highlights_text})

@app.route('/upload', methods=['POST'])
def upload_video():
    file = request.files['video']
    file.save('input.mp4')

    # Extract audio and convert to text
    video = mp.VideoFileClip('input.mp4')
    video.audio.write_audiofile('audio.wav')

    recognizer = sr.Recognizer()
    with sr.AudioFile('audio.wav') as source:
        audio = recognizer.record(source)
        transcript = recognizer.recognize_google(audio)

    # Use NLP to extract highlights (Assume highlights are sentences with 'goal' or 'score')
    nlp = pipeline('summarization')
    highlights = nlp(transcript, max_length=50, min_length=25, do_sample=False)

    # Extract video segments based on highlights (mock implementation)
    segments = []
    for highlight in highlights:
        start = max(0, 5)  # Mock start time
        end = min(video.duration, 10)  # Mock end time
        segments.append(video.subclip(start, end))

    # Concatenate segments
    if segments:
        final_clip = mp.concatenate_videoclips(segments)
        output_file = 'output.mp4'
        final_clip.write_videofile(output_file)
        return jsonify({"message": "Highlights video created successfully!", "file_url": f"http://localhost:8000/download/{output_file}"})
    else:
        return jsonify({"message": "No highlights found in the video."})

@app.route('/analyze', methods=['POST'])
def analyze_transcript():
    print("im here")
    data = request.get_json()
    transcript = data['transcript']

    # Use NLP to extract highlights
    nlp = pipeline('summarization')
    highlights = nlp(transcript, max_length=150, min_length=50, do_sample=False)

    # Extracted highlights text
    highlights_text = ' '.join([highlight['summary_text'] for highlight in highlights])

    return jsonify({"highlights": highlights_text})

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_file(filename, as_attachment=True)

if __name__ == '__main__':
   app.run(debug=True, port=8000)


