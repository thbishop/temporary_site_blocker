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
      text = 'Block Sites';
    }
    else {
      this.all.blockSites = true;
      text = 'Stop Blocking Sites';
    }

    this.save();
    $(element_id).text(text);
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
      if(t.id == url.id) self.splice(i, 1);
    });
  },

  findById: function(id) {
    return this.urls.filter(function(t) { return t.id == id })[0];
  }

}

// blocks access to sites if blocking is enabled
function shouldBlockSite(tabId, changeInfo, tab) {
  settings.load();
  if (settings.all.blockSites) {
    jQuery.url.setUrl(tab.url);
    if (urls.urls.indexOf(jQuery.url.attr('host')) > -1) {
      blockSite(tabId);
    }
  }
}

// block the page
function blockSite(tabId) {
  chrome.tabs.update(tabId, {url: 'blocked.html'});
}

// displays the list of our blocked sites
function populateBlockedUrls() {
  var urlList = $("<ul class='blocked_list'></ul>");
  for (var i = 0; i < urls.urls.length; i++) {
    urlList.append('<li>' + urls.urls[i] + '</li>');
  }
  $('#blocked_sites').html(urlList);
}

$(document).ready(function() {
  urls.load();
  settings.load();

  if (settings.all.blockSites) {
    $('#toggle_site_block_link').text("Don't Block Sites");
  }
  else {
    $('#toggle_site_block_link').text("Block Sites");
  }

  populateBlockedUrls();

  // handler to add the current site
  $('#site_block_link').click(function() {
    chrome.tabs.getSelected(null, function(tab) {
      urls.create(jQuery.url.setUrl(tab.url).attr('host'));
      populateBlockedUrls();
    });

    $('#block_this_site').addClass('hidden');
  });

  // handler to toggle site blocking
  $('#toggle_site_block_link').click(function() {
    settings.toggle_site_blocking('#toggle_site_block_link');
  });

  // handler to close the window
  $('#close_window').click(function() {
    window.close();
  });

});

var settings = new Settings();
var urls = new UrlSet();
