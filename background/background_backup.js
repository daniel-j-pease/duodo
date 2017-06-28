('use strict');
window.onload = () => {
  // console.log('************************ background js running');

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

  function updateGarnered(blockedArr) {
    urlObj.urls = blockedArr;
    let timeNow = Date.now();
    let today = new Date();
    let todayAtCutoff = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      4,
      0,
      0,
      0
    );
    let yesterdayAtCutoff = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
      4,
      0,
      0,
      0
    );
    let timezoneOffset = today.getTimezoneOffset() * 60 * 1000;
    let todayCutoffOffset = todayAtCutoff + timezoneOffset;
    let yesterdayCutoffOffset = yesterdayAtCutoff + timezoneOffset;
    let garnered = 0;

    fetch(`http://www.duolingo.com/users/wheresmyfish`)
      .then(r => r.json())
      .then(data => {
        data.calendar.forEach((session, i) => {
          if (timeNow > todayCutoffOffset) {
            if (session.datetime > todayCutoffOffset) {
              garnered += session.improvement;
            }
          } else if (session.datetime > yesterdayAtCutoff) {
            garnered += session.improvement;
          }
        });
        chrome.storage.sync.set({ duoDo_garnered: garnered }, () => {
          // console.log(`duoDo_garnered set to ${garnered}`);
        });
        // console.log('g', garnered);
      })
      .then(() => {
        chrome.storage.sync.get(obj => {
          // console.log('storage before pointcheck', obj);
          if (obj.duoDo_garnered < obj.duoDo_target) {
            chrome.webRequest.onBeforeRequest.removeListener(blockLogic);
            chrome.webRequest.onBeforeRequest.addListener(blockLogic, urlObj, [
              'blocking'
            ]);
          } else {
            chrome.webRequest.onBeforeRequest.removeListener(blockLogic);
          }
        });
        console.log('in cb', garnered);
      });
  }

  (function listenForTabs() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status && changeInfo.status === 'complete') {
        console.log('complete', urlObj);
        for (let i = 0; i < urlObj.urls.length; i++) {
          if (tab.url.includes(urlObj.urls[i].slice(6, -6))) {
            chrome.storage.sync.get(obj => {
              console.log('getting', obj, obj.duoDo_sites);
              updateGarnered(obj.duoDo_sites);
            });
          }
        }
      }
    });
  })();

  (function listenForChanges() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      // console.log('listening');
      if (changes.duoDo_sites) {
        if (changes.duoDo_sites.newValue) {
          urlObj.urls = changes.duoDo_sites.newValue;
        } else {
          urlObj.urls = [];
        }
      }
    });
  })();

  const blockLogic = details => {
    for (let i = 0; i < urlObj.urls.length; i++) {
      // console.log('urlobj.urls', urlObj.urls);
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
