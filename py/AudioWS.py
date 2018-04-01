import io
import os
import sys
import subprocess
import shutil
import numpy as np
import math
from scipy.io import wavfile
from pydub import AudioSegment

from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types

if not os.path.exists("output"):
    os.makedirs("output")
else:
    shutil.rmtree('./output')
    os.makedirs("output")

if os.path.exists('results.txt'):
    os.remove('results.txt')

if os.path.exists('audio.wav'):
    os.remove('audio.wav')

th = 655

client = speech.SpeechClient()

command = "ffmpeg -loglevel panic -i "+sys.argv[1]+" -ab 192k -ac 1 -ar 44100 -vn audio.wav"

subprocess.call(command, shell=True)

file_name = 'audio.wav'

array = wavfile.read(file_name, mmap=False)
array = [abs(i) for i in array][1]

threshold = True
index = 0
start = 0
counter = 0
ind = 0
#for i in array:
    #if counter%44100 == 0:
       # print("second")
    # if i < th:
    #     ind += 1

    # if i < th and not threshold and ind > 40000:
    #     ind = 0
    #     threshold = True
    #     if (counter-start)/44100 < 3:
    #         print("failed")
    #         counter = counter + 1
    #         continue 
    #     index = index + 1
    # if i > th and threshold: 
    #     print("considering")
    #     threshold = False
    #     start = counter
    #     ind = 0
    # counter = counter + 1
time = open('timestamps.txt', 'a')
for i in array:
    if (counter-start)/44100 >= 59:
        print(math.floor(start/44100))
        time.write(str(math.floor(start/44100))+' ');
        sys.stdout.flush()
        command = "ffmpeg -loglevel panic -ss "+str(math.floor(start/44100))+" -t "+str(math.ceil((counter-start)/44100))+" -i "+file_name+" output/output"+str(index)+".wav"
        subprocess.call(command, shell=True)
        start = counter
        index += 1
        counter += 1
        continue

    if i>th:
        ind = 0

    if i<th and not threshold:
        ind = ind+1

    if i>th and threshold:
        #print('up')
        threshold = False
        start = counter

    if i<th and not threshold and ind>35000:
        # check if this clip is valid
        threshold = True
        if (counter-start)/44100<2:
            #print("failed")
            pass
        else:
            #print("success")
            print(math.floor(start/44100))
            time.write(str(math.floor(start/44100))+' ');
            sys.stdout.flush()
            command = "ffmpeg -loglevel panic -ss "+str(math.floor(start/44100))+" -t "+str(math.ceil((counter-start)/44100))+" -i "+file_name+" output/output"+str(index)+".wav"
            subprocess.call(command, shell=True)
            start = counter
            index += 1
    counter = counter+1

DIR="./output"
length = len([name for name in os.listdir(DIR) if os.path.isfile(os.path.join(DIR, name))])

results = open('results.txt', 'a')

for i in range(length):
    file_name = "output/output"+str(i)+".wav"
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
        results.write('{}'.format(result.alternatives[0].transcript)+". ")

