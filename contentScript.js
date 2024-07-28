(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
  
    const fetchBookmarks = () => {
      return new Promise((resolve) => {
        // get the bookmarks for the current video from the storage if any
        chrome.storage.sync.get([currentVideo], (obj) => {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        });
      });
    };
  
    const addNewBookmarkEventHandler = async () => {
        // get the current time of the video
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        
        currentVideoBookmarks = await fetchBookmarks();
        
        // add the new bookmark to the bookmarks array and sort the array by time
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    };
  
    const newVideoLoaded = async () => {
        // check if the bookmark button exists
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  
        currentVideoBookmarks = await fetchBookmarks();
        
        // if the bookmark button does not exist, create it
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");
    
            //bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.src = chrome.runtime.getURL("assets/timestamp.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";
            
            // get the left controls of the youtube player and append the bookmark button to it
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName('video-stream')[0];
            
            // add the event listener to the bookmark button
            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    };
  
    // listen for messages from the popup
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        
        // if the message is to load a new video
        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            // play the video from the given time
            youtubePlayer.currentTime = value;
        } else if ( type === "DELETE") {
            // delete the bookmark from the bookmarks array
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            // update the bookmarks in the storage
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
            
            // view the bookmarks for the current video
            // response is a function that sends a response back to the popup
            response(currentVideoBookmarks);
      }
    });
  
    newVideoLoaded();
  })();
  
  const getTime = t => {
    // convert the time in seconds to HH:MM:SS format
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substr(11, 8);
  };