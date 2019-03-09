console.log("Starting background-devtools");

chrome.runtime.onConnect.addListener(function (port) {
  if (!_.eq(port.name, "devtools-page")) {
    return;
  }
  let devToolsListener = function (message, sender, sendResponse) {
    let action = message.action;
    if (_.eq(action, "getall")) {
        getAll(port, message);
    }
  };
  port.onMessage.addListener(devToolsListener);
  port.onDisconnect.addListener(function () {
    port.onMessage.removeListener(devToolsListener);
  });
});

function issueRefresh(port) {
  port.postMessage({
    action: "refresh"
  });
}

function getAll(port, message) {
  chrome.tabs.get(message.tabId, function (tab) {
    let url = tab.url;
    console.log("Looking for cookies on: " + url);
    chrome.cookies.getAll({
      url: url
    }, function (cks) {
      console.log("I have " + cks.length + " cookies");
      port.postMessage({
        action: "getall",
        url: url,
        cks: cks
      });
    });
  });
}
