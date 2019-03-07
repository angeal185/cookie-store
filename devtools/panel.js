var tabURL;
var cookieList = [];

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
    if (message.action === "getall") {
        createTable(message);
    } else if (message.action === "refresh") {
        location.reload(true);
    }
});

$(document).ready(function () {
    ++data.nPanelClicked;
    start();
});

function start() {
    var arguments = getUrlVars();
    if (arguments.url !== undefined) {//TESTING PURPOSES
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
    tabURL = message.url;
    cookieList = message.cks;

    $tableBody = $("#cookieTable > tbody");
    $tableBody.empty();

    for (var i = 0; i < cookieList.length; i++) {
        currentC = cookieList[i];

        var domainDisabled = (currentC.hostOnly) ? "disabled" : "";
        var expirationDisabled = (currentC.session) ? "disabled" : "";

        $row = $("<tr/>");
        $row.append($("<td/>").addClass("hiddenColumn").text(i));
        $row.append($("<td/>").text(currentC.name));
        $row.append($("<td/>").text(currentC.value));
        $row.append($("<td/>").addClass("domain " + domainDisabled).text(currentC.domain));
        $row.append($("<td/>").text(currentC.path));

        if (currentC.session) {
            expDate = new Date();
            expDate.setFullYear(expDate.getFullYear() + 1);
        } else {
            expDate = new Date(currentC.expirationDate * 1000.0);
        }
        $row.append($("<td/>").addClass("expiration " + expirationDisabled).text(expDate));

        $row.append($("<td/>").text(currentC.session));
        $row.append($("<td/>").text(currentC.hostOnly));
        $row.append($("<td/>").text(currentC.secure));
        $row.append($("<td/>").text(currentC.httpOnly));
        $row.append($("<td/>").text(currentC.sameSite));
        $row.append($("<td/>").addClass("hiddenColumn").text(currentC.name));
        $row.append($("<td/>").addClass("hiddenColumn").text(currentC.storeId));
        $tableBody.append($row);
    }
    setEvents();
}

function setEvents() {
  $(".sessionCB").click(function () {
      var checked = $(this).prop("checked");
      var $domain = $(".expiration", $(this).parent().parent()).first();
      if (!!checked){
          $domain.addClass("disabled");
      } else {
        $domain.removeClass("disabled");
      }
  });

  $(".hostOnlyCB").click(function () {
      var checked = $(this).prop("checked");
      var $domain = $(".domain", $(this).parent().parent()).first();
      if (!!checked){
          $domain.addClass("disabled");
      } else {
        $domain.removeClass("disabled");
      }
  });
}
