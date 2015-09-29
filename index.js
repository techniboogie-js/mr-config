var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var parser = require('./configParser');

module.exports = new Config();

function Config() {
  this.$watchers = [];

  this.$configs = null;
  this.$timestamp = null;
}

Config.prototype.reload = function(customParser) {
  reset(this);

  var files = getConfigFiles();

  _.forEach(files, function(file) {

    try {
      var doc = parser.parseFile(file, customParser);

      // Update the config
      _.assign(this, doc);
    }
    catch (err) {
      console.error(err);
    }
  }, this);

  // If already watching and config files change
  var reloadWatchers = (function(watchers) {
    var diff = _.difference(this.$configs, files);

    return (watchers.length > 0) && (diff.length > 0);
  })(this.$watchers);

  this.$configs = files;
  this.$timestamp = Date.now();

  if (reloadWatchers) {
    this.unwatch();
    this.watch();
  }
};

Config.prototype.watch = function() {
  var conf = this;

  _.forEach(conf.$configs, function(file) {

    var watcher = fs.watch(file, function() {
      conf.reload();
    });
    conf.$watchers.push(watcher);
  });
};

Config.prototype.unwatch = function() {

  _.forEach(this.$watchers, function(watcher) {
      watcher.close();
  });
  this.$watchers.splice();
};

function getConfigFiles() {
  var configFiles = process.env.MR_CONFIGS_FILES;

  if (configFiles) {
    console.info('MR_CONFIGS_FILES: ' + configFiles);
  }
  else {
    console.warn('Environment variable "MR_CONFIGS_FILES" is not set. Checking for config.json or default.js in current directory.');

    // Check for config.json or default.js
    var configJson = path.join(process.cwd(), 'config.json');
    var defaultJs =  path.join(process.cwd(), 'default.js');

    try {
      fs.statSync(configJson);
      configFiles = configJson;
    }
    catch (e) {

      try {
        fs.statSync(defaultJs);
        configFiles = defaultJs;
      }
      catch (f) {
        throw new Error('No configuration files found.');
      }
    }
  }

  var files = configFiles.split(',');
  var cleanedFiles = [];

  _.forEach(files, function(file) {
    cleanedFiles.push(file.trim());
  });
  return cleanedFiles;
}

function reset(config) {

  _.forIn(config, function(value, key) {

    if (key != '$watchers' && !Config.prototype[key]) {
      delete config[key];
    }
  });
}
