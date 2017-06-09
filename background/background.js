('use strict');
window.onload = function() {
  console.log('background js running');
  (() => {
    chrome.storage.sync.get(obj => {
      typeof obj.duoDo_sites === 'undefined'
        ? (() => {
            console.log('no sites');
            updateFilters(void 0, 'abc');
            return;
          })()
        : (() => {
            console.log('yes sites');
            updateFilters(obj.duoDo_sites);
            return;
          })();
    });
  })();

  (() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      console.log('changes.duoDo_sites.newValue', changes.duoDo_sites.newValue);
      typeof changes.duoDo_sites.newValue === 'undefined'
        ? (() => {
            console.log('newVal undef');
            updateFilters([]);
            return;
          })()
        : (() => {
            console.log('newVal def');
            updateFilters(changes.duoDo_sites.newValue);
          })();
    });
  })();

  function updateFilters(urls) {
    chrome.storage.sync.get(obj => {
      console.log('obj', obj);
    });
    console.log('arg', urls);
    if (typeof urls === 'undefined') {
      console.log('args undef');
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
      urlObj.urls.push(urls[i]);
    }

    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        for (let i = 0; i < urlObj.urls.length; i++) {
          if (details.url.includes(urlObj.urls[i].slice(6, -6))) {
            console.log('includes');
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
