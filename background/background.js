('use strict');
window.onload = () => {
  console.log('************************ background js running');
  function dateMess() {
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
        console.log('data', data.calendar);
        data.calendar.forEach((session, i) => {
          if (timeNow > todayCutoffOffset) {
            if (session.datetime > todayCutoffOffset) {
              console.log('wrong session', session, i);
              garnered += session.improvement;
            }
          } else if (session.datetime > yesterdayAtCutoff) {
            garnered += session.improvement;
          }
        });
        console.log('g', garnered);
      });

    console.log('hi', new Date(todayCutoffOffset));
  }

  (function listenForTabs() {
    console.log('lft');
    console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status) {
        console.log('there be status');
        if (changeInfo.status === 'complete') {
          console.log('it be complete', tab);
        }
      } else {
        console.log('no status');
      }
    });
  })();
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
