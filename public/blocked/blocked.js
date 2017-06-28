('use strict');

$(document).ready(() => {
  console.log('blocked dom loaded');
  (() => {
    console.log('getting');
    // chrome.storage.sync.get(obj => {
    // console.log('obj: ', obj);

    // });
  })();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('listening');
    console.log('req, sender', message, sender);
    $('#currentBlock').text(message.currentBlock);
    $('#remaining').text(message.remaining);
    return true;
  });

  // $('#duolingo').on('click', () => {
  //   chrome.tabs.query({ active: true }, tabs => {
  //     chrome.tabs.remove(tabs[0].id);
  //     chrome.tabs.create({
  //       url: 'https://www.duolingo.com',
  //       active: true
  //     });
  //   });
  // });
});
