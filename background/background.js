('use strict');
window.onload = () => {
  console.log('************************ background js running');

  (function listenForChanges() {
    urlObj = {
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
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.duoDo_sites.newValue) {
        urlObj.urls = changes.duoDo_sites.newValue;
        chrome.webRequest.onBeforeRequest.removeListener(blockLogic);
        chrome.webRequest.onBeforeRequest.addListener(blockLogic, urlObj, [
          'blocking'
        ]);
      } else {
        urlObj.urls = [];
        chrome.webRequest.onBeforeRequest.removeListener(blockLogic);
      }
    });
  })();

  const blockLogic = details => {
    for (let i = 0; i < urlObj.urls.length; i++) {
      console.log('urlobj.urls', urlObj.urls);
      if (details.url.includes(urlObj.urls[i].slice(6, -6))) {
        chrome.tabs.query({ active: true }, tabs => {
          chrome.tabs.remove(tabs[0].id);
          chrome.tabs.create({
            url: 'public/blocked/index.html',
            active: true
          });
        });
        return { cancel: true };
      }
    }
  };
};
