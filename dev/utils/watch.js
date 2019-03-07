const fs = require('fs'),
_ = require('lodash'),
urls = require('../urls')
chokidar = require('chokidar'),
minify = require('html-minifier').minify,
CleanCSS = require('clean-css');

let minHTML = {
  "minifyCSS": true,
  "minifyJS": true,
  "removeStyleLinkTypeAttributes": true,
  "useShortDoctype": true,
  "minifyURLs": true,
  "collapseWhitespace": true
}

module.exports = {
  minCSS: function(){

  },
  minJS: function(){

  },
  minHTML: function(){
    _.forEach(urls.files.html,function(i){
      let data = fs.readFileSync(_.join([urls.dev.html, i],'/') + '.html', 'utf8');
      fs.writeFileSync('./'+ i + '.html', minify(data,minHTML));
    })
  },
  joinJS: function(){
    let str = ''
    try {
      _.forEach(urls.files.js,function(i){
          let data = fs.readFileSync(_.join([urls.dev.js, i + '.js'],'/'), 'utf8');
          str += data;
      })
      fs.writeFileSync(_.join([urls.prod.js, 'vendor.js'],'/'), str);
    } catch(e){
      if (e){ return console.log(e) }
    } finally {
      return console.log('js join complete')
    }

  },
  joinCSS: function(){
    let str = '';
    try {
      _.forEach(urls.files.css,function(i){
          let data = fs.readFileSync(_.join([urls.dev.css, i + '.css'],'/'), 'utf8');
          str += data;
      })
      let out = new CleanCSS().minify(str);
      fs.writeFileSync(_.join([urls.prod.css, 'vendor.css'],'/'), str);
    } catch(e){
      if (e){ return console.log(e) }
    } finally {
      return console.log('css min complete')
    }
  }
}
