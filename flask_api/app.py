from flask import Flask, request, session, jsonify
from hume import HumeBatchClient
from hume.models.config import LanguageConfig
from hume.models.config import FaceConfig
from hume.models.config import BurstConfig
from hume.models.config import ProsodyConfig
import requests
import json
from flask_cors import CORS,cross_origin
import imageio_ffmpeg as ffmpeg
import os
import subprocess

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
#CORS(app)

def find_stretches(json_data):
    print("entered")
    stretches = []
    current_stretch = []
    last_dominant = None

    predictions = json_data[0]['results']['predictions'][0]['models']['face']['grouped_predictions'][0]['predictions']
    for pred in predictions:
        time = pred['time']
        dominant_emotions = find_dominant_emotions(pred['emotions'])

        if last_dominant is None:
            last_dominant = dominant_emotions
            current_stretch.append((time, dominant_emotions))
        else:
            common_emotions = last_dominant.intersection(dominant_emotions)
            if common_emotions:
                current_stretch.append((time, dominant_emotions))
                last_dominant = common_emotions
            else:
                if len(current_stretch) >= 5:
                    print("ebtered len")
                    stretches.append({
                        'emotions': list(last_dominant),
                        'first_time': current_stretch[0][0],
                        'last_time': current_stretch[-1][0],
                        'length': current_stretch[-1][0] - current_stretch[0][0]
                    })
                current_stretch = [(time, dominant_emotions)]
                print(current_stretch)
                last_dominant = dominant_emotions

    if len(current_stretch) >= 5:
        stretches.append({
            'emotions': list(last_dominant),
            'first_frame': current_stretch[0][0],
            'last_frame': current_stretch[-1][0],
            'length': current_stretch[-1][0] - current_stretch[0][0]
        })

    return stretches

def find_dominant_emotions(emotions):
    # print("Debug: Emotions received:", emotions)  # Debugging line

    emotions = sorted(emotions, key=lambda x: x.get('score', 0), reverse=True)
    top_emotion_score = emotions[0].get('score')
    print("top = " + str(top_emotion_score))
    dominant_emotions = [e['name'] for e in emotions if e['score'] >= top_emotion_score - 0.02]
    return set(dominant_emotions[:3])

@app.route('/', methods=["GET", "POST"])
@cross_origin()
def index():

    # url = "https://api.hume.ai/v0/batch/jobs"

    # files = { "file": ("flask_api\\WIN_20231028_11_07_20_Pro.mp4", open("flask_api\\WIN_20231028_11_07_20_Pro.mp4", "rb"), "video/mp4") }
    # payload = { "json": "{}" }
    # headers = {
    #     "accept": "application/json",
    #     "X-Hume-Api-Key": "jsmfWNtGidQg4kV9Y6AyP7kw0V5AzGp8vLxApbGbzDFawM7r"
    # }

    # response = requests.post(url, data=payload, files=files, headers=headers)

    # print(response.text)
    # result = ""
    # client = HumeStreamClient("jsmfWNtGidQg4kV9Y6AyP7kw0V5AzGp8vLxApbGbzDFawM7r")
    # config = FaceConfig(identify_faces=True)
    # async with client.connect([config]) as socket:
    #     #result = await socket.send_file("flask_api\\WIN_20231028_11_07_20_Pro.mp4")
    #     #result = await socket.send_file("flask_api\\WIN_20231028_13_32_11_Pro.jpg")
    #     result = await socket.send_file("blob:http://localhost:3000/fa82b32d-6a8b-4ef6-8be7-56639235342d")
    #     print(result)
    # return response.text

    content = request.files['file']
    print(content.content_type)
    content.save("flask_api/input.webm")

    try:
        command = 'ffmpeg -i flask_api/input.webm flask_api/test2.mp4 -y'
        subprocess.run(command)
    except Exception as e: 
        print(e)
    

    # try:
    #     print(content)
    #     return {"content" : content.filename}
    # except Exception as e:
    #     print(e)
    #     return {"connection": e}
    url = "https://api.hume.ai/v0/batch/jobs"

    # files = { "file": (f"{content}", open(f"{content}", "rb"), "video/mp4") }
    # files = { "file": ("test.mp4", open("flask_api/test.mp4", "rb"), "video/mp4") }

    # payload = { "json": "{}" }
    # headers = {
    #     "accept": "application/json",
    #     "X-Hume-Api-Key": "jsmfWNtGidQg4kV9Y6AyP7kw0V5AzGp8vLxApbGbzDFawM7r"
    # }

    # response = json.loads((requests.post(url, data=payload, files=files, headers=headers)).text)

    # print(response['job_id'])

    # url = f"https://api.hume.ai/v0/batch/jobs/{response['job_id']}/predictions"

    
    # headers = {
    #     "accept": "application/json; charset=utf-8",
    #     "X-Hume-Api-Key": "jsmfWNtGidQg4kV9Y6AyP7kw0V5AzGp8vLxApbGbzDFawM7r"
    # }

    # response = json.loads((requests.get(url, headers=headers)).text)

    # print(type(response))

    # # response_dict = json.loads(response.text)

    # # print(response_dict)

    
    # while type(response) != type(["a", "b"]):
    #     response = json.loads((requests.get(url, headers=headers)).text)
    #     print(type(response))

    #print (type(response))

    client = HumeBatchClient("jsmfWNtGidQg4kV9Y6AyP7kw0V5AzGp8vLxApbGbzDFawM7r", timeout=300)

    files = ["flask_api/test2.mp4"]
    burst_config = BurstConfig()
    prosody_config = ProsodyConfig()
    face_config = FaceConfig()
    lang_config = LanguageConfig(granularity='conversational_turn')

    job = client.submit_job([], [burst_config, face_config], files=files)

    print("Running...", job)
    job.await_complete()
    predictions = job.get_predictions()
    #prediction = predictions[0]['results']['predictions'][0]['models']['face']['grouped_predictions'][0]['predictions']

    stretches = find_stretches(predictions)
    print(predictions)


    
    try:
        return predictions
    except Exception as e:
        print(e)
        return {"connection": e}

@app.route("/face/", methods=["GET", "POST"])
def face():
    content = request.files['file']

    url = "https://api.hume.ai/v0/batch/jobs"

    files = { "file": (f"{content}", open(f"{content}", "rb"), "video/mp4") }
    payload = { "json": "{}" }
    headers = {
        "accept": "application/json",
        "X-Hume-Api-Key": "jsmfWNtGidQg4kV9Y6AyP7kw0V5AzGp8vLxApbGbzDFawM7r"
    }

    response = requests.post(url, data=payload, files=files, headers=headers)

    print(response)

    url = "https://api.hume.ai/v0/batch/jobs/34705d25-1a4a-407c-9d4b-54aa50e827bc/predictions"

    
    headers = {
        "accept": "application/json; charset=utf-8",
        "X-Hume-Api-Key": "jsmfWNtGidQg4kV9Y6AyP7kw0V5AzGp8vLxApbGbzDFawM7r"
    }

    response = requests.get(url, headers=headers)

    print(response.text)

    response_dict = json.loads(response.text)
    #print (type(response))
    
    try:
        return response_dict
    except Exception as e:
        print(e)
        return {"connection": e}

if __name__ == "__main__":
    app.run(debug=True,port=5000)