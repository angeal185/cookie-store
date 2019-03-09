const fs = require('fs'),
_ = require('lodash'),
urls = require('../urls')
chokidar = require('chokidar'),
minify = require('html-minifier').minify,
config = require('../config'),
CleanCSS = require('clean-css');

const watch = {
  pack: function(i){

  },
  minCSS: function(i){
    try{
      let data = fs.readFileSync(i, 'utf8');
      let out = new CleanCSS().minify(data);
      if(_.isUndefined(out)){
        return console.log('unable to minify css file: ' + i)
      }
      fs.writeFileSync(i, out.styles);
      return console.log('file: ' + i + ' minified')
    } catch(e){
      if(e) { return console.log('unable to minify css file: ' + i)}
    }
  },
  minJS: function(){

  },
  minHTML: function(){
    try{
      _.forEach(urls.files.html,function(i){
        let data = fs.readFileSync(_.join([urls.dev.html, i],'/') + '.html', 'utf8');
        fs.writeFileSync('./'+ i + '.html', minify(data,config.minHTML));
      })
      return console.log('html minified')
    } catch(e){
      if(e) { return console.log('unable to minify html') }
    }
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
    let str = '',
    vndr = 'vendor.min.css';
    try {
      _.forEach(urls.files.css,function(i){
          let data = fs.readFileSync(_.join([urls.dev.css, i + '.min.css'],'/'), 'utf8');
          str += data;
      })
      let out = new CleanCSS().minify(str);
      fs.writeFileSync(_.join([urls.prod.css, vndr],'/'), out.styles);
    } catch(e){
      if (e){ return console.log('unable to create ' + vndr) }
    } finally {
      return console.log(vndr + ' created')
    }
  },
  watchCSS: function(){
    let watcher = chokidar.watch(urls.prod.css, {
      persistent: true
    });
    watcher
    .on('error', error => log(`Watcher error: ${error}`))
    .on('ready', function(){
      console.log('watching css dist...')
    })
    .on('change', function(event){
      watch.minCSS('./' + event)
    })
  },
  watchHTML: function(){
    let watcher = chokidar.watch(urls.dev.html, {
      persistent: true
    });
    watcher
    .on('error', error => log(`Watcher error: ${error}`))
    .on('ready', function(){
      console.log('watching html dev...')
    })
    .on('change', function(event){
      watch.minHTML()
    })
  }
}

module.exports = watch;
