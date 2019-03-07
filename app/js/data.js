
const preferences_template = {
    // Show alerts when the user performs some operations such as deleting a cookie
    "showAlerts": {
        "default_value": false
    },
    "showAnimate": {
        "default_value": true
    },
    // Show labels in the popup window next to some of the buttons
    "showCommandsLabels": {
        "default_value": false
    },
    // Show the domain in the accordion of the popup window next to each cookie's name
    "showDomain": {
        "default_value": true
    },
    // Show the domain before the name of the cookie in the accordion
    "showDomainBeforeName": {
        "default_value": true
    },
    // Show the BlockAndDeleteAll button in the popup window. This is an advanded operation, hence it's disabled by default
    "showFlagAndDeleteAll": {
        "default_value": false
    },
    // Show an option to open cookieStore as a separate tab in the context menu
    "showContextMenu": {
        "default_value": true
    },
    // If enabled, after submitting cookie changes, the active tab will be refreshed
    "refreshAfterSubmit": {
        "default_value": false
    },
    // If enabled, the cache will be bypassed when reloading a page
    "skipCacheRefresh": {
        "default_value": true
    },
    // ETC has a feature to limit the maximum age of any cookie that is being set by websites.
    // This feature is controlled by the next three variables:
    // If true, this feature is enabled
    "useMaxCookieAge": {
        "default_value": false
    },
    // The multiplier for maxCookieAge in order to obtain the right number of seconds. 3600 for hour, 86400 for day, ...
    // -1 if not set
    "maxCookieAgeType": {
        "default_value": -1
    },
    // The time basic unit, to be used in conjunction with the previous variable to calculate the maximum allowed age
    "maxCookieAge": {
        "default_value": 1
    },

    // The output format to use when exporting cookies to the clipboard.
    // Supported: netscape, json, semicolonPairs. For reference, see cookie_helpers.js -> "cookiesToString"
    "copyCookiesType": {
        "default_value": "json"
    },
    // How cookies will be sorted. Supported values:
    //          alpha:        alphabetic ordering by cookie name
    //          domain_alpha: alphabetic ordering by domain and cookie name
    "sortCookiesType": {
        "default_value": "domain_alpha"
    },
    // Whether to show the panel in the DevTools panel (e.g. panel shown when pressing F12)
    "showDevToolsPanel": {
        "default_value": false
    }
};


const data_template = {
    "filters": {
        "default_value": []
    },
    "readOnly": {
        "default_value": []
    },
    "nCookiesCreated": {
        "default_value": 0
    },
    "nCookiesChanged": {
        "default_value": 0
    },
    "nCookiesDeleted": {
        "default_value": 0
    },
    "nCookiesProtected": {
        "default_value": 0
    },
    "nCookiesFlagged": {
        "default_value": 0
    },
    "nCookiesShortened": {
        "default_value": 0
    },
    "nPopupClicked": {
        "default_value": 0
    },
    "nPanelClicked": {
        "default_value": 0
    },
    "nCookiesImported": {
        "default_value": 0
    },
    "nCookiesExported": {
        "default_value": 0
    },
    "lastVersionRun": {
        "default_value": undefined
    }
};

let preferences = {},
data = {},
preferences_prefix = "options_",
data_prefix = "data_",
updateCallback = undefined,
dataToSync = [],
syncTimeout = false,
syncTime = 200;

const ss = {
    set: function (name, value) {
        sessionStorage.setItem(name, JSON.stringify(value));
    },
    get: function (name, val) {
        if (!sessionStorage.getItem(name) || sessionStorage.getItem() === undefined) {
            return 'undefined';
        }
        try {
            return JSON.parse(localStorage.getItem(name));
        } catch (e) {
            return ss.set(name, '');
        }
    },
    remove: function (name) {
        sessionStorage.removeItem(name);
    }
};

const ls = {
    set: function (name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    },
    get: function (name, default_value) {
        if (localStorage[name] === undefined) {
            if (default_value !== undefined){
              ls.set(name, default_value);
            } else{
              return null;
            }
            return default_value;
        }
        try {
            return JSON.parse(localStorage.getItem(name));
        } catch (e) {
            ls.set(name, default_value);
            return default_value;
        }
    },
    remove: function (name) {
        localStorage.removeItem(name);
    }
};


function syncDataToLS() {
    for (var cID in dataToSync) {
        let cVal = dataToSync[cID];
        delete dataToSync[cID];
        ls.set(cID, cVal);
    }
    syncTimeout = false;
}

function fetchData() {
    for (var key in preferences_template) {
        default_value = preferences_template[key].default_value;
        preferences[key] = ls.get(preferences_prefix + key, default_value);

        var onPreferenceChange = function (id, oldval, newval) {
            dataToSync[preferences_prefix + id] = newval;
            if (!syncTimeout)
                syncTimeout = setTimeout(syncDataToLS, syncTime);
            return newval;
        };

        var onPreferenceRead = function (id) {
            preferences_template[id].used = true;
        };

        // Monitor the preferences for changes
        preferences.watch(key, onPreferenceChange, onPreferenceRead);
    }

    for (var key in data_template) {
        default_value = data_template[key].default_value;
        data[key] = ls.get(data_prefix + key, default_value);

        var onDataChange = function (id, oldval, newval) {
            dataToSync[data_prefix + id] = newval;
            if (!syncTimeout)
                syncTimeout = setTimeout(syncDataToLS, syncTime);
            return newval;
        };
        var onDataRead = function (id) {
            data_template[id].used = true;
        };

        data.watch(key, onDataChange, onDataRead);
    }
}


  window.addEventListener("storage", function (event){
      try {
          let varUsed = false,
          varChanged = false,
          oldValue = (event.oldValue !== null) ? JSON.parse(event.oldValue) : null,
          newValue = (event.newValue !== null) ? JSON.parse(event.newValue) : null,
          key;
          console.log('oldValue:' +oldValue)
          console.log('newValue:' +newValue)
          if (_.eq(oldValue, newValue)){
            return;
          }
          if (event.key.indexOf(preferences_prefix) === 0) {
              key = event.key.substring(preferences_prefix.length);
              varUsed = !!preferences_template[key].used;
              varChanged = preferences[key] !== newValue;
              preferences[key] = (newValue === null) ? preferences_template[key].default_value : newValue;
              preferences_template[key].used = varUsed;
          } else if (event.key.indexOf(data_prefix) === 0) {
              key = event.key.substring(data_prefix.length);
              varUsed = (data_template[key].used !== undefined && data_template[key].used);
              varChanged = data[key] !== newValue;
              data[key] = (newValue === null) ? data_template[key].default_value : newValue;
              data_template[key].used = varUsed;
          }
          if (varUsed && varChanged && updateCallback !== undefined) {
              return updateCallback();
          }
      } catch(e) {
        if(e){
          return console.error(e.message);
        }
      }
  }, false);

  fetchData();





if (!_.isNull(ls.get("status_firstRun"))) {
    data.lastVersionRun = chrome.runtime.getManifest().version;
}

syncTimeout = setTimeout(syncDataToLS, syncTime);
$(window).on("beforeunload", syncDataToLS);
