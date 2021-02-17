window.onload = function() {
    // List of videos to load on players 1 to 4
    const section = document.querySelector('section');
    const videos = [
      { 'name' : 'video1' },
      { 'name' : 'video2' },
      { 'name' : 'video3' },
      { 'name' : 'video4' }
    ];

    // Create an instance of a db object for us to store our database in
    let db;

    function init() {
      
      for(let i = 0; i < videos.length; i++) {
        // Open transaction to local db to store videos in so second time page is load
        // the videos will be loaded from local browser database instead that from web folder videos
        let objectStore = db.transaction('videos_os').objectStore('videos_os');
        let request = objectStore.get(videos[i].name);
        request.onsuccess = function() {
          // If exists in the IDB database
          if(request.result) {
            // load video from local browser IDB
            console.log('Uploading video from IDB');
            loadVideo(request.result.mp4, request.result.webm, request.result.name);
          } else {
            // Fetch the videos from the website videos folder
            fetchVideoFromWebFolder(videos[i]);
          }
        };
      }

      // Register video pause event for all video players once they have been rendered
      setTimeout(registerVideosEvents, 6000);
      // registerVideosEvents();
    }

    function fetchVideoFromWebFolder(video) {
      console.log('fetching videos from network');
      // Fetch the MP4 and WebM versions of the video using the fetch() function,
      // then expose their response bodies as blobs
      let mp4Blob = fetch('videos/' + video.name + '.mp4').then(response =>
        response.blob()
      );
      let webmBlob = fetch('videos/' + video.name + '.webm').then(response =>
        response.blob()
      );

      // Only run the next code when both promises have fulfilled
      Promise.all([mp4Blob, webmBlob]).then(function(values) {
        // load the video fetched from the network with loadVideo()
        loadVideo(values[0], values[1], video.name);

        // store video in IDB using storeVideo() so second time loads from local db
        saveVideo(values[0], values[1], video.name);
      });
    }

    // Save video files will only happen the first time after loading videos from web
    function saveVideo(mp4Blob, webmBlob, name) {
    
      // Open transaction, get object store; make it a readwrite so we can write to the IDB
      let objectStore = db.transaction(['videos_os'], 'readwrite').objectStore('videos_os');
    
      // Create a record to add to the IDB
      let record = {
        mp4 : mp4Blob,
        webm : webmBlob,
        name : name
      }

      // Add the record to the IDB using add()
      let request = objectStore.add(record);
      request.onsuccess = function() {
        console.log('Record addition attempt finished');
      }
      request.onerror = function() {
        console.log(request.error);
      }

  };

  // Define the displayVideo() function
  function loadVideo(mp4Blob, webmBlob, name) {
    // Create object URLs out of the blobs
    let mp4URL = URL.createObjectURL(mp4Blob);
    let webmURL = URL.createObjectURL(webmBlob);

    // Create DOM elements to embed video in the page
    const article = document.createElement('article');
    const h2 = document.createElement('h2');
    h2.textContent = name;
    const pre = document.createElement('pre');
    pre.id = name + '-status';
    
    const video = document.createElement('video');
    video.controls = true;
    const source1 = document.createElement('source');
    source1.src = mp4URL;
    source1.type = 'video/mp4';
    const source2 = document.createElement('source');
    source2.src = webmURL;
    source2.type = 'video/webm';
    // Embed create the new DOM video elements into page
    section.appendChild(article);
    article.appendChild(h2);
    article.appendChild(pre);
    article.appendChild(video);
    video.appendChild(source1);
    video.appendChild(source2);
    video.autoplay = false;
    video.id = name;

    // Check in local storage if first video had a previous value when the video was paused
    let playerPausedTime = localStorage.getItem(video.id +'-timeStamp');
    if (playerPausedTime !== null) {
      
      //video1 = document.querySelector('video#player-1');
      video.currentTime = playerPausedTime; // set time stamp up to last played point in time
      console.log(video.id + ' was previously played up to: ' + playerPausedTime);
      pre.innerHTML = 'resuming at: ' + playerPausedTime;
    }

  }

  // Open videos form local browser indexed db
  let request = window.indexedDB.open('videos_db', 1);

  // error opening db
  request.onerror = function() {
    console.log('Database failed to open');
  };

  request.onsuccess = function() {
    console.log('Database opened succesfully');

    // Store the opened database object in the db variable. This is used a lot below
    db = request.result;
    init();
  };

  // Setup the database tables if this has not already been done
  request.onupgradeneeded = function(e) {

    // Grab a reference to the opened database
    let db = e.target.result;

    // Create an objectStore to store our videos in (basically like a single table)
    // including a auto-incrementing key
    let objectStore = db.createObjectStore('videos_os', { keyPath: 'name' });

    // Define what data items the objectStore will contain
    objectStore.createIndex('mp4', 'mp4', { unique: false });
    objectStore.createIndex('webm', 'webm', { unique: false });

    console.log('Database setup complete');
  };

  // Register the pause event to save the specific video that was paused
  function registerVideosEvents() {
    console.log('registerring the pause video event for all players');
    document.querySelectorAll('video').forEach(item => 
    {     
      item.onpause = (event) => {    
        // save the player Id and it time stamp to local storage
        // saveVideoPausedTime(item.id, item.currentTime);
        localStorage.setItem(item.id +'-timeStamp', item.currentTime);
        let preVideoStatus = document.querySelector('pre#'+item.id +'-status');
        if (preVideoStatus != null) {
          preVideoStatus.innerHTML = 'Paused at: ' + item.currentTime;
        }
        console.log('video ' + item.id + ' stopped at:' + item.currentTime);
      };

      item.onplay = (event) => {    
        let preVideoStatus = document.querySelector('pre#'+item.id +'-status');
        if (preVideoStatus != null) {
          preVideoStatus.innerHTML = 'playing...';
        }
        console.log('video ' + item.id + ' played at:' + item.currentTime);
      };
    });
  }

};
