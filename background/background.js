('use strict');
window.onload = () => {
  console.log('background js running');

  function getUrls() {
    chrome.storage.sync.get(obj => {
      console.log('bg onload storage', obj);
    });
  }

  (function listenForChanges() {
    console.log('listening');
    chrome.storage.onChanged.addListener((changes, namespace) => {
      console.log('cn', changes, namespace);
      applyBlock(changes.duoDo_sites.newValue);
    });
  })();

  function block(object details) {
    console.log('db ca', changes, area);
  }

  function applyBlock() {
    console.log('block applied');
    chrome.webRequest.onBeforeRequest.addListener(details => {
      block(changes, area);
    });
  }

  function removeBlock() {
    console.log('block removed');
    chrome.webRequest.onBeforeRequest.removeListener(block);
  }
  getUrls();
};
