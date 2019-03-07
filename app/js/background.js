let showContextMenu = undefined;

updateCallback = function () {
  if (!_.eq(showContextMenu, preferences.showContextMenu)) {
    showContextMenu = preferences.showContextMenu;
    setContextMenu(showContextMenu);
  }
  chrome.browserAction.setIcon({ "path": "app/img/icon_19x19.png" });
};

let currentVersion = chrome.runtime.getManifest().version,
oldVersion = data.lastVersionRun;

data.lastVersionRun = currentVersion;

if (oldVersion !== currentVersion) {
  if (_.isUndefined(oldVersion)) { //Is firstrun
    chrome.tabs.create({
      url: 'http://www.cookieStore.com/start/'
    });
  } else {
    chrome.notifications.onClicked.addListener(function(notificationId) {
      chrome.tabs.create({
        url: 'http://www.cookieStore.com/changelog/'
      });
      chrome.notifications.clear(notificationId, function(wasCleared) {});
    });
    let opt = {
      type: "basic",
      title: "cookieStore",
      message: "updated",
      iconUrl: "app/img/icon_128x128.png",
      isClickable: true
    };
    chrome.notifications.create("", opt, function(notificationId) {});
  }
}

setContextMenu(preferences.showContextMenu);

chrome.cookies.onChanged.addListener(function(changeInfo) {
  let removed = changeInfo.removed,
  cookie = changeInfo.cookie,
  cause = changeInfo.cause,
  name = cookie.name,
  domain = cookie.domain,
  value = cookie.value;

  if (_.eq(cause, "expired") || _.eq(cause, "evicted")){
    return;
  }

  for (var i = 0; i < data.readOnly.length; i++) {
    let currentRORule = data.readOnly[i];
    if (compareCookies(cookie, currentRORule)) {
      if (removed) {
        chrome.cookies.get({
          'url': "http" + ((currentRORule.secure) ? "s" : "") + "://" + currentRORule.domain + currentRORule.path,
          'name': currentRORule.name,
          'storeId': currentRORule.storeId
        }, function(currentCookie) {
          if (compareCookies(currentCookie, currentRORule)){
            return;
          }
          let newCookie = cookieForCreationFromFullCookie(currentRORule);
          chrome.cookies.set(newCookie);
          ++data.nCookiesProtected;
        });
      }
      return;
    }
  }

  //Check if a blocked cookie was added
  if (!removed) {
    for (var i = 0; i < data.filters.length; i++) {
      let currentFilter = data.filters[i];
      if (filterMatchesCookie(currentFilter, name, domain, value)) {
        chrome.tabs.query({
            active: true
          },
          function(tabs) {
            let url = tabs[0].url,
            toRemove = {};
            toRemove.url = url;
            toRemove.url = "http" + ((cookie.secure) ? "s" : "") + "://" + cookie.domain + cookie.path;
            toRemove.name = name;
            chrome.cookies.remove(toRemove);
            ++data.nCookiesFlagged;
          });
      }
    }
  }

  if (!removed && preferences.useMaxCookieAge && preferences.maxCookieAgeType > 0) { //Check expiration, if too far in the future shorten on user's preference
    let maxAllowedExpiration = Math.round((new Date).getTime() / 1000) + (preferences.maxCookieAge * preferences.maxCookieAgeType);
    if (!_.isUndefined(cookie.expirationDate) && _.gt(cookie.expirationDate, maxAllowedExpiration + 60)) {
        let newCookie = cookieForCreationFromFullCookie(cookie);
        if (!cookie.session){
          newCookie.expirationDate = maxAllowedExpiration;
        }
        chrome.cookies.set(newCookie);
        ++data.nCookiesShortened;
    }
}
});

function setContextMenu(show) {
  chrome.contextMenus.removeAll();
  if (show) {
    chrome.contextMenus.create({
      "title": "cookieStore",
      "contexts": ["page"],
      "onclick": function (info, tab) {
        showPopup(info, tab);
      }
    });
  }
}
