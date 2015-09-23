
/* TODO

 doc
 optoins: watch, parser
 reload(), reset()
 hidden props: $config $timestamp
*/
var fs = require('fs');

var _ = require('lodash');

var configParser = require('./configParser');
var Config = require('./Config');

mrConfig.reset = function() {
  setConfig(undefined);
  configParser.parser = null;
};

module.exports = mrConfig;

function mrConfig(options) {

  // Load config meta data if it isn't cached
  if (!getConfig()) {

    if (options) {
      configParser.parser = options.parser;
    }

    var configFiles = process.env.MR_CONFIGS_FILES;

    if (!configFiles) {
      throw new Error('Environment variable "MR_CONFIGS_FILES" is not set.');
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

      if (options && options.watch === true) {
        metaDataFile.watcher = createWatcher(file);
      }

      metaData.push(metaDataFile);
    });

    var config = new Config(metaData);
    config.reload();

    setConfig(config);
  }
  return getConfig();
}

function setConfig(config) {
  // Just a safety net until a queue is implemented
  if (mrConfig.config) {
    _.forEach(mrConfig.config.$metaData, function(file) {

      if (file.watcher) {
        file.watcher.close();
      }
    });
  }
  mrConfig.config = config;
}

function getConfig() {
  return mrConfig.config;
}

function createWatcher(filename) {

  return fs.watch(filename, function() {
    getConfig().reload();
  });
}
