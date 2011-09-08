Settings = function() {
  this.init();
  return this;
}

Settings.prototype = {
  all: {},

  init: function() {
    this.load();
  },

  load: function() {
    this.all = localStorage['settings'] ? JSON.parse(localStorage['settings']) : {};
  },

  save: function() {
    localStorage['settings'] = JSON.stringify(this.all);
  },

  toggle_site_blocking: function(element_id) {
    if (this.all.blockSites) {
      this.all.blockSites = false;
    }
    else {
      this.all.blockSites = true;
    }

    this.save();
  }

}

UrlSet = function() {
  this.init();
  return this;
}

UrlSet.prototype = {
  urls: [],
  index: 0,

  init: function() {
    this.load();
  },

  load: function() {
    this.urls = localStorage['urls'] ? JSON.parse(localStorage['urls']) : [];
    this.index = localStorage['index'] ? JSON.parse(localStorage['index']) : 0;
  },

  save: function() {
    localStorage['urls'] = JSON.stringify(this.urls); 
    localStorage['index'] = this.index; 
  },

  urlExists: function(url) {
    return (this.urls.indexOf(url) > -1);
  },

  create: function(url) {
    if (!this.urlExists(url)) {
      url.id = this.index++;
      this.urls.push(url);
      this.save();
    }
  },

  delete: function(url) {
    var self = this;
    this.urls.forEach(function(t, i) {
      if (t == url) {
        self.urls.splice(i, 1);
      }
    });
    this.save();
  }

}

// blocks access to sites if blocking is enabled
function shouldBlockSite(tabId, changeInfo, tab) {
  settings.load();
  if (settings.all.blockSites) {
    urlSet.load();
    jQuery.url.setUrl(tab.url);
    if (urlSet.urls.indexOf(jQuery.url.attr('host')) > -1) {
      blockSite(tabId);
    }
  }
}

// block the page
function blockSite(tabId) {
  chrome.tabs.update(tabId, {url: 'blocked.html'});
}

// register handlers for removing items
function registerBlockedUrlsRemoveButtons() {
  $('#blocked_sites li button').each(function(i) {
    $(this).click(function() {
      urlSet.delete($(this).data('url'));
      populateBlockedUrls();
    });
  });
}

// handles the text and style of our block sites button
function styleForCurrentBlockingState() {
  var sitesBlockElem = $('#block_sites_button');
  if (settings.all.blockSites) {
    if (sitesBlockElem.hasClass('green')) {
      sitesBlockElem.removeClass('green');
    }
    sitesBlockElem.text("Disable Site Blocking"); 
    sitesBlockElem.addClass('red');
    toggleBadge([255, 0, 0, 255], '    ');
  }
  else {
    if (sitesBlockElem.hasClass('red')) {
      sitesBlockElem.removeClass('red');
    }
    sitesBlockElem.text("Enable Site Blocking");
    sitesBlockElem.addClass('green');
    toggleBadge([119, 212, 42, 255], '    ');
  }
}

// displays the list of our blocked sites
function populateBlockedUrls() {
  var urlList = $("<ul class='blocked_list'></ul>");
  for (var i = 0; i < urlSet.urls.length; i++) {
    urlList.append("<li><button class='grey remove_button' data-url='" + urlSet.urls[i] + "'>" + urlSet.urls[i] + '</button></li>');
  }
  $('#blocked_sites').html(urlList);

  registerBlockedUrlsRemoveButtons(); 
}

function toggleBadge(rgbColor, badgeText) {
  chrome.browserAction.setBadgeBackgroundColor({'color': rgbColor});
  chrome.browserAction.setBadgeText({'text': badgeText});
}

$(document).ready(function() {
  urlSet.load();
  settings.load();

  styleForCurrentBlockingState();

  populateBlockedUrls();

  // handler to add the current site
  $('#block_this_site_button').click(function() {
    chrome.tabs.getSelected(null, function(tab) {
      urlSet.create(jQuery.url.setUrl(tab.url).attr('host'));
      populateBlockedUrls();
    });

    window.close();
  });

  // handler to toggle site blocking
  $('#block_sites_button').click(function() {
    settings.toggle_site_blocking('#block_sites_button');
    styleForCurrentBlockingState();
    window.close();
  });

});

var settings = new Settings();
var urlSet = new UrlSet();
