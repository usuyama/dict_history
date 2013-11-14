var bg = chrome.extension.getBackgroundPage();
var tmp = bg.localStorage['wordToTest'];
if (typeof tmp != 'undefined') {
  var wordsToTest = JSON.parse(bg.localStorage['wordToTest']);
  if (wordsToTest.length > 0) {
    startTest(wordsToTest);
  } else {
    showRecordedWords();
  }
}

function showRecordedWords() {
  var bg = chrome.extension.getBackgroundPage();
  var maxLogSize = bg.getMaxLogSize();
  var wordList = bg.localStorage;
  var outputWords = {};
  var index = bg.getIndex();
  if (index >= 0){
    var contentBody = document.getElementById('content');
    var wordsBox = document.createElement('div');
    wordsBox.id = 'wordListBox';
    contentBody.appendChild(wordsBox);
    for (var i=0; i<maxLogSize; i++) {
      if (typeof wordList[index] == 'undefined'
          || wordList[index].length == 0
        || typeof outputWords[wordList[index]] != 'undefined') {
          index--;
          if (index < 0) {
            index = maxLogSize - 1;
          }continue;
        } else {
          outputWords[wordList[index]] = true;
        }
        var wordContainer = document.createElement('div');
        wordContainer.className = 'wordContainer';
        wordContainer.id = wordList[index];

        var span = document.createElement('span');
        var url = 'http://eow.alc.co.jp/' + wordList[index];
        span.innerHTML = '<a href="' + url + '" target="_blank">'
        + wordList[index] + '</a>';
        wordContainer.appendChild(span);
        wordContainer.addEventListener('mouseover', addButtons, false);
        wordContainer.addEventListener('mouseout', dismissButtons, false);
        wordsBox.appendChild(wordContainer);
        index--;
        if (index < 0) {
          index = maxLogSize - 1;
        }
    }
  }
}
/**
 * add cancel button and speak button left of the word.
 */
function addButtons(event) {
  var parentDiv = getWordContainer(event.target);
  if (parentDiv.isCancelButton) {
    return;
  }
  var cancel = document.createElement('span');
  cancel.className = 'cancelButton';
  cancel.innerHTML = '×';
  cancel.addEventListener('click', dismissWord, false);

  var tts = document.createElement('span');
  tts.className = 'speakButton';
  tts.innerHTML = '<';
  tts.addEventListener('click', speakWord, false);

  buttons = document.createElement('div');
  buttons.className = 'buttons';
  buttons.appendChild(cancel);
  buttons.appendChild(tts);

  parentDiv.insertBefore(buttons, parentDiv.childNodes[0]);
  parentDiv.isCancelButton = true;
}

function dismissButtons(event) {
  var parentDiv = getWordContainer(event.target);
  var outParentDiv = getWordContainer(event.relatedTarget);

  if (outParentDiv != null && parentDiv.id == outParentDiv.id) {
    return;
  }

  if (!parentDiv.isCancelButton) {
    return;
  }
  parentDiv.removeChild(parentDiv.childNodes[0]);
  parentDiv.isCancelButton = false;
}

function dismissWord(event) {
  var parentDiv = getWordContainer(event.target);
  parentDiv.parentNode.removeChild(parentDiv);
  bg.deleteWord(parentDiv.id);
}

function getWordContainer(element) {
  var dom = element;
  for (i = 0; i < 5; i++) {
    if (typeof dom == 'undefined' || dom == null)
      return null;
    if (dom.className == 'wordContainer')
      return dom;
    dom = dom.parentNode;
  }
  return null;
}

function speakWord(event) {
  var parentDiv = getWordContainer(event.target);
  chrome.tts.speak(parentDiv.id, {'lang': 'en-US'});
}

function startTest(wordsToTest) {
  var contentBody = document.getElementById('content');
  var testBox = document.createElement('div');
  testBox.id = 'testBox';
  testBox.wordsToTest = wordsToTest;
  contentBody.appendChild(testBox);
  showWordToTest(wordsToTest[0], testBox)
}

function showWordToTest(word, parent) {
  var wordBox = document.createElement('div');
  wordBox.id = 'test-wordBox';
  wordBox.innerHTML = word;
  wordBox.addEventListener(
    'click', function(){
    parent.removeChild(wordBox);
    fetchWordMeaning(word, parent);
  }, false);
  parent.appendChild(wordBox);
}

function fetchWordMeaning(word, parent) {
  var meaningBox = document.createElement('div');
  meaningBox.id = 'test-meaningBox';
  meaningBox.innerHTML = 'nowLoading...';
  parent.appendChild(meaningBox);
  getJapaneseTranslation(word);
}

function getJapaneseTranslation(word) {
  var searchUrl = "http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite?"
  + "Dic=EJdict&Scope=HEADWORD&Prof=xml&Match=EXACT&Merge=OR&PageSize=1&"
  + "PageIndex=0&Word=" + word;
  var request = new XMLHttpRequest();
  request.open("GET", searchUrl, true);
  request.onreadystatechange = function(){onItemListResponse(word, request);};
  request.send(null);
}

function onItemListResponse(word, request) {
  if (request.readyState == 4 && request.status == 200) {
    var xml = request.responseXML;
    var nodes = xml.getElementsByTagName('ItemID');
    if (nodes.length == 0) {
      // TODO
      console.log('no word find');
    }
    var idValue = nodes[0].firstChild.nodeValue;
    var itemUrl = "http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite?"
    + "Dic=EJdict&Loc=0&Prof=xml&Item=" + idValue;
    console.log(itemUrl);
    var request = new XMLHttpRequest();
    request.open("GET", itemUrl, true);
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var xml = request.responseXML;
        console.log(xml);
        var nodes = xml.getElementsByTagName('div');
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].hasAttribute('class')
              && nodes[i].getAttribute('class') == 'NetDicBody') {
                var meanings = nodes[i].getElementsByTagName('div');
                if (meanings.length > 0) {
                  var meaning = meanings[0].firstChild.data;
                  showWordMeaning(word, meaning);
                  return;
                }
              }
        }

        // TODO
        console.log('no result');
        // error handling

      }
    }
    request.send(null);
  }
}

function showWordMeaning(word, meaning) {
  var meaningBox = document.getElementById('test-meaningBox');
  meaningBox.innerHTML = '';
  var originalWordBlock = document.createElement('div');
  originalWordBlock.id = 'test-originalWord';
  originalWordBlock.innerHTML = word;
  meaningBox.appendChild(originalWordBlock);
  var meaningBlock = document.createElement('div');
  meaningBlock.id = 'test-meaningBlock';
  meaningBlock.innerHTML = meaning;
  meaningBox.appendChild(meaningBlock);
  var okSpan = document.createElement('span');
  var ngSpan = document.createElement('span');
  okSpan.innerHTML = '覚えた';
  ngSpan.innerHTML = 'まだ';
  okSpan.className = 'test-resultButton';
  ngSpan.className = 'test-resultButton';
  meaningBox.appendChild(okSpan);
  meaningBox.appendChild(ngSpan);
  okSpan.addEventListener('click', function(){testFinished(word, false);}, false);
  ngSpan.addEventListener('click', function(){testFinished(word, true);}, false);
}

function testFinished(word, testOnceMore) {
  var bg = chrome.extension.getBackgroundPage();
  bg.doneTest(word, testOnceMore);
  var testBox = document.getElementById('testBox');
  var meaningBox = document.getElementById('test-meaningBox');
  testBox.removeChild(meaningBox);
  wordsToTest = testBox.wordsToTest;
  var currentWordIndex = wordsToTest.indexOf(word);
  if (currentWordIndex == wordsToTest.length - 1) {
    testBox.parentNode.removeChild(testBox);
    showRecordedWords();
  } else {
    showWordToTest(wordsToTest[currentWordIndex + 1], testBox);
  }
}
