########################################################
# K-Karaoke is a NodeJS karaoke server and client app
########################################################

Allows you to run a karaoke player and server on your computer. The player is opened in a web browser and will play videos in a HTML5 video player.
A client app is included in this package and will allow users to play videos from a local library or search the internet for songs.

To run:
1. Make sure you have NodeJS installed. If you don't, download here:
https://nodejs.org/en/#download

2. Once you have NodeJS installed, open a command line terminal window on your computer and navigate to the folder where you've saved these files.

3. Run the server by typing the following:
>node server.js

4. This should start the server and you should now be able to access the services with your browser.

5. Open a browser and go to http://localhost:1234/player

6. This should display the player screen in your browser along with some instructions on play karaoke videos to the screen.


Adding local karaoke videos to your default list:
If you have a set of digital karaoke videos stored locally on your computer (i.e. in mp4 format), you can add them to the K-Karaoke system by:

1. Adding them to the /public/songs/ directory

2. Then adding the title, artist, and filename to the songs database under /databases (you will need to edit the sqlite db)
*when adding to the database, make sure the video filename matches the expected format of "Song title - Artist.mp4". An example test file has been included in this package.


Searching for karaoke videos on the internet:
In order to get the search feature on the client app working with internet karaoke videos, you will need to sign up for a YouTube API key. Please see the following page to sign up for a free YouTube API key:
https://developers.google.com/youtube/v3/getting-started


Changing default server settings:
If you would like to change the default server settings, edit the /config.json file. At this time you will be able to change the document root of your web server, the server port, and the YouTube API key.
