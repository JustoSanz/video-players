# video-players
Test video players with stop and resume timing and saving videos and times to local storage
# to run from local machine 
1) download code
2) CD to downloaded folder
3) nmp install -g http-server
4) http-server
5) open browser with url: http://localhost:8080/


# How the Single Page App works (html5 and javascript)
# When the application runs for the first time
1) It will inject into the single page app 4 videos players
2) each video will uploaded from web folder videos and will persist the videos to local db in the browser
3) videos can the be played and every time the videos are paused the video time is stored in local storage
# On re-loading the page
1) It will check if there is a time for the video last played
2) if so it will set-up the video to resume playing to that particular time
3) On playing the video it will resume from previous played point
