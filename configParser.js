var fs = require('fs');
var path = require('path');
var util = require('util');

var json = require('jsonfile');
var yaml = require('js-yaml');
var xml = require('xml2json');
var properties = require('properties-parser');

exports.parseFile = function(filePath, customParser) {
  var doc = null;
  var stat = fs.statSync(filePath);

  if (stat.isFile()) {

    var fileType = path.extname(filePath).substr(1).toLowerCase();

    if (customParser) {
      doc = customParser(filePath);
    }
    else if (fileType == 'json') {
      doc = json.readFileSync(filePath);
    }
    else if (fileType == 'js') {
      // Strip off .js
      var moduleName = filePath.match(/(.*)\.js/)[1];
      doc = require(moduleName);
    }
    else if (fileType == 'yaml') {
      doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
    }
    else if (fileType == 'xml') {
      var xmlString = fs.readFileSync(filePath, 'utf8');
      doc = xml.toJson(xmlString, {
        object: true,
        coerce: true,
        arrayNotation: true
      });
    }
    else if (fileType == 'properties') {
      var propString = fs.readFileSync(filePath, 'utf8');
      doc = properties.parse(propString);
    }
    else {
      throw new Error(util.format('File extension missing or unsupported file type: "%s"', fileType));
    }
  }
  else {
    throw new Error(util.format('%s is not a file', file));
  }
  return doc;
};
