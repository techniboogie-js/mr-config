var assert = require('assert');
var fs = require('fs');

var _ = require('lodash');

var subject = require('..');
var parsed = require('./fixtures/parsed-configs');
var configs = require('./fixtures/the-configs');

describe('Parse config files', function() {

  beforeEach(function() {
    subject.reset();
  });

  it('with type JSON', function() {
    process.env.MR_CONFIGS_FILES = configs.json;

    var conf = subject();
    removeHiddenProps(conf);

    assert.deepEqual(conf, parsed.json);
  });

  it('with type YAML', function() {
    process.env.MR_CONFIGS_FILES = configs.yaml;

    var conf = subject();
    removeHiddenProps(conf);

    assert.deepEqual(conf, parsed.yaml);
  });

  it('with type XML', function() {
    process.env.MR_CONFIGS_FILES = configs.xml;

    var conf = subject();
    removeHiddenProps(conf);

    assert.deepEqual(conf, parsed.xml);
  });

  it('with type properties', function() {
    process.env.MR_CONFIGS_FILES = configs.properties;

    var conf = subject();
    removeHiddenProps(conf);

    assert.deepEqual(conf, parsed.properties);
  });
});

describe('Load config', function() {
  var config  = null;

  before(function() {
    process.env.MR_CONFIGS_FILES = configs.json;
    subject.reset();
    config = subject();
  });

  it('using cached copy', function() {
    var configCached = subject();
    assert.equal(config.$timestamp, configCached.$timestamp);
  });

  it('making sure cached copy isn\'t actually global', function() {
    var configCached = GLOBAL.config;
    assert.notDeepEqual(config, configCached);
  });
});

describe('Update cached config', function() {
  var config  = null;
  var orig = null;

  before(function() {
    process.env.MR_CONFIGS_FILES = configs.json;
    subject.reset();
    config = subject({ watch: true });

    orig = _.clone(config);
  });

  it('when file changes', function(done) {
    var configClone = _.clone(config);
    configClone.property = 'test';

    var watcher = fs.watch(process.env.MR_CONFIGS_FILES, function() {
      watcher.close();

      assert.equal(config.property, 'test');
      done();
    });
    fs.writeFileSync(process.env.MR_CONFIGS_FILES, JSON.stringify(configClone));
  });

  it('using reload():', function() {
    config.reload();
  });

  after(function() {
    delete orig.$config;
    delete orig.$timestamp;
    delete orig.$metaData;

    fs.writeFileSync(process.env.MR_CONFIGS_FILES, JSON.stringify(orig));
  });
});

describe('Save config', function() {

  before(function() {
    process.env.MR_CONFIGS_FILES = configs.json;
    subject.reset();
  });

  it('to file', function() {
    var config = subject();
    config.property = 'save';

    config.save();

    subject.reset();
    var newConfig = subject();

    assert.deepEqual(config, newConfig);
  });
});

function removeHiddenProps(config) {
  delete config.$timestamp;
  delete config.$metaData;
  // delete config.$configs;
}
