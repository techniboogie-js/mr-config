Merges configurations from multiple files, as specified in the MR_CONFIGS_FILES environment variable. Allowing for easy loading of environmental configurations.

```js
// apps.js
var config = require('mr-config');

// service.js
// Uses a cached copy of the configuration
var config = require('mr-config');
```

```bash
# config files are merged together. The right-most files
# will override existing duplicate properties.
MR_CONFIGS_FILES="app-config.json, db-config.json" node app.js
```

## Installation
```bash
npm install mr-config
```

## API
##### config.$configs | *Array*
The values retrieved from MR_CONFIGS_FILES
```js
var confFiles = config.$configs
// [ 'app-config.json', 'db-config.json' ]
```
___
##### config.$timestamp | *Number*
The milliseconds since the epoch
```js
var lastLoadTime = config.$timestamp
// 1443498715071
```
___
##### config.reload( [parser] )
Forces of reload of all config files into memory.
```js
config.reload();
// Reloads config in place
```
If a custom parser is needed, reload() can be invoked with a function.
```js
config.reload(function(filePath) {
  /*
   * Do Stuff
   */
  return object;
});
```
___
##### config.watch()
Creates a file system watcher for each configuration file
```js
config.watch()
// Will reload config in memory if any of the files change
```
___
##### config.unwatch()
Closes and config file watchers
```js
config.unwatch()
// Undoes the watch
```

## Change Log
##### 1.0.0
* First release
