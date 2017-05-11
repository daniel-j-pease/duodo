('use strict');
window.onload = function() {
  console.log('background js running');
  (() => {
    chrome.storage.sync.get(obj => {
      console.log('checking storage:', obj);
      updateFilters(obj.sites);
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
          console.log('deets:', details);
          chrome.tabs.create({
            url: 'blocked.html',
            active: true
          });
          chrome.tabs.remove(details.tabId);
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
