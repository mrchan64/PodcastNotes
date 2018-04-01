# Now This Is Pod Casting!

April 1, 2018

## Authors 

This is the LA Hacks 2018 project build by Ravi Sheth, Aidan Bohley, Edward Chen, and Matthew Chan.

## About

Hour long lectures and meetings can be hard to focus on and grasp the meaning of every topic discussed in the presentation.  Often times, we miss little details or large sections in our notes and attention spans and need to refer back to online podcasts to refresh our memories.  It's only after skipping around these hour-long recordings that we begin to develop a more complete understanding of the topic.  Our product strives to remove this arduous and time consuming process by making podcast and video review both time efficient and effective.

Some features that our product currently supports:
- transcription of oral presentation from video to subtitles
- processing of the oral presentation in order to generate relevant phrases and notes
- an easy to edit format to facilitate human adjustment and correction as the process occurs
- highlightling to differentiate certain sections of the lecture from others
- graphical representations and analysis of trends that can be drawn from the orater's presentation and speech style in order to detect distinct styles and speaker trends
- translation of haandwritten notes into digital note format

Features that are in the process of being implemented:
- combining handwritten and generated notes in a meaningful way
- noting trends of students' edits over time and creating changes in the detection algorithm and presentation style
- image upload of notes
- ways for students to earn credits through using the product and being able to share their transcriptions

## How It Works

First and foremost, our technology leverages the Google Cloud Platform API for a lot of the speech recognition parts.  We segment the hour long audio into short chunks that we determine to be phrases or sentences from our own algorithm that detects lulls in the speaker's speech.  We leverage TF-IDF to sort and categorize the sentences that Google helps us detect in order to identify the important notes and group topics together into rough keyword groups.  The scores help the algorithm learn how topics piece together in order to form a cohesive design.

In addition, we use Google Cloud Platform API's Optical Character Recognition for our handwritten notes translation procedure.  The Node server brings it all together by providing a clean interface for interacting with the video and summary components.

## Built With
- Google Cloud Platform Speech API
- Google Cloud Platform Vision API
- Node.js
- Python
- Numpy, Scipy, Matplotlib
- HTML, CSS, Javascript, JQuery
- Matlab
- Jade
- The hopes and dreams of four college sophomores

Thank you for supporting our project!