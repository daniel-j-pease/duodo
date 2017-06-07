('use strict');
window.onload = function() {
  console.log('background js running');
  (() => {
    chrome.storage.sync.get(obj => {
      console.log('checking storage:', obj);
      updateFilters(obj.duoDo_sites);
    });
  })();

  function updateFilters(urls) {
    let urlObj = {
      urls: [],
      types: [
        'main_frame',
        'sub_frame',
        'stylesheet',
        'script',
        'image',
        'object',
        'xmlhttprequest',
        'other'
      ]
    };
    for (let i = 0; i < urls.length; i++) {
      urlObj.urls.push(urls[i]);
    }
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        if (details.type === 'main_frame') {
          console.log(details);
          chrome.tabs.create({
            url: 'public/blocked/index.html',
            active: true
          });
          chrome.tabs.remove(details.tabId);
          chrome.storage.sync.set({
            currentBlock: details.url
          });
          chrome.storage.sync.get('currentBlock', obj => {
            console.log('storage:', obj);
          });
        }
        return { cancel: true };
      },
      urlObj,
      ['blocking']
    );
  }
};

//
//

// var rule = {
//   conditions: [
//     new chrome.declarativeWebRequest.RequestMatcher({
//       url: { hostSuffix: 'example.com' } })
//   ],
//   actions: [
//     new chrome.declarativeWebRequest.CancelRequest()
//   ]};
