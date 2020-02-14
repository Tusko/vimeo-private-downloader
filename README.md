# Vimeo Private Video Downloader

Node.js script helps you to download private videos from [Vimeo](https://vimeo.com)

Before you start, make sure you have installed [Node.js](https://nodejs.org/en/download/).

To check it run in terminal `node -v`. You will see `v10.11.0` for example. If you get error, install latest [Node.js](https://nodejs.org/en/download/).

To download videos you have to:

1.  Open the browser developer tools on the network tab (`F12` on Windows/Linux, `CMD + Option + I` on Mac OS).
2.  Start the video (or move mouse over the video).
3.  In the dev tab, locate the load of the "master.json" file, copy its full URL.
4.  Fill in `url` and `name`(using as filename) fields in `videojson.js` file
5.  Run: node vimeo-downloader.js
6.  Wait for console output `🌈 List finished`

Also, you can combine the m4v and m4a files with [ffmpeg](https://www.ffmpeg.org/)

example script file is `runnner.sh` filenames in same format and run in terminal `sh ./runnner.sh`
