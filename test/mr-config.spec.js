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
    conf = removeUnwantedProps(conf);

    assert.deepEqual(conf, parsed.json);
  });

  it('with type YAML', function() {
    process.env.MR_CONFIGS_FILES = configs.yaml;

    var conf = subject();
    conf = removeUnwantedProps(conf);

    assert.deepEqual(conf, parsed.yaml);
  });

  it('with type XML', function() {
    process.env.MR_CONFIGS_FILES = configs.xml;

    var conf = subject();
    conf = removeUnwantedProps(conf);

    assert.deepEqual(conf, parsed.xml);
  });

  it('with type properties', function() {
    process.env.MR_CONFIGS_FILES = configs.properties;

    var conf = subject();
    conf = removeUnwantedProps(conf);

    assert.deepEqual(conf, parsed.properties);
  });

  it('with custom parser', function() {
    process.env.MR_CONFIGS_FILES = configs.json;

    var conf = subject({ parser: function(filename) {
      return { parsed: filename };
    }});
    conf = removeUnwantedProps(conf);

    assert.equal(conf.parsed, process.env.MR_CONFIGS_FILES);
  });
});

describe('Load config', function() {
  var config  = null;

  before(function() {
    process.env.MR_CONFIGS_FILES = configs.json + ', ' + configs.json2;
    subject.reset();
    config = subject();
  });

  it('Using multiple configs', function() {
    assert(config.property);
    assert(config.numberTwo);
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
  var orig = null;
  var configClone = null;

  before(function() {
    process.env.MR_CONFIGS_FILES = configs.json;
    subject.reset();

    orig = subject();
    configClone = _.clone(orig);
  });

  beforeEach(function() {
    subject.reset();
  });

  it('when file changes', function(done) {
    config = subject({ watch: true });

    configClone.property = 'test';

    var watcher = fs.watch(process.env.MR_CONFIGS_FILES, function() {
      watcher.close();

      assert.equal(config.property, 'test');
      done();
    });
    writeFile(process.env.MR_CONFIGS_FILES, configClone);
  });

  it('using reload():', function() {
    config = subject();

    configClone.property = 'test2!';
    writeFile(process.env.MR_CONFIGS_FILES, configClone);

    config.reload();

    assert.equal(config.property, 'test2!');
  });

  after(function() {
    writeFile(process.env.MR_CONFIGS_FILES, orig);
  });
});

function removeUnwantedProps(config) {
  return _.omit(config, ['$timestamp', '$metaData', '$configs', 'reload']);
}

function writeFile(filename, config) {
  fs.writeFileSync(filename, JSON.stringify(removeUnwantedProps(config)));
}
