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
        doDuo_username: username,
        doDuo_target: target
      },
      obj => {
        console.log('ro', obj);
        $('#username-display').text(`${obj.doDuo_username}`);
        $('#username').text('');
        $('#target-display').text(`${obj.doDuo_target}`);
        $('#target').text('');
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

  function populateBucket() {
    chrome.storage.sync.get('sites', obj => {
      obj.sites.forEach(site => {
        let temp = $('<div class="blocked-site"></div>').text(site + ' ');
        temp.append($('<span class="ecks"> x</span>'));
        $('#bucket').append(temp);
      });
    });
  }

  function addToBucket() {
    let newSite = $('#site').val();
    console.log(newSite);
  }

  $('#check').click(() => {
    chrome.storage.sync.get(obj => {
      restoreOptions();
    });
  });

  $('#clear').click(() => {
    chrome.storage.sync.remove(['username', 'target'], obj => {
      console.log('storage cleared:', obj);
    });
  });

  $('#github').click(() => {
    chrome.tabs.create({
      url: 'https://github.com/daniel-j-pease',
      active: true
    });
  });

  $('.right-button').click(e => {
    console.log($(e.target).prev());
    // hide display text
    $(e.target).hide();
    // hide edit button
    $(e.target).prev().prev().hide();
    // reveal save button
    $(e.target).prev().show();
    // reveal input
    $(e.target).next().show();
  });

  $('.save').click(startUpdateStorage);

  function startUpdateStorage(e) {
    $(e.target).hide();
    $(e.target).prev().show();
    let inputArr = $(e.target).prev().prev();
    let field = $(e.target).prev().prev().attr('id');
    let val = $(e.target).prev().prev().val();
    // console.log('iA', inputArr, 'f', field, 'v', val);
    field === 'username'
      ? checkUsername(val, inputArr[0], field)
      : checkNumber(val, inputArr[0], field);

    // ping duo 'api'
    // check integer
  }

  function checkNumber(val, input, field) {
    console.log('cn', val, input, field);
    if (!Number(val)) {
      console.log('error, not num');
      return;
    } else {
      console.log('do dom stuff');
      updateStorage(val, field, input);
      return;
    }
  }

  function checkUsername(username, input, field) {
    fetch(`http://www.duolingo.com/users/${username}`)
      .then(r => r.json())
      .then(data => {
        console.log('data', data);
        updateStorage(username, field, input);
        return data;
      })
      .catch(err => {
        console.log('err', err);
        return err;
      });
  }

  function updateStorage(val, field, input) {
    console.log('us', val, field, input);
    chrome.storage.sync.set(
      {
        [`doDuo_${field}`]: `${val}`
      },
      () => {
        console.log('itme', $(`#${field}-display`));
        $('input').hide();
        $(`#${field}-display`).show();
        restoreOptions();
      }
    );
  }

  $('.change').keydown(e => {
    $(e.target).next().next().css('opacity', 1);
  });

  $('#add').click(addToBucket);

  restoreOptions();
  populateBucket();
});
