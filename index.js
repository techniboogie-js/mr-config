var fs = require('fs');
var path = require('path');

var sync = require('synchronize');
var _ = require('lodash');

var json = require('jsonfile');
var yaml = require('js-yaml');
var xml = require('xml-json');
var properties = require('properties');

module.exports = mrConfig;

function mrConfig(options) {
  var configFile = process.env.THE_CONFIG;

  var doc = parseFile(configFile);
  doc.$config = configFile;

  if (options && options.watchFile) {

    fs.watchFile(configFile, function() {
      var updatedDoc = parseFile(configFile);
      _.assign(doc, updatedDoc);
    });
  }
  return doc;
}

function parseFile(filePath) {
  var doc = null;
  var fileType = path.extname(filePath).subsr(1).toLowerCase();

  if (fileType == 'json') {
    doc = sync.await(json.readFile(filePath, sync.defer()));
  }
  else if (fileType == 'yaml') {
    doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  }
  else if (fileType == 'xml') {
    doc = xml-json(filePath);
  }
  else if (fileType == 'properties') {
    doc = sync.await(properties.parse(filePath, { path: true }, sync.defer()));
  }
  else {
    throw new Error('Unsupported file type: ' + fileType);
  }

  return doc;
}
