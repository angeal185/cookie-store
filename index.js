const fs = require('fs'),
_ = require('lodash'),
chokidar = require('chokidar'),
watch = require('./dev/utils/watch');



watch.watchCSS()
watch.watchHTML()
