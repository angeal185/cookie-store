(function () {
    if (preferences.showDevToolsPanel)
        chrome.devtools.panels.create('cookieStore', '/app/img/icon_32x32.png', 'devtools/panel.html');
})();
