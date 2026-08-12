chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url?.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+(?:[/?#]|$)/)) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["post-comment.js"],
  });
});
