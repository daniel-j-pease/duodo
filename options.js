$(document).ready(() => {
  function setStorage() {
    let target = Number($('#target').val());
    let username = $('#username').val();
    // let sites = $('#sites').val();
    // if sites.length < 1

    if (username.length < 1 || !Number.isInteger(target)) {
      alert('All fields required.');
    } else {
      chrome.storage.sync.set(
        {
          target: target,
          username: username,
          sites: ['*://*.facebook.com/*']
        },
        () => {
          $('#status').text(`target set to ${target}`);
          setTimeout(() => {
            $('#status').text('');
          }, 750);
        }
      );
    }
  }

  function restoreOptions() {
    chrome.storage.sync.get(
      {
        target: target,
        username: username
      },
      obj => {
        typeof obj.username === 'string'
          ? $('#username').val(`${obj.username}`)
          : $('#username').val('');
        typeof obj.target === 'number'
          ? $('#target').val(`${obj.target}`)
          : $('#target').val('');
      }
    );
  }

  function fetchData() {
    let target = Number($('#target').val());
    let username = $('#username').val();
    return fetch(`http://www.duolingo.com/users/${username}`)
      .then(r => r.json())
      .then(data => {
        console.log('fetching:', data);
        // most recent session is the last thing in the array.
        // each 'improvement' is broken down into its own item with its own timestamp
      });
  }

  $('#save').click(() => {
    setStorage();
    fetchData();
  });

  $('#check').click(() => {
    chrome.storage.sync.get(obj => {
      console.log('checking storage:', obj);
      restoreOptions();
    });
  });

  $('#clear').click(() => {
    chrome.storage.sync.remove(['username', 'target'], obj => {
      console.log('storage cleared:', obj);
    });
  });

  restoreOptions();
});
