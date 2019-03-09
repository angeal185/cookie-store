const urls = {
  appConfig: '/app/data/appConfig.json',
  cnvConfig: '/app/data/cnvConfig.json'
}

let preferences = {},
csl = chrome.storage.local,
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

function fetchData(cnf,defaults) {
    for (var key in cnf) {
        default_value = cnf[key].default_value;
        preferences[key] = ls.get(preferences_prefix + key, default_value);

        var onPreferenceChange = function (id, oldval, newval) {
            dataToSync[preferences_prefix + id] = newval;
            if (!syncTimeout)
                syncTimeout = setTimeout(syncDataToLS, syncTime);
            return newval;
        };

        var onPreferenceRead = function (id) {
            cnf[id].used = true;
        };

        // Monitor the preferences for changes
        preferences.watch(key, onPreferenceChange, onPreferenceRead);
    }

    for (var key in defaults) {
        default_value = defaults[key].default_value;
        data[key] = ls.get(data_prefix + key, default_value);

        var onDataChange = function (id, oldval, newval) {
            dataToSync[data_prefix + id] = newval;
            if (!syncTimeout)
                syncTimeout = setTimeout(syncDataToLS, syncTime);
            return newval;
        };
        var onDataRead = function (id) {
            defaults[id].used = true;
        };

        data.watch(key, onDataChange, onDataRead);
    }
}

function initStorage(cnf,defaults){
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
              varUsed = !!cnf[key].used;
              varChanged = preferences[key] !== newValue;
              preferences[key] = (newValue === null) ? cnf[key].default_value : newValue;
              cnf[key].used = varUsed;
          } else if (event.key.indexOf(data_prefix) === 0) {
              key = event.key.substring(data_prefix.length);
              varUsed = (defaults[key].used !== undefined && defaults[key].used);
              varChanged = data[key] !== newValue;
              data[key] = (newValue === null) ? defaults[key].default_value : newValue;
              defaults[key].used = varUsed;
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
  fetchData(cnf,defaults);
}

csl.get(function(i) {
  try {
    let obj = i.config.app;
    console.log(obj)
    initStorage(obj.options,obj.defaults)
  } catch (e) {
    if (e) {
      confReset()
    }
  }
});


function confReset(){
  $.getJSON(urls.appConfig, function(data, textStatus) {
    csl.set({
      config: {
        app: data
      }
    })
    location.reload();
  })
}


if(preferences.privacyMode) {
  initPrivacy()
}

if (!_.isNull(ls.get("status_firstRun"))) {
    data.lastVersionRun = chrome.runtime.getManifest().version;
}

syncTimeout = setTimeout(syncDataToLS, syncTime);
$(window).on("beforeunload", syncDataToLS);
