function parseJson(req, url) {
  var jsonResponse = req.responseJSON;
  console.log(jsonResponse);
  if (req.status == 200) {
    chrome.extension.sendMessage('ok');
    // registerd
  } else if (req.status == 401) {
    chrome.extension.sendMessage('logged_out');
    // need to login
  }
}

sendToServer(location.href);
function sendToServer(url) {
  if (url.indexOf("weblio") != -1) {
    if (document.getElementById("nrCntTH") != null) {
      console.log("word not found. we don't send it to the server");
      return;
    }
  } else if (url.indexOf("eow.alc.co.jp") != -1) {
    if (document.getElementById("unmatchMsg") != null) {
      console.log("word not found. we don't send it to the server");
      return;
    }
  }
  var req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("POST",SETTINGS['create_url'],true);
  req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  var target = this;
  req.onload  = function() { target.parseJson(req, url) };
  req.send("url=" + encodeURIComponent(url));
}
