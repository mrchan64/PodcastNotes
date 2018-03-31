import io
import os
import sys
import subprocess
import shutil

from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types

if not os.path.exists("output"):
    os.makedirs("output")
else:
    shutil.rmtree('./output')
    os.makedirs("output")

if not os.path.exists("input"):
    os.makedirs("input")
else:
    shutil.rmtree('./input')
    os.makedirs("input")

if os.path.exists('results.txt'):
    os.remove('results.txt')

results = open('results.txt', 'a')

client = speech.SpeechClient()

command = "ffmpeg -loglevel panic -i "+sys.argv[1]+" -c copy -map 0 -segment_time 8 -f segment output/output%03d.mp4"

subprocess.call(command, shell=True)

DIR="./output"
length = len([name for name in os.listdir(DIR) if os.path.isfile(os.path.join(DIR, name))])

for i in range(length):
    if i < 10:
        number = "00"+str(i)
    elif i < 100:
        number = "0"+str(i)
    else:
        number = str(i)
    command = "ffmpeg -loglevel panic -i "+"output/output"+number+".mp4"+" -ab 192k -ac 1 -ar 44100 -vn input/audio"+number+".wav"

    subprocess.call(command, shell=True)

    file_name = 'input/audio'+number+'.wav'

    with io.open(file_name, 'rb') as audio_file:
        content = audio_file.read()
        audio = types.RecognitionAudio(content=content)


    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        language_code='en-US')

    # Detects speech in the audio file
    response = client.recognize(config, audio)

    for result in response.results:
        print('{}'.format(result.alternatives[0].transcript))
        results.write('{}'.format(result.alternatives[0].transcript))

shutil.rmtree('./output')
shutil.rmtree('./input')
