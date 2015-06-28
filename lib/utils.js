/**
 * Module dependencies.
 */
var debug = require('debug')('witty:utils');
var mime = require('express').static.mime;
var i8n = require('inflection');
var fs = require('fs');
var path = require('path');
var Module = require('module');

var FILE_EXTENSION_JSON = '.json';

/**
 * Parse accept params `str` returning an
 * object with `.value`, `.quality` and `.params`.
 * also includes `.originalIndex` for stable sorting
 *
 * @param {String} str
 * @return {Object}
 * @api private
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L235
 */
function acceptParams(str, index) {
  var parts = str.split(/ *; */);
  var ret = { value: parts[0], quality: 1, params: {}, originalIndex: index };

  for (var i = 1; i < parts.length; ++i) {
    var pms = parts[i].split(/ *= */);
    if ('q' == pms[0]) {
      ret.quality = parseFloat(pms[1]);
    } else {
      ret.params[pms[0]] = pms[1];
    }
  }

  return ret;
}

/**
 * Check if accept params are equal.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 * @api private
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L171
 */
function paramsEqual(a, b){
  return !Object.keys(a).some(function(k) {
    return a[k] != b[k];
  });
}

/**
 * Forward `functions` from `from` to `to`.
 *
 * The `this` context of forwarded functions remains bound to the `to` object,
 * ensuring that property polution does not occur.
 *
 * @param {Object} from
 * @param {Object} to
 * @param {Array} functions
 * @api private
 */
exports.forward = function(from, to, functions) {
  for (var i = 0, len = functions.length; i < len; i++) {
    var method = functions[i];
    from[method] = to[method].bind(to);
  }
};

/**
 * Underscore the given `str`.
 *
 * Examples:
 *
 *    underscore('FooBar');
 *    // => "foo_bar"
 *
 *    underscore('SSLError');
 *    // => "ssl_error"
 *
 * @param {String} str
 * @return {String}
 * @api protected
 */
exports.underscore = function(str) {
  str = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
  str = str.replace(/([a-z\d])([A-Z])/g, '$1_$2');
  str = str.replace(/-/g, '_');
  return str.toLowerCase();
};


/**
 * Extensionize the given `type`, for example "text/html" becomes "html".
 *
 * @param {String} type
 * @return {String}
 * @api protected
 */
exports.extensionizeType = function(type) {
  return type.indexOf('/') != -1 ? mime.extension(type) : type;
};

/**
 * Normalize the given `type`, for example "html" becomes "text/html".
 *
 * @param {String} type
 * @return {String}
 * @api protected
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L81
 */
exports.normalizeType = function(type) {
  return type.indexOf('/') !== -1
    ? acceptParams(type)
    : { value: mime.lookup(type), params: {} };
};

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {Array} types
 * @return {Array}
 * @api protected
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L95
 */
exports.normalizeTypes = function(types){
  var ret = [];

  for (var i = 0; i < types.length; ++i) {
    ret.push(exports.normalizeType(types[i]));
  }

  return ret;
};

/**
 * Return the acceptable type in `types`, if any.
 *
 * @param {Array} types
 * @param {String} str
 * @return {String}
 * @api private
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L113
 */
exports.acceptsArray = function(types, str) {
  // accept anything when Accept is not present
  if (!str) { return types[0]; }

  // parse
  var accepted = exports.parseAccept(str)
    , normalized = exports.normalizeTypes(types)
    , len = accepted.length;

  for (var i = 0; i < len; ++i) {
    for (var j = 0, jlen = types.length; j < jlen; ++j) {
      if (exports.accept(normalized[j], accepted[i])) {
        return types[j];
      }
    }
  }
};

/**
 * Check if `type(s)` are acceptable based on
 * the given `str`.
 *
 * @param {String|Array} type(s)
 * @param {String} str
 * @return {Boolean|String}
 * @api protected
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L140
 */
exports.accepts = function(type, str) {
  if ('string' == typeof type) { type = type.split(/ *, */); }
  return exports.acceptsArray(type, str);
};

/**
 * Check if `type` array is acceptable for `other`.
 *
 * @param {Array} type
 * @param {Object} other
 * @return {Boolean}
 * @api private
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L155
 */
exports.accept = function(type, other) {
  var t = type.value.split('/');
  return (t[0] == other.type || '*' == other.type)
    && (t[1] == other.subtype || '*' == other.subtype)
    && paramsEqual(type.params, other.params);
};

/**
 * Parse accept `str`, returning
 * an array objects containing
 * `.type` and `.subtype` along
 * with the values provided by
 * `parseParams()`.
 *
 * @param {Type} name
 * @return {Type}
 * @api private
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L186
 */
exports.parseAccept = function(str) {
  return exports
    .parseParams(str)
    .map(function(obj) {
      var parts = obj.value.split('/');
      obj.type = parts[0];
      obj.subtype = parts[1];
      return obj;
    });
};

/**
 * Parse quality `str`, returning an
 * array of objects with `.value`,
 * `.quality` and optional `.params`
 *
 * @param {String} str
 * @return {Array}
 * @api private
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L209
 */
exports.parseParams = function(str) {
  return str
    .split(/ *, */)
    .map(acceptParams)
    .filter(function(obj) {
      return obj.quality;
    })
    .sort(function(a, b) {
      if (a.quality === b.quality) {
        return a.originalIndex - b.originalIndex;
      } else {
        return b.quality - a.quality;
      }
    });
};

exports.acceptedViaArray = function(types, str) {
  // not accepted by anything when Accept is not present
  if (!str) { return undefined; }

  // parse
  var accepted = exports.parseAccept(str)
    , normalized = exports.normalizeTypes(types)
    , len = accepted.length;

  for (var i = 0; i < len; ++i) {
    for (var j = 0, jlen = types.length; j < jlen; ++j) {
      if (exports.accept(normalized[j], accepted[i])) {
        return accepted[i];
      }
    }
  }
};

exports.acceptedVia = function(type, str) {
  if ('string' == typeof type) { type = type.split(/ *, */); }
  return exports.acceptedViaArray(type, str);
};


/**
 * Escape special characters in the given string of html.
 *
 * @param {String} html
 * @return {String}
 * @api private
 *
 * CREDIT:
 *   https://github.com/visionmedia/express/blob/3.4.5/lib/utils.js#L261
 */

exports.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

exports.camelize = function(underscored, upcaseFirstLetter) {
  var res = '';
  underscored.split('_').forEach(function(part) {
    res += part[0].toUpperCase() + part.substr(1);
  });
  return upcaseFirstLetter ? res : res[0].toLowerCase() + res.substr(1);
};

exports.pluralize = function pluralize(str, plural) {
  return i8n.pluralize(str, plural);
};


exports.mergeObjects = mergeObjects;
function mergeObjects(target, config, keyPrefix) {
  for (var key in config) {
    var fullKey = keyPrefix ? keyPrefix + '.' + key : key;
    var err = mergeSingleItemOrProperty(target, config, key, fullKey);
    if (err) return err;
  }
  return null; // no error
}

exports.mergeSingleItemOrProperty = mergeSingleItemOrProperty;
function mergeSingleItemOrProperty(target, config, key, fullKey) {
  var origValue = target[key];
  var newValue = config[key];

  if (!hasCompatibleType(origValue, newValue)) {
    return 'Cannot merge values of incompatible types for the option `' +
      fullKey + '`.';
  }

  if (Array.isArray(origValue)) {
    return mergeArrays(origValue, newValue, fullKey);
  }

  if (typeof origValue === 'object') {
    return mergeObjects(origValue, newValue, fullKey);
  }

  target[key] = newValue;
  return null; // no error
}

exports.mergeArrays = mergeArrays;
function mergeArrays(target, config, keyPrefix) {
  if (target.length !== config.length) {
    return 'Cannot merge array values of different length' +
      ' for the option `' + keyPrefix + '`.';
  }

  // Use for(;;) to iterate over undefined items, for(in) would skip them.
  for (var ix = 0; ix < target.length; ix++) {
    var fullKey = keyPrefix + '[' + ix + ']';
    var err = mergeSingleItemOrProperty(target, config, ix, fullKey);
    if (err) return err;
  }

  return null; // no error
}

exports.hasCompatibleType = hasCompatibleType;
function hasCompatibleType(origValue, newValue) {
  if (origValue === null || origValue === undefined)
    return true;

  if (Array.isArray(origValue))
    return Array.isArray(newValue);

  if (typeof origValue === 'object')
    return typeof newValue === 'object';

  // Note: typeof Array() is 'object' too,
  // we don't need to explicitly check array types
  return typeof newValue !== 'object';
}

/**
 * Try to read a config file with .json extension
 * @param {string} cwd Dirname of the file
 * @param {string} fileName Name of the file without extension
 * @returns {Object|undefined} Content of the file, undefined if not found.
 */
exports.tryReadJsonConfig = tryReadJsonConfig;
function tryReadJsonConfig(cwd, fileName) {
  try {
    return require(path.join(cwd, fileName + '.json'));
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e;
    }
  }
}


exports.resolveAppScriptPath = resolveAppScriptPath;
function resolveAppScriptPath(rootDir, relativePath, resolveOptions) {
  var resolvedPath = resolveAppPath(rootDir, relativePath, resolveOptions);
  var sourceDir = path.dirname(resolvedPath);
  var files = tryReadDir(sourceDir);
  var fixedFile = fixFileExtension(resolvedPath, files, false);
  return (fixedFile === undefined ? resolvedPath : fixedFile);
}


function resolveAppPath(rootDir, relativePath, resolveOptions) {
  var resolvedPath = tryResolveAppPath(rootDir, relativePath, resolveOptions);
  if (resolvedPath === undefined) {
    var err = new Error('Cannot resolve path "' + relativePath + '"');
    err.code = 'PATH_NOT_FOUND';
    throw err;
  }
  return resolvedPath;
}

function tryResolveAppPath(rootDir, relativePath, resolveOptions) {
  var fullPath;
  var start = relativePath.substring(0, 2);

  /* In order to retain backward compatibility, we need to support
   * two ways how to treat values that are not relative nor absolute
   * path (e.g. `relativePath = 'foobar'`)
   *  - `resolveOptions.strict = true` searches in `node_modules` only
   *  - `resolveOptions.strict = false` attempts to resolve the value
   *     as a relative path first before searching `node_modules`
   */
  resolveOptions = resolveOptions || { strict: true };

  var isModuleRelative = false;
  if (relativePath[0] === '/') {
    fullPath = relativePath;
  } else if (start === './' || start === '..') {
    fullPath = path.resolve(rootDir, relativePath);
  } else if (!resolveOptions.strict) {
    isModuleRelative = true;
    fullPath = path.resolve(rootDir, relativePath);
  }

  if (fullPath) {
    // This check is needed to support paths pointing to a directory
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }

    try {
      fullPath = require.resolve(fullPath);
      return fullPath;
    } catch (err) {
      if (!isModuleRelative) {
        debug ('Skipping %s - %s', fullPath, err);
        return undefined;
      }
    }
  }

  // Handle module-relative path, e.g. `loopback/common/models`

  // Module.globalPaths is a list of globally configured paths like
  //   [ env.NODE_PATH values, $HOME/.node_modules, etc. ]
  // Module._nodeModulePaths(rootDir) returns a list of paths like
  //   [ rootDir/node_modules, rootDir/../node_modules, etc. ]
  var modulePaths = Module.globalPaths
    .concat(Module._nodeModulePaths(rootDir));

  fullPath = modulePaths
    .map(function(candidateDir) {
      var absPath = path.join(candidateDir, relativePath);
      try {
        // NOTE(bajtos) We need to create a proper String object here,
        // otherwise we can't attach additional properties to it
        /*jshint -W053 */
        var filePath = new String(require.resolve(absPath));
        filePath.unresolvedPath = absPath;
        return filePath;
      } catch (err) {
        return absPath;
      }
    })
    .filter(function(candidate) {
      return fs.existsSync(candidate.toString());
    })
    [0];

  if (fullPath) {
    if (fullPath.unresolvedPath && resolveOptions.fullResolve === false)
      return fullPath.unresolvedPath;
    // Convert String object back to plain string primitive
    return fullPath.toString();
  }

  debug ('Skipping %s - module not found', fullPath);
  return undefined;
}

function tryReadDir() {
  try {
    return fs.readdirSync.apply(fs, arguments);
  } catch (e) {
    return [];
  }
}

function resolveRelativePaths(relativePaths, appRootDir) {
  var resolveOpts = { strict: false };
  relativePaths.forEach(function(relativePath, k) {
    var resolvedPath = tryResolveAppPath(appRootDir, relativePath, resolveOpts);
    if (resolvedPath !== undefined) {
      relativePaths[k] = resolvedPath;
    } else {
      debug ('skipping boot script %s - unknown file', relativePath);
    }
  });
}

function getExcludedExtensions() {
  return {
    '.json': '.json',
    '.node': 'node'
  };
}

function isPreferredExtension (filename) {
  var includeExtensions = require.extensions;

  var ext = path.extname(filename);
  return (ext in includeExtensions) && !(ext in getExcludedExtensions());
}

function fixFileExtension(filepath, files, onlyScriptsExportingFunction) {
  var results = [];
  var otherFile;

  /* Prefer coffee scripts over json */
  if (isPreferredExtension(filepath)) return filepath;

  var basename = path.basename(filepath, FILE_EXTENSION_JSON);
  var sourceDir = path.dirname(filepath);

  files.forEach(function(f) {
    otherFile = path.resolve(sourceDir, f);

    var stats = fs.statSync(otherFile);
    if (stats.isFile()) {
      var otherFileExtension = path.extname(f);

      if (!(otherFileExtension in getExcludedExtensions()) &&
        path.basename(f, otherFileExtension) == basename) {
        if (!onlyScriptsExportingFunction)
          results.push(otherFile);
        else if (onlyScriptsExportingFunction &&
          (typeof require.extensions[otherFileExtension]) === 'function') {
          results.push(otherFile);
        }
      }
    }
  });
  return (results.length > 0 ? results[0] : undefined);
}

