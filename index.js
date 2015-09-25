
/* TODO

 doc
 optoins: watch, parser
 reload(), reset()
 hidden props: $config $timestamp

 js files are expected to be node modules
*/
var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var configParser = require('./configParser');
var Config = require('./Config');

mrConfig.reset = function() {
  setConfig(undefined);
  configParser.parser = null;
};

module.exports = mrConfig;

function mrConfig(options, noLog) {
  // Load config meta data if it isn't cached
  if (!getConfig()) {

    if (options) {
      configParser.parser = options.parser;
    }

    var configFiles = process.env.MR_CONFIGS_FILES;

    if (configFiles) {

      if (noLog !== true) {
        console.info('MR_CONFIGS_FILES: ' + configFiles);
      }
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
    var metaData = [];

    _.forEach(files, function(file) {
      file = file.trim();

      var metaDataFile = {
        filename: file,
        loneConfig: undefined,
        watcher: undefined
      };
      metaData.push(metaDataFile);
    });

    var config = new Config(metaData);
    config.reload();

    setConfig(config);
  }
  return getConfig();
}

function setConfig(config) {
  // Just a safety net
  if (mrConfig.config) {
    mrConfig.config.unwatch();
  }
  mrConfig.config = config;
}

function getConfig() {
  return mrConfig.config;
}
