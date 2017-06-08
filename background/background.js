('use strict');
window.onload = function() {
  console.log('background js running');
  (() => {
    chrome.storage.sync.get(obj => {
      console.log('bgjs', typeof obj.duoDo_sites);
      typeof obj.duoDo_sites === 'undefined'
        ? (() => {
            updateFilters(undefined);
            return;
          })()
        : updateFilters(obj.duoDo_sites);
    });
  })();

  (() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      console.log('this one', changes.duoDo_sites.newValue);
      !changes.duoDo_sites.newValue
        ? (() => {
            console.log('bg true', changes);
            updateFilters(undefined);
            return;
          })()
        : updateFilters(changes.duoDo_sites.newValue);
    });
  })();

  function updateFilters(urls) {
    console.log('uf', urls, typeof urls);
    if (urls === undefined) {
      console.log('nope');
      return;
    }
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
      console.log('happening');
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
            duoDo_currentBlock: details.url
          });
          chrome.storage.sync.get('duoDo_currentBlock', obj => {
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
