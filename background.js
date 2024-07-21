chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    // Get the query parameters from the URL of the tab
    const queryParameters = tab.url.split("?")[1];
    // Create a URLSearchParams object
    const urlParameters = new URLSearchParams(queryParameters);

    // Send a message to the content script of the tab
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v") // Get the video ID from the URL parameters
    });
  }
});