$(document).ready(() => {
  function restoreOptions() {
    chrome.storage.sync.get(obj => {
      $('.save').css('opacity', 0.2);
      typeof obj.duoDo_username === 'string'
        ? $('#username-display').text(`${obj.duoDo_username}`)
        : $('#username-display').text(`e.g., DanLearnsFrench`);
      typeof obj.duoDo_target === 'string'
        ? $('#target-display').text(`${obj.duoDo_target}`)
        : $('#target-display').text(`e.g., 30`);
      $('#username').text('');
      $('#target').text('');
    });
  }

  function populateBucket() {
    chrome.storage.sync.get(['duoDo_sites'], obj => {
      if (!obj.duoDo_sites) {
        $('#bucket').empty();
        return;
      }
      $('#bucket').empty();
      let stripped = [];
      obj.duoDo_sites.forEach(site => {
        stripped.push(site.slice(6, -6));
      });
      stripped.forEach(site => {
        let temp = $('<div class="blocked-site"></div>').text(site + ' ');
        temp.append($('<span class="ecks"> x</span>'));
        temp.click(removeSite);
        $('#bucket').append(temp);
      });
    });
    $('#site').text('');
  }

  function removeSite(e) {
    let remove = $(e.target.parentElement)[0];
    let removeText = $(e.target.parentElement)
      .text()
      .slice(0, $(e.target.parentElement).text().indexOf(' '));
    chrome.storage.sync.get(['duoDo_sites'], obj => {
      let newArr = obj.duoDo_sites.filter(site => {
        return !site.includes(removeText);
      });
      chrome.storage.sync.set({ duoDo_sites: newArr }, obj => {
        $(remove).remove();
      });
    });
  }

  function startUpdateStorage(e) {
    $(e.target).hide();
    $(e.target).prev().show();
    let inputArr = $(e.target).prev().prev();
    let field = $(e.target).prev().prev().attr('id');
    let val = $(e.target).prev().prev().val();
    field === 'username'
      ? checkUsername(val, inputArr[0], field)
      : checkNumber(val, inputArr[0], field);
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

  function checkNumber(val, input, field) {
    if (!Number(val) || Number(val) % 10 !== 0) {
      handleBadInput('target');
      return;
    } else {
      updateStorage(val, field, input);
      return;
    }
  }

  function checkUsername(username, input, field) {
    fetch(`http://www.duolingo.com/users/${username}`)
      .then(r => r.json())
      .then(data => {
        updateStorage(username, field, input);
        return data;
      })
      .catch(err => {
        handleBadInput('username');
        return err;
      });
  }

  function updateStorage(val, field, input) {
    chrome.storage.sync.set(
      {
        [`duoDo_${field}`]: `${val}`
      },
      () => {
        $('.hidden').hide();
        $(`#${field}-display`).show();
        restoreOptions();
      }
    );
  }

  function addToBucket(newSite) {
    chrome.storage.sync.get(['duoDo_sites'], obj => {
      let sitesArr = obj.duoDo_sites || [];
      sitesArr.push(`*://*.${newSite}.com/*`);
      chrome.storage.sync.set({ duoDo_sites: sitesArr }, () => {
        populateBucket();
      });
    });
    $('#site').val('');
  }

  $('.save').click(startUpdateStorage);

  $('.hidden').keydown(e => {
    $(e.target).next().next().css('opacity', 1);
  });

  $('#add').click(e => {
    addToBucket($(e.target).prev().val());
  });

  $('.updater').click(e => {
    // hide display text
    $(e.target).hide();
    // hide edit button
    $(e.target).prev().prev().hide();
    // reveal save button
    $(e.target).prev().show();
    // reveal input
    $(e.target).next().show();
  });

  $('#github').click(() => {
    chrome.tabs.create({
      url: 'https://github.com/daniel-j-pease',
      active: true
    });
  });

  $('#check').click(() => {
    chrome.storage.sync.get(obj => {
      console.log('storage checked:', obj);
      return;
    });
  });

  $('#clear').click(() => {
    chrome.storage.sync.remove(
      ['duoDo_username', 'duoDo_target', 'duoDo_sites', 'duoDo_currentBlock'],
      obj => {
        console.log('storage cleared:', obj);
        populateBucket();
      }
    );
  });

  restoreOptions();
  populateBucket();
  dateMess();
});
