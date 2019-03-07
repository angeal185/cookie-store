_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

let csl = chrome.storage.local;

const div = $('<div />'),
li = $('<li />'),
optBaseTpl = _.template('<div id="rules-box" class="w90"><h3></h3><hr></div><canvas id="canvas"></canvas>'),
cmdTpl = _.template('<li id="{{ID}}" class="waves-effect"><a class="fa fa-{{ICN}}" title="{{TTL}}"></a></li>'),
divClsTpl = _.template('<div class="{{CLS}}">{{BODY}}</div>'),
navTpl = _.template('<nav><div class="logo left"><img src="/app/img/icon_32x32.png" height="50px"></div><ul id="navLinks" class="right"></ul></nav>'),
bottomNavTpl = _.template('<nav class="nav-bottom"><ul class="bottomNavLinks right"></ul></nav>'),
navLnkTpl = _.template('<li class="waves-effect"><a class="navLnk">{{TTL}}</a></li>'),
btnTpl = _.template('<button type="button" id="{{ID}}" class="btn waves-effect">{{TTL}}</button>'),
lineTpl = _.template('<div class="table_row data_row" id="{{ID}}" index="{{IDX}}"><div class="domain_field">{{DF}}</div><div class="name_field">{{NF}}</div><div class="value_field">{{VF}}</div><span data-target="modal1" class="viewItem fa fa-eye modal-trigger"></span></div>'),
icnSpn = _.template('<span class="{{CLS}}" title="{{TTL}}"><i class="fa fa-{{ICN}}"></i></span>'),
radTpl = _.template('<div class="col m3 s6"><input type="radio" id="radio{{ID}}" name="radioMaxDate" value="{{VAL}}" /><label>{{ID}}s</label></div>'),
chkTpl = _.template('<div class="col m6 s12"><input type="checkbox" id="{{e}}" class="checkbox"><label>{{i}}</label></div>'),
inpTpl = _.template('<div class="col m6 s12 input-field"><label>{{TTL}}</label><input type="{{TYPE}}" id="{{ID}}" class="input"></div>'),
tblTpl = _.template('<div class="table"><div class="table_row header"><div>domain</div><div>name</div><div>value</div></div></div>'),
cusSelectTpl = _.template('<div class="col m6"><label>{{LBL}}</label><select type="select" id="{{ID}}" class="w100 custom-select custom-select-sm"></select></div>'),
blockTblTpl = _.template('<div class="table_row new_row"><div class="domain_field"><input type="text" value="any" class="new_rule_domain"></div><div class="name_field"><input type="text" value="any" class="new_rule_name"></div><div class="value_field"><input type="text" value="any" class="new_rule_value"></div></div>'),
disInpTpl = _.template('<input type="hidden" class="{{CLS}}" disabled="disabled">'),
inpGrpTpl = _.template('<div><label>{{_.startCase(CLS)}}</label><input class="{{CLS}} input" type="text"></div>'),
taGrpTpl = _.template('<div><label>{{_.startCase(CLS)}}</label><textarea rows="5" class="{{CLS}} materialize-textarea" type="textarea" spellcheck="false"></textarea></div>'),
slctTpl = '<div><label>SameSite</label><select class="sameSite custom-select" type="text"></select></div>',
chkBoxTpl = _.template('<div class="col s3"><label>{{_.capitalize(i)}}</label><input id="{{i}}-checkbox" class="{{i}} checkbox" type="checkbox"></div>'),
icoLnkTpl = _.template('<a class="{{CLS}}" title="{{TTL}}"><i class="fa fa-{{ICO}}"></i></a>'),
alertWrapTpl = _.template('<div id="alert_wrapper"><div id="alert_background"></div><div id="alert_box"><div id="alert_title"><p id="alert_title_p"></p></div><div id="alert_buttons"><div id="alert_ok" class="alert_button">yes</div><div id="alert_cancel" class="alert_button">no</div></div></div></div>'),
collapseTpl = _.template('<div id="{{ID}}" class="collapsible"><li><div class="collapsible-header"><h5>{{TTL}}</h5></div></li></div>'),
searchTpl = _.template('<div id="searchBox"><input type="text" id="searchField"></div>'),
clpToastTpl = _.template('<div id="copiedToast" class="toast">copied to clipboard</div>'),
submitTpl = _.template('<div id="submitDiv"><a id="submitButton">Submit all</a></div>'),
filterTpl = _.template('<div class="col s12"><input type="checkbox" class="{{CLS}}" name="{{NAME}}"><label for="{{ID}}">{{TTL}}</label><input type="text" class="input" id="{{ID}}"></div>'),
cookieFilterTpl = _.template('<div><div id="cookieFilter"><h5>New filter</h5><div class="cookie row"></div></div><div id="submitFiltersDiv"><input id="submitFiltersButton" type="submit" class="btn" value="Add this rule" role="button"></div></div>'),
mdlTpl = _.template('<div id="modal1" class="modal modal-fixed-footer"><div class="modal-content"><h4 id="mdlTitle"></h4><div id="mdlBody"></div></div><div id="mdlFooter" class="modal-footer"><a href="#!" class="modal-close waves-effect waves-light btn-flat">Close</a></div></div>'),
minmaxTpl = _.template('<div class="right minmax"><span id="{{ID1}}">min</span> / <span id="{{ID2}}">max</span></div>')



const opts = {
  nav: ['Protected cookies', 'Blocked cookies', 'Options', 'Store', 'Login'],
  main:{
    cookieTable:['domain','path', 'storeId', 'expiration'],
    newCookieTable:['name', 'domain','path', 'expiration'],
    select:['noRestriction','lax','strict'],
    r1: ['hostOnly','session','secure','httpOnly'],
    cookieFilter:[{
      class: 'filterDomain',
      name: 'domain',
      id: 'filterByDomain',
      title: 'Block by domain'
    },{
      class: 'filterName',
      name: 'name',
      id: 'filterByName',
      title: 'Block by name'
    },{
      class: 'filterValue',
      name: 'value',
      id: 'filterByValue',
      title: 'Block by value'
    }]
  },
  cmdTplLst: [{
    id: 'backToList',
    title: 'Back to list',
    icon: 'arrow-left'
  },{
    id: 'deleteAllButton',
    title: 'Delete all',
    icon: 'trash-o'
  },{
    id: 'flagAllButton',
    title: 'Flag all',
    icon: 'ban'
  },{
    id: 'refreshButton',
    title: 'Reset',
    icon: 'undo'
  },{
    id: 'addCookieButton',
    title: 'New cookie',
    icon: 'plus'
  },{
    id: 'pasteButton',
    title: 'Import',
    icon: 'sign-in'
  },{
    id: 'copyButton',
    title: 'Export',
    icon: 'sign-out'
  },{
    id: 'searchButton',
    title: 'Search',
    icon: 'search'
  },{
    id: 'optionsButton',
    title: 'Options',
    icon: 'wrench'
  }],
   checks: {
    showAlerts: 'Always ask for confirmation',
    showCommandsLabels: 'Show labels next to icons',
    showAnimate: 'Show animated background',
    refreshAfterSubmit: 'Reload the page after submitting the changes',
    skipCacheRefresh: 'Skip the cache when page reloads',
    showContextMenu: 'Show "Edit Cookies" in contextual menu',
    showDevToolsPanel: 'Show the DevTools panel',
    showFlagAndDeleteAll: 'Show "Block and delete all" button',
    showDomain: 'Show the domain near each cookies name',
    showDomainBeforeName: 'Show the domain before the cookies name',
    useMaxDate: 'Override the maximum age for any cookie'
  },
  radio: {
    Hour: '3600',
    Day: '8640',
    Month: '2592000',
    Year: '31104000'
  },
  select1:{
    domain_alpha: 'by domain and name',
    alpha: 'by name'
  },
  select2:{
    json: 'JSON',
    netscape: 'Netscape HTTP Cookie File',
    semicolonPairs: 'Semicolon separated name=value pairs',
    lpw: 'Perl::LWP'
  },
  login:{
    username: 'text',
    email: 'email',
    password: 'password',
    confirm: 'password'
  }
}


//main
function buildTpl(){

  $('body').prepend(divClsTpl({CLS:'toast disposable fadeOutDown',BODY:''}),navTpl())

  _.forEach(opts.cmdTplLst,function(i){
    $('#navLinks').append(cmdTpl({ID:i.id,TTL:i.title,ICN:i.icon}))
  })

  _.forEach(['#deleteAllButton','#flagAllButton','#copyButton','#searchButton'],function(i){
    $(i).addClass('notOnEmpty')
  })
}

function newTbl(indx){
  return divClsTpl({
    CLS: 'cookie collapsible-body ' + indx,
    BODY: divClsTpl({
      CLS: 'cookie-table',
      BODY: ''
    }) +  divClsTpl({
      CLS: 'row center r1',
      BODY: ''
    })
  })
}

function buildMain(){

  $("nav").after(
    div.clone().attr({
    id:'app'
    }).append(
    div.clone().attr({
      id:'loader-container1'
    }),
    div.clone().attr({
      id:'loader-container'
    }).append($('<i />').addClass('fa fa-cog fa-spin fa-3x')),
    alertWrapTpl(),
    div.clone().attr({
      id:'wrapper'
    }).append(
      searchTpl(),
      divClsTpl({
        CLS: 'commands-table',
        BODY: divClsTpl({
          CLS: 'commands-row',
          BODY: ''
        })
      }),
      divClsTpl({
        CLS: 'container',
        BODY: collapseTpl({ID:'newCookie',TTL:'New cookie'}) +
              collapseTpl({ID:'pasteCookie',TTL:'Import'})
      }),
      clpToastTpl(),
      submitTpl()
    )
  ))


  $('#wrapper .container').append(
    div.clone().attr({
      id:'cookieSearchCondition'
    }).append(
      $('<input />').attr({
        type: "text",
        class: "searchCondition",
        placeholder: "URL"
      })
    ),
    div.clone().attr({id:'noCookies'}).text('No cookies here!'),
    div.clone().attr({id:'cookiesList',class:'collapsible'}),
    cookieFilterTpl()
  )

  $('#pasteCookie li').append(
      divClsTpl({
        CLS: 'collapsible-body',
        BODY: '<textarea rows="20" class="value materialize-textarea" type="textarea" spellcheck="false" placeholder="Paste here the cookies to import. Accepted formats: JSON"></textarea>'
        + divClsTpl({
          CLS: 'formLabel error',
          BODY: ''
        })
      })
    )


    _.forEach(opts.main.cookieFilter, function(i){
      $('#cookieFilter .cookie').append(filterTpl({CLS: i.class, NAME: i.name, ID: i.id, TTL: i.title}))
    })
}


function buildNewTbl(){
  $('#newCookie li').append(newTbl('newTbl'))

  _.forEach(opts.main.newCookieTable,function(i){
    $('.newTbl .cookie-table').append(inpGrpTpl({CLS:i}))
  })

  $('.newTbl .cookie-table').append(taGrpTpl({CLS:'value'}),slctTpl)

  _.forEach(opts.main.select,function(i){
    $('.newTbl .cookie-table').find('select').append('<option value="'+ i +'">'+ _.startCase(i) +'</option>')
  })

  _.forEach(opts.main.r1,function(i){
    $('.newTbl .r1').append(chkBoxTpl({i:i}))
  })
}

function buildCDT(itm, indx){
  $('#cookiesList li').eq(itm).append(newTbl(indx))

  _.forEach(['name','index'],function(i){
    $('.'+ indx).prepend(disInpTpl({CLS:i}))
  })

  _.forEach(opts.main.cookieTable,function(i){
    $('.'+ indx +' .cookie-table').append(inpGrpTpl({CLS:i}))
  })

  $('.'+ indx +' .cookie-table').append(taGrpTpl({CLS:'value'}),slctTpl)

  _.forEach(opts.main.select,function(i){
    $('.'+ indx +' .cookie-table').find('select').append('<option value="'+ i +'">'+ _.startCase(i) +'</option>')
  })

  _.forEach(opts.main.r1,function(i){
    $('.'+ indx +' .r1').append(chkBoxTpl({i:i}))
  })

  $('.'+ indx +' .r1').after(divClsTpl({
    CLS: 'row center r2',
    BODY: divClsTpl({
      CLS: 'col s4',
      BODY: icoLnkTpl({CLS: 'deleteOne', TTL: 'Delete cookie', ICO: 'trash-o'})
    }) + divClsTpl({
      CLS: 'col s4',
      BODY: icoLnkTpl({CLS: 'protectOne unprotected', TTL: 'Set readOnly', ICO: 'unlock'}) +
            icoLnkTpl({CLS: 'protectOne protected', TTL: 'Is readOnly', ICO: 'lock'})
    }) + divClsTpl({
      CLS: 'col s4',
      BODY: icoLnkTpl({CLS: 'flagOne', TTL: 'Flag cookie', ICO: 'ban'})
    })
  }))
}

function buildOptions(){
  $('#rules-box').append(
    divClsTpl({
      CLS: 'row r1',
      BODY: ''
    }),
    divClsTpl({
      CLS: 'row r2',
      BODY: ''
    }),
    divClsTpl({
      CLS: 'row r3',
      BODY: cusSelectTpl({LBL: 'Sort cookies',ID: 'sortCookiesType'}) + cusSelectTpl({LBL: 'Export format for cookies',ID: 'copyCookiesType'})
    })
  )

  $('#rules-box h3, title').text('Options')
  _.forIn(opts.checks,function(i,e){
    $('.r1').append(chkTpl({i:i,e:e}))
  })

  $('.r2').append(
    div.clone().attr({
      class: 'input-field col m6 s12'
    }).append(
      $('<label />').addClass('active').text('Set the maximum cookie age to'),
      $('<input />').attr({
        type: 'text',
        id: 'maxDate',
        class: 'input',
        value: 1
      })
    ),
    div.clone().attr({
      class: 'col m6 s12'
    }).append(
      div.clone().attr({
        id: 'maxDateType',
        class: 'row'
      }),
      $('<button />').attr({
        id: 'saveMaxDateButton',
        class: 'hidden btn btn-primary'
      }).text('Save'),
      div.clone().attr({
        id: 'shortenProgress',
        class: 'hidden'
      }).append(
        $('<i />').attr({
          id: 'shortenSpinner',
          class: 'fa fa-refresh fa-spin'
        }),
        $('<span />').text('...')
      )
    )
  )

  _.forIn(opts.radio,function(i,e){
    $('#maxDateType').append(radTpl({ID:e,VAL:i}))
  })
  _.forIn(opts.select1,function(i,e){
    $('#sortCookiesType').append('<option value="'+ e +'">'+ i +'</option>')
  })
  _.forIn(opts.select2,function(i,e){
    $('#copyCookiesType').append('<option value="'+ e +'">'+ i +'</option>')
  })
}



//options
function buildOptNav(){
  $('body').prepend(navTpl()).append(divClsTpl({CLS:'toast disposable fadeOutDown',BODY:''}),bottomNavTpl())
  _.forEach(opts.nav,function(i){
    $('#navLinks').append(navLnkTpl({TTL:i}))
  })

  $('.bottomNavLinks').append('<i class="fa fa-unlock" />')

  $('.navLnk').off().on('click', function(event) {
    event.preventDefault();
    console.log(_.camelCase(this.text))
    localStorage.setItem('data_url', _.camelCase(this.text))
    location.reload()
  });
}

//readonly
function buildReadonly(){
  $('#rules-box').append(
    divClsTpl({
      CLS: 'operations inline hidden',
      BODY: icnSpn({
        CLS: 'cmd_delete',
        TTL: 'Delete this rule',
        ICN: 'trash-o'
      })
    }),
    tblTpl(),
    mdlTpl()
  )
  $('#rules-box h3, title').text('Protected cookies')
}

function buildBlock(){
  $('#rules-box').append(
    divClsTpl({
      CLS: 'inline',
      BODY: icnSpn({
        CLS: 'addRule',
        TTL: 'New rule',
        ICN: 'plus'
      })
    }),
    divClsTpl({
      CLS: 'operations inline hidden',
      BODY: icnSpn({
        CLS: 'cmd_delete',
        TTL: 'Delete this rule',
        ICN: 'trash-o'
      })
    }),
    divClsTpl({
      CLS: 'new_rule_operations inline hidden',
      BODY: icnSpn({
        CLS: 'cmd_accept',
        TTL: 'Add rule',
        ICN: 'check'
      }) +  icnSpn({
        CLS: 'cmd_cancel',
        TTL: 'cancel',
        ICN: 'times'
      })
    }),
    tblTpl()
  )
  $('#rules-box h3, title').text('Blocked cookies')
}

function logout(){
  $('a.navLnk:last').attr({
    id: 'logout'
  }).text('Logout').off().on('click',function(){
    _.forEach(['user','token'],function(i){
      sessionStorage.removeItem(i)
    })
    alert('logout success!')
    location.reload()
  })
}

//register/Login
function buildLogin(){
  $('#rules-box').append(
    divClsTpl({
      CLS: 'login row',
      BODY: ''
    })
  )
  $('.nav-bottom').addClass('hidden')
  _.forIn(opts.login,function(i,e){
    $('.login').append(inpTpl({TTL:_.startCase(e),TYPE: i,ID:e}))
  })
  $('.login').append(btnTpl({ID: 'loginBtn', TTL: 'submit'}))

  csl.get(function(i){
    console.log(i)

    if(!i.user){
      alert('no user detected. please register below')
      $('#rules-box h3, title').text('register')
      $('#loginBtn').off().on('click', function() {
        let obj = {},
        stat = false,
        user = $('#username').val(),
        password = $('#password').val(),
        confirm = $('#confirm').val();

        if(!_.eq(password, confirm)){
          return alert('password does not match confirm')
        }

        _.forEach(['username','email'],function(i){
          let item = $('#' + i).val()
          if(!_.eq(item, '')){
            obj[i] = _.escape(item);
            stat = true;
          } else{
            return stat = false;
          }
        })

        if(!stat){
          return alert('incomplete register details')
        }

        chrome.system.cpu.getInfo(function(e){
          let salt = crypt.sha512(user + e.archName + e.modelName),
          ver;
          password = forge.util.bytesToHex(forge.pkcs5.pbkdf2(password, salt, 10000, 16))
          obj.email = crypt.sha256(obj.email);
          obj.date = Date.now();
          ver = crypt.gcmEnc(password, 'crypto test pass')

          sessionStorage.setItem('token', password);
          sessionStorage.setItem('user', user);
          console.log(obj)
          console.log(crypt.gcmDec(password, ver))
          newUser(obj, ver)
          localStorage.setItem('data_url','')
          return;
        })
      });

      return
    }

    $('#rules-box h3, title').text('Login')

    $('#confirm').parent('div').addClass('hidden')
    $('#loginBtn').off().on('click', function() {
      let obj = {},
      stat = false,
      user = $('#username').val()
      password = $('#password').val(),
      email = $('#email').val();

      _.forEach(['username','email'],function(i){
        let item = $('#' + i).val()
        if(!_.eq(item, '')){
          obj[i] = _.escape(item);
          stat = true;
        } else{
          return stat = false;
        }
      })

      if(!stat){
        return alert('incomplete login details')
      }


      if (!_.eq(crypt.sha256(email),i.user.email) || !_.eq(user,i.user.username)) {
        return alert('incorrect email details')
      }

        chrome.system.cpu.getInfo(function(e){
          let salt = crypt.sha512(user + e.archName + e.modelName);
          password = forge.util.bytesToHex(forge.pkcs5.pbkdf2(password, salt, 10000, 16))
          if(!_.eq(crypt.gcmDec(password, i.verify),'crypto test pass')) {
            return alert('incorrect password')
          }
          sessionStorage.setItem('token', password);
          sessionStorage.setItem('user', user);
          localStorage.setItem('data_url','');
          console.log(crypt.gcmDec(password, i.verify))
          alert('login success!')
          return location.reload()
        })
    });
    return
  })

}


function buildStore(){
  $('#rules-box').append(
    divClsTpl({
      CLS: 'cookieStore row',
      BODY: divClsTpl({
        CLS: 'col m6 r1',
        BODY: '<label>stored '+ minmaxTpl({ID1: 'min1',ID2: 'max1'}) +'</label><textarea type="text" id="storedCookies" class="materialize-textarea"></textarea><div><label>Delete by ID</label><input type="text" id="deleteId" class="input"><button type="button" id="deleteCookie" class="btn btn-small mt10 mr20">delete</button><button type="button" id="emptyCookie" class="btn btn-small mt10 mr20">delete all</button><button type="button" id="encryptbtn" class="btn btn-small mt10 mr20">Encrypt</button><button type="button" id="decryptbtn" class="btn btn-small mt10 mr20">Decrypt</button><button type="button" id="saveCookie" class="btn btn-small mt10 mr20">Backup</button><button type="button" id="exportCookie" class="btn btn-small mt10 mr20">Export</button><button type="button" id="updateCookie" class="btn btn-small mt10 mr20">Update</button></div>'
      })  + divClsTpl({
        CLS: 'col m6 r2',
        BODY: '<div><label>import '+ minmaxTpl({ID1: 'min2',ID2: 'max2'}) +'</label><textarea type="text" id="importCookies" class="materialize-textarea"></textarea></div><button type="button" id="importCookie" class="btn btn-small mt10 mr20">import</button><button type="button" id="submitCookie" class="btn btn-small mt10 mr20">Submit</button><button type="button" id="loadCookie" class="btn btn-small mt10 mr20">Load</button><button type="button" id="clearImport" class="btn btn-small mt10 mr20">Clear</button></div><input type="file" id="importSelect" hidden>'
      })
    })
  )

  $('.r1').append(
    div.clone.append
  )
  $('#rules-box h3, title').text('Cookie store')
}

function newUser(i, ver){
  try{
    csl.set({
      user: i,
      data:[],
      status:'unlock',
      verify: ver
    })
    alert('user ' + i.username + ' successfully created')
    return location.href = '/options.html'
  } catch(e){
    if (e) {
      alert('unable to create user at this time. check your permissions.')
      return console.log(e)
    }
  }
}


function toasty(i){
  let toasty = $('.toast.disposable')
  toasty.text(i).removeClass('fadeOutDown').addClass('fadeInUp');
  setTimeout(function () {
      toasty.removeClass('fadeInUp').addClass('fadeOutDown');
  }, 2500);
}


chrome.runtime.getPlatformInfo(function(i){
  console.log(i)
})
