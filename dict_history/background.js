chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  console.log(request);
  if(request == "ok")
    chrome.browserAction.setBadgeText({"text": ''});
  else if (request == "logged_out")
    chrome.browserAction.setBadgeText({"text": '?'});
  sendResponse({});
});
