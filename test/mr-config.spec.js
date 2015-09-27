var assert = require('assert');
var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var subject = require('..');
var parsed = require('./fixtures/parsed-configs');
var configs = require('./fixtures/the-configs');

describe('Parse config files', function() {

  it('with type JSON', function() {
    process.env.MR_CONFIGS_FILES = configs.json;

    subject.reload();

    var conf = removeUnwantedProps(subject);

    assert.deepEqual(conf, parsed.json);
  });

  it('with type JS', function() {
    process.env.MR_CONFIGS_FILES = configs.js;

    subject.reload();

    var conf = removeUnwantedProps(subject);

    assert.deepEqual(conf, parsed.js);
  });

  it('with type YAML', function() {
    process.env.MR_CONFIGS_FILES = configs.yaml;
    subject.reload();

    var conf = removeUnwantedProps(subject);

    assert.deepEqual(conf, parsed.yaml);
  });

  it('with type XML', function() {
    process.env.MR_CONFIGS_FILES = configs.xml;
    subject.reload();

    var conf = removeUnwantedProps(subject);

    assert.deepEqual(conf, parsed.xml);
  });

  it('with type properties', function() {
    process.env.MR_CONFIGS_FILES = configs.properties;
    subject.reload();

    var conf = removeUnwantedProps(subject);

    assert.deepEqual(conf, parsed.properties);
  });

  it('with custom parser', function() {
    process.env.MR_CONFIGS_FILES = configs.json;
    subject.reload(function(filename) {
      return { parsed: filename };
    });

    var conf = removeUnwantedProps(subject);

    assert.equal(conf.parsed, process.env.MR_CONFIGS_FILES);
  });
});

describe('Load config', function() {

  before(function() {
    process.env.MR_CONFIGS_FILES = configs.json + ', ' + configs.json2;
    subject.reload();
  });

  it('Using multiple configs', function() {
    assert(subject.property);
    assert(subject.numberTwo);
  });

  it('using cached copy', function() {
    var configCached = subject;
    assert.equal(subject.$timestamp, configCached.$timestamp);
  });

  it('making sure cached copy isn\'t actually global', function() {
    var configCached = GLOBAL.config;
    assert.notDeepEqual(subject, configCached);
  });
});

describe('Update cached config', function() {
  var orig = null;
  var configClone = null;

  before(function() {
    process.env.MR_CONFIGS_FILES = configs.json;
    subject.reload();

    orig = _.clone(subject);
    configClone = _.clone(orig);
  });

  beforeEach(function() {
    subject.reload();
  });

  it('when file changes', function(done) {
    subject.watch();

    configClone.property = 'test';

    var watcher = fs.watch(process.env.MR_CONFIGS_FILES, function() {
      watcher.close();

      assert.equal(subject.property, 'test');
      done();
    });
    writeFile(process.env.MR_CONFIGS_FILES, configClone);
  });

  it('using reload():', function() {
    configClone.property = 'test2!';
    writeFile(process.env.MR_CONFIGS_FILES, configClone);

    subject.reload();

    assert.equal(subject.property, 'test2!');
  });

  after(function() {
    writeFile(process.env.MR_CONFIGS_FILES, orig);
  });
});

describe('When missing env var', function() {
  var jsonPath = path.join(__dirname, 'fixtures');


  before(function() {
    process.env.MR_CONFIGS_FILES = '';
  });

  it('try to load config.json', function(done) {
    fs.stat(path.join(jsonPath, 'config.json'), function(err, stats) {

      if (err) {
        console.warn('./config.json not found');
      }
      else {
        process.chdir(jsonPath);
        subject.reload();
        assert.deepEqual(removeUnwantedProps(subject), parsed.json);
      }
      done();
    });
  });

  it('try to load default.js', function() {
    console.info('default.js needs to be tested manually');
  });

  after(function() {
    process.chdir('../..');
  });
});

function removeUnwantedProps(config) {
  return _.omit(config, [
    '$timestamp',
    '$configs',
    '$watchers',
    'reload',
    'watch',
    'unwatch'
  ]);
}

function writeFile(filename, config) {
  fs.writeFileSync(filename, JSON.stringify(removeUnwantedProps(config)));
}
