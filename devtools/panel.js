let tabURL,
cookieList = [];

var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
  if (message.action === "getall") {
    createTable(message);
  }
});

function start() {
  var arguments = getUrlVars();
  if (!_.isUndefined(arguments.url)) {
    createList("https://google.com");
    return;
  }
  var tabId = chrome.devtools.inspectedWindow.tabId;
  backgroundPageConnection.postMessage({
    action: "getall",
    tabId: tabId
  });
}

function createList(url) {
    tabURL = url;
    chrome.cookies.getAll({
        url: tabURL
    }, function (cks) {
        createTable({
            url: tabURL,
            cks: cks
        });
    });
}

function createTable(message) {
  let tblTpl = _.template('<div id="rl" class="fa fa-refresh"></div><div id="main"><table id="cookieTable" class="striped responsive-table"><thead><tr></tr></thead><tbody></tbody></table></div>'),
  tr = [
    "ID",
    "Name",
    "Value",
    "Domain",
    "Path",
    "Expires",
    "Session",
    "HostOnly",
    "Secure",
    "HttpOnly",
    "SameSite",
    "StoreId"
  ]
  $('body').prepend(tblTpl)
  _.forEach(tr,function(x){
    $('#cookieTable > thead > tr').append('<th>'+ x +'</th>')
  })

  tabURL = message.url;
  cookieList = message.cks;

  $tableBody = $("#cookieTable > tbody");
  $tableBody.empty();

  for (var i = 0; i < cookieList.length; i++) {
    currentC = cookieList[i];

    var domainDisabled = (currentC.hostOnly) ? "disabled" : "";
    var expirationDisabled = (currentC.session) ? "disabled" : "";
    if (currentC.session) {
        expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 1);
    } else {
        expDate = new Date(currentC.expirationDate * 1000.0);
    }
    let td = [
      i,
      currentC.name,
      currentC.value,
      currentC.domain,
      currentC.path,
      expDate,
      currentC.session,
      currentC.hostOnly,
      currentC.secure,
      currentC.httpOnly,
      currentC.sameSite,
      currentC.storeId
    ]

    $row = $("<tr/>");
    _.forEach(td,function(x){
      $row.append($("<td/>").text(x));
    })
    $tableBody.append($row);
  }

  $('#rl').off().on('click', function(event) {
    location.reload(true);
  });
}

$(document).ready(function () {
  start();
});
