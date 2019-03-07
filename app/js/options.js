buildOptNav()


let defaultOps = {
  exportName: 'backup'
}
if(!localStorage.getItem('exportName') || _.eq(localStorage.getItem('exportName'),'')){
  localStorage.setItem('exportName', defaultOps.exportName)
}

function initOptions(){

  updateCallback = function () {
      setOptions();
  };

  function setOptions() {
      //$("#saveMaxDateButton").button().hide();
      $(':checkbox', '#options-box').removeAttr('checked');
      $("#justDelete").prop('checked', preferences.justDelete);
      $("#showAlerts").prop('checked', preferences.showAlerts);
      $("#showDomain").prop('checked', preferences.showDomain);
      $("#showContextMenu").prop('checked', preferences.showContextMenu);
      $("#showFlagAndDeleteAll").prop('checked', preferences.showFlagAndDeleteAll);
      $("#showCommandsLabels").prop('checked', preferences.showCommandsLabels);
      $("#showAnimate").prop('checked', preferences.showAnimate);


      $("#refreshAfterSubmit").prop('checked', preferences.refreshAfterSubmit);
      $("#skipCacheRefresh").prop('checked', preferences.skipCacheRefresh);
      $("#skipCacheRefresh").prop("disabled", !preferences.refreshAfterSubmit);
      $("#useMaxDate").prop('checked', preferences.useMaxCookieAge);
      $("#maxDate").prop("disabled", !preferences.useMaxCookieAge);
      if (!preferences.useMaxCookieAge) {
          $("#maxDateType").fadeOut();
          //$("#saveMaxDateButton").button("disable");
      } else {
          $("#maxDateType").fadeIn();
          //$("#saveMaxDateButton").button("enable");
      }
      $("#maxDate").val(preferences.maxCookieAge);
      $("input:radio", ".radioMaxDate").prop('checked', false);
      $("input:radio[value='" + preferences.maxCookieAgeType + "']").prop('checked', true);
      //$("#maxDateType").buttonset("refresh");

      $("option[value='" + preferences.copyCookiesType + "']").prop("selected", true);
      $("#showDomainBeforeName").prop('checked', preferences.showDomainBeforeName);
      $("#showDomainBeforeName").prop("disabled", !preferences.showDomain);
      $("option[value='" + preferences.sortCookiesType + "']").prop("selected", true);
      $("#showDevToolsPanel").prop('checked', preferences.showDevToolsPanel);

  }

  //Set Events
  function setEvents() {
      $("#showAlerts").off().on('click', function(){
          preferences.showAlerts = $('#showAlerts').prop("checked");
      });
      $("#showDomain").off().on('click', function(){
          preferences.showDomain = $('#showDomain').prop("checked");
          $("#showDomainBeforeName").prop("disabled", !preferences.showDomain);
      });
      $("#refreshAfterSubmit").off().on('click', function(){
          preferences.refreshAfterSubmit = $('#refreshAfterSubmit').prop("checked");
          $("#skipCacheRefresh").prop("disabled", !preferences.refreshAfterSubmit);
      });
      $("#skipCacheRefresh").off().on('click', function(){
          preferences.skipCacheRefresh = $('#skipCacheRefresh').prop("checked");
      });
      $("#encodeCookieValue").off().on('click', function(){
          preferences.encodeCookieValue = $('#encodeCookieValue').prop("checked");
      });
      $("#showContextMenu").off().on('click', function(){
          preferences.showContextMenu = $('#showContextMenu').prop("checked");
      });
      $("#showFlagAndDeleteAll").off().on('click', function(){
          preferences.showFlagAndDeleteAll = $('#showFlagAndDeleteAll').prop("checked");
      });
      $("#showCommandsLabels").off().on('click', function(){
          preferences.showCommandsLabels = $('#showCommandsLabels').prop("checked");
      });
      $("#showAnimate").off().on('click', function(){
          preferences.showAnimate = $('#showAnimate').prop("checked");
      });

      $("#useMaxDate").off().on('click', function(){
          updateMaxDate();
      });

      $("#maxDate").keydown(function (e) {
          var keyPressed;
          if (!e) var e = window.event;
          if (e.keyCode) keyPressed = e.keyCode;
          else if (e.which) keyPressed = e.which;
          if (keyPressed == 46 || keyPressed == 8 || keyPressed == 9 || keyPressed == 27 || keyPressed == 13 ||
              // Allow: Ctrl+A
              (keyPressed == 65 && e.ctrlKey === true) ||
              // Allow: home, end, left, right
              (keyPressed >= 35 && keyPressed <= 39)) {
              // let it happen, don't do anything
              return;
          }
          else {
              // Ensure that it is a number and stop the keypress
              if (e.shiftKey || (keyPressed < 48 || keyPressed > 57) && (keyPressed < 96 || keyPressed > 105)) {
                  e.preventDefault();
              }
          }
      });
      $("#maxDate").off().on("keyup blur", function(e) {
          $("#saveMaxDateButton:hidden").fadeIn();
      });

      $("#saveMaxDateButton").off().on('click',function(e) {
          $("#saveMaxDateButton").fadeOut(function () {
              $("#shortenProgress").fadeIn(function () {
                  updateMaxDate(true);
              });
          });
      });

      $("#copyCookiesType").off().on('change', function(){
          preferences.copyCookiesType = $("#copyCookiesType").val();
      });

      $("#showDomainBeforeName").off().on('click', function(){
          preferences.showDomainBeforeName = $('#showDomainBeforeName').prop("checked");
      });

      $("#sortCookiesType").off().on('change', function(){
          preferences.sortCookiesType = $("#sortCookiesType").val();
      });

      $("#showDevToolsPanel").off().on('change', function(){
          preferences.showDevToolsPanel = $('#showDevToolsPanel').prop("checked");
      });
  }

  var totalCookies;
  var cookiesShortened;
  function updateMaxDate(filterAllCookies) {
      var tmp_useMaxCookieAge = $('#useMaxDate').prop("checked");

      $("#useMaxDate").prop('checked', tmp_useMaxCookieAge);
      $("#maxDate").prop("disabled", !tmp_useMaxCookieAge);

      if (!tmp_useMaxCookieAge) {
          $("#maxDateType").fadeOut();
          $("#saveMaxDateButton").fadeOut();
          $("#saveMaxDateButton:visible").fadeOut();
      } else {
          $("#maxDateType").fadeIn();
          //$("#saveMaxDateButton").button("enable");
          if (!filterAllCookies)
              $("#saveMaxDateButton:hidden").fadeIn();
      }

      if (!tmp_useMaxCookieAge || filterAllCookies)
          preferences.useMaxCookieAge = tmp_useMaxCookieAge;

      if (filterAllCookies == undefined || filterAllCookies == false)
          return;

      preferences.maxCookieAgeType = $("input:radio[name='radioMaxDate']:checked").val();

      tmp_maxCookieAge = parseInt($("#maxDate").val());
      if (!(typeof tmp_maxCookieAge === 'number' && tmp_maxCookieAge % 1 == 0)) {
          $("#maxDate").val(1);
          tmp_maxCookieAge = 1;
      }
      preferences.maxCookieAge = tmp_maxCookieAge;

      chrome.cookies.getAll({}, function (cookies) {
          totalCookies = cookies.length;
          cookiesShortened = 0;
          $("span", "#shortenProgress").text("0 / " + totalCookies);
          shortenCookies(cookies, setOptions);
      });
  }
  function shortenCookies(cookies, callback) {
      if (cookies.length <= 0) {
          data.nCookiesShortened += cookiesShortened;
          $("#shortenProgress").fadeOut(function () {
              if (callback != undefined)
                  callback();
          });
          return;
      }
      $("span", "#shortenProgress").text((totalCookies - cookies.length) + " / " + totalCookies);
      var cookie = cookies.pop();
      var maxAllowedExpiration = Math.round((new Date).getTime() / 1000) + (preferences.maxCookieAge * preferences.maxCookieAgeType);
      if (cookie.expirationDate != undefined && cookie.expirationDate > maxAllowedExpiration) {
          console.log("Shortening life of cookie '" + cookie.name + "' from '" + cookie.expirationDate + "' to '" + maxAllowedExpiration + "'");
          var newCookie = cookieForCreationFromFullCookie(cookie);
          if (!cookie.session)
              newCookie.expirationDate = maxAllowedExpiration;
          chrome.cookies.set(newCookie, function () {
              shortenCookies(cookies, callback)
          });
          cookiesShortened++;
      } else
          shortenCookies(cookies, callback);
  }

  setOptions();
  setEvents();

}

/* readonly */

function initReadonly(){

  buildReadonly()

  var forceHideOperations = false;

  updateCallback = function () {
      location.reload(true);
      return;

      setReadOnlyRules();
      setEvents();
  };

  function setEvents() {
      $('.cmd_delete').off().on('click', function() {
        let index = $('.active').attr("index");
        if (!_.isUndefined(index)){
          if (!data.showAlerts || confirm("delete rule " + "?")) {
              hideEditCommands();
              let index = $('.active').attr("index");
              forceHideOperations = true;
              $('.operations:visible').clearQueue();
              $('.operations:visible').addClass('hidden');
              $('.active').fadeOut(function () {
                  forceHideOperations = false;
                  deleteReadOnlyRule(index);
                  location.reload(true);
                  return;
              });
          }
        } else {
          alert('no item selected!')
        }
      });

      $('.data_row').off().on('click', function() {
          $('.active').removeClass('active');
          $(this).addClass('active');
          $('.operations').clearQueue().removeClass('hidden');
      });

      $('.viewItem').off().on('mouseover', function() {
          let item = {
            domain: $(this).siblings('.domain_field').text(),
            name: $(this).siblings('.name_field').text(),
            value: $(this).siblings('.value_field').text()
          },
          data = JSON.parse(localStorage.getItem('data_readOnly'));
          console.log(_.filter(data, item)[0])
          //console.log(item)
      });

  }


  function setReadOnlyRules() {
      $('.table_row:not(.header)', '.table').detach();

      if (data.readOnly.length == 0) {
          $(".table").append(lineTpl({
            ID:'empty',
            DF:'No cookies protected yet',
            NF:'',
            VF:'',
            IDX:''
          }))
          return;
      }


      //deleteReadOnlyRule(0)
      console.log(data.readOnly)

      for (var i = 0; i < data.readOnly.length; i++) {
          try {
              let rule = data.readOnly[i],
              domain = (rule.domain != undefined) ? rule.domain : "any",
              name = (rule.name != undefined) ? rule.name : "any",
              value = (rule.value != undefined) ? rule.value : "any";
              addRuleLine(domain, name, value, i);

          } catch (e) {
              console.error(e.message);
          }
      }
  }

  function hideEditCommands() {
      newRowVisible = false;
      $(".new_rule_operations").addClass('hidden');
      $(".new_row").fadeOut().detach();
  }

  function buildReadEditor(){
    $('.modal').modal();
    $('#mdlBody').append(
      div.clone().attr({id:'readEditor'}),
      minmaxTpl({ID1: 'min',ID2: 'max'})
    )

    _.forEach(['save','encrypt'],function(i){
      $('#mdlFooter').prepend('<a href="#!" id="'+ i +'Item" class="waves-effect btn-flat">'+ _.capitalize(i) +'</a>')
    })

    initReadEditor()
  }

  function initReadEditor(){
    let editor = ace.edit("readEditor");
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode("ace/mode/json");
    editor.getSession().setUseWrapMode(true);
    minJSON('#min',editor);
    maxJSON('#max',editor);

    $('.viewItem').off().on('click', function() {
      let data = JSON.parse(localStorage.getItem('data_readOnly'));
      let item = {
        domain: $(this).siblings('.domain_field').text(),
        name: $(this).siblings('.name_field').text(),
        value: $(this).siblings('.value_field').text()
      },
      cck2e = _.filter(data,item);
      $('#mdlTitle').text('Cookie: '+ item.name)
      editor.setValue(JSON.stringify(cck2e[0],0,2))
      saveData('#saveItem', item.name, JSON.parse(editor.getValue()))
      $('#encryptItem').off().on('click', function() {
        let res = encryptItems(cck2e)
        editor.setValue(JSON.stringify(res[0][0],0,2))
      });
    });
  }

  setReadOnlyRules();
  setEvents();
  buildReadEditor()

}

/* end readonly */

/* block */


function initBlock(){

  var forceHideOperations = false;
  var newRowVisible = false;

  updateCallback = function () {
      location.reload(true);
      return;

      // FIXME: Unreachable code due to "return" statement above. Explanations needed.
      setBlockRules();
      setEvents();
  };

  function setEvents() {

      $(".addRule").off().on('click',function() {
          showNewEmptyRule();
      });

      $('.cmd_delete').off().on('click',function () {
          if (!preferences.showAlerts || confirm("delete rule " + "?")) {
              hideEditCommands();
              var index = $('.active').attr("index");
              forceHideOperations = true;
              $('.operations:visible').clearQueue();
              $('.operations:visible').addClass('hidden');
              $('.active').fadeOut(function () {
                  forceHideOperations = false;
                  if (newRowVisible) {
                      showNewEmptyRule();
                  }
                  deleteBlockRule(index);
                  if (data.filters.length == 0) {
                    $(".table").append(lineTpl({
                      ID:'empty',
                      DF:'No cookies protected yet',
                      NF:'',
                      VF:'',
                      IDX:''
                    }))
                      return;
                  } else {
                      $("#no_rules1").detach();
                  }
                  location.reload(true);
                  return;
              });
          }
      });

      $('.cmd_accept').off().on('click',function() {
          submitRule();
      });

      $('.cmd_cancel').off().on('click',function() {
          hideEditCommands();
      });

      $('.data_row').off().on('mouseover', function() {
          $('.active').removeClass('active');
          $(this).addClass('active');
          $('.operations').clearQueue().removeClass('hidden');

      });
  }

  function setBlockRules() {
      $('.table_row:not(.header, .template, #line_template)', '.table').detach();

      if (data.filters.length == 0) {
          $(".table").append(lineTpl({
            ID:'no_rules1',
            DF:'No block rules added',
            NF:'',
            VF:'',
            IDX:''
          }))
          return;
      } else {
          $("#no_rules1").detach();
      }

      for (var i = 0; i < data.filters.length; i++) {
          try {
              var filter = data.filters[i];
              var domain = (filter.domain != undefined) ? filter.domain : "any";
              var name = (filter.name != undefined) ? filter.name : "any";
              var value = (filter.value != undefined) ? filter.value : "any";
              addBlockLine(domain, name, value, i);
          } catch (e) {
              console.error(e.message);
          }
      }
  }

  function addBlockLine(domain, name, value, index) {

    $(".table").append(lineTpl({
      ID: 'rule_n_' + index,
      DF: domain,
      NF: name,
      VF: value,
      IDX: index
    }))
  }

  function hideEditCommands() {
      newRowVisible = false;
      $(".new_rule_operations").addClass('hidden');
      $(".new_row").fadeOut().detach();
  }

  function showNewEmptyRule() {
      newRowVisible = true;

      var newRow = blockTblTpl()
      $(".table").append(newRow);
      $(".new_rule_operations").removeClass('hidden');
  }

  function submitRule() {
      var domain = $(".new_rule_domain", ".new_row:not(.template)").val();
      domain = (domain == "any" || domain == '') ? undefined : domain;
      var name = $(".new_rule_name", ".new_row:not(.template)").val();
      name = (name == "any" || name == '') ? undefined : name;
      var value = $(".new_rule_value", ".new_row:not(.template)").val();
      value = (value == "any" || value == '') ? undefined : value;

      var newRule = {};
      newRule.name = name;
      newRule.domain = domain;
      newRule.value = value;

      if (name == undefined && domain == undefined && value == undefined) {
          return;
      }

      addBlockRule(newRule);
      hideEditCommands();

      location.reload(true);
  }

  setBlockRules();
  setEvents();
}


/* end block */

function addRuleLine(domain, name, value, index) {
    $(".table").append(lineTpl({
      ID:'rule_n_' + index,
      DF:domain,
      NF:name,
      VF:value,
      IDX:index
    }));
}


function initStore(){
  csl.get(function(i){

    var editor = ace.edit("storedCookies");
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode("ace/mode/json");
    editor.getSession().setUseWrapMode(true);
    var editor2 = ace.edit("importCookies");
    editor2.setTheme("ace/theme/chrome");
    editor2.session.setMode("ace/mode/json");
    editor2.getSession().setUseWrapMode(true);

    if(i.data.length < 1) {
      editor.setValue('["no cookies stored..."]')
    } else {
      editor.setValue(JSON.stringify(i.data,0,2))
    }

    $('#deleteCookie').on('click', function(event) {
      try{
        let val = parseInt($('#deleteId').val()),
        exists = false;

      if(!_.isInteger(val)) {
        return alert('id must be a number!')
      }

      _.forEach(i.data, function(x){
        if(_.eq(x.id,val)){
          exists = true;
        }
      })

      if(!exists){
        return alert('id does not exist!')
      }

      let cck2d = _.remove(i.data, function(i) {
        return i.id !== parseInt($('#deleteId').val())
      });

      _.forEach(cck2d,function(x,y){
        x.id = y + 1;
      })

      csl.set({
        data: cck2d
      })
      alert('cookie deleted!')
      location.reload()
      //console.log(cck2d)
    } catch(e){
      if (e) { return alert('id must be a number!') }
    }

    });


    $('#encryptbtn').on('click', function(event) {
      try {
        let data = JSON.parse(editor.getValue()),
        res = encryptItems(data);
        csl.set({
          data: res[0]
        })
        alert(res[1] + ' cookies encrypted')
        location.reload()
        return;

      } catch(e){
        if (e) { return alert('invalid json')}
      }
    })

    $('#decryptbtn').on('click', function(event) {

      try {
        let data = JSON.parse(editor.getValue()),
        arr = ['domain', 'expirationDate', 'name', 'path', 'sameSite', 'value'];
        let count = 0;
        _.forEach(data, function(x){
          if(x.encrypted){
            _.forEach(arr, function(y){
              x[y] = crypt.gcmDec(sessionStorage.getItem('token'), x[y])
            })
            x.expirationDate = parseFloat(x.expirationDate);
            x.encrypted = false;
            console.log(x.id + ' decrypted')
            count++
          } else{
            console.log(x.id + ' already decrypted')
          }
        })
        csl.set({
          data: data
        })
        alert(count + ' cookies decrypted')
        return location.reload();

      } catch(e){
        if (e) { return alert('invalid json')}
      }

    })


    minJSON('#min1',editor);
    maxJSON('#max1',editor);
    minJSON('#min2',editor2);
    maxJSON('#max2',editor2);

    $('#saveCookie').on('click', function(event) {
      try {
        let data = JSON.parse(editor.getValue()),
        res = encryptItems(data);
        csl.set({
          backup: res[0]
        })
        return alert('data backup of '+ res[0].length +' cookies success with '+ res[1] +' unencrypted cookies encrypted');
      } catch(e){
        if (e) { return alert('invalid json')}
      }
    })

    $('#loadCookie').on('click', function() {
      try {
        editor2.setValue(JSON.stringify(i.backup,0,2));
      } catch(e){
        if (e) { return alert('backup does not exist!')}
      }
    })

    $('#clearImport').on('click', function() {
      editor2.setValue('');
    })

    $('#importCookie').on('click', function(event) {
      $('#importSelect').click()
    })

    saveData('#exportCookie', localStorage.getItem('exportName'), JSON.parse(editor.getValue()))

    $('#importSelect').off().on('change', function(){
      let reader = new FileReader(),
      file = document.getElementById('importSelect').files[0];
      reader.onload = function (e) {
        try{
          let data = JSON.parse(e.target.result)
          console.log($('#importSelect').val())
          editor2.setValue(JSON.stringify(data,0,2))
          $('#importSelect').val('')
        } catch(e){
          if (e){ return alert('invalid JSON') }
        }
      };
      reader.readAsText(file);
    })

    $('#emptyCookie').on('click', function(event) {
      csl.set({data: []})
      location.reload()
    });

    $('#submitCookie').on('click', function(event) {
      try {
        let cck2i = JSON.parse(editor2.getValue());
        if(_.isArray(cck2i)) {

          let itemID = i.data.length + 1
          _.forEach(cck2i,function(items){
            items.id = itemID;
            itemID++
          })
          csl.set({
            data: _.union(i.data,cck2i)
          })
          alert(cck2i.length + ' cookies added!');
          location.reload();
          return;
        } else if (_.isObject(cck2i)) {
          cck2i.id = i.data.length + 1;
          i.data.push(cck2i)
          csl.set({
            data: i.data
          })
          alert('cookie added!');
          location.reload();
          return;
        }
      } catch(e){
        if (e){ return alert('invalid JSON') }
      }
    });

    $('#updateCookie').on('click', function(event) {
      try {
        let cck2i = JSON.parse(editor.getValue());
          _.forEach(cck2i,function(x,y){
            x.id = y + 1;
          })
          csl.set({
            data: cck2i
          })
          alert('cookies updated!');
          location.reload();
          return;
      } catch(e){
        if (e){ return alert('invalid JSON') }
      }
    });
  })

  return
}

$(document).ready(function () {

  $('nav:first').after(optBaseTpl())
  if(preferences.showAnimate) {
    var particle = new Particles().init();
  }
  _.forEach(['token','user'],function(i){
    if(!sessionStorage.getItem(i) || _.eq(sessionStorage.getItem(i), '')) {
      localStorage.setItem('data_url','login')
    }
  })

  if  (_.eq(localStorage.getItem('data_url'),'login')){
    buildLogin()
    initLogin()
  } else if (_.eq(localStorage.getItem('data_url'),'store')){
    logout()
    buildStore()
    initStore()
  } else if (_.eq(localStorage.getItem('data_url'),'options')){
    logout()
    buildOptions()
    initOptions()
  } else if  (_.eq(localStorage.getItem('data_url'),'blockedCookies')){
    logout()
    buildBlock()
    initBlock()
  } else {
    logout()
    initReadonly()
  }
});







//console.log(crypt.gcmDec('password','secret',crypt.gcmEnc('password','secret','text')))
