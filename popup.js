import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => {
    // create the elements for the new bookmark
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");

    // set the attributes for the new bookmark elements
    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
    // get the bookmarks element
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    // if there are bookmarks for the current video
    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
        const bookmark = currentBookmarks[i];
        // add the bookmark to the bookmarks element
        addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        // if there are no bookmarks for the current video
        bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
    }

    return;
};

const onPlay = async e => {
    // get the bookmark time
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();

    // play the video from the bookmark time
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
    });
};

const onDelete = async e => {
    // get the active tab and the bookmark time
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById(
        "bookmark-" + bookmarkTime
    );

    // delete the bookmark from the bookmarks array
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    // send a message to the content script to delete the bookmark
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
    },
    (response) => {
            // update the bookmarks view after deletion
            viewBookmarks(response);
        }
    );
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    // create the control element
    const controlElement = document.createElement("img");

    // set the attributes for the control element
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    // add the event listener to the control elements
    controlElement.addEventListener("click", eventListener);
    // append the control element to the control parent element
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    // get the active tab
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    // if the active tab is a youtube video page
    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
        const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
        // view the bookmarks for the current video
        viewBookmarks(currentVideoBookmarks);
        });
    } else {
        // if the active tab is not a youtube video page
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
    }
});