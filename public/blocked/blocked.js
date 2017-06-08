('use strict');

$(document).ready(() => {
  console.log('blocked dom loaded');
  let storage;
  (() => {
    chrome.storage.sync.get(
      ['duoDo_currentBlock', 'duoDo_target', 'duoDo_username', 'duoDo_sites'],
      obj => {
        storage = obj;
        console.log('bg', obj.duoDo_currentBlock);
        $('#currentBlock').text(obj.duoDo_currentBlock);
      }
    );
  })();

  $('#duolingo').on('click', () => {
    console.log(storage);
    chrome.tabs.getSelected(null, tab => {
      chrome.tabs.remove(tab.id, () => {});
    });
    chrome.tabs.create({
      url: 'https://www.duolingo.com',
      active: true
    });
  });
});
