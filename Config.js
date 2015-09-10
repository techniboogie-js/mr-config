var _ = require('lodash');

var parser = require('./configParser');

module.exports = Config;

function Config(metaData) {
  this.$metaData = metaData;

  this.$configs = _.pluck(metaData, 'filename');
  this.$timestamp = null;
}

Config.prototype.reload = function() {

  _.forEach(this.$metaData, function(file) {

    try {
      var doc = parser.parseFile(file.filename);
      // Update meta-data]
      file.loneConfig = doc;

      // Update the config
      _.assign(this, doc);
    }
    catch (err) {
      console.error(err);
    }
  }, this);

  this.$timestamp = Date.now();
};

Config.prototype.save = function() {
// save from right to left
};
