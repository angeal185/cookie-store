let currentTabID,
isTabIncognito = false,
cookieList = [],
newCookie = false,
pasteCookie = false,
currentLayout = "none",
lastInput = "";

buildTpl()
buildMain()
buildNewTbl()
//buildAlertTpl()
$.fx.speeds._default = 200;

function start() {
  setLoaderVisible(true);

  let arguments = getUrlVars();
  if (_.isUndefined(arguments.url)) {
    chrome.tabs.query(
        {
            active: true,
            lastFocusedWindow: true
        },
        function (tabs) {
          try {
            let currentTabURL = tabs[0].url;
            currentTabID = tabs[0].id;
            $('input', '#cookieSearchCondition').val(currentTabURL);
            document.title = document.title + "-" + currentTabURL;
            doSearch(false);
          } catch(e){
            if (e){ console.log(e)}
          }
        }
    );
  } else {
    let url = decodeURI(arguments.url);
    currentTabID = parseInt(decodeURI(arguments.id));
    isTabIncognito = decodeURI(arguments.incognito) === "true";
    $('input', '#cookieSearchCondition').val(url);
    document.title = document.title + "-" + url;
    doSearch(true);
  }
}

function getUrlOfCookies() {
    return $('input', '#cookieSearchCondition').val();
}

function doSearch(isSeparateWindow) {
  let url = $('input', '#cookieSearchCondition').val();
  if (url.length < 3){
    return;
  }
  var filter = new Filter();
  if (/^https?:\/\/.+$/.test(url)) {
      filter.setUrl(url);
  } else {
      filter.setDomain(url);
  }
  createList(filter.getFilter(), isSeparateWindow);
}

function submit(currentTabID) {
  if (newCookie){
    submitNew(currentTabID);
  } else if (pasteCookie){
    importCookies();
  } else {
    submitAll(currentTabID);
  }
}

function submitAll(currentTabID) {
  let cookies = $(".cookie", "#cookiesList"),
  nCookiesToUpdate = cookies.length;

  var onUpdateComplete = function () {
      data.nCookiesChanged += cookies.length;
      if (preferences.refreshAfterSubmit) {
          chrome.tabs.reload(currentTabID, { 'bypassCache': preferences.skipCacheRefresh });
      }
      doSearch();
  };

  cookies.each(function () {
      let cCookie = formCookieData($(this));
      if (_.isUndefined(cCookie)) {
        return;
      }
      deleteCookie(cCookie.url, cCookie.name, cCookie.storeId, function () {
        chrome.cookies.set(cCookie, function () {
          if (--nCookiesToUpdate === 0) {
            onUpdateComplete();
          }
        });
      });
  });
}

function submitNew() {
  let cCookie = formCookieData($("#newCookie"));
  if (_.isUndefined(cCookie)){
    return;
  }
  chrome.cookies.getAllCookieStores(function (cookieStores) {
    //console.log(cookieStores)
    for (let x = 0; x < cookieStores.length; x++) {
      if (!_.eq(cookieStores[x].tabIds.indexOf(currentTabID), -1)) {
        cCookie.storeId = cookieStores[x].id;
        break;
      }
    }

    deleteCookie(cCookie.url, cCookie.name, cCookie.storeId, function () {
      chrome.cookies.set(cCookie, doSearch);
      ++data.nCookiesCreated;
    });
  });
}

function createList(filters, isSeparateWindow) {
  let filteredCookies = [],
  filterURL = {};

  if (_.isNull(filters)){
    filters = {};
  }
  if (!_.isUndefined(filters.url)){
    filterURL.url = filters.url;
  }
  if (!_.isUndefined(filters.domain)){
    filterURL.domain = filters.domain;
  }
  if (!isSeparateWindow) {
    $('#submitDiv').css({
      'bottom': 0
    });
  } else {
    $('#submitDiv').addClass("submitDivSepWindow");
  }

  chrome.cookies.getAllCookieStores(function (cookieStores) {
    for (let x = 0; x < cookieStores.length; x++) {
      if (!_.eq(cookieStores[x].tabIds.indexOf(currentTabID), -1)) {
        filterURL.storeId = cookieStores[x].id;
        break;
      }
    }

    chrome.cookies.getAll(filterURL, function (cks) {
      let currentC;
      for (var i = 0; i < cks.length; i++) {
        currentC = cks[i];

        if (!_.isUndefined(filters.name) && _.eq(currentC.name.toLowerCase().indexOf(filters.name.toLowerCase()), -1)){
          continue;
        }
        if (!_.isUndefined(filters.domain) && _.eq(currentC.domain.toLowerCase().indexOf(filters.domain.toLowerCase()), -1)){
          continue;
        }
        if (!_.isUndefined(filters.secure) && _.eq(currentC.secure.toLowerCase().indexOf(filters.secure.toLowerCase()), -1)){
          continue;
        }
        if (!_.isUndefined(filters.session) && _.eq(currentC.session.toLowerCase().indexOf(filters.session.toLowerCase()), -1)){
          continue;
        }

        for (var x = 0; x < data.readOnly.length; x++) {
          try {
            let lock = data.readOnly[x];
            if (_.eq(lock.name, currentC.name) && _.eq(lock.domain, currentC.domain)) {
              currentC.isProtected = true;
              break;
            }
          } catch (e) {
            console.error(e.message);
            delete data.readOnly[x];
          }
        }
        filteredCookies.push(currentC);
      }
      cookieList = filteredCookies;

      $("#cookiesList").empty();

      if (_.eq(cookieList.length,0)) {
        swithLayout();
        setEvents();
        setLoaderVisible(false);
        return;
      }

      cookieList.sort(function (a, b) {
        if (_.eq(preferences.sortCookiesType, "domain_alpha")) {
          let compDomain = a.domain.toLowerCase().localeCompare(b.domain.toLowerCase());
          if (compDomain){
            return compDomain;
          }
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      });

      createAccordionList(cookieList, function () {
        swithLayout();
        setEvents();
        setLoaderVisible(false);
      });
    });
  });
}

function createAccordionList(cks, callback, callbackArguments) {
  let createAccordionCallback = callback,
  createAccordionCallbackArguments = callbackArguments;

  if (_.isNull(cks)){
    cks = cookieList;
  }
  for (var i = 0; i < cks.length; i++) {
    let domainText = "",
    titleText;

    currentC = cks[i];

    if (preferences.showDomain) {
      domainText = currentC.domain;
      if (preferences.showDomainBeforeName) {
        domainText = domainText + " | ";
      } else {
        domainText = " | " + domainText;
      }
    }

    if (preferences.showDomainBeforeName) {
      titleText = $("<p/>").text(domainText).append($("<b/>").text(currentC.name));
      if (currentC.isProtected){
        $(":first-child", titleText).css("color", "green");
      }
    } else {
      titleText = $("<p/>").append($("<b/>").text(currentC.name)).append($("<span/>").text(domainText));
    }

    let titleElement = $("<div/>").addClass('collapsible-header').append($("<a/>").html(titleText.html()).attr("href", "#")),
    itemLength = $('#cookiesList .cookie').length;

    try{
      $("#cookiesList").append($('<li />').append(titleElement));
      buildCDT(itemLength, 'cck' + itemLength)
    } catch(e){
      if (e) { return console.log(e) }
    } finally {
      let cookie = $('.cck' + itemLength),
      expDate;

      cookie.find(".index").val(i);
      cookie.find(".name").val(currentC.name);
      cookie.find(".value").val(currentC.value);
      cookie.find(".domain").val(currentC.domain);
      cookie.find(".path").val(currentC.path);
      cookie.find(".storeId").val(currentC.storeId);
      cookie.find(".sameSite").val(currentC.sameSite);

      if (currentC.isProtected){
        cookie.find(".unprotected").hide();
      } else {
        cookie.find(".protected").hide();
      }

      if (currentC.hostOnly) {
        cookie.find(".domain").attr("disabled", "disabled");
        cookie.find(".hostOnly").prop("checked", true);
      }
      if (currentC.secure) {
        cookie.find(".secure").prop("checked", true);
      }
      if (currentC.httpOnly) {
        cookie.find(".httpOnly").prop("checked", true);
      }
      if (currentC.session) {
        cookie.find(".expiration").attr("disabled", "disabled");
        cookie.find(".session").prop("checked", true);
      }

      if (currentC.session) {
        expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 1);
      } else {
        expDate = new Date(currentC.expirationDate * 1000.0);
      }
      cookie.find('.expiration').val(expDate);
    }
  }

  if (!_.isUndefined(createAccordionCallback)) {
    createAccordionCallback(createAccordionCallbackArguments);
  }
}

buildCDT()

function importCookies() {
  let nCookiesImportedThisTime = 0,
  text = $(".value", "#pasteCookie").val(),
  error = $(".error", "#pasteCookie");
  error.hide();
  error.text("For format reference export cookies in JSON");

  try {
    let cookieArray = $.parseJSON(text);
    if (_.eq(Object.prototype.toString.apply(cookieArray), "[object Object]")){
      cookieArray = [cookieArray];
    }

    for (var i = 0; i < cookieArray.length; i++) {
      try {
        let cJSON = cookieArray[i],
        cookie = cookieForCreationFromFullCookie(cJSON);
        chrome.cookies.set(cookie);
        nCookiesImportedThisTime++;
      } catch (e) {
        error.html(error.html() + "<br>" + $('<div/>').text("Cookie number " + i).html() + "<br>" + $('<div/>').text(e.message).html());
        console.error(e.message);
        error.fadeIn();
        return;
      }
    }
  } catch (e) {
    error.html(error.html() + "<br>" + $('<div/>').text(e.message).html());
    console.error(e.message);
    error.fadeIn();
    return;
  }

  data.nCookiesImported += nCookiesImportedThisTime;
  doSearch();
  return;
}

function setEvents() {
    $("#submitButton:first-child").off().on('click', function() {
      submit(currentTabID);
    });
    if (cookieList.length > 0) {
      $("#submitDiv").show();
    }

    $("#submitFiltersDiv").off().on('click', function() {
      let domainChecked = $(".filterDomain:checked", $(this).parent()).val() !== undefined,
      domain = $("#filterByDomain", $(this).parent()).val(),
      nameChecked = $(".filterName:checked", $(this).parent()).val() !== undefined,
      name = $("#filterByName", $(this).parent()).val(),
      valueChecked = $(".filterValue:checked", $(this).parent()).val() !== undefined,
      value = $("#filterByValue", $(this).parent()).val();

      let newRule = {};
      if (domainChecked){
        newRule.domain = domain;
      }
      if (nameChecked){
        newRule.name = name;
      }
      if (valueChecked){
        newRule.value = value;
      }

      for (var i = 0; i < cookieList.length; i++) {
        let currentCookie = cookieList[i];
        if (currentCookie.isProtected){
          continue;
        }
        if (!filterMatchesCookie(newRule, currentCookie.name, currentCookie.domain, currentCookie.value)){
          continue;
        }
        let url = buildUrl(currentCookie.domain, currentCookie.path, getUrlOfCookies());
        deleteCookie(url, currentCookie.name, currentCookie.storeId);
      }
      data.nCookiesFlagged += cookieList.length;
      let exists = addBlockRule(newRule);
      doSearch();
      return;
    });

    $("#deleteAllButton").off().on('click', function() {
      if (_.eq(cookieList.length, 0)){
        return false;
      }
      var okFunction = function () {
        nCookiesDeletedThisTime = cookieList.length;
        deleteAll(cookieList, getUrlOfCookies());
        data.nCookiesDeleted += nCookiesDeletedThisTime;
        doSearch();
      }
      startAlertDialog("delete all", okFunction);
    });

    if (preferences.showCommandsLabels) {
      $(".commands-row", ".commands-table").addClass("commands-row-texy");
    }

    if (preferences.showFlagAndDeleteAll) {
      $("#flagAllButton").show();
      $("#flagAllButton").off().on('click', function() {
        if (_.eq(cookieList.length,0)){
          return false;
        }

        var okFunction = function () {
          nCookiesFlaggedThisTime = cookieList.length;
          for (var i = 0; i < cookieList.length; i++) {
            let currentCookie = cookieList[i];
            if (currentCookie.isProtected){
              continue;
            }
            let newRule = {};
            newRule.domain = currentCookie.domain;
            newRule.name = currentCookie.name;
            addBlockRule(newRule);
            let url = buildUrl(currentCookie.domain, currentCookie.path, getUrlOfCookies());
            deleteCookie(url, currentCookie.name, currentCookie.storeId);
          }
          data.nCookiesFlagged += nCookiesFlaggedThisTime;
          doSearch();
          return;
        }
        startAlertDialog("Flag all", okFunction);
      });
    } else {
      $("#flagAllButton").hide();
    }

    $("#refreshButton").off().on('click', function() {
      if (_.eq(currentLayout, "new")) {
        clearNewCookieData();
      } else {
        location.reload(true);
      }
    });

    $("#addCookieButton").off().on('click', function() {
      newCookie = true;
      pasteCookie = false;
      swithLayout("new");
    });

    $("#backToList").off().on('click', function() {
      newCookie = false;
      pasteCookie = false;
      swithLayout();
    });

    $("#optionsButton").off().on('click', function() {
      let urlToOpen = chrome.extension.getURL('options.html');
      chrome.tabs.create({
        url: urlToOpen
      });
    });

    $("#copyButton").off().on('click', function() {
      copyToClipboard(cookiesToString.get(cookieList));
      data.nCookiesExported += cookieList.length;
      $("#copiedToast").fadeIn(function () {
        setTimeout(function () {
          $("#copiedToast").fadeOut();
        }, 2500);
      });
      $(this).animate({ backgroundColor: "#B3FFBD" }, 300, function () {
        $(this).animate({ backgroundColor: "#EDEDED" }, 500);
      });
    });

    $("#pasteButton").off().on('click', function() {
        newCookie = false;
        pasteCookie = true;
        swithLayout("paste");
    });

    $("#searchButton").off().on('click', function() {
      $("#searchField").fadeIn("fast", function () {
        $("#searchField").focus();
      });
    });

    $("#searchBox").off().on('focusout', function() {
        $("#searchField").fadeOut();
    });

    $("#searchField").off().on('keyup', function() {
      find($(this).val());
    });
    $('input', '#cookieSearchCondition').off().on('keyup', doSearch);
    clearNewCookieData();

    $(".toast").each(function () {
      $(this).css("margin-top", "-" + ($(this).height() / 2) + "px");
      $(this).css("margin-left", "-" + ($(this).width() / 2) + "px");
    });

    $('textarea.value, input.domain, input.path').keydown(function (event) {
      if (event.ctrlKey && event.keyCode === 13) {
        submit(currentTabID);
        console.log('trigger save (submit)');
        event.preventDefault();
        event.stopPropagation();
      }
    });

    setCookieEvents();
}

function setCookieEvents() {
  $(".hostOnly").click(function () {
    let cookie = $(this).closest(".cookie"),
    checked = $(this).prop("checked");
    if (!!checked){
      $(".domain", cookie).attr("disabled", "disabled");
    } else {
      $(".domain", cookie).removeAttr("disabled");
    }
  });

  $(".session").click(function () {
    let cookie = $(this).closest(".cookie"),
    checked = $(this).prop("checked");
    if (!!checked){
      $(".expiration", cookie).attr("disabled", "disabled");
    } else{
      $(".expiration", cookie).removeAttr("disabled");
    }
  });

  $(".deleteOne").click(function () {
    let cookie = $(this).closest(".cookie"),
    name = $(".name", cookie).val(),
    domain = $(".domain", cookie).val(),
    path = $(".path", cookie).val(),
    secure = $(".secure", cookie).prop("checked"),
    storeId = $(".storeId", cookie).val();
    var okFunction = function () {
      let url = buildUrl(domain, path, getUrlOfCookies());
      deleteCookie(url, name, storeId, function (success) {
        if (_.eq(success, true)){
            let head = cookie.prev('div.collapsible-header');
            cookie.add(head).slideUp(function () {
              $(this).remove();
              swithLayout();
            });
          } else {
            location.reload(true);
          }
        });
        ++data.nCookiesDeleted;
      };
      startAlertDialog("delete cookie" + ": \"" + name + "\"?", okFunction)
  });
  $(".flagOne").click(function () {
    let cookie = $(this).closest(".cookie"),
    domain = $(".domain", cookie).val(),
    name = $(".name", cookie).val(),
    value = $(".value", cookie).val();

    $("#filterByDomain", "#cookieFilter").val(domain);
    $("#filterByName", "#cookieFilter").val(name);
    $("#filterByValue", "#cookieFilter").val(value);

    swithLayout("flag");
  });

  $(".protectOne").click(function () {
    let cookie = $(this).closest(".cookie"),
    titleName = $("b", cookie.prev()).first(),
    index = $(".index", cookie).val(),
    isProtected = switchReadOnlyRule(cookieList[index]);

    cookieList[index].isProtected = isProtected;
    if (isProtected) {
      $(".unprotected", cookie).fadeOut('fast', function () {
        $(".protected", cookie).fadeIn('fast');
      });
      titleName.css("color", "green");
    } else {
      $(".protected", cookie).fadeOut('fast', function () {
        $(".unprotected", cookie).fadeIn('fast');
      });
      titleName.css("color", "#000");
    }
  });
}

function startAlertDialog(title, ok_callback, cancel_callback) {
    if (_.isUndefined(ok_callback)) {
        return
    }
    if (!preferences.showAlerts) {
        ok_callback();
        return;
    }

    $("#alert_ok").off().on('click', function() {
        $("#alert_wrapper").hide();
        ok_callback();
    });

    if (!_.isUndefined(cancel_callback)) {
        $("#alert_cancel").show();
        $("#alert_cancel").off().on('click', function() {
            $("#alert_wrapper").hide('fade');
            cancel_callback();
        });
    } else {
        $("#alert_cancel").hide();
    }
    $("#alert_title_p").empty().text(title);
    $("#alert_wrapper").show('fade');
}

function clearNewCookieData() {
  let cookieForm = $("#newCookie"),
  expDate = new Date();
  expDate.setFullYear(expDate.getFullYear() + 1);
  $(".index, .name, .value", cookieForm).val("");
  $(".domain", cookieForm).val(getHost(getUrlOfCookies()));
  $(".path", cookieForm).val("/");
  $(".hostOnly, .secure, .httpOnly, .session", cookieForm).prop("checked", false);
  $(".expiration", cookieForm).val(expDate);
}

function find(pattern) {
  if (_.eq(pattern, lastInput)){
    return;
  }
  lastInput = pattern;
  $($(".cookie", "#cookiesList").get().reverse()).each(function () {
    let name = $(".name", $(this)).val(),
    node = $(this),
    h3 = $(this).prev();
    if (!_.eq(pattern, "") && !_.eq(name.toLowerCase().indexOf(pattern.toLowerCase()), -1)) {
      h3.addClass("searchResult");
      node.detach();
      h3.detach();
      $("#cookiesList").prepend(node);
      $("#cookiesList").prepend(h3);
    } else {
      h3.removeClass("searchResult");
    }
  });
}

function swithLayout(newLayout) {
  if (_.isUndefined(newLayout)) {
    if ($("div", "#cookiesList").length) {
      newLayout = "list";
    } else {
      newLayout = "empty";
    }
  }

  if (_.eq(currentLayout, newLayout)){
    return;
  }
  currentLayout = newLayout;

  if (_.eq(newLayout, "list") || _.eq(newLayout, "empty")) {
    $("#newCookie, #pasteCookie, #cookieFilter, #submitFiltersButton").slideUp();
  }

  if (_.eq(newLayout,"list")) {
    $(".commands-table").first().animate({ opacity: 0 }, function () {
      $("#backToList").hide();
      $(".commands-table").first().animate({ opacity: 1 });
      $("#deleteAllButton, #addCookieButton, #copyButton, #pasteButton, #searchButton, #cookieSearchCondition").show();
      if (preferences.showFlagAndDeleteAll){
        $("#flagAllButton").show();
      }
    });
    $("#noCookies").slideUp();
    $("#cookiesList").slideDown();
    $("#submitDiv").show();
  } else if (_.eq(newLayout,"empty")) {
    $(".commands-table").first().animate({ opacity: 0 }, function () {
      $("#deleteAllButton, #flagAllButton, #backToList, #copyButton, #searchButton").hide();
      $(".commands-table").first().animate({ opacity: 1 });
      $("#pasteButton, addCookieButton, #cookieSearchCondition").show();
    });
    $(".notOnEmpty, #submitDiv").hide();
    $("#noCookies").slideDown();
    $("#cookiesList").slideUp();
  } else {
    $(".commands-table").first().animate({ opacity: 0 }, function () {
      $("#deleteAllButton, #flagAllButton, #addCookieButton, #copyButton, #pasteButton, #searchButton").hide();
      $("#backToList").show();
      $(".commands-table").first().animate({ opacity: 1 });
    });

    $("#noCookies, #cookiesList, #cookieSearchCondition").slideUp();

    if (_.eq(newLayout,"flag")) {
      $("#submitFiltersButton, #cookieFilter").slideDown();
      $("#newCookie, #pasteCookie, #submitDiv").slideUp();
    } else if (_.eq(newLayout, "paste")) {
      $("#pasteCookie, #submitDiv").slideDown();
      $("#newCookie, #cookieFilter, #submitFiltersButton").slideUp();
      $(".value", "#new").focus();
    } else if (_.eq(newLayout, "new")) {
      $("#newCookie, #submitDiv").slideDown();
      $("#pasteCookie, #cookieFilter, #submitFiltersButton").slideUp();
      $('#newCookie input.name').focus();
    }
  }
}

function formCookieData(form) {
  let index = $(".index", form).val(),
  name = $(".name", form).val(),
  value = $(".value", form).val(),
  domain = $(".domain", form).val(),
  hostOnly = $(".hostOnly", form).prop("checked"),
  path = $(".path", form).val(),
  secure = $(".secure", form).prop("checked"),
  httpOnly = $(".httpOnly", form).prop("checked"),
  session = $(".session", form).prop("checked"),
  storeId = $(".storeId", form).val(),
  expiration = $(".expiration", form).val(),
  sameSite = $(".sameSite", form).val();

  let newCookie = {};
  newCookie.url = buildUrl(domain, path, getUrlOfCookies());
  newCookie.name = name.replace(";", "").replace(",", "");
  value = value.replace(";", "");
  newCookie.value = value;
  newCookie.path = path;
  newCookie.storeId = storeId;
  if (!hostOnly){
    newCookie.domain = domain;
  }
  if (!session) {
    let expirationDate = new Date(expiration).getTime() / 1000;
    newCookie.expirationDate = expirationDate;

    // If the expiration date is not valid, tell the user by making the
    // invalid date red and showing it in the accordion
    if (isNaN(expirationDate)) {
      console.log("Invalid date");
      $(".expiration", form).addClass("error");
      $(".expiration", form).focus();
      if (!_.isUndefined(index)) {
        // This is an existing cookie, not a new one
        //$("#cookiesList").accordion("option", "active", parseInt(index));
      }
      return undefined;
    } else {
      $(".expiration", form).removeClass("error");
    }
  }
  newCookie.secure = secure;
  newCookie.httpOnly = httpOnly;
  newCookie.sameSite = sameSite;

  return newCookie;
}

$(document).ready(function () {
  let body = $('body').css('display', 'none');
  ++data.nPopupClicked;
  start();
  setTimeout(() => {
      body.css('display', '');
  }, 100);
  $('.collapsible').collapsible();
});
