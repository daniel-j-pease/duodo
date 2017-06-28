('use strict');
window.onload = () => {
  (function listenForTabs() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      let re = /:\/\/www.([\w\-\.]+)/;
      chrome.storage.sync.get(obj => {
        if (!obj.duoDo_sites || tab.url === 'chrome://newtab/') {
          chrome.webRequest.onBeforeRequest.removeListener(blockLogic);
          return;
        } else if (
          changeInfo.status === 'loading' &&
          obj.duoDo_sites.includes(`*://*.${re.exec(tab.url)[1]}/*`) &&
          obj.duoDo_garnered < Number(obj.duoDo_target)
        ) {
          let blockedTab = re.exec(tab.url)[1];
          let remaining = Number(obj.duoDo_target) - obj.duoDo_garnered;
          chrome.webRequest.onBeforeRequest.removeListener(blockLogic);
          chrome.webRequest.onBeforeRequest.addListener(
            blockLogic,
            {
              urls: obj.duoDo_sites
            },
            ['blocking']
          );
          sendBlockedMessage(blockedTab, remaining);
          return;
        } else if (
          changeInfo.status === 'complete' &&
          tab.title === 'blocked by DuoDo!'
        ) {
        }
      });
    });
  })();

  // setInt that updates garnered
  (function updateGarnered() {
    let checker = setInterval(() => {
      // reset time vars every call
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
      chrome.storage.sync.get(obj => {
        // replace wheresmyfish with obj.duoDo_username
        fetch(`http://www.duolingo.com/users/wheresmyfish`)
          .then(r => r.json())
          .then(data => {
            data.calendar.forEach(session => {
              if (timeNow > todayCutoffOffset) {
                if (session.datetime > todayCutoffOffset) {
                  garnered += session.improvement;
                }
              } else if (session.datetime > yesterdayAtCutoff) {
                garnered += session.improvement;
              }
            });
            // after forEach, update storage.duoDo_garnered
            chrome.storage.sync.set({ duoDo_garnered: garnered }, () => {
              return;
            });
          });
      });
    }, 15000);
  })();

  function listenForBlockedTab() {}

  const blockLogic = details => {
    chrome.tabs.query({ active: true }, tabs => {
      chrome.tabs.remove(tabs[0].id);
      chrome.tabs.create({
        url: 'public/blocked/index.html',
        active: true
      });
    });
    return { cancel: true };
  };

  function sendBlockedMessage(blockedTab, remaining) {
    setTimeout(() => {
      chrome.runtime.sendMessage({
        currentBlock: blockedTab,
        remaining: remaining
      });
    }, 1000);
  }
};
