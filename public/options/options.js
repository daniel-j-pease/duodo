$(document).ready(() => {
  function restoreOptions() {
    chrome.storage.sync.get(
      {
        duoDo_username: username,
        duoDo_target: target
      },
      obj => {
        console.log('ro', obj);
        $('.save').css('opacity', 0.2);
        typeof obj.duoDo_username === 'string'
          ? $('#username-display').text(`${obj.duoDo_username}`)
          : $('#username-display').text(`e.g., DanLearnsFrench`);
        typeof obj.duoDo_target === 'string'
          ? $('#target-display').text(`${obj.duoDo_target}`)
          : $('#target-display').text(`e.g., 30`);
        $('#username').text('');
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
    chrome.storage.sync.get(['sites'], obj => {
      if (!obj.sites) return;
      $('#bucket').empty();
      let stripped = [];
      obj.sites.forEach(site => {
        stripped.push(site.slice(6, -6));
      });
      stripped.forEach(site => {
        let temp = $('<div class="blocked-site"></div>').text(site + ' ');
        temp.append($('<span class="ecks"> x</span>'));
        $('#bucket').append(temp);
      });
    });
  }

  function addToBucket(newSite) {
    // let newSite = $($('#site')[0]).val();
    // console.log(newSite);
    chrome.storage.sync.get(['sites'], obj => {
      let sitesArr = obj.sites || [];
      sitesArr.push(newSite);
      let sites = { sites: sitesArr };
      chrome.storage.sync.set(sites, () => {
        populateBucket();
      });
    });
  }

  $('#check').click(() => {
    chrome.storage.sync.get(obj => {
      restoreOptions();
    });
  });

  $('#clear').click(() => {
    chrome.storage.sync.remove(
      ['duoDo_username', 'duoDo_target', 'sites'],
      obj => {
        console.log('storage cleared:', obj);
      }
    );
  });

  $('#github').click(() => {
    chrome.tabs.create({
      url: 'https://github.com/daniel-j-pease',
      active: true
    });
  });

  $('.updater').click(e => {
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
    if (!Number(val) || Number(val) % 10 !== 0) {
      handleBadInput('target');
      return;
    } else {
      console.log('do dom stuff');
      updateStorage(val, field, input);
      return;
    }
  }

  function handleBadInput(str) {
    $('.hidden').hide();
    $('.display').show();
    $('.save').css('opacity', 0.2);
    $('#error').show();
    $('#error').text(`Invalid ${str}. Please try again.`);
    setTimeout(() => {
      $('#error').hide();
    }, 2000);
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
        handleBadInput('username');
        return err;
      });
  }

  function updateStorage(val, field, input) {
    console.log('us', val, field, input);
    chrome.storage.sync.set(
      {
        [`duoDo_${field}`]: `${val}`
      },
      () => {
        console.log('itme', $(`#${field}-display`));
        $('.hidden').hide();
        $(`#${field}-display`).show();
        restoreOptions();
      }
    );
  }

  $('.hidden').keydown(e => {
    $(e.target).next().next().css('opacity', 1);
  });

  $('#add').click(e => {
    console.log('add', $(e.target).prev().val());
    addToBucket('.....6stuff6543210');
  });

  restoreOptions();
  populateBucket();
});
