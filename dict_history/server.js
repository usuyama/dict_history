function parseJson(req, url) {
  var jsonResponse = req.responseJSON;
  console.log(jsonResponse);
  if (req.status == 200) {
    // registerd
  } else if (req.status == 401) {
    // need to login
  }
}

sendToServer(location.href);
function sendToServer(url) {
  var req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("POST",SETTINGS['create_url'],true);
  req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  var target = this;
  req.onload  = function() { target.parseJson(req, url) };
  req.send("url=" + encodeURIComponent(url));
}
