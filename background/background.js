('use strict');
window.onload = () => {
  console.log('background js running');

  (function getUrls() {
    console.log('getting');
    chrome.storage.sync.get(obj => {
      console.log('bg onload storage', obj);
    });
  })();

  (function listenForChanges() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      console.log('cn', changes, namespace);
      if (changes.duoDo_sites.newValue) {
        console.log('new value!');
        applyBlock(changes.duoDo_sites.newValue);
      } else {
        console.log('no new value!');
        applyBlock([]);
      }
    });
  })();

  function applyBlock(urlArr) {
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

    for (let i = 0; i < urlArr.length; i++) {
      urlObj.urls.push(urlArr[i]);
    }

    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        console.log('details', details);
        for (let i = 0; i < urlObj.urls.length; i++) {
          if (details.url.includes(urlObj.urls[i].slice(6, -6))) {
            console.log('includes', urlObj.urls[i]);
            if (details.type === 'main_frame') {
              chrome.tabs.create({
                url: 'public/blocked/index.html',
                active: true
              });
              chrome.tabs.remove(details.tabId);
            }
            return { cancel: true };
          } else {
            console.log('doesnt include');
            return;
          }
        }
      },
      urlObj,
      ['blocking']
    );
  }
};
