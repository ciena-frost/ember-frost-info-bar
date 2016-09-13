/* jshint ignore:start */



/* jshint ignore:end */

;(function() {
/*!
 * @overview  Ember - JavaScript Application Framework
 * @copyright Copyright 2011-2016 Tilde Inc. and contributors
 *            Portions Copyright 2006-2011 Strobe Inc.
 *            Portions Copyright 2008-2011 Apple Inc. All rights reserved.
 * @license   Licensed under MIT license
 *            See https://raw.github.com/emberjs/ember.js/master/LICENSE
 * @version   2.6.2
 */

var enifed, requireModule, require, Ember;
var mainContext = this;

(function() {
  var isNode = typeof window === 'undefined' &&
    typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  if (!isNode) {
    Ember = this.Ember = this.Ember || {};
  }

  if (typeof Ember === 'undefined') { Ember = {}; }

  if (typeof Ember.__loader === 'undefined') {
    var registry = {};
    var seen = {};

    enifed = function(name, deps, callback) {
      var value = { };

      if (!callback) {
        value.deps = [];
        value.callback = deps;
      } else {
        value.deps = deps;
        value.callback = callback;
      }

      registry[name] = value;
    };

    require = requireModule = function(name) {
      return internalRequire(name, null);
    };

    // setup `require` module
    require['default'] = require;

    require.has = function registryHas(moduleName) {
      return !!registry[moduleName] || !!registry[moduleName + '/index'];
    };

    function missingModule(name, referrerName) {
      if (referrerName) {
        throw new Error('Could not find module ' + name + ' required by: ' + referrerName);
      } else {
        throw new Error('Could not find module ' + name);
      }
    }

    function internalRequire(_name, referrerName) {
      var name = _name;
      var mod = registry[name];

      if (!mod) {
        name = name + '/index';
        mod = registry[name];
      }

      var exports = seen[name];

      if (exports !== undefined) {
        return exports;
      }

      exports = seen[name] = {};

      if (!mod) {
        missingModule(_name, referrerName);
      }

      var deps = mod.deps;
      var callback = mod.callback;
      var length = deps.length;
      var reified = new Array(length);

      for (var i = 0; i < length; i++) {
        if (deps[i] === 'exports') {
          reified[i] = exports;
        } else if (deps[i] === 'require') {
          reified[i] = require;
        } else {
          reified[i] = internalRequire(deps[i], name);
        }
      }

      callback.apply(this, reified);

      return exports;
    }

    requireModule._eak_seen = registry;

    Ember.__loader = {
      define: enifed,
      require: require,
      registry: registry
    };
  } else {
    enifed = Ember.__loader.define;
    require = requireModule = Ember.__loader.require;
  }
})();

enifed('ember-debug/deprecate', ['exports', 'ember-metal/core', 'ember-metal/error', 'ember-metal/logger', 'ember-debug/handlers'], function (exports, _emberMetalCore, _emberMetalError, _emberMetalLogger, _emberDebugHandlers) {
  /*global __fail__*/

  'use strict';

  var _slice = Array.prototype.slice;
  exports.registerHandler = registerHandler;
  exports.default = deprecate;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('deprecate', handler);
  }

  function formatMessage(_message, options) {
    var message = _message;

    if (options && options.id) {
      message = message + (' [deprecation id: ' + options.id + ']');
    }

    if (options && options.url) {
      message += ' See ' + options.url + ' for more details.';
    }

    return message;
  }

  registerHandler(function logDeprecationToConsole(message, options) {
    var updatedMessage = formatMessage(message, options);

    _emberMetalLogger.default.warn('DEPRECATION: ' + updatedMessage);
  });

  var captureErrorForStack = undefined;

  if (new Error().stack) {
    captureErrorForStack = function () {
      return new Error();
    };
  } else {
    captureErrorForStack = function () {
      try {
        __fail__.fail();
      } catch (e) {
        return e;
      }
    };
  }

  registerHandler(function logDeprecationStackTrace(message, options, next) {
    if (_emberMetalCore.default.LOG_STACKTRACE_ON_DEPRECATION) {
      var stackStr = '';
      var error = captureErrorForStack();
      var stack = undefined;

      if (error.stack) {
        if (error['arguments']) {
          // Chrome
          stack = error.stack.replace(/^\s+at\s+/gm, '').replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
          stack.shift();
        } else {
          // Firefox
          stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
        }

        stackStr = '\n    ' + stack.slice(2).join('\n    ');
      }

      var updatedMessage = formatMessage(message, options);

      _emberMetalLogger.default.warn('DEPRECATION: ' + updatedMessage + stackStr);
    } else {
      next.apply(undefined, arguments);
    }
  });

  registerHandler(function raiseOnDeprecation(message, options, next) {
    if (_emberMetalCore.default.ENV.RAISE_ON_DEPRECATION) {
      var updatedMessage = formatMessage(message);

      throw new _emberMetalError.default(updatedMessage);
    } else {
      next.apply(undefined, arguments);
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.deprecate` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include `id` and `until` properties.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.deprecate` you must provide `id` in options.';
  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  var missingOptionsUntilDeprecation = 'When calling `Ember.deprecate` you must provide `until` in options.';

  exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only).
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method deprecate
    @param {String} message A description of the deprecation.
    @param {Boolean} test A boolean. If falsy, the deprecation
      will be displayed.
    @param {Object} options An object that can be used to pass
      in a `url` to the transition guide on the emberjs.com website, and a unique
      `id` for this deprecation. The `id` can be used by Ember debugging tools
      to change the behavior (raise, log or silence) for that specific deprecation.
      The `id` should be namespaced by dots, e.g. "view.helper.select".
    @for Ember
    @public
  */

  function deprecate(message, test, options) {
    if (!options || !options.id && !options.until) {
      deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.deprecate-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.deprecate-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.until) {
      deprecate(missingOptionsUntilDeprecation, options && options.until, {
        id: 'ember-debug.deprecate-until-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['deprecate'].concat(_slice.call(arguments)));
  }
});
enifed("ember-debug/handlers", ["exports"], function (exports) {
  "use strict";

  exports.registerHandler = registerHandler;
  exports.invoke = invoke;
  var HANDLERS = {};

  exports.HANDLERS = HANDLERS;

  function registerHandler(type, callback) {
    var nextHandler = HANDLERS[type] || function () {};

    HANDLERS[type] = function (message, options) {
      callback(message, options, nextHandler);
    };
  }

  function invoke(type, message, test, options) {
    if (test) {
      return;
    }

    var handlerForType = HANDLERS[type];

    if (!handlerForType) {
      return;
    }

    if (handlerForType) {
      handlerForType(message, options);
    }
  }
});
enifed('ember-debug/index', ['exports', 'ember-metal/core', 'ember-metal/debug', 'ember-metal/features', 'ember-metal/error', 'ember-metal/logger', 'ember-metal/environment', 'ember-debug/deprecate', 'ember-debug/warn'], function (exports, _emberMetalCore, _emberMetalDebug, _emberMetalFeatures, _emberMetalError, _emberMetalLogger, _emberMetalEnvironment, _emberDebugDeprecate, _emberDebugWarn) {
  'use strict';

  exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags;

  /**
  @module ember
  @submodule ember-debug
  */

  /**
  @class Ember
  @public
  */

  /**
    Define an assertion that will throw an exception if the condition is not met.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    // Test for truthiness
    Ember.assert('Must pass a valid object', obj);
  
    // Fail unconditionally
    Ember.assert('This code path should never be run');
    ```
  
    @method assert
    @param {String} desc A description of the assertion. This will become
      the text of the Error thrown if the assertion fails.
    @param {Boolean} test Must be truthy for the assertion to pass. If
      falsy, an exception will be thrown.
    @public
  */
  _emberMetalDebug.setDebugFunction('assert', function assert(desc, test) {
    if (!test) {
      throw new _emberMetalError.default('Assertion Failed: ' + desc);
    }
  });

  /**
    Display a debug notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.debug('I\'m a debug notice!');
    ```
  
    @method debug
    @param {String} message A debug message to display.
    @public
  */
  _emberMetalDebug.setDebugFunction('debug', function debug(message) {
    _emberMetalLogger.default.debug('DEBUG: ' + message);
  });

  /**
    Display an info notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method info
    @private
  */
  _emberMetalDebug.setDebugFunction('info', function info() {
    _emberMetalLogger.default.info.apply(undefined, arguments);
  });

  /**
    Alias an old, deprecated method with its new counterpart.
  
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only) when the assigned method is called.
  
    * In a production build, this method is defined as an empty function (NOP).
  
    ```javascript
    Ember.oldMethod = Ember.deprecateFunc('Please use the new, updated method', Ember.newMethod);
    ```
  
    @method deprecateFunc
    @param {String} message A description of the deprecation.
    @param {Object} [options] The options object for Ember.deprecate.
    @param {Function} func The new function called to replace its deprecated counterpart.
    @return {Function} A new function that wraps the original function with a deprecation warning
    @private
  */
  _emberMetalDebug.setDebugFunction('deprecateFunc', function deprecateFunc() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 3) {
      var _ret = (function () {
        var message = args[0];
        var options = args[1];
        var func = args[2];

        return {
          v: function () {
            _emberMetalDebug.deprecate(message, false, options);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else {
      var _ret2 = (function () {
        var message = args[0];
        var func = args[1];

        return {
          v: function () {
            _emberMetalDebug.deprecate(message);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret2 === 'object') return _ret2.v;
    }
  });

  /**
    Run a function meant for debugging.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.runInDebug(() => {
      Ember.Component.reopen({
        didInsertElement() {
          console.log("I'm happy");
        }
      });
    });
    ```
  
    @method runInDebug
    @param {Function} func The function to be executed.
    @since 1.5.0
    @public
  */
  _emberMetalDebug.setDebugFunction('runInDebug', function runInDebug(func) {
    func();
  });

  _emberMetalDebug.setDebugFunction('debugSeal', function debugSeal(obj) {
    Object.seal(obj);
  });

  _emberMetalDebug.setDebugFunction('deprecate', _emberDebugDeprecate.default);

  _emberMetalDebug.setDebugFunction('warn', _emberDebugWarn.default);

  /**
    Will call `Ember.warn()` if ENABLE_OPTIONAL_FEATURES or
    any specific FEATURES flag is truthy.
  
    This method is called automatically in debug canary builds.
  
    @private
    @method _warnIfUsingStrippedFeatureFlags
    @return {void}
  */

  function _warnIfUsingStrippedFeatureFlags(FEATURES, knownFeatures, featuresWereStripped) {
    if (featuresWereStripped) {
      _emberMetalDebug.warn('Ember.ENV.ENABLE_OPTIONAL_FEATURES is only available in canary builds.', !_emberMetalCore.default.ENV.ENABLE_OPTIONAL_FEATURES, { id: 'ember-debug.feature-flag-with-features-stripped' });

      var keys = Object.keys(FEATURES || {});
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === 'isEnabled' || !(key in knownFeatures)) {
          continue;
        }

        _emberMetalDebug.warn('FEATURE["' + key + '"] is set as enabled, but FEATURE flags are only available in canary builds.', !FEATURES[key], { id: 'ember-debug.feature-flag-with-features-stripped' });
      }
    }
  }

  if (!_emberMetalCore.default.testing) {
    // Complain if they're using FEATURE flags in builds other than canary
    _emberMetalFeatures.FEATURES['features-stripped-test'] = true;
    var featuresWereStripped = true;

    delete _emberMetalFeatures.FEATURES['features-stripped-test'];
    _warnIfUsingStrippedFeatureFlags(_emberMetalCore.default.ENV.FEATURES, _emberMetalFeatures.KNOWN_FEATURES, featuresWereStripped);

    // Inform the developer about the Ember Inspector if not installed.
    var isFirefox = _emberMetalEnvironment.default.isFirefox;
    var isChrome = _emberMetalEnvironment.default.isChrome;

    if (typeof window !== 'undefined' && (isFirefox || isChrome) && window.addEventListener) {
      window.addEventListener('load', function () {
        if (document.documentElement && document.documentElement.dataset && !document.documentElement.dataset.emberExtension) {
          var downloadURL;

          if (isChrome) {
            downloadURL = 'https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi';
          } else if (isFirefox) {
            downloadURL = 'https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/';
          }

          _emberMetalDebug.debug('For more advanced debugging, install the Ember Inspector from ' + downloadURL);
        }
      }, false);
    }
  }
  /**
    @public
    @class Ember.Debug
  */
  _emberMetalCore.default.Debug = {};

  /**
    Allows for runtime registration of handler functions that override the default deprecation behavior.
    Deprecations are invoked by calls to [Ember.deprecate](http://emberjs.com/api/classes/Ember.html#method_deprecate).
    The following example demonstrates its usage by registering a handler that throws an error if the
    message contains the word "should", otherwise defers to the default handler.
  
    ```javascript
    Ember.Debug.registerDeprecationHandler((message, options, next) => {
      if (message.indexOf('should') !== -1) {
        throw new Error(`Deprecation message with should: ${message}`);
      } else {
        // defer to whatever handler was registered before this one
        next(message, options);
      }
    }
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the deprecation call.</li>
      <li> <code>options</code> - An object passed in with the deprecation call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the deprecation in the form of <code>package-name.specific-deprecation</code>.</li>
          <li> <code>until</code> - The Ember version number the feature and deprecation will be removed in.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerDeprecationHandler
    @param handler {Function} A function to handle deprecation calls.
    @since 2.1.0
  */
  _emberMetalCore.default.Debug.registerDeprecationHandler = _emberDebugDeprecate.registerHandler;
  /**
    Allows for runtime registration of handler functions that override the default warning behavior.
    Warnings are invoked by calls made to [Ember.warn](http://emberjs.com/api/classes/Ember.html#method_warn).
    The following example demonstrates its usage by registering a handler that does nothing overriding Ember's
    default warning behavior.
  
    ```javascript
    // next is not called, so no warnings get the default behavior
    Ember.Debug.registerWarnHandler(() => {});
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the warn call. </li>
      <li> <code>options</code> - An object passed in with the warn call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the warning in the form of <code>package-name.specific-warning</code>.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerWarnHandler
    @param handler {Function} A function to handle warnings.
    @since 2.1.0
  */
  _emberMetalCore.default.Debug.registerWarnHandler = _emberDebugWarn.registerHandler;

  /*
    We are transitioning away from `ember.js` to `ember.debug.js` to make
    it much clearer that it is only for local development purposes.
  
    This flag value is changed by the tooling (by a simple string replacement)
    so that if `ember.js` (which must be output for backwards compat reasons) is
    used a nice helpful warning message will be printed out.
  */
  var runningNonEmberDebugJS = false;
  exports.runningNonEmberDebugJS = runningNonEmberDebugJS;
  if (runningNonEmberDebugJS) {
    _emberMetalDebug.warn('Please use `ember.debug.js` instead of `ember.js` for development and debugging.');
  }
});
enifed('ember-debug/warn', ['exports', 'ember-metal/logger', 'ember-metal/debug', 'ember-debug/handlers'], function (exports, _emberMetalLogger, _emberMetalDebug, _emberDebugHandlers) {
  'use strict';

  var _slice = Array.prototype.slice;
  exports.registerHandler = registerHandler;
  exports.default = warn;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('warn', handler);
  }

  registerHandler(function logWarning(message, options) {
    _emberMetalLogger.default.warn('WARNING: ' + message);
    if ('trace' in _emberMetalLogger.default) {
      _emberMetalLogger.default.trace();
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.warn` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include an `id` property.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.warn` you must provide `id` in options.';

  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a warning with the provided message.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method warn
    @param {String} message A warning to display.
    @param {Boolean} test An optional boolean. If falsy, the warning
      will be displayed.
    @param {Object} options An object that can be used to pass a unique
      `id` for this warning.  The `id` can be used by Ember debugging tools
      to change the behavior (raise, log, or silence) for that specific warning.
      The `id` should be namespaced by dots, e.g. "ember-debug.feature-flag-with-features-stripped"
    @for Ember
    @public
  */

  function warn(message, test, options) {
    if (!options) {
      _emberMetalDebug.deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.warn-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      _emberMetalDebug.deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.warn-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['warn'].concat(_slice.call(arguments)));
  }
});
enifed('ember-testing/adapters/adapter', ['exports', 'ember-runtime/system/object'], function (exports, _emberRuntimeSystemObject) {
  'use strict';

  function K() {
    return this;
  }

  /**
   @module ember
   @submodule ember-testing
  */

  /**
    The primary purpose of this class is to create hooks that can be implemented
    by an adapter for various test frameworks.
  
    @class Adapter
    @namespace Ember.Test
    @public
  */
  var Adapter = _emberRuntimeSystemObject.default.extend({
    /**
      This callback will be called whenever an async operation is about to start.
       Override this to call your framework's methods that handle async
      operations.
       @public
      @method asyncStart
    */
    asyncStart: K,

    /**
      This callback will be called whenever an async operation has completed.
       @public
      @method asyncEnd
    */
    asyncEnd: K,

    /**
      Override this method with your testing framework's false assertion.
      This function is called whenever an exception occurs causing the testing
      promise to fail.
       QUnit example:
       ```javascript
        exception: function(error) {
          ok(false, error);
        };
      ```
       @public
      @method exception
      @param {String} error The exception to be raised.
    */
    exception: function (error) {
      throw error;
    }
  });

  exports.default = Adapter;
});
enifed('ember-testing/adapters/qunit', ['exports', 'ember-testing/adapters/adapter', 'ember-metal/utils'], function (exports, _emberTestingAdaptersAdapter, _emberMetalUtils) {
  'use strict';

  /**
    This class implements the methods defined by Ember.Test.Adapter for the
    QUnit testing framework.
  
    @class QUnitAdapter
    @namespace Ember.Test
    @extends Ember.Test.Adapter
    @public
  */
  exports.default = _emberTestingAdaptersAdapter.default.extend({
    asyncStart: function () {
      QUnit.stop();
    },
    asyncEnd: function () {
      QUnit.start();
    },
    exception: function (error) {
      ok(false, _emberMetalUtils.inspect(error));
    }
  });
});
enifed('ember-testing/helpers', ['exports', 'ember-metal/property_get', 'ember-metal/error', 'ember-metal/run_loop', 'ember-views/system/jquery', 'ember-testing/test', 'ember-runtime/ext/rsvp', 'ember-metal/features'], function (exports, _emberMetalProperty_get, _emberMetalError, _emberMetalRun_loop, _emberViewsSystemJquery, _emberTestingTest, _emberRuntimeExtRsvp, _emberMetalFeatures) {
  'use strict';

  /**
  @module ember
  @submodule ember-testing
  */

  var helper = _emberTestingTest.default.registerHelper;
  var asyncHelper = _emberTestingTest.default.registerAsyncHelper;

  var keyboardEventTypes, mouseEventTypes, buildKeyboardEvent, buildMouseEvent, buildBasicEvent, fireEvent, focus;

  var defaultEventOptions = { canBubble: true, cancelable: true };
  keyboardEventTypes = ['keydown', 'keypress', 'keyup'];
  mouseEventTypes = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];

  buildKeyboardEvent = function buildKeyboardEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('KeyEvents');
      var eventOpts = _emberViewsSystemJquery.default.extend({}, defaultEventOptions, options);
      event.initKeyEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  };

  buildMouseEvent = function buildMouseEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = _emberViewsSystemJquery.default.extend({}, defaultEventOptions, options);
      event.initMouseEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  };

  buildBasicEvent = function buildBasicEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = document.createEvent('Events');
    event.initEvent(type, true, true);
    _emberViewsSystemJquery.default.extend(event, options);
    return event;
  };

  fireEvent = function fireEvent(element, type) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!element) {
      return;
    }
    var event = undefined;
    if (keyboardEventTypes.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (mouseEventTypes.indexOf(type) > -1) {
      var rect = element.getBoundingClientRect();
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5,
        screenY: y + 95,
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, _emberViewsSystemJquery.default.extend(simulatedCoordinates, options));
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
  };

  focus = function focus(el) {
    if (!el) {
      return;
    }
    var $el = _emberViewsSystemJquery.default(el);
    if ($el.is(':input, [contenteditable=true]')) {
      var type = $el.prop('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        _emberMetalRun_loop.default(null, function () {
          // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document doesn't have focus just
          // use trigger('focusin') instead.

          if (!document.hasFocus || document.hasFocus()) {
            el.focus();
          } else {
            $el.trigger('focusin');
          }
        });
      }
    }
  };

  function currentRouteName(app) {
    var routingService = app.__container__.lookup('service:-routing');

    return _emberMetalProperty_get.get(routingService, 'currentRouteName');
  }

  function currentPath(app) {
    var routingService = app.__container__.lookup('service:-routing');

    return _emberMetalProperty_get.get(routingService, 'currentPath');
  }

  function currentURL(app) {
    var router = app.__container__.lookup('router:main');

    return _emberMetalProperty_get.get(router, 'location').getURL();
  }

  function pauseTest() {
    _emberTestingTest.default.adapter.asyncStart();
    return new _emberRuntimeExtRsvp.default.Promise(function () {}, 'TestAdapter paused promise');
  }

  function visit(app, url) {
    var router = app.__container__.lookup('router:main');
    var shouldHandleURL = false;

    app.boot().then(function () {
      router.location.setURL(url);

      if (shouldHandleURL) {
        _emberMetalRun_loop.default(app.__deprecatedInstance__, 'handleURL', url);
      }
    });

    if (app._readinessDeferrals > 0) {
      router['initialURL'] = url;
      _emberMetalRun_loop.default(app, 'advanceReadiness');
      delete router['initialURL'];
    } else {
      shouldHandleURL = true;
    }

    return app.testHelpers.wait();
  }

  function click(app, selector, context) {
    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberMetalRun_loop.default(null, fireEvent, el, 'mousedown');

    focus(el);

    _emberMetalRun_loop.default(null, fireEvent, el, 'mouseup');
    _emberMetalRun_loop.default(null, fireEvent, el, 'click');

    return app.testHelpers.wait();
  }

  function triggerEvent(app, selector, contextOrType, typeOrOptions, possibleOptions) {
    var arity = arguments.length;
    var context, type, options;

    if (arity === 3) {
      // context and options are optional, so this is
      // app, selector, type
      context = null;
      type = contextOrType;
      options = {};
    } else if (arity === 4) {
      // context and options are optional, so this is
      if (typeof typeOrOptions === 'object') {
        // either
        // app, selector, type, options
        context = null;
        type = contextOrType;
        options = typeOrOptions;
      } else {
        // or
        // app, selector, context, type
        context = contextOrType;
        type = typeOrOptions;
        options = {};
      }
    } else {
      context = contextOrType;
      type = typeOrOptions;
      options = possibleOptions;
    }

    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberMetalRun_loop.default(null, fireEvent, el, type, options);

    return app.testHelpers.wait();
  }

  function keyEvent(app, selector, contextOrType, typeOrKeyCode, keyCode) {
    var context, type;

    if (typeof keyCode === 'undefined') {
      context = null;
      keyCode = typeOrKeyCode;
      type = contextOrType;
    } else {
      context = contextOrType;
      type = typeOrKeyCode;
    }

    return app.testHelpers.triggerEvent(selector, context, type, { keyCode: keyCode, which: keyCode });
  }

  function fillIn(app, selector, contextOrText, text) {
    var $el, el, context;
    if (typeof text === 'undefined') {
      text = contextOrText;
    } else {
      context = contextOrText;
    }
    $el = app.testHelpers.findWithAssert(selector, context);
    el = $el[0];
    focus(el);
    _emberMetalRun_loop.default(function () {
      $el.val(text);
      fireEvent(el, 'input');
      fireEvent(el, 'change');
    });
    return app.testHelpers.wait();
  }

  function findWithAssert(app, selector, context) {
    var $el = app.testHelpers.find(selector, context);
    if ($el.length === 0) {
      throw new _emberMetalError.default('Element ' + selector + ' not found.');
    }
    return $el;
  }

  function find(app, selector, context) {
    var $el;
    context = context || _emberMetalProperty_get.get(app, 'rootElement');
    $el = app.$(selector, context);

    return $el;
  }

  function andThen(app, callback) {
    return app.testHelpers.wait(callback(app));
  }

  function wait(app, value) {
    return new _emberRuntimeExtRsvp.default.Promise(function (resolve) {
      var router = app.__container__.lookup('router:main');

      // Every 10ms, poll for the async thing to have finished
      var watcher = setInterval(function () {
        // 1. If the router is loading, keep polling
        var routerIsLoading = router.router && !!router.router.activeTransition;
        if (routerIsLoading) {
          return;
        }

        // 2. If there are pending Ajax requests, keep polling
        if (_emberTestingTest.default.pendingAjaxRequests) {
          return;
        }

        // 3. If there are scheduled timers or we are inside of a run loop, keep polling
        if (_emberMetalRun_loop.default.hasScheduledTimers() || _emberMetalRun_loop.default.currentRunLoop) {
          return;
        }
        if (_emberTestingTest.default.waiters && _emberTestingTest.default.waiters.any(function (waiter) {
          var context = waiter[0];
          var callback = waiter[1];
          return !callback.call(context);
        })) {
          return;
        }
        // Stop polling
        clearInterval(watcher);

        // Synchronously resolve the promise
        _emberMetalRun_loop.default(null, resolve, value);
      }, 10);
    });
  }

  /**
    Loads a route, sets up any controllers, and renders any templates associated
    with the route as though a real user had triggered the route change while
    using your app.
  
    Example:
  
    ```javascript
    visit('posts/index').then(function() {
      // assert something
    });
    ```
  
    @method visit
    @param {String} url the name of the route
    @return {RSVP.Promise}
    @public
  */
  asyncHelper('visit', visit);

  /**
    Clicks an element and triggers any actions triggered by the element's `click`
    event.
  
    Example:
  
    ```javascript
    click('.some-jQuery-selector').then(function() {
      // assert something
    });
    ```
  
    @method click
    @param {String} selector jQuery selector for finding element on the DOM
    @return {RSVP.Promise}
    @public
  */
  asyncHelper('click', click);

  /**
    Simulates a key event, e.g. `keypress`, `keydown`, `keyup` with the desired keyCode
  
    Example:
  
    ```javascript
    keyEvent('.some-jQuery-selector', 'keypress', 13).then(function() {
     // assert something
    });
    ```
  
    @method keyEvent
    @param {String} selector jQuery selector for finding element on the DOM
    @param {String} type the type of key event, e.g. `keypress`, `keydown`, `keyup`
    @param {Number} keyCode the keyCode of the simulated key event
    @return {RSVP.Promise}
    @since 1.5.0
    @public
  */
  asyncHelper('keyEvent', keyEvent);

  /**
    Fills in an input element with some text.
  
    Example:
  
    ```javascript
    fillIn('#email', 'you@example.com').then(function() {
      // assert something
    });
    ```
  
    @method fillIn
    @param {String} selector jQuery selector finding an input element on the DOM
    to fill text with
    @param {String} text text to place inside the input element
    @return {RSVP.Promise}
    @public
  */
  asyncHelper('fillIn', fillIn);

  /**
    Finds an element in the context of the app's container element. A simple alias
    for `app.$(selector)`.
  
    Example:
  
    ```javascript
    var $el = find('.my-selector');
    ```
  
    @method find
    @param {String} selector jQuery string selector for element lookup
    @return {Object} jQuery object representing the results of the query
    @public
  */
  helper('find', find);

  /**
    Like `find`, but throws an error if the element selector returns no results.
  
    Example:
  
    ```javascript
    var $el = findWithAssert('.doesnt-exist'); // throws error
    ```
  
    @method findWithAssert
    @param {String} selector jQuery selector string for finding an element within
    the DOM
    @return {Object} jQuery object representing the results of the query
    @throws {Error} throws error if jQuery object returned has a length of 0
    @public
  */
  helper('findWithAssert', findWithAssert);

  /**
    Causes the run loop to process any pending events. This is used to ensure that
    any async operations from other helpers (or your assertions) have been processed.
  
    This is most often used as the return value for the helper functions (see 'click',
    'fillIn','visit',etc).
  
    Example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('loginUser', function(app, username, password) {
      visit('secured/path/here')
      .fillIn('#username', username)
      .fillIn('#password', password)
      .click('.submit')
  
      return app.testHelpers.wait();
    });
  
    @method wait
    @param {Object} value The value to be returned.
    @return {RSVP.Promise}
    @public
  */
  asyncHelper('wait', wait);
  asyncHelper('andThen', andThen);

  /**
    Returns the currently active route name.
  
  Example:
  
  ```javascript
  function validateRouteName() {
    equal(currentRouteName(), 'some.path', "correct route was transitioned into.");
  }
  
  visit('/some/path').then(validateRouteName)
  ```
  
  @method currentRouteName
  @return {Object} The name of the currently active route.
  @since 1.5.0
  @public
  */
  helper('currentRouteName', currentRouteName);

  /**
    Returns the current path.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentPath(), 'some.path.index', "correct path was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentPath
  @return {Object} The currently active path.
  @since 1.5.0
  @public
  */
  helper('currentPath', currentPath);

  /**
    Returns the current URL.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentURL(), '/some/path', "correct URL was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentURL
  @return {Object} The currently active URL.
  @since 1.5.0
  @public
  */
  helper('currentURL', currentURL);

  /**
   Pauses the current test - this is useful for debugging while testing or for test-driving.
   It allows you to inspect the state of your application at any point.
  
   Example (The test will pause before clicking the button):
  
   ```javascript
   visit('/')
   return pauseTest();
  
   click('.btn');
   ```
  
   @since 1.9.0
   @method pauseTest
   @return {Object} A promise that will never resolve
   @public
  */
  helper('pauseTest', pauseTest);

  /**
    Triggers the given DOM event on the element identified by the provided selector.
  
    Example:
  
    ```javascript
    triggerEvent('#some-elem-id', 'blur');
    ```
  
    This is actually used internally by the `keyEvent` helper like so:
  
    ```javascript
    triggerEvent('#some-elem-id', 'keypress', { keyCode: 13 });
    ```
  
   @method triggerEvent
   @param {String} selector jQuery selector for finding element on the DOM
   @param {String} [context] jQuery selector that will limit the selector
                             argument to find only within the context's children
   @param {String} type The event type to be triggered.
   @param {Object} [options] The options to be passed to jQuery.Event.
   @return {RSVP.Promise}
   @since 1.5.0
   @public
  */
  asyncHelper('triggerEvent', triggerEvent);
});

// Firefox does not trigger the `focusin` event if the window
// does not have focus. If the document doesn't have focus just
// use trigger('focusin') instead.
enifed('ember-testing/index', ['exports', 'ember-metal/core', 'ember-testing/initializers', 'ember-testing/support', 'ember-testing/setup_for_testing', 'ember-testing/test', 'ember-testing/adapters/adapter', 'ember-testing/adapters/qunit', 'ember-testing/helpers'], function (exports, _emberMetalCore, _emberTestingInitializers, _emberTestingSupport, _emberTestingSetup_for_testing, _emberTestingTest, _emberTestingAdaptersAdapter, _emberTestingAdaptersQunit, _emberTestingHelpers) {
  'use strict';

  // adds helpers to helpers object in Test

  /**
    @module ember
    @submodule ember-testing
  */

  _emberMetalCore.default.Test = _emberTestingTest.default;
  _emberMetalCore.default.Test.Adapter = _emberTestingAdaptersAdapter.default;
  _emberMetalCore.default.Test.QUnitAdapter = _emberTestingAdaptersQunit.default;
  _emberMetalCore.default.setupForTesting = _emberTestingSetup_for_testing.default;
});
// to setup initializer
// to handle various edge cases
enifed('ember-testing/initializers', ['exports', 'ember-runtime/system/lazy_load'], function (exports, _emberRuntimeSystemLazy_load) {
  'use strict';

  var name = 'deferReadiness in `testing` mode';

  _emberRuntimeSystemLazy_load.onLoad('Ember.Application', function (Application) {
    if (!Application.initializers[name]) {
      Application.initializer({
        name: name,

        initialize: function (application) {
          if (application.testing) {
            application.deferReadiness();
          }
        }
      });
    }
  });
});
enifed('ember-testing/setup_for_testing', ['exports', 'ember-metal/core', 'ember-testing/adapters/qunit', 'ember-views/system/jquery'], function (exports, _emberMetalCore, _emberTestingAdaptersQunit, _emberViewsSystemJquery) {
  'use strict';

  exports.default = setupForTesting;

  var Test, requests;

  function incrementAjaxPendingRequests(_, xhr) {
    requests.push(xhr);
    Test.pendingAjaxRequests = requests.length;
  }

  function decrementAjaxPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
      }
    }
    Test.pendingAjaxRequests = requests.length;
  }

  /**
    Sets Ember up for testing. This is useful to perform
    basic setup steps in order to unit test.
  
    Use `App.setupForTesting` to perform integration tests (full
    application testing).
  
    @method setupForTesting
    @namespace Ember
    @since 1.5.0
    @private
  */

  function setupForTesting() {
    if (!Test) {
      Test = requireModule('ember-testing/test')['default'];
    }

    _emberMetalCore.default.testing = true;

    // if adapter is not manually set default to QUnit
    if (!Test.adapter) {
      Test.adapter = _emberTestingAdaptersQunit.default.create();
    }

    requests = [];
    Test.pendingAjaxRequests = requests.length;

    _emberViewsSystemJquery.default(document).off('ajaxSend', incrementAjaxPendingRequests);
    _emberViewsSystemJquery.default(document).off('ajaxComplete', decrementAjaxPendingRequests);
    _emberViewsSystemJquery.default(document).on('ajaxSend', incrementAjaxPendingRequests);
    _emberViewsSystemJquery.default(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }
});

// import Test from "ember-testing/test";  // ES6TODO: fix when cycles are supported
enifed('ember-testing/support', ['exports', 'ember-metal/debug', 'ember-views/system/jquery', 'ember-metal/environment'], function (exports, _emberMetalDebug, _emberViewsSystemJquery, _emberMetalEnvironment) {
  'use strict';

  /**
    @module ember
    @submodule ember-testing
  */

  var $ = _emberViewsSystemJquery.default;

  /**
    This method creates a checkbox and triggers the click event to fire the
    passed in handler. It is used to correct for a bug in older versions
    of jQuery (e.g 1.8.3).
  
    @private
    @method testCheckboxClick
  */
  function testCheckboxClick(handler) {
    $('<input type="checkbox">').css({ position: 'absolute', left: '-1000px', top: '-1000px' }).appendTo('body').on('click', handler).trigger('click').remove();
  }

  if (_emberMetalEnvironment.default.hasDOM) {
    $(function () {
      /*
        Determine whether a checkbox checked using jQuery's "click" method will have
        the correct value for its checked property.
         If we determine that the current jQuery version exhibits this behavior,
        patch it to work correctly as in the commit for the actual fix:
        https://github.com/jquery/jquery/commit/1fb2f92.
      */
      testCheckboxClick(function () {
        if (!this.checked && !$.event.special.click) {
          $.event.special.click = {
            // For checkbox, fire native event so checked state will be right
            trigger: function () {
              if ($.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                this.click();
                return false;
              }
            }
          };
        }
      });

      // Try again to verify that the patch took effect or blow up.
      testCheckboxClick(function () {
        _emberMetalDebug.warn('clicked checkboxes should be checked! the jQuery patch didn\'t work', this.checked, { id: 'ember-testing.test-checkbox-click' });
      });
    });
  }
});
enifed('ember-testing/test', ['exports', 'ember-metal/run_loop', 'ember-runtime/ext/rsvp', 'ember-testing/setup_for_testing', 'ember-application/system/application', 'ember-runtime/system/native_array'], function (exports, _emberMetalRun_loop, _emberRuntimeExtRsvp, _emberTestingSetup_for_testing, _emberApplicationSystemApplication, _emberRuntimeSystemNative_array) {
  'use strict';

  /**
    @module ember
    @submodule ember-testing
  */
  var helpers = {};
  var injectHelpersCallbacks = [];

  /**
    This is a container for an assortment of testing related functionality:
  
    * Choose your default test adapter (for your framework of choice).
    * Register/Unregister additional test helpers.
    * Setup callbacks to be fired when the test helpers are injected into
      your application.
  
    @class Test
    @namespace Ember
    @public
  */
  var Test = {
    /**
      Hash containing all known test helpers.
       @property _helpers
      @private
      @since 1.7.0
    */
    _helpers: helpers,

    /**
      `registerHelper` is used to register a test helper that will be injected
      when `App.injectTestHelpers` is called.
       The helper method will always be called with the current Application as
      the first parameter.
       For example:
       ```javascript
      Ember.Test.registerHelper('boot', function(app) {
        Ember.run(app, app.advanceReadiness);
      });
      ```
       This helper can later be called without arguments because it will be
      called with `app` as the first parameter.
       ```javascript
      App = Ember.Application.create();
      App.injectTestHelpers();
      boot();
      ```
       @public
      @method registerHelper
      @param {String} name The name of the helper method to add.
      @param {Function} helperMethod
      @param options {Object}
    */
    registerHelper: function (name, helperMethod) {
      helpers[name] = {
        method: helperMethod,
        meta: { wait: false }
      };
    },

    /**
      `registerAsyncHelper` is used to register an async test helper that will be injected
      when `App.injectTestHelpers` is called.
       The helper method will always be called with the current Application as
      the first parameter.
       For example:
       ```javascript
      Ember.Test.registerAsyncHelper('boot', function(app) {
        Ember.run(app, app.advanceReadiness);
      });
      ```
       The advantage of an async helper is that it will not run
      until the last async helper has completed.  All async helpers
      after it will wait for it complete before running.
        For example:
       ```javascript
      Ember.Test.registerAsyncHelper('deletePost', function(app, postId) {
        click('.delete-' + postId);
      });
       // ... in your test
      visit('/post/2');
      deletePost(2);
      visit('/post/3');
      deletePost(3);
      ```
       @public
      @method registerAsyncHelper
      @param {String} name The name of the helper method to add.
      @param {Function} helperMethod
      @since 1.2.0
    */
    registerAsyncHelper: function (name, helperMethod) {
      helpers[name] = {
        method: helperMethod,
        meta: { wait: true }
      };
    },

    /**
      Remove a previously added helper method.
       Example:
       ```javascript
      Ember.Test.unregisterHelper('wait');
      ```
       @public
      @method unregisterHelper
      @param {String} name The helper to remove.
    */
    unregisterHelper: function (name) {
      delete helpers[name];
      delete Test.Promise.prototype[name];
    },

    /**
      Used to register callbacks to be fired whenever `App.injectTestHelpers`
      is called.
       The callback will receive the current application as an argument.
       Example:
       ```javascript
      Ember.Test.onInjectHelpers(function() {
        Ember.$(document).ajaxSend(function() {
          Test.pendingAjaxRequests++;
        });
         Ember.$(document).ajaxComplete(function() {
          Test.pendingAjaxRequests--;
        });
      });
      ```
       @public
      @method onInjectHelpers
      @param {Function} callback The function to be called.
    */
    onInjectHelpers: function (callback) {
      injectHelpersCallbacks.push(callback);
    },

    /**
      This returns a thenable tailored for testing.  It catches failed
      `onSuccess` callbacks and invokes the `Ember.Test.adapter.exception`
      callback in the last chained then.
       This method should be returned by async helpers such as `wait`.
       @public
      @method promise
      @param {Function} resolver The function used to resolve the promise.
      @param {String} label An optional string for identifying the promise.
    */
    promise: function (resolver, label) {
      var fullLabel = 'Ember.Test.promise: ' + (label || '<Unknown Promise>');
      return new Test.Promise(resolver, fullLabel);
    },

    /**
     Used to allow ember-testing to communicate with a specific testing
     framework.
      You can manually set it before calling `App.setupForTesting()`.
      Example:
      ```javascript
     Ember.Test.adapter = MyCustomAdapter.create()
     ```
      If you do not set it, ember-testing will default to `Ember.Test.QUnitAdapter`.
      @public
     @property adapter
     @type {Class} The adapter to be used.
     @default Ember.Test.QUnitAdapter
    */
    adapter: null,

    /**
      Replacement for `Ember.RSVP.resolve`
      The only difference is this uses
      an instance of `Ember.Test.Promise`
       @public
      @method resolve
      @param {Mixed} The value to resolve
      @since 1.2.0
    */
    resolve: function (val) {
      return Test.promise(function (resolve) {
        return resolve(val);
      });
    },

    /**
       This allows ember-testing to play nicely with other asynchronous
       events, such as an application that is waiting for a CSS3
       transition or an IndexDB transaction.
        For example:
        ```javascript
       Ember.Test.registerWaiter(function() {
         return myPendingTransactions() == 0;
       });
       ```
       The `context` argument allows you to optionally specify the `this`
       with which your callback will be invoked.
        For example:
        ```javascript
       Ember.Test.registerWaiter(MyDB, MyDB.hasPendingTransactions);
       ```
        @public
       @method registerWaiter
       @param {Object} context (optional)
       @param {Function} callback
       @since 1.2.0
    */
    registerWaiter: function (context, callback) {
      if (arguments.length === 1) {
        callback = context;
        context = null;
      }
      if (!this.waiters) {
        this.waiters = _emberRuntimeSystemNative_array.A();
      }
      this.waiters.push([context, callback]);
    },
    /**
       `unregisterWaiter` is used to unregister a callback that was
       registered with `registerWaiter`.
        @public
       @method unregisterWaiter
       @param {Object} context (optional)
       @param {Function} callback
       @since 1.2.0
    */
    unregisterWaiter: function (context, callback) {
      if (!this.waiters) {
        return;
      }
      if (arguments.length === 1) {
        callback = context;
        context = null;
      }
      this.waiters = _emberRuntimeSystemNative_array.A(this.waiters.filter(function (elt) {
        return !(elt[0] === context && elt[1] === callback);
      }));
    }
  };

  function helper(app, name) {
    var fn = helpers[name].method;
    var meta = helpers[name].meta;

    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var lastPromise;

      args.unshift(app);

      // some helpers are not async and
      // need to return a value immediately.
      // example: `find`
      if (!meta.wait) {
        return fn.apply(app, args);
      }

      lastPromise = run(function () {
        return Test.resolve(Test.lastPromise);
      });

      // wait for last helper's promise to resolve and then
      // execute. To be safe, we need to tell the adapter we're going
      // asynchronous here, because fn may not be invoked before we
      // return.
      Test.adapter.asyncStart();
      return lastPromise.then(function () {
        return fn.apply(app, args);
      }).finally(function () {
        Test.adapter.asyncEnd();
      });
    };
  }

  function run(fn) {
    if (!_emberMetalRun_loop.default.currentRunLoop) {
      return _emberMetalRun_loop.default(fn);
    } else {
      return fn();
    }
  }

  _emberApplicationSystemApplication.default.reopen({
    /**
     This property contains the testing helpers for the current application. These
     are created once you call `injectTestHelpers` on your `Ember.Application`
     instance. The included helpers are also available on the `window` object by
     default, but can be used from this object on the individual application also.
       @property testHelpers
      @type {Object}
      @default {}
      @public
    */
    testHelpers: {},

    /**
     This property will contain the original methods that were registered
     on the `helperContainer` before `injectTestHelpers` is called.
      When `removeTestHelpers` is called, these methods are restored to the
     `helperContainer`.
       @property originalMethods
      @type {Object}
      @default {}
      @private
      @since 1.3.0
    */
    originalMethods: {},

    /**
    This property indicates whether or not this application is currently in
    testing mode. This is set when `setupForTesting` is called on the current
    application.
     @property testing
    @type {Boolean}
    @default false
    @since 1.3.0
    @public
    */
    testing: false,

    /**
      This hook defers the readiness of the application, so that you can start
      the app when your tests are ready to run. It also sets the router's
      location to 'none', so that the window's location will not be modified
      (preventing both accidental leaking of state between tests and interference
      with your testing framework).
       Example:
       ```
      App.setupForTesting();
      ```
       @method setupForTesting
      @public
    */
    setupForTesting: function () {
      _emberTestingSetup_for_testing.default();

      this.testing = true;

      this.Router.reopen({
        location: 'none'
      });
    },

    /**
      This will be used as the container to inject the test helpers into. By
      default the helpers are injected into `window`.
       @property helperContainer
      @type {Object} The object to be used for test helpers.
      @default window
      @since 1.2.0
      @private
    */
    helperContainer: null,

    /**
      This injects the test helpers into the `helperContainer` object. If an object is provided
      it will be used as the helperContainer. If `helperContainer` is not set it will default
      to `window`. If a function of the same name has already been defined it will be cached
      (so that it can be reset if the helper is removed with `unregisterHelper` or
      `removeTestHelpers`).
       Any callbacks registered with `onInjectHelpers` will be called once the
      helpers have been injected.
       Example:
      ```
      App.injectTestHelpers();
      ```
       @method injectTestHelpers
      @public
    */
    injectTestHelpers: function (helperContainer) {
      if (helperContainer) {
        this.helperContainer = helperContainer;
      } else {
        this.helperContainer = window;
      }

      this.reopen({
        willDestroy: function () {
          this._super.apply(this, arguments);
          this.removeTestHelpers();
        }
      });

      this.testHelpers = {};
      for (var name in helpers) {
        this.originalMethods[name] = this.helperContainer[name];
        this.testHelpers[name] = this.helperContainer[name] = helper(this, name);
        protoWrap(Test.Promise.prototype, name, helper(this, name), helpers[name].meta.wait);
      }

      for (var i = 0, l = injectHelpersCallbacks.length; i < l; i++) {
        injectHelpersCallbacks[i](this);
      }
    },

    /**
      This removes all helpers that have been registered, and resets and functions
      that were overridden by the helpers.
       Example:
       ```javascript
      App.removeTestHelpers();
      ```
       @public
      @method removeTestHelpers
    */
    removeTestHelpers: function () {
      if (!this.helperContainer) {
        return;
      }

      for (var name in helpers) {
        this.helperContainer[name] = this.originalMethods[name];
        delete Test.Promise.prototype[name];
        delete this.testHelpers[name];
        delete this.originalMethods[name];
      }
    }
  });

  // This method is no longer needed
  // But still here for backwards compatibility
  // of helper chaining
  function protoWrap(proto, name, callback, isAsync) {
    proto[name] = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (isAsync) {
        return callback.apply(this, args);
      } else {
        return this.then(function () {
          return callback.apply(this, args);
        });
      }
    };
  }

  Test.Promise = function () {
    _emberRuntimeExtRsvp.default.Promise.apply(this, arguments);
    Test.lastPromise = this;
  };

  Test.Promise.prototype = Object.create(_emberRuntimeExtRsvp.default.Promise.prototype);
  Test.Promise.prototype.constructor = Test.Promise;
  Test.Promise.resolve = Test.resolve;

  // Patch `then` to isolate async methods
  // specifically `Ember.Test.lastPromise`
  var originalThen = _emberRuntimeExtRsvp.default.Promise.prototype.then;
  Test.Promise.prototype.then = function (onSuccess, onFailure) {
    return originalThen.call(this, function (val) {
      return isolate(onSuccess, val);
    }, onFailure);
  };

  // This method isolates nested async methods
  // so that they don't conflict with other last promises.
  //
  // 1. Set `Ember.Test.lastPromise` to null
  // 2. Invoke method
  // 3. Return the last promise created during method
  function isolate(fn, val) {
    var value, lastPromise;

    // Reset lastPromise for nested helpers
    Test.lastPromise = null;

    value = fn(val);

    lastPromise = Test.lastPromise;
    Test.lastPromise = null;

    // If the method returned a promise
    // return that promise. If not,
    // return the last async helper's promise
    if (value && value instanceof Test.Promise || !lastPromise) {
      return value;
    } else {
      return run(function () {
        return Test.resolve(lastPromise).then(function () {
          return value;
        });
      });
    }
  }

  exports.default = Test;
});
requireModule("ember-testing");

}());

/*! blanket - v1.2.1 */

if (typeof QUnit !== 'undefined'){ QUnit.config.autostart = false; }
(function(define){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.acorn = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){


// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

"use strict";

exports.parse = parse;

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

exports.parseExpressionAt = parseExpressionAt;

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenize` export provides an interface to the tokenizer.

exports.tokenizer = tokenizer;
exports.__esModule = true;
// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/marijnh/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

var _state = _dereq_("./state");

var Parser = _state.Parser;

var _options = _dereq_("./options");

var getOptions = _options.getOptions;

_dereq_("./parseutil");

_dereq_("./statement");

_dereq_("./lval");

_dereq_("./expression");

exports.Parser = _state.Parser;
exports.plugins = _state.plugins;
exports.defaultOptions = _options.defaultOptions;

var _location = _dereq_("./location");

exports.SourceLocation = _location.SourceLocation;
exports.getLineInfo = _location.getLineInfo;
exports.Node = _dereq_("./node").Node;

var _tokentype = _dereq_("./tokentype");

exports.TokenType = _tokentype.TokenType;
exports.tokTypes = _tokentype.types;

var _tokencontext = _dereq_("./tokencontext");

exports.TokContext = _tokencontext.TokContext;
exports.tokContexts = _tokencontext.types;

var _identifier = _dereq_("./identifier");

exports.isIdentifierChar = _identifier.isIdentifierChar;
exports.isIdentifierStart = _identifier.isIdentifierStart;
exports.Token = _dereq_("./tokenize").Token;

var _whitespace = _dereq_("./whitespace");

exports.isNewLine = _whitespace.isNewLine;
exports.lineBreak = _whitespace.lineBreak;
exports.lineBreakG = _whitespace.lineBreakG;
var version = "1.2.2";exports.version = version;

function parse(input, options) {
  var p = parser(options, input);
  var startPos = p.pos,
      startLoc = p.options.locations && p.curPosition();
  p.nextToken();
  return p.parseTopLevel(p.options.program || p.startNodeAt(startPos, startLoc));
}

function parseExpressionAt(input, pos, options) {
  var p = parser(options, input, pos);
  p.nextToken();
  return p.parseExpression();
}

function tokenizer(input, options) {
  return parser(options, input);
}

function parser(options, input) {
  return new Parser(getOptions(options), String(input));
}

},{"./expression":6,"./identifier":7,"./location":8,"./lval":9,"./node":10,"./options":11,"./parseutil":12,"./state":13,"./statement":14,"./tokencontext":15,"./tokenize":16,"./tokentype":17,"./whitespace":19}],2:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":3,"inherits":2}],6:[function(_dereq_,module,exports){
// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

"use strict";

var tt = _dereq_("./tokentype").types;

var Parser = _dereq_("./state").Parser;

var reservedWords = _dereq_("./identifier").reservedWords;

var has = _dereq_("./util").has;

var pp = Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp.checkPropClash = function (prop, propHash) {
  if (this.options.ecmaVersion >= 6) return;
  var key = prop.key,
      name = undefined;
  switch (key.type) {
    case "Identifier":
      name = key.name;break;
    case "Literal":
      name = String(key.value);break;
    default:
      return;
  }
  var kind = prop.kind || "init",
      other = undefined;
  if (has(propHash, name)) {
    other = propHash[name];
    var isGetSet = kind !== "init";
    if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init)) this.raise(key.start, "Redefinition of property");
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp.parseExpression = function (noIn, refShorthandDefaultPos) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(noIn, refShorthandDefaultPos);
  if (this.type === tt.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(tt.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refShorthandDefaultPos));
    return this.finishNode(node, "SequenceExpression");
  }
  return expr;
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp.parseMaybeAssign = function (noIn, refShorthandDefaultPos, afterLeftParse) {
  if (this.type == tt._yield && this.inGenerator) return this.parseYield();

  var failOnShorthandAssign = undefined;
  if (!refShorthandDefaultPos) {
    refShorthandDefaultPos = { start: 0 };
    failOnShorthandAssign = true;
  } else {
    failOnShorthandAssign = false;
  }
  var startPos = this.start,
      startLoc = this.startLoc;
  if (this.type == tt.parenL || this.type == tt.name) this.potentialArrowAt = this.start;
  var left = this.parseMaybeConditional(noIn, refShorthandDefaultPos);
  if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    node.left = this.type === tt.eq ? this.toAssignable(left) : left;
    refShorthandDefaultPos.start = 0; // reset because shorthand default was used correctly
    this.checkLVal(left);
    this.next();
    node.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "AssignmentExpression");
  } else if (failOnShorthandAssign && refShorthandDefaultPos.start) {
    this.unexpected(refShorthandDefaultPos.start);
  }
  return left;
};

// Parse a ternary conditional (`?:`) operator.

pp.parseMaybeConditional = function (noIn, refShorthandDefaultPos) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprOps(noIn, refShorthandDefaultPos);
  if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
  if (this.eat(tt.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(tt.colon);
    node.alternate = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};

// Start the precedence parser.

pp.parseExprOps = function (noIn, refShorthandDefaultPos) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refShorthandDefaultPos);
  if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
  return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp.parseExprOp = function (left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop;
  if (Array.isArray(leftStartPos)) {
    if (this.options.locations && noIn === undefined) {
      // shift arguments to left by one
      noIn = minPrec;
      minPrec = leftStartLoc;
      // flatten leftStartPos
      leftStartLoc = leftStartPos[1];
      leftStartPos = leftStartPos[0];
    }
  }
  if (prec != null && (!noIn || this.type !== tt._in)) {
    if (prec > minPrec) {
      var node = this.startNodeAt(leftStartPos, leftStartLoc);
      node.left = left;
      node.operator = this.value;
      var op = this.type;
      this.next();
      var startPos = this.start,
          startLoc = this.startLoc;
      node.right = this.parseExprOp(this.parseMaybeUnary(), startPos, startLoc, prec, noIn);
      this.finishNode(node, op === tt.logicalOR || op === tt.logicalAND ? "LogicalExpression" : "BinaryExpression");
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
    }
  }
  return left;
};

// Parse unary operators, both prefix and postfix.

pp.parseMaybeUnary = function (refShorthandDefaultPos) {
  if (this.type.prefix) {
    var node = this.startNode(),
        update = this.type === tt.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary();
    if (refShorthandDefaultPos && refShorthandDefaultPos.start) this.unexpected(refShorthandDefaultPos.start);
    if (update) this.checkLVal(node.argument);else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") this.raise(node.start, "Deleting local variable in strict mode");
    return this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  }
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprSubscripts(refShorthandDefaultPos);
  if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
  while (this.type.postfix && !this.canInsertSemicolon()) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    node.prefix = false;
    node.argument = expr;
    this.checkLVal(expr);
    this.next();
    expr = this.finishNode(node, "UpdateExpression");
  }
  return expr;
};

// Parse call, dot, and `[]`-subscript expressions.

pp.parseExprSubscripts = function (refShorthandDefaultPos) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprAtom(refShorthandDefaultPos);
  if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
  return this.parseSubscripts(expr, startPos, startLoc);
};

pp.parseSubscripts = function (base, startPos, startLoc, noCalls) {
  if (Array.isArray(startPos)) {
    if (this.options.locations && noCalls === undefined) {
      // shift arguments to left by one
      noCalls = startLoc;
      // flatten startPos
      startLoc = startPos[1];
      startPos = startPos[0];
    }
  }
  for (;;) {
    if (this.eat(tt.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = this.parseIdent(true);
      node.computed = false;
      base = this.finishNode(node, "MemberExpression");
    } else if (this.eat(tt.bracketL)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = this.parseExpression();
      node.computed = true;
      this.expect(tt.bracketR);
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(tt.parenL)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.callee = base;
      node.arguments = this.parseExprList(tt.parenR, false);
      base = this.finishNode(node, "CallExpression");
    } else if (this.type === tt.backQuote) {
      var node = this.startNodeAt(startPos, startLoc);
      node.tag = base;
      node.quasi = this.parseTemplate();
      base = this.finishNode(node, "TaggedTemplateExpression");
    } else {
      return base;
    }
  }
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp.parseExprAtom = function (refShorthandDefaultPos) {
  var node = undefined,
      canBeArrow = this.potentialArrowAt == this.start;
  switch (this.type) {
    case tt._this:
    case tt._super:
      var type = this.type === tt._this ? "ThisExpression" : "Super";
      node = this.startNode();
      this.next();
      return this.finishNode(node, type);

    case tt._yield:
      if (this.inGenerator) this.unexpected();

    case tt.name:
      var startPos = this.start,
          startLoc = this.startLoc;
      var id = this.parseIdent(this.type !== tt.name);
      if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id]);
      return id;

    case tt.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = { pattern: value.pattern, flags: value.flags };
      return node;

    case tt.num:case tt.string:
      return this.parseLiteral(this.value);

    case tt._null:case tt._true:case tt._false:
      node = this.startNode();
      node.value = this.type === tt._null ? null : this.type === tt._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");

    case tt.parenL:
      return this.parseParenAndDistinguishExpression(canBeArrow);

    case tt.bracketL:
      node = this.startNode();
      this.next();
      // check whether this is array comprehension or regular array
      if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
        return this.parseComprehension(node, false);
      }
      node.elements = this.parseExprList(tt.bracketR, true, true, refShorthandDefaultPos);
      return this.finishNode(node, "ArrayExpression");

    case tt.braceL:
      return this.parseObj(false, refShorthandDefaultPos);

    case tt._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, false);

    case tt._class:
      return this.parseClass(this.startNode(), false);

    case tt._new:
      return this.parseNew();

    case tt.backQuote:
      return this.parseTemplate();

    default:
      this.unexpected();
  }
};

pp.parseLiteral = function (value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  this.next();
  return this.finishNode(node, "Literal");
};

pp.parseParenExpression = function () {
  this.expect(tt.parenL);
  var val = this.parseExpression();
  this.expect(tt.parenR);
  return val;
};

pp.parseParenAndDistinguishExpression = function (canBeArrow) {
  var startPos = this.start,
      startLoc = this.startLoc,
      val = undefined;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
      return this.parseComprehension(this.startNodeAt(startPos, startLoc), true);
    }

    var innerStartPos = this.start,
        innerStartLoc = this.startLoc;
    var exprList = [],
        first = true;
    var refShorthandDefaultPos = { start: 0 },
        spreadStart = undefined,
        innerParenStart = undefined;
    while (this.type !== tt.parenR) {
      first ? first = false : this.expect(tt.comma);
      if (this.type === tt.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRest()));
        break;
      } else {
        if (this.type === tt.parenL && !innerParenStart) {
          innerParenStart = this.start;
        }
        exprList.push(this.parseMaybeAssign(false, refShorthandDefaultPos, this.parseParenItem));
      }
    }
    var innerEndPos = this.start,
        innerEndLoc = this.startLoc;
    this.expect(tt.parenR);

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
      if (innerParenStart) this.unexpected(innerParenStart);
      return this.parseParenArrowList(startPos, startLoc, exprList);
    }

    if (!exprList.length) this.unexpected(this.lastTokStart);
    if (spreadStart) this.unexpected(spreadStart);
    if (refShorthandDefaultPos.start) this.unexpected(refShorthandDefaultPos.start);

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};

pp.parseParenItem = function (item) {
  return item;
};

pp.parseParenArrowList = function (startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
};

// New's precedence is slightly tricky. It must allow its argument
// to be a `[]` or dot subscript expression, but not a call — at
// least, not without wrapping it in parentheses. Thus, it uses the

var empty = [];

pp.parseNew = function () {
  var node = this.startNode();
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
    node.meta = meta;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") this.raise(node.property.start, "The only valid meta property for new is new.target");
    return this.finishNode(node, "MetaProperty");
  }
  var startPos = this.start,
      startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, false);else node.arguments = empty;
  return this.finishNode(node, "NewExpression");
};

// Parse template expression.

pp.parseTemplateElement = function () {
  var elem = this.startNode();
  elem.value = {
    raw: this.input.slice(this.start, this.end),
    cooked: this.value
  };
  this.next();
  elem.tail = this.type === tt.backQuote;
  return this.finishNode(elem, "TemplateElement");
};

pp.parseTemplate = function () {
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement();
  node.quasis = [curElt];
  while (!curElt.tail) {
    this.expect(tt.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(tt.braceR);
    node.quasis.push(curElt = this.parseTemplateElement());
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
};

// Parse an object literal or binding pattern.

pp.parseObj = function (isPattern, refShorthandDefaultPos) {
  var node = this.startNode(),
      first = true,
      propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this.expect(tt.comma);
      if (this.afterTrailingComma(tt.braceR)) break;
    } else first = false;

    var prop = this.startNode(),
        isGenerator = undefined,
        startPos = undefined,
        startLoc = undefined;
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refShorthandDefaultPos) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern) isGenerator = this.eat(tt.star);
    }
    this.parsePropertyName(prop);
    this.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refShorthandDefaultPos);
    this.checkPropClash(prop, propHash);
    node.properties.push(this.finishNode(prop, "Property"));
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};

pp.parsePropertyValue = function (prop, isPattern, isGenerator, startPos, startLoc, refShorthandDefaultPos) {
  if (this.eat(tt.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refShorthandDefaultPos);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
    if (isPattern) this.unexpected();
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator);
  } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type != tt.comma && this.type != tt.braceR)) {
    if (isGenerator || isPattern) this.unexpected();
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    prop.kind = "init";
    if (isPattern) {
      if (this.isKeyword(prop.key.name) || this.strict && (reservedWords.strictBind(prop.key.name) || reservedWords.strict(prop.key.name)) || !this.options.allowReserved && this.isReservedWord(prop.key.name)) this.raise(prop.key.start, "Binding " + prop.key.name);
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else if (this.type === tt.eq && refShorthandDefaultPos) {
      if (!refShorthandDefaultPos.start) refShorthandDefaultPos.start = this.start;
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else {
      prop.value = prop.key;
    }
    prop.shorthand = true;
  } else this.unexpected();
};

pp.parsePropertyName = function (prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(tt.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(tt.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true);
};

// Initialize empty function node.

pp.initFunction = function (node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
};

// Parse object or class method.

pp.parseMethod = function (isGenerator) {
  var node = this.startNode();
  this.initFunction(node);
  this.expect(tt.parenL);
  node.params = this.parseBindingList(tt.parenR, false, false);
  var allowExpressionBody = undefined;
  if (this.options.ecmaVersion >= 6) {
    node.generator = isGenerator;
    allowExpressionBody = true;
  } else {
    allowExpressionBody = false;
  }
  this.parseFunctionBody(node, allowExpressionBody);
  return this.finishNode(node, "FunctionExpression");
};

// Parse arrow function expression with given parameters.

pp.parseArrowExpression = function (node, params) {
  this.initFunction(node);
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true);
  return this.finishNode(node, "ArrowFunctionExpression");
};

// Parse function body and check parameters.

pp.parseFunctionBody = function (node, allowExpression) {
  var isExpression = allowExpression && this.type !== tt.braceL;

  if (isExpression) {
    node.body = this.parseMaybeAssign();
    node.expression = true;
  } else {
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldInFunc = this.inFunction,
        oldInGen = this.inGenerator,
        oldLabels = this.labels;
    this.inFunction = true;this.inGenerator = node.generator;this.labels = [];
    node.body = this.parseBlock(true);
    node.expression = false;
    this.inFunction = oldInFunc;this.inGenerator = oldInGen;this.labels = oldLabels;
  }

  // If this is a strict mode function, verify that argument names
  // are not repeated, and it does not try to bind the words `eval`
  // or `arguments`.
  if (this.strict || !isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) {
    var nameHash = {},
        oldStrict = this.strict;
    this.strict = true;
    if (node.id) this.checkLVal(node.id, true);
    for (var i = 0; i < node.params.length; i++) {
      this.checkLVal(node.params[i], true, nameHash);
    }this.strict = oldStrict;
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp.parseExprList = function (close, allowTrailingComma, allowEmpty, refShorthandDefaultPos) {
  var elts = [],
      first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(tt.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) break;
    } else first = false;

    if (allowEmpty && this.type === tt.comma) {
      elts.push(null);
    } else {
      if (this.type === tt.ellipsis) elts.push(this.parseSpread(refShorthandDefaultPos));else elts.push(this.parseMaybeAssign(false, refShorthandDefaultPos));
    }
  }
  return elts;
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp.parseIdent = function (liberal) {
  var node = this.startNode();
  if (liberal && this.options.allowReserved == "never") liberal = false;
  if (this.type === tt.name) {
    if (!liberal && (!this.options.allowReserved && this.isReservedWord(this.value) || this.strict && reservedWords.strict(this.value) && (this.options.ecmaVersion >= 6 || this.input.slice(this.start, this.end).indexOf("\\") == -1))) this.raise(this.start, "The keyword '" + this.value + "' is reserved");
    node.name = this.value;
  } else if (liberal && this.type.keyword) {
    node.name = this.type.keyword;
  } else {
    this.unexpected();
  }
  this.next();
  return this.finishNode(node, "Identifier");
};

// Parses yield expression inside generator.

pp.parseYield = function () {
  var node = this.startNode();
  this.next();
  if (this.type == tt.semi || this.canInsertSemicolon() || this.type != tt.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(tt.star);
    node.argument = this.parseMaybeAssign();
  }
  return this.finishNode(node, "YieldExpression");
};

// Parses array and generator comprehensions.

pp.parseComprehension = function (node, isGenerator) {
  node.blocks = [];
  while (this.type === tt._for) {
    var block = this.startNode();
    this.next();
    this.expect(tt.parenL);
    block.left = this.parseBindingAtom();
    this.checkLVal(block.left, true);
    this.expectContextual("of");
    block.right = this.parseExpression();
    this.expect(tt.parenR);
    node.blocks.push(this.finishNode(block, "ComprehensionBlock"));
  }
  node.filter = this.eat(tt._if) ? this.parseParenExpression() : null;
  node.body = this.parseExpression();
  this.expect(isGenerator ? tt.parenR : tt.bracketR);
  node.generator = isGenerator;
  return this.finishNode(node, "ComprehensionExpression");
};

},{"./identifier":7,"./state":13,"./tokentype":17,"./util":18}],7:[function(_dereq_,module,exports){


// Test whether a given character code starts an identifier.

"use strict";

exports.isIdentifierStart = isIdentifierStart;

// Test whether a given character is part of an identifier.

exports.isIdentifierChar = isIdentifierChar;
exports.__esModule = true;
// This is a trick taken from Esprima. It turns out that, on
// non-Chrome browsers, to check whether a string is in a set, a
// predicate containing a big ugly `switch` statement is faster than
// a regular expression, and on Chrome the two are about on par.
// This function uses `eval` (non-lexical) to produce such a
// predicate from a space-separated string of words.
//
// It starts by sorting the words by length.

function makePredicate(words) {
  words = words.split(" ");
  var f = "",
      cats = [];
  out: for (var i = 0; i < words.length; ++i) {
    for (var j = 0; j < cats.length; ++j) {
      if (cats[j][0].length == words[i].length) {
        cats[j].push(words[i]);
        continue out;
      }
    }cats.push([words[i]]);
  }
  function compareTo(arr) {
    if (arr.length == 1) {
      return f += "return str === " + JSON.stringify(arr[0]) + ";";
    }f += "switch(str){";
    for (var i = 0; i < arr.length; ++i) {
      f += "case " + JSON.stringify(arr[i]) + ":";
    }f += "return true}return false;";
  }

  // When there are more than three length categories, an outer
  // switch first dispatches on the lengths, to save on comparisons.

  if (cats.length > 3) {
    cats.sort(function (a, b) {
      return b.length - a.length;
    });
    f += "switch(str.length){";
    for (var i = 0; i < cats.length; ++i) {
      var cat = cats[i];
      f += "case " + cat[0].length + ":";
      compareTo(cat);
    }
    f += "}"

    // Otherwise, simply generate a flat `switch` statement.

    ;
  } else {
    compareTo(words);
  }
  return new Function("str", f);
}

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: makePredicate("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile"),
  5: makePredicate("class enum extends super const export import"),
  6: makePredicate("enum await"),
  strict: makePredicate("implements interface let package private protected public static yield"),
  strictBind: makePredicate("eval arguments")
};

exports.reservedWords = reservedWords;
// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords = {
  5: makePredicate(ecma5AndLessKeywords),
  6: makePredicate(ecma5AndLessKeywords + " let const class extends export import yield super")
};

exports.keywords = keywords;
// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `tools/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢲऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞭꞰꞱꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭟꭤꭥꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣤ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏ᦰ-ᧀᧈᧉ᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︭︳︴﹍-﹏０-９＿";

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by tools/generate-identifier-regex.js
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 98, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 955, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 38, 17, 2, 24, 133, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 32, 4, 287, 47, 21, 1, 2, 0, 185, 46, 82, 47, 21, 0, 60, 42, 502, 63, 32, 0, 449, 56, 1288, 920, 104, 110, 2962, 1070, 13266, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 16355, 541];
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 16, 9, 83, 11, 168, 11, 6, 9, 8, 2, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 112, 16, 16, 9, 82, 12, 9, 9, 535, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 4305, 6, 792618, 239];

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 65536;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) {
      return false;
    }pos += set[i + 1];
    if (pos >= code) {
      return true;
    }
  }
}
function isIdentifierStart(code, astral) {
  if (code < 65) {
    return code === 36;
  }if (code < 91) {
    return true;
  }if (code < 97) {
    return code === 95;
  }if (code < 123) {
    return true;
  }if (code <= 65535) {
    return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
  }if (astral === false) {
    return false;
  }return isInAstralSet(code, astralIdentifierStartCodes);
}

function isIdentifierChar(code, astral) {
  if (code < 48) {
    return code === 36;
  }if (code < 58) {
    return true;
  }if (code < 65) {
    return false;
  }if (code < 91) {
    return true;
  }if (code < 97) {
    return code === 95;
  }if (code < 123) {
    return true;
  }if (code <= 65535) {
    return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
  }if (astral === false) {
    return false;
  }return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}

},{}],8:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

exports.getLineInfo = getLineInfo;
exports.__esModule = true;

var Parser = _dereq_("./state").Parser;

var lineBreakG = _dereq_("./whitespace").lineBreakG;

var deprecate = _dereq_("util").deprecate;

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = exports.Position = (function () {
  function Position(line, col) {
    _classCallCheck(this, Position);

    this.line = line;
    this.column = col;
  }

  Position.prototype.offset = function offset(n) {
    return new Position(this.line, this.column + n);
  };

  return Position;
})();

var SourceLocation = exports.SourceLocation = function SourceLocation(p, start, end) {
  _classCallCheck(this, SourceLocation);

  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) this.source = p.sourceFile;
};

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    lineBreakG.lastIndex = cur;
    var match = lineBreakG.exec(input);
    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur);
    }
  }
}

var pp = Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp.raise = function (pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos;err.loc = loc;err.raisedAt = this.pos;
  throw err;
};

pp.curPosition = function () {
  return new Position(this.curLine, this.pos - this.lineStart);
};

pp.markPosition = function () {
  return this.options.locations ? [this.start, this.startLoc] : this.start;
};

},{"./state":13,"./whitespace":19,"util":5}],9:[function(_dereq_,module,exports){
"use strict";

var tt = _dereq_("./tokentype").types;

var Parser = _dereq_("./state").Parser;

var reservedWords = _dereq_("./identifier").reservedWords;

var has = _dereq_("./util").has;

var pp = Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp.toAssignable = function (node, isBinding) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
        break;

      case "ObjectExpression":
        node.type = "ObjectPattern";
        for (var i = 0; i < node.properties.length; i++) {
          var prop = node.properties[i];
          if (prop.kind !== "init") this.raise(prop.key.start, "Object pattern can't contain getter or setter");
          this.toAssignable(prop.value, isBinding);
        }
        break;

      case "ArrayExpression":
        node.type = "ArrayPattern";
        this.toAssignableList(node.elements, isBinding);
        break;

      case "AssignmentExpression":
        if (node.operator === "=") {
          node.type = "AssignmentPattern";
        } else {
          this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
        }
        break;

      case "ParenthesizedExpression":
        node.expression = this.toAssignable(node.expression, isBinding);
        break;

      case "MemberExpression":
        if (!isBinding) break;

      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  }
  return node;
};

// Convert list of expression atoms to binding list.

pp.toAssignableList = function (exprList, isBinding) {
  var end = exprList.length;
  if (end) {
    var last = exprList[end - 1];
    if (last && last.type == "RestElement") {
      --end;
    } else if (last && last.type == "SpreadElement") {
      last.type = "RestElement";
      var arg = last.argument;
      this.toAssignable(arg, isBinding);
      if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern") this.unexpected(arg.start);
      --end;
    }
  }
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) this.toAssignable(elt, isBinding);
  }
  return exprList;
};

// Parses spread element.

pp.parseSpread = function (refShorthandDefaultPos) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(refShorthandDefaultPos);
  return this.finishNode(node, "SpreadElement");
};

pp.parseRest = function () {
  var node = this.startNode();
  this.next();
  node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected();
  return this.finishNode(node, "RestElement");
};

// Parses lvalue (assignable) atom.

pp.parseBindingAtom = function () {
  if (this.options.ecmaVersion < 6) return this.parseIdent();
  switch (this.type) {
    case tt.name:
      return this.parseIdent();

    case tt.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(tt.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern");

    case tt.braceL:
      return this.parseObj(true);

    default:
      this.unexpected();
  }
};

pp.parseBindingList = function (close, allowEmpty, allowTrailingComma) {
  var elts = [],
      first = true;
  while (!this.eat(close)) {
    if (first) first = false;else this.expect(tt.comma);
    if (allowEmpty && this.type === tt.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === tt.ellipsis) {
      var rest = this.parseRest();
      this.parseBindingListItem(rest);
      elts.push(rest);
      this.expect(close);
      break;
    } else {
      var elem = this.parseMaybeDefault(this.start, this.startLoc);
      this.parseBindingListItem(elem);
      elts.push(elem);
    }
  }
  return elts;
};

pp.parseBindingListItem = function (param) {
  return param;
};

// Parses assignment pattern around given atom if possible.

pp.parseMaybeDefault = function (startPos, startLoc, left) {
  if (Array.isArray(startPos)) {
    if (this.options.locations && noCalls === undefined) {
      // shift arguments to left by one
      left = startLoc;
      // flatten startPos
      startLoc = startPos[1];
      startPos = startPos[0];
    }
  }
  left = left || this.parseBindingAtom();
  if (!this.eat(tt.eq)) return left;
  var node = this.startNodeAt(startPos, startLoc);
  node.operator = "=";
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
};

// Verify that a node is an lval — something that can be assigned
// to.

pp.checkLVal = function (expr, isBinding, checkClashes) {
  switch (expr.type) {
    case "Identifier":
      if (this.strict && (reservedWords.strictBind(expr.name) || reservedWords.strict(expr.name))) this.raise(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      if (checkClashes) {
        if (has(checkClashes, expr.name)) this.raise(expr.start, "Argument name clash in strict mode");
        checkClashes[expr.name] = true;
      }
      break;

    case "MemberExpression":
      if (isBinding) this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
      break;

    case "ObjectPattern":
      for (var i = 0; i < expr.properties.length; i++) {
        this.checkLVal(expr.properties[i].value, isBinding, checkClashes);
      }break;

    case "ArrayPattern":
      for (var i = 0; i < expr.elements.length; i++) {
        var elem = expr.elements[i];
        if (elem) this.checkLVal(elem, isBinding, checkClashes);
      }
      break;

    case "AssignmentPattern":
      this.checkLVal(expr.left, isBinding, checkClashes);
      break;

    case "RestElement":
      this.checkLVal(expr.argument, isBinding, checkClashes);
      break;

    case "ParenthesizedExpression":
      this.checkLVal(expr.expression, isBinding, checkClashes);
      break;

    default:
      this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
  }
};

},{"./identifier":7,"./state":13,"./tokentype":17,"./util":18}],10:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.__esModule = true;

var Parser = _dereq_("./state").Parser;

var SourceLocation = _dereq_("./location").SourceLocation;

// Start an AST node, attaching a start offset.

var pp = Parser.prototype;

var Node = exports.Node = function Node() {
  _classCallCheck(this, Node);
};

pp.startNode = function () {
  var node = new Node();
  node.start = this.start;
  if (this.options.locations) node.loc = new SourceLocation(this, this.startLoc);
  if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
  if (this.options.ranges) node.range = [this.start, 0];
  return node;
};

pp.startNodeAt = function (pos, loc) {
  var node = new Node();
  if (Array.isArray(pos)) {
    if (this.options.locations && loc === undefined) {
      // flatten pos
      loc = pos[1];
      pos = pos[0];
    }
  }
  node.start = pos;
  if (this.options.locations) node.loc = new SourceLocation(this, loc);
  if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
  if (this.options.ranges) node.range = [pos, 0];
  return node;
};

// Finish an AST node, adding `type` and `end` properties.

pp.finishNode = function (node, type) {
  node.type = type;
  node.end = this.lastTokEnd;
  if (this.options.locations) node.loc.end = this.lastTokEndLoc;
  if (this.options.ranges) node.range[1] = this.lastTokEnd;
  return node;
};

// Finish node at given position

pp.finishNodeAt = function (node, type, pos, loc) {
  node.type = type;
  if (Array.isArray(pos)) {
    if (this.options.locations && loc === undefined) {
      // flatten pos
      loc = pos[1];
      pos = pos[0];
    }
  }
  node.end = pos;
  if (this.options.locations) node.loc.end = loc;
  if (this.options.ranges) node.range[1] = pos;
  return node;
};

},{"./location":8,"./state":13}],11:[function(_dereq_,module,exports){


// Interpret and default an options object

"use strict";

exports.getOptions = getOptions;
exports.__esModule = true;

var _util = _dereq_("./util");

var has = _util.has;
var isArray = _util.isArray;

var SourceLocation = _dereq_("./location").SourceLocation;

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, or 5, or 6. This influences support for strict
  // mode, the set of reserved words, support for getters and
  // setters and other features.
  ecmaVersion: 5,
  // Source type ("script" or "module") for different semantics
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are not enforced. Disable
  // `allowReserved` to enforce them. When this option has the
  // value "never", reserved words and keywords can also not be
  // used as property names.
  allowReserved: true,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokenize() returns. Note that you are not
  // allowed to call the parser from the callback—that will
  // corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
};exports.defaultOptions = defaultOptions;

function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
  }if (isArray(options.onToken)) {
    (function () {
      var tokens = options.onToken;
      options.onToken = function (token) {
        return tokens.push(token);
      };
    })();
  }
  if (isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);

  return options;
}

function pushComment(options, array) {
  return function (block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations) comment.loc = new SourceLocation(this, startLoc, endLoc);
    if (options.ranges) comment.range = [start, end];
    array.push(comment);
  };
}

},{"./location":8,"./util":18}],12:[function(_dereq_,module,exports){
"use strict";

var tt = _dereq_("./tokentype").types;

var Parser = _dereq_("./state").Parser;

var lineBreak = _dereq_("./whitespace").lineBreak;

var pp = Parser.prototype;

// ## Parser utilities

// Test whether a statement node is the string literal `"use strict"`.

pp.isUseStrict = function (stmt) {
  return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.value === "use strict";
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function (type) {
  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
};

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function (name) {
  return this.type === tt.name && this.value === name;
};

// Consumes contextual keyword if possible.

pp.eatContextual = function (name) {
  return this.value === name && this.eat(tt.name);
};

// Asserts that following token is given contextual keyword.

pp.expectContextual = function (name) {
  if (!this.eatContextual(name)) this.unexpected();
};

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function () {
  return this.type === tt.eof || this.type === tt.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};

pp.insertSemicolon = function () {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    return true;
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function () {
  if (!this.eat(tt.semi) && !this.insertSemicolon()) this.unexpected();
};

pp.afterTrailingComma = function (tokType) {
  if (this.type == tokType) {
    if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    this.next();
    return true;
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function (type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp.unexpected = function (pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

},{"./state":13,"./tokentype":17,"./whitespace":19}],13:[function(_dereq_,module,exports){
"use strict";

exports.Parser = Parser;
exports.__esModule = true;

var _identifier = _dereq_("./identifier");

var reservedWords = _identifier.reservedWords;
var keywords = _identifier.keywords;

var tt = _dereq_("./tokentype").types;

var lineBreak = _dereq_("./whitespace").lineBreak;

function Parser(options, input, startPos) {
  this.options = options;
  this.sourceFile = this.options.sourceFile || null;
  this.isKeyword = keywords[this.options.ecmaVersion >= 6 ? 6 : 5];
  this.isReservedWord = reservedWords[this.options.ecmaVersion];
  this.input = input;

  // Load plugins
  this.loadPlugins(this.options.plugins);

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos;
    this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos));
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }

  // Properties of the current token:
  // Its type
  this.type = tt.eof;
  // For tokens that include more information than their type, the value
  this.value = null;
  // Its start and end offset
  this.start = this.end = this.pos;
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = null;

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext();
  this.exprAllowed = true;

  // Figure out if it's a module code.
  this.strict = this.inModule = this.options.sourceType === "module";

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1;

  // Flags to track whether we are in a function, a generator.
  this.inFunction = this.inGenerator = false;
  // Labels in scope.
  this.labels = [];

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && this.options.allowHashBang && this.input.slice(0, 2) === "#!") this.skipLineComment(2);
}

Parser.prototype.extend = function (name, f) {
  this[name] = f(this[name]);
};

// Registered plugins

var plugins = {};

exports.plugins = plugins;
Parser.prototype.loadPlugins = function (plugins) {
  for (var _name in plugins) {
    var plugin = exports.plugins[_name];
    if (!plugin) throw new Error("Plugin '" + _name + "' not found");
    plugin(this, plugins[_name]);
  }
};

},{"./identifier":7,"./tokentype":17,"./whitespace":19}],14:[function(_dereq_,module,exports){
"use strict";

var tt = _dereq_("./tokentype").types;

var Parser = _dereq_("./state").Parser;

var lineBreak = _dereq_("./whitespace").lineBreak;

var pp = Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp.parseTopLevel = function (node) {
  var first = true;
  if (!node.body) node.body = [];
  while (this.type !== tt.eof) {
    var stmt = this.parseStatement(true, true);
    node.body.push(stmt);
    if (first && this.isUseStrict(stmt)) this.setStrict(true);
    first = false;
  }
  this.next();
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType;
  }
  return this.finishNode(node, "Program");
};

var loopLabel = { kind: "loop" },
    switchLabel = { kind: "switch" };

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp.parseStatement = function (declaration, topLevel) {
  var starttype = this.type,
      node = this.startNode();

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
    case tt._break:case tt._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case tt._debugger:
      return this.parseDebuggerStatement(node);
    case tt._do:
      return this.parseDoStatement(node);
    case tt._for:
      return this.parseForStatement(node);
    case tt._function:
      if (!declaration && this.options.ecmaVersion >= 6) this.unexpected();
      return this.parseFunctionStatement(node);
    case tt._class:
      if (!declaration) this.unexpected();
      return this.parseClass(node, true);
    case tt._if:
      return this.parseIfStatement(node);
    case tt._return:
      return this.parseReturnStatement(node);
    case tt._switch:
      return this.parseSwitchStatement(node);
    case tt._throw:
      return this.parseThrowStatement(node);
    case tt._try:
      return this.parseTryStatement(node);
    case tt._let:case tt._const:
      if (!declaration) this.unexpected(); // NOTE: falls through to _var
    case tt._var:
      return this.parseVarStatement(node, starttype);
    case tt._while:
      return this.parseWhileStatement(node);
    case tt._with:
      return this.parseWithStatement(node);
    case tt.braceL:
      return this.parseBlock();
    case tt.semi:
      return this.parseEmptyStatement(node);
    case tt._export:
    case tt._import:
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
        if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
      }
      return starttype === tt._import ? this.parseImport(node) : this.parseExport(node);

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
    default:
      var maybeName = this.value,
          expr = this.parseExpression();
      if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon)) return this.parseLabeledStatement(node, maybeName, expr);else return this.parseExpressionStatement(node, expr);
  }
};

pp.parseBreakContinueStatement = function (node, keyword) {
  var isBreak = keyword == "break";
  this.next();
  if (this.eat(tt.semi) || this.insertSemicolon()) node.label = null;else if (this.type !== tt.name) this.unexpected();else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  for (var i = 0; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
      if (node.label && isBreak) break;
    }
  }
  if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};

pp.parseDebuggerStatement = function (node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};

pp.parseDoStatement = function (node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  this.expect(tt._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) this.eat(tt.semi);else this.semicolon();
  return this.finishNode(node, "DoWhileStatement");
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp.parseForStatement = function (node) {
  this.next();
  this.labels.push(loopLabel);
  this.expect(tt.parenL);
  if (this.type === tt.semi) return this.parseFor(node, null);
  if (this.type === tt._var || this.type === tt._let || this.type === tt._const) {
    var _init = this.startNode(),
        varKind = this.type;
    this.next();
    this.parseVar(_init, true, varKind);
    this.finishNode(_init, "VariableDeclaration");
    if ((this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1 && !(varKind !== tt._var && _init.declarations[0].init)) return this.parseForIn(node, _init);
    return this.parseFor(node, _init);
  }
  var refShorthandDefaultPos = { start: 0 };
  var init = this.parseExpression(true, refShorthandDefaultPos);
  if (this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
    this.toAssignable(init);
    this.checkLVal(init);
    return this.parseForIn(node, init);
  } else if (refShorthandDefaultPos.start) {
    this.unexpected(refShorthandDefaultPos.start);
  }
  return this.parseFor(node, init);
};

pp.parseFunctionStatement = function (node) {
  this.next();
  return this.parseFunction(node, true);
};

pp.parseIfStatement = function (node) {
  this.next();
  node.test = this.parseParenExpression();
  node.consequent = this.parseStatement(false);
  node.alternate = this.eat(tt._else) ? this.parseStatement(false) : null;
  return this.finishNode(node, "IfStatement");
};

pp.parseReturnStatement = function (node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(tt.semi) || this.insertSemicolon()) node.argument = null;else {
    node.argument = this.parseExpression();this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};

pp.parseSwitchStatement = function (node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(tt.braceL);
  this.labels.push(switchLabel);

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  for (var cur, sawDefault; this.type != tt.braceR;) {
    if (this.type === tt._case || this.type === tt._default) {
      var isCase = this.type === tt._case;
      if (cur) this.finishNode(cur, "SwitchCase");
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) this.raise(this.lastTokStart, "Multiple default clauses");
        sawDefault = true;
        cur.test = null;
      }
      this.expect(tt.colon);
    } else {
      if (!cur) this.unexpected();
      cur.consequent.push(this.parseStatement(true));
    }
  }
  if (cur) this.finishNode(cur, "SwitchCase");
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};

pp.parseThrowStatement = function (node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
};

// Reused empty array added for node fields that are always empty.

var empty = [];

pp.parseTryStatement = function (node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === tt._catch) {
    var clause = this.startNode();
    this.next();
    this.expect(tt.parenL);
    clause.param = this.parseBindingAtom();
    this.checkLVal(clause.param, true);
    this.expect(tt.parenR);
    clause.guard = null;
    clause.body = this.parseBlock();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.guardedHandlers = empty;
  node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
  return this.finishNode(node, "TryStatement");
};

pp.parseVarStatement = function (node, kind) {
  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};

pp.parseWhileStatement = function (node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};

pp.parseWithStatement = function (node) {
  if (this.strict) this.raise(this.start, "'with' in strict mode");
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement(false);
  return this.finishNode(node, "WithStatement");
};

pp.parseEmptyStatement = function (node) {
  this.next();
  return this.finishNode(node, "EmptyStatement");
};

pp.parseLabeledStatement = function (node, maybeName, expr) {
  for (var i = 0; i < this.labels.length; ++i) {
    if (this.labels[i].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  }var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null;
  this.labels.push({ name: maybeName, kind: kind });
  node.body = this.parseStatement(true);
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};

pp.parseExpressionStatement = function (node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp.parseBlock = function (allowStrict) {
  var node = this.startNode(),
      first = true,
      oldStrict = undefined;
  node.body = [];
  this.expect(tt.braceL);
  while (!this.eat(tt.braceR)) {
    var stmt = this.parseStatement(true);
    node.body.push(stmt);
    if (first && allowStrict && this.isUseStrict(stmt)) {
      oldStrict = this.strict;
      this.setStrict(this.strict = true);
    }
    first = false;
  }
  if (oldStrict === false) this.setStrict(false);
  return this.finishNode(node, "BlockStatement");
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp.parseFor = function (node, init) {
  node.init = init;
  this.expect(tt.semi);
  node.test = this.type === tt.semi ? null : this.parseExpression();
  this.expect(tt.semi);
  node.update = this.type === tt.parenR ? null : this.parseExpression();
  this.expect(tt.parenR);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp.parseForIn = function (node, init) {
  var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  node.left = init;
  node.right = this.parseExpression();
  this.expect(tt.parenR);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, type);
};

// Parse a list of variable declarations.

pp.parseVar = function (node, isFor, kind) {
  node.declarations = [];
  node.kind = kind.keyword;
  for (;;) {
    var decl = this.startNode();
    this.parseVarId(decl);
    if (this.eat(tt.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (kind === tt._const && !(this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (decl.id.type != "Identifier" && !(isFor && (this.type === tt._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(tt.comma)) break;
  }
  return node;
};

pp.parseVarId = function (decl) {
  decl.id = this.parseBindingAtom();
  this.checkLVal(decl.id, true);
};

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp.parseFunction = function (node, isStatement, allowExpressionBody) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) node.generator = this.eat(tt.star);
  if (isStatement || this.type === tt.name) node.id = this.parseIdent();
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody);
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
};

pp.parseFunctionParams = function (node) {
  this.expect(tt.parenL);
  node.params = this.parseBindingList(tt.parenR, false, false);
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp.parseClass = function (node, isStatement) {
  this.next();
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(tt.braceL);
  while (!this.eat(tt.braceR)) {
    if (this.eat(tt.semi)) continue;
    var method = this.startNode();
    var isGenerator = this.eat(tt.star);
    var isMaybeStatic = this.type === tt.name && this.value === "static";
    this.parsePropertyName(method);
    method["static"] = isMaybeStatic && this.type !== tt.parenL;
    if (method["static"]) {
      if (isGenerator) this.unexpected();
      isGenerator = this.eat(tt.star);
      this.parsePropertyName(method);
    }
    method.kind = "method";
    if (!method.computed) {
      var key = method.key;

      var isGetSet = false;
      if (!isGenerator && key.type === "Identifier" && this.type !== tt.parenL && (key.name === "get" || key.name === "set")) {
        isGetSet = true;
        method.kind = key.name;
        key = this.parsePropertyName(method);
      }
      if (!method["static"] && (key.type === "Identifier" && key.name === "constructor" || key.type === "Literal" && key.value === "constructor")) {
        if (hadConstructor) this.raise(key.start, "Duplicate constructor in the same class");
        if (isGetSet) this.raise(key.start, "Constructor can't have get/set modifier");
        if (isGenerator) this.raise(key.start, "Constructor can't be a generator");
        method.kind = "constructor";
        hadConstructor = true;
      }
    }
    this.parseClassMethod(classBody, method, isGenerator);
  }
  node.body = this.finishNode(classBody, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};

pp.parseClassMethod = function (classBody, method, isGenerator) {
  method.value = this.parseMethod(isGenerator);
  classBody.body.push(this.finishNode(method, "MethodDefinition"));
};

pp.parseClassId = function (node, isStatement) {
  node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
};

pp.parseClassSuper = function (node) {
  node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null;
};

// Parses module export declaration.

pp.parseExport = function (node) {
  this.next();
  // export * from '...'
  if (this.eat(tt.star)) {
    this.expectContextual("from");
    node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration");
  }
  if (this.eat(tt._default)) {
    // export default ...
    var expr = this.parseMaybeAssign();
    var needsSemi = true;
    if (expr.type == "FunctionExpression" || expr.type == "ClassExpression") {
      needsSemi = false;
      if (expr.id) {
        expr.type = expr.type == "FunctionExpression" ? "FunctionDeclaration" : "ClassDeclaration";
      }
    }
    node.declaration = expr;
    if (needsSemi) this.semicolon();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true);
    node.specifiers = [];
    node.source = null;
  } else {
    // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers();
    if (this.eatContextual("from")) {
      node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
    } else {
      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};

pp.shouldParseExportStatement = function () {
  return this.type.keyword;
};

// Parses a comma-separated list of module exports.

pp.parseExportSpecifiers = function () {
  var nodes = [],
      first = true;
  // export { x, y as z } [from '...']
  this.expect(tt.braceL);
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this.expect(tt.comma);
      if (this.afterTrailingComma(tt.braceR)) break;
    } else first = false;

    var node = this.startNode();
    node.local = this.parseIdent(this.type === tt._default);
    node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
    nodes.push(this.finishNode(node, "ExportSpecifier"));
  }
  return nodes;
};

// Parses import declaration.

pp.parseImport = function (node) {
  this.next();
  // import '...'
  if (this.type === tt.string) {
    node.specifiers = empty;
    node.source = this.parseExprAtom();
    node.kind = "";
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};

// Parses a comma-separated list of module imports.

pp.parseImportSpecifiers = function () {
  var nodes = [],
      first = true;
  if (this.type === tt.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
    if (!this.eat(tt.comma)) return nodes;
  }
  if (this.type === tt.star) {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"));
    return nodes;
  }
  this.expect(tt.braceL);
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this.expect(tt.comma);
      if (this.afterTrailingComma(tt.braceR)) break;
    } else first = false;

    var node = this.startNode();
    node.imported = this.parseIdent(true);
    node.local = this.eatContextual("as") ? this.parseIdent() : node.imported;
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportSpecifier"));
  }
  return nodes;
};

},{"./state":13,"./tokentype":17,"./whitespace":19}],15:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.__esModule = true;
// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

var Parser = _dereq_("./state").Parser;

var tt = _dereq_("./tokentype").types;

var lineBreak = _dereq_("./whitespace").lineBreak;

var TokContext = exports.TokContext = function TokContext(token, isExpr, preserveSpace, override) {
  _classCallCheck(this, TokContext);

  this.token = token;
  this.isExpr = isExpr;
  this.preserveSpace = preserveSpace;
  this.override = override;
};

var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", true),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) {
    return p.readTmplToken();
  }),
  f_expr: new TokContext("function", true)
};

exports.types = types;
var pp = Parser.prototype;

pp.initialContext = function () {
  return [types.b_stat];
};

pp.braceIsBlock = function (prevType) {
  var parent = undefined;
  if (prevType === tt.colon && (parent = this.curContext()).token == "{") return !parent.isExpr;
  if (prevType === tt._return) return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof) return true;
  if (prevType == tt.braceL) return this.curContext() === types.b_stat;
  return !this.exprAllowed;
};

pp.updateContext = function (prevType) {
  var update = undefined,
      type = this.type;
  if (type.keyword && prevType == tt.dot) this.exprAllowed = false;else if (update = type.updateContext) update.call(this, prevType);else this.exprAllowed = type.beforeExpr;
};

// Token-specific context update code

tt.parenR.updateContext = tt.braceR.updateContext = function () {
  if (this.context.length == 1) {
    this.exprAllowed = true;
    return;
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext() === types.f_expr) {
    this.context.pop();
    this.exprAllowed = false;
  } else if (out === types.b_tmpl) {
    this.exprAllowed = true;
  } else {
    this.exprAllowed = !out.isExpr;
  }
};

tt.braceL.updateContext = function (prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};

tt.dollarBraceL.updateContext = function () {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};

tt.parenL.updateContext = function (prevType) {
  var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};

tt.incDec.updateContext = function () {};

tt._function.updateContext = function () {
  if (this.curContext() !== types.b_stat) this.context.push(types.f_expr);
  this.exprAllowed = false;
};

tt.backQuote.updateContext = function () {
  if (this.curContext() === types.q_tmpl) this.context.pop();else this.context.push(types.q_tmpl);
  this.exprAllowed = false;
};

// tokExprAllowed stays unchanged

},{"./state":13,"./tokentype":17,"./whitespace":19}],16:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.__esModule = true;

var _identifier = _dereq_("./identifier");

var isIdentifierStart = _identifier.isIdentifierStart;
var isIdentifierChar = _identifier.isIdentifierChar;

var _tokentype = _dereq_("./tokentype");

var tt = _tokentype.types;
var keywordTypes = _tokentype.keywords;

var Parser = _dereq_("./state").Parser;

var SourceLocation = _dereq_("./location").SourceLocation;

var _whitespace = _dereq_("./whitespace");

var lineBreak = _whitespace.lineBreak;
var lineBreakG = _whitespace.lineBreakG;
var isNewLine = _whitespace.isNewLine;
var nonASCIIwhitespace = _whitespace.nonASCIIwhitespace;

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = exports.Token = function Token(p) {
  _classCallCheck(this, Token);

  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
  if (p.options.ranges) this.range = [p.start, p.end];
};

// ## Tokenizer

var pp = Parser.prototype;

// Are we running under Rhino?
var isRhino = typeof Packages !== "undefined";

// Move to the next token

pp.next = function () {
  if (this.options.onToken) this.options.onToken(new Token(this));

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp.getToken = function () {
  this.next();
  return new Token(this);
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined") pp[Symbol.iterator] = function () {
  var self = this;
  return { next: function next() {
      var token = self.getToken();
      return {
        done: token.type === tt.eof,
        value: token
      };
    } };
};

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp.setStrict = function (strict) {
  this.strict = strict;
  if (this.type !== tt.num && this.type !== tt.string) return;
  this.pos = this.start;
  if (this.options.locations) {
    while (this.pos < this.lineStart) {
      this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
      --this.curLine;
    }
  }
  this.nextToken();
};

pp.curContext = function () {
  return this.context[this.context.length - 1];
};

// Read a single token, updating the parser object's token-related
// properties.

pp.nextToken = function () {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) this.skipSpace();

  this.start = this.pos;
  if (this.options.locations) this.startLoc = this.curPosition();
  if (this.pos >= this.input.length) return this.finishToken(tt.eof);

  if (curContext.override) return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());
};

pp.readToken = function (code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */) return this.readWord();

  return this.getTokenFromCode(code);
};

pp.fullCharCodeAtPos = function () {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 55295 || code >= 57344) return code;
  var next = this.input.charCodeAt(this.pos + 1);
  return (code << 10) + next - 56613888;
};

pp.skipBlockComment = function () {
  var startLoc = this.options.onComment && this.options.locations && this.curPosition();
  var start = this.pos,
      end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
  this.pos = end + 2;
  if (this.options.locations) {
    lineBreakG.lastIndex = start;
    var match = undefined;
    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this.curLine;
      this.lineStart = match.index + match[0].length;
    }
  }
  if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.options.locations && this.curPosition());
};

pp.skipLineComment = function (startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.options.locations && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
    ++this.pos;
    ch = this.input.charCodeAt(this.pos);
  }
  if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.options.locations && this.curPosition());
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp.skipSpace = function () {
  while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 32) {
      // ' '
      ++this.pos;
    } else if (ch === 13) {
      ++this.pos;
      var next = this.input.charCodeAt(this.pos);
      if (next === 10) {
        ++this.pos;
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
    } else if (ch === 10 || ch === 8232 || ch === 8233) {
      ++this.pos;
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
    } else if (ch > 8 && ch < 14) {
      ++this.pos;
    } else if (ch === 47) {
      // '/'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 42) {
        // '*'
        this.skipBlockComment();
      } else if (next === 47) {
        // '/'
        this.skipLineComment(2);
      } else break;
    } else if (ch === 160) {
      // '\xa0'
      ++this.pos;
    } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
      ++this.pos;
    } else {
      break;
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp.finishToken = function (type, val) {
  this.end = this.pos;
  if (this.options.locations) this.endLoc = this.curPosition();
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot = function () {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) return this.readNumber(true);
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(tt.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(tt.dot);
  }
};

pp.readToken_slash = function () {
  // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) {
    ++this.pos;return this.readRegexp();
  }
  if (next === 61) return this.finishOp(tt.assign, 2);
  return this.finishOp(tt.slash, 1);
};

pp.readToken_mult_modulo = function (code) {
  // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(tt.assign, 2);
  return this.finishOp(code === 42 ? tt.star : tt.modulo, 1);
};

pp.readToken_pipe_amp = function (code) {
  // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2);
  if (next === 61) return this.finishOp(tt.assign, 2);
  return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1);
};

pp.readToken_caret = function () {
  // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(tt.assign, 2);
  return this.finishOp(tt.bitwiseXOR, 1);
};

pp.readToken_plus_min = function (code) {
  // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 && lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }
    return this.finishOp(tt.incDec, 2);
  }
  if (next === 61) return this.finishOp(tt.assign, 2);
  return this.finishOp(tt.plusMin, 1);
};

pp.readToken_lt_gt = function (code) {
  // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1);
    return this.finishOp(tt.bitShift, size);
  }
  if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 && this.input.charCodeAt(this.pos + 3) == 45) {
    if (this.inModule) this.unexpected();
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }
  if (next === 61) size = this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2;
  return this.finishOp(tt.relational, size);
};

pp.readToken_eq_excl = function (code) {
  // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    // '=>'
    this.pos += 2;
    return this.finishToken(tt.arrow);
  }
  return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1);
};

pp.getTokenFromCode = function (code) {
  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46:
      // '.'
      return this.readToken_dot();

    // Punctuation tokens.
    case 40:
      ++this.pos;return this.finishToken(tt.parenL);
    case 41:
      ++this.pos;return this.finishToken(tt.parenR);
    case 59:
      ++this.pos;return this.finishToken(tt.semi);
    case 44:
      ++this.pos;return this.finishToken(tt.comma);
    case 91:
      ++this.pos;return this.finishToken(tt.bracketL);
    case 93:
      ++this.pos;return this.finishToken(tt.bracketR);
    case 123:
      ++this.pos;return this.finishToken(tt.braceL);
    case 125:
      ++this.pos;return this.finishToken(tt.braceR);
    case 58:
      ++this.pos;return this.finishToken(tt.colon);
    case 63:
      ++this.pos;return this.finishToken(tt.question);

    case 96:
      // '`'
      if (this.options.ecmaVersion < 6) break;
      ++this.pos;
      return this.finishToken(tt.backQuote);

    case 48:
      // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) return this.readRadixNumber(16); // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) return this.readRadixNumber(8); // '0o', '0O' - octal number
        if (next === 98 || next === 66) return this.readRadixNumber(2); // '0b', '0B' - binary number
      }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
      // 1-9
      return this.readNumber(false);

    // Quotes produce strings.
    case 34:case 39:
      // '"', "'"
      return this.readString(code);

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47:
      // '/'
      return this.readToken_slash();

    case 37:case 42:
      // '%*'
      return this.readToken_mult_modulo(code);

    case 124:case 38:
      // '|&'
      return this.readToken_pipe_amp(code);

    case 94:
      // '^'
      return this.readToken_caret();

    case 43:case 45:
      // '+-'
      return this.readToken_plus_min(code);

    case 60:case 62:
      // '<>'
      return this.readToken_lt_gt(code);

    case 61:case 33:
      // '=!'
      return this.readToken_eq_excl(code);

    case 126:
      // '~'
      return this.finishOp(tt.prefix, 1);
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.finishOp = function (type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};

var regexpUnicodeSupport = false;
try {
  new RegExp("￿", "u");regexpUnicodeSupport = true;
} catch (e) {}

// Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.

pp.readRegexp = function () {
  var escaped = undefined,
      inClass = undefined,
      start = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");
    if (!escaped) {
      if (ch === "[") inClass = true;else if (ch === "]" && inClass) inClass = false;else if (ch === "/" && !inClass) break;
      escaped = ch === "\\";
    } else escaped = false;
    ++this.pos;
  }
  var content = this.input.slice(start, this.pos);
  ++this.pos;
  // Need to use `readWord1` because '\uXXXX' sequences are allowed
  // here (don't ask).
  var mods = this.readWord1();
  var tmp = content;
  if (mods) {
    var validFlags = /^[gmsiy]*$/;
    if (this.options.ecmaVersion >= 6) validFlags = /^[gmsiyu]*$/;
    if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag");
    if (mods.indexOf("u") >= 0 && !regexpUnicodeSupport) {
      // Replace each astral symbol and every Unicode escape sequence that
      // possibly represents an astral symbol or a paired surrogate with a
      // single ASCII symbol to avoid throwing on regular expressions that
      // are only valid in combination with the `/u` flag.
      // Note: replacing with the ASCII symbol `x` might cause false
      // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
      // perfectly valid pattern that is equivalent to `[a-b]`, but it would
      // be replaced by `[x-b]` which throws an error.
      tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|\\u\{([0-9a-fA-F]+)\}|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
    }
  }
  // Detect invalid regular expressions.
  var value = null;
  // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
  // so don't do detection if we are running under Rhino
  if (!isRhino) {
    try {
      new RegExp(tmp);
    } catch (e) {
      if (e instanceof SyntaxError) this.raise(start, "Error parsing regular expression: " + e.message);
      this.raise(e);
    }
    // Get a regular expression object for this pattern-flag pair, or `null` in
    // case the current environment doesn't support the flags it uses.
    try {
      value = new RegExp(content, mods);
    } catch (err) {}
  }
  return this.finishToken(tt.regexp, { pattern: content, flags: mods, value: value });
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp.readInt = function (radix, len) {
  var start = this.pos,
      total = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this.input.charCodeAt(this.pos),
        val = undefined;
    if (code >= 97) val = code - 97 + 10; // a
    else if (code >= 65) val = code - 65 + 10; // A
    else if (code >= 48 && code <= 57) val = code - 48; // 0-9
    else val = Infinity;
    if (val >= radix) break;
    ++this.pos;
    total = total * radix + val;
  }
  if (this.pos === start || len != null && this.pos - start !== len) return null;

  return total;
};

pp.readRadixNumber = function (radix) {
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
  return this.finishToken(tt.num, val);
};

// Read an integer, octal integer, or floating-point number.

pp.readNumber = function (startsWithDot) {
  var start = this.pos,
      isFloat = false,
      octal = this.input.charCodeAt(this.pos) === 48;
  if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
  if (this.input.charCodeAt(this.pos) === 46) {
    ++this.pos;
    this.readInt(10);
    isFloat = true;
  }
  var next = this.input.charCodeAt(this.pos);
  if (next === 69 || next === 101) {
    // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) ++this.pos; // '+-'
    if (this.readInt(10) === null) this.raise(start, "Invalid number");
    isFloat = true;
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");

  var str = this.input.slice(start, this.pos),
      val = undefined;
  if (isFloat) val = parseFloat(str);else if (!octal || str.length === 1) val = parseInt(str, 10);else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number");else val = parseInt(str, 8);
  return this.finishToken(tt.num, val);
};

// Read a string value, interpreting backslash-escapes.

pp.readCodePoint = function () {
  var ch = this.input.charCodeAt(this.pos),
      code = undefined;

  if (ch === 123) {
    if (this.options.ecmaVersion < 6) this.unexpected();
    ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 1114111) this.unexpected();
  } else {
    code = this.readHexChar(4);
  }
  return code;
};

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 65535) {
    return String.fromCharCode(code);
  }return String.fromCharCode((code - 65536 >> 10) + 55296, (code - 65536 & 1023) + 56320);
}

pp.readString = function (quote) {
  var out = "",
      chunkStart = ++this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) break;
    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar();
      chunkStart = this.pos;
    } else {
      if (isNewLine(ch)) this.raise(this.start, "Unterminated string constant");
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(tt.string, out);
};

// Reads template string tokens.

pp.readTmplToken = function () {
  var out = "",
      chunkStart = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      // '`', '${'
      if (this.pos === this.start && this.type === tt.template) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(tt.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(tt.backQuote);
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(tt.template, out);
    }
    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar();
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      if (ch === 13 && this.input.charCodeAt(this.pos) === 10) {
        ++this.pos;
        out += "\n";
      } else {
        out += String.fromCharCode(ch);
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};

// Used to read escaped characters

pp.readEscapedChar = function () {
  var ch = this.input.charCodeAt(++this.pos);
  var octal = /^[0-7]+/.exec(this.input.slice(this.pos, this.pos + 3));
  if (octal) octal = octal[0];
  while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, -1);
  if (octal === "0") octal = null;
  ++this.pos;
  if (octal) {
    if (this.strict) this.raise(this.pos - 2, "Octal literal in strict mode");
    this.pos += octal.length - 1;
    return String.fromCharCode(parseInt(octal, 8));
  } else {
    switch (ch) {
      case 110:
        return "\n"; // 'n' -> '\n'
      case 114:
        return "\r"; // 'r' -> '\r'
      case 120:
        return String.fromCharCode(this.readHexChar(2)); // 'x'
      case 117:
        return codePointToString(this.readCodePoint()); // 'u'
      case 116:
        return "\t"; // 't' -> '\t'
      case 98:
        return "\b"; // 'b' -> '\b'
      case 118:
        return "\u000b"; // 'v' -> '\u000b'
      case 102:
        return "\f"; // 'f' -> '\f'
      case 48:
        return "\u0000"; // 0 -> '\0'
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) ++this.pos; // '\r\n'
      case 10:
        // ' \n'
        if (this.options.locations) {
          this.lineStart = this.pos;++this.curLine;
        }
        return "";
      default:
        return String.fromCharCode(ch);
    }
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp.readHexChar = function (len) {
  var n = this.readInt(16, len);
  if (n === null) this.raise(this.start, "Bad character escape sequence");
  return n;
};

// Used to signal to callers of `readWord1` whether the word
// contained any escape sequences. This is needed because words with
// escape sequences must not be interpreted as keywords.

var containsEsc;

// Read an identifier, and return it as a string. Sets `containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp.readWord1 = function () {
  containsEsc = false;
  var word = "",
      first = true,
      chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 65535 ? 1 : 2;
    } else if (ch === 92) {
      // "\"
      containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) != 117) // "u"
        this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) this.raise(escStart, "Invalid Unicode escape");
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos);
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp.readWord = function () {
  var word = this.readWord1();
  var type = tt.name;
  if ((this.options.ecmaVersion >= 6 || !containsEsc) && this.isKeyword(word)) type = keywordTypes[word];
  return this.finishToken(type, word);
};

},{"./identifier":7,"./location":8,"./state":13,"./tokentype":17,"./whitespace":19}],17:[function(_dereq_,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.__esModule = true;
// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = exports.TokenType = function TokenType(label) {
  var conf = arguments[1] === undefined ? {} : arguments[1];

  _classCallCheck(this, TokenType);

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
var beforeExpr = { beforeExpr: true },
    startsExpr = { startsExpr: true };

var types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  prefix: new TokenType("prefix", { beforeExpr: true, prefix: true, startsExpr: true }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=", 6),
  relational: binop("</>", 7),
  bitShift: binop("<</>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10)
};

exports.types = types;
// Map keyword names to token types.

var keywords = {};

exports.keywords = keywords;
// Succinct definitions of keyword token types
function kw(name) {
  var options = arguments[1] === undefined ? {} : arguments[1];

  options.keyword = name;
  keywords[name] = types["_" + name] = new TokenType(name, options);
}

kw("break");
kw("case", beforeExpr);
kw("catch");
kw("continue");
kw("debugger");
kw("default");
kw("do", { isLoop: true });
kw("else", beforeExpr);
kw("finally");
kw("for", { isLoop: true });
kw("function", startsExpr);
kw("if");
kw("return", beforeExpr);
kw("switch");
kw("throw", beforeExpr);
kw("try");
kw("var");
kw("let");
kw("const");
kw("while", { isLoop: true });
kw("with");
kw("new", { beforeExpr: true, startsExpr: true });
kw("this", startsExpr);
kw("super", startsExpr);
kw("class");
kw("extends", beforeExpr);
kw("export");
kw("import");
kw("yield", { beforeExpr: true, startsExpr: true });
kw("null", startsExpr);
kw("true", startsExpr);
kw("false", startsExpr);
kw("in", { beforeExpr: true, binop: 7 });
kw("instanceof", { beforeExpr: true, binop: 7 });
kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true });
kw("void", { beforeExpr: true, prefix: true, startsExpr: true });
kw("delete", { beforeExpr: true, prefix: true, startsExpr: true });

},{}],18:[function(_dereq_,module,exports){
"use strict";

exports.isArray = isArray;

// Checks if an object has a property.

exports.has = has;
exports.__esModule = true;

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

function has(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

},{}],19:[function(_dereq_,module,exports){
"use strict";

exports.isNewLine = isNewLine;
exports.__esModule = true;
// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;
exports.lineBreak = lineBreak;
var lineBreakG = new RegExp(lineBreak.source, "g");

exports.lineBreakG = lineBreakG;

function isNewLine(code) {
  return code === 10 || code === 13 || code === 8232 || code == 8233;
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
exports.nonASCIIwhitespace = nonASCIIwhitespace;

},{}]},{},[1])(1)
});
})(null);
(function(module){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

window.isArguments = module.exports;
})({exports: {}});
(function(module){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


window.forEach = module.exports;
})({exports: {}});
(function(module){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

window.isArray = module.exports;
})({exports: {}});
(function(require,module){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = require('./isArguments');
var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var blacklistedKeys = {
	$console: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$parent: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!blacklistedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

window.objectKeys =  module.exports;
})(function(){return isArguments;},{exports: {}});
/*!
 * falafel (c) James Halliday / MIT License
 * https://github.com/substack/node-falafel
 */

(function(require,module){
var parse = require('acorn').parse;
var isArray = require('isarray');
var objectKeys = require('object-keys');
var forEach = require('foreach');

module.exports = function (src, opts, fn) {
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }
    if (src && typeof src === 'object' && src.constructor.name === 'Buffer') {
        src = src.toString();
    }
    else if (src && typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    src = src === undefined ? opts.source : src;
    if (typeof src !== 'string') src = String(src);
    if (opts.parser) parse = opts.parser.parse;
    var ast = parse(src, opts);
    
    var result = {
        chunks : src.split(''),
        toString : function () { return result.chunks.join('') },
        inspect : function () { return result.toString() }
    };
    var index = 0;
    
    (function walk (node, parent) {
        insertHelpers(node, parent, result.chunks);
        
        forEach(objectKeys(node), function (key) {
            if (key === 'parent') return;
            
            var child = node[key];
            if (isArray(child)) {
                forEach(child, function (c) {
                    if (c && typeof c.type === 'string') {
                        walk(c, node);
                    }
                });
            }
            else if (child && typeof child.type === 'string') {
                walk(child, node);
            }
        });
        fn(node);
    })(ast, undefined);
    
    return result;
};
 
function insertHelpers (node, parent, chunks) {
    node.parent = parent;
    
    node.source = function () {
        return chunks.slice(node.start, node.end).join('');
    };
    
    if (node.update && typeof node.update === 'object') {
        var prev = node.update;
        forEach(objectKeys(prev), function (key) {
            update[key] = prev[key];
        });
        node.update = update;
    }
    else {
        node.update = update;
    }
    
    function update (s) {
        chunks[node.start] = s;
        for (var i = node.start + 1; i < node.end; i++) {
            chunks[i] = '';
        }
    }
}

window.falafel = module.exports;})(function(moduleName){switch(moduleName){case "acorn":
return {parse: acorn.parse};
case "object-keys":
return objectKeys;
case "foreach":
return forEach;
case "isarray":
return isArray;}},{exports: {}});
var inBrowser = typeof window !== 'undefined' && this === window;
var parseAndModify = (inBrowser ? window.falafel : require("falafel"));

(inBrowser ? window : exports).blanket = (function(){
    var linesToAddTracking = [
        "ExpressionStatement",
        "BreakStatement"   ,
        "ContinueStatement" ,
        "VariableDeclaration",
        "ReturnStatement"   ,
        "ThrowStatement"   ,
        "TryStatement"     ,
        "FunctionDeclaration"    ,
        "IfStatement"       ,
        "WhileStatement"    ,
        "DoWhileStatement"   ,
        "ForStatement"   ,
        "ForInStatement"  ,
        "SwitchStatement"  ,
        "WithStatement"
    ],
    linesToAddBrackets = [
        "IfStatement"       ,
        "WhileStatement"    ,
        "DoWhileStatement"     ,
        "ForStatement"   ,
        "ForInStatement"  ,
        "WithStatement"
    ],
    __blanket,
    copynumber = Math.floor(Math.random()*1000),
    coverageInfo = {},options = {
        reporter: null,
        adapter:null,
        filter: null,
        customVariable: null,
        loader: null,
        ignoreScriptError: false,
        existingRequireJS:false,
        autoStart: false,
        timeout: 180,
        ignoreCors: false,
        branchTracking: false,
        sourceURL: false,
        debug:false,
        engineOnly:false,
        testReadyCallback:null,
        commonJS:false,
        instrumentCache:false,
        modulePattern: null,
        ecmaVersion: 5
    };

    if (inBrowser && typeof window.blanket !== 'undefined'){
        __blanket = window.blanket.noConflict();
    }

    _blanket = {
        noConflict: function(){
            if (__blanket){
                return __blanket;
            }
            return _blanket;
        },
        _getCopyNumber: function(){
            //internal method
            //for differentiating between instances
            return copynumber;
        },
        extend: function(obj) {
            //borrowed from underscore
            _blanket._extend(_blanket,obj);
        },
        _extend: function(dest,source){
          if (source) {
            for (var prop in source) {
              if ( dest[prop] instanceof Object && typeof dest[prop] !== "function"){
                _blanket._extend(dest[prop],source[prop]);
              }else{
                  dest[prop] = source[prop];
              }
            }
          }
        },
        getCovVar: function(){
            var opt = _blanket.options("customVariable");
            if (opt){
                if (_blanket.options("debug")) {console.log("BLANKET-Using custom tracking variable:",opt);}
                return inBrowser ? "window."+opt : opt;
            }
            return inBrowser ?   "window._$blanket" : "_$jscoverage";
        },
        options: function(key,value){
            if (typeof key !== "string"){
                _blanket._extend(options,key);
            }else if (typeof value === 'undefined'){
                return options[key];
            }else{
                options[key]=value;
            }
        },
        // instrument the file synchronously
        // `next` is optional callback which will be called
        // with instrumented code when present
        instrumentSync: function(config, next){
            //check instrumented hash table,
            //return instrumented code if available.
            var inFile = config.inputFile,
                inFileName = config.inputFileName;
            //check instrument cache
           if (_blanket.options("instrumentCache") && sessionStorage && sessionStorage.getItem("blanket_instrument_store-"+inFileName)){
                if (_blanket.options("debug")) {console.log("BLANKET-Reading instrumentation from cache: ",inFileName);}
                if (next) {
                    next(sessionStorage.getItem("blanket_instrument_store-"+inFileName));
                } else {
                    return(sessionStorage.getItem("blanket_instrument_store-"+inFileName));
                }
            }else{
                var sourceArray = _blanket._prepareSource(inFile);
                _blanket._trackingArraySetup=[];
                //remove shebang
                inFile = inFile.replace(/^\#\!.*/, "");
                var instrumented =  parseAndModify(inFile,{locations:true,comment:true,ecmaVersion:_blanket.options("ecmaVersion")}, _blanket._addTracking(inFileName));
                instrumented = _blanket._trackingSetup(inFileName,sourceArray)+instrumented;
                if (_blanket.options("sourceURL")){
                    instrumented += "\n//@ sourceURL="+inFileName.replace("http://","");
                }
                if (_blanket.options("debug")) {console.log("BLANKET-Instrumented file: ",inFileName);}
                if (_blanket.options("instrumentCache") && sessionStorage){
                    if (_blanket.options("debug")) {console.log("BLANKET-Saving instrumentation to cache: ",inFileName);}
                    sessionStorage.setItem("blanket_instrument_store-"+inFileName,instrumented);
                }
                if (next) {
                    next(instrumented);
                } else {
                    return(instrumented);
                }
            }
        },
        instrument: function(config, next){
            _blanket.instrumentSync(config, next);
        },
        _trackingArraySetup: [],
        _branchingArraySetup: [],
        _useStrictMode: false,
        _prepareSource: function(source){
            return source.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/(\r\n|\n|\r)/gm,"\n").split('\n');
        },
        _trackingSetup: function(filename,sourceArray){
            var branches = _blanket.options("branchTracking");
            var sourceString = sourceArray.join("',\n'");
            var intro = "";
            var covVar = _blanket.getCovVar();

            if(_blanket._useStrictMode) {
                intro += "'use strict';\n";
            }

            intro += "if (typeof "+covVar+" === 'undefined') "+covVar+" = {};\n";
            if (branches){
                intro += "var _$branchFcn=function(f,l,c,r){ ";
                intro += "if (!!r) { ";
                intro += covVar+"[f].branchData[l][c][0] = "+covVar+"[f].branchData[l][c][0] || [];";
                intro += covVar+"[f].branchData[l][c][0].push(r); }";
                intro += "else { ";
                intro += covVar+"[f].branchData[l][c][1] = "+covVar+"[f].branchData[l][c][1] || [];";
                intro += covVar+"[f].branchData[l][c][1].push(r); }";
                intro += "return r;};\n";
            }
            intro += "if (typeof "+covVar+"['"+filename+"'] === 'undefined'){";

            intro += covVar+"['"+filename+"']=[];\n";
            if (branches){
                intro += covVar+"['"+filename+"'].branchData=[];\n";
            }
            intro += covVar+"['"+filename+"'].source=['"+sourceString+"'];\n";
            //initialize array values
            _blanket._trackingArraySetup.sort(function(a,b){
                return parseInt(a,10) > parseInt(b,10);
            }).forEach(function(item){
                intro += covVar+"['"+filename+"']["+item+"]=0;\n";
            });
            if (branches){
                _blanket._branchingArraySetup.sort(function(a,b){
                    return a.line > b.line;
                }).sort(function(a,b){
                    return a.column > b.column;
                }).forEach(function(item){
                    if (item.file === filename){
                        intro += "if (typeof "+ covVar+"['"+filename+"'].branchData["+item.line+"] === 'undefined'){\n";
                        intro += covVar+"['"+filename+"'].branchData["+item.line+"]=[];\n";
                        intro += "}";
                        intro += covVar+"['"+filename+"'].branchData["+item.line+"]["+item.column+"] = [];\n";
                        intro += covVar+"['"+filename+"'].branchData["+item.line+"]["+item.column+"].consequent = "+JSON.stringify(item.consequent)+";\n";
                        intro += covVar+"['"+filename+"'].branchData["+item.line+"]["+item.column+"].alternate = "+JSON.stringify(item.alternate)+";\n";
                    }
                });
            }
            intro += "}";

            return intro;
        },
        _blockifyIf: function(node){
            if (linesToAddBrackets.indexOf(node.type) > -1){
                var bracketsExistObject = node.consequent || node.body;
                var bracketsExistAlt = node.alternate;
                if( bracketsExistAlt && bracketsExistAlt.type !== "BlockStatement") {
                    bracketsExistAlt.update("{\n"+bracketsExistAlt.source()+"}\n");
                }
                if( bracketsExistObject && bracketsExistObject.type !== "BlockStatement") {
                    bracketsExistObject.update("{\n"+bracketsExistObject.source()+"}\n");
                }
            }
        },
        _trackBranch: function(node,filename){
            //recursive on consequent and alternative
            var line = node.loc.start.line;
            var col = node.loc.start.column;

            _blanket._branchingArraySetup.push({
                line: line,
                column: col,
                file:filename,
                consequent: node.consequent.loc,
                alternate: node.alternate.loc
            });

            var updated = "_$branchFcn"+
                          "('"+filename+"',"+line+","+col+","+node.test.source()+
                          ")?"+node.consequent.source()+":"+node.alternate.source();
            node.update(updated);
        },
        _addTracking: function (filename) {
            //falafel doesn't take a file name
            //so we include the filename in a closure
            //and return the function to falafel
            var covVar = _blanket.getCovVar();

            return function(node){
                _blanket._blockifyIf(node);

                if (linesToAddTracking.indexOf(node.type) > -1 && node.parent.type !== "LabeledStatement") {
                    _blanket._checkDefs(node,filename);
                    if (node.type === "VariableDeclaration" &&
                        (node.parent.type === "ForStatement" || node.parent.type === "ForInStatement")){
                        return;
                    }
                    if (node.loc && node.loc.start){
                        node.update(covVar+"['"+filename+"']["+node.loc.start.line+"]++;\n"+node.source());
                        _blanket._trackingArraySetup.push(node.loc.start.line);
                    }else{
                        //I don't think we can handle a node with no location
                        throw new Error("The instrumenter encountered a node with no location: "+Object.keys(node));
                    }
                }else if (_blanket.options("branchTracking") && node.type === "ConditionalExpression"){
                    _blanket._trackBranch(node,filename);
                }else if (node.type === "Literal" && node.value === "use strict" && node.parent && node.parent.type === "ExpressionStatement" && node.parent.parent && node.parent.parent.type === "Program"){
                    _blanket._useStrictMode = true;
                }
            };
        },
        _checkDefs: function(node,filename){
            // Make sure developers don't redefine window. if they do, inform them it is wrong.
            if (inBrowser){
                if (node.type === "VariableDeclaration" && node.declarations) {
                    node.declarations.forEach(function(declaration) {
                        if (declaration.id.name === "window") {
                            throw new Error("Instrumentation error, you cannot redefine the 'window' variable in  " + filename + ":" + node.loc.start.line);
                        }
                    });
                }
                if (node.type === "FunctionDeclaration" && node.params) {
                    node.params.forEach(function(param) {
                        if (param.name === "window") {
                            throw new Error("Instrumentation error, you cannot redefine the 'window' variable in  " + filename + ":" + node.loc.start.line);
                        }
                    });
                }
                //Make sure developers don't redefine the coverage variable
                if (node.type === "ExpressionStatement" &&
                    node.expression && node.expression.left &&
                    node.expression.left.object && node.expression.left.property &&
                    node.expression.left.object.name +
                        "." + node.expression.left.property.name === _blanket.getCovVar()) {
                    throw new Error("Instrumentation error, you cannot redefine the coverage variable in  " + filename + ":" + node.loc.start.line);
                }
            }else{
                //Make sure developers don't redefine the coverage variable in node
                if (node.type === "ExpressionStatement" &&
                    node.expression && node.expression.left &&
                    !node.expression.left.object && !node.expression.left.property &&
                    node.expression.left.name === _blanket.getCovVar()) {
                    throw new Error("Instrumentation error, you cannot redefine the coverage variable in  " + filename + ":" + node.loc.start.line);
                }
            }
        },
        setupCoverage: function(){
            coverageInfo.instrumentation = "blanket";
            coverageInfo.stats = {
                "suites": 0,
                "tests": 0,
                "passes": 0,
                "pending": 0,
                "failures": 0,
                "start": new Date()
            };
        },
        _checkIfSetup: function(){
            if (!coverageInfo.stats){
                throw new Error("You must call blanket.setupCoverage() first.");
            }
        },
        onTestStart: function(){
            if (_blanket.options("debug")) {console.log("BLANKET-Test event started");}
            this._checkIfSetup();
            coverageInfo.stats.tests++;
            coverageInfo.stats.pending++;
        },
        onTestDone: function(total,passed){
            this._checkIfSetup();
            if(passed === total){
                coverageInfo.stats.passes++;
            }else{
                coverageInfo.stats.failures++;
            }
            coverageInfo.stats.pending--;
        },
        onModuleStart: function(){
            this._checkIfSetup();
            coverageInfo.stats.suites++;
        },
        onTestsDone: function(){
            if (_blanket.options("debug")) {console.log("BLANKET-Test event done");}
            this._checkIfSetup();
            coverageInfo.stats.end = new Date();

            if (inBrowser){
                this.report(coverageInfo);
            }else{
                if (!_blanket.options("branchTracking")){
                    delete (inBrowser ? window : global)[_blanket.getCovVar()].branchFcn;
                }
                this.options("reporter").call(this,coverageInfo);
            }
        }
    };
    return _blanket;
})();

(function(_blanket){
    var oldOptions = _blanket.options;
_blanket.extend({
    outstandingRequireFiles:[],
    options: function(key,value){
        var newVal={};

        if (typeof key !== "string"){
            //key is key/value map
            oldOptions(key);
            newVal = key;
        }else if (typeof value === 'undefined'){
            //accessor
            return oldOptions(key);
        }else{
            //setter
            oldOptions(key,value);
            newVal[key] = value;
        }

        if (newVal.adapter){
            _blanket._loadFile(newVal.adapter);
        }
        if (newVal.loader){
            _blanket._loadFile(newVal.loader);
        }
    },
    requiringFile: function(filename,done){
        if (typeof filename === "undefined"){
            _blanket.outstandingRequireFiles=[];
        }else if (typeof done === "undefined"){
            _blanket.outstandingRequireFiles.push(filename);
        }else{
            _blanket.outstandingRequireFiles.splice(_blanket.outstandingRequireFiles.indexOf(filename),1);
        }
    },
    requireFilesLoaded: function(){
        return _blanket.outstandingRequireFiles.length === 0;
    },
    showManualLoader: function(){
        if (document.getElementById("blanketLoaderDialog")){
            return;
        }
        //copied from http://blog.avtex.com/2012/01/26/cross-browser-css-only-modal-box/
        var loader = "<div class='blanketDialogOverlay'>";
            loader += "&nbsp;</div>";
            loader += "<div class='blanketDialogVerticalOffset'>";
            loader += "<div class='blanketDialogBox'>";
            loader += "<b>Error:</b> Blanket.js encountered a cross origin request error while instrumenting the source files.  ";
            loader += "<br><br>This is likely caused by the source files being referenced locally (using the file:// protocol). ";
            loader += "<br><br>Some solutions include <a href='http://askubuntu.com/questions/160245/making-google-chrome-option-allow-file-access-from-files-permanent' target='_blank'>starting Chrome with special flags</a>, <a target='_blank' href='https://github.com/remy/servedir'>running a server locally</a>, or using a browser without these CORS restrictions (Safari).";
            loader += "<br>";
            if (typeof FileReader !== "undefined"){
                loader += "<br>Or, try the experimental loader.  When prompted, simply click on the directory containing all the source files you want covered.";
                loader += "<a href='javascript:document.getElementById(\"fileInput\").click();'>Start Loader</a>";
                loader += "<input type='file' type='application/x-javascript' accept='application/x-javascript' webkitdirectory id='fileInput' multiple onchange='window.blanket.manualFileLoader(this.files)' style='visibility:hidden;position:absolute;top:-50;left:-50'/>";
            }
            loader += "<br><span style='float:right;cursor:pointer;'  onclick=document.getElementById('blanketLoaderDialog').style.display='none';>Close</span>";
            loader += "<div style='clear:both'></div>";
            loader += "</div></div>";

        var css = ".blanketDialogWrapper {";
            css += "display:block;";
            css += "position:fixed;";
            css += "z-index:40001; }";

            css += ".blanketDialogOverlay {";
            css += "position:fixed;";
            css += "width:100%;";
            css += "height:100%;";
            css += "background-color:black;";
            css += "opacity:.5; ";
            css += "-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=50)'; ";
            css += "filter:alpha(opacity=50); ";
            css += "z-index:40001; }";

            css += ".blanketDialogVerticalOffset { ";
            css += "position:fixed;";
            css += "top:30%;";
            css += "width:100%;";
            css += "z-index:40002; }";

            css += ".blanketDialogBox { ";
            css += "width:405px; ";
            css += "position:relative;";
            css += "margin:0 auto;";
            css += "background-color:white;";
            css += "padding:10px;";
            css += "border:1px solid black; }";

        var dom = document.createElement("style");
        dom.innerHTML = css;
        document.head.appendChild(dom);

        var div = document.createElement("div");
        div.id = "blanketLoaderDialog";
        div.className = "blanketDialogWrapper";
        div.innerHTML = loader;
        document.body.insertBefore(div,document.body.firstChild);

    },
    manualFileLoader: function(files){
        var toArray =Array.prototype.slice;
        files = toArray.call(files).filter(function(item){
            return item.type !== "";
        });
        var sessionLength = files.length-1;
        var sessionIndx=0;
        var sessionArray = {};
        if (sessionStorage["blanketSessionLoader"]){
            sessionArray = JSON.parse(sessionStorage["blanketSessionLoader"]);
        }


        var fileLoader = function(event){
            var fileContent = event.currentTarget.result;
            var file = files[sessionIndx];
            var filename = file.webkitRelativePath && file.webkitRelativePath !== '' ? file.webkitRelativePath : file.name;
            sessionArray[filename] = fileContent;
            sessionIndx++;
            if (sessionIndx === sessionLength){
                sessionStorage.setItem("blanketSessionLoader", JSON.stringify(sessionArray));
                document.location.reload();
            }else{
                readFile(files[sessionIndx]);
            }
        };
        function readFile(file){
            var reader = new FileReader();
            reader.onload = fileLoader;
            reader.readAsText(file);
        }
        readFile(files[sessionIndx]);
    },
    _loadFile: function(path){
        if (typeof path !== "undefined"){
            var request = new XMLHttpRequest();
            request.open('GET', path, false);
            request.send();
            _blanket._addScript(request.responseText);
        }
    },
    _addScript: function(data){
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.text = data;
        (document.body || document.getElementsByTagName('head')[0]).appendChild(script);
    },
    hasAdapter: function(callback){
        return _blanket.options("adapter") !== null;
    },
    report: function(coverage_data){
        if (!document.getElementById("blanketLoaderDialog")){
            //all found, clear it
            _blanket.blanketSession = null;
        }
        coverage_data.files = window._$blanket;
        var require = blanket.options("commonJS") ? blanket._commonjs.require : window.require;

        // Check if we have any covered files that requires reporting
        // otherwise just exit gracefully.
        if (!coverage_data.files || !Object.keys(coverage_data.files).length) {
            if (_blanket.options("debug")) {console.log("BLANKET-Reporting No files were instrumented.");}
            return;
        }

        if (typeof coverage_data.files.branchFcn !== "undefined"){
            delete coverage_data.files.branchFcn;
        }
        if (typeof _blanket.options("reporter") === "string"){
            _blanket._loadFile(_blanket.options("reporter"));
            _blanket.customReporter(coverage_data,_blanket.options("reporter_options"));
        }else if (typeof _blanket.options("reporter") === "function"){
            _blanket.options("reporter")(coverage_data,_blanket.options("reporter_options"));
        }else if (typeof _blanket.defaultReporter === 'function'){
            _blanket.defaultReporter(coverage_data,_blanket.options("reporter_options"));
        }else{
            throw new Error("no reporter defined.");
        }
    },
    _bindStartTestRunner: function(bindEvent,startEvent){
        if (bindEvent){
            bindEvent(startEvent);
        }else{
            if (document.readyState === "complete") {
                startEvent();
            } else {
                window.addEventListener("load",startEvent,false);
            }
        }
    },
    _loadSourceFiles: function(callback){
        var require = blanket.options("commonJS") ? blanket._commonjs.require : window.require;
        function copy(o){
          var _copy = Object.create( Object.getPrototypeOf(o) );
          var propNames = Object.getOwnPropertyNames(o);

          propNames.forEach(function(name){
            var desc = Object.getOwnPropertyDescriptor(o, name);
            Object.defineProperty(_copy, name, desc);
          });

          return _copy;
        }
        if (_blanket.options("debug")) {console.log("BLANKET-Collecting page scripts");}
        var scripts = _blanket.utils.collectPageScripts();
        //_blanket.options("filter",scripts);
        if (scripts.length === 0){
            callback();
        }else{

            //check session state
            if (sessionStorage["blanketSessionLoader"]){
                _blanket.blanketSession = JSON.parse(sessionStorage["blanketSessionLoader"]);
            }
            
            scripts.forEach(function(file,indx){
                _blanket.utils.cache[file]={
                    loaded:false
                };
            });
            
            var currScript=-1;
            _blanket.utils.loadAll(function(test){
                if (test){
                  return typeof scripts[currScript+1] !== 'undefined';
                }
                currScript++;
                if (currScript >= scripts.length){
                  return null;
                }
                return scripts[currScript];
            },callback);
        }
    },
    beforeStartTestRunner: function(opts){
        opts = opts || {};
        opts.checkRequirejs = typeof opts.checkRequirejs === "undefined" ? true : opts.checkRequirejs;
        opts.callback = opts.callback || function() {  };
        opts.coverage = typeof opts.coverage === "undefined" ? true : opts.coverage;
        if (opts.coverage) {
            _blanket._bindStartTestRunner(opts.bindEvent,
            function(){
                _blanket._loadSourceFiles(function() {

                    var allLoaded = function(){
                        return opts.condition ? opts.condition() : _blanket.requireFilesLoaded();
                    };
                    var check = function() {
                        if (allLoaded()) {
                            if (_blanket.options("debug")) {console.log("BLANKET-All files loaded, init start test runner callback.");}
                            var cb = _blanket.options("testReadyCallback");

                            if (cb){
                                if (typeof cb === "function"){
                                    cb(opts.callback);
                                }else if (typeof cb === "string"){
                                    _blanket._addScript(cb);
                                    opts.callback();
                                }
                            }else{
                                opts.callback();
                            }
                        } else {
                            setTimeout(check, 13);
                        }
                    };
                    check();
                });
            });
        }else{
            opts.callback();
        }
    },
    utils: {
        qualifyURL: function (url) {
            //http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
            var a = document.createElement('a');
            a.href = url;
            return a.href;
        }
    }
});

})(blanket);

blanket.defaultReporter = function(coverage){
    var cssSytle = "#blanket-main {margin:2px;background:#EEE;color:#333;clear:both;font-family:'Helvetica Neue Light', 'HelveticaNeue-Light', 'Helvetica Neue', Calibri, Helvetica, Arial, sans-serif; font-size:17px;} #blanket-main a {color:#333;text-decoration:none;}  #blanket-main a:hover {text-decoration:underline;} .blanket {margin:0;padding:5px;clear:both;border-bottom: 1px solid #FFFFFF;} .bl-error {color:red;}.bl-success {color:#5E7D00;} .bl-file{width:auto;} .bl-cl{float:left;} .blanket div.rs {margin-left:50px; width:150px; float:right} .bl-nb {padding-right:10px;} #blanket-main a.bl-logo {color: #EB1764;cursor: pointer;font-weight: bold;text-decoration: none} .bl-source{ overflow-x:scroll; background-color: #FFFFFF; border: 1px solid #CBCBCB; color: #363636; margin: 25px 20px; width: 80%;} .bl-source div{white-space: pre;font-family: monospace;} .bl-source > div > span:first-child{background-color: #EAEAEA;color: #949494;display: inline-block;padding: 0 10px;text-align: center;width: 30px;} .bl-source .hit{background-color:#c3e6c7} .bl-source .miss{background-color:#e6c3c7} .bl-source span.branchWarning{color:#000;background-color:yellow;} .bl-source span.branchOkay{color:#000;background-color:transparent;}",
        successRate = 60,
        head = document.head,
        fileNumber = 0,
        body = document.body,
        headerContent,
        hasBranchTracking = Object.keys(coverage.files).some(function(elem){
          return typeof coverage.files[elem].branchData !== 'undefined';
        }),
        bodyContent = "<div id='blanket-main'><div class='blanket bl-title'><div class='bl-cl bl-file'><a href='http://alex-seville.github.com/blanket/' target='_blank' class='bl-logo'>Blanket.js</a> results</div><div class='bl-cl rs'>Coverage (%)</div><div class='bl-cl rs'>Covered/Total Smts.</div>"+(hasBranchTracking ? "<div class='bl-cl rs'>Covered/Total Branches</div>":"")+"<div style='clear:both;'></div></div>",
        fileTemplate = "<div class='blanket {{statusclass}}'><div class='bl-cl bl-file'><span class='bl-nb'>{{fileNumber}}.</span><a href='javascript:blanket_toggleSource(\"file-{{fileNumber}}\")'>{{file}}</a></div><div class='bl-cl rs'>{{percentage}} %</div><div class='bl-cl rs'>{{numberCovered}}/{{totalSmts}}</div>"+( hasBranchTracking ? "<div class='bl-cl rs'>{{passedBranches}}/{{totalBranches}}</div>" : "" )+"<div id='file-{{fileNumber}}' class='bl-source' style='display:none;'>{{source}}</div><div style='clear:both;'></div></div>";
        grandTotalTemplate = "<div class='blanket grand-total {{statusclass}}'><div class='bl-cl'>{{rowTitle}}</div><div class='bl-cl rs'>{{percentage}} %</div><div class='bl-cl rs'>{{numberCovered}}/{{totalSmts}}</div>"+( hasBranchTracking ? "<div class='bl-cl rs'>{{passedBranches}}/{{totalBranches}}</div>" : "" ) + "<div style='clear:both;'></div></div>";

    function blanket_toggleSource(id) {
        var element = document.getElementById(id);
        if(element.style.display === 'block') {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    }


    var script = document.createElement("script");
    script.type = "text/javascript";
    script.text = blanket_toggleSource.toString().replace('function ' + blanket_toggleSource.name, 'function blanket_toggleSource');
    body.appendChild(script);

    var percentage = function(number, total) {
        return (Math.round(((number/total) * 100)*100)/100);
    };

    var appendTag = function (type, el, str) {
        var dom = document.createElement(type);
        dom.innerHTML = str;
        el.appendChild(dom);
    };

    function escapeInvalidXmlChars(str) {
        return str.replace(/\&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&apos;")
            .replace(/`/g, "&grave;")
            .replace(/[$]/g, "&dollar;")
            .replace(/&/g, "&amp;");
    }

    function isBranchFollowed(data,bool){
        var mode = bool ? 0 : 1;
        if (typeof data === 'undefined' ||
            typeof data === null ||
            typeof data[mode] === 'undefined'){
            return false;
        }
        return data[mode].length > 0;
    }

    var branchStack = [];

    function branchReport(colsIndex,src,cols,offset,lineNum){
      var newsrc="";
       var postfix="";
      if (branchStack.length > 0){
        newsrc += "<span class='" + (isBranchFollowed(branchStack[0][1],branchStack[0][1].consequent === branchStack[0][0]) ? 'branchOkay' : 'branchWarning') + "'>";
        if (branchStack[0][0].end.line === lineNum){
          newsrc += escapeInvalidXmlChars(src.slice(0,branchStack[0][0].end.column)) + "</span>";
          src = src.slice(branchStack[0][0].end.column);
          branchStack.shift();
          if (branchStack.length > 0){
            newsrc += "<span class='" + (isBranchFollowed(branchStack[0][1],false) ? 'branchOkay' : 'branchWarning') + "'>";
            if (branchStack[0][0].end.line === lineNum){
              newsrc += escapeInvalidXmlChars(src.slice(0,branchStack[0][0].end.column)) + "</span>";
              src = src.slice(branchStack[0][0].end.column);
              branchStack.shift();
              if (!cols){
                return {src: newsrc + escapeInvalidXmlChars(src) ,cols:cols};
              }
            }
            else if (!cols){
              return {src: newsrc + escapeInvalidXmlChars(src) + "</span>",cols:cols};
            }
            else{
              postfix = "</span>";
            }
          }else if (!cols){
            return {src: newsrc + escapeInvalidXmlChars(src) ,cols:cols};
          }
        }else if(!cols){
          return {src: newsrc + escapeInvalidXmlChars(src) + "</span>",cols:cols};
        }else{
          postfix = "</span>";
        }
      }
      var thisline = cols[colsIndex];
      //consequent
      
      var cons = thisline.consequent;
      if (cons.start.line > lineNum){
        branchStack.unshift([thisline.alternate,thisline]);
        branchStack.unshift([cons,thisline]);
        src = escapeInvalidXmlChars(src);
      }else{
        var style = "<span class='" + (isBranchFollowed(thisline,true) ? 'branchOkay' : 'branchWarning') + "'>";
        newsrc += escapeInvalidXmlChars(src.slice(0,cons.start.column-offset)) + style;
        
        if (cols.length > colsIndex+1 &&
          cols[colsIndex+1].consequent.start.line === lineNum &&
          cols[colsIndex+1].consequent.start.column-offset < cols[colsIndex].consequent.end.column-offset)
        {
          var res = branchReport(colsIndex+1,src.slice(cons.start.column-offset,cons.end.column-offset),cols,cons.start.column-offset,lineNum);
          newsrc += res.src;
          cols = res.cols;
          cols[colsIndex+1] = cols[colsIndex+2];
          cols.length--;
        }else{
          newsrc += escapeInvalidXmlChars(src.slice(cons.start.column-offset,cons.end.column-offset));
        }
        newsrc += "</span>";

        var alt = thisline.alternate;
        if (alt.start.line > lineNum){
          newsrc += escapeInvalidXmlChars(src.slice(cons.end.column-offset));
          branchStack.unshift([alt,thisline]);
        }else{
          newsrc += escapeInvalidXmlChars(src.slice(cons.end.column-offset,alt.start.column-offset));
          style = "<span class='" + (isBranchFollowed(thisline,false) ? 'branchOkay' : 'branchWarning') + "'>";
          newsrc +=  style;
          if (cols.length > colsIndex+1 &&
            cols[colsIndex+1].consequent.start.line === lineNum &&
            cols[colsIndex+1].consequent.start.column-offset < cols[colsIndex].alternate.end.column-offset)
          {
            var res2 = branchReport(colsIndex+1,src.slice(alt.start.column-offset,alt.end.column-offset),cols,alt.start.column-offset,lineNum);
            newsrc += res2.src;
            cols = res2.cols;
            cols[colsIndex+1] = cols[colsIndex+2];
            cols.length--;
          }else{
            newsrc += escapeInvalidXmlChars(src.slice(alt.start.column-offset,alt.end.column-offset));
          }
          newsrc += "</span>";
          newsrc += escapeInvalidXmlChars(src.slice(alt.end.column-offset));
          src = newsrc;
        }
      }
      return {src:src+postfix, cols:cols};
    }

    var isUndefined =  function(item){
            return typeof item !== 'undefined';
      };

    var files = coverage.files;
    var totals = {
      totalSmts: 0,
      numberOfFilesCovered: 0,
      passedBranches: 0,
      totalBranches: 0,
      moduleTotalStatements : {},
      moduleTotalCoveredStatements : {},
      moduleTotalBranches : {},
      moduleTotalCoveredBranches : {}
    };

    // check if a data-cover-modulepattern was provided for per-module coverage reporting
    var modulePattern = _blanket.options("modulePattern");
    var modulePatternRegex = ( modulePattern ? new RegExp(modulePattern) : null );

    for(var file in files)
    {
        if (!files.hasOwnProperty(file)) {
            continue;
        }

        fileNumber++;

        var statsForFile = files[file],
            totalSmts = 0,
            numberOfFilesCovered = 0,
            code = [],
            i;
        

        var end = [];
        for(i = 0; i < statsForFile.source.length; i +=1){
            var src = statsForFile.source[i];
            
            if (branchStack.length > 0 ||
                typeof statsForFile.branchData !== 'undefined')
            {
                if (typeof statsForFile.branchData[i+1] !== 'undefined')
                {
                  var cols = statsForFile.branchData[i+1].filter(isUndefined);
                  var colsIndex=0;
                  
                    
                  src = branchReport(colsIndex,src,cols,0,i+1).src;
                  
                }else if (branchStack.length){
                  src = branchReport(0,src,null,0,i+1).src;
                }else{
                  src = escapeInvalidXmlChars(src);
                }
              }else{
                src = escapeInvalidXmlChars(src);
              }
              var lineClass="";
              if(statsForFile[i+1]) {
                numberOfFilesCovered += 1;
                totalSmts += 1;
                lineClass = 'hit';
              }else{
                if(statsForFile[i+1] === 0){
                    totalSmts++;
                    lineClass = 'miss';
                }
              }
              code[i + 1] = "<div class='"+lineClass+"'><span class=''>"+(i + 1)+"</span>"+src+"</div>";
        }
        totals.totalSmts += totalSmts;
        totals.numberOfFilesCovered += numberOfFilesCovered;
        var totalBranches=0;
        var passedBranches=0;
        if (typeof statsForFile.branchData !== 'undefined'){
          for(var j=0;j<statsForFile.branchData.length;j++){
            if (typeof statsForFile.branchData[j] !== 'undefined'){
              for(var k=0;k<statsForFile.branchData[j].length;k++){
                if (typeof statsForFile.branchData[j][k] !== 'undefined'){
                  totalBranches++;
                  if (typeof statsForFile.branchData[j][k][0] !== 'undefined' &&
                    statsForFile.branchData[j][k][0].length > 0 &&
                    typeof statsForFile.branchData[j][k][1] !== 'undefined' &&
                    statsForFile.branchData[j][k][1].length > 0){
                    passedBranches++;
                  }
                }
              }
            }
          }
        }
        totals.passedBranches += passedBranches;
        totals.totalBranches += totalBranches;

        // if "data-cover-modulepattern" was provided, 
        // track totals per module name as well as globally
        if (modulePatternRegex) {
            var moduleName = file.match(modulePatternRegex)[1];

            if(!totals.moduleTotalStatements.hasOwnProperty(moduleName)) {
                totals.moduleTotalStatements[moduleName] = 0;
                totals.moduleTotalCoveredStatements[moduleName] = 0;
            }

            totals.moduleTotalStatements[moduleName] += totalSmts;
            totals.moduleTotalCoveredStatements[moduleName] += numberOfFilesCovered;

            if(!totals.moduleTotalBranches.hasOwnProperty(moduleName)) {
                totals.moduleTotalBranches[moduleName] = 0;
                totals.moduleTotalCoveredBranches[moduleName] = 0;
            }

            totals.moduleTotalBranches[moduleName] += totalBranches;
            totals.moduleTotalCoveredBranches[moduleName] += passedBranches;
        }

        var result = percentage(numberOfFilesCovered, totalSmts);

        var output = fileTemplate.replace("{{file}}", file)
                                 .replace("{{percentage}}",result)
                                 .replace("{{numberCovered}}", numberOfFilesCovered)
                                 .replace(/\{\{fileNumber\}\}/g, fileNumber)
                                 .replace("{{totalSmts}}", totalSmts)
                                 .replace("{{totalBranches}}", totalBranches)
                                 .replace("{{passedBranches}}", passedBranches)
                                 .replace("{{source}}", code.join(" "));
        if(result < successRate)
        {
            output = output.replace("{{statusclass}}", "bl-error");
        } else {
            output = output.replace("{{statusclass}}", "bl-success");
        }
        bodyContent += output;
    }

    // create temporary function for use by the global totals reporter, 
    // as well as the per-module totals reporter
    var createAggregateTotal = function(numSt, numCov, numBranch, numCovBr, moduleName) {

        var totalPercent = percentage(numCov, numSt);
        var statusClass = totalPercent < successRate ? "bl-error" : "bl-success";
        var rowTitle = ( moduleName ? "Total for module: " + moduleName : "Global total" );
        var totalsOutput = grandTotalTemplate.replace("{{rowTitle}}", rowTitle)
            .replace("{{percentage}}", totalPercent)
            .replace("{{numberCovered}}", numCov)
            .replace("{{totalSmts}}", numSt)
            .replace("{{passedBranches}}", numCovBr)
            .replace("{{totalBranches}}", numBranch)
            .replace("{{statusclass}}", statusClass);

        bodyContent += totalsOutput;
    };

    // if "data-cover-modulepattern" was provided, 
    // output the per-module totals alongside the global totals    
    if (modulePatternRegex) {
        for (var thisModuleName in totals.moduleTotalStatements) {
            if (totals.moduleTotalStatements.hasOwnProperty(thisModuleName)) {

                var moduleTotalSt = totals.moduleTotalStatements[thisModuleName];
                var moduleTotalCovSt = totals.moduleTotalCoveredStatements[thisModuleName];

                var moduleTotalBr = totals.moduleTotalBranches[thisModuleName];
                var moduleTotalCovBr = totals.moduleTotalCoveredBranches[thisModuleName];

                createAggregateTotal(moduleTotalSt, moduleTotalCovSt, moduleTotalBr, moduleTotalCovBr, thisModuleName);
            }
        }
    }

    createAggregateTotal(totals.totalSmts, totals.numberOfFilesCovered, totals.totalBranches, totals.passedBranches, null);
    bodyContent += "</div>"; //closing main


    appendTag('style', head, cssSytle);
    //appendStyle(body, headerContent);
    if (document.getElementById("blanket-main")){
        document.getElementById("blanket-main").innerHTML=
            bodyContent.slice(23,-6);
    }else{
        appendTag('div', body, bodyContent);
    }
    //appendHtml(body, '</div>');
};

(function(){
    var newOptions={};
    //http://stackoverflow.com/a/2954896
    var toArray =Array.prototype.slice;
    var scripts = toArray.call(document.scripts);
    toArray.call(scripts[scripts.length - 1].attributes)
                    .forEach(function(es){
                        if(es.nodeName === "data-cover-only"){
                            newOptions.filter = es.nodeValue;
                        }
                        if(es.nodeName === "data-cover-never"){
                            newOptions.antifilter = es.nodeValue;
                        }
                        if(es.nodeName === "data-cover-reporter"){
                            newOptions.reporter = es.nodeValue;
                        }
                        if (es.nodeName === "data-cover-adapter"){
                            newOptions.adapter = es.nodeValue;
                        }
                        if (es.nodeName === "data-cover-loader"){
                            newOptions.loader = es.nodeValue;
                        }
                        if (es.nodeName === "data-cover-timeout"){
                            newOptions.timeout = es.nodeValue;
                        }
                        if (es.nodeName === "data-cover-modulepattern") {
                            newOptions.modulePattern = es.nodeValue;
                        }
                        if (es.nodeName === "data-cover-reporter-options"){
                            try{
                                newOptions.reporter_options = JSON.parse(es.nodeValue);
                            }catch(e){
                                if (blanket.options("debug")){
                                    throw new Error("Invalid reporter options.  Must be a valid stringified JSON object.");
                                }
                            }
                        }
                        if (es.nodeName === "data-cover-testReadyCallback"){
                            newOptions.testReadyCallback = es.nodeValue;
                        }
                        if (es.nodeName === "data-cover-customVariable"){
                            newOptions.customVariable = es.nodeValue;
                        }
                        if (es.nodeName === "data-cover-flags"){
                            var flags = " "+es.nodeValue+" ";
                            if (flags.indexOf(" ignoreError ") > -1){
                                newOptions.ignoreScriptError = true;
                            }
                            if (flags.indexOf(" autoStart ") > -1){
                                newOptions.autoStart = true;
                            }
                            if (flags.indexOf(" ignoreCors ") > -1){
                                newOptions.ignoreCors = true;
                            }
                            if (flags.indexOf(" branchTracking ") > -1){
                                newOptions.branchTracking = true;
                            }
                            if (flags.indexOf(" sourceURL ") > -1){
                                newOptions.sourceURL = true;
                            }
                            if (flags.indexOf(" debug ") > -1){
                                newOptions.debug = true;
                            }
                            if (flags.indexOf(" engineOnly ") > -1){
                                newOptions.engineOnly = true;
                            }
                            if (flags.indexOf(" commonJS ") > -1){
                                newOptions.commonJS = true;
                            }
                             if (flags.indexOf(" instrumentCache ") > -1){
                                newOptions.instrumentCache = true;
                            }
                        }
                    });
    blanket.options(newOptions);

    if (typeof requirejs !== 'undefined'){
        blanket.options("existingRequireJS",true);
    }
    /* setup requirejs loader, if needed */
    
    if (blanket.options("commonJS")){
        blanket._commonjs = {};
    }
})();
(function(_blanket){
_blanket.extend({
    utils: {
        normalizeBackslashes: function(str) {
            return str.replace(/\\/g, '/');
        },
        matchPatternAttribute: function(filename,pattern){
            if (typeof pattern === 'string'){
                if (pattern.indexOf("[") === 0){
                    //treat as array
                    var pattenArr = pattern.slice(1,pattern.length-1).split(",");
                    return pattenArr.some(function(elem){
                        return _blanket.utils.matchPatternAttribute(filename,_blanket.utils.normalizeBackslashes(elem.slice(1,-1)));
                        //return filename.indexOf(_blanket.utils.normalizeBackslashes(elem.slice(1,-1))) > -1;
                    });
                }else if ( pattern.indexOf("//") === 0){
                    var ex = pattern.slice(2,pattern.lastIndexOf('/'));
                    var mods = pattern.slice(pattern.lastIndexOf('/')+1);
                    var regex = new RegExp(ex,mods);
                    return regex.test(filename);
                }else if (pattern.indexOf("#") === 0){
                    return window[pattern.slice(1)].call(window,filename);
                }else{
                    return filename.indexOf(_blanket.utils.normalizeBackslashes(pattern)) > -1;
                }
            }else if ( pattern instanceof Array ){
                return pattern.some(function(elem){
                    return _blanket.utils.matchPatternAttribute(filename,elem);
                });
            }else if (pattern instanceof RegExp){
                return pattern.test(filename);
            }else if (typeof pattern === "function"){
                return pattern.call(window,filename);
            }
        },
        blanketEval: function(data){
            _blanket._addScript(data);
        },
        collectPageScripts: function(){
            var toArray = Array.prototype.slice;
            var scripts = toArray.call(document.scripts);
            var selectedScripts=[],scriptNames=[];
            var filter = _blanket.options("filter");
            if(filter != null){
                //global filter in place, data-cover-only
                var antimatch = _blanket.options("antifilter");
                selectedScripts = toArray.call(document.scripts)
                                .filter(function(s){
                                    return toArray.call(s.attributes).filter(function(sn){
                                        return sn.nodeName === "src" && _blanket.utils.matchPatternAttribute(sn.nodeValue,filter) &&
                                            (typeof antimatch === "undefined" || !_blanket.utils.matchPatternAttribute(sn.nodeValue,antimatch));
                                    }).length === 1;
                                });
            }else{
                selectedScripts = toArray.call(document.querySelectorAll("script[data-cover]"));
            }
            scriptNames = selectedScripts.map(function(s){
                                    return _blanket.utils.qualifyURL(
                                        toArray.call(s.attributes).filter(
                                            function(sn){
                                                return sn.nodeName === "src";
                                            })[0].nodeValue);
                                    });
            if (!filter){
                _blanket.options("filter","['"+scriptNames.join("','")+"']");
            }
            return scriptNames;
        },
        loadAll: function(nextScript,cb,preprocessor){
            /**
             * load dependencies
             * @param {nextScript} factory for priority level
             * @param {cb} the done callback
             */
            var currScript=nextScript();
            var isLoaded = _blanket.utils.scriptIsLoaded(
                                currScript,
                                _blanket.utils.ifOrdered,
                                nextScript,
                                cb
                            );
            
            if (!(_blanket.utils.cache[currScript] && _blanket.utils.cache[currScript].loaded)){
                var attach = function(){
                    if (_blanket.options("debug")) {console.log("BLANKET-Mark script:"+currScript+", as loaded and move to next script.");}
                    isLoaded();
                };
                var whenDone = function(result){
                    if (_blanket.options("debug")) {console.log("BLANKET-File loading finished");}
                    if (typeof result !== 'undefined'){
                        if (_blanket.options("debug")) {console.log("BLANKET-Add file to DOM.");}
                        _blanket._addScript(result);
                    }
                    attach();
                };

                _blanket.utils.attachScript(
                    {
                        url: currScript
                    },
                    function (content){
                        _blanket.utils.processFile(
                            content,
                            currScript,
                            whenDone,
                            whenDone
                        );
                    }
                );
            }else{
                isLoaded();
            }
        },
        attachScript: function(options,cb){
           var timeout = _blanket.options("timeout") || 3000;
           setTimeout(function(){
                if (!_blanket.utils.cache[options.url].loaded){
                    throw new Error("error (timeout=" + timeout + ") loading source script: " + options.url);
                }
           },timeout);
           _blanket.utils.getFile(
                options.url,
                cb,
                function(){ throw new Error("error loading source script: " + options.url);}
            );
        },
        ifOrdered: function(nextScript,cb){
            /**
             * ordered loading callback
             * @param {nextScript} factory for priority level
             * @param {cb} the done callback
             */
            var currScript = nextScript(true);
            if (currScript){
              _blanket.utils.loadAll(nextScript,cb);
            }else{
              cb(new Error("Error in loading chain."));
            }
        },
        scriptIsLoaded: function(url,orderedCb,nextScript,cb){
            /**
           * returns a callback that checks a loading list to see if a script is loaded.
           * @param {orderedCb} callback if ordered loading is being done
           * @param {nextScript} factory for next priority level
           * @param {cb} the done callback
           */
           if (_blanket.options("debug")) {console.log("BLANKET-Returning function");}
            return function(){
                if (_blanket.options("debug")) {console.log("BLANKET-Marking file as loaded: "+url);}
           
                _blanket.utils.cache[url].loaded=true;
            
                if (_blanket.utils.allLoaded()){
                    if (_blanket.options("debug")) {console.log("BLANKET-All files loaded");}
                    cb();
                }else if (orderedCb){
                    //if it's ordered we need to
                    //traverse down to the next
                    //priority level
                    if (_blanket.options("debug")) {console.log("BLANKET-Load next file.");}
                    orderedCb(nextScript,cb);
                }
            };
        },
        cache: {},
        allLoaded: function (){
            /**
             * check if depdencies are loaded in cache
             */
            var cached = Object.keys(_blanket.utils.cache);
            for (var i=0;i<cached.length;i++){
                if (!_blanket.utils.cache[cached[i]].loaded){
                    return false;
                }
            }
            return true;
        },
        processFile: function (content,url,cb,oldCb) {
            var match = _blanket.options("filter");
            //we check the never matches first
            var antimatch = _blanket.options("antifilter");
            if (typeof antimatch !== "undefined" &&
                    _blanket.utils.matchPatternAttribute(url,antimatch)
                ){
                oldCb(content);
                if (_blanket.options("debug")) {console.log("BLANKET-File will never be instrumented:"+url);}
                _blanket.requiringFile(url,true);
            }else if (_blanket.utils.matchPatternAttribute(url,match)){
                if (_blanket.options("debug")) {console.log("BLANKET-Attempting instrument of:"+url);}
                _blanket.instrument({
                    inputFile: content,
                    inputFileName: url
                },function(instrumented){
                    try{
                        if (_blanket.options("debug")) {console.log("BLANKET-instrument of:"+url+" was successfull.");}
                        _blanket.utils.blanketEval(instrumented);
                        cb();
                        _blanket.requiringFile(url,true);
                    }
                    catch(err){
                        if (_blanket.options("ignoreScriptError")){
                            //we can continue like normal if
                            //we're ignoring script errors,
                            //but otherwise we don't want
                            //to completeLoad or the error might be
                            //missed.
                            if (_blanket.options("debug")) { console.log("BLANKET-There was an error loading the file:"+url); }
                            cb(content);
                            _blanket.requiringFile(url,true);
                        }else{
                            var e = new Error("Error parsing instrumented code: "+err);
                            e.error = err;
                            throw e;
                        }
                    }
                });
            }else{
                if (_blanket.options("debug")) { console.log("BLANKET-Loading (without instrumenting) the file:"+url);}
                oldCb(content);
                _blanket.requiringFile(url,true);
            }

        },
        cacheXhrConstructor: function(){
            var Constructor, createXhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                Constructor = XMLHttpRequest;
                this.createXhr = function() { return new Constructor(); };
            } else if (typeof ActiveXObject !== "undefined") {
                Constructor = ActiveXObject;
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        new ActiveXObject(progId);
                        break;
                    } catch (e) {}
                }
                this.createXhr = function() { return new Constructor(progId); };
            }
        },
        craeteXhr: function () {
            throw new Error("cacheXhrConstructor is supposed to overwrite this function.");
        },
        getFile: function(url, callback, errback, onXhr){
            var foundInSession = false;
            if (_blanket.blanketSession){
                var files = Object.keys(_blanket.blanketSession);
                for (var i=0; i<files.length;i++ ){
                    var key = files[i];
                    if (url.indexOf(key) > -1){
                        callback(_blanket.blanketSession[key]);
                        foundInSession=true;
                        return;
                    }
                }
            }
            if (!foundInSession){
                var xhr = _blanket.utils.createXhr();
                xhr.open('GET', url, true);

                //Allow overrides specified in config
                if (onXhr) {
                    onXhr(xhr, url);
                }

                xhr.onreadystatechange = function (evt) {
                    var status, err;
                    
                    //Do not explicitly handle errors, those should be
                    //visible via console output in the browser.
                    if (xhr.readyState === 4) {
                        status = xhr.status;
                        if ((status > 399 && status < 600) /*||
                            (status === 0 &&
                                navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
                           */ ) {
                            //An http 4xx or 5xx error. Signal an error.
                            err = new Error(url + ' HTTP status: ' + status);
                            err.xhr = xhr;
                            errback(err);
                        } else {
                            callback(xhr.responseText);
                        }
                    }
                };
                try{
                    xhr.send(null);
                }catch(e){
                    if (e.code && (e.code === 101 || e.code === 1012) && _blanket.options("ignoreCors") === false){
                        //running locally and getting error from browser
                        _blanket.showManualLoader();
                    } else {
                        throw e;
                    }
                }
            }
        }
    }
});

(function(){
    var require = blanket.options("commonJS") ? blanket._commonjs.require : window.require;
    var requirejs = blanket.options("commonJS") ? blanket._commonjs.requirejs : window.requirejs;
    if (!_blanket.options("engineOnly") && _blanket.options("existingRequireJS")){

        _blanket.utils.oldloader = requirejs.load;

        requirejs.load = function (context, moduleName, url) {
            _blanket.requiringFile(url);
            _blanket.utils.getFile(url,
                function(content){
                    _blanket.utils.processFile(
                        content,
                        url,
                        function newLoader(){
                            context.completeLoad(moduleName);
                        },
                        function oldLoader(){
                            _blanket.utils.oldloader(context, moduleName, url);
                        }
                    );
                }, function (err) {
                _blanket.requiringFile();
                throw err;
            });
        };
    }
    // Save the XHR constructor, just in case frameworks like Sinon would sandbox it.
    _blanket.utils.cacheXhrConstructor();
})();

})(blanket);

(function(){
if (typeof QUnit !== 'undefined'){
    //check to make sure requirejs is completed before we start the test runner
    var allLoaded = function() {
        return window.QUnit.config.queue.length > 0 && blanket.noConflict().requireFilesLoaded();
    };

    if (!QUnit.config.urlConfig[0].tooltip){
        //older versions we run coverage automatically
        //and we change how events are binded
        QUnit.begin=function(){
            blanket.noConflict().setupCoverage();
        };
        
        QUnit.done=function(failures, total) {
            blanket.noConflict().onTestsDone();
        };
        QUnit.moduleStart=function( details ) {
            blanket.noConflict().onModuleStart();
        };
        QUnit.testStart=function( details ) {
            blanket.noConflict().onTestStart();
        };
        QUnit.testDone=function( details ) {
            blanket.noConflict().onTestDone(details.total,details.passed);
        };
        blanket.beforeStartTestRunner({
            condition: allLoaded,
            callback: QUnit.start
        });
    }else{
        QUnit.config.urlConfig.push({
            id: "coverage",
            label: "Enable coverage",
            tooltip: "Enable code coverage."
        });
    
        if ( QUnit.urlParams.coverage || blanket.options("autoStart") ) {
            QUnit.begin(function(){
                blanket.noConflict().setupCoverage();
            });
            
            QUnit.done(function(failures, total) {
                blanket.noConflict().onTestsDone();
            });
            QUnit.moduleStart(function( details ) {
                blanket.noConflict().onModuleStart();
            });
            QUnit.testStart(function( details ) {
                blanket.noConflict().onTestStart();
            });
            QUnit.testDone(function( details ) {
                blanket.noConflict().onTestDone(details.total,details.passed);
            });
            blanket.noConflict().beforeStartTestRunner({
                condition: allLoaded,
                callback: function(){
                    if (!(blanket.options("existingRequireJS") && !blanket.options("autoStart"))){
                        QUnit.start();
                    }
                }
            });
        }else{
            if (blanket.options("existingRequireJS")){ requirejs.load = _blanket.utils.oldloader; }
            blanket.noConflict().beforeStartTestRunner({
                condition: allLoaded,
                callback: function(){
                    if (!(blanket.options("existingRequireJS") && !blanket.options("autoStart"))){
                        QUnit.start();
                    }
                },
                coverage:false
            });
        }
    }
}
})();
// leaving this file so older ember-cli-qunit versions do not blow up

;(function(){

// CommonJS require()

function require(p){
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

require.modules = {};

require.resolve = function (path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

require.register = function (path, fn){
    require.modules[path] = fn;
  };

require.relative = function (parent) {
    return function(p){
      if ('.' != p.charAt(0)) return require(p);

      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();

      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };


require.register("browser/debug.js", function(module, exports, require){
module.exports = function(type){
  return function(){
  }
};

}); // module: browser/debug.js

require.register("browser/diff.js", function(module, exports, require){
/* See LICENSE file for terms of use */

/*
 * Text diff implementation.
 *
 * This library supports the following APIS:
 * JsDiff.diffChars: Character by character diff
 * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
 * JsDiff.diffLines: Line based diff
 *
 * JsDiff.diffCss: Diff targeted at CSS content
 *
 * These methods are based on the implementation proposed in
 * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
 */
var JsDiff = (function() {
  /*jshint maxparams: 5*/
  function clonePath(path) {
    return { newPos: path.newPos, components: path.components.slice(0) };
  }
  function removeEmpty(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  function escapeHTML(s) {
    var n = s;
    n = n.replace(/&/g, '&amp;');
    n = n.replace(/</g, '&lt;');
    n = n.replace(/>/g, '&gt;');
    n = n.replace(/"/g, '&quot;');

    return n;
  }

  var Diff = function(ignoreWhitespace) {
    this.ignoreWhitespace = ignoreWhitespace;
  };
  Diff.prototype = {
      diff: function(oldString, newString) {
        // Handle the identity case (this is due to unrolling editLength == 0
        if (newString === oldString) {
          return [{ value: newString }];
        }
        if (!newString) {
          return [{ value: oldString, removed: true }];
        }
        if (!oldString) {
          return [{ value: newString, added: true }];
        }

        newString = this.tokenize(newString);
        oldString = this.tokenize(oldString);

        var newLen = newString.length, oldLen = oldString.length;
        var maxEditLength = newLen + oldLen;
        var bestPath = [{ newPos: -1, components: [] }];

        // Seed editLength = 0
        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
        if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {
          return bestPath[0].components;
        }

        for (var editLength = 1; editLength <= maxEditLength; editLength++) {
          for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {
            var basePath;
            var addPath = bestPath[diagonalPath-1],
                removePath = bestPath[diagonalPath+1];
            oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
            if (addPath) {
              // No one else is going to attempt to use this value, clear it
              bestPath[diagonalPath-1] = undefined;
            }

            var canAdd = addPath && addPath.newPos+1 < newLen;
            var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
            if (!canAdd && !canRemove) {
              bestPath[diagonalPath] = undefined;
              continue;
            }

            // Select the diagonal that we want to branch from. We select the prior
            // path whose position in the new string is the farthest from the origin
            // and does not pass the bounds of the diff graph
            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
              basePath = clonePath(removePath);
              this.pushComponent(basePath.components, oldString[oldPos], undefined, true);
            } else {
              basePath = clonePath(addPath);
              basePath.newPos++;
              this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined);
            }

            var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);

            if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {
              return basePath.components;
            } else {
              bestPath[diagonalPath] = basePath;
            }
          }
        }
      },

      pushComponent: function(components, value, added, removed) {
        var last = components[components.length-1];
        if (last && last.added === added && last.removed === removed) {
          // We need to clone here as the component clone operation is just
          // as shallow array clone
          components[components.length-1] =
            {value: this.join(last.value, value), added: added, removed: removed };
        } else {
          components.push({value: value, added: added, removed: removed });
        }
      },
      extractCommon: function(basePath, newString, oldString, diagonalPath) {
        var newLen = newString.length,
            oldLen = oldString.length,
            newPos = basePath.newPos,
            oldPos = newPos - diagonalPath;
        while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {
          newPos++;
          oldPos++;

          this.pushComponent(basePath.components, newString[newPos], undefined, undefined);
        }
        basePath.newPos = newPos;
        return oldPos;
      },

      equals: function(left, right) {
        var reWhitespace = /\S/;
        if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {
          return true;
        } else {
          return left === right;
        }
      },
      join: function(left, right) {
        return left + right;
      },
      tokenize: function(value) {
        return value;
      }
  };

  var CharDiff = new Diff();

  var WordDiff = new Diff(true);
  var WordWithSpaceDiff = new Diff();
  WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {
    return removeEmpty(value.split(/(\s+|\b)/));
  };

  var CssDiff = new Diff(true);
  CssDiff.tokenize = function(value) {
    return removeEmpty(value.split(/([{}:;,]|\s+)/));
  };

  var LineDiff = new Diff();
  LineDiff.tokenize = function(value) {
    var retLines = [],
        lines = value.split(/^/m);

    for(var i = 0; i < lines.length; i++) {
      var line = lines[i],
          lastLine = lines[i - 1];

      // Merge lines that may contain windows new lines
      if (line == '\n' && lastLine && lastLine[lastLine.length - 1] === '\r') {
        retLines[retLines.length - 1] += '\n';
      } else if (line) {
        retLines.push(line);
      }
    }

    return retLines;
  };

  return {
    Diff: Diff,

    diffChars: function(oldStr, newStr) { return CharDiff.diff(oldStr, newStr); },
    diffWords: function(oldStr, newStr) { return WordDiff.diff(oldStr, newStr); },
    diffWordsWithSpace: function(oldStr, newStr) { return WordWithSpaceDiff.diff(oldStr, newStr); },
    diffLines: function(oldStr, newStr) { return LineDiff.diff(oldStr, newStr); },

    diffCss: function(oldStr, newStr) { return CssDiff.diff(oldStr, newStr); },

    createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {
      var ret = [];

      ret.push('Index: ' + fileName);
      ret.push('===================================================================');
      ret.push('--- ' + fileName + (typeof oldHeader === 'undefined' ? '' : '\t' + oldHeader));
      ret.push('+++ ' + fileName + (typeof newHeader === 'undefined' ? '' : '\t' + newHeader));

      var diff = LineDiff.diff(oldStr, newStr);
      if (!diff[diff.length-1].value) {
        diff.pop();   // Remove trailing newline add
      }
      diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier

      function contextLines(lines) {
        return lines.map(function(entry) { return ' ' + entry; });
      }
      function eofNL(curRange, i, current) {
        var last = diff[diff.length-2],
            isLast = i === diff.length-2,
            isLastOfType = i === diff.length-3 && (current.added !== last.added || current.removed !== last.removed);

        // Figure out if this is the last line for the given file and missing NL
        if (!/\n$/.test(current.value) && (isLast || isLastOfType)) {
          curRange.push('\\ No newline at end of file');
        }
      }

      var oldRangeStart = 0, newRangeStart = 0, curRange = [],
          oldLine = 1, newLine = 1;
      for (var i = 0; i < diff.length; i++) {
        var current = diff[i],
            lines = current.lines || current.value.replace(/\n$/, '').split('\n');
        current.lines = lines;

        if (current.added || current.removed) {
          if (!oldRangeStart) {
            var prev = diff[i-1];
            oldRangeStart = oldLine;
            newRangeStart = newLine;

            if (prev) {
              curRange = contextLines(prev.lines.slice(-4));
              oldRangeStart -= curRange.length;
              newRangeStart -= curRange.length;
            }
          }
          curRange.push.apply(curRange, lines.map(function(entry) { return (current.added?'+':'-') + entry; }));
          eofNL(curRange, i, current);

          if (current.added) {
            newLine += lines.length;
          } else {
            oldLine += lines.length;
          }
        } else {
          if (oldRangeStart) {
            // Close out any changes that have been output (or join overlapping)
            if (lines.length <= 8 && i < diff.length-2) {
              // Overlapping
              curRange.push.apply(curRange, contextLines(lines));
            } else {
              // end the range and output
              var contextSize = Math.min(lines.length, 4);
              ret.push(
                  '@@ -' + oldRangeStart + ',' + (oldLine-oldRangeStart+contextSize)
                  + ' +' + newRangeStart + ',' + (newLine-newRangeStart+contextSize)
                  + ' @@');
              ret.push.apply(ret, curRange);
              ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));
              if (lines.length <= 4) {
                eofNL(ret, i, current);
              }

              oldRangeStart = 0;  newRangeStart = 0; curRange = [];
            }
          }
          oldLine += lines.length;
          newLine += lines.length;
        }
      }

      return ret.join('\n') + '\n';
    },

    applyPatch: function(oldStr, uniDiff) {
      var diffstr = uniDiff.split('\n');
      var diff = [];
      var remEOFNL = false,
          addEOFNL = false;

      for (var i = (diffstr[0][0]==='I'?4:0); i < diffstr.length; i++) {
        if(diffstr[i][0] === '@') {
          var meh = diffstr[i].split(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
          diff.unshift({
            start:meh[3],
            oldlength:meh[2],
            oldlines:[],
            newlength:meh[4],
            newlines:[]
          });
        } else if(diffstr[i][0] === '+') {
          diff[0].newlines.push(diffstr[i].substr(1));
        } else if(diffstr[i][0] === '-') {
          diff[0].oldlines.push(diffstr[i].substr(1));
        } else if(diffstr[i][0] === ' ') {
          diff[0].newlines.push(diffstr[i].substr(1));
          diff[0].oldlines.push(diffstr[i].substr(1));
        } else if(diffstr[i][0] === '\\') {
          if (diffstr[i-1][0] === '+') {
            remEOFNL = true;
          } else if(diffstr[i-1][0] === '-') {
            addEOFNL = true;
          }
        }
      }

      var str = oldStr.split('\n');
      for (var i = diff.length - 1; i >= 0; i--) {
        var d = diff[i];
        for (var j = 0; j < d.oldlength; j++) {
          if(str[d.start-1+j] !== d.oldlines[j]) {
            return false;
          }
        }
        Array.prototype.splice.apply(str,[d.start-1,+d.oldlength].concat(d.newlines));
      }

      if (remEOFNL) {
        while (!str[str.length-1]) {
          str.pop();
        }
      } else if (addEOFNL) {
        str.push('');
      }
      return str.join('\n');
    },

    convertChangesToXML: function(changes){
      var ret = [];
      for ( var i = 0; i < changes.length; i++) {
        var change = changes[i];
        if (change.added) {
          ret.push('<ins>');
        } else if (change.removed) {
          ret.push('<del>');
        }

        ret.push(escapeHTML(change.value));

        if (change.added) {
          ret.push('</ins>');
        } else if (change.removed) {
          ret.push('</del>');
        }
      }
      return ret.join('');
    },

    // See: http://code.google.com/p/google-diff-match-patch/wiki/API
    convertChangesToDMP: function(changes){
      var ret = [], change;
      for ( var i = 0; i < changes.length; i++) {
        change = changes[i];
        ret.push([(change.added ? 1 : change.removed ? -1 : 0), change.value]);
      }
      return ret;
    }
  };
})();

if (typeof module !== 'undefined') {
    module.exports = JsDiff;
}

}); // module: browser/diff.js

require.register("browser/escape-string-regexp.js", function(module, exports, require){
'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe,  '\\$&');
};

}); // module: browser/escape-string-regexp.js

require.register("browser/events.js", function(module, exports, require){
/**
 * Module exports.
 */

exports.EventEmitter = EventEmitter;

/**
 * Check if `obj` is an array.
 */

function isArray(obj) {
  return '[object Array]' == {}.toString.call(obj);
}

/**
 * Event emitter constructor.
 *
 * @api public
 */

function EventEmitter(){};

/**
 * Adds a listener.
 *
 * @api public
 */

EventEmitter.prototype.on = function (name, fn) {
  if (!this.$events) {
    this.$events = {};
  }

  if (!this.$events[name]) {
    this.$events[name] = fn;
  } else if (isArray(this.$events[name])) {
    this.$events[name].push(fn);
  } else {
    this.$events[name] = [this.$events[name], fn];
  }

  return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

/**
 * Adds a volatile listener.
 *
 * @api public
 */

EventEmitter.prototype.once = function (name, fn) {
  var self = this;

  function on () {
    self.removeListener(name, on);
    fn.apply(this, arguments);
  };

  on.listener = fn;
  this.on(name, on);

  return this;
};

/**
 * Removes a listener.
 *
 * @api public
 */

EventEmitter.prototype.removeListener = function (name, fn) {
  if (this.$events && this.$events[name]) {
    var list = this.$events[name];

    if (isArray(list)) {
      var pos = -1;

      for (var i = 0, l = list.length; i < l; i++) {
        if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
          pos = i;
          break;
        }
      }

      if (pos < 0) {
        return this;
      }

      list.splice(pos, 1);

      if (!list.length) {
        delete this.$events[name];
      }
    } else if (list === fn || (list.listener && list.listener === fn)) {
      delete this.$events[name];
    }
  }

  return this;
};

/**
 * Removes all listeners for an event.
 *
 * @api public
 */

EventEmitter.prototype.removeAllListeners = function (name) {
  if (name === undefined) {
    this.$events = {};
    return this;
  }

  if (this.$events && this.$events[name]) {
    this.$events[name] = null;
  }

  return this;
};

/**
 * Gets all listeners for a certain event.
 *
 * @api public
 */

EventEmitter.prototype.listeners = function (name) {
  if (!this.$events) {
    this.$events = {};
  }

  if (!this.$events[name]) {
    this.$events[name] = [];
  }

  if (!isArray(this.$events[name])) {
    this.$events[name] = [this.$events[name]];
  }

  return this.$events[name];
};

/**
 * Emits an event.
 *
 * @api public
 */

EventEmitter.prototype.emit = function (name) {
  if (!this.$events) {
    return false;
  }

  var handler = this.$events[name];

  if (!handler) {
    return false;
  }

  var args = [].slice.call(arguments, 1);

  if ('function' == typeof handler) {
    handler.apply(this, args);
  } else if (isArray(handler)) {
    var listeners = handler.slice();

    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
  } else {
    return false;
  }

  return true;
};

}); // module: browser/events.js

require.register("browser/fs.js", function(module, exports, require){

}); // module: browser/fs.js

require.register("browser/glob.js", function(module, exports, require){

}); // module: browser/glob.js

require.register("browser/path.js", function(module, exports, require){

}); // module: browser/path.js

require.register("browser/progress.js", function(module, exports, require){
/**
 * Expose `Progress`.
 */

module.exports = Progress;

/**
 * Initialize a new `Progress` indicator.
 */

function Progress() {
  this.percent = 0;
  this.size(0);
  this.fontSize(11);
  this.font('helvetica, arial, sans-serif');
}

/**
 * Set progress size to `n`.
 *
 * @param {Number} n
 * @return {Progress} for chaining
 * @api public
 */

Progress.prototype.size = function(n){
  this._size = n;
  return this;
};

/**
 * Set text to `str`.
 *
 * @param {String} str
 * @return {Progress} for chaining
 * @api public
 */

Progress.prototype.text = function(str){
  this._text = str;
  return this;
};

/**
 * Set font size to `n`.
 *
 * @param {Number} n
 * @return {Progress} for chaining
 * @api public
 */

Progress.prototype.fontSize = function(n){
  this._fontSize = n;
  return this;
};

/**
 * Set font `family`.
 *
 * @param {String} family
 * @return {Progress} for chaining
 */

Progress.prototype.font = function(family){
  this._font = family;
  return this;
};

/**
 * Update percentage to `n`.
 *
 * @param {Number} n
 * @return {Progress} for chaining
 */

Progress.prototype.update = function(n){
  this.percent = n;
  return this;
};

/**
 * Draw on `ctx`.
 *
 * @param {CanvasRenderingContext2d} ctx
 * @return {Progress} for chaining
 */

Progress.prototype.draw = function(ctx){
  try {
    var percent = Math.min(this.percent, 100)
      , size = this._size
      , half = size / 2
      , x = half
      , y = half
      , rad = half - 1
      , fontSize = this._fontSize;

    ctx.font = fontSize + 'px ' + this._font;

    var angle = Math.PI * 2 * (percent / 100);
    ctx.clearRect(0, 0, size, size);

    // outer circle
    ctx.strokeStyle = '#9f9f9f';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, angle, false);
    ctx.stroke();

    // inner circle
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.arc(x, y, rad - 1, 0, angle, true);
    ctx.stroke();

    // text
    var text = this._text || (percent | 0) + '%'
      , w = ctx.measureText(text).width;

    ctx.fillText(
        text
      , x - w / 2 + 1
      , y + fontSize / 2 - 1);
  } catch (ex) {} //don't fail if we can't render progress
  return this;
};

}); // module: browser/progress.js

require.register("browser/tty.js", function(module, exports, require){
exports.isatty = function(){
  return true;
};

exports.getWindowSize = function(){
  if ('innerHeight' in global) {
    return [global.innerHeight, global.innerWidth];
  } else {
    // In a Web Worker, the DOM Window is not available.
    return [640, 480];
  }
};

}); // module: browser/tty.js

require.register("context.js", function(module, exports, require){
/**
 * Expose `Context`.
 */

module.exports = Context;

/**
 * Initialize a new `Context`.
 *
 * @api private
 */

function Context(){}

/**
 * Set or get the context `Runnable` to `runnable`.
 *
 * @param {Runnable} runnable
 * @return {Context}
 * @api private
 */

Context.prototype.runnable = function(runnable){
  if (0 == arguments.length) return this._runnable;
  this.test = this._runnable = runnable;
  return this;
};

/**
 * Set test timeout `ms`.
 *
 * @param {Number} ms
 * @return {Context} self
 * @api private
 */

Context.prototype.timeout = function(ms){
  if (arguments.length === 0) return this.runnable().timeout();
  this.runnable().timeout(ms);
  return this;
};

/**
 * Set test timeout `enabled`.
 *
 * @param {Boolean} enabled
 * @return {Context} self
 * @api private
 */

Context.prototype.enableTimeouts = function (enabled) {
  this.runnable().enableTimeouts(enabled);
  return this;
};


/**
 * Set test slowness threshold `ms`.
 *
 * @param {Number} ms
 * @return {Context} self
 * @api private
 */

Context.prototype.slow = function(ms){
  this.runnable().slow(ms);
  return this;
};

/**
 * Mark a test as skipped.
 *
 * @return {Context} self
 * @api private
 */

Context.prototype.skip = function(){
    this.runnable().skip();
    return this;
};

/**
 * Inspect the context void of `._runnable`.
 *
 * @return {String}
 * @api private
 */

Context.prototype.inspect = function(){
  return JSON.stringify(this, function(key, val){
    if ('_runnable' == key) return;
    if ('test' == key) return;
    return val;
  }, 2);
};

}); // module: context.js

require.register("hook.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Runnable = require('./runnable');

/**
 * Expose `Hook`.
 */

module.exports = Hook;

/**
 * Initialize a new `Hook` with the given `title` and callback `fn`.
 *
 * @param {String} title
 * @param {Function} fn
 * @api private
 */

function Hook(title, fn) {
  Runnable.call(this, title, fn);
  this.type = 'hook';
}

/**
 * Inherit from `Runnable.prototype`.
 */

function F(){};
F.prototype = Runnable.prototype;
Hook.prototype = new F;
Hook.prototype.constructor = Hook;


/**
 * Get or set the test `err`.
 *
 * @param {Error} err
 * @return {Error}
 * @api public
 */

Hook.prototype.error = function(err){
  if (0 == arguments.length) {
    var err = this._error;
    this._error = null;
    return err;
  }

  this._error = err;
};

}); // module: hook.js

require.register("interfaces/bdd.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test')
  , utils = require('../utils')
  , escapeRe = require('browser/escape-string-regexp');

/**
 * BDD-style interface:
 *
 *      describe('Array', function(){
 *        describe('#indexOf()', function(){
 *          it('should return -1 when not present', function(){
 *
 *          });
 *
 *          it('should return the index when present', function(){
 *
 *          });
 *        });
 *      });
 *
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha){

    var common = require('./common')(suites, context);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);
    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    /**
     * Pending describe.
     */

    context.xdescribe =
    context.xcontext =
    context.describe.skip = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn){
      var suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
      return suite;
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = function(title, fn){
      var suite = suites[0];
      if (suite.pending) fn = null;
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn){
      var test = context.it(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit =
    context.xspecify =
    context.it.skip = function(title){
      context.it(title);
    };

  });
};

}); // module: interfaces/bdd.js

require.register("interfaces/common.js", function(module, exports, require){
/**
 * Functions common to more than one interface
 * @module lib/interfaces/common
 */

'use strict';

module.exports = function (suites, context) {

  return {
    /**
     * This is only present if flag --delay is passed into Mocha.  It triggers
     * root suite execution.  Returns a function which runs the root suite.
     */
    runWithSuite: function runWithSuite(suite) {
      return function run() {
        suite.run();
      };
    },

    /**
     * Execute before running tests.
     */
    before: function (name, fn) {
      suites[0].beforeAll(name, fn);
    },

    /**
     * Execute after running tests.
     */
    after: function (name, fn) {
      suites[0].afterAll(name, fn);
    },

    /**
     * Execute before each test case.
     */
    beforeEach: function (name, fn) {
      suites[0].beforeEach(name, fn);
    },

    /**
     * Execute after each test case.
     */
    afterEach: function (name, fn) {
      suites[0].afterEach(name, fn);
    },

    test: {
      /**
       * Pending test case.
       */
      skip: function (title) {
        context.test(title);
      }
    }
  }
};

}); // module: interfaces/common.js

require.register("interfaces/exports.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test');

/**
 * TDD-style interface:
 *
 *     exports.Array = {
 *       '#indexOf()': {
 *         'should return -1 when the value is not present': function(){
 *
 *         },
 *
 *         'should return the correct index when the value is present': function(){
 *
 *         }
 *       }
 *     };
 *
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('require', visit);

  function visit(obj, file) {
    var suite;
    for (var key in obj) {
      if ('function' == typeof obj[key]) {
        var fn = obj[key];
        switch (key) {
          case 'before':
            suites[0].beforeAll(fn);
            break;
          case 'after':
            suites[0].afterAll(fn);
            break;
          case 'beforeEach':
            suites[0].beforeEach(fn);
            break;
          case 'afterEach':
            suites[0].afterEach(fn);
            break;
          default:
            var test = new Test(key, fn);
            test.file = file;
            suites[0].addTest(test);
        }
      } else {
        suite = Suite.create(suites[0], key);
        suites.unshift(suite);
        visit(obj[key]);
        suites.shift();
      }
    }
  }
};

}); // module: interfaces/exports.js

require.register("interfaces/index.js", function(module, exports, require){
exports.bdd = require('./bdd');
exports.tdd = require('./tdd');
exports.qunit = require('./qunit');
exports.exports = require('./exports');

}); // module: interfaces/index.js

require.register("interfaces/qunit.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test')
  , escapeRe = require('browser/escape-string-regexp')
  , utils = require('../utils');

/**
 * QUnit-style interface:
 *
 *     suite('Array');
 *
 *     test('#length', function(){
 *       var arr = [1,2,3];
 *       ok(arr.length == 3);
 *     });
 *
 *     test('#indexOf()', function(){
 *       var arr = [1,2,3];
 *       ok(arr.indexOf(1) == 0);
 *       ok(arr.indexOf(2) == 1);
 *       ok(arr.indexOf(3) == 2);
 *     });
 *
 *     suite('String');
 *
 *     test('#length', function(){
 *       ok('foo'.length == 3);
 *     });
 *
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha){

    var common = require('./common')(suites, context);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);
    /**
     * Describe a "suite" with the given `title`.
     */

    context.suite = function(title){
      if (suites.length > 1) suites.shift();
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      return suite;
    };

    /**
     * Exclusive test-case.
     */

    context.suite.only = function(title, fn){
      var suite = context.suite(title, fn);
      mocha.grep(suite.fullTitle());
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.test = function(title, fn){
      var test = new Test(title, fn);
      test.file = file;
      suites[0].addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.test.only = function(title, fn){
      var test = context.test(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
    };

    context.test.skip = common.test.skip;

  });
};

}); // module: interfaces/qunit.js

require.register("interfaces/tdd.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test')
  , escapeRe = require('browser/escape-string-regexp')
  , utils = require('../utils');

/**
 * TDD-style interface:
 *
 *      suite('Array', function(){
 *        suite('#indexOf()', function(){
 *          suiteSetup(function(){
 *
 *          });
 *
 *          test('should return -1 when not present', function(){
 *
 *          });
 *
 *          test('should return the index when present', function(){
 *
 *          });
 *
 *          suiteTeardown(function(){
 *
 *          });
 *        });
 *      });
 *
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha){

    var common = require('./common')(suites, context);

    context.setup = common.beforeEach;
    context.teardown = common.afterEach;
    context.suiteSetup = common.before;
    context.suiteTeardown = common.after;
    context.run = mocha.options.delay && common.runWithSuite(suite);
    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.suite = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    /**
     * Pending suite.
     */
    context.suite.skip = function(title, fn) {
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive test-case.
     */

    context.suite.only = function(title, fn){
      var suite = context.suite(title, fn);
      mocha.grep(suite.fullTitle());
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.test = function(title, fn){
      var suite = suites[0];
      if (suite.pending) fn = null;
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.test.only = function(title, fn){
      var test = context.test(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
    };

    context.test.skip = common.test.skip;
  });
};

}); // module: interfaces/tdd.js

require.register("mocha.js", function(module, exports, require){
/*!
 * mocha
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var path = require('browser/path')
  , escapeRe = require('browser/escape-string-regexp')
  , utils = require('./utils');

/**
 * Expose `Mocha`.
 */

exports = module.exports = Mocha;

/**
 * To require local UIs and reporters when running in node.
 */

if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
  var join = path.join
    , cwd = process.cwd();
  module.paths.push(cwd, join(cwd, 'node_modules'));
}

/**
 * Expose internals.
 */

exports.utils = utils;
exports.interfaces = require('./interfaces');
exports.reporters = require('./reporters');
exports.Runnable = require('./runnable');
exports.Context = require('./context');
exports.Runner = require('./runner');
exports.Suite = require('./suite');
exports.Hook = require('./hook');
exports.Test = require('./test');

/**
 * Return image `name` path.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function image(name) {
  return __dirname + '/../images/' + name + '.png';
}

/**
 * Setup mocha with `options`.
 *
 * Options:
 *
 *   - `ui` name "bdd", "tdd", "exports" etc
 *   - `reporter` reporter instance, defaults to `mocha.reporters.spec`
 *   - `globals` array of accepted globals
 *   - `timeout` timeout in milliseconds
 *   - `bail` bail on the first test failure
 *   - `slow` milliseconds to wait before considering a test slow
 *   - `ignoreLeaks` ignore global leaks
 *   - `fullTrace` display the full stack-trace on failing
 *   - `grep` string or regexp to filter tests with
 *
 * @param {Object} options
 * @api public
 */

function Mocha(options) {
  options = options || {};
  this.files = [];
  this.options = options;
  if (options.grep) this.grep(new RegExp(options.grep));
  if (options.fgrep) this.grep(options.fgrep);
  this.suite = new exports.Suite('', new exports.Context);
  this.ui(options.ui);
  this.bail(options.bail);
  this.reporter(options.reporter, options.reporterOptions);
  if (null != options.timeout) this.timeout(options.timeout);
  this.useColors(options.useColors);
  if (options.enableTimeouts !== null) this.enableTimeouts(options.enableTimeouts);
  if (options.slow) this.slow(options.slow);

  this.suite.on('pre-require', function (context) {
    exports.afterEach = context.afterEach || context.teardown;
    exports.after = context.after || context.suiteTeardown;
    exports.beforeEach = context.beforeEach || context.setup;
    exports.before = context.before || context.suiteSetup;
    exports.describe = context.describe || context.suite;
    exports.it = context.it || context.test;
    exports.setup = context.setup || context.beforeEach;
    exports.suiteSetup = context.suiteSetup || context.before;
    exports.suiteTeardown = context.suiteTeardown || context.after;
    exports.suite = context.suite || context.describe;
    exports.teardown = context.teardown || context.afterEach;
    exports.test = context.test || context.it;
    exports.run = context.run;
  });
}

/**
 * Enable or disable bailing on the first failure.
 *
 * @param {Boolean} [bail]
 * @api public
 */

Mocha.prototype.bail = function(bail){
  if (0 == arguments.length) bail = true;
  this.suite.bail(bail);
  return this;
};

/**
 * Add test `file`.
 *
 * @param {String} file
 * @api public
 */

Mocha.prototype.addFile = function(file){
  this.files.push(file);
  return this;
};

/**
 * Set reporter to `reporter`, defaults to "spec".
 *
 * @param {String|Function} reporter name or constructor
 * @param {Object} reporterOptions optional options
 * @api public
 */
Mocha.prototype.reporter = function(reporter, reporterOptions){
  if ('function' == typeof reporter) {
    this._reporter = reporter;
  } else {
    reporter = reporter || 'spec';
    var _reporter;
    try { _reporter = require('./reporters/' + reporter); } catch (err) {}
    if (!_reporter) try { _reporter = require(reporter); } catch (err) {
      err.message.indexOf('Cannot find module') !== -1
        ? console.warn('"' + reporter + '" reporter not found')
        : console.warn('"' + reporter + '" reporter blew up with error:\n' + err.stack);
    }
    if (!_reporter && reporter === 'teamcity')
      console.warn('The Teamcity reporter was moved to a package named ' +
        'mocha-teamcity-reporter ' +
        '(https://npmjs.org/package/mocha-teamcity-reporter).');
    if (!_reporter) throw new Error('invalid reporter "' + reporter + '"');
    this._reporter = _reporter;
  }
  this.options.reporterOptions = reporterOptions;
  return this;
};

/**
 * Set test UI `name`, defaults to "bdd".
 *
 * @param {String} bdd
 * @api public
 */

Mocha.prototype.ui = function(name){
  name = name || 'bdd';
  this._ui = exports.interfaces[name];
  if (!this._ui) try { this._ui = require(name); } catch (err) {}
  if (!this._ui) throw new Error('invalid interface "' + name + '"');
  this._ui = this._ui(this.suite);
  return this;
};

/**
 * Load registered files.
 *
 * @api private
 */

Mocha.prototype.loadFiles = function(fn){
  var self = this;
  var suite = this.suite;
  var pending = this.files.length;
  this.files.forEach(function(file){
    file = path.resolve(file);
    suite.emit('pre-require', global, file, self);
    suite.emit('require', require(file), file, self);
    suite.emit('post-require', global, file, self);
    --pending || (fn && fn());
  });
};

/**
 * Enable growl support.
 *
 * @api private
 */

Mocha.prototype._growl = function(runner, reporter) {
  var notify = require('growl');

  runner.on('end', function(){
    var stats = reporter.stats;
    if (stats.failures) {
      var msg = stats.failures + ' of ' + runner.total + ' tests failed';
      notify(msg, { name: 'mocha', title: 'Failed', image: image('error') });
    } else {
      notify(stats.passes + ' tests passed in ' + stats.duration + 'ms', {
          name: 'mocha'
        , title: 'Passed'
        , image: image('ok')
      });
    }
  });
};

/**
 * Add regexp to grep, if `re` is a string it is escaped.
 *
 * @param {RegExp|String} re
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.grep = function(re){
  this.options.grep = 'string' == typeof re
    ? new RegExp(escapeRe(re))
    : re;
  return this;
};

/**
 * Invert `.grep()` matches.
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.invert = function(){
  this.options.invert = true;
  return this;
};

/**
 * Ignore global leaks.
 *
 * @param {Boolean} ignore
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.ignoreLeaks = function(ignore){
  this.options.ignoreLeaks = !!ignore;
  return this;
};

/**
 * Enable global leak checking.
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.checkLeaks = function(){
  this.options.ignoreLeaks = false;
  return this;
};

/**
 * Display long stack-trace on failing
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.fullTrace = function() {
  this.options.fullStackTrace = true;
  return this;
};

/**
 * Enable growl support.
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.growl = function(){
  this.options.growl = true;
  return this;
};

/**
 * Ignore `globals` array or string.
 *
 * @param {Array|String} globals
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.globals = function(globals){
  this.options.globals = (this.options.globals || []).concat(globals);
  return this;
};

/**
 * Emit color output.
 *
 * @param {Boolean} colors
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.useColors = function(colors){
  if (colors !== undefined) {
    this.options.useColors = colors;
  }
  return this;
};

/**
 * Use inline diffs rather than +/-.
 *
 * @param {Boolean} inlineDiffs
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.useInlineDiffs = function(inlineDiffs) {
  this.options.useInlineDiffs = arguments.length && inlineDiffs != undefined
  ? inlineDiffs
  : false;
  return this;
};

/**
 * Set the timeout in milliseconds.
 *
 * @param {Number} timeout
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.timeout = function(timeout){
  this.suite.timeout(timeout);
  return this;
};

/**
 * Set slowness threshold in milliseconds.
 *
 * @param {Number} slow
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.slow = function(slow){
  this.suite.slow(slow);
  return this;
};

/**
 * Enable timeouts.
 *
 * @param {Boolean} enabled
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.enableTimeouts = function(enabled) {
  this.suite.enableTimeouts(arguments.length && enabled !== undefined
    ? enabled
    : true);
  return this
};

/**
 * Makes all tests async (accepting a callback)
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.asyncOnly = function(){
  this.options.asyncOnly = true;
  return this;
};

/**
 * Disable syntax highlighting (in browser).
 * @returns {Mocha}
 * @api public
 */
Mocha.prototype.noHighlighting = function() {
  this.options.noHighlighting = true;
  return this;
};

/**
 * Delay root suite execution.
 * @returns {Mocha}
 * @api public
 */
Mocha.prototype.delay = function delay() {
  this.options.delay = true;
  return this;
};

/**
 * Run tests and invoke `fn()` when complete.
 *
 * @param {Function} fn
 * @return {Runner}
 * @api public
 */
Mocha.prototype.run = function(fn){
  if (this.files.length) this.loadFiles();
  var suite = this.suite;
  var options = this.options;
  options.files = this.files;
  var runner = new exports.Runner(suite, options.delay);
  var reporter = new this._reporter(runner, options);
  runner.ignoreLeaks = false !== options.ignoreLeaks;
  runner.fullStackTrace = options.fullStackTrace;
  runner.asyncOnly = options.asyncOnly;
  if (options.grep) runner.grep(options.grep, options.invert);
  if (options.globals) runner.globals(options.globals);
  if (options.growl) this._growl(runner, reporter);
  if (options.useColors !== undefined) {
    exports.reporters.Base.useColors = options.useColors;
  }
  exports.reporters.Base.inlineDiffs = options.useInlineDiffs;

  function done(failures) {
      if (reporter.done) {
          reporter.done(failures, fn);
      } else fn && fn(failures);
  }

  return runner.run(done);
};

}); // module: mocha.js

require.register("ms.js", function(module, exports, require){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options['long'] ? longFormat(val) : shortFormat(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function shortFormat(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function longFormat(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

}); // module: ms.js

require.register("pending.js", function(module, exports, require){

/**
 * Expose `Pending`.
 */

module.exports = Pending;

/**
 * Initialize a new `Pending` error with the given message.
 *
 * @param {String} message
 */

function Pending(message) {
    this.message = message;
}

}); // module: pending.js

require.register("reporters/base.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var tty = require('browser/tty')
  , diff = require('browser/diff')
  , ms = require('../ms')
  , utils = require('../utils')
  , supportsColor = process.env ? require('supports-color') : null;

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Check if both stdio streams are associated with a tty.
 */

var isatty = tty.isatty(1) && tty.isatty(2);

/**
 * Expose `Base`.
 */

exports = module.exports = Base;

/**
 * Enable coloring by default, except in the browser interface.
 */

exports.useColors = process.env
  ? (supportsColor || (process.env.MOCHA_COLORS !== undefined))
  : false;

/**
 * Inline diffs instead of +/-
 */

exports.inlineDiffs = false;

/**
 * Default color map.
 */

exports.colors = {
    'pass': 90
  , 'fail': 31
  , 'bright pass': 92
  , 'bright fail': 91
  , 'bright yellow': 93
  , 'pending': 36
  , 'suite': 0
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
  , 'checkmark': 32
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
  , 'diff gutter': 90
  , 'diff added': 42
  , 'diff removed': 41
};

/**
 * Default symbol map.
 */

exports.symbols = {
  ok: '✓',
  err: '✖',
  dot: '․'
};

// With node.js on Windows: use symbols available in terminal default fonts
if ('win32' == process.platform) {
  exports.symbols.ok = '\u221A';
  exports.symbols.err = '\u00D7';
  exports.symbols.dot = '.';
}

/**
 * Color `str` with the given `type`,
 * allowing colors to be disabled,
 * as well as user-defined color
 * schemes.
 *
 * @param {String} type
 * @param {String} str
 * @return {String}
 * @api private
 */

var color = exports.color = function(type, str) {
  if (!exports.useColors) return String(str);
  return '\u001b[' + exports.colors[type] + 'm' + str + '\u001b[0m';
};

/**
 * Expose term window size, with some
 * defaults for when stderr is not a tty.
 */

exports.window = {
  width: isatty
    ? process.stdout.getWindowSize
      ? process.stdout.getWindowSize(1)[0]
      : tty.getWindowSize()[1]
    : 75
};

/**
 * Expose some basic cursor interactions
 * that are common among reporters.
 */

exports.cursor = {
  hide: function(){
    isatty && process.stdout.write('\u001b[?25l');
  },

  show: function(){
    isatty && process.stdout.write('\u001b[?25h');
  },

  deleteLine: function(){
    isatty && process.stdout.write('\u001b[2K');
  },

  beginningOfLine: function(){
    isatty && process.stdout.write('\u001b[0G');
  },

  CR: function(){
    if (isatty) {
      exports.cursor.deleteLine();
      exports.cursor.beginningOfLine();
    } else {
      process.stdout.write('\r');
    }
  }
};

/**
 * Outut the given `failures` as a list.
 *
 * @param {Array} failures
 * @api public
 */

exports.list = function(failures){
  console.log();
  failures.forEach(function(test, i){
    // format
    var fmt = color('error title', '  %s) %s:\n')
      + color('error message', '     %s')
      + color('error stack', '\n%s\n');

    // msg
    var err = test.err
      , message = err.message || ''
      , stack = err.stack || message
      , index = stack.indexOf(message)
      , actual = err.actual
      , expected = err.expected
      , escape = true;
    if (index === -1) {
      msg = message;
    } else {
      index += message.length;
      msg = stack.slice(0, index);
      // remove msg from stack
      stack = stack.slice(index + 1);
    }

    // uncaught
    if (err.uncaught) {
      msg = 'Uncaught ' + msg;
    }
    // explicitly show diff
    if (err.showDiff !== false && sameType(actual, expected)
        && expected !== undefined) {

      if ('string' !== typeof actual) {
        escape = false;
        err.actual = actual = utils.stringify(actual);
        err.expected = expected = utils.stringify(expected);
      }

      fmt = color('error title', '  %s) %s:\n%s') + color('error stack', '\n%s\n');
      var match = message.match(/^([^:]+): expected/);
      msg = '\n      ' + color('error message', match ? match[1] : msg);

      if (exports.inlineDiffs) {
        msg += inlineDiff(err, escape);
      } else {
        msg += unifiedDiff(err, escape);
      }
    }

    // indent stack trace
    stack = stack.replace(/^/gm, '  ');

    console.log(fmt, (i + 1), test.fullTitle(), msg, stack);
  });
};

/**
 * Initialize a new `Base` reporter.
 *
 * All other reporters generally
 * inherit from this reporter, providing
 * stats such as test duration, number
 * of tests passed / failed etc.
 *
 * @param {Runner} runner
 * @api public
 */

function Base(runner) {
  var self = this
    , stats = this.stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }
    , failures = this.failures = [];

  if (!runner) return;
  this.runner = runner;

  runner.stats = stats;

  runner.on('start', function(){
    stats.start = new Date;
  });

  runner.on('suite', function(suite){
    stats.suites = stats.suites || 0;
    suite.root || stats.suites++;
  });

  runner.on('test end', function(test){
    stats.tests = stats.tests || 0;
    stats.tests++;
  });

  runner.on('pass', function(test){
    stats.passes = stats.passes || 0;

    var medium = test.slow() / 2;
    test.speed = test.duration > test.slow()
      ? 'slow'
      : test.duration > medium
        ? 'medium'
        : 'fast';

    stats.passes++;
  });

  runner.on('fail', function(test, err){
    stats.failures = stats.failures || 0;
    stats.failures++;
    test.err = err;
    failures.push(test);
  });

  runner.on('end', function(){
    stats.end = new Date;
    stats.duration = new Date - stats.start;
  });

  runner.on('pending', function(){
    stats.pending++;
  });
}

/**
 * Output common epilogue used by many of
 * the bundled reporters.
 *
 * @api public
 */

Base.prototype.epilogue = function(){
  var stats = this.stats;
  var tests;
  var fmt;

  console.log();

  // passes
  fmt = color('bright pass', ' ')
    + color('green', ' %d passing')
    + color('light', ' (%s)');

  console.log(fmt,
    stats.passes || 0,
    ms(stats.duration));

  // pending
  if (stats.pending) {
    fmt = color('pending', ' ')
      + color('pending', ' %d pending');

    console.log(fmt, stats.pending);
  }

  // failures
  if (stats.failures) {
    fmt = color('fail', '  %d failing');

    console.log(fmt, stats.failures);

    Base.list(this.failures);
    console.log();
  }

  console.log();
};

/**
 * Pad the given `str` to `len`.
 *
 * @param {String} str
 * @param {String} len
 * @return {String}
 * @api private
 */

function pad(str, len) {
  str = String(str);
  return Array(len - str.length + 1).join(' ') + str;
}


/**
 * Returns an inline diff between 2 strings with coloured ANSI output
 *
 * @param {Error} Error with actual/expected
 * @return {String} Diff
 * @api private
 */

function inlineDiff(err, escape) {
  var msg = errorDiff(err, 'WordsWithSpace', escape);

  // linenos
  var lines = msg.split('\n');
  if (lines.length > 4) {
    var width = String(lines.length).length;
    msg = lines.map(function(str, i){
      return pad(++i, width) + ' |' + ' ' + str;
    }).join('\n');
  }

  // legend
  msg = '\n'
    + color('diff removed', 'actual')
    + ' '
    + color('diff added', 'expected')
    + '\n\n'
    + msg
    + '\n';

  // indent
  msg = msg.replace(/^/gm, '      ');
  return msg;
}

/**
 * Returns a unified diff between 2 strings
 *
 * @param {Error} Error with actual/expected
 * @return {String} Diff
 * @api private
 */

function unifiedDiff(err, escape) {
  var indent = '      ';
  function cleanUp(line) {
    if (escape) {
      line = escapeInvisibles(line);
    }
    if (line[0] === '+') return indent + colorLines('diff added', line);
    if (line[0] === '-') return indent + colorLines('diff removed', line);
    if (line.match(/\@\@/)) return null;
    if (line.match(/\\ No newline/)) return null;
    else return indent + line;
  }
  function notBlank(line) {
    return line != null;
  }
  var msg = diff.createPatch('string', err.actual, err.expected);
  var lines = msg.split('\n').splice(4);
  return '\n      '
         + colorLines('diff added',   '+ expected') + ' '
         + colorLines('diff removed', '- actual')
         + '\n\n'
         + lines.map(cleanUp).filter(notBlank).join('\n');
}

/**
 * Return a character diff for `err`.
 *
 * @param {Error} err
 * @return {String}
 * @api private
 */

function errorDiff(err, type, escape) {
  var actual   = escape ? escapeInvisibles(err.actual)   : err.actual;
  var expected = escape ? escapeInvisibles(err.expected) : err.expected;
  return diff['diff' + type](actual, expected).map(function(str){
    if (str.added) return colorLines('diff added', str.value);
    if (str.removed) return colorLines('diff removed', str.value);
    return str.value;
  }).join('');
}

/**
 * Returns a string with all invisible characters in plain text
 *
 * @param {String} line
 * @return {String}
 * @api private
 */
function escapeInvisibles(line) {
    return line.replace(/\t/g, '<tab>')
               .replace(/\r/g, '<CR>')
               .replace(/\n/g, '<LF>\n');
}

/**
 * Color lines for `str`, using the color `name`.
 *
 * @param {String} name
 * @param {String} str
 * @return {String}
 * @api private
 */

function colorLines(name, str) {
  return str.split('\n').map(function(str){
    return color(name, str);
  }).join('\n');
}

/**
 * Check that a / b have the same type.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 * @api private
 */

function sameType(a, b) {
  a = Object.prototype.toString.call(a);
  b = Object.prototype.toString.call(b);
  return a == b;
}

}); // module: reporters/base.js

require.register("reporters/doc.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils');

/**
 * Expose `Doc`.
 */

exports = module.exports = Doc;

/**
 * Initialize a new `Doc` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Doc(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total
    , indents = 2;

  function indent() {
    return Array(indents).join('  ');
  }

  runner.on('suite', function(suite){
    if (suite.root) return;
    ++indents;
    console.log('%s<section class="suite">', indent());
    ++indents;
    console.log('%s<h1>%s</h1>', indent(), utils.escape(suite.title));
    console.log('%s<dl>', indent());
  });

  runner.on('suite end', function(suite){
    if (suite.root) return;
    console.log('%s</dl>', indent());
    --indents;
    console.log('%s</section>', indent());
    --indents;
  });

  runner.on('pass', function(test){
    console.log('%s  <dt>%s</dt>', indent(), utils.escape(test.title));
    var code = utils.escape(utils.clean(test.fn.toString()));
    console.log('%s  <dd><pre><code>%s</code></pre></dd>', indent(), code);
  });

  runner.on('fail', function(test, err){
    console.log('%s  <dt class="error">%s</dt>', indent(), utils.escape(test.title));
    var code = utils.escape(utils.clean(test.fn.toString()));
    console.log('%s  <dd class="error"><pre><code>%s</code></pre></dd>', indent(), code);
    console.log('%s  <dd class="error">%s</dd>', indent(), utils.escape(err));
  });
}

}); // module: reporters/doc.js

require.register("reporters/dot.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , color = Base.color;

/**
 * Expose `Dot`.
 */

exports = module.exports = Dot;

/**
 * Initialize a new `Dot` matrix test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Dot(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , width = Base.window.width * .75 | 0
    , n = -1;

  runner.on('start', function(){
    process.stdout.write('\n');
  });

  runner.on('pending', function(test){
    if (++n % width == 0) process.stdout.write('\n  ');
    process.stdout.write(color('pending', Base.symbols.dot));
  });

  runner.on('pass', function(test){
    if (++n % width == 0) process.stdout.write('\n  ');
    if ('slow' == test.speed) {
      process.stdout.write(color('bright yellow', Base.symbols.dot));
    } else {
      process.stdout.write(color(test.speed, Base.symbols.dot));
    }
  });

  runner.on('fail', function(test, err){
    if (++n % width == 0) process.stdout.write('\n  ');
    process.stdout.write(color('fail', Base.symbols.dot));
  });

  runner.on('end', function(){
    console.log();
    self.epilogue();
  });
}

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
Dot.prototype = new F;
Dot.prototype.constructor = Dot;


}); // module: reporters/dot.js

require.register("reporters/html-cov.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var JSONCov = require('./json-cov')
  , fs = require('browser/fs');

/**
 * Expose `HTMLCov`.
 */

exports = module.exports = HTMLCov;

/**
 * Initialize a new `JsCoverage` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function HTMLCov(runner) {
  var jade = require('jade')
    , file = __dirname + '/templates/coverage.jade'
    , str = fs.readFileSync(file, 'utf8')
    , fn = jade.compile(str, { filename: file })
    , self = this;

  JSONCov.call(this, runner, false);

  runner.on('end', function(){
    process.stdout.write(fn({
        cov: self.cov
      , coverageClass: coverageClass
    }));
  });
}

/**
 * Return coverage class for `n`.
 *
 * @return {String}
 * @api private
 */

function coverageClass(n) {
  if (n >= 75) return 'high';
  if (n >= 50) return 'medium';
  if (n >= 25) return 'low';
  return 'terrible';
}

}); // module: reporters/html-cov.js

require.register("reporters/html.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils')
  , Progress = require('../browser/progress')
  , escape = utils.escape;

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Expose `HTML`.
 */

exports = module.exports = HTML;

/**
 * Stats template.
 */

var statsTemplate = '<ul id="mocha-stats">'
  + '<li class="progress"><canvas width="40" height="40"></canvas></li>'
  + '<li class="passes"><a href="#">passes:</a> <em>0</em></li>'
  + '<li class="failures"><a href="#">failures:</a> <em>0</em></li>'
  + '<li class="duration">duration: <em>0</em>s</li>'
  + '</ul>';

/**
 * Initialize a new `HTML` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function HTML(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total
    , stat = fragment(statsTemplate)
    , items = stat.getElementsByTagName('li')
    , passes = items[1].getElementsByTagName('em')[0]
    , passesLink = items[1].getElementsByTagName('a')[0]
    , failures = items[2].getElementsByTagName('em')[0]
    , failuresLink = items[2].getElementsByTagName('a')[0]
    , duration = items[3].getElementsByTagName('em')[0]
    , canvas = stat.getElementsByTagName('canvas')[0]
    , report = fragment('<ul id="mocha-report"></ul>')
    , stack = [report]
    , progress
    , ctx
    , root = document.getElementById('mocha');

  if (canvas.getContext) {
    var ratio = window.devicePixelRatio || 1;
    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    progress = new Progress;
  }

  if (!root) return error('#mocha div missing, add it to your document');

  // pass toggle
  on(passesLink, 'click', function(){
    unhide();
    var name = /pass/.test(report.className) ? '' : ' pass';
    report.className = report.className.replace(/fail|pass/g, '') + name;
    if (report.className.trim()) hideSuitesWithout('test pass');
  });

  // failure toggle
  on(failuresLink, 'click', function(){
    unhide();
    var name = /fail/.test(report.className) ? '' : ' fail';
    report.className = report.className.replace(/fail|pass/g, '') + name;
    if (report.className.trim()) hideSuitesWithout('test fail');
  });

  root.appendChild(stat);
  root.appendChild(report);

  if (progress) progress.size(40);

  runner.on('suite', function(suite){
    if (suite.root) return;

    // suite
    var url = self.suiteURL(suite);
    var el = fragment('<li class="suite"><h1><a href="%s">%s</a></h1></li>', url, escape(suite.title));

    // container
    stack[0].appendChild(el);
    stack.unshift(document.createElement('ul'));
    el.appendChild(stack[0]);
  });

  runner.on('suite end', function(suite){
    if (suite.root) return;
    stack.shift();
  });

  runner.on('fail', function(test, err){
    if ('hook' == test.type) runner.emit('test end', test);
  });

  runner.on('test end', function(test){
    // TODO: add to stats
    var percent = stats.tests / this.total * 100 | 0;
    if (progress) progress.update(percent).draw(ctx);

    // update stats
    var ms = new Date - stats.start;
    text(passes, stats.passes);
    text(failures, stats.failures);
    text(duration, (ms / 1000).toFixed(2));

    // test
    if ('passed' == test.state) {
      var url = self.testURL(test);
      var el = fragment('<li class="test pass %e"><h2>%e<span class="duration">%ems</span> <a href="%s" class="replay">‣</a></h2></li>', test.speed, test.title, test.duration, url);
    } else if (test.pending) {
      var el = fragment('<li class="test pass pending"><h2>%e</h2></li>', test.title);
    } else {
      var el = fragment('<li class="test fail"><h2>%e <a href="%e" class="replay">‣</a></h2></li>', test.title, self.testURL(test));
      var str = test.err.stack || test.err.toString();

      // FF / Opera do not add the message
      if (!~str.indexOf(test.err.message)) {
        str = test.err.message + '\n' + str;
      }

      // <=IE7 stringifies to [Object Error]. Since it can be overloaded, we
      // check for the result of the stringifying.
      if ('[object Error]' == str) str = test.err.message;

      // Safari doesn't give you a stack. Let's at least provide a source line.
      if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {
        str += "\n(" + test.err.sourceURL + ":" + test.err.line + ")";
      }

      el.appendChild(fragment('<pre class="error">%e</pre>', str));
    }

    // toggle code
    // TODO: defer
    if (!test.pending) {
      var h2 = el.getElementsByTagName('h2')[0];

      on(h2, 'click', function(){
        pre.style.display = 'none' == pre.style.display
          ? 'block'
          : 'none';
      });

      var pre = fragment('<pre><code>%e</code></pre>', utils.clean(test.fn.toString()));
      el.appendChild(pre);
      pre.style.display = 'none';
    }

    // Don't call .appendChild if #mocha-report was already .shift()'ed off the stack.
    if (stack[0]) stack[0].appendChild(el);
  });
}

/**
 * Makes a URL, preserving querystring ("search") parameters.
 * @param {string} s
 * @returns {string} your new URL
 */
var makeUrl = function makeUrl(s) {
  var search = window.location.search;

  // Remove previous grep query parameter if present
  if (search) {
    search = search.replace(/[?&]grep=[^&\s]*/g, '').replace(/^&/, '?');
  }

  return window.location.pathname + (search ? search + '&' : '?' ) + 'grep=' + encodeURIComponent(s);
};

/**
 * Provide suite URL
 *
 * @param {Object} [suite]
 */
HTML.prototype.suiteURL = function(suite){
  return makeUrl(suite.fullTitle());
};

/**
 * Provide test URL
 *
 * @param {Object} [test]
 */

HTML.prototype.testURL = function(test){
  return makeUrl(test.fullTitle());
};

/**
 * Display error `msg`.
 */

function error(msg) {
  document.body.appendChild(fragment('<div id="mocha-error">%s</div>', msg));
}

/**
 * Return a DOM fragment from `html`.
 */

function fragment(html) {
  var args = arguments
    , div = document.createElement('div')
    , i = 1;

  div.innerHTML = html.replace(/%([se])/g, function(_, type){
    switch (type) {
      case 's': return String(args[i++]);
      case 'e': return escape(args[i++]);
    }
  });

  return div.firstChild;
}

/**
 * Check for suites that do not have elements
 * with `classname`, and hide them.
 */

function hideSuitesWithout(classname) {
  var suites = document.getElementsByClassName('suite');
  for (var i = 0; i < suites.length; i++) {
    var els = suites[i].getElementsByClassName(classname);
    if (0 == els.length) suites[i].className += ' hidden';
  }
}

/**
 * Unhide .hidden suites.
 */

function unhide() {
  var els = document.getElementsByClassName('suite hidden');
  for (var i = 0; i < els.length; ++i) {
    els[i].className = els[i].className.replace('suite hidden', 'suite');
  }
}

/**
 * Set `el` text to `str`.
 */

function text(el, str) {
  if (el.textContent) {
    el.textContent = str;
  } else {
    el.innerText = str;
  }
}

/**
 * Listen on `event` with callback `fn`.
 */

function on(el, event, fn) {
  if (el.addEventListener) {
    el.addEventListener(event, fn, false);
  } else {
    el.attachEvent('on' + event, fn);
  }
}

}); // module: reporters/html.js

require.register("reporters/index.js", function(module, exports, require){
exports.Base = require('./base');
exports.Dot = require('./dot');
exports.Doc = require('./doc');
exports.TAP = require('./tap');
exports.JSON = require('./json');
exports.HTML = require('./html');
exports.List = require('./list');
exports.Min = require('./min');
exports.Spec = require('./spec');
exports.Nyan = require('./nyan');
exports.XUnit = require('./xunit');
exports.Markdown = require('./markdown');
exports.Progress = require('./progress');
exports.Landing = require('./landing');
exports.JSONCov = require('./json-cov');
exports.HTMLCov = require('./html-cov');
exports.JSONStream = require('./json-stream');

}); // module: reporters/index.js

require.register("reporters/json-cov.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base');

/**
 * Expose `JSONCov`.
 */

exports = module.exports = JSONCov;

/**
 * Initialize a new `JsCoverage` reporter.
 *
 * @param {Runner} runner
 * @param {Boolean} output
 * @api public
 */

function JSONCov(runner, output) {
  var self = this
    , output = 1 == arguments.length ? true : output;

  Base.call(this, runner);

  var tests = []
    , failures = []
    , passes = [];

  runner.on('test end', function(test){
    tests.push(test);
  });

  runner.on('pass', function(test){
    passes.push(test);
  });

  runner.on('fail', function(test){
    failures.push(test);
  });

  runner.on('end', function(){
    var cov = global._$jscoverage || {};
    var result = self.cov = map(cov);
    result.stats = self.stats;
    result.tests = tests.map(clean);
    result.failures = failures.map(clean);
    result.passes = passes.map(clean);
    if (!output) return;
    process.stdout.write(JSON.stringify(result, null, 2 ));
  });
}

/**
 * Map jscoverage data to a JSON structure
 * suitable for reporting.
 *
 * @param {Object} cov
 * @return {Object}
 * @api private
 */

function map(cov) {
  var ret = {
      instrumentation: 'node-jscoverage'
    , sloc: 0
    , hits: 0
    , misses: 0
    , coverage: 0
    , files: []
  };

  for (var filename in cov) {
    var data = coverage(filename, cov[filename]);
    ret.files.push(data);
    ret.hits += data.hits;
    ret.misses += data.misses;
    ret.sloc += data.sloc;
  }

  ret.files.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });

  if (ret.sloc > 0) {
    ret.coverage = (ret.hits / ret.sloc) * 100;
  }

  return ret;
}

/**
 * Map jscoverage data for a single source file
 * to a JSON structure suitable for reporting.
 *
 * @param {String} filename name of the source file
 * @param {Object} data jscoverage coverage data
 * @return {Object}
 * @api private
 */

function coverage(filename, data) {
  var ret = {
    filename: filename,
    coverage: 0,
    hits: 0,
    misses: 0,
    sloc: 0,
    source: {}
  };

  data.source.forEach(function(line, num){
    num++;

    if (data[num] === 0) {
      ret.misses++;
      ret.sloc++;
    } else if (data[num] !== undefined) {
      ret.hits++;
      ret.sloc++;
    }

    ret.source[num] = {
        source: line
      , coverage: data[num] === undefined
        ? ''
        : data[num]
    };
  });

  ret.coverage = ret.hits / ret.sloc * 100;

  return ret;
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  }
}

}); // module: reporters/json-cov.js

require.register("reporters/json-stream.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , color = Base.color;

/**
 * Expose `List`.
 */

exports = module.exports = List;

/**
 * Initialize a new `List` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function List(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total;

  runner.on('start', function(){
    console.log(JSON.stringify(['start', { total: total }]));
  });

  runner.on('pass', function(test){
    console.log(JSON.stringify(['pass', clean(test)]));
  });

  runner.on('fail', function(test, err){
    test = clean(test);
    test.err = err.message;
    console.log(JSON.stringify(['fail', test]));
  });

  runner.on('end', function(){
    process.stdout.write(JSON.stringify(['end', self.stats]));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  }
}

}); // module: reporters/json-stream.js

require.register("reporters/json.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `JSON`.
 */

exports = module.exports = JSONReporter;

/**
 * Initialize a new `JSON` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function JSONReporter(runner) {
  var self = this;
  Base.call(this, runner);

  var tests = []
    , pending = []
    , failures = []
    , passes = [];

  runner.on('test end', function(test){
    tests.push(test);
  });

  runner.on('pass', function(test){
    passes.push(test);
  });

  runner.on('fail', function(test){
    failures.push(test);
  });

  runner.on('pending', function(test){
    pending.push(test);
  });

  runner.on('end', function(){
    var obj = {
      stats: self.stats,
      tests: tests.map(clean),
      pending: pending.map(clean),
      failures: failures.map(clean),
      passes: passes.map(clean)
    };

    runner.testResults = obj;

    process.stdout.write(JSON.stringify(obj, null, 2));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    err: errorJSON(test.err || {})
  }
}

/**
 * Transform `error` into a JSON object.
 * @param {Error} err
 * @return {Object}
 */

function errorJSON(err) {
  var res = {};
  Object.getOwnPropertyNames(err).forEach(function(key) {
    res[key] = err[key];
  }, err);
  return res;
}

}); // module: reporters/json.js

require.register("reporters/landing.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `Landing`.
 */

exports = module.exports = Landing;

/**
 * Airplane color.
 */

Base.colors.plane = 0;

/**
 * Airplane crash color.
 */

Base.colors['plane crash'] = 31;

/**
 * Runway color.
 */

Base.colors.runway = 90;

/**
 * Initialize a new `Landing` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Landing(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , width = Base.window.width * .75 | 0
    , total = runner.total
    , stream = process.stdout
    , plane = color('plane', '✈')
    , crashed = -1
    , n = 0;

  function runway() {
    var buf = Array(width).join('-');
    return '  ' + color('runway', buf);
  }

  runner.on('start', function(){
    stream.write('\n\n\n  ');
    cursor.hide();
  });

  runner.on('test end', function(test){
    // check if the plane crashed
    var col = -1 == crashed
      ? width * ++n / total | 0
      : crashed;

    // show the crash
    if ('failed' == test.state) {
      plane = color('plane crash', '✈');
      crashed = col;
    }

    // render landing strip
    stream.write('\u001b['+(width+1)+'D\u001b[2A');
    stream.write(runway());
    stream.write('\n  ');
    stream.write(color('runway', Array(col).join('⋅')));
    stream.write(plane)
    stream.write(color('runway', Array(width - col).join('⋅') + '\n'));
    stream.write(runway());
    stream.write('\u001b[0m');
  });

  runner.on('end', function(){
    cursor.show();
    console.log();
    self.epilogue();
  });
}

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
Landing.prototype = new F;
Landing.prototype.constructor = Landing;


}); // module: reporters/landing.js

require.register("reporters/list.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `List`.
 */

exports = module.exports = List;

/**
 * Initialize a new `List` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function List(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , n = 0;

  runner.on('start', function(){
    console.log();
  });

  runner.on('test', function(test){
    process.stdout.write(color('pass', '    ' + test.fullTitle() + ': '));
  });

  runner.on('pending', function(test){
    var fmt = color('checkmark', '  -')
      + color('pending', ' %s');
    console.log(fmt, test.fullTitle());
  });

  runner.on('pass', function(test){
    var fmt = color('checkmark', '  '+Base.symbols.dot)
      + color('pass', ' %s: ')
      + color(test.speed, '%dms');
    cursor.CR();
    console.log(fmt, test.fullTitle(), test.duration);
  });

  runner.on('fail', function(test, err){
    cursor.CR();
    console.log(color('fail', '  %d) %s'), ++n, test.fullTitle());
  });

  runner.on('end', self.epilogue.bind(self));
}

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
List.prototype = new F;
List.prototype.constructor = List;


}); // module: reporters/list.js

require.register("reporters/markdown.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils');

/**
 * Constants
 */

var SUITE_PREFIX = '$';

/**
 * Expose `Markdown`.
 */

exports = module.exports = Markdown;

/**
 * Initialize a new `Markdown` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Markdown(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , level = 0
    , buf = '';

  function title(str) {
    return Array(level).join('#') + ' ' + str;
  }

  function indent() {
    return Array(level).join('  ');
  }

  function mapTOC(suite, obj) {
    var ret = obj,
        key = SUITE_PREFIX + suite.title;
    obj = obj[key] = obj[key] || { suite: suite };
    suite.suites.forEach(function(suite){
      mapTOC(suite, obj);
    });
    return ret;
  }

  function stringifyTOC(obj, level) {
    ++level;
    var buf = '';
    var link;
    for (var key in obj) {
      if ('suite' == key) continue;
      if (key !== SUITE_PREFIX) {
        link = ' - [' + key.substring(1) + ']';
        link += '(#' + utils.slug(obj[key].suite.fullTitle()) + ')\n';
        buf += Array(level).join('  ') + link;
      }
      buf += stringifyTOC(obj[key], level);
    }
    return buf;
  }

  function generateTOC(suite) {
    var obj = mapTOC(suite, {});
    return stringifyTOC(obj, 0);
  }

  generateTOC(runner.suite);

  runner.on('suite', function(suite){
    ++level;
    var slug = utils.slug(suite.fullTitle());
    buf += '<a name="' + slug + '"></a>' + '\n';
    buf += title(suite.title) + '\n';
  });

  runner.on('suite end', function(suite){
    --level;
  });

  runner.on('pass', function(test){
    var code = utils.clean(test.fn.toString());
    buf += test.title + '.\n';
    buf += '\n```js\n';
    buf += code + '\n';
    buf += '```\n\n';
  });

  runner.on('end', function(){
    process.stdout.write('# TOC\n');
    process.stdout.write(generateTOC(runner.suite));
    process.stdout.write(buf);
  });
}

}); // module: reporters/markdown.js

require.register("reporters/min.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base');

/**
 * Expose `Min`.
 */

exports = module.exports = Min;

/**
 * Initialize a new `Min` minimal test reporter (best used with --watch).
 *
 * @param {Runner} runner
 * @api public
 */

function Min(runner) {
  Base.call(this, runner);

  runner.on('start', function(){
    // clear screen
    process.stdout.write('\u001b[2J');
    // set cursor position
    process.stdout.write('\u001b[1;3H');
  });

  runner.on('end', this.epilogue.bind(this));
}

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
Min.prototype = new F;
Min.prototype.constructor = Min;


}); // module: reporters/min.js

require.register("reporters/nyan.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base');

/**
 * Expose `Dot`.
 */

exports = module.exports = NyanCat;

/**
 * Initialize a new `Dot` matrix test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function NyanCat(runner) {
  Base.call(this, runner);
  var self = this
    , stats = this.stats
    , width = Base.window.width * .75 | 0
    , rainbowColors = this.rainbowColors = self.generateColors()
    , colorIndex = this.colorIndex = 0
    , numerOfLines = this.numberOfLines = 4
    , trajectories = this.trajectories = [[], [], [], []]
    , nyanCatWidth = this.nyanCatWidth = 11
    , trajectoryWidthMax = this.trajectoryWidthMax = (width - nyanCatWidth)
    , scoreboardWidth = this.scoreboardWidth = 5
    , tick = this.tick = 0
    , n = 0;

  runner.on('start', function(){
    Base.cursor.hide();
    self.draw();
  });

  runner.on('pending', function(test){
    self.draw();
  });

  runner.on('pass', function(test){
    self.draw();
  });

  runner.on('fail', function(test, err){
    self.draw();
  });

  runner.on('end', function(){
    Base.cursor.show();
    for (var i = 0; i < self.numberOfLines; i++) write('\n');
    self.epilogue();
  });
}

/**
 * Draw the nyan cat
 *
 * @api private
 */

NyanCat.prototype.draw = function(){
  this.appendRainbow();
  this.drawScoreboard();
  this.drawRainbow();
  this.drawNyanCat();
  this.tick = !this.tick;
};

/**
 * Draw the "scoreboard" showing the number
 * of passes, failures and pending tests.
 *
 * @api private
 */

NyanCat.prototype.drawScoreboard = function(){
  var stats = this.stats;

  function draw(type, n) {
    write(' ');
    write(Base.color(type, n));
    write('\n');
  }

  draw('green', stats.passes);
  draw('fail', stats.failures);
  draw('pending', stats.pending);
  write('\n');

  this.cursorUp(this.numberOfLines);
};

/**
 * Append the rainbow.
 *
 * @api private
 */

NyanCat.prototype.appendRainbow = function(){
  var segment = this.tick ? '_' : '-';
  var rainbowified = this.rainbowify(segment);

  for (var index = 0; index < this.numberOfLines; index++) {
    var trajectory = this.trajectories[index];
    if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();
    trajectory.push(rainbowified);
  }
};

/**
 * Draw the rainbow.
 *
 * @api private
 */

NyanCat.prototype.drawRainbow = function(){
  var self = this;

  this.trajectories.forEach(function(line, index) {
    write('\u001b[' + self.scoreboardWidth + 'C');
    write(line.join(''));
    write('\n');
  });

  this.cursorUp(this.numberOfLines);
};

/**
 * Draw the nyan cat
 *
 * @api private
 */

NyanCat.prototype.drawNyanCat = function() {
  var self = this;
  var startWidth = this.scoreboardWidth + this.trajectories[0].length;
  var dist = '\u001b[' + startWidth + 'C';
  var padding = '';

  write(dist);
  write('_,------,');
  write('\n');

  write(dist);
  padding = self.tick ? '  ' : '   ';
  write('_|' + padding + '/\\_/\\ ');
  write('\n');

  write(dist);
  padding = self.tick ? '_' : '__';
  var tail = self.tick ? '~' : '^';
  var face;
  write(tail + '|' + padding + this.face() + ' ');
  write('\n');

  write(dist);
  padding = self.tick ? ' ' : '  ';
  write(padding + '""  "" ');
  write('\n');

  this.cursorUp(this.numberOfLines);
};

/**
 * Draw nyan cat face.
 *
 * @return {String}
 * @api private
 */

NyanCat.prototype.face = function() {
  var stats = this.stats;
  if (stats.failures) {
    return '( x .x)';
  } else if (stats.pending) {
    return '( o .o)';
  } else if(stats.passes) {
    return '( ^ .^)';
  } else {
    return '( - .-)';
  }
};

/**
 * Move cursor up `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorUp = function(n) {
  write('\u001b[' + n + 'A');
};

/**
 * Move cursor down `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorDown = function(n) {
  write('\u001b[' + n + 'B');
};

/**
 * Generate rainbow colors.
 *
 * @return {Array}
 * @api private
 */

NyanCat.prototype.generateColors = function(){
  var colors = [];

  for (var i = 0; i < (6 * 7); i++) {
    var pi3 = Math.floor(Math.PI / 3);
    var n = (i * (1.0 / 6));
    var r = Math.floor(3 * Math.sin(n) + 3);
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);
    colors.push(36 * r + 6 * g + b + 16);
  }

  return colors;
};

/**
 * Apply rainbow to the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

NyanCat.prototype.rainbowify = function(str){
  if (!Base.useColors)
    return str;
  var color = this.rainbowColors[this.colorIndex % this.rainbowColors.length];
  this.colorIndex += 1;
  return '\u001b[38;5;' + color + 'm' + str + '\u001b[0m';
};

/**
 * Stdout helper.
 */

function write(string) {
  process.stdout.write(string);
}

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
NyanCat.prototype = new F;
NyanCat.prototype.constructor = NyanCat;


}); // module: reporters/nyan.js

require.register("reporters/progress.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `Progress`.
 */

exports = module.exports = Progress;

/**
 * General progress bar color.
 */

Base.colors.progress = 90;

/**
 * Initialize a new `Progress` bar test reporter.
 *
 * @param {Runner} runner
 * @param {Object} options
 * @api public
 */

function Progress(runner, options) {
  Base.call(this, runner);

  var self = this
    , options = options || {}
    , stats = this.stats
    , width = Base.window.width * .50 | 0
    , total = runner.total
    , complete = 0
    , max = Math.max
    , lastN = -1;

  // default chars
  options.open = options.open || '[';
  options.complete = options.complete || '▬';
  options.incomplete = options.incomplete || Base.symbols.dot;
  options.close = options.close || ']';
  options.verbose = false;

  // tests started
  runner.on('start', function(){
    console.log();
    cursor.hide();
  });

  // tests complete
  runner.on('test end', function(){
    complete++;
    var incomplete = total - complete
      , percent = complete / total
      , n = width * percent | 0
      , i = width - n;

    if (lastN === n && !options.verbose) {
      // Don't re-render the line if it hasn't changed
      return;
    }
    lastN = n;

    cursor.CR();
    process.stdout.write('\u001b[J');
    process.stdout.write(color('progress', '  ' + options.open));
    process.stdout.write(Array(n).join(options.complete));
    process.stdout.write(Array(i).join(options.incomplete));
    process.stdout.write(color('progress', options.close));
    if (options.verbose) {
      process.stdout.write(color('progress', ' ' + complete + ' of ' + total));
    }
  });

  // tests are complete, output some stats
  // and the failures if any
  runner.on('end', function(){
    cursor.show();
    console.log();
    self.epilogue();
  });
}

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
Progress.prototype = new F;
Progress.prototype.constructor = Progress;


}); // module: reporters/progress.js

require.register("reporters/spec.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `Spec`.
 */

exports = module.exports = Spec;

/**
 * Initialize a new `Spec` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Spec(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , indents = 0
    , n = 0;

  function indent() {
    return Array(indents).join('  ')
  }

  runner.on('start', function(){
    console.log();
  });

  runner.on('suite', function(suite){
    ++indents;
    console.log(color('suite', '%s%s'), indent(), suite.title);
  });

  runner.on('suite end', function(suite){
    --indents;
    if (1 == indents) console.log();
  });

  runner.on('pending', function(test){
    var fmt = indent() + color('pending', '  - %s');
    console.log(fmt, test.title);
  });

  runner.on('pass', function(test){
    if ('fast' == test.speed) {
      var fmt = indent()
        + color('checkmark', '  ' + Base.symbols.ok)
        + color('pass', ' %s');
      cursor.CR();
      console.log(fmt, test.title);
    } else {
      var fmt = indent()
        + color('checkmark', '  ' + Base.symbols.ok)
        + color('pass', ' %s')
        + color(test.speed, ' (%dms)');
      cursor.CR();
      console.log(fmt, test.title, test.duration);
    }
  });

  runner.on('fail', function(test, err){
    cursor.CR();
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
  });

  runner.on('end', self.epilogue.bind(self));
}

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
Spec.prototype = new F;
Spec.prototype.constructor = Spec;


}); // module: reporters/spec.js

require.register("reporters/tap.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `TAP`.
 */

exports = module.exports = TAP;

/**
 * Initialize a new `TAP` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function TAP(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , n = 1
    , passes = 0
    , failures = 0;

  runner.on('start', function(){
    var total = runner.grepTotal(runner.suite);
    console.log('%d..%d', 1, total);
  });

  runner.on('test end', function(){
    ++n;
  });

  runner.on('pending', function(test){
    console.log('ok %d %s # SKIP -', n, title(test));
  });

  runner.on('pass', function(test){
    passes++;
    console.log('ok %d %s', n, title(test));
  });

  runner.on('fail', function(test, err){
    failures++;
    console.log('not ok %d %s', n, title(test));
    if (err.stack) console.log(err.stack.replace(/^/gm, '  '));
  });

  runner.on('end', function(){
    console.log('# tests ' + (passes + failures));
    console.log('# pass ' + passes);
    console.log('# fail ' + failures);
  });
}

/**
 * Return a TAP-safe title of `test`
 *
 * @param {Object} test
 * @return {String}
 * @api private
 */

function title(test) {
  return test.fullTitle().replace(/#/g, '');
}

}); // module: reporters/tap.js

require.register("reporters/xunit.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils')
  , fs = require('browser/fs')
  , escape = utils.escape;

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Expose `XUnit`.
 */

exports = module.exports = XUnit;

/**
 * Initialize a new `XUnit` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function XUnit(runner, options) {
  Base.call(this, runner);
  var stats = this.stats
    , tests = []
    , self = this;

  if (options.reporterOptions && options.reporterOptions.output) {
      if (! fs.createWriteStream) {
          throw new Error('file output not supported in browser');
      }
      self.fileStream = fs.createWriteStream(options.reporterOptions.output);
  }

  runner.on('pending', function(test){
    tests.push(test);
  });

  runner.on('pass', function(test){
    tests.push(test);
  });

  runner.on('fail', function(test){
    tests.push(test);
  });

  runner.on('end', function(){
    self.write(tag('testsuite', {
        name: 'Mocha Tests'
      , tests: stats.tests
      , failures: stats.failures
      , errors: stats.failures
      , skipped: stats.tests - stats.failures - stats.passes
      , timestamp: (new Date).toUTCString()
      , time: (stats.duration / 1000) || 0
    }, false));

    tests.forEach(function(t) { self.test(t); });
    self.write('</testsuite>');
  });
}

/**
 * Override done to close the stream (if it's a file).
 */
XUnit.prototype.done = function(failures, fn) {
    if (this.fileStream) {
        this.fileStream.end(function() {
            fn(failures);
        });
    } else {
        fn(failures);
    }
};

/**
 * Inherit from `Base.prototype`.
 */

function F(){};
F.prototype = Base.prototype;
XUnit.prototype = new F;
XUnit.prototype.constructor = XUnit;


/**
 * Write out the given line
 */
XUnit.prototype.write = function(line) {
    if (this.fileStream) {
        this.fileStream.write(line + '\n');
    } else {
        console.log(line);
    }
};

/**
 * Output tag for the given `test.`
 */

XUnit.prototype.test = function(test, ostream) {
  var attrs = {
      classname: test.parent.fullTitle()
    , name: test.title
    , time: (test.duration / 1000) || 0
  };

  if ('failed' == test.state) {
    var err = test.err;
    this.write(tag('testcase', attrs, false, tag('failure', {}, false, cdata(escape(err.message) + "\n" + err.stack))));
  } else if (test.pending) {
    this.write(tag('testcase', attrs, false, tag('skipped', {}, true)));
  } else {
    this.write(tag('testcase', attrs, true) );
  }
};

/**
 * HTML tag helper.
 */

function tag(name, attrs, close, content) {
  var end = close ? '/>' : '>'
    , pairs = []
    , tag;

  for (var key in attrs) {
    pairs.push(key + '="' + escape(attrs[key]) + '"');
  }

  tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;
  if (content) tag += content + '</' + name + end;
  return tag;
}

/**
 * Return cdata escaped CDATA `str`.
 */

function cdata(str) {
  return '<![CDATA[' + escape(str) + ']]>';
}

}); // module: reporters/xunit.js

require.register("runnable.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var EventEmitter = require('browser/events').EventEmitter
  , debug = require('browser/debug')('mocha:runnable')
  , Pending = require('./pending')
  , milliseconds = require('./ms')
  , utils = require('./utils');

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Object#toString().
 */

var toString = Object.prototype.toString;

/**
 * Expose `Runnable`.
 */

module.exports = Runnable;

/**
 * Initialize a new `Runnable` with the given `title` and callback `fn`.
 *
 * @param {String} title
 * @param {Function} fn
 * @api private
 */

function Runnable(title, fn) {
  this.title = title;
  this.fn = fn;
  this.async = fn && fn.length;
  this.sync = ! this.async;
  this._timeout = 2000;
  this._slow = 75;
  this._enableTimeouts = true;
  this.timedOut = false;
  this._trace = new Error('done() called multiple times')
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

function F(){};
F.prototype = EventEmitter.prototype;
Runnable.prototype = new F;
Runnable.prototype.constructor = Runnable;


/**
 * Set & get timeout `ms`.
 *
 * @param {Number|String} ms
 * @return {Runnable|Number} ms or self
 * @api private
 */

Runnable.prototype.timeout = function(ms){
  if (0 == arguments.length) return this._timeout;
  if (ms === 0) this._enableTimeouts = false;
  if ('string' == typeof ms) ms = milliseconds(ms);
  debug('timeout %d', ms);
  this._timeout = ms;
  if (this.timer) this.resetTimeout();
  return this;
};

/**
 * Set & get slow `ms`.
 *
 * @param {Number|String} ms
 * @return {Runnable|Number} ms or self
 * @api private
 */

Runnable.prototype.slow = function(ms){
  if (0 === arguments.length) return this._slow;
  if ('string' == typeof ms) ms = milliseconds(ms);
  debug('timeout %d', ms);
  this._slow = ms;
  return this;
};

/**
 * Set and & get timeout `enabled`.
 *
 * @param {Boolean} enabled
 * @return {Runnable|Boolean} enabled or self
 * @api private
 */

Runnable.prototype.enableTimeouts = function(enabled){
  if (arguments.length === 0) return this._enableTimeouts;
  debug('enableTimeouts %s', enabled);
  this._enableTimeouts = enabled;
  return this;
};

/**
 * Halt and mark as pending.
 *
 * @api private
 */

Runnable.prototype.skip = function(){
    throw new Pending();
};

/**
 * Return the full title generated by recursively
 * concatenating the parent's full title.
 *
 * @return {String}
 * @api public
 */

Runnable.prototype.fullTitle = function(){
  return this.parent.fullTitle() + ' ' + this.title;
};

/**
 * Clear the timeout.
 *
 * @api private
 */

Runnable.prototype.clearTimeout = function(){
  clearTimeout(this.timer);
};

/**
 * Inspect the runnable void of private properties.
 *
 * @return {String}
 * @api private
 */

Runnable.prototype.inspect = function(){
  return JSON.stringify(this, function(key, val){
    if ('_' == key[0]) return;
    if ('parent' == key) return '#<Suite>';
    if ('ctx' == key) return '#<Context>';
    return val;
  }, 2);
};

/**
 * Reset the timeout.
 *
 * @api private
 */

Runnable.prototype.resetTimeout = function(){
  var self = this;
  var ms = this.timeout() || 1e9;

  if (!this._enableTimeouts) return;
  this.clearTimeout();
  this.timer = setTimeout(function(){
    if (!self._enableTimeouts) return;
    self.callback(new Error('timeout of ' + ms + 'ms exceeded. Ensure the done() callback is being called in this test.'));
    self.timedOut = true;
  }, ms);
};

/**
 * Whitelist these globals for this test run
 *
 * @api private
 */
Runnable.prototype.globals = function(arr){
  var self = this;
  this._allowedGlobals = arr;
};

/**
 * Run the test and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Runnable.prototype.run = function(fn){
  var self = this
    , start = new Date
    , ctx = this.ctx
    , finished
    , emitted;

  // Some times the ctx exists but it is not runnable
  if (ctx && ctx.runnable) ctx.runnable(this);

  // called multiple times
  function multiple(err) {
    if (emitted) return;
    emitted = true;
    self.emit('error', err || new Error('done() called multiple times; stacktrace may be inaccurate'));
  }

  // finished
  function done(err) {
    var ms = self.timeout();
    if (self.timedOut) return;
    if (finished) return multiple(err || self._trace);

    // Discard the resolution if this test has already failed asynchronously
    if (self.state) return;

    self.clearTimeout();
    self.duration = new Date - start;
    finished = true;
    if (!err && self.duration > ms && self._enableTimeouts) err = new Error('timeout of ' + ms + 'ms exceeded. Ensure the done() callback is being called in this test.');
    fn(err);
  }

  // for .resetTimeout()
  this.callback = done;

  // explicit async with `done` argument
  if (this.async) {
    this.resetTimeout();

    try {
      this.fn.call(ctx, function(err){
        if (err instanceof Error || toString.call(err) === "[object Error]") return done(err);
        if (null != err) {
          if (Object.prototype.toString.call(err) === '[object Object]') {
            return done(new Error('done() invoked with non-Error: ' + JSON.stringify(err)));
          } else {
            return done(new Error('done() invoked with non-Error: ' + err));
          }
        }
        done();
      });
    } catch (err) {
      done(utils.getError(err));
    }
    return;
  }

  if (this.asyncOnly) {
    return done(new Error('--async-only option in use without declaring `done()`'));
  }

  // sync or promise-returning
  try {
    if (this.pending) {
      done();
    } else {
      callFn(this.fn);
    }
  } catch (err) {
    done(utils.getError(err));
  }

  function callFn(fn) {
    var result = fn.call(ctx);
    if (result && typeof result.then === 'function') {
      self.resetTimeout();
      result
        .then(function() {
          done()
        },
        function(reason) {
          done(reason || new Error('Promise rejected with no or falsy reason'))
        });
    } else {
      done();
    }
  }
};

}); // module: runnable.js

require.register("runner.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var EventEmitter = require('browser/events').EventEmitter
  , debug = require('browser/debug')('mocha:runner')
  , Pending = require('./pending')
  , Test = require('./test')
  , utils = require('./utils')
  , filter = utils.filter
  , keys = utils.keys
  , type = utils.type
  , stringify = utils.stringify
  , stackFilter = utils.stackTraceFilter();

/**
 * Non-enumerable globals.
 */

var globals = [
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'XMLHttpRequest',
  'Date',
  'setImmediate',
  'clearImmediate'
];

/**
 * Expose `Runner`.
 */

module.exports = Runner;

/**
 * Initialize a `Runner` for the given `suite`.
 *
 * Events:
 *
 *   - `start`  execution started
 *   - `end`  execution complete
 *   - `suite`  (suite) test suite execution started
 *   - `suite end`  (suite) all tests (and sub-suites) have finished
 *   - `test`  (test) test execution started
 *   - `test end`  (test) test completed
 *   - `hook`  (hook) hook execution started
 *   - `hook end`  (hook) hook complete
 *   - `pass`  (test) test passed
 *   - `fail`  (test, err) test failed
 *   - `pending`  (test) test pending
 *
 * @param {Suite} suite Root suite
 * @param {boolean} [delay] Whether or not to delay execution of root suite
 *   until ready.
 * @api public
 */

function Runner(suite, delay) {
  var self = this;
  this._globals = [];
  this._abort = false;
  this._delay = delay;
  this.suite = suite;
  this.total = suite.total();
  this.failures = 0;
  this.on('test end', function(test){ self.checkGlobals(test); });
  this.on('hook end', function(hook){ self.checkGlobals(hook); });
  this.grep(/.*/);
  this.globals(this.globalProps().concat(extraGlobals()));
}

/**
 * Wrapper for setImmediate, process.nextTick, or browser polyfill.
 *
 * @param {Function} fn
 * @api private
 */

Runner.immediately = global.setImmediate || process.nextTick;

/**
 * Inherit from `EventEmitter.prototype`.
 */

function F(){};
F.prototype = EventEmitter.prototype;
Runner.prototype = new F;
Runner.prototype.constructor = Runner;


/**
 * Run tests with full titles matching `re`. Updates runner.total
 * with number of tests matched.
 *
 * @param {RegExp} re
 * @param {Boolean} invert
 * @return {Runner} for chaining
 * @api public
 */

Runner.prototype.grep = function(re, invert){
  debug('grep %s', re);
  this._grep = re;
  this._invert = invert;
  this.total = this.grepTotal(this.suite);
  return this;
};

/**
 * Returns the number of tests matching the grep search for the
 * given suite.
 *
 * @param {Suite} suite
 * @return {Number}
 * @api public
 */

Runner.prototype.grepTotal = function(suite) {
  var self = this;
  var total = 0;

  suite.eachTest(function(test){
    var match = self._grep.test(test.fullTitle());
    if (self._invert) match = !match;
    if (match) total++;
  });

  return total;
};

/**
 * Return a list of global properties.
 *
 * @return {Array}
 * @api private
 */

Runner.prototype.globalProps = function() {
  var props = utils.keys(global);

  // non-enumerables
  for (var i = 0; i < globals.length; ++i) {
    if (~utils.indexOf(props, globals[i])) continue;
    props.push(globals[i]);
  }

  return props;
};

/**
 * Allow the given `arr` of globals.
 *
 * @param {Array} arr
 * @return {Runner} for chaining
 * @api public
 */

Runner.prototype.globals = function(arr){
  if (0 == arguments.length) return this._globals;
  debug('globals %j', arr);
  this._globals = this._globals.concat(arr);
  return this;
};

/**
 * Check for global variable leaks.
 *
 * @api private
 */

Runner.prototype.checkGlobals = function(test){
  if (this.ignoreLeaks) return;
  var ok = this._globals;

  var globals = this.globalProps();
  var leaks;

  if (test) {
    ok = ok.concat(test._allowedGlobals || []);
  }

  if(this.prevGlobalsLength == globals.length) return;
  this.prevGlobalsLength = globals.length;

  leaks = filterLeaks(ok, globals);
  this._globals = this._globals.concat(leaks);

  if (leaks.length > 1) {
    this.fail(test, new Error('global leaks detected: ' + leaks.join(', ') + ''));
  } else if (leaks.length) {
    this.fail(test, new Error('global leak detected: ' + leaks[0]));
  }
};

/**
 * Fail the given `test`.
 *
 * @param {Test} test
 * @param {Error} err
 * @api private
 */

Runner.prototype.fail = function(test, err) {
  ++this.failures;
  test.state = 'failed';

  if (!(err instanceof Error)) {
    err = new Error('the ' + type(err) + ' ' + stringify(err) + ' was thrown, throw an Error :)');
  }

  err.stack = (this.fullStackTrace || !err.stack)
    ? err.stack
    : stackFilter(err.stack);

  this.emit('fail', test, err);
};

/**
 * Fail the given `hook` with `err`.
 *
 * Hook failures work in the following pattern:
 * - If bail, then exit
 * - Failed `before` hook skips all tests in a suite and subsuites,
 *   but jumps to corresponding `after` hook
 * - Failed `before each` hook skips remaining tests in a
 *   suite and jumps to corresponding `after each` hook,
 *   which is run only once
 * - Failed `after` hook does not alter
 *   execution order
 * - Failed `after each` hook skips remaining tests in a
 *   suite and subsuites, but executes other `after each`
 *   hooks
 *
 * @param {Hook} hook
 * @param {Error} err
 * @api private
 */

Runner.prototype.failHook = function(hook, err){
  this.fail(hook, err);
  if (this.suite.bail()) {
    this.emit('end');
  }
};

/**
 * Run hook `name` callbacks and then invoke `fn()`.
 *
 * @param {String} name
 * @param {Function} function
 * @api private
 */

Runner.prototype.hook = function(name, fn){
  var suite = this.suite
    , hooks = suite['_' + name]
    , self = this
    , timer;

  function next(i) {
    var hook = hooks[i];
    if (!hook) return fn();
    self.currentRunnable = hook;

    hook.ctx.currentTest = self.test;

    self.emit('hook', hook);

    hook.on('error', function(err){
      self.failHook(hook, err);
    });

    hook.run(function(err){
      hook.removeAllListeners('error');
      var testError = hook.error();
      if (testError) self.fail(self.test, testError);
      if (err) {
        if (err instanceof Pending) {
          suite.pending = true;
        } else {
          self.failHook(hook, err);

          // stop executing hooks, notify callee of hook err
          return fn(err);
        }
      }
      self.emit('hook end', hook);
      delete hook.ctx.currentTest;
      next(++i);
    });
  }

  Runner.immediately(function(){
    next(0);
  });
};

/**
 * Run hook `name` for the given array of `suites`
 * in order, and callback `fn(err, errSuite)`.
 *
 * @param {String} name
 * @param {Array} suites
 * @param {Function} fn
 * @api private
 */

Runner.prototype.hooks = function(name, suites, fn){
  var self = this
    , orig = this.suite;

  function next(suite) {
    self.suite = suite;

    if (!suite) {
      self.suite = orig;
      return fn();
    }

    self.hook(name, function(err){
      if (err) {
        var errSuite = self.suite;
        self.suite = orig;
        return fn(err, errSuite);
      }

      next(suites.pop());
    });
  }

  next(suites.pop());
};

/**
 * Run hooks from the top level down.
 *
 * @param {String} name
 * @param {Function} fn
 * @api private
 */

Runner.prototype.hookUp = function(name, fn){
  var suites = [this.suite].concat(this.parents()).reverse();
  this.hooks(name, suites, fn);
};

/**
 * Run hooks from the bottom up.
 *
 * @param {String} name
 * @param {Function} fn
 * @api private
 */

Runner.prototype.hookDown = function(name, fn){
  var suites = [this.suite].concat(this.parents());
  this.hooks(name, suites, fn);
};

/**
 * Return an array of parent Suites from
 * closest to furthest.
 *
 * @return {Array}
 * @api private
 */

Runner.prototype.parents = function(){
  var suite = this.suite
    , suites = [];
  while (suite = suite.parent) suites.push(suite);
  return suites;
};

/**
 * Run the current test and callback `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Runner.prototype.runTest = function(fn){
  var test = this.test
    , self = this;

  if (this.asyncOnly) test.asyncOnly = true;

  try {
    test.on('error', function(err){
      self.fail(test, err);
    });
    test.run(fn);
  } catch (err) {
    fn(err);
  }
};

/**
 * Run tests in the given `suite` and invoke
 * the callback `fn()` when complete.
 *
 * @param {Suite} suite
 * @param {Function} fn
 * @api private
 */

Runner.prototype.runTests = function(suite, fn){
  var self = this
    , tests = suite.tests.slice()
    , test;


  function hookErr(err, errSuite, after) {
    // before/after Each hook for errSuite failed:
    var orig = self.suite;

    // for failed 'after each' hook start from errSuite parent,
    // otherwise start from errSuite itself
    self.suite = after ? errSuite.parent : errSuite;

    if (self.suite) {
      // call hookUp afterEach
      self.hookUp('afterEach', function(err2, errSuite2) {
        self.suite = orig;
        // some hooks may fail even now
        if (err2) return hookErr(err2, errSuite2, true);
        // report error suite
        fn(errSuite);
      });
    } else {
      // there is no need calling other 'after each' hooks
      self.suite = orig;
      fn(errSuite);
    }
  }

  function next(err, errSuite) {
    // if we bail after first err
    if (self.failures && suite._bail) return fn();

    if (self._abort) return fn();

    if (err) return hookErr(err, errSuite, true);

    // next test
    test = tests.shift();

    // all done
    if (!test) return fn();

    // grep
    var match = self._grep.test(test.fullTitle());
    if (self._invert) match = !match;
    if (!match) return next();

    // pending
    if (test.pending) {
      self.emit('pending', test);
      self.emit('test end', test);
      return next();
    }

    // execute test and hook(s)
    self.emit('test', self.test = test);
    self.hookDown('beforeEach', function(err, errSuite){

      if (suite.pending) {
        self.emit('pending', test);
        self.emit('test end', test);
        return next();
      }
      if (err) return hookErr(err, errSuite, false);

      self.currentRunnable = self.test;
      self.runTest(function(err){
        test = self.test;

        if (err) {
          if (err instanceof Pending) {
            self.emit('pending', test);
          } else {
            self.fail(test, err);
          }
          self.emit('test end', test);

          if (err instanceof Pending) {
            return next();
          }

          return self.hookUp('afterEach', next);
        }

        test.state = 'passed';
        self.emit('pass', test);
        self.emit('test end', test);
        self.hookUp('afterEach', next);
      });
    });
  }

  this.next = next;
  next();
};

/**
 * Run the given `suite` and invoke the
 * callback `fn()` when complete.
 *
 * @param {Suite} suite
 * @param {Function} fn
 * @api private
 */

Runner.prototype.runSuite = function(suite, fn){
  var total = this.grepTotal(suite)
    , self = this
    , i = 0;

  debug('run suite %s', suite.fullTitle());

  if (!total) return fn();

  this.emit('suite', this.suite = suite);

  function next(errSuite) {
    if (errSuite) {
      // current suite failed on a hook from errSuite
      if (errSuite == suite) {
        // if errSuite is current suite
        // continue to the next sibling suite
        return done();
      } else {
        // errSuite is among the parents of current suite
        // stop execution of errSuite and all sub-suites
        return done(errSuite);
      }
    }

    if (self._abort) return done();

    var curr = suite.suites[i++];
    if (!curr) return done();
    self.runSuite(curr, next);
  }

  function done(errSuite) {
    self.suite = suite;
    self.hook('afterAll', function(){
      self.emit('suite end', suite);
      fn(errSuite);
    });
  }

  this.hook('beforeAll', function(err){
    if (err) return done();
    self.runTests(suite, next);
  });
};

/**
 * Handle uncaught exceptions.
 *
 * @param {Error} err
 * @api private
 */

Runner.prototype.uncaught = function(err){
  if (err) {
    debug('uncaught exception %s', err !== function () {
      return this;
    }.call(err) ? err : ( err.message || err ));
  } else {
    debug('uncaught undefined exception');
    err = utils.undefinedError();
  }
  err.uncaught = true;

  var runnable = this.currentRunnable;
  if (!runnable) return;

  runnable.clearTimeout();

  // Ignore errors if complete
  if (runnable.state) return;
  this.fail(runnable, err);

  // recover from test
  if ('test' == runnable.type) {
    this.emit('test end', runnable);
    this.hookUp('afterEach', this.next);
    return;
  }

  // bail on hooks
  this.emit('end');
};

/**
 * Run the root suite and invoke `fn(failures)`
 * on completion.
 *
 * @param {Function} fn
 * @return {Runner} for chaining
 * @api public
 */

Runner.prototype.run = function(fn){
  var self = this,
    rootSuite = this.suite;

  fn = fn || function(){};

  function uncaught(err){
    self.uncaught(err);
  }

  function start() {
    self.emit('start');
    self.runSuite(rootSuite, function(){
      debug('finished running');
      self.emit('end');
    });
  }

  debug('start');

  // callback
  this.on('end', function(){
    debug('end');
    process.removeListener('uncaughtException', uncaught);
    fn(self.failures);
  });

  // uncaught exception
  process.on('uncaughtException', uncaught);

  if (this._delay) {
    // for reporters, I guess.
    // might be nice to debounce some dots while we wait.
    this.emit('waiting', rootSuite);
    rootSuite.once('run', start);
  }
  else {
    start();
  }

  return this;
};

/**
 * Cleanly abort execution
 *
 * @return {Runner} for chaining
 * @api public
 */
Runner.prototype.abort = function(){
  debug('aborting');
  this._abort = true;
};

/**
 * Filter leaks with the given globals flagged as `ok`.
 *
 * @param {Array} ok
 * @param {Array} globals
 * @return {Array}
 * @api private
 */

function filterLeaks(ok, globals) {
  return filter(globals, function(key){
    // Firefox and Chrome exposes iframes as index inside the window object
    if (/^d+/.test(key)) return false;

    // in firefox
    // if runner runs in an iframe, this iframe's window.getInterface method not init at first
    // it is assigned in some seconds
    if (global.navigator && /^getInterface/.test(key)) return false;

    // an iframe could be approached by window[iframeIndex]
    // in ie6,7,8 and opera, iframeIndex is enumerable, this could cause leak
    if (global.navigator && /^\d+/.test(key)) return false;

    // Opera and IE expose global variables for HTML element IDs (issue #243)
    if (/^mocha-/.test(key)) return false;

    var matched = filter(ok, function(ok){
      if (~ok.indexOf('*')) return 0 == key.indexOf(ok.split('*')[0]);
      return key == ok;
    });
    return matched.length == 0 && (!global.navigator || 'onerror' !== key);
  });
}

/**
 * Array of globals dependent on the environment.
 *
 * @return {Array}
 * @api private
 */

function extraGlobals() {
 if (typeof(process) === 'object' &&
     typeof(process.version) === 'string') {

   var nodeVersion = process.version.split('.').reduce(function(a, v) {
     return a << 8 | v;
   });

   // 'errno' was renamed to process._errno in v0.9.11.

   if (nodeVersion < 0x00090B) {
     return ['errno'];
   }
 }

 return [];
}

}); // module: runner.js

require.register("suite.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var EventEmitter = require('browser/events').EventEmitter
  , debug = require('browser/debug')('mocha:suite')
  , milliseconds = require('./ms')
  , utils = require('./utils')
  , Hook = require('./hook');

/**
 * Expose `Suite`.
 */

exports = module.exports = Suite;

/**
 * Create a new `Suite` with the given `title`
 * and parent `Suite`. When a suite with the
 * same title is already present, that suite
 * is returned to provide nicer reporter
 * and more flexible meta-testing.
 *
 * @param {Suite} parent
 * @param {String} title
 * @return {Suite}
 * @api public
 */

exports.create = function(parent, title){
  var suite = new Suite(title, parent.ctx);
  suite.parent = parent;
  if (parent.pending) suite.pending = true;
  title = suite.fullTitle();
  parent.addSuite(suite);
  return suite;
};

/**
 * Initialize a new `Suite` with the given
 * `title` and `ctx`.
 *
 * @param {String} title
 * @param {Context} ctx
 * @api private
 */

function Suite(title, parentContext) {
  this.title = title;
  var context = function() {};
  context.prototype = parentContext;
  this.ctx = new context();
  this.suites = [];
  this.tests = [];
  this.pending = false;
  this._beforeEach = [];
  this._beforeAll = [];
  this._afterEach = [];
  this._afterAll = [];
  this.root = !title;
  this._timeout = 2000;
  this._enableTimeouts = true;
  this._slow = 75;
  this._bail = false;
  this.delayed = false;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

function F(){};
F.prototype = EventEmitter.prototype;
Suite.prototype = new F;
Suite.prototype.constructor = Suite;


/**
 * Return a clone of this `Suite`.
 *
 * @return {Suite}
 * @api private
 */

Suite.prototype.clone = function(){
  var suite = new Suite(this.title);
  debug('clone');
  suite.ctx = this.ctx;
  suite.timeout(this.timeout());
  suite.enableTimeouts(this.enableTimeouts());
  suite.slow(this.slow());
  suite.bail(this.bail());
  return suite;
};

/**
 * Set timeout `ms` or short-hand such as "2s".
 *
 * @param {Number|String} ms
 * @return {Suite|Number} for chaining
 * @api private
 */

Suite.prototype.timeout = function(ms){
  if (0 == arguments.length) return this._timeout;
  if (ms.toString() === '0') this._enableTimeouts = false;
  if ('string' == typeof ms) ms = milliseconds(ms);
  debug('timeout %d', ms);
  this._timeout = parseInt(ms, 10);
  return this;
};

/**
  * Set timeout `enabled`.
  *
  * @param {Boolean} enabled
  * @return {Suite|Boolean} self or enabled
  * @api private
  */

Suite.prototype.enableTimeouts = function(enabled){
  if (arguments.length === 0) return this._enableTimeouts;
  debug('enableTimeouts %s', enabled);
  this._enableTimeouts = enabled;
  return this;
};

/**
 * Set slow `ms` or short-hand such as "2s".
 *
 * @param {Number|String} ms
 * @return {Suite|Number} for chaining
 * @api private
 */

Suite.prototype.slow = function(ms){
  if (0 === arguments.length) return this._slow;
  if ('string' == typeof ms) ms = milliseconds(ms);
  debug('slow %d', ms);
  this._slow = ms;
  return this;
};

/**
 * Sets whether to bail after first error.
 *
 * @param {Boolean} bail
 * @return {Suite|Number} for chaining
 * @api private
 */

Suite.prototype.bail = function(bail){
  if (0 == arguments.length) return this._bail;
  debug('bail %s', bail);
  this._bail = bail;
  return this;
};

/**
 * Run `fn(test[, done])` before running tests.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.beforeAll = function(title, fn){
  if (this.pending) return this;
  if ('function' === typeof title) {
    fn = title;
    title = fn.name;
  }
  title = '"before all" hook' + (title ? ': ' + title : '');

  var hook = new Hook(title, fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.enableTimeouts(this.enableTimeouts());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._beforeAll.push(hook);
  this.emit('beforeAll', hook);
  return this;
};

/**
 * Run `fn(test[, done])` after running tests.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.afterAll = function(title, fn){
  if (this.pending) return this;
  if ('function' === typeof title) {
    fn = title;
    title = fn.name;
  }
  title = '"after all" hook' + (title ? ': ' + title : '');

  var hook = new Hook(title, fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.enableTimeouts(this.enableTimeouts());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._afterAll.push(hook);
  this.emit('afterAll', hook);
  return this;
};

/**
 * Run `fn(test[, done])` before each test case.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.beforeEach = function(title, fn){
  if (this.pending) return this;
  if ('function' === typeof title) {
    fn = title;
    title = fn.name;
  }
  title = '"before each" hook' + (title ? ': ' + title : '');

  var hook = new Hook(title, fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.enableTimeouts(this.enableTimeouts());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._beforeEach.push(hook);
  this.emit('beforeEach', hook);
  return this;
};

/**
 * Run `fn(test[, done])` after each test case.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.afterEach = function(title, fn){
  if (this.pending) return this;
  if ('function' === typeof title) {
    fn = title;
    title = fn.name;
  }
  title = '"after each" hook' + (title ? ': ' + title : '');

  var hook = new Hook(title, fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.enableTimeouts(this.enableTimeouts());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._afterEach.push(hook);
  this.emit('afterEach', hook);
  return this;
};

/**
 * Add a test `suite`.
 *
 * @param {Suite} suite
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.addSuite = function(suite){
  suite.parent = this;
  suite.timeout(this.timeout());
  suite.enableTimeouts(this.enableTimeouts());
  suite.slow(this.slow());
  suite.bail(this.bail());
  this.suites.push(suite);
  this.emit('suite', suite);
  return this;
};

/**
 * Add a `test` to this suite.
 *
 * @param {Test} test
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.addTest = function(test){
  test.parent = this;
  test.timeout(this.timeout());
  test.enableTimeouts(this.enableTimeouts());
  test.slow(this.slow());
  test.ctx = this.ctx;
  this.tests.push(test);
  this.emit('test', test);
  return this;
};

/**
 * Return the full title generated by recursively
 * concatenating the parent's full title.
 *
 * @return {String}
 * @api public
 */

Suite.prototype.fullTitle = function(){
  if (this.parent) {
    var full = this.parent.fullTitle();
    if (full) return full + ' ' + this.title;
  }
  return this.title;
};

/**
 * Return the total number of tests.
 *
 * @return {Number}
 * @api public
 */

Suite.prototype.total = function(){
  return utils.reduce(this.suites, function(sum, suite){
    return sum + suite.total();
  }, 0) + this.tests.length;
};

/**
 * Iterates through each suite recursively to find
 * all tests. Applies a function in the format
 * `fn(test)`.
 *
 * @param {Function} fn
 * @return {Suite}
 * @api private
 */

Suite.prototype.eachTest = function(fn){
  utils.forEach(this.tests, fn);
  utils.forEach(this.suites, function(suite){
    suite.eachTest(fn);
  });
  return this;
};

/**
 * This will run the root suite if we happen to be running in delayed mode.
 */
Suite.prototype.run = function run() {
  if (this.root) {
    this.emit('run');
  }
};

}); // module: suite.js

require.register("test.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Runnable = require('./runnable');

/**
 * Expose `Test`.
 */

module.exports = Test;

/**
 * Initialize a new `Test` with the given `title` and callback `fn`.
 *
 * @param {String} title
 * @param {Function} fn
 * @api private
 */

function Test(title, fn) {
  Runnable.call(this, title, fn);
  this.pending = !fn;
  this.type = 'test';
}

/**
 * Inherit from `Runnable.prototype`.
 */

function F(){};
F.prototype = Runnable.prototype;
Test.prototype = new F;
Test.prototype.constructor = Test;


}); // module: test.js

require.register("utils.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var fs = require('browser/fs')
  , path = require('browser/path')
  , basename = path.basename
  , exists = fs.existsSync || path.existsSync
  , glob = require('browser/glob')
  , join = path.join
  , debug = require('browser/debug')('mocha:watch');

/**
 * Ignored directories.
 */

var ignore = ['node_modules', '.git'];

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Array#forEach (<=IE8)
 *
 * @param {Array} array
 * @param {Function} fn
 * @param {Object} scope
 * @api private
 */

exports.forEach = function(arr, fn, scope){
  for (var i = 0, l = arr.length; i < l; i++)
    fn.call(scope, arr[i], i);
};

/**
 * Array#map (<=IE8)
 *
 * @param {Array} array
 * @param {Function} fn
 * @param {Object} scope
 * @api private
 */

exports.map = function(arr, fn, scope){
  var result = [];
  for (var i = 0, l = arr.length; i < l; i++)
    result.push(fn.call(scope, arr[i], i, arr));
  return result;
};

/**
 * Array#indexOf (<=IE8)
 *
 * @parma {Array} arr
 * @param {Object} obj to find index of
 * @param {Number} start
 * @api private
 */

exports.indexOf = function(arr, obj, start){
  for (var i = start || 0, l = arr.length; i < l; i++) {
    if (arr[i] === obj)
      return i;
  }
  return -1;
};

/**
 * Array#reduce (<=IE8)
 *
 * @param {Array} array
 * @param {Function} fn
 * @param {Object} initial value
 * @api private
 */

exports.reduce = function(arr, fn, val){
  var rval = val;

  for (var i = 0, l = arr.length; i < l; i++) {
    rval = fn(rval, arr[i], i, arr);
  }

  return rval;
};

/**
 * Array#filter (<=IE8)
 *
 * @param {Array} array
 * @param {Function} fn
 * @api private
 */

exports.filter = function(arr, fn){
  var ret = [];

  for (var i = 0, l = arr.length; i < l; i++) {
    var val = arr[i];
    if (fn(val, i, arr)) ret.push(val);
  }

  return ret;
};

/**
 * Object.keys (<=IE8)
 *
 * @param {Object} obj
 * @return {Array} keys
 * @api private
 */

exports.keys = Object.keys || function(obj) {
  var keys = []
    , has = Object.prototype.hasOwnProperty; // for `window` on <=IE8

  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }

  return keys;
};

/**
 * Watch the given `files` for changes
 * and invoke `fn(file)` on modification.
 *
 * @param {Array} files
 * @param {Function} fn
 * @api private
 */

exports.watch = function(files, fn){
  var options = { interval: 100 };
  files.forEach(function(file){
    debug('file %s', file);
    fs.watchFile(file, options, function(curr, prev){
      if (prev.mtime < curr.mtime) fn(file);
    });
  });
};

/**
 * Array.isArray (<=IE8)
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
var isArray = Array.isArray || function (obj) {
  return '[object Array]' == {}.toString.call(obj);
};

/**
 * @description
 * Buffer.prototype.toJSON polyfill
 * @type {Function}
 */
if(typeof Buffer !== 'undefined' && Buffer.prototype) {
  Buffer.prototype.toJSON = Buffer.prototype.toJSON || function () {
    return Array.prototype.slice.call(this, 0);
  };
}

/**
 * Ignored files.
 */

function ignored(path){
  return !~ignore.indexOf(path);
}

/**
 * Lookup files in the given `dir`.
 *
 * @return {Array}
 * @api private
 */

exports.files = function(dir, ext, ret){
  ret = ret || [];
  ext = ext || ['js'];

  var re = new RegExp('\\.(' + ext.join('|') + ')$');

  fs.readdirSync(dir)
    .filter(ignored)
    .forEach(function(path){
      path = join(dir, path);
      if (fs.statSync(path).isDirectory()) {
        exports.files(path, ext, ret);
      } else if (path.match(re)) {
        ret.push(path);
      }
    });

  return ret;
};

/**
 * Compute a slug from the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.slug = function(str){
  return str
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[^-\w]/g, '');
};

/**
 * Strip the function definition from `str`,
 * and re-indent for pre whitespace.
 */

exports.clean = function(str) {
  str = str
    .replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, '')
    .replace(/^function *\(.*\)\s*{|\(.*\) *=> *{?/, '')
    .replace(/\s+\}$/, '');

  var spaces = str.match(/^\n?( *)/)[1].length
    , tabs = str.match(/^\n?(\t*)/)[1].length
    , re = new RegExp('^\n?' + (tabs ? '\t' : ' ') + '{' + (tabs ? tabs : spaces) + '}', 'gm');

  str = str.replace(re, '');

  return exports.trim(str);
};

/**
 * Trim the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.trim = function(str){
  return str.replace(/^\s+|\s+$/g, '');
};

/**
 * Parse the given `qs`.
 *
 * @param {String} qs
 * @return {Object}
 * @api private
 */

exports.parseQuery = function(qs){
  return exports.reduce(qs.replace('?', '').split('&'), function(obj, pair){
    var i = pair.indexOf('=')
      , key = pair.slice(0, i)
      , val = pair.slice(++i);

    obj[key] = decodeURIComponent(val);
    return obj;
  }, {});
};

/**
 * Highlight the given string of `js`.
 *
 * @param {String} js
 * @return {String}
 * @api private
 */

function highlight(js) {
  return js
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\/\/(.*)/gm, '<span class="comment">//$1</span>')
    .replace(/('.*?')/gm, '<span class="string">$1</span>')
    .replace(/(\d+\.\d+)/gm, '<span class="number">$1</span>')
    .replace(/(\d+)/gm, '<span class="number">$1</span>')
    .replace(/\bnew[ \t]+(\w+)/gm, '<span class="keyword">new</span> <span class="init">$1</span>')
    .replace(/\b(function|new|throw|return|var|if|else)\b/gm, '<span class="keyword">$1</span>')
}

/**
 * Highlight the contents of tag `name`.
 *
 * @param {String} name
 * @api private
 */

exports.highlightTags = function(name) {
  var code = document.getElementById('mocha').getElementsByTagName(name);
  for (var i = 0, len = code.length; i < len; ++i) {
    code[i].innerHTML = highlight(code[i].innerHTML);
  }
};

/**
 * If a value could have properties, and has none, this function is called, which returns
 * a string representation of the empty value.
 *
 * Functions w/ no properties return `'[Function]'`
 * Arrays w/ length === 0 return `'[]'`
 * Objects w/ no properties return `'{}'`
 * All else: return result of `value.toString()`
 *
 * @param {*} value Value to inspect
 * @param {string} [type] The type of the value, if known.
 * @returns {string}
 */
var emptyRepresentation = function emptyRepresentation(value, type) {
  type = type || exports.type(value);

  switch(type) {
    case 'function':
      return '[Function]';
    case 'object':
      return '{}';
    case 'array':
      return '[]';
    default:
      return value.toString();
  }
};

/**
 * Takes some variable and asks `{}.toString()` what it thinks it is.
 * @param {*} value Anything
 * @example
 * type({}) // 'object'
 * type([]) // 'array'
 * type(1) // 'number'
 * type(false) // 'boolean'
 * type(Infinity) // 'number'
 * type(null) // 'null'
 * type(new Date()) // 'date'
 * type(/foo/) // 'regexp'
 * type('type') // 'string'
 * type(global) // 'global'
 * @api private
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
 * @returns {string}
 */
exports.type = function type(value) {
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    return 'buffer';
  }
  return Object.prototype.toString.call(value)
    .replace(/^\[.+\s(.+?)\]$/, '$1')
    .toLowerCase();
};

/**
 * @summary Stringify `value`.
 * @description Different behavior depending on type of value.
 * - If `value` is undefined or null, return `'[undefined]'` or `'[null]'`, respectively.
 * - If `value` is not an object, function or array, return result of `value.toString()` wrapped in double-quotes.
 * - If `value` is an *empty* object, function, or array, return result of function
 *   {@link emptyRepresentation}.
 * - If `value` has properties, call {@link exports.canonicalize} on it, then return result of
 *   JSON.stringify().
 *
 * @see exports.type
 * @param {*} value
 * @return {string}
 * @api private
 */

exports.stringify = function(value) {
  var type = exports.type(value);

  if (!~exports.indexOf(['object', 'array', 'function'], type)) {
    if(type != 'buffer') {
      return jsonStringify(value);
    }
    var json = value.toJSON();
    // Based on the toJSON result
    return jsonStringify(json.data && json.type ? json.data : json, 2)
      .replace(/,(\n|$)/g, '$1');
  }

  for (var prop in value) {
    if (Object.prototype.hasOwnProperty.call(value, prop)) {
      return jsonStringify(exports.canonicalize(value), 2).replace(/,(\n|$)/g, '$1');
    }
  }

  return emptyRepresentation(value, type);
};

/**
 * @description
 * like JSON.stringify but more sense.
 * @param {Object}  object
 * @param {Number=} spaces
 * @param {number=} depth
 * @returns {*}
 * @private
 */
function jsonStringify(object, spaces, depth) {
  if(typeof spaces == 'undefined') return _stringify(object);  // primitive types

  depth = depth || 1;
  var space = spaces * depth
    , str = isArray(object) ? '[' : '{'
    , end = isArray(object) ? ']' : '}'
    , length = object.length || exports.keys(object).length
    , repeat = function(s, n) { return new Array(n).join(s); }; // `.repeat()` polyfill

  function _stringify(val) {
    switch (exports.type(val)) {
      case 'null':
      case 'undefined':
        val = '[' + val + ']';
        break;
      case 'array':
      case 'object':
        val = jsonStringify(val, spaces, depth + 1);
        break;
      case 'boolean':
      case 'regexp':
      case 'number':
        val = val === 0 && (1/val) === -Infinity // `-0`
          ? '-0'
          : val.toString();
        break;
      case 'date':
        val = '[Date: ' + val.toISOString() + ']';
        break;
      case 'buffer':
        var json = val.toJSON();
        // Based on the toJSON result
        json = json.data && json.type ? json.data : json;
        val = '[Buffer: ' + jsonStringify(json, 2, depth + 1) + ']';
        break;
      default:
        val = (val == '[Function]' || val == '[Circular]')
          ? val
          : '"' + val + '"'; //string
    }
    return val;
  }

  for(var i in object) {
    if(!object.hasOwnProperty(i)) continue;        // not my business
    --length;
    str += '\n ' + repeat(' ', space)
      + (isArray(object) ? '' : '"' + i + '": ') // key
      +  _stringify(object[i])                   // value
      + (length ? ',' : '');                     // comma
  }

  return str + (str.length != 1                    // [], {}
    ? '\n' + repeat(' ', --space) + end
    : end);
}

/**
 * Return if obj is a Buffer
 * @param {Object} arg
 * @return {Boolean}
 * @api private
 */
exports.isBuffer = function (arg) {
  return typeof Buffer !== 'undefined' && Buffer.isBuffer(arg);
};

/**
 * @summary Return a new Thing that has the keys in sorted order.  Recursive.
 * @description If the Thing...
 * - has already been seen, return string `'[Circular]'`
 * - is `undefined`, return string `'[undefined]'`
 * - is `null`, return value `null`
 * - is some other primitive, return the value
 * - is not a primitive or an `Array`, `Object`, or `Function`, return the value of the Thing's `toString()` method
 * - is a non-empty `Array`, `Object`, or `Function`, return the result of calling this function again.
 * - is an empty `Array`, `Object`, or `Function`, return the result of calling `emptyRepresentation()`
 *
 * @param {*} value Thing to inspect.  May or may not have properties.
 * @param {Array} [stack=[]] Stack of seen values
 * @return {(Object|Array|Function|string|undefined)}
 * @see {@link exports.stringify}
 * @api private
 */

exports.canonicalize = function(value, stack) {
  var canonicalizedObj,
    type = exports.type(value),
    prop,
    withStack = function withStack(value, fn) {
      stack.push(value);
      fn();
      stack.pop();
    };

  stack = stack || [];

  if (exports.indexOf(stack, value) !== -1) {
    return '[Circular]';
  }

  switch(type) {
    case 'undefined':
    case 'buffer':
    case 'null':
      canonicalizedObj = value;
      break;
    case 'array':
      withStack(value, function () {
        canonicalizedObj = exports.map(value, function (item) {
          return exports.canonicalize(item, stack);
        });
      });
      break;
    case 'function':
      for (prop in value) {
        canonicalizedObj = {};
        break;
      }
      if (!canonicalizedObj) {
        canonicalizedObj = emptyRepresentation(value, type);
        break;
      }
    /* falls through */
    case 'object':
      canonicalizedObj = canonicalizedObj || {};
      withStack(value, function () {
        exports.forEach(exports.keys(value).sort(), function (key) {
          canonicalizedObj[key] = exports.canonicalize(value[key], stack);
        });
      });
      break;
    case 'date':
    case 'number':
    case 'regexp':
    case 'boolean':
      canonicalizedObj = value;
      break;
    default:
      canonicalizedObj = value.toString();
  }

  return canonicalizedObj;
};

/**
 * Lookup file names at the given `path`.
 */
exports.lookupFiles = function lookupFiles(path, extensions, recursive) {
  var files = [];
  var re = new RegExp('\\.(' + extensions.join('|') + ')$');

  if (!exists(path)) {
    if (exists(path + '.js')) {
      path += '.js';
    } else {
      files = glob.sync(path);
      if (!files.length) throw new Error("cannot resolve path (or pattern) '" + path + "'");
      return files;
    }
  }

  try {
    var stat = fs.statSync(path);
    if (stat.isFile()) return path;
  }
  catch (ignored) {
    return;
  }

  fs.readdirSync(path).forEach(function(file) {
    file = join(path, file);
    try {
      var stat = fs.statSync(file);
      if (stat.isDirectory()) {
        if (recursive) {
          files = files.concat(lookupFiles(file, extensions, recursive));
        }
        return;
      }
    }
    catch (ignored) {
      return;
    }
    if (!stat.isFile() || !re.test(file) || basename(file)[0] === '.') return;
    files.push(file);
  });

  return files;
};

/**
 * Generate an undefined error with a message warning the user.
 *
 * @return {Error}
 */

exports.undefinedError = function() {
  return new Error('Caught undefined error, did you throw without specifying what?');
};

/**
 * Generate an undefined error if `err` is not defined.
 *
 * @param {Error} err
 * @return {Error}
 */

exports.getError = function(err) {
  return err || exports.undefinedError();
};


/**
 * @summary
 * This Filter based on `mocha-clean` module.(see: `github.com/rstacruz/mocha-clean`)
 * @description
 * When invoking this function you get a filter function that get the Error.stack as an input,
 * and return a prettify output.
 * (i.e: strip Mocha, node_modules, bower and componentJS from stack trace).
 * @returns {Function}
 */

exports.stackTraceFilter = function() {
  var slash = '/'
    , is = typeof document === 'undefined'
      ? { node: true }
      : { browser: true }
    , cwd = is.node
      ? process.cwd() + slash
      : location.href.replace(/\/[^\/]*$/, '/');

  function isNodeModule (line) {
    return (~line.indexOf('node_modules'));
  }

  function isMochaInternal (line) {
    return (~line.indexOf('node_modules' + slash + 'mocha'))  ||
      (~line.indexOf('components' + slash + 'mochajs'))       ||
      (~line.indexOf('components' + slash + 'mocha'));
  }

  // node_modules, bower, componentJS
  function isBrowserModule(line) {
    return (~line.indexOf('node_modules')) ||
      (~line.indexOf('components'));
  }

  function isNodeInternal (line) {
    return (~line.indexOf('(timers.js:')) ||
      (~line.indexOf('(events.js:'))      ||
      (~line.indexOf('(node.js:'))        ||
      (~line.indexOf('(module.js:'))      ||
      (~line.indexOf('GeneratorFunctionPrototype.next (native)')) ||
      false
  }

  return function(stack) {
    stack = stack.split('\n');

    stack = exports.reduce(stack, function(list, line) {
      if (is.node && (isNodeModule(line) ||
        isMochaInternal(line) ||
        isNodeInternal(line)))
        return list;

      if (is.browser && (isBrowserModule(line)))
        return list;

      // Clean up cwd(absolute)
      list.push(line.replace(cwd, ''));
      return list;
    }, []);

    return stack.join('\n');
  }
};
}); // module: utils.js
// The global object is "self" in Web Workers.
var global = (function() { return this; })();

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date;
var setTimeout = global.setTimeout;
var setInterval = global.setInterval;
var clearTimeout = global.clearTimeout;
var clearInterval = global.clearInterval;

/**
 * Node shims.
 *
 * These are meant only to allow
 * mocha.js to run untouched, not
 * to allow running node code in
 * the browser.
 */

var process = {};
process.exit = function(status){};
process.stdout = {};

var uncaughtExceptionHandlers = [];

var originalOnerrorHandler = global.onerror;

/**
 * Remove uncaughtException listener.
 * Revert to original onerror handler if previously defined.
 */

process.removeListener = function(e, fn){
  if ('uncaughtException' == e) {
    if (originalOnerrorHandler) {
      global.onerror = originalOnerrorHandler;
    } else {
      global.onerror = function() {};
    }
    var i = Mocha.utils.indexOf(uncaughtExceptionHandlers, fn);
    if (i != -1) { uncaughtExceptionHandlers.splice(i, 1); }
  }
};

/**
 * Implements uncaughtException listener.
 */

process.on = function(e, fn){
  if ('uncaughtException' == e) {
    global.onerror = function(err, url, line){
      fn(new Error(err + ' (' + url + ':' + line + ')'));
      return true;
    };
    uncaughtExceptionHandlers.push(fn);
  }
};

/**
 * Expose mocha.
 */

var Mocha = global.Mocha = require('mocha'),
    mocha = global.mocha = new Mocha({ reporter: 'html' });

// The BDD UI is registered by default, but no UI will be functional in the
// browser without an explicit call to the overridden `mocha.ui` (see below).
// Ensure that this default UI does not expose its methods to the global scope.
mocha.suite.removeAllListeners('pre-require');

var immediateQueue = []
  , immediateTimeout;

function timeslice() {
  var immediateStart = new Date().getTime();
  while (immediateQueue.length && (new Date().getTime() - immediateStart) < 100) {
    immediateQueue.shift()();
  }
  if (immediateQueue.length) {
    immediateTimeout = setTimeout(timeslice, 0);
  } else {
    immediateTimeout = null;
  }
}

/**
 * High-performance override of Runner.immediately.
 */

Mocha.Runner.immediately = function(callback) {
  immediateQueue.push(callback);
  if (!immediateTimeout) {
    immediateTimeout = setTimeout(timeslice, 0);
  }
};

/**
 * Function to allow assertion libraries to throw errors directly into mocha.
 * This is useful when running tests in a browser because window.onerror will
 * only receive the 'message' attribute of the Error.
 */
mocha.throwError = function(err) {
  Mocha.utils.forEach(uncaughtExceptionHandlers, function (fn) {
    fn(err);
  });
  throw err;
};

/**
 * Override ui to ensure that the ui functions are initialized.
 * Normally this would happen in Mocha.prototype.loadFiles.
 */

mocha.ui = function(ui){
  Mocha.prototype.ui.call(this, ui);
  this.suite.emit('pre-require', global, null, this);
  return this;
};

/**
 * Setup mocha with the given setting options.
 */

mocha.setup = function(opts){
  if ('string' == typeof opts) opts = { ui: opts };
  for (var opt in opts) this[opt](opts[opt]);
  return this;
};

/**
 * Run mocha, returning the Runner.
 */

mocha.run = function(fn){
  var options = mocha.options;
  mocha.globals('location');

  var query = Mocha.utils.parseQuery(global.location.search || '');
  if (query.grep) mocha.grep(new RegExp(query.grep));
  if (query.fgrep) mocha.grep(query.fgrep);
  if (query.invert) mocha.invert();

  return Mocha.prototype.run.call(mocha, function(err){
    // The DOM Document is not available in Web Workers.
    var document = global.document;
    if (document && document.getElementById('mocha') && options.noHighlighting !== true) {
      Mocha.utils.highlightTags('code');
    }
    if (fn) fn(err);
  });
};

/**
 * Expose the process shim.
 */

Mocha.process = process;
})();


;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */

require.loader = 'component';

/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */
require.helper = {};
require.helper.semVerSort = function(a, b) {
  var aArray = a.version.split('.');
  var bArray = b.version.split('.');
  for (var i=0; i<aArray.length; ++i) {
    var aInt = parseInt(aArray[i], 10);
    var bInt = parseInt(bArray[i], 10);
    if (aInt === bInt) {
      var aLex = aArray[i].substr((""+aInt).length);
      var bLex = bArray[i].substr((""+bInt).length);
      if (aLex === '' && bLex !== '') return 1;
      if (aLex !== '' && bLex === '') return -1;
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
      continue;
    } else if (aInt > bInt) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used. 
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true, 
 *                               otherwise it returns the epxorted module
 */
require.latest = function (name, returnPath) {
  function showError(name) {
    throw new Error('failed to find latest module of "' + name + '"');
  }
  // only remotes with semvers, ignore local files conataining a '/'
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
  var remoteRegexp = /(.*)~(.*)/;
  if (!remoteRegexp.test(name)) showError(name);
  var moduleNames = Object.keys(require.modules);
  var semVerCandidates = [];
  var otherCandidates = []; // for instance: name of the git branch
  for (var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length+1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({version: version, name: moduleName});
        } else {
          otherCandidates.push({version: version, name: moduleName});
        } 
    }
  }
  if (semVerCandidates.concat(otherCandidates).length === 0) {
    showError(name);
  }
  if (semVerCandidates.length > 0) {
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  }
  // if the build contains more than one branch of the same module
  // you should not use this funciton
  var module = otherCandidates.sort(function(a, b) {return a.name > b.name})[0].name;
  if (returnPath === true) {
    return module;
  }
  return require(module);
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("chaijs~assertion-error@1.0.0", function (exports, module) {
/*!
 * assertion-error
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

function exclude () {
  var excludes = [].slice.call(arguments);

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key];
    });
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
      , i = 0
      , res = {};

    for (; i < args.length; i++) {
      excludeProps(res, args[i]);
    }

    return res;
  };
};

/*!
 * Primary Exports
 */

module.exports = AssertionError;

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
    , props = extend(_props || {});

  // default values
  this.message = message || 'Unspecified AssertionError';
  this.showDiff = false;

  // copy from properties
  for (var key in props) {
    this[key] = props[key];
  }

  // capture stack trace
  ssf = ssf || arguments.callee;
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  }
}

/*!
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype);

/*!
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError';

/*!
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError;

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
    , props = extend({ name: this.name }, this);

  // include stack if exists and not turned off
  if (false !== stack && this.stack) {
    props.stack = this.stack;
  }

  return props;
};

});

require.register("chaijs~type-detect@0.1.1", function (exports, module) {
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Array]': 'array'
  , '[object RegExp]': 'regexp'
  , '[object Function]': 'function'
  , '[object Arguments]': 'arguments'
  , '[object Date]': 'date'
};

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */

function getType (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library () {
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function (type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function (obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

});

require.register("chaijs~deep-eql@0.1.3", function (exports, module) {
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var type = require('chaijs~type-detect@0.1.1');

/*!
 * Buffer.isBuffer browser shim
 */

var Buffer;
try { Buffer = require('buffer').Buffer; }
catch(ex) {
  Buffer = {};
  Buffer.isBuffer = function() { return false; }
}

/*!
 * Primary Export
 */

module.exports = deepEqual;

/**
 * Assert super-strict (egal) equality between
 * two objects of any type.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @param {Array} memoised (optional)
 * @return {Boolean} equal match
 */

function deepEqual(a, b, m) {
  if (sameValue(a, b)) {
    return true;
  } else if ('date' === type(a)) {
    return dateEqual(a, b);
  } else if ('regexp' === type(a)) {
    return regexpEqual(a, b);
  } else if (Buffer.isBuffer(a)) {
    return bufferEqual(a, b);
  } else if ('arguments' === type(a)) {
    return argumentsEqual(a, b, m);
  } else if (!typeEqual(a, b)) {
    return false;
  } else if (('object' !== type(a) && 'object' !== type(b))
  && ('array' !== type(a) && 'array' !== type(b))) {
    return sameValue(a, b);
  } else {
    return objectEqual(a, b, m);
  }
}

/*!
 * Strict (egal) equality test. Ensures that NaN always
 * equals NaN and `-0` does not equal `+0`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} equal match
 */

function sameValue(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  return a !== a && b !== b;
}

/*!
 * Compare the types of two given objects and
 * return if they are equal. Note that an Array
 * has a type of `array` (not `object`) and arguments
 * have a type of `arguments` (not `array`/`object`).
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function typeEqual(a, b) {
  return type(a) === type(b);
}

/*!
 * Compare two Date objects by asserting that
 * the time values are equal using `saveValue`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean} result
 */

function dateEqual(a, b) {
  if ('date' !== type(b)) return false;
  return sameValue(a.getTime(), b.getTime());
}

/*!
 * Compare two regular expressions by converting them
 * to string and checking for `sameValue`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean} result
 */

function regexpEqual(a, b) {
  if ('regexp' !== type(b)) return false;
  return sameValue(a.toString(), b.toString());
}

/*!
 * Assert deep equality of two `arguments` objects.
 * Unfortunately, these must be sliced to arrays
 * prior to test to ensure no bad behavior.
 *
 * @param {Arguments} a
 * @param {Arguments} b
 * @param {Array} memoize (optional)
 * @return {Boolean} result
 */

function argumentsEqual(a, b, m) {
  if ('arguments' !== type(b)) return false;
  a = [].slice.call(a);
  b = [].slice.call(b);
  return deepEqual(a, b, m);
}

/*!
 * Get enumerable properties of a given object.
 *
 * @param {Object} a
 * @return {Array} property names
 */

function enumerable(a) {
  var res = [];
  for (var key in a) res.push(key);
  return res;
}

/*!
 * Simple equality for flat iterable objects
 * such as Arrays or Node.js buffers.
 *
 * @param {Iterable} a
 * @param {Iterable} b
 * @return {Boolean} result
 */

function iterableEqual(a, b) {
  if (a.length !==  b.length) return false;

  var i = 0;
  var match = true;

  for (; i < a.length; i++) {
    if (a[i] !== b[i]) {
      match = false;
      break;
    }
  }

  return match;
}

/*!
 * Extension to `iterableEqual` specifically
 * for Node.js Buffers.
 *
 * @param {Buffer} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function bufferEqual(a, b) {
  if (!Buffer.isBuffer(b)) return false;
  return iterableEqual(a, b);
}

/*!
 * Block for `objectEqual` ensuring non-existing
 * values don't get in.
 *
 * @param {Mixed} object
 * @return {Boolean} result
 */

function isValue(a) {
  return a !== null && a !== undefined;
}

/*!
 * Recursively check the equality of two objects.
 * Once basic sameness has been established it will
 * defer to `deepEqual` for each enumerable key
 * in the object.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function objectEqual(a, b, m) {
  if (!isValue(a) || !isValue(b)) {
    return false;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  var i;
  if (m) {
    for (i = 0; i < m.length; i++) {
      if ((m[i][0] === a && m[i][1] === b)
      ||  (m[i][0] === b && m[i][1] === a)) {
        return true;
      }
    }
  } else {
    m = [];
  }

  try {
    var ka = enumerable(a);
    var kb = enumerable(b);
  } catch (ex) {
    return false;
  }

  ka.sort();
  kb.sort();

  if (!iterableEqual(ka, kb)) {
    return false;
  }

  m.push([ a, b ]);

  var key;
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], m)) {
      return false;
    }
  }

  return true;
}

});

require.register("chai", function (exports, module) {
module.exports = require('chai/lib/chai.js');

});

require.register("chai/lib/chai.js", function (exports, module) {
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '2.3.0';

/*!
 * Assertion Error
 */

exports.AssertionError = require('chaijs~assertion-error@1.0.0');

/*!
 * Utils for plugins (not exported)
 */

var util = require('chai/lib/chai/utils/index.js');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Utility Functions
 */

exports.util = util;

/*!
 * Configuration
 */

var config = require('chai/lib/chai/config.js');
exports.config = config;

/*!
 * Primary `Assertion` prototype
 */

var assertion = require('chai/lib/chai/assertion.js');
exports.use(assertion);

/*!
 * Core Assertions
 */

var core = require('chai/lib/chai/core/assertions.js');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('chai/lib/chai/interface/expect.js');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('chai/lib/chai/interface/should.js');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('chai/lib/chai/interface/assert.js');
exports.use(assert);

});

require.register("chai/lib/chai/assertion.js", function (exports, module) {
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('chai/lib/chai/config.js');

module.exports = function (_chai, util) {
  /*!
   * Module dependencies.
   */

  var AssertionError = _chai.AssertionError
    , flag = util.flag;

  /*!
   * Module export.
   */

  _chai.Assertion = Assertion;

  /*!
   * Assertion Constructor
   *
   * Creates object for chaining.
   *
   * @api private
   */

  function Assertion (obj, msg, stack) {
    flag(this, 'ssfi', stack || arguments.callee);
    flag(this, 'object', obj);
    flag(this, 'message', msg);
  }

  Object.defineProperty(Assertion, 'includeStack', {
    get: function() {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      return config.includeStack;
    },
    set: function(value) {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      config.includeStack = value;
    }
  });

  Object.defineProperty(Assertion, 'showDiff', {
    get: function() {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      return config.showDiff;
    },
    set: function(value) {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      config.showDiff = value;
    }
  });

  Assertion.addProperty = function (name, fn) {
    util.addProperty(this.prototype, name, fn);
  };

  Assertion.addMethod = function (name, fn) {
    util.addMethod(this.prototype, name, fn);
  };

  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  Assertion.overwriteProperty = function (name, fn) {
    util.overwriteProperty(this.prototype, name, fn);
  };

  Assertion.overwriteMethod = function (name, fn) {
    util.overwriteMethod(this.prototype, name, fn);
  };

  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  /*!
   * ### .assert(expression, message, negateMessage, expected, actual)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {Philosophical} expression to be tested
   * @param {String or Function} message or function that returns message to display if expression fails
   * @param {String or Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)
   * @param {Mixed} actual (optional) will default to `this.obj`
   * @param {Boolean} showDiff (optional) when set to `true`, assert will display a diff in addition to the message if expression fails
   * @api private
   */

  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (true !== showDiff) showDiff = false;
    if (true !== config.showDiff) showDiff = false;

    if (!ok) {
      var msg = util.getMessage(this, arguments)
        , actual = util.getActual(this, arguments);
      throw new AssertionError(msg, {
          actual: actual
        , expected: expected
        , showDiff: showDiff
      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
    }
  };

  /*!
   * ### ._obj
   *
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @api private
   */

  Object.defineProperty(Assertion.prototype, '_obj',
    { get: function () {
        return flag(this, 'object');
      }
    , set: function (val) {
        flag(this, 'object', val);
      }
  });
};

});

require.register("chai/lib/chai/config.js", function (exports, module) {
module.exports = {

  /**
   * ### config.includeStack
   *
   * User configurable property, influences whether stack trace
   * is included in Assertion error message. Default of false
   * suppresses stack trace in the error message.
   *
   *     chai.config.includeStack = true;  // enable stack on error
   *
   * @param {Boolean}
   * @api public
   */

   includeStack: false,

  /**
   * ### config.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @param {Boolean}
   * @api public
   */

  showDiff: true,

  /**
   * ### config.truncateThreshold
   *
   * User configurable property, sets length threshold for actual and
   * expected values in assertion errors. If this threshold is exceeded, for
   * example for large data structures, the value is replaced with something
   * like `[ Array(3) ]` or `{ Object (prop1, prop2) }`.
   *
   * Set it to zero if you want to disable truncating altogether.
   *
   * This is especially userful when doing assertions on arrays: having this
   * set to a reasonable large value makes the failure messages readily
   * inspectable.
   *
   *     chai.config.truncateThreshold = 0;  // disable truncating
   *
   * @param {Number}
   * @api public
   */

  truncateThreshold: 40

};

});

require.register("chai/lib/chai/core/assertions.js", function (exports, module) {
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provided as chainable getters to
   * improve the readability of your assertions. They
   * do not provide testing capabilities unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - which
   * - and
   * - has
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'has', 'have'
  , 'with', 'that', 'which', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * `.deep.property` special characters can be escaped
   * by adding two slashes before the `.` or `[]`.
   *
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name deep
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .any
   *
   * Sets the `any` flag, (opposite of the `all` flag)
   * later used in the `keys` assertion.
   *
   *     expect(foo).to.have.any.keys('bar', 'baz');
   *
   * @name any
   * @api public
   */

  Assertion.addProperty('any', function () {
    flag(this, 'any', true);
    flag(this, 'all', false)
  });


  /**
   * ### .all
   *
   * Sets the `all` flag (opposite of the `any` flag)
   * later used by the `keys` assertion.
   *
   *     expect(foo).to.have.all.keys('bar', 'baz');
   *
   * @name all
   * @api public
   */

  Assertion.addProperty('all', function () {
    flag(this, 'all', true);
    flag(this, 'any', false);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contains` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @alias includes
   * @alias contains
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var expected = false;
    if (_.type(obj) === 'array' && _.type(val) === 'object') {
      for (var i in obj) {
        if (_.eql(obj[i], val)) {
          expected = true;
          break;
        }
      }
    } else if (_.type(val) === 'object') {
      if (!flag(this, 'negate')) {
        for (var k in val) new Assertion(obj).property(k, val[k]);
        return;
      }
      var subset = {};
      for (var k in val) subset[k] = obj[k];
      expected = _.eql(subset, val);
    } else {
      expected = obj && ~obj.indexOf(val);
    }
    this.assert(
        expected
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);
  Assertion.addChainableMethod('contains', include, includeChainingBehavior);
  Assertion.addChainableMethod('includes', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everthing').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * @name ok
   * @api public
   */

  Assertion.addProperty('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * @name true
   * @api public
   */

  Assertion.addProperty('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * @name false
   * @api public
   */

  Assertion.addProperty('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).to.not.be.null;
   *
   * @name null
   * @api public
   */

  Assertion.addProperty('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *     expect(undefined).to.be.undefined;
   *     expect(null).to.not.be.undefined;
   *
   * @name undefined
   * @api public
   */

  Assertion.addProperty('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * @name exist
   * @api public
   */

  Assertion.addProperty('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays and strings, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * @name empty
   * @api public
   */

  Assertion.addProperty('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addProperty('arguments', checkArguments);
  Assertion.addProperty('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };
   *
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * Note that dots and bracket in `name` must be backslash-escaped when
   * the `deep` flag is set, while they must NOT be escaped when the `deep`
   * flag is not set.
   *
   *     // simple referencing
   *     var css = { '.link[target]': 42 };
   *     expect(css).to.have.property('.link[target]', 42);
   *
   *     // deep referencing
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var isDeep = !!flag(this, 'deep')
      , descriptor = isDeep ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , pathInfo = isDeep ? _.getPathInfo(name, obj) : null
      , hasProperty = isDeep
        ? pathInfo.exists
        : _.hasProperty(name, obj)
      , value = isDeep
        ? pathInfo.value
        : obj[name];

    if (negate && undefined !== val) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          hasProperty
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (undefined !== val) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .ownPropertyDescriptor(name[, descriptor[, message]])
   *
   * Asserts that the target has an own property descriptor `name`, that optionally matches `descriptor`.
   *
   *     expect('test').to.have.ownPropertyDescriptor('length');
   *     expect('test').to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 4 });
   *     expect('test').not.to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 3 });
   *     expect('test').ownPropertyDescriptor('length').to.have.property('enumerable', false);
   *     expect('test').ownPropertyDescriptor('length').to.have.keys('value');
   *
   * @name ownPropertyDescriptor
   * @alias haveOwnPropertyDescriptor
   * @param {String} name
   * @param {Object} descriptor _optional_
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnPropertyDescriptor (name, descriptor, msg) {
    if (typeof descriptor === 'string') {
      msg = descriptor;
      descriptor = null;
    }
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
    if (actualDescriptor && descriptor) {
      this.assert(
          _.eql(descriptor, actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to match ' + _.inspect(descriptor) + ', got ' + _.inspect(actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to not match ' + _.inspect(descriptor)
        , descriptor
        , actualDescriptor
        , true
      );
    } else {
      this.assert(
          actualDescriptor
        , 'expected #{this} to have an own property descriptor for ' + _.inspect(name)
        , 'expected #{this} to not have an own property descriptor for ' + _.inspect(name)
      );
    }
    flag(this, 'object', actualDescriptor);
  }

  Assertion.addMethod('ownPropertyDescriptor', assertOwnPropertyDescriptor);
  Assertion.addMethod('haveOwnPropertyDescriptor', assertOwnPropertyDescriptor);

  /**
   * ### .length(value)
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.length(3);
   *     expect('foobar').to.have.length(6);
   *
   * Can also be used as a chain precursor to a value
   * comparison for the length property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name length
   * @alias lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('match', function (re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  });

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target contains any or all of the passed-in keys.
   * Use in combination with `any`, `all`, `contains`, or `have` will affect
   * what will pass.
   *
   * When used in conjunction with `any`, at least one key that is passed
   * in must exist in the target object. This is regardless whether or not
   * the `have` or `contain` qualifiers are used. Note, either `any` or `all`
   * should be used in the assertion. If neither are used, the assertion is
   * defaulted to `all`.
   *
   * When both `all` and `contain` are used, the target object must have at
   * least all of the passed-in keys but may have more keys not listed.
   *
   * When both `all` and `have` are used, the target object must both contain
   * all of the passed-in keys AND the number of keys in the target object must
   * match the number of keys passed in (in other words, a target object must
   * have all and only all of the passed-in keys).
   *
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys('bar', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys(['foo']);
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys({'foo': 6});
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo': 7});
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys([{'bar': 6}}]);
   *
   *
   * @name keys
   * @alias key
   * @param {String...|Array|Object} keys
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true
      , mixedArgsMsg = 'keys must be given single argument of Array|Object|String, or multiple String arguments';

    switch (_.type(keys)) {
      case "array":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        break;
      case "object":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        keys = Object.keys(keys);
        break;
      default:
        keys = Array.prototype.slice.call(arguments);
    }

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , expected = keys
      , len = keys.length
      , any = flag(this, 'any')
      , all = flag(this, 'all');

    if (!any && !all) {
      all = true;
    }

    // Has any
    if (any) {
      var intersection = expected.filter(function(key) {
        return ~actual.indexOf(key);
      });
      ok = intersection.length > 0;
    }

    // Has all
    if (all) {
      ok = keys.every(function(key){
        return ~actual.indexOf(key);
      });
      if (!flag(this, 'negate') && !flag(this, 'contains')) {
        ok = ok && keys.length == actual.length;
      }
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      if (all) {
        str = keys.join(', ') + ', and ' + last;
      }
      if (any) {
        str = keys.join(', ') + ', or ' + last;
      }
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
      , expected.slice(0).sort()
      , actual.sort()
      , true
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @returns error for chaining (null if no error)
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = constructor.prototype.name || constructor.name;
      if (name === 'Error' && constructor !== Error) {
        name = (new constructor()).name;
      }
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)
          , (err instanceof Error ? err.toString() : err)
        );

        flag(this, 'object', err);
        return this;
      }

      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , (err instanceof Error ? err.toString() : err)
        );

        if (!errMsg) {
          flag(this, 'object', err);
          return this;
        }
      }

      // next, check message
      var message = 'object' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)
    );

    flag(this, 'object', thrownError);
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *     Klass.baz = function(){};
   *     expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @param {String} method
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('respondTo', function (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  });

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *     function Foo() {}
   *     Foo.bar = function() {}
   *     Foo.prototype.baz = function() {}
   *
   *     expect(Foo).itself.to.respondTo('bar');
   *     expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @param {Function} matcher
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('satisfy', function (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var result = matcher(obj);
    this.assert(
        result
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , result
    );
  });

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('closeTo', function (expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj, msg).is.a('number');
    if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {
      throw new Error('the arguments to closeTo must be numbers');
    }

    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  });

  function isSubsetOf(subset, superset, cmp) {
    return subset.every(function(elem) {
      if (!cmp) return superset.indexOf(elem) !== -1;

      return superset.some(function(elem2) {
        return cmp(elem, elem2);
      });
    })
  }

  /**
   * ### .members(set)
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same strictly-equal (===) members.
   * Alternately, if the `deep` flag is set, set members are compared for deep
   * equality.
   *
   *     expect([1, 2, 3]).to.include.members([3, 2]);
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *     expect([4, 2]).to.have.members([2, 4]);
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    var cmp = flag(this, 'deep') ? _.eql : undefined;

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });

  /**
   * ### .change(function)
   *
   * Asserts that a function changes an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val += 3 };
   *     var noChangeFn = function() { return 'foo' + 'bar'; }
   *     expect(fn).to.change(obj, 'val');
   *     expect(noChangFn).to.not.change(obj, 'val')
   *
   * @name change
   * @alias changes
   * @alias Change
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertChanges (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      initial !== object[prop]
      , 'expected .' + prop + ' to change'
      , 'expected .' + prop + ' to not change'
    );
  }

  Assertion.addChainableMethod('change', assertChanges);
  Assertion.addChainableMethod('changes', assertChanges);

  /**
   * ### .increase(function)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     expect(fn).to.increase(obj, 'val');
   *
   * @name increase
   * @alias increases
   * @alias Increase
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertIncreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial > 0
      , 'expected .' + prop + ' to increase'
      , 'expected .' + prop + ' to not increase'
    );
  }

  Assertion.addChainableMethod('increase', assertIncreases);
  Assertion.addChainableMethod('increases', assertIncreases);

  /**
   * ### .decrease(function)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     expect(fn).to.decrease(obj, 'val');
   *
   * @name decrease
   * @alias decreases
   * @alias Decrease
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertDecreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial < 0
      , 'expected .' + prop + ' to decrease'
      , 'expected .' + prop + ' to not decrease'
    );
  }

  Assertion.addChainableMethod('decrease', assertDecreases);
  Assertion.addChainableMethod('decreases', assertDecreases);

};

});

require.register("chai/lib/chai/interface/assert.js", function (exports, module) {
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null, null, chai.assert);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    message = message || 'assert.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, assert.fail);
  };

  /**
   * ### .ok(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.ok('everything', 'everything is ok');
   *     assert.ok(false, 'this will fail');
   *
   * @name ok
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.ok = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .notOk(object, [message])
   *
   * Asserts that `object` is falsy.
   *
   *     assert.notOk('everything', 'this will fail');
   *     assert.notOk(false, 'this will pass');
   *
   * @name notOk
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.notOk = function (val, msg) {
    new Assertion(val, msg).is.not.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.equal);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.notEqual);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isAbove = function (val, abv, msg) {
    new Assertion(val, msg).to.be.above(abv);
  };

   /**
   * ### .isAbove(valueToCheck, valueToBeAbove, [message])
   *
   * Asserts `valueToCheck` is strictly greater than (>) `valueToBeAbove`
   *
   *     assert.isAbove(5, 2, '5 is strictly greater than 2');
   *
   * @name isAbove
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAbove
   * @param {String} message
   * @api public
   */

  assert.isBelow = function (val, blw, msg) {
    new Assertion(val, msg).to.be.below(blw);
  };

   /**
   * ### .isBelow(valueToCheck, valueToBeBelow, [message])
   *
   * Asserts `valueToCheck` is strictly less than (<) `valueToBeBelow`
   *
   *     assert.isBelow(3, 6, '3 is strictly less than 6');
   *
   * @name isBelow
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeBelow
   * @param {String} message
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object (as revealed by
   * `Object.prototype.toString`).
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object.
   *
   *     var selection = 'chai'
   *     assert.isNotObject(selection, 'tea selection is not an object');
   *     assert.isNotObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.include).include(inc);
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *i
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.notInclude).not.include(inc);
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 5, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throw(fn, 'function throws a reference error');
   *     assert.throw(fn, /function throws a reference error/);
   *     assert.throw(fn, ReferenceError);
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.Throw = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    var assertErr = new Assertion(fn, msg).to.Throw(errt, errs);
    return flag(assertErr, 'object');
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    var ok;
    switch(operator) {
      case '==':
        ok = val == val2;
        break;
      case '===':
        ok = val === val2;
        break;
      case '>':
        ok = val > val2;
        break;
      case '>=':
        ok = val >= val2;
        break;
      case '<':
        ok = val < val2;
        break;
      case '<=':
        ok = val <= val2;
        break;
      case '!=':
        ok = val != val2;
        break;
      case '!==':
        ok = val !== val2;
        break;
      default:
        throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(ok, msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .sameDeepMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members - using a deep equality checking.
   * Order is not taken into account.
   *
   *     assert.sameDeepMembers([ {b: 3}, {a: 2}, {c: 5} ], [ {c: 5}, {b: 3}, {a: 2} ], 'same deep members');
   *
   * @name sameDeepMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @api public
   */

  assert.sameDeepMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.deep.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

   /**
   * ### .changes(function, object, property)
   *
   * Asserts that a function changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 22 };
   *     assert.changes(fn, obj, 'val');
   *
   * @name changes
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.changes = function (fn, obj, prop) {
    new Assertion(fn).to.change(obj, prop);
  }

   /**
   * ### .doesNotChange(function, object, property)
   *
   * Asserts that a function does not changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { console.log('foo'); };
   *     assert.doesNotChange(fn, obj, 'val');
   *
   * @name doesNotChange
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotChange = function (fn, obj, prop) {
    new Assertion(fn).to.not.change(obj, prop);
  }

   /**
   * ### .increases(function, object, property)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 13 };
   *     assert.increases(fn, obj, 'val');
   *
   * @name increases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.increases = function (fn, obj, prop) {
    new Assertion(fn).to.increase(obj, prop);
  }

   /**
   * ### .doesNotIncrease(function, object, property)
   *
   * Asserts that a function does not increase object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 8 };
   *     assert.doesNotIncrease(fn, obj, 'val');
   *
   * @name doesNotIncrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotIncrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.increase(obj, prop);
  }

   /**
   * ### .decreases(function, object, property)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     assert.decreases(fn, obj, 'val');
   *
   * @name decreases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.decreases = function (fn, obj, prop) {
    new Assertion(fn).to.decrease(obj, prop);
  }

   /**
   * ### .doesNotDecrease(function, object, property)
   *
   * Asserts that a function does not decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     assert.doesNotDecrease(fn, obj, 'val');
   *
   * @name doesNotDecrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotDecrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.decrease(obj, prop);
  }

  /*!
   * Undocumented / untested
   */

  assert.ifError = function (val, msg) {
    new Assertion(val, msg).to.not.be.ok;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('Throw', 'throw')
  ('Throw', 'throws');
};

});

require.register("chai/lib/chai/interface/expect.js", function (exports, module) {
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  chai.expect.fail = function (actual, expected, message, operator) {
    message = message || 'expect.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, chai.expect.fail);
  };
};

});

require.register("chai/lib/chai/interface/should.js", function (exports, module) {
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // explicitly define this method as function as to have it's name to include as `ssfi`
    function shouldGetter() {
      if (this instanceof String || this instanceof Number || this instanceof Boolean ) {
        return new Assertion(this.valueOf(), null, shouldGetter);
      }
      return new Assertion(this, null, shouldGetter);
    }
    function shouldSetter(value) {
      // See https://github.com/chaijs/chai/issues/86: this makes
      // `whatever.should = someValue` actually set `someValue`, which is
      // especially useful for `global.should = require('chai').should()`.
      //
      // Note that we have to use [[DefineProperty]] instead of [[Put]]
      // since otherwise we would trigger this very setter!
      Object.defineProperty(this, 'should', {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should', {
      set: shouldSetter
      , get: shouldGetter
      , configurable: true
    });

    var should = {};

    /**
     * ### .fail(actual, expected, [message], [operator])
     *
     * Throw a failure.
     *
     * @name fail
     * @param {Mixed} actual
     * @param {Mixed} expected
     * @param {String} message
     * @param {String} operator
     * @api public
     */

    should.fail = function (actual, expected, message, operator) {
      message = message || 'should.fail()';
      throw new chai.AssertionError(message, {
          actual: actual
        , expected: expected
        , operator: operator
      }, should.fail);
    };

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

});

require.register("chai/lib/chai/utils/addChainableMethod.js", function (exports, module) {
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('chai/lib/chai/utils/transferFlags.js');
var flag = require('chai/lib/chai/utils/flag.js');
var config = require('chai/lib/chai/config.js');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function') {
    chainingBehavior = function () { };
  }

  var chainableBehavior = {
      method: method
    , chainingBehavior: chainingBehavior
  };

  // save the methods so we can overwrite them later, if we need to.
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;

  Object.defineProperty(ctx, name,
    { get: function () {
        chainableBehavior.chainingBehavior.call(this);

        var assert = function assert() {
          var old_ssfi = flag(this, 'ssfi');
          if (old_ssfi && config.includeStack === false)
            flag(this, 'ssfi', assert);
          var result = chainableBehavior.method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

});

require.register("chai/lib/chai/utils/addMethod.js", function (exports, module) {
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('chai/lib/chai/config.js');

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @name addMethod
 * @api public
 */
var flag = require('chai/lib/chai/utils/flag.js');

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var old_ssfi = flag(this, 'ssfi');
    if (old_ssfi && config.includeStack === false)
      flag(this, 'ssfi', ctx[name]);
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

});

require.register("chai/lib/chai/utils/addProperty.js", function (exports, module) {
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

});

require.register("chai/lib/chai/utils/flag.js", function (exports, module) {
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object, key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

});

require.register("chai/lib/chai/utils/getActual.js", function (exports, module) {
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  return args.length > 4 ? args[4] : obj._obj;
};

});

require.register("chai/lib/chai/utils/getEnumerableProperties.js", function (exports, module) {
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

});

require.register("chai/lib/chai/utils/getMessage.js", function (exports, module) {
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('chai/lib/chai/utils/flag.js')
  , getActual = require('chai/lib/chai/utils/getActual.js')
  , inspect = require('chai/lib/chai/utils/inspect.js')
  , objDisplay = require('chai/lib/chai/utils/objDisplay.js');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Message template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  if(typeof msg === "function") msg = msg();
  msg = msg || '';
  msg = msg
    .replace(/#{this}/g, objDisplay(val))
    .replace(/#{act}/g, objDisplay(actual))
    .replace(/#{exp}/g, objDisplay(expected));

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

});

require.register("chai/lib/chai/utils/getName.js", function (exports, module) {
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

});

require.register("chai/lib/chai/utils/getPathValue.js", function (exports, module) {
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

var getPathInfo = require('chai/lib/chai/utils/getPathInfo.js');

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @name getPathValue
 * @api public
 */
module.exports = function(path, obj) {
  var info = getPathInfo(path, obj);
  return info.value;
}; 

});

require.register("chai/lib/chai/utils/getPathInfo.js", function (exports, module) {
/*!
 * Chai - getPathInfo utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var hasProperty = require('chai/lib/chai/utils/hasProperty.js');

/**
 * ### .getPathInfo(path, object)
 *
 * This allows the retrieval of property info in an
 * object given a string path.
 *
 * The path info consists of an object with the
 * following properties:
 *
 * * parent - The parent object of the property referenced by `path`
 * * name - The name of the final property, a number if it was an array indexer
 * * value - The value of the property, if it exists, otherwise `undefined`
 * * exists - Whether the property exists or not
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} info
 * @name getPathInfo
 * @api public
 */

module.exports = function getPathInfo(path, obj) {
  var parsed = parsePath(path),
      last = parsed[parsed.length - 1];

  var info = {
    parent: parsed.length > 1 ? _getPathValue(parsed, obj, parsed.length - 1) : obj,
    name: last.p || last.i,
    value: _getPathValue(parsed, obj),
  };
  info.exists = hasProperty(info.name, info.parent);

  return info;
};


/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 * * Literal dots and brackets (not delimiter) must be backslash-escaped.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/([^\\])\[/g, '$1.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /^\[(\d+)\]$/
      , mArr = re.exec(value);
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value.replace(/\\([.\[\]])/g, '$1') };
  });
}


/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @param {Number} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj, index) {
  var tmp = obj
    , res;

  index = (index === undefined ? parsed.length : index);

  for (var i = 0, l = index; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
}

});

require.register("chai/lib/chai/utils/hasProperty.js", function (exports, module) {
/*!
 * Chai - hasProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var type = require('chai/lib/chai/utils/type.js');

/**
 * ### .hasProperty(object, name)
 *
 * This allows checking whether an object has
 * named property or numeric array index.
 *
 * Basically does the same thing as the `in`
 * operator but works properly with natives
 * and null/undefined values.
 *
 *     var obj = {
 *         arr: ['a', 'b', 'c']
 *       , str: 'Hello'
 *     }
 *
 * The following would be the results.
 *
 *     hasProperty('str', obj);  // true
 *     hasProperty('constructor', obj);  // true
 *     hasProperty('bar', obj);  // false
 *     
 *     hasProperty('length', obj.str); // true
 *     hasProperty(1, obj.str);  // true
 *     hasProperty(5, obj.str);  // false
 *
 *     hasProperty('length', obj.arr);  // true
 *     hasProperty(2, obj.arr);  // true
 *     hasProperty(3, obj.arr);  // false
 *
 * @param {Objuect} object
 * @param {String|Number} name
 * @returns {Boolean} whether it exists
 * @name getPathInfo
 * @api public
 */

var literals = {
    'number': Number
  , 'string': String
};

module.exports = function hasProperty(name, obj) {
  var ot = type(obj);

  // Bad Object, obviously no props at all
  if(ot === 'null' || ot === 'undefined')
    return false;

  // The `in` operator does not work with certain literals
  // box these before the check
  if(literals[ot] && typeof obj !== 'object')
    obj = new literals[ot](obj);

  return name in obj;
};

});

require.register("chai/lib/chai/utils/getProperties.js", function (exports, module) {
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(subject);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(subject);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

});

require.register("chai/lib/chai/utils/index.js", function (exports, module) {
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('chai/lib/chai/utils/test.js');

/*!
 * type utility
 */

exports.type = require('chai/lib/chai/utils/type.js');

/*!
 * message utility
 */

exports.getMessage = require('chai/lib/chai/utils/getMessage.js');

/*!
 * actual utility
 */

exports.getActual = require('chai/lib/chai/utils/getActual.js');

/*!
 * Inspect util
 */

exports.inspect = require('chai/lib/chai/utils/inspect.js');

/*!
 * Object Display util
 */

exports.objDisplay = require('chai/lib/chai/utils/objDisplay.js');

/*!
 * Flag utility
 */

exports.flag = require('chai/lib/chai/utils/flag.js');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('chai/lib/chai/utils/transferFlags.js');

/*!
 * Deep equal utility
 */

exports.eql = require('chaijs~deep-eql@0.1.3');

/*!
 * Deep path value
 */

exports.getPathValue = require('chai/lib/chai/utils/getPathValue.js');

/*!
 * Deep path info
 */

exports.getPathInfo = require('chai/lib/chai/utils/getPathInfo.js');

/*!
 * Check if a property exists
 */

exports.hasProperty = require('chai/lib/chai/utils/hasProperty.js');

/*!
 * Function name
 */

exports.getName = require('chai/lib/chai/utils/getName.js');

/*!
 * add Property
 */

exports.addProperty = require('chai/lib/chai/utils/addProperty.js');

/*!
 * add Method
 */

exports.addMethod = require('chai/lib/chai/utils/addMethod.js');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('chai/lib/chai/utils/overwriteProperty.js');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('chai/lib/chai/utils/overwriteMethod.js');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('chai/lib/chai/utils/addChainableMethod.js');

/*!
 * Overwrite chainable method
 */

exports.overwriteChainableMethod = require('chai/lib/chai/utils/overwriteChainableMethod.js');


});

require.register("chai/lib/chai/utils/inspect.js", function (exports, module) {
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('chai/lib/chai/utils/getName.js');
var getProperties = require('chai/lib/chai/utils/getProperties.js');
var getEnumerableProperties = require('chai/lib/chai/utils/getEnumerableProperties.js');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If this is a DOM element, try to get the outer HTML.
  if (isDOMElement(value)) {
    if ('outerHTML' in value) {
      return value.outerHTML;
      // This value does not have an outerHTML attribute,
      //   it could still be an XML element
    } else {
      // Attempt to serialize it
      try {
        if (document.xmlVersion) {
          var xmlSerializer = new XMLSerializer();
          return xmlSerializer.serializeToString(value);
        } else {
          // Firefox 11- do not support outerHTML
          //   It does, however, support innerHTML
          //   Use the following to render the element
          var ns = "http://www.w3.org/1999/xhtml";
          var container = document.createElementNS(ns, '_');

          container.appendChild(value.cloneNode(false));
          html = container.innerHTML
            .replace('><', '>' + value.innerHTML + '<');
          container.innerHTML = '';
          return html;
        }
      } catch (err) {
        // This could be a non-native DOM implementation,
        //   continue with the normal flow:
        //   printing the element as if it is an object.
      }
    }
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      if (value === 0 && (1/value) === -Infinity) {
        return ctx.stylize('-0', 'number');
      }
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

});

require.register("chai/lib/chai/utils/objDisplay.js", function (exports, module) {
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('chai/lib/chai/utils/inspect.js');
var config = require('chai/lib/chai/config.js');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

});

require.register("chai/lib/chai/utils/overwriteMethod.js", function (exports, module) {
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

});

require.register("chai/lib/chai/utils/overwriteProperty.js", function (exports, module) {
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

});

require.register("chai/lib/chai/utils/overwriteChainableMethod.js", function (exports, module) {
/*!
 * Chai - overwriteChainableMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Overwites an already existing chainable method
 * and provides access to the previous function or
 * property.  Must return functions to be used for
 * name.
 *
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',
 *       function (_super) {
 *       }
 *     , function (_super) {
 *       }
 *     );
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.have.length(3);
 *     expect(myFoo).to.have.length.above(3);
 *
 * @param {Object} ctx object whose method / property is to be overwritten
 * @param {String} name of method / property to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @param {Function} chainingBehavior function that returns a function to be used for property
 * @name overwriteChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  var chainableBehavior = ctx.__methods[name];

  var _chainingBehavior = chainableBehavior.chainingBehavior;
  chainableBehavior.chainingBehavior = function () {
    var result = chainingBehavior(_chainingBehavior).call(this);
    return result === undefined ? this : result;
  };

  var _method = chainableBehavior.method;
  chainableBehavior.method = function () {
    var result = method(_method).apply(this, arguments);
    return result === undefined ? this : result;
  };
};

});

require.register("chai/lib/chai/utils/test.js", function (exports, module) {
/*!
 * Chai - test utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('chai/lib/chai/utils/flag.js');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

});

require.register("chai/lib/chai/utils/transferFlags.js", function (exports, module) {
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags to; usually a new assertion
 * @param {Boolean} includeAll
 * @name transferFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

});

require.register("chai/lib/chai/utils/type.js", function (exports, module) {
/*!
 * Chai - type utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Arguments]': 'arguments'
  , '[object Array]': 'array'
  , '[object Date]': 'date'
  , '[object Function]': 'function'
  , '[object Number]': 'number'
  , '[object RegExp]': 'regexp'
  , '[object String]': 'string'
};

/**
 * ### type(object)
 *
 * Better implementation of `typeof` detection that can
 * be used cross-browser. Handles the inconsistencies of
 * Array, `null`, and `undefined` detection.
 *
 *     utils.type({}) // 'object'
 *     utils.type(null) // `null'
 *     utils.type(undefined) // `undefined`
 *     utils.type([]) // `array`
 *
 * @param {Mixed} object to detect type of
 * @name type
 * @api private
 */

module.exports = function (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
};

});

if (typeof exports == "object") {
  module.exports = require("chai");
} else if (typeof define == "function" && define.amd) {
  define("chai", [], function(){ return require("chai"); });
} else {
  (this || window)["chai"] = require("chai");
}
})()

mocha.setup('bdd');

/* Ember Mocha Adapter | (C) 2014 Teddy Zeenny | https://github.com/teddyzeenny/ember-mocha-adapter */

(function() {
  var done, doneTimeout, isAsync, emberBdd, isPromise;

  done = null;
  doneTimeout = null;
  isAsync = 0;

  Ember.Test.MochaAdapter = Ember.Test.Adapter.extend({
    init: function() {
      this._super();
      window.Mocha.interfaces['ember-bdd'] = emberBdd;
      window.mocha.ui('ember-bdd');
    },
    asyncStart: function() {
      isAsync++;
      clearTimeout(doneTimeout);
    },
    asyncEnd: function() {
      if (--isAsync === 0 && done && !isPromise) {
        doneTimeout = setTimeout(function() {
          complete();
        });
      }
    },
    exception: function(reason) {
      if (!(reason instanceof Error)) {
        reason = new Error(reason);
      }
      if (done) {
        complete(reason);
      } else {
        setTimeout(function() {
          throw reason;
        });
      }
    }
  });

  function fixAsync(suites, methodName) {
    return function(name, fn) {
      if (!fn) {
        fn = name;
        name = fn.name;
      }

      var suite = suites[0];
      var hook = suite[methodName];
      var asyncFn = fn;

      if (fn.length === 0) {
        asyncFn = function(d) {
          invoke(this, fn, d);
        };
      }

      if (hook.length === 2) {
        hook.call(suite, name, asyncFn);
      } else {
        hook.call(suite, asyncFn);
      }
    };
  }

  function invoke(context, fn, d) {
    done = d;
    isPromise = false;
    var result = fn.call(context);
    // If a promise is returned,
    // complete test when promise fulfills / rejects
    if (result && typeof result.then === 'function') {
      isPromise = true;
      result.then(function() { complete(); }, complete);
    } else {
       if (isAsync === 0) { complete(); }
    }
  }

  // Called whenever an async test passes or fails.
  // if `e` is passed, that means the test
  // failed with exception `e`
  function complete(e) {
    clearTimeout(doneTimeout);
    if (!done) { return; }
    var d = done;
    done = null;
    if (e) {
      // test failure
      if (!(e instanceof Error)) {
        e = new Error(e);
      }
      d(e);
    } else {
      // test passed
      d();
    }
  }

  /**
    ember-bdd mocha interface.
    This interface allows
    the Ember.js tester
    to forget about sync / async
    and treat all tests the same.

    This interface, along with the adapter
    will take care of handling sync vs async
  */

  emberBdd = function(suite) {
    var suites = [suite];

    suite.on('pre-require', function(context, file, mocha) {

      context.before = fixAsync(suites, 'beforeAll');

      context.after = fixAsync(suites, 'afterAll');

      context.beforeEach = fixAsync(suites, 'beforeEach');

      context.afterEach = fixAsync(suites, 'afterEach');


      context.it = context.specify = function(title, fn){
        var suite = suites[0], test;
        if (suite.pending) {
          fn = null;
        }
        if (!fn || fn.length === 1) {
          test = new Mocha.Test(title, fn);
        } else {
          var method = function(d) {
            invoke(this, fn, d);
          };
          method.toString = function() {
            return fn.toString();
          }
          test = new Mocha.Test(title, method);
        }
        suite.addTest(test);
        return test;
      };

      context.describe = context.context = function(title, fn){
        var suite = Mocha.Suite.create(suites[0], title);
        suites.unshift(suite);
        fn.call(suite);
        suites.shift();
        return suite;
      };

      context.xdescribe =
      context.xcontext =
      context.describe.skip = function(title, fn){
        var suite = Mocha.Suite.create(suites[0], title);
        suite.pending = true;
        suites.unshift(suite);
        fn.call(suite);
        suites.shift();
      };

      context.describe.only = function(title, fn){
        var suite = context.describe(title, fn);
        mocha.grep(suite.fullTitle());
      };


      context.it.only = function(title, fn){
        var test = context.it(title, fn);
        mocha.grep(test.fullTitle());
      };


      context.xit =
      context.xspecify =
      context.it.skip = function(title){
        context.it(title);
      };


    });

  };


}());

Ember.Test.adapter = Ember.Test.MochaAdapter.create();

/* globals jQuery, chai, mocha, require, requirejs */

jQuery(document).ready(function() {
  // Declare `expect` as a global here instead of as a var in individual tests.
  // This avoids jshint warnings re: `Redefinition of 'expect'`.
  window.expect = chai.expect;

  var testLoaderModulePath = 'ember-cli-test-loader/test-support/index';

  if (!requirejs.entries[testLoaderModulePath]) {
    testLoaderModulePath = 'ember-cli/test-loader';
  }

  var TestLoader = require(testLoaderModulePath)['default'];
  TestLoader.prototype.shouldLoadModule = function(moduleName) {
    return moduleName.match(/[-_]test$/) || moduleName.match(/\.jshint$/);
  };

  TestLoader.prototype.moduleLoadFailure = function(moduleName, error) {
    describe('TestLoader Failures', function () {
      it(moduleName + ': could not be loaded', function() {
        throw error;
      });
    });
  };

  // Attempt to mitigate sourcemap issues in Chrome
  // See: https://github.com/ember-cli/ember-cli/issues/3098
  //      https://github.com/ember-cli/ember-cli-qunit/pull/39
  setTimeout(function() {
    TestLoader.load();

    window.mochaRunner = mocha.run();
  }, 250);
});

/**
 * Sinon.JS 1.17.5, 2016/07/26
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Contributors: https://github.com/cjohansen/Sinon.JS/blob/master/AUTHORS
 *
 * (The BSD License)
 * 
 * Copyright (c) 2010-2014, Christian Johansen, christian@cjohansen.no
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *     * Neither the name of Christian Johansen nor the names of his contributors
 *       may be used to endorse or promote products derived from this software
 *       without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define('sinon', [], function () {
      return (root.sinon = factory());
    });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.sinon = factory();
  }
}(this, function () {
  'use strict';
  var samsam, formatio, lolex;
  (function () {
                function define(mod, deps, fn) {
                  if (mod == "samsam") {
                    samsam = deps();
                  } else if (typeof deps === "function" && mod.length === 0) {
                    lolex = deps();
                  } else if (typeof fn === "function") {
                    formatio = fn(samsam);
                  }
                }
    define.amd = {};
((typeof define === "function" && define.amd && function (m) { define("samsam", m); }) ||
 (typeof module === "object" &&
      function (m) { module.exports = m(); }) || // Node
 function (m) { this.samsam = m(); } // Browser globals
)(function () {
    var o = Object.prototype;
    var div = typeof document !== "undefined" && document.createElement("div");

    function isNaN(value) {
        // Unlike global isNaN, this avoids type coercion
        // typeof check avoids IE host object issues, hat tip to
        // lodash
        var val = value; // JsLint thinks value !== value is "weird"
        return typeof value === "number" && value !== val;
    }

    function getClass(value) {
        // Returns the internal [[Class]] by calling Object.prototype.toString
        // with the provided value as this. Return value is a string, naming the
        // internal class, e.g. "Array"
        return o.toString.call(value).split(/[ \]]/)[1];
    }

    /**
     * @name samsam.isArguments
     * @param Object object
     *
     * Returns ``true`` if ``object`` is an ``arguments`` object,
     * ``false`` otherwise.
     */
    function isArguments(object) {
        if (getClass(object) === 'Arguments') { return true; }
        if (typeof object !== "object" || typeof object.length !== "number" ||
                getClass(object) === "Array") {
            return false;
        }
        if (typeof object.callee == "function") { return true; }
        try {
            object[object.length] = 6;
            delete object[object.length];
        } catch (e) {
            return true;
        }
        return false;
    }

    /**
     * @name samsam.isElement
     * @param Object object
     *
     * Returns ``true`` if ``object`` is a DOM element node. Unlike
     * Underscore.js/lodash, this function will return ``false`` if ``object``
     * is an *element-like* object, i.e. a regular object with a ``nodeType``
     * property that holds the value ``1``.
     */
    function isElement(object) {
        if (!object || object.nodeType !== 1 || !div) { return false; }
        try {
            object.appendChild(div);
            object.removeChild(div);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * @name samsam.keys
     * @param Object object
     *
     * Return an array of own property names.
     */
    function keys(object) {
        var ks = [], prop;
        for (prop in object) {
            if (o.hasOwnProperty.call(object, prop)) { ks.push(prop); }
        }
        return ks;
    }

    /**
     * @name samsam.isDate
     * @param Object value
     *
     * Returns true if the object is a ``Date``, or *date-like*. Duck typing
     * of date objects work by checking that the object has a ``getTime``
     * function whose return value equals the return value from the object's
     * ``valueOf``.
     */
    function isDate(value) {
        return typeof value.getTime == "function" &&
            value.getTime() == value.valueOf();
    }

    /**
     * @name samsam.isNegZero
     * @param Object value
     *
     * Returns ``true`` if ``value`` is ``-0``.
     */
    function isNegZero(value) {
        return value === 0 && 1 / value === -Infinity;
    }

    /**
     * @name samsam.equal
     * @param Object obj1
     * @param Object obj2
     *
     * Returns ``true`` if two objects are strictly equal. Compared to
     * ``===`` there are two exceptions:
     *
     *   - NaN is considered equal to NaN
     *   - -0 and +0 are not considered equal
     */
    function identical(obj1, obj2) {
        if (obj1 === obj2 || (isNaN(obj1) && isNaN(obj2))) {
            return obj1 !== 0 || isNegZero(obj1) === isNegZero(obj2);
        }
    }


    /**
     * @name samsam.deepEqual
     * @param Object obj1
     * @param Object obj2
     *
     * Deep equal comparison. Two values are "deep equal" if:
     *
     *   - They are equal, according to samsam.identical
     *   - They are both date objects representing the same time
     *   - They are both arrays containing elements that are all deepEqual
     *   - They are objects with the same set of properties, and each property
     *     in ``obj1`` is deepEqual to the corresponding property in ``obj2``
     *
     * Supports cyclic objects.
     */
    function deepEqualCyclic(obj1, obj2) {

        // used for cyclic comparison
        // contain already visited objects
        var objects1 = [],
            objects2 = [],
        // contain pathes (position in the object structure)
        // of the already visited objects
        // indexes same as in objects arrays
            paths1 = [],
            paths2 = [],
        // contains combinations of already compared objects
        // in the manner: { "$1['ref']$2['ref']": true }
            compared = {};

        /**
         * used to check, if the value of a property is an object
         * (cyclic logic is only needed for objects)
         * only needed for cyclic logic
         */
        function isObject(value) {

            if (typeof value === 'object' && value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date)    &&
                    !(value instanceof Number)  &&
                    !(value instanceof RegExp)  &&
                    !(value instanceof String)) {

                return true;
            }

            return false;
        }

        /**
         * returns the index of the given object in the
         * given objects array, -1 if not contained
         * only needed for cyclic logic
         */
        function getIndex(objects, obj) {

            var i;
            for (i = 0; i < objects.length; i++) {
                if (objects[i] === obj) {
                    return i;
                }
            }

            return -1;
        }

        // does the recursion for the deep equal check
        return (function deepEqual(obj1, obj2, path1, path2) {
            var type1 = typeof obj1;
            var type2 = typeof obj2;

            // == null also matches undefined
            if (obj1 === obj2 ||
                    isNaN(obj1) || isNaN(obj2) ||
                    obj1 == null || obj2 == null ||
                    type1 !== "object" || type2 !== "object") {

                return identical(obj1, obj2);
            }

            // Elements are only equal if identical(expected, actual)
            if (isElement(obj1) || isElement(obj2)) { return false; }

            var isDate1 = isDate(obj1), isDate2 = isDate(obj2);
            if (isDate1 || isDate2) {
                if (!isDate1 || !isDate2 || obj1.getTime() !== obj2.getTime()) {
                    return false;
                }
            }

            if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
                if (obj1.toString() !== obj2.toString()) { return false; }
            }

            var class1 = getClass(obj1);
            var class2 = getClass(obj2);
            var keys1 = keys(obj1);
            var keys2 = keys(obj2);

            if (isArguments(obj1) || isArguments(obj2)) {
                if (obj1.length !== obj2.length) { return false; }
            } else {
                if (type1 !== type2 || class1 !== class2 ||
                        keys1.length !== keys2.length) {
                    return false;
                }
            }

            var key, i, l,
                // following vars are used for the cyclic logic
                value1, value2,
                isObject1, isObject2,
                index1, index2,
                newPath1, newPath2;

            for (i = 0, l = keys1.length; i < l; i++) {
                key = keys1[i];
                if (!o.hasOwnProperty.call(obj2, key)) {
                    return false;
                }

                // Start of the cyclic logic

                value1 = obj1[key];
                value2 = obj2[key];

                isObject1 = isObject(value1);
                isObject2 = isObject(value2);

                // determine, if the objects were already visited
                // (it's faster to check for isObject first, than to
                // get -1 from getIndex for non objects)
                index1 = isObject1 ? getIndex(objects1, value1) : -1;
                index2 = isObject2 ? getIndex(objects2, value2) : -1;

                // determine the new pathes of the objects
                // - for non cyclic objects the current path will be extended
                //   by current property name
                // - for cyclic objects the stored path is taken
                newPath1 = index1 !== -1
                    ? paths1[index1]
                    : path1 + '[' + JSON.stringify(key) + ']';
                newPath2 = index2 !== -1
                    ? paths2[index2]
                    : path2 + '[' + JSON.stringify(key) + ']';

                // stop recursion if current objects are already compared
                if (compared[newPath1 + newPath2]) {
                    return true;
                }

                // remember the current objects and their pathes
                if (index1 === -1 && isObject1) {
                    objects1.push(value1);
                    paths1.push(newPath1);
                }
                if (index2 === -1 && isObject2) {
                    objects2.push(value2);
                    paths2.push(newPath2);
                }

                // remember that the current objects are already compared
                if (isObject1 && isObject2) {
                    compared[newPath1 + newPath2] = true;
                }

                // End of cyclic logic

                // neither value1 nor value2 is a cycle
                // continue with next level
                if (!deepEqual(value1, value2, newPath1, newPath2)) {
                    return false;
                }
            }

            return true;

        }(obj1, obj2, '$1', '$2'));
    }

    var match;

    function arrayContains(array, subset) {
        if (subset.length === 0) { return true; }
        var i, l, j, k;
        for (i = 0, l = array.length; i < l; ++i) {
            if (match(array[i], subset[0])) {
                for (j = 0, k = subset.length; j < k; ++j) {
                    if (!match(array[i + j], subset[j])) { return false; }
                }
                return true;
            }
        }
        return false;
    }

    /**
     * @name samsam.match
     * @param Object object
     * @param Object matcher
     *
     * Compare arbitrary value ``object`` with matcher.
     */
    match = function match(object, matcher) {
        if (matcher && typeof matcher.test === "function") {
            return matcher.test(object);
        }

        if (typeof matcher === "function") {
            return matcher(object) === true;
        }

        if (typeof matcher === "string") {
            matcher = matcher.toLowerCase();
            var notNull = typeof object === "string" || !!object;
            return notNull &&
                (String(object)).toLowerCase().indexOf(matcher) >= 0;
        }

        if (typeof matcher === "number") {
            return matcher === object;
        }

        if (typeof matcher === "boolean") {
            return matcher === object;
        }

        if (typeof(matcher) === "undefined") {
            return typeof(object) === "undefined";
        }

        if (matcher === null) {
            return object === null;
        }

        if (getClass(object) === "Array" && getClass(matcher) === "Array") {
            return arrayContains(object, matcher);
        }

        if (matcher && typeof matcher === "object") {
            if (matcher === object) {
                return true;
            }
            var prop;
            for (prop in matcher) {
                var value = object[prop];
                if (typeof value === "undefined" &&
                        typeof object.getAttribute === "function") {
                    value = object.getAttribute(prop);
                }
                if (matcher[prop] === null || typeof matcher[prop] === 'undefined') {
                    if (value !== matcher[prop]) {
                        return false;
                    }
                } else if (typeof  value === "undefined" || !match(value, matcher[prop])) {
                    return false;
                }
            }
            return true;
        }

        throw new Error("Matcher was not a string, a number, a " +
                        "function, a boolean or an object");
    };

    return {
        isArguments: isArguments,
        isElement: isElement,
        isDate: isDate,
        isNegZero: isNegZero,
        identical: identical,
        deepEqual: deepEqualCyclic,
        match: match,
        keys: keys
    };
});
((typeof define === "function" && define.amd && function (m) {
    define("formatio", ["samsam"], m);
}) || (typeof module === "object" && function (m) {
    module.exports = m(require("samsam"));
}) || function (m) { this.formatio = m(this.samsam); }
)(function (samsam) {
    
    var formatio = {
        excludeConstructors: ["Object", /^.$/],
        quoteStrings: true,
        limitChildrenCount: 0
    };

    var hasOwn = Object.prototype.hasOwnProperty;

    var specialObjects = [];
    if (typeof global !== "undefined") {
        specialObjects.push({ object: global, value: "[object global]" });
    }
    if (typeof document !== "undefined") {
        specialObjects.push({
            object: document,
            value: "[object HTMLDocument]"
        });
    }
    if (typeof window !== "undefined") {
        specialObjects.push({ object: window, value: "[object Window]" });
    }

    function functionName(func) {
        if (!func) { return ""; }
        if (func.displayName) { return func.displayName; }
        if (func.name) { return func.name; }
        var matches = func.toString().match(/function\s+([^\(]+)/m);
        return (matches && matches[1]) || "";
    }

    function constructorName(f, object) {
        var name = functionName(object && object.constructor);
        var excludes = f.excludeConstructors ||
                formatio.excludeConstructors || [];

        var i, l;
        for (i = 0, l = excludes.length; i < l; ++i) {
            if (typeof excludes[i] === "string" && excludes[i] === name) {
                return "";
            } else if (excludes[i].test && excludes[i].test(name)) {
                return "";
            }
        }

        return name;
    }

    function isCircular(object, objects) {
        if (typeof object !== "object") { return false; }
        var i, l;
        for (i = 0, l = objects.length; i < l; ++i) {
            if (objects[i] === object) { return true; }
        }
        return false;
    }

    function ascii(f, object, processed, indent) {
        if (typeof object === "string") {
            var qs = f.quoteStrings;
            var quote = typeof qs !== "boolean" || qs;
            return processed || quote ? '"' + object + '"' : object;
        }

        if (typeof object === "function" && !(object instanceof RegExp)) {
            return ascii.func(object);
        }

        processed = processed || [];

        if (isCircular(object, processed)) { return "[Circular]"; }

        if (Object.prototype.toString.call(object) === "[object Array]") {
            return ascii.array.call(f, object, processed);
        }

        if (!object) { return String((1/object) === -Infinity ? "-0" : object); }
        if (samsam.isElement(object)) { return ascii.element(object); }

        if (typeof object.toString === "function" &&
                object.toString !== Object.prototype.toString) {
            return object.toString();
        }

        var i, l;
        for (i = 0, l = specialObjects.length; i < l; i++) {
            if (object === specialObjects[i].object) {
                return specialObjects[i].value;
            }
        }

        return ascii.object.call(f, object, processed, indent);
    }

    ascii.func = function (func) {
        return "function " + functionName(func) + "() {}";
    };

    ascii.array = function (array, processed) {
        processed = processed || [];
        processed.push(array);
        var pieces = [];
        var i, l;
        l = (this.limitChildrenCount > 0) ? 
            Math.min(this.limitChildrenCount, array.length) : array.length;

        for (i = 0; i < l; ++i) {
            pieces.push(ascii(this, array[i], processed));
        }

        if(l < array.length)
            pieces.push("[... " + (array.length - l) + " more elements]");

        return "[" + pieces.join(", ") + "]";
    };

    ascii.object = function (object, processed, indent) {
        processed = processed || [];
        processed.push(object);
        indent = indent || 0;
        var pieces = [], properties = samsam.keys(object).sort();
        var length = 3;
        var prop, str, obj, i, k, l;
        l = (this.limitChildrenCount > 0) ? 
            Math.min(this.limitChildrenCount, properties.length) : properties.length;

        for (i = 0; i < l; ++i) {
            prop = properties[i];
            obj = object[prop];

            if (isCircular(obj, processed)) {
                str = "[Circular]";
            } else {
                str = ascii(this, obj, processed, indent + 2);
            }

            str = (/\s/.test(prop) ? '"' + prop + '"' : prop) + ": " + str;
            length += str.length;
            pieces.push(str);
        }

        var cons = constructorName(this, object);
        var prefix = cons ? "[" + cons + "] " : "";
        var is = "";
        for (i = 0, k = indent; i < k; ++i) { is += " "; }

        if(l < properties.length)
            pieces.push("[... " + (properties.length - l) + " more elements]");

        if (length + indent > 80) {
            return prefix + "{\n  " + is + pieces.join(",\n  " + is) + "\n" +
                is + "}";
        }
        return prefix + "{ " + pieces.join(", ") + " }";
    };

    ascii.element = function (element) {
        var tagName = element.tagName.toLowerCase();
        var attrs = element.attributes, attr, pairs = [], attrName, i, l, val;

        for (i = 0, l = attrs.length; i < l; ++i) {
            attr = attrs.item(i);
            attrName = attr.nodeName.toLowerCase().replace("html:", "");
            val = attr.nodeValue;
            if (attrName !== "contenteditable" || val !== "inherit") {
                if (!!val) { pairs.push(attrName + "=\"" + val + "\""); }
            }
        }

        var formatted = "<" + tagName + (pairs.length > 0 ? " " : "");
        var content = element.innerHTML;

        if (content.length > 20) {
            content = content.substr(0, 20) + "[...]";
        }

        var res = formatted + pairs.join(" ") + ">" + content +
                "</" + tagName + ">";

        return res.replace(/ contentEditable="inherit"/, "");
    };

    function Formatio(options) {
        for (var opt in options) {
            this[opt] = options[opt];
        }
    }

    Formatio.prototype = {
        functionName: functionName,

        configure: function (options) {
            return new Formatio(options);
        },

        constructorName: function (object) {
            return constructorName(this, object);
        },

        ascii: function (object, processed, indent) {
            return ascii(this, object, processed, indent);
        }
    };

    return Formatio.prototype;
});
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lolex=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*global global, window*/
/**
 * @author Christian Johansen (christian@cjohansen.no) and contributors
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */

(function (global) {
    
    // Make properties writable in IE, as per
    // http://www.adequatelygood.com/Replacing-setTimeout-Globally.html
    // JSLint being anal
    var glbl = global;

    global.setTimeout = glbl.setTimeout;
    global.clearTimeout = glbl.clearTimeout;
    global.setInterval = glbl.setInterval;
    global.clearInterval = glbl.clearInterval;
    global.Date = glbl.Date;

    // setImmediate is not a standard function
    // avoid adding the prop to the window object if not present
    if('setImmediate' in global) {
        global.setImmediate = glbl.setImmediate;
        global.clearImmediate = glbl.clearImmediate;
    }

    // node expects setTimeout/setInterval to return a fn object w/ .ref()/.unref()
    // browsers, a number.
    // see https://github.com/cjohansen/Sinon.JS/pull/436

    var NOOP = function () { return undefined; };
    var timeoutResult = setTimeout(NOOP, 0);
    var addTimerReturnsObject = typeof timeoutResult === "object";
    clearTimeout(timeoutResult);

    var NativeDate = Date;
    var uniqueTimerId = 1;

    /**
     * Parse strings like "01:10:00" (meaning 1 hour, 10 minutes, 0 seconds) into
     * number of milliseconds. This is used to support human-readable strings passed
     * to clock.tick()
     */
    function parseTime(str) {
        if (!str) {
            return 0;
        }

        var strings = str.split(":");
        var l = strings.length, i = l;
        var ms = 0, parsed;

        if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
            throw new Error("tick only understands numbers and 'h:m:s'");
        }

        while (i--) {
            parsed = parseInt(strings[i], 10);

            if (parsed >= 60) {
                throw new Error("Invalid time " + str);
            }

            ms += parsed * Math.pow(60, (l - i - 1));
        }

        return ms * 1000;
    }

    /**
     * Used to grok the `now` parameter to createClock.
     */
    function getEpoch(epoch) {
        if (!epoch) { return 0; }
        if (typeof epoch.getTime === "function") { return epoch.getTime(); }
        if (typeof epoch === "number") { return epoch; }
        throw new TypeError("now should be milliseconds since UNIX epoch");
    }

    function inRange(from, to, timer) {
        return timer && timer.callAt >= from && timer.callAt <= to;
    }

    function mirrorDateProperties(target, source) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }

        // set special now implementation
        if (source.now) {
            target.now = function now() {
                return target.clock.now;
            };
        } else {
            delete target.now;
        }

        // set special toSource implementation
        if (source.toSource) {
            target.toSource = function toSource() {
                return source.toSource();
            };
        } else {
            delete target.toSource;
        }

        // set special toString implementation
        target.toString = function toString() {
            return source.toString();
        };

        target.prototype = source.prototype;
        target.parse = source.parse;
        target.UTC = source.UTC;
        target.prototype.toUTCString = source.prototype.toUTCString;

        return target;
    }

    function createDate() {
        function ClockDate(year, month, date, hour, minute, second, ms) {
            // Defensive and verbose to avoid potential harm in passing
            // explicit undefined when user does not pass argument
            switch (arguments.length) {
            case 0:
                return new NativeDate(ClockDate.clock.now);
            case 1:
                return new NativeDate(year);
            case 2:
                return new NativeDate(year, month);
            case 3:
                return new NativeDate(year, month, date);
            case 4:
                return new NativeDate(year, month, date, hour);
            case 5:
                return new NativeDate(year, month, date, hour, minute);
            case 6:
                return new NativeDate(year, month, date, hour, minute, second);
            default:
                return new NativeDate(year, month, date, hour, minute, second, ms);
            }
        }

        return mirrorDateProperties(ClockDate, NativeDate);
    }

    function addTimer(clock, timer) {
        if (timer.func === undefined) {
            throw new Error("Callback must be provided to timer calls");
        }

        if (!clock.timers) {
            clock.timers = {};
        }

        timer.id = uniqueTimerId++;
        timer.createdAt = clock.now;
        timer.callAt = clock.now + (timer.delay || (clock.duringTick ? 1 : 0));

        clock.timers[timer.id] = timer;

        if (addTimerReturnsObject) {
            return {
                id: timer.id,
                ref: NOOP,
                unref: NOOP
            };
        }

        return timer.id;
    }


    function compareTimers(a, b) {
        // Sort first by absolute timing
        if (a.callAt < b.callAt) {
            return -1;
        }
        if (a.callAt > b.callAt) {
            return 1;
        }

        // Sort next by immediate, immediate timers take precedence
        if (a.immediate && !b.immediate) {
            return -1;
        }
        if (!a.immediate && b.immediate) {
            return 1;
        }

        // Sort next by creation time, earlier-created timers take precedence
        if (a.createdAt < b.createdAt) {
            return -1;
        }
        if (a.createdAt > b.createdAt) {
            return 1;
        }

        // Sort next by id, lower-id timers take precedence
        if (a.id < b.id) {
            return -1;
        }
        if (a.id > b.id) {
            return 1;
        }

        // As timer ids are unique, no fallback `0` is necessary
    }

    function firstTimerInRange(clock, from, to) {
        var timers = clock.timers,
            timer = null,
            id,
            isInRange;

        for (id in timers) {
            if (timers.hasOwnProperty(id)) {
                isInRange = inRange(from, to, timers[id]);

                if (isInRange && (!timer || compareTimers(timer, timers[id]) === 1)) {
                    timer = timers[id];
                }
            }
        }

        return timer;
    }

    function callTimer(clock, timer) {
        var exception;

        if (typeof timer.interval === "number") {
            clock.timers[timer.id].callAt += timer.interval;
        } else {
            delete clock.timers[timer.id];
        }

        try {
            if (typeof timer.func === "function") {
                timer.func.apply(null, timer.args);
            } else {
                eval(timer.func);
            }
        } catch (e) {
            exception = e;
        }

        if (!clock.timers[timer.id]) {
            if (exception) {
                throw exception;
            }
            return;
        }

        if (exception) {
            throw exception;
        }
    }

    function timerType(timer) {
        if (timer.immediate) {
            return "Immediate";
        } else if (typeof timer.interval !== "undefined") {
            return "Interval";
        } else {
            return "Timeout";
        }
    }

    function clearTimer(clock, timerId, ttype) {
        if (!timerId) {
            // null appears to be allowed in most browsers, and appears to be
            // relied upon by some libraries, like Bootstrap carousel
            return;
        }

        if (!clock.timers) {
            clock.timers = [];
        }

        // in Node, timerId is an object with .ref()/.unref(), and
        // its .id field is the actual timer id.
        if (typeof timerId === "object") {
            timerId = timerId.id;
        }

        if (clock.timers.hasOwnProperty(timerId)) {
            // check that the ID matches a timer of the correct type
            var timer = clock.timers[timerId];
            if (timerType(timer) === ttype) {
                delete clock.timers[timerId];
            } else {
				throw new Error("Cannot clear timer: timer created with set" + ttype + "() but cleared with clear" + timerType(timer) + "()");
			}
        }
    }

    function uninstall(clock, target) {
        var method,
            i,
            l;

        for (i = 0, l = clock.methods.length; i < l; i++) {
            method = clock.methods[i];

            if (target[method].hadOwnProperty) {
                target[method] = clock["_" + method];
            } else {
                try {
                    delete target[method];
                } catch (ignore) {}
            }
        }

        // Prevent multiple executions which will completely remove these props
        clock.methods = [];
    }

    function hijackMethod(target, method, clock) {
        var prop;

        clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(target, method);
        clock["_" + method] = target[method];

        if (method === "Date") {
            var date = mirrorDateProperties(clock[method], target[method]);
            target[method] = date;
        } else {
            target[method] = function () {
                return clock[method].apply(clock, arguments);
            };

            for (prop in clock[method]) {
                if (clock[method].hasOwnProperty(prop)) {
                    target[method][prop] = clock[method][prop];
                }
            }
        }

        target[method].clock = clock;
    }

    var timers = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setImmediate: global.setImmediate,
        clearImmediate: global.clearImmediate,
        setInterval: setInterval,
        clearInterval: clearInterval,
        Date: Date
    };

    var keys = Object.keys || function (obj) {
        var ks = [],
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ks.push(key);
            }
        }

        return ks;
    };

    exports.timers = timers;

    function createClock(now) {
        var clock = {
            now: getEpoch(now),
            timeouts: {},
            Date: createDate()
        };

        clock.Date.clock = clock;

        clock.setTimeout = function setTimeout(func, timeout) {
            return addTimer(clock, {
                func: func,
                args: Array.prototype.slice.call(arguments, 2),
                delay: timeout
            });
        };

        clock.clearTimeout = function clearTimeout(timerId) {
            return clearTimer(clock, timerId, "Timeout");
        };

        clock.setInterval = function setInterval(func, timeout) {
            return addTimer(clock, {
                func: func,
                args: Array.prototype.slice.call(arguments, 2),
                delay: timeout,
                interval: timeout
            });
        };

        clock.clearInterval = function clearInterval(timerId) {
            return clearTimer(clock, timerId, "Interval");
        };

        clock.setImmediate = function setImmediate(func) {
            return addTimer(clock, {
                func: func,
                args: Array.prototype.slice.call(arguments, 1),
                immediate: true
            });
        };

        clock.clearImmediate = function clearImmediate(timerId) {
            return clearTimer(clock, timerId, "Immediate");
        };

        clock.tick = function tick(ms) {
            ms = typeof ms === "number" ? ms : parseTime(ms);
            var tickFrom = clock.now, tickTo = clock.now + ms, previous = clock.now;
            var timer = firstTimerInRange(clock, tickFrom, tickTo);
            var oldNow;

            clock.duringTick = true;

            var firstException;
            while (timer && tickFrom <= tickTo) {
                if (clock.timers[timer.id]) {
                    tickFrom = clock.now = timer.callAt;
                    try {
                        oldNow = clock.now;
                        callTimer(clock, timer);
                        // compensate for any setSystemTime() call during timer callback
                        if (oldNow !== clock.now) {
                            tickFrom += clock.now - oldNow;
                            tickTo += clock.now - oldNow;
                            previous += clock.now - oldNow;
                        }
                    } catch (e) {
                        firstException = firstException || e;
                    }
                }

                timer = firstTimerInRange(clock, previous, tickTo);
                previous = tickFrom;
            }

            clock.duringTick = false;
            clock.now = tickTo;

            if (firstException) {
                throw firstException;
            }

            return clock.now;
        };

        clock.reset = function reset() {
            clock.timers = {};
        };

        clock.setSystemTime = function setSystemTime(now) {
            // determine time difference
            var newNow = getEpoch(now);
            var difference = newNow - clock.now;

            // update 'system clock'
            clock.now = newNow;

            // update timers and intervals to keep them stable
            for (var id in clock.timers) {
                if (clock.timers.hasOwnProperty(id)) {
                    var timer = clock.timers[id];
                    timer.createdAt += difference;
                    timer.callAt += difference;
                }
            }
        };

        return clock;
    }
    exports.createClock = createClock;

    exports.install = function install(target, now, toFake) {
        var i,
            l;

        if (typeof target === "number") {
            toFake = now;
            now = target;
            target = null;
        }

        if (!target) {
            target = global;
        }

        var clock = createClock(now);

        clock.uninstall = function () {
            uninstall(clock, target);
        };

        clock.methods = toFake || [];

        if (clock.methods.length === 0) {
            clock.methods = keys(timers);
        }

        for (i = 0, l = clock.methods.length; i < l; i++) {
            hijackMethod(target, clock.methods[i], clock);
        }

        return clock;
    };

}(global || this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
  })();
  var define;
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
var sinon = (function () {
"use strict";
 // eslint-disable-line no-unused-vars
    
    var sinonModule;
    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        sinonModule = module.exports = require("./sinon/util/core");
        require("./sinon/extend");
        require("./sinon/walk");
        require("./sinon/typeOf");
        require("./sinon/times_in_words");
        require("./sinon/spy");
        require("./sinon/call");
        require("./sinon/behavior");
        require("./sinon/stub");
        require("./sinon/mock");
        require("./sinon/collection");
        require("./sinon/assert");
        require("./sinon/sandbox");
        require("./sinon/test");
        require("./sinon/test_case");
        require("./sinon/match");
        require("./sinon/format");
        require("./sinon/log_error");
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
        sinonModule = module.exports;
    } else {
        sinonModule = {};
    }

    return sinonModule;
}());

/**
 * @depend ../../sinon.js
 */
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    var div = typeof document !== "undefined" && document.createElement("div");
    var hasOwn = Object.prototype.hasOwnProperty;

    function isDOMNode(obj) {
        var success = false;

        try {
            obj.appendChild(div);
            success = div.parentNode === obj;
        } catch (e) {
            return false;
        } finally {
            try {
                obj.removeChild(div);
            } catch (e) {
                // Remove failed, not much we can do about that
            }
        }

        return success;
    }

    function isElement(obj) {
        return div && obj && obj.nodeType === 1 && isDOMNode(obj);
    }

    function isFunction(obj) {
        return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function isReallyNaN(val) {
        return typeof val === "number" && isNaN(val);
    }

    function mirrorProperties(target, source) {
        for (var prop in source) {
            if (!hasOwn.call(target, prop)) {
                target[prop] = source[prop];
            }
        }
    }

    function isRestorable(obj) {
        return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
    }

    // Cheap way to detect if we have ES5 support.
    var hasES5Support = "keys" in Object;

    function makeApi(sinon) {
        sinon.wrapMethod = function wrapMethod(object, property, method) {
            if (!object) {
                throw new TypeError("Should wrap property of object");
            }

            if (typeof method !== "function" && typeof method !== "object") {
                throw new TypeError("Method wrapper should be a function or a property descriptor");
            }

            function checkWrappedMethod(wrappedMethod) {
                var error;

                if (!isFunction(wrappedMethod)) {
                    error = new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                        property + " as function");
                } else if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
                    error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
                } else if (wrappedMethod.calledBefore) {
                    var verb = wrappedMethod.returns ? "stubbed" : "spied on";
                    error = new TypeError("Attempted to wrap " + property + " which is already " + verb);
                }

                if (error) {
                    if (wrappedMethod && wrappedMethod.stackTrace) {
                        error.stack += "\n--------------\n" + wrappedMethod.stackTrace;
                    }
                    throw error;
                }
            }

            var error, wrappedMethod, i;

            // IE 8 does not support hasOwnProperty on the window object and Firefox has a problem
            // when using hasOwn.call on objects from other frames.
            var owned = object.hasOwnProperty ? object.hasOwnProperty(property) : hasOwn.call(object, property);

            if (hasES5Support) {
                var methodDesc = (typeof method === "function") ? {value: method} : method;
                var wrappedMethodDesc = sinon.getPropertyDescriptor(object, property);

                if (!wrappedMethodDesc) {
                    error = new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                        property + " as function");
                } else if (wrappedMethodDesc.restore && wrappedMethodDesc.restore.sinon) {
                    error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
                }
                if (error) {
                    if (wrappedMethodDesc && wrappedMethodDesc.stackTrace) {
                        error.stack += "\n--------------\n" + wrappedMethodDesc.stackTrace;
                    }
                    throw error;
                }

                var types = sinon.objectKeys(methodDesc);
                for (i = 0; i < types.length; i++) {
                    wrappedMethod = wrappedMethodDesc[types[i]];
                    checkWrappedMethod(wrappedMethod);
                }

                mirrorProperties(methodDesc, wrappedMethodDesc);
                for (i = 0; i < types.length; i++) {
                    mirrorProperties(methodDesc[types[i]], wrappedMethodDesc[types[i]]);
                }
                Object.defineProperty(object, property, methodDesc);
            } else {
                wrappedMethod = object[property];
                checkWrappedMethod(wrappedMethod);
                object[property] = method;
                method.displayName = property;
            }

            method.displayName = property;

            // Set up a stack trace which can be used later to find what line of
            // code the original method was created on.
            method.stackTrace = (new Error("Stack Trace for original")).stack;

            method.restore = function () {
                // For prototype properties try to reset by delete first.
                // If this fails (ex: localStorage on mobile safari) then force a reset
                // via direct assignment.
                if (!owned) {
                    // In some cases `delete` may throw an error
                    try {
                        delete object[property];
                    } catch (e) {} // eslint-disable-line no-empty
                    // For native code functions `delete` fails without throwing an error
                    // on Chrome < 43, PhantomJS, etc.
                } else if (hasES5Support) {
                    Object.defineProperty(object, property, wrappedMethodDesc);
                }

                // Use strict equality comparison to check failures then force a reset
                // via direct assignment.
                if (object[property] === method) {
                    object[property] = wrappedMethod;
                }
            };

            method.restore.sinon = true;

            if (!hasES5Support) {
                mirrorProperties(method, wrappedMethod);
            }

            return method;
        };

        sinon.create = function create(proto) {
            var F = function () {};
            F.prototype = proto;
            return new F();
        };

        sinon.deepEqual = function deepEqual(a, b) {
            if (sinon.match && sinon.match.isMatcher(a)) {
                return a.test(b);
            }

            if (typeof a !== "object" || typeof b !== "object") {
                return isReallyNaN(a) && isReallyNaN(b) || a === b;
            }

            if (isElement(a) || isElement(b)) {
                return a === b;
            }

            if (a === b) {
                return true;
            }

            if ((a === null && b !== null) || (a !== null && b === null)) {
                return false;
            }

            if (a instanceof RegExp && b instanceof RegExp) {
                return (a.source === b.source) && (a.global === b.global) &&
                    (a.ignoreCase === b.ignoreCase) && (a.multiline === b.multiline);
            }

            var aString = Object.prototype.toString.call(a);
            if (aString !== Object.prototype.toString.call(b)) {
                return false;
            }

            if (aString === "[object Date]") {
                return a.valueOf() === b.valueOf();
            }

            var prop;
            var aLength = 0;
            var bLength = 0;

            if (aString === "[object Array]" && a.length !== b.length) {
                return false;
            }

            for (prop in a) {
                if (hasOwn.call(a, prop)) {
                    aLength += 1;

                    if (!(prop in b)) {
                        return false;
                    }

                    if (!deepEqual(a[prop], b[prop])) {
                        return false;
                    }
                }
            }

            for (prop in b) {
                if (hasOwn.call(b, prop)) {
                    bLength += 1;
                }
            }

            return aLength === bLength;
        };

        sinon.functionName = function functionName(func) {
            var name = func.displayName || func.name;

            // Use function decomposition as a last resort to get function
            // name. Does not rely on function decomposition to work - if it
            // doesn't debugging will be slightly less informative
            // (i.e. toString will say 'spy' rather than 'myFunc').
            if (!name) {
                var matches = func.toString().match(/function ([^\s\(]+)/);
                name = matches && matches[1];
            }

            return name;
        };

        sinon.functionToString = function toString() {
            if (this.getCall && this.callCount) {
                var thisValue,
                    prop;
                var i = this.callCount;

                while (i--) {
                    thisValue = this.getCall(i).thisValue;

                    for (prop in thisValue) {
                        if (thisValue[prop] === this) {
                            return prop;
                        }
                    }
                }
            }

            return this.displayName || "sinon fake";
        };

        sinon.objectKeys = function objectKeys(obj) {
            if (obj !== Object(obj)) {
                throw new TypeError("sinon.objectKeys called on a non-object");
            }

            var keys = [];
            var key;
            for (key in obj) {
                if (hasOwn.call(obj, key)) {
                    keys.push(key);
                }
            }

            return keys;
        };

        sinon.getPropertyDescriptor = function getPropertyDescriptor(object, property) {
            var proto = object;
            var descriptor;

            while (proto && !(descriptor = Object.getOwnPropertyDescriptor(proto, property))) {
                proto = Object.getPrototypeOf(proto);
            }
            return descriptor;
        };

        sinon.getConfig = function (custom) {
            var config = {};
            custom = custom || {};
            var defaults = sinon.defaultConfig;

            for (var prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
                }
            }

            return config;
        };

        sinon.defaultConfig = {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        };

        sinon.timesInWords = function timesInWords(count) {
            return count === 1 && "once" ||
                count === 2 && "twice" ||
                count === 3 && "thrice" ||
                (count || 0) + " times";
        };

        sinon.calledInOrder = function (spies) {
            for (var i = 1, l = spies.length; i < l; i++) {
                if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
                    return false;
                }
            }

            return true;
        };

        sinon.orderByFirstCall = function (spies) {
            return spies.sort(function (a, b) {
                // uuid, won't ever be equal
                var aCall = a.getCall(0);
                var bCall = b.getCall(0);
                var aId = aCall && aCall.callId || -1;
                var bId = bCall && bCall.callId || -1;

                return aId < bId ? -1 : 1;
            });
        };

        sinon.createStubInstance = function (constructor) {
            if (typeof constructor !== "function") {
                throw new TypeError("The constructor should be a function.");
            }
            return sinon.stub(sinon.create(constructor.prototype));
        };

        sinon.restore = function (object) {
            if (object !== null && typeof object === "object") {
                for (var prop in object) {
                    if (isRestorable(object[prop])) {
                        object[prop].restore();
                    }
                }
            } else if (isRestorable(object)) {
                object.restore();
            }
        };

        return sinon;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports) {
        makeApi(exports);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {

        // Adapted from https://developer.mozilla.org/en/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
        var hasDontEnumBug = (function () {
            var obj = {
                constructor: function () {
                    return "0";
                },
                toString: function () {
                    return "1";
                },
                valueOf: function () {
                    return "2";
                },
                toLocaleString: function () {
                    return "3";
                },
                prototype: function () {
                    return "4";
                },
                isPrototypeOf: function () {
                    return "5";
                },
                propertyIsEnumerable: function () {
                    return "6";
                },
                hasOwnProperty: function () {
                    return "7";
                },
                length: function () {
                    return "8";
                },
                unique: function () {
                    return "9";
                }
            };

            var result = [];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    result.push(obj[prop]());
                }
            }
            return result.join("") !== "0123456789";
        })();

        /* Public: Extend target in place with all (own) properties from sources in-order. Thus, last source will
         *         override properties in previous sources.
         *
         * target - The Object to extend
         * sources - Objects to copy properties from.
         *
         * Returns the extended target
         */
        function extend(target /*, sources */) {
            var sources = Array.prototype.slice.call(arguments, 1);
            var source, i, prop;

            for (i = 0; i < sources.length; i++) {
                source = sources[i];

                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        target[prop] = source[prop];
                    }
                }

                // Make sure we copy (own) toString method even when in JScript with DontEnum bug
                // See https://developer.mozilla.org/en/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
                if (hasDontEnumBug && source.hasOwnProperty("toString") && source.toString !== target.toString) {
                    target.toString = source.toString;
                }
            }

            return target;
        }

        sinon.extend = extend;
        return sinon.extend;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {

        function timesInWords(count) {
            switch (count) {
                case 1:
                    return "once";
                case 2:
                    return "twice";
                case 3:
                    return "thrice";
                default:
                    return (count || 0) + " times";
            }
        }

        sinon.timesInWords = timesInWords;
        return sinon.timesInWords;
    }

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        module.exports = makeApi(core);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 */
/**
 * Format functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        function typeOf(value) {
            if (value === null) {
                return "null";
            } else if (value === undefined) {
                return "undefined";
            }
            var string = Object.prototype.toString.call(value);
            return string.substring(8, string.length - 1).toLowerCase();
        }

        sinon.typeOf = typeOf;
        return sinon.typeOf;
    }

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        module.exports = makeApi(core);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 * @depend typeOf.js
 */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Match functions
 *
 * @author Maximilian Antoni (mail@maxantoni.de)
 * @license BSD
 *
 * Copyright (c) 2012 Maximilian Antoni
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        function assertType(value, type, name) {
            var actual = sinon.typeOf(value);
            if (actual !== type) {
                throw new TypeError("Expected type of " + name + " to be " +
                    type + ", but was " + actual);
            }
        }

        var matcher = {
            toString: function () {
                return this.message;
            }
        };

        function isMatcher(object) {
            return matcher.isPrototypeOf(object);
        }

        function matchObject(expectation, actual) {
            if (actual === null || actual === undefined) {
                return false;
            }
            for (var key in expectation) {
                if (expectation.hasOwnProperty(key)) {
                    var exp = expectation[key];
                    var act = actual[key];
                    if (isMatcher(exp)) {
                        if (!exp.test(act)) {
                            return false;
                        }
                    } else if (sinon.typeOf(exp) === "object") {
                        if (!matchObject(exp, act)) {
                            return false;
                        }
                    } else if (!sinon.deepEqual(exp, act)) {
                        return false;
                    }
                }
            }
            return true;
        }

        function match(expectation, message) {
            var m = sinon.create(matcher);
            var type = sinon.typeOf(expectation);
            switch (type) {
            case "object":
                if (typeof expectation.test === "function") {
                    m.test = function (actual) {
                        return expectation.test(actual) === true;
                    };
                    m.message = "match(" + sinon.functionName(expectation.test) + ")";
                    return m;
                }
                var str = [];
                for (var key in expectation) {
                    if (expectation.hasOwnProperty(key)) {
                        str.push(key + ": " + expectation[key]);
                    }
                }
                m.test = function (actual) {
                    return matchObject(expectation, actual);
                };
                m.message = "match(" + str.join(", ") + ")";
                break;
            case "number":
                m.test = function (actual) {
                    // we need type coercion here
                    return expectation == actual; // eslint-disable-line eqeqeq
                };
                break;
            case "string":
                m.test = function (actual) {
                    if (typeof actual !== "string") {
                        return false;
                    }
                    return actual.indexOf(expectation) !== -1;
                };
                m.message = "match(\"" + expectation + "\")";
                break;
            case "regexp":
                m.test = function (actual) {
                    if (typeof actual !== "string") {
                        return false;
                    }
                    return expectation.test(actual);
                };
                break;
            case "function":
                m.test = expectation;
                if (message) {
                    m.message = message;
                } else {
                    m.message = "match(" + sinon.functionName(expectation) + ")";
                }
                break;
            default:
                m.test = function (actual) {
                    return sinon.deepEqual(expectation, actual);
                };
            }
            if (!m.message) {
                m.message = "match(" + expectation + ")";
            }
            return m;
        }

        matcher.or = function (m2) {
            if (!arguments.length) {
                throw new TypeError("Matcher expected");
            } else if (!isMatcher(m2)) {
                m2 = match(m2);
            }
            var m1 = this;
            var or = sinon.create(matcher);
            or.test = function (actual) {
                return m1.test(actual) || m2.test(actual);
            };
            or.message = m1.message + ".or(" + m2.message + ")";
            return or;
        };

        matcher.and = function (m2) {
            if (!arguments.length) {
                throw new TypeError("Matcher expected");
            } else if (!isMatcher(m2)) {
                m2 = match(m2);
            }
            var m1 = this;
            var and = sinon.create(matcher);
            and.test = function (actual) {
                return m1.test(actual) && m2.test(actual);
            };
            and.message = m1.message + ".and(" + m2.message + ")";
            return and;
        };

        match.isMatcher = isMatcher;

        match.any = match(function () {
            return true;
        }, "any");

        match.defined = match(function (actual) {
            return actual !== null && actual !== undefined;
        }, "defined");

        match.truthy = match(function (actual) {
            return !!actual;
        }, "truthy");

        match.falsy = match(function (actual) {
            return !actual;
        }, "falsy");

        match.same = function (expectation) {
            return match(function (actual) {
                return expectation === actual;
            }, "same(" + expectation + ")");
        };

        match.typeOf = function (type) {
            assertType(type, "string", "type");
            return match(function (actual) {
                return sinon.typeOf(actual) === type;
            }, "typeOf(\"" + type + "\")");
        };

        match.instanceOf = function (type) {
            assertType(type, "function", "type");
            return match(function (actual) {
                return actual instanceof type;
            }, "instanceOf(" + sinon.functionName(type) + ")");
        };

        function createPropertyMatcher(propertyTest, messagePrefix) {
            return function (property, value) {
                assertType(property, "string", "property");
                var onlyProperty = arguments.length === 1;
                var message = messagePrefix + "(\"" + property + "\"";
                if (!onlyProperty) {
                    message += ", " + value;
                }
                message += ")";
                return match(function (actual) {
                    if (actual === undefined || actual === null ||
                            !propertyTest(actual, property)) {
                        return false;
                    }
                    return onlyProperty || sinon.deepEqual(value, actual[property]);
                }, message);
            };
        }

        match.has = createPropertyMatcher(function (actual, property) {
            if (typeof actual === "object") {
                return property in actual;
            }
            return actual[property] !== undefined;
        }, "has");

        match.hasOwn = createPropertyMatcher(function (actual, property) {
            return actual.hasOwnProperty(property);
        }, "hasOwn");

        match.bool = match.typeOf("boolean");
        match.number = match.typeOf("number");
        match.string = match.typeOf("string");
        match.object = match.typeOf("object");
        match.func = match.typeOf("function");
        match.array = match.typeOf("array");
        match.regexp = match.typeOf("regexp");
        match.date = match.typeOf("date");

        sinon.match = match;
        return match;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./typeOf");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 */
/**
 * Format functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal, formatio) {
    
    function makeApi(sinon) {
        function valueFormatter(value) {
            return "" + value;
        }

        function getFormatioFormatter() {
            var formatter = formatio.configure({
                    quoteStrings: false,
                    limitChildrenCount: 250
                });

            function format() {
                return formatter.ascii.apply(formatter, arguments);
            }

            return format;
        }

        function getNodeFormatter() {
            try {
                var util = require("util");
            } catch (e) {
                /* Node, but no util module - would be very old, but better safe than sorry */
            }

            function format(v) {
                var isObjectWithNativeToString = typeof v === "object" && v.toString === Object.prototype.toString;
                return isObjectWithNativeToString ? util.inspect(v) : v;
            }

            return util ? format : valueFormatter;
        }

        var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
        var formatter;

        if (isNode) {
            try {
                formatio = require("formatio");
            }
            catch (e) {} // eslint-disable-line no-empty
        }

        if (formatio) {
            formatter = getFormatioFormatter();
        } else if (isNode) {
            formatter = getNodeFormatter();
        } else {
            formatter = valueFormatter;
        }

        sinon.format = formatter;
        return sinon.format;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof formatio === "object" && formatio // eslint-disable-line no-undef
));

/**
  * @depend util/core.js
  * @depend match.js
  * @depend format.js
  */
/**
  * Spy calls
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @author Maximilian Antoni (mail@maxantoni.de)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  * Copyright (c) 2013 Maximilian Antoni
  */
(function (sinonGlobal) {
    
    var slice = Array.prototype.slice;

    function makeApi(sinon) {
        function throwYieldError(proxy, text, args) {
            var msg = sinon.functionName(proxy) + text;
            if (args.length) {
                msg += " Received [" + slice.call(args).join(", ") + "]";
            }
            throw new Error(msg);
        }

        var callProto = {
            calledOn: function calledOn(thisValue) {
                if (sinon.match && sinon.match.isMatcher(thisValue)) {
                    return thisValue.test(this.thisValue);
                }
                return this.thisValue === thisValue;
            },

            calledWith: function calledWith() {
                var l = arguments.length;
                if (l > this.args.length) {
                    return false;
                }
                for (var i = 0; i < l; i += 1) {
                    if (!sinon.deepEqual(arguments[i], this.args[i])) {
                        return false;
                    }
                }

                return true;
            },

            calledWithMatch: function calledWithMatch() {
                var l = arguments.length;
                if (l > this.args.length) {
                    return false;
                }
                for (var i = 0; i < l; i += 1) {
                    var actual = this.args[i];
                    var expectation = arguments[i];
                    if (!sinon.match || !sinon.match(expectation).test(actual)) {
                        return false;
                    }
                }
                return true;
            },

            calledWithExactly: function calledWithExactly() {
                return arguments.length === this.args.length &&
                    this.calledWith.apply(this, arguments);
            },

            notCalledWith: function notCalledWith() {
                return !this.calledWith.apply(this, arguments);
            },

            notCalledWithMatch: function notCalledWithMatch() {
                return !this.calledWithMatch.apply(this, arguments);
            },

            returned: function returned(value) {
                return sinon.deepEqual(value, this.returnValue);
            },

            threw: function threw(error) {
                if (typeof error === "undefined" || !this.exception) {
                    return !!this.exception;
                }

                return this.exception === error || this.exception.name === error;
            },

            calledWithNew: function calledWithNew() {
                return this.proxy.prototype && this.thisValue instanceof this.proxy;
            },

            calledBefore: function (other) {
                return this.callId < other.callId;
            },

            calledAfter: function (other) {
                return this.callId > other.callId;
            },

            callArg: function (pos) {
                this.args[pos]();
            },

            callArgOn: function (pos, thisValue) {
                this.args[pos].apply(thisValue);
            },

            callArgWith: function (pos) {
                this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));
            },

            callArgOnWith: function (pos, thisValue) {
                var args = slice.call(arguments, 2);
                this.args[pos].apply(thisValue, args);
            },

            "yield": function () {
                this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));
            },

            yieldOn: function (thisValue) {
                var args = this.args;
                for (var i = 0, l = args.length; i < l; ++i) {
                    if (typeof args[i] === "function") {
                        args[i].apply(thisValue, slice.call(arguments, 1));
                        return;
                    }
                }
                throwYieldError(this.proxy, " cannot yield since no callback was passed.", args);
            },

            yieldTo: function (prop) {
                this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));
            },

            yieldToOn: function (prop, thisValue) {
                var args = this.args;
                for (var i = 0, l = args.length; i < l; ++i) {
                    if (args[i] && typeof args[i][prop] === "function") {
                        args[i][prop].apply(thisValue, slice.call(arguments, 2));
                        return;
                    }
                }
                throwYieldError(this.proxy, " cannot yield to '" + prop +
                    "' since no callback was passed.", args);
            },

            getStackFrames: function () {
                // Omit the error message and the two top stack frames in sinon itself:
                return this.stack && this.stack.split("\n").slice(3);
            },

            toString: function () {
                var callStr = this.proxy ? this.proxy.toString() + "(" : "";
                var args = [];

                if (!this.args) {
                    return ":(";
                }

                for (var i = 0, l = this.args.length; i < l; ++i) {
                    args.push(sinon.format(this.args[i]));
                }

                callStr = callStr + args.join(", ") + ")";

                if (typeof this.returnValue !== "undefined") {
                    callStr += " => " + sinon.format(this.returnValue);
                }

                if (this.exception) {
                    callStr += " !" + this.exception.name;

                    if (this.exception.message) {
                        callStr += "(" + this.exception.message + ")";
                    }
                }
                if (this.stack) {
                    callStr += this.getStackFrames()[0].replace(/^\s*(?:at\s+|@)?/, " at ");

                }

                return callStr;
            }
        };

        callProto.invokeCallback = callProto.yield;

        function createSpyCall(spy, thisValue, args, returnValue, exception, id, stack) {
            if (typeof id !== "number") {
                throw new TypeError("Call id is not a number");
            }
            var proxyCall = sinon.create(callProto);
            proxyCall.proxy = spy;
            proxyCall.thisValue = thisValue;
            proxyCall.args = args;
            proxyCall.returnValue = returnValue;
            proxyCall.exception = exception;
            proxyCall.callId = id;
            proxyCall.stack = stack;

            return proxyCall;
        }
        createSpyCall.toString = callProto.toString; // used by mocks

        sinon.spyCall = createSpyCall;
        return createSpyCall;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./match");
        require("./format");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
  * @depend times_in_words.js
  * @depend util/core.js
  * @depend extend.js
  * @depend call.js
  * @depend format.js
  */
/**
  * Spy functions
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        var push = Array.prototype.push;
        var slice = Array.prototype.slice;
        var callId = 0;

        function spy(object, property, types) {
            if (!property && typeof object === "function") {
                return spy.create(object);
            }

            if (!object && !property) {
                return spy.create(function () { });
            }

            if (types) {
                var methodDesc = sinon.getPropertyDescriptor(object, property);
                for (var i = 0; i < types.length; i++) {
                    methodDesc[types[i]] = spy.create(methodDesc[types[i]]);
                }
                return sinon.wrapMethod(object, property, methodDesc);
            }

            return sinon.wrapMethod(object, property, spy.create(object[property]));
        }

        function matchingFake(fakes, args, strict) {
            if (!fakes) {
                return undefined;
            }

            for (var i = 0, l = fakes.length; i < l; i++) {
                if (fakes[i].matches(args, strict)) {
                    return fakes[i];
                }
            }
        }

        function incrementCallCount() {
            this.called = true;
            this.callCount += 1;
            this.notCalled = false;
            this.calledOnce = this.callCount === 1;
            this.calledTwice = this.callCount === 2;
            this.calledThrice = this.callCount === 3;
        }

        function createCallProperties() {
            this.firstCall = this.getCall(0);
            this.secondCall = this.getCall(1);
            this.thirdCall = this.getCall(2);
            this.lastCall = this.getCall(this.callCount - 1);
        }

        var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
        function createProxy(func, proxyLength) {
            // Retain the function length:
            var p;
            if (proxyLength) {
                eval("p = (function proxy(" + vars.substring(0, proxyLength * 2 - 1) + // eslint-disable-line no-eval
                    ") { return p.invoke(func, this, slice.call(arguments)); });");
            } else {
                p = function proxy() {
                    return p.invoke(func, this, slice.call(arguments));
                };
            }
            p.isSinonProxy = true;
            return p;
        }

        var uuid = 0;

        // Public API
        var spyApi = {
            reset: function () {
                if (this.invoking) {
                    var err = new Error("Cannot reset Sinon function while invoking it. " +
                                        "Move the call to .reset outside of the callback.");
                    err.name = "InvalidResetException";
                    throw err;
                }

                this.called = false;
                this.notCalled = true;
                this.calledOnce = false;
                this.calledTwice = false;
                this.calledThrice = false;
                this.callCount = 0;
                this.firstCall = null;
                this.secondCall = null;
                this.thirdCall = null;
                this.lastCall = null;
                this.args = [];
                this.returnValues = [];
                this.thisValues = [];
                this.exceptions = [];
                this.callIds = [];
                this.stacks = [];
                if (this.fakes) {
                    for (var i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].reset();
                    }
                }

                return this;
            },

            create: function create(func, spyLength) {
                var name;

                if (typeof func !== "function") {
                    func = function () { };
                } else {
                    name = sinon.functionName(func);
                }

                if (!spyLength) {
                    spyLength = func.length;
                }

                var proxy = createProxy(func, spyLength);

                sinon.extend(proxy, spy);
                delete proxy.create;
                sinon.extend(proxy, func);

                proxy.reset();
                proxy.prototype = func.prototype;
                proxy.displayName = name || "spy";
                proxy.toString = sinon.functionToString;
                proxy.instantiateFake = sinon.spy.create;
                proxy.id = "spy#" + uuid++;

                return proxy;
            },

            invoke: function invoke(func, thisValue, args) {
                var matching = matchingFake(this.fakes, args);
                var exception, returnValue;

                incrementCallCount.call(this);
                push.call(this.thisValues, thisValue);
                push.call(this.args, args);
                push.call(this.callIds, callId++);

                // Make call properties available from within the spied function:
                createCallProperties.call(this);

                try {
                    this.invoking = true;

                    if (matching) {
                        returnValue = matching.invoke(func, thisValue, args);
                    } else {
                        returnValue = (this.func || func).apply(thisValue, args);
                    }

                    var thisCall = this.getCall(this.callCount - 1);
                    if (thisCall.calledWithNew() && typeof returnValue !== "object") {
                        returnValue = thisValue;
                    }
                } catch (e) {
                    exception = e;
                } finally {
                    delete this.invoking;
                }

                push.call(this.exceptions, exception);
                push.call(this.returnValues, returnValue);
                push.call(this.stacks, new Error().stack);

                // Make return value and exception available in the calls:
                createCallProperties.call(this);

                if (exception !== undefined) {
                    throw exception;
                }

                return returnValue;
            },

            named: function named(name) {
                this.displayName = name;
                return this;
            },

            getCall: function getCall(i) {
                if (i < 0 || i >= this.callCount) {
                    return null;
                }

                return sinon.spyCall(this, this.thisValues[i], this.args[i],
                                        this.returnValues[i], this.exceptions[i],
                                        this.callIds[i], this.stacks[i]);
            },

            getCalls: function () {
                var calls = [];
                var i;

                for (i = 0; i < this.callCount; i++) {
                    calls.push(this.getCall(i));
                }

                return calls;
            },

            calledBefore: function calledBefore(spyFn) {
                if (!this.called) {
                    return false;
                }

                if (!spyFn.called) {
                    return true;
                }

                return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];
            },

            calledAfter: function calledAfter(spyFn) {
                if (!this.called || !spyFn.called) {
                    return false;
                }

                return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];
            },

            withArgs: function () {
                var args = slice.call(arguments);

                if (this.fakes) {
                    var match = matchingFake(this.fakes, args, true);

                    if (match) {
                        return match;
                    }
                } else {
                    this.fakes = [];
                }

                var original = this;
                var fake = this.instantiateFake();
                fake.matchingAguments = args;
                fake.parent = this;
                push.call(this.fakes, fake);

                fake.withArgs = function () {
                    return original.withArgs.apply(original, arguments);
                };

                for (var i = 0; i < this.args.length; i++) {
                    if (fake.matches(this.args[i])) {
                        incrementCallCount.call(fake);
                        push.call(fake.thisValues, this.thisValues[i]);
                        push.call(fake.args, this.args[i]);
                        push.call(fake.returnValues, this.returnValues[i]);
                        push.call(fake.exceptions, this.exceptions[i]);
                        push.call(fake.callIds, this.callIds[i]);
                    }
                }
                createCallProperties.call(fake);

                return fake;
            },

            matches: function (args, strict) {
                var margs = this.matchingAguments;

                if (margs.length <= args.length &&
                    sinon.deepEqual(margs, args.slice(0, margs.length))) {
                    return !strict || margs.length === args.length;
                }
            },

            printf: function (format) {
                var spyInstance = this;
                var args = slice.call(arguments, 1);
                var formatter;

                return (format || "").replace(/%(.)/g, function (match, specifyer) {
                    formatter = spyApi.formatters[specifyer];

                    if (typeof formatter === "function") {
                        return formatter.call(null, spyInstance, args);
                    } else if (!isNaN(parseInt(specifyer, 10))) {
                        return sinon.format(args[specifyer - 1]);
                    }

                    return "%" + specifyer;
                });
            }
        };

        function delegateToCalls(method, matchAny, actual, notCalled) {
            spyApi[method] = function () {
                if (!this.called) {
                    if (notCalled) {
                        return notCalled.apply(this, arguments);
                    }
                    return false;
                }

                var currentCall;
                var matches = 0;

                for (var i = 0, l = this.callCount; i < l; i += 1) {
                    currentCall = this.getCall(i);

                    if (currentCall[actual || method].apply(currentCall, arguments)) {
                        matches += 1;

                        if (matchAny) {
                            return true;
                        }
                    }
                }

                return matches === this.callCount;
            };
        }

        delegateToCalls("calledOn", true);
        delegateToCalls("alwaysCalledOn", false, "calledOn");
        delegateToCalls("calledWith", true);
        delegateToCalls("calledWithMatch", true);
        delegateToCalls("alwaysCalledWith", false, "calledWith");
        delegateToCalls("alwaysCalledWithMatch", false, "calledWithMatch");
        delegateToCalls("calledWithExactly", true);
        delegateToCalls("alwaysCalledWithExactly", false, "calledWithExactly");
        delegateToCalls("neverCalledWith", false, "notCalledWith", function () {
            return true;
        });
        delegateToCalls("neverCalledWithMatch", false, "notCalledWithMatch", function () {
            return true;
        });
        delegateToCalls("threw", true);
        delegateToCalls("alwaysThrew", false, "threw");
        delegateToCalls("returned", true);
        delegateToCalls("alwaysReturned", false, "returned");
        delegateToCalls("calledWithNew", true);
        delegateToCalls("alwaysCalledWithNew", false, "calledWithNew");
        delegateToCalls("callArg", false, "callArgWith", function () {
            throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
        });
        spyApi.callArgWith = spyApi.callArg;
        delegateToCalls("callArgOn", false, "callArgOnWith", function () {
            throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
        });
        spyApi.callArgOnWith = spyApi.callArgOn;
        delegateToCalls("yield", false, "yield", function () {
            throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
        });
        // "invokeCallback" is an alias for "yield" since "yield" is invalid in strict mode.
        spyApi.invokeCallback = spyApi.yield;
        delegateToCalls("yieldOn", false, "yieldOn", function () {
            throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
        });
        delegateToCalls("yieldTo", false, "yieldTo", function (property) {
            throw new Error(this.toString() + " cannot yield to '" + property +
                "' since it was not yet invoked.");
        });
        delegateToCalls("yieldToOn", false, "yieldToOn", function (property) {
            throw new Error(this.toString() + " cannot yield to '" + property +
                "' since it was not yet invoked.");
        });

        spyApi.formatters = {
            c: function (spyInstance) {
                return sinon.timesInWords(spyInstance.callCount);
            },

            n: function (spyInstance) {
                return spyInstance.toString();
            },

            C: function (spyInstance) {
                var calls = [];

                for (var i = 0, l = spyInstance.callCount; i < l; ++i) {
                    var stringifiedCall = "    " + spyInstance.getCall(i).toString();
                    if (/\n/.test(calls[i - 1])) {
                        stringifiedCall = "\n" + stringifiedCall;
                    }
                    push.call(calls, stringifiedCall);
                }

                return calls.length > 0 ? "\n" + calls.join("\n") : "";
            },

            t: function (spyInstance) {
                var objects = [];

                for (var i = 0, l = spyInstance.callCount; i < l; ++i) {
                    push.call(objects, sinon.format(spyInstance.thisValues[i]));
                }

                return objects.join(", ");
            },

            "*": function (spyInstance, args) {
                var formatted = [];

                for (var i = 0, l = args.length; i < l; ++i) {
                    push.call(formatted, sinon.format(args[i]));
                }

                return formatted.join(", ");
            }
        };

        sinon.extend(spy, spyApi);

        spy.spyCall = sinon.spyCall;
        sinon.spy = spy;

        return spy;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./call");
        require("./extend");
        require("./times_in_words");
        require("./format");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 * @depend extend.js
 */
/**
 * Stub behavior
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Tim Fischbach (mail@timfischbach.de)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    var slice = Array.prototype.slice;
    var join = Array.prototype.join;
    var useLeftMostCallback = -1;
    var useRightMostCallback = -2;

    var nextTick = (function () {
        if (typeof process === "object" && typeof process.nextTick === "function") {
            return process.nextTick;
        }

        if (typeof setImmediate === "function") {
            return setImmediate;
        }

        return function (callback) {
            setTimeout(callback, 0);
        };
    })();

    function throwsException(error, message) {
        if (typeof error === "string") {
            this.exception = new Error(message || "");
            this.exception.name = error;
        } else if (!error) {
            this.exception = new Error("Error");
        } else {
            this.exception = error;
        }

        return this;
    }

    function getCallback(behavior, args) {
        var callArgAt = behavior.callArgAt;

        if (callArgAt >= 0) {
            return args[callArgAt];
        }

        var argumentList;

        if (callArgAt === useLeftMostCallback) {
            argumentList = args;
        }

        if (callArgAt === useRightMostCallback) {
            argumentList = slice.call(args).reverse();
        }

        var callArgProp = behavior.callArgProp;

        for (var i = 0, l = argumentList.length; i < l; ++i) {
            if (!callArgProp && typeof argumentList[i] === "function") {
                return argumentList[i];
            }

            if (callArgProp && argumentList[i] &&
                typeof argumentList[i][callArgProp] === "function") {
                return argumentList[i][callArgProp];
            }
        }

        return null;
    }

    function makeApi(sinon) {
        function getCallbackError(behavior, func, args) {
            if (behavior.callArgAt < 0) {
                var msg;

                if (behavior.callArgProp) {
                    msg = sinon.functionName(behavior.stub) +
                        " expected to yield to '" + behavior.callArgProp +
                        "', but no object with such a property was passed.";
                } else {
                    msg = sinon.functionName(behavior.stub) +
                        " expected to yield, but no callback was passed.";
                }

                if (args.length > 0) {
                    msg += " Received [" + join.call(args, ", ") + "]";
                }

                return msg;
            }

            return "argument at index " + behavior.callArgAt + " is not a function: " + func;
        }

        function callCallback(behavior, args) {
            if (typeof behavior.callArgAt === "number") {
                var func = getCallback(behavior, args);

                if (typeof func !== "function") {
                    throw new TypeError(getCallbackError(behavior, func, args));
                }

                if (behavior.callbackAsync) {
                    nextTick(function () {
                        func.apply(behavior.callbackContext, behavior.callbackArguments);
                    });
                } else {
                    func.apply(behavior.callbackContext, behavior.callbackArguments);
                }
            }
        }

        var proto = {
            create: function create(stub) {
                var behavior = sinon.extend({}, sinon.behavior);
                delete behavior.create;
                behavior.stub = stub;

                return behavior;
            },

            isPresent: function isPresent() {
                return (typeof this.callArgAt === "number" ||
                        this.exception ||
                        typeof this.returnArgAt === "number" ||
                        this.returnThis ||
                        this.returnValueDefined);
            },

            invoke: function invoke(context, args) {
                callCallback(this, args);

                if (this.exception) {
                    throw this.exception;
                } else if (typeof this.returnArgAt === "number") {
                    return args[this.returnArgAt];
                } else if (this.returnThis) {
                    return context;
                }

                return this.returnValue;
            },

            onCall: function onCall(index) {
                return this.stub.onCall(index);
            },

            onFirstCall: function onFirstCall() {
                return this.stub.onFirstCall();
            },

            onSecondCall: function onSecondCall() {
                return this.stub.onSecondCall();
            },

            onThirdCall: function onThirdCall() {
                return this.stub.onThirdCall();
            },

            withArgs: function withArgs(/* arguments */) {
                throw new Error(
                    "Defining a stub by invoking \"stub.onCall(...).withArgs(...)\" " +
                    "is not supported. Use \"stub.withArgs(...).onCall(...)\" " +
                    "to define sequential behavior for calls with certain arguments."
                );
            },

            callsArg: function callsArg(pos) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAt = pos;
                this.callbackArguments = [];
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            callsArgOn: function callsArgOn(pos, context) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = pos;
                this.callbackArguments = [];
                this.callbackContext = context;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            callsArgWith: function callsArgWith(pos) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAt = pos;
                this.callbackArguments = slice.call(arguments, 1);
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            callsArgOnWith: function callsArgWith(pos, context) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = pos;
                this.callbackArguments = slice.call(arguments, 2);
                this.callbackContext = context;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yields: function () {
                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 0);
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yieldsRight: function () {
                this.callArgAt = useRightMostCallback;
                this.callbackArguments = slice.call(arguments, 0);
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yieldsOn: function (context) {
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 1);
                this.callbackContext = context;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yieldsTo: function (prop) {
                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 1);
                this.callbackContext = undefined;
                this.callArgProp = prop;
                this.callbackAsync = false;

                return this;
            },

            yieldsToOn: function (prop, context) {
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 2);
                this.callbackContext = context;
                this.callArgProp = prop;
                this.callbackAsync = false;

                return this;
            },

            throws: throwsException,
            throwsException: throwsException,

            returns: function returns(value) {
                this.returnValue = value;
                this.returnValueDefined = true;
                this.exception = undefined;

                return this;
            },

            returnsArg: function returnsArg(pos) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }

                this.returnArgAt = pos;

                return this;
            },

            returnsThis: function returnsThis() {
                this.returnThis = true;

                return this;
            }
        };

        function createAsyncVersion(syncFnName) {
            return function () {
                var result = this[syncFnName].apply(this, arguments);
                this.callbackAsync = true;
                return result;
            };
        }

        // create asynchronous versions of callsArg* and yields* methods
        for (var method in proto) {
            // need to avoid creating anotherasync versions of the newly added async methods
            if (proto.hasOwnProperty(method) && method.match(/^(callsArg|yields)/) && !method.match(/Async/)) {
                proto[method + "Async"] = createAsyncVersion(method);
            }
        }

        sinon.behavior = proto;
        return proto;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./extend");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        function walkInternal(obj, iterator, context, originalObj, seen) {
            var proto, prop;

            if (typeof Object.getOwnPropertyNames !== "function") {
                // We explicitly want to enumerate through all of the prototype's properties
                // in this case, therefore we deliberately leave out an own property check.
                /* eslint-disable guard-for-in */
                for (prop in obj) {
                    iterator.call(context, obj[prop], prop, obj);
                }
                /* eslint-enable guard-for-in */

                return;
            }

            Object.getOwnPropertyNames(obj).forEach(function (k) {
                if (!seen[k]) {
                    seen[k] = true;
                    var target = typeof Object.getOwnPropertyDescriptor(obj, k).get === "function" ?
                        originalObj : obj;
                    iterator.call(context, target[k], k, target);
                }
            });

            proto = Object.getPrototypeOf(obj);
            if (proto) {
                walkInternal(proto, iterator, context, originalObj, seen);
            }
        }

        /* Public: walks the prototype chain of an object and iterates over every own property
         * name encountered. The iterator is called in the same fashion that Array.prototype.forEach
         * works, where it is passed the value, key, and own object as the 1st, 2nd, and 3rd positional
         * argument, respectively. In cases where Object.getOwnPropertyNames is not available, walk will
         * default to using a simple for..in loop.
         *
         * obj - The object to walk the prototype chain for.
         * iterator - The function to be called on each pass of the walk.
         * context - (Optional) When given, the iterator will be called with this object as the receiver.
         */
        function walk(obj, iterator, context) {
            return walkInternal(obj, iterator, context, obj, {});
        }

        sinon.walk = walk;
        return sinon.walk;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 * @depend extend.js
 * @depend spy.js
 * @depend behavior.js
 * @depend walk.js
 */
/**
 * Stub functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        function stub(object, property, func) {
            if (!!func && typeof func !== "function" && typeof func !== "object") {
                throw new TypeError("Custom stub should be a function or a property descriptor");
            }

            var wrapper;

            if (func) {
                if (typeof func === "function") {
                    wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;
                } else {
                    wrapper = func;
                    if (sinon.spy && sinon.spy.create) {
                        var types = sinon.objectKeys(wrapper);
                        for (var i = 0; i < types.length; i++) {
                            wrapper[types[i]] = sinon.spy.create(wrapper[types[i]]);
                        }
                    }
                }
            } else {
                var stubLength = 0;
                if (typeof object === "object" && typeof object[property] === "function") {
                    stubLength = object[property].length;
                }
                wrapper = stub.create(stubLength);
            }

            if (!object && typeof property === "undefined") {
                return sinon.stub.create();
            }

            if (typeof property === "undefined" && typeof object === "object") {
                sinon.walk(object || {}, function (value, prop, propOwner) {
                    // we don't want to stub things like toString(), valueOf(), etc. so we only stub if the object
                    // is not Object.prototype
                    if (
                        propOwner !== Object.prototype &&
                        prop !== "constructor" &&
                        typeof sinon.getPropertyDescriptor(propOwner, prop).value === "function"
                    ) {
                        stub(object, prop);
                    }
                });

                return object;
            }

            return sinon.wrapMethod(object, property, wrapper);
        }


        /*eslint-disable no-use-before-define*/
        function getParentBehaviour(stubInstance) {
            return (stubInstance.parent && getCurrentBehavior(stubInstance.parent));
        }

        function getDefaultBehavior(stubInstance) {
            return stubInstance.defaultBehavior ||
                    getParentBehaviour(stubInstance) ||
                    sinon.behavior.create(stubInstance);
        }

        function getCurrentBehavior(stubInstance) {
            var behavior = stubInstance.behaviors[stubInstance.callCount - 1];
            return behavior && behavior.isPresent() ? behavior : getDefaultBehavior(stubInstance);
        }
        /*eslint-enable no-use-before-define*/

        var uuid = 0;

        var proto = {
            create: function create(stubLength) {
                var functionStub = function () {
                    return getCurrentBehavior(functionStub).invoke(this, arguments);
                };

                functionStub.id = "stub#" + uuid++;
                var orig = functionStub;
                functionStub = sinon.spy.create(functionStub, stubLength);
                functionStub.func = orig;

                sinon.extend(functionStub, stub);
                functionStub.instantiateFake = sinon.stub.create;
                functionStub.displayName = "stub";
                functionStub.toString = sinon.functionToString;

                functionStub.defaultBehavior = null;
                functionStub.behaviors = [];

                return functionStub;
            },

            resetBehavior: function () {
                var i;

                this.defaultBehavior = null;
                this.behaviors = [];

                delete this.returnValue;
                delete this.returnArgAt;
                this.returnThis = false;

                if (this.fakes) {
                    for (i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].resetBehavior();
                    }
                }
            },

            onCall: function onCall(index) {
                if (!this.behaviors[index]) {
                    this.behaviors[index] = sinon.behavior.create(this);
                }

                return this.behaviors[index];
            },

            onFirstCall: function onFirstCall() {
                return this.onCall(0);
            },

            onSecondCall: function onSecondCall() {
                return this.onCall(1);
            },

            onThirdCall: function onThirdCall() {
                return this.onCall(2);
            }
        };

        function createBehavior(behaviorMethod) {
            return function () {
                this.defaultBehavior = this.defaultBehavior || sinon.behavior.create(this);
                this.defaultBehavior[behaviorMethod].apply(this.defaultBehavior, arguments);
                return this;
            };
        }

        for (var method in sinon.behavior) {
            if (sinon.behavior.hasOwnProperty(method) &&
                !proto.hasOwnProperty(method) &&
                method !== "create" &&
                method !== "withArgs" &&
                method !== "invoke") {
                proto[method] = createBehavior(method);
            }
        }

        sinon.extend(stub, proto);
        sinon.stub = stub;

        return stub;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./behavior");
        require("./spy");
        require("./extend");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend times_in_words.js
 * @depend util/core.js
 * @depend call.js
 * @depend extend.js
 * @depend match.js
 * @depend spy.js
 * @depend stub.js
 * @depend format.js
 */
/**
 * Mock functions.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        var push = [].push;
        var match = sinon.match;

        function mock(object) {
            // if (typeof console !== undefined && console.warn) {
            //     console.warn("mock will be removed from Sinon.JS v2.0");
            // }

            if (!object) {
                return sinon.expectation.create("Anonymous mock");
            }

            return mock.create(object);
        }

        function each(collection, callback) {
            if (!collection) {
                return;
            }

            for (var i = 0, l = collection.length; i < l; i += 1) {
                callback(collection[i]);
            }
        }

        function arrayEquals(arr1, arr2, compareLength) {
            if (compareLength && (arr1.length !== arr2.length)) {
                return false;
            }

            for (var i = 0, l = arr1.length; i < l; i++) {
                if (!sinon.deepEqual(arr1[i], arr2[i])) {
                    return false;
                }
            }
            return true;
        }

        sinon.extend(mock, {
            create: function create(object) {
                if (!object) {
                    throw new TypeError("object is null");
                }

                var mockObject = sinon.extend({}, mock);
                mockObject.object = object;
                delete mockObject.create;

                return mockObject;
            },

            expects: function expects(method) {
                if (!method) {
                    throw new TypeError("method is falsy");
                }

                if (!this.expectations) {
                    this.expectations = {};
                    this.proxies = [];
                }

                if (!this.expectations[method]) {
                    this.expectations[method] = [];
                    var mockObject = this;

                    sinon.wrapMethod(this.object, method, function () {
                        return mockObject.invokeMethod(method, this, arguments);
                    });

                    push.call(this.proxies, method);
                }

                var expectation = sinon.expectation.create(method);
                push.call(this.expectations[method], expectation);

                return expectation;
            },

            restore: function restore() {
                var object = this.object;

                each(this.proxies, function (proxy) {
                    if (typeof object[proxy].restore === "function") {
                        object[proxy].restore();
                    }
                });
            },

            verify: function verify() {
                var expectations = this.expectations || {};
                var messages = [];
                var met = [];

                each(this.proxies, function (proxy) {
                    each(expectations[proxy], function (expectation) {
                        if (!expectation.met()) {
                            push.call(messages, expectation.toString());
                        } else {
                            push.call(met, expectation.toString());
                        }
                    });
                });

                this.restore();

                if (messages.length > 0) {
                    sinon.expectation.fail(messages.concat(met).join("\n"));
                } else if (met.length > 0) {
                    sinon.expectation.pass(messages.concat(met).join("\n"));
                }

                return true;
            },

            invokeMethod: function invokeMethod(method, thisValue, args) {
                var expectations = this.expectations && this.expectations[method] ? this.expectations[method] : [];
                var expectationsWithMatchingArgs = [];
                var currentArgs = args || [];
                var i, available;

                for (i = 0; i < expectations.length; i += 1) {
                    var expectedArgs = expectations[i].expectedArguments || [];
                    if (arrayEquals(expectedArgs, currentArgs, expectations[i].expectsExactArgCount)) {
                        expectationsWithMatchingArgs.push(expectations[i]);
                    }
                }

                for (i = 0; i < expectationsWithMatchingArgs.length; i += 1) {
                    if (!expectationsWithMatchingArgs[i].met() &&
                        expectationsWithMatchingArgs[i].allowsCall(thisValue, args)) {
                        return expectationsWithMatchingArgs[i].apply(thisValue, args);
                    }
                }

                var messages = [];
                var exhausted = 0;

                for (i = 0; i < expectationsWithMatchingArgs.length; i += 1) {
                    if (expectationsWithMatchingArgs[i].allowsCall(thisValue, args)) {
                        available = available || expectationsWithMatchingArgs[i];
                    } else {
                        exhausted += 1;
                    }
                }

                if (available && exhausted === 0) {
                    return available.apply(thisValue, args);
                }

                for (i = 0; i < expectations.length; i += 1) {
                    push.call(messages, "    " + expectations[i].toString());
                }

                messages.unshift("Unexpected call: " + sinon.spyCall.toString.call({
                    proxy: method,
                    args: args
                }));

                sinon.expectation.fail(messages.join("\n"));
            }
        });

        var times = sinon.timesInWords;
        var slice = Array.prototype.slice;

        function callCountInWords(callCount) {
            if (callCount === 0) {
                return "never called";
            }

            return "called " + times(callCount);
        }

        function expectedCallCountInWords(expectation) {
            var min = expectation.minCalls;
            var max = expectation.maxCalls;

            if (typeof min === "number" && typeof max === "number") {
                var str = times(min);

                if (min !== max) {
                    str = "at least " + str + " and at most " + times(max);
                }

                return str;
            }

            if (typeof min === "number") {
                return "at least " + times(min);
            }

            return "at most " + times(max);
        }

        function receivedMinCalls(expectation) {
            var hasMinLimit = typeof expectation.minCalls === "number";
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;
        }

        function receivedMaxCalls(expectation) {
            if (typeof expectation.maxCalls !== "number") {
                return false;
            }

            return expectation.callCount === expectation.maxCalls;
        }

        function verifyMatcher(possibleMatcher, arg) {
            var isMatcher = match && match.isMatcher(possibleMatcher);

            return isMatcher && possibleMatcher.test(arg) || true;
        }

        sinon.expectation = {
            minCalls: 1,
            maxCalls: 1,

            create: function create(methodName) {
                var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);
                delete expectation.create;
                expectation.method = methodName;

                return expectation;
            },

            invoke: function invoke(func, thisValue, args) {
                this.verifyCallAllowed(thisValue, args);

                return sinon.spy.invoke.apply(this, arguments);
            },

            atLeast: function atLeast(num) {
                if (typeof num !== "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.maxCalls = null;
                    this.limitsSet = true;
                }

                this.minCalls = num;

                return this;
            },

            atMost: function atMost(num) {
                if (typeof num !== "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.minCalls = null;
                    this.limitsSet = true;
                }

                this.maxCalls = num;

                return this;
            },

            never: function never() {
                return this.exactly(0);
            },

            once: function once() {
                return this.exactly(1);
            },

            twice: function twice() {
                return this.exactly(2);
            },

            thrice: function thrice() {
                return this.exactly(3);
            },

            exactly: function exactly(num) {
                if (typeof num !== "number") {
                    throw new TypeError("'" + num + "' is not a number");
                }

                this.atLeast(num);
                return this.atMost(num);
            },

            met: function met() {
                return !this.failed && receivedMinCalls(this);
            },

            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {
                if (receivedMaxCalls(this)) {
                    this.failed = true;
                    sinon.expectation.fail(this.method + " already called " + times(this.maxCalls));
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    sinon.expectation.fail(this.method + " called with " + thisValue + " as thisValue, expected " +
                        this.expectedThis);
                }

                if (!("expectedArguments" in this)) {
                    return;
                }

                if (!args) {
                    sinon.expectation.fail(this.method + " received no arguments, expected " +
                        sinon.format(this.expectedArguments));
                }

                if (args.length < this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too few arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                if (this.expectsExactArgCount &&
                    args.length !== this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too many arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {

                    if (!verifyMatcher(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", didn't match " + this.expectedArguments.toString());
                    }

                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", expected " + sinon.format(this.expectedArguments));
                    }
                }
            },

            allowsCall: function allowsCall(thisValue, args) {
                if (this.met() && receivedMaxCalls(this)) {
                    return false;
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    return false;
                }

                if (!("expectedArguments" in this)) {
                    return true;
                }

                args = args || [];

                if (args.length < this.expectedArguments.length) {
                    return false;
                }

                if (this.expectsExactArgCount &&
                    args.length !== this.expectedArguments.length) {
                    return false;
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!verifyMatcher(this.expectedArguments[i], args[i])) {
                        return false;
                    }

                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        return false;
                    }
                }

                return true;
            },

            withArgs: function withArgs() {
                this.expectedArguments = slice.call(arguments);
                return this;
            },

            withExactArgs: function withExactArgs() {
                this.withArgs.apply(this, arguments);
                this.expectsExactArgCount = true;
                return this;
            },

            on: function on(thisValue) {
                this.expectedThis = thisValue;
                return this;
            },

            toString: function () {
                var args = (this.expectedArguments || []).slice();

                if (!this.expectsExactArgCount) {
                    push.call(args, "[...]");
                }

                var callStr = sinon.spyCall.toString.call({
                    proxy: this.method || "anonymous mock expectation",
                    args: args
                });

                var message = callStr.replace(", [...", "[, ...") + " " +
                    expectedCallCountInWords(this);

                if (this.met()) {
                    return "Expectation met: " + message;
                }

                return "Expected " + message + " (" +
                    callCountInWords(this.callCount) + ")";
            },

            verify: function verify() {
                if (!this.met()) {
                    sinon.expectation.fail(this.toString());
                } else {
                    sinon.expectation.pass(this.toString());
                }

                return true;
            },

            pass: function pass(message) {
                sinon.assert.pass(message);
            },

            fail: function fail(message) {
                var exception = new Error(message);
                exception.name = "ExpectationError";

                throw exception;
            }
        };

        sinon.mock = mock;
        return mock;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./times_in_words");
        require("./call");
        require("./extend");
        require("./match");
        require("./spy");
        require("./stub");
        require("./format");

        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 * @depend spy.js
 * @depend stub.js
 * @depend mock.js
 */
/**
 * Collections of stubs, spies and mocks.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    var push = [].push;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function getFakes(fakeCollection) {
        if (!fakeCollection.fakes) {
            fakeCollection.fakes = [];
        }

        return fakeCollection.fakes;
    }

    function each(fakeCollection, method) {
        var fakes = getFakes(fakeCollection);

        for (var i = 0, l = fakes.length; i < l; i += 1) {
            if (typeof fakes[i][method] === "function") {
                fakes[i][method]();
            }
        }
    }

    function compact(fakeCollection) {
        var fakes = getFakes(fakeCollection);
        var i = 0;
        while (i < fakes.length) {
            fakes.splice(i, 1);
        }
    }

    function makeApi(sinon) {
        var collection = {
            verify: function resolve() {
                each(this, "verify");
            },

            restore: function restore() {
                each(this, "restore");
                compact(this);
            },

            reset: function restore() {
                each(this, "reset");
            },

            verifyAndRestore: function verifyAndRestore() {
                var exception;

                try {
                    this.verify();
                } catch (e) {
                    exception = e;
                }

                this.restore();

                if (exception) {
                    throw exception;
                }
            },

            add: function add(fake) {
                push.call(getFakes(this), fake);
                return fake;
            },

            spy: function spy() {
                return this.add(sinon.spy.apply(sinon, arguments));
            },

            stub: function stub(object, property, value) {
                if (property) {
                    var original = object[property];

                    if (typeof original !== "function") {
                        if (!hasOwnProperty.call(object, property)) {
                            throw new TypeError("Cannot stub non-existent own property " + property);
                        }

                        object[property] = value;

                        return this.add({
                            restore: function () {
                                object[property] = original;
                            }
                        });
                    }
                }
                if (!property && !!object && typeof object === "object") {
                    var stubbedObj = sinon.stub.apply(sinon, arguments);

                    for (var prop in stubbedObj) {
                        if (typeof stubbedObj[prop] === "function") {
                            this.add(stubbedObj[prop]);
                        }
                    }

                    return stubbedObj;
                }

                return this.add(sinon.stub.apply(sinon, arguments));
            },

            mock: function mock() {
                return this.add(sinon.mock.apply(sinon, arguments));
            },

            inject: function inject(obj) {
                var col = this;

                obj.spy = function () {
                    return col.spy.apply(col, arguments);
                };

                obj.stub = function () {
                    return col.stub.apply(col, arguments);
                };

                obj.mock = function () {
                    return col.mock.apply(col, arguments);
                };

                return obj;
            }
        };

        sinon.collection = collection;
        return collection;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./mock");
        require("./spy");
        require("./stub");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * Fake timer API
 * setTimeout
 * setInterval
 * clearTimeout
 * clearInterval
 * tick
 * reset
 * Date
 *
 * Inspired by jsUnitMockTimeOut from JsUnit
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {
    
    function makeApi(s, lol) {
        /*global lolex */
        var llx = typeof lolex !== "undefined" ? lolex : lol;

        s.useFakeTimers = function () {
            var now;
            var methods = Array.prototype.slice.call(arguments);

            if (typeof methods[0] === "string") {
                now = 0;
            } else {
                now = methods.shift();
            }

            var clock = llx.install(now || 0, methods);
            clock.restore = clock.uninstall;
            return clock;
        };

        s.clock = {
            create: function (now) {
                return llx.createClock(now);
            }
        };

        s.timers = {
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            setImmediate: (typeof setImmediate !== "undefined" ? setImmediate : undefined),
            clearImmediate: (typeof clearImmediate !== "undefined" ? clearImmediate : undefined),
            setInterval: setInterval,
            clearInterval: clearInterval,
            Date: Date
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, epxorts, module, lolex) {
        var core = require("./core");
        makeApi(core, lolex);
        module.exports = core;
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module, require("lolex"));
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

/**
 * Minimal Event interface implementation
 *
 * Original implementation by Sven Fuchs: https://gist.github.com/995028
 * Modifications and tests by Christian Johansen.
 *
 * @author Sven Fuchs (svenfuchs@artweb-design.de)
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2011 Sven Fuchs, Christian Johansen
 */
if (typeof sinon === "undefined") {
    this.sinon = {};
}

(function () {
    
    var push = [].push;

    function makeApi(sinon) {
        sinon.Event = function Event(type, bubbles, cancelable, target) {
            this.initEvent(type, bubbles, cancelable, target);
        };

        sinon.Event.prototype = {
            initEvent: function (type, bubbles, cancelable, target) {
                this.type = type;
                this.bubbles = bubbles;
                this.cancelable = cancelable;
                this.target = target;
            },

            stopPropagation: function () {},

            preventDefault: function () {
                this.defaultPrevented = true;
            }
        };

        sinon.ProgressEvent = function ProgressEvent(type, progressEventRaw, target) {
            this.initEvent(type, false, false, target);
            this.loaded = typeof progressEventRaw.loaded === "number" ? progressEventRaw.loaded : null;
            this.total = typeof progressEventRaw.total === "number" ? progressEventRaw.total : null;
            this.lengthComputable = !!progressEventRaw.total;
        };

        sinon.ProgressEvent.prototype = new sinon.Event();

        sinon.ProgressEvent.prototype.constructor = sinon.ProgressEvent;

        sinon.CustomEvent = function CustomEvent(type, customData, target) {
            this.initEvent(type, false, false, target);
            this.detail = customData.detail || null;
        };

        sinon.CustomEvent.prototype = new sinon.Event();

        sinon.CustomEvent.prototype.constructor = sinon.CustomEvent;

        sinon.EventTarget = {
            addEventListener: function addEventListener(event, listener) {
                this.eventListeners = this.eventListeners || {};
                this.eventListeners[event] = this.eventListeners[event] || [];
                push.call(this.eventListeners[event], listener);
            },

            removeEventListener: function removeEventListener(event, listener) {
                var listeners = this.eventListeners && this.eventListeners[event] || [];

                for (var i = 0, l = listeners.length; i < l; ++i) {
                    if (listeners[i] === listener) {
                        return listeners.splice(i, 1);
                    }
                }
            },

            dispatchEvent: function dispatchEvent(event) {
                var type = event.type;
                var listeners = this.eventListeners && this.eventListeners[type] || [];

                for (var i = 0; i < listeners.length; i++) {
                    if (typeof listeners[i] === "function") {
                        listeners[i].call(this, event);
                    } else {
                        listeners[i].handleEvent(event);
                    }
                }

                return !!event.defaultPrevented;
            }
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require) {
        var sinon = require("./core");
        makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

/**
 * @depend util/core.js
 */
/**
 * Logs errors
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal) {
    
    // cache a reference to setTimeout, so that our reference won't be stubbed out
    // when using fake timers and errors will still get logged
    // https://github.com/cjohansen/Sinon.JS/issues/381
    var realSetTimeout = setTimeout;

    function makeApi(sinon) {

        function log() {}

        function logError(label, err) {
            var msg = label + " threw exception: ";

            function throwLoggedError() {
                err.message = msg + err.message;
                throw err;
            }

            sinon.log(msg + "[" + err.name + "] " + err.message);

            if (err.stack) {
                sinon.log(err.stack);
            }

            if (logError.useImmediateExceptions) {
                throwLoggedError();
            } else {
                logError.setTimeout(throwLoggedError, 0);
            }
        }

        // When set to true, any errors logged will be thrown immediately;
        // If set to false, the errors will be thrown in separate execution frame.
        logError.useImmediateExceptions = false;

        // wrap realSetTimeout with something we can stub in tests
        logError.setTimeout = function (func, timeout) {
            realSetTimeout(func, timeout);
        };

        var exports = {};
        exports.log = sinon.log = log;
        exports.logError = sinon.logError = logError;

        return exports;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend core.js
 * @depend ../extend.js
 * @depend event.js
 * @depend ../log_error.js
 */
/**
 * Fake XDomainRequest object
 */

/**
 * Returns the global to prevent assigning values to 'this' when this is undefined.
 * This can occur when files are interpreted by node in strict mode.
 * @private
 */
function getGlobal() {
    
    return typeof window !== "undefined" ? window : global;
}

if (typeof sinon === "undefined") {
    if (typeof this === "undefined") {
        getGlobal().sinon = {};
    } else {
        this.sinon = {};
    }
}

// wrapper for global
(function (global) {
    
    var xdr = { XDomainRequest: global.XDomainRequest };
    xdr.GlobalXDomainRequest = global.XDomainRequest;
    xdr.supportsXDR = typeof xdr.GlobalXDomainRequest !== "undefined";
    xdr.workingXDR = xdr.supportsXDR ? xdr.GlobalXDomainRequest : false;

    function makeApi(sinon) {
        sinon.xdr = xdr;

        function FakeXDomainRequest() {
            this.readyState = FakeXDomainRequest.UNSENT;
            this.requestBody = null;
            this.requestHeaders = {};
            this.status = 0;
            this.timeout = null;

            if (typeof FakeXDomainRequest.onCreate === "function") {
                FakeXDomainRequest.onCreate(this);
            }
        }

        function verifyState(x) {
            if (x.readyState !== FakeXDomainRequest.OPENED) {
                throw new Error("INVALID_STATE_ERR");
            }

            if (x.sendFlag) {
                throw new Error("INVALID_STATE_ERR");
            }
        }

        function verifyRequestSent(x) {
            if (x.readyState === FakeXDomainRequest.UNSENT) {
                throw new Error("Request not sent");
            }
            if (x.readyState === FakeXDomainRequest.DONE) {
                throw new Error("Request done");
            }
        }

        function verifyResponseBodyType(body) {
            if (typeof body !== "string") {
                var error = new Error("Attempted to respond to fake XDomainRequest with " +
                                    body + ", which is not a string.");
                error.name = "InvalidBodyException";
                throw error;
            }
        }

        sinon.extend(FakeXDomainRequest.prototype, sinon.EventTarget, {
            open: function open(method, url) {
                this.method = method;
                this.url = url;

                this.responseText = null;
                this.sendFlag = false;

                this.readyStateChange(FakeXDomainRequest.OPENED);
            },

            readyStateChange: function readyStateChange(state) {
                this.readyState = state;
                var eventName = "";
                switch (this.readyState) {
                case FakeXDomainRequest.UNSENT:
                    break;
                case FakeXDomainRequest.OPENED:
                    break;
                case FakeXDomainRequest.LOADING:
                    if (this.sendFlag) {
                        //raise the progress event
                        eventName = "onprogress";
                    }
                    break;
                case FakeXDomainRequest.DONE:
                    if (this.isTimeout) {
                        eventName = "ontimeout";
                    } else if (this.errorFlag || (this.status < 200 || this.status > 299)) {
                        eventName = "onerror";
                    } else {
                        eventName = "onload";
                    }
                    break;
                }

                // raising event (if defined)
                if (eventName) {
                    if (typeof this[eventName] === "function") {
                        try {
                            this[eventName]();
                        } catch (e) {
                            sinon.logError("Fake XHR " + eventName + " handler", e);
                        }
                    }
                }
            },

            send: function send(data) {
                verifyState(this);

                if (!/^(get|head)$/i.test(this.method)) {
                    this.requestBody = data;
                }
                this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";

                this.errorFlag = false;
                this.sendFlag = true;
                this.readyStateChange(FakeXDomainRequest.OPENED);

                if (typeof this.onSend === "function") {
                    this.onSend(this);
                }
            },

            abort: function abort() {
                this.aborted = true;
                this.responseText = null;
                this.errorFlag = true;

                if (this.readyState > sinon.FakeXDomainRequest.UNSENT && this.sendFlag) {
                    this.readyStateChange(sinon.FakeXDomainRequest.DONE);
                    this.sendFlag = false;
                }
            },

            setResponseBody: function setResponseBody(body) {
                verifyRequestSent(this);
                verifyResponseBodyType(body);

                var chunkSize = this.chunkSize || 10;
                var index = 0;
                this.responseText = "";

                do {
                    this.readyStateChange(FakeXDomainRequest.LOADING);
                    this.responseText += body.substring(index, index + chunkSize);
                    index += chunkSize;
                } while (index < body.length);

                this.readyStateChange(FakeXDomainRequest.DONE);
            },

            respond: function respond(status, contentType, body) {
                // content-type ignored, since XDomainRequest does not carry this
                // we keep the same syntax for respond(...) as for FakeXMLHttpRequest to ease
                // test integration across browsers
                this.status = typeof status === "number" ? status : 200;
                this.setResponseBody(body || "");
            },

            simulatetimeout: function simulatetimeout() {
                this.status = 0;
                this.isTimeout = true;
                // Access to this should actually throw an error
                this.responseText = undefined;
                this.readyStateChange(FakeXDomainRequest.DONE);
            }
        });

        sinon.extend(FakeXDomainRequest, {
            UNSENT: 0,
            OPENED: 1,
            LOADING: 3,
            DONE: 4
        });

        sinon.useFakeXDomainRequest = function useFakeXDomainRequest() {
            sinon.FakeXDomainRequest.restore = function restore(keepOnCreate) {
                if (xdr.supportsXDR) {
                    global.XDomainRequest = xdr.GlobalXDomainRequest;
                }

                delete sinon.FakeXDomainRequest.restore;

                if (keepOnCreate !== true) {
                    delete sinon.FakeXDomainRequest.onCreate;
                }
            };
            if (xdr.supportsXDR) {
                global.XDomainRequest = sinon.FakeXDomainRequest;
            }
            return sinon.FakeXDomainRequest;
        };

        sinon.FakeXDomainRequest = FakeXDomainRequest;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./core");
        require("../extend");
        require("./event");
        require("../log_error");
        makeApi(sinon);
        module.exports = sinon;
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
})(typeof global !== "undefined" ? global : self);

/**
 * @depend core.js
 * @depend ../extend.js
 * @depend event.js
 * @depend ../log_error.js
 */
/**
 * Fake XMLHttpRequest object
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal, global) {
    
    function getWorkingXHR(globalScope) {
        var supportsXHR = typeof globalScope.XMLHttpRequest !== "undefined";
        if (supportsXHR) {
            return globalScope.XMLHttpRequest;
        }

        var supportsActiveX = typeof globalScope.ActiveXObject !== "undefined";
        if (supportsActiveX) {
            return function () {
                return new globalScope.ActiveXObject("MSXML2.XMLHTTP.3.0");
            };
        }

        return false;
    }

    var supportsProgress = typeof ProgressEvent !== "undefined";
    var supportsCustomEvent = typeof CustomEvent !== "undefined";
    var supportsFormData = typeof FormData !== "undefined";
    var supportsArrayBuffer = typeof ArrayBuffer !== "undefined";
    var supportsBlob = (function () {
        try {
            return !!new Blob();
        } catch (e) {
            return false;
        }
    })();
    var sinonXhr = { XMLHttpRequest: global.XMLHttpRequest };
    sinonXhr.GlobalXMLHttpRequest = global.XMLHttpRequest;
    sinonXhr.GlobalActiveXObject = global.ActiveXObject;
    sinonXhr.supportsActiveX = typeof sinonXhr.GlobalActiveXObject !== "undefined";
    sinonXhr.supportsXHR = typeof sinonXhr.GlobalXMLHttpRequest !== "undefined";
    sinonXhr.workingXHR = getWorkingXHR(global);
    sinonXhr.supportsCORS = sinonXhr.supportsXHR && "withCredentials" in (new sinonXhr.GlobalXMLHttpRequest());

    var unsafeHeaders = {
        "Accept-Charset": true,
        "Accept-Encoding": true,
        Connection: true,
        "Content-Length": true,
        Cookie: true,
        Cookie2: true,
        "Content-Transfer-Encoding": true,
        Date: true,
        Expect: true,
        Host: true,
        "Keep-Alive": true,
        Referer: true,
        TE: true,
        Trailer: true,
        "Transfer-Encoding": true,
        Upgrade: true,
        "User-Agent": true,
        Via: true
    };

    // An upload object is created for each
    // FakeXMLHttpRequest and allows upload
    // events to be simulated using uploadProgress
    // and uploadError.
    function UploadProgress() {
        this.eventListeners = {
            abort: [],
            error: [],
            load: [],
            loadend: [],
            progress: []
        };
    }

    UploadProgress.prototype.addEventListener = function addEventListener(event, listener) {
        this.eventListeners[event].push(listener);
    };

    UploadProgress.prototype.removeEventListener = function removeEventListener(event, listener) {
        var listeners = this.eventListeners[event] || [];

        for (var i = 0, l = listeners.length; i < l; ++i) {
            if (listeners[i] === listener) {
                return listeners.splice(i, 1);
            }
        }
    };

    UploadProgress.prototype.dispatchEvent = function dispatchEvent(event) {
        var listeners = this.eventListeners[event.type] || [];

        for (var i = 0, listener; (listener = listeners[i]) != null; i++) {
            listener(event);
        }
    };

    // Note that for FakeXMLHttpRequest to work pre ES5
    // we lose some of the alignment with the spec.
    // To ensure as close a match as possible,
    // set responseType before calling open, send or respond;
    function FakeXMLHttpRequest() {
        this.readyState = FakeXMLHttpRequest.UNSENT;
        this.requestHeaders = {};
        this.requestBody = null;
        this.status = 0;
        this.statusText = "";
        this.upload = new UploadProgress();
        this.responseType = "";
        this.response = "";
        if (sinonXhr.supportsCORS) {
            this.withCredentials = false;
        }

        var xhr = this;
        var events = ["loadstart", "load", "abort", "error", "loadend"];

        function addEventListener(eventName) {
            xhr.addEventListener(eventName, function (event) {
                var listener = xhr["on" + eventName];

                if (listener && typeof listener === "function") {
                    listener.call(this, event);
                }
            });
        }

        for (var i = events.length - 1; i >= 0; i--) {
            addEventListener(events[i]);
        }

        if (typeof FakeXMLHttpRequest.onCreate === "function") {
            FakeXMLHttpRequest.onCreate(this);
        }
    }

    function verifyState(xhr) {
        if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR");
        }

        if (xhr.sendFlag) {
            throw new Error("INVALID_STATE_ERR");
        }
    }

    function getHeader(headers, header) {
        header = header.toLowerCase();

        for (var h in headers) {
            if (h.toLowerCase() === header) {
                return h;
            }
        }

        return null;
    }

    // filtering to enable a white-list version of Sinon FakeXhr,
    // where whitelisted requests are passed through to real XHR
    function each(collection, callback) {
        if (!collection) {
            return;
        }

        for (var i = 0, l = collection.length; i < l; i += 1) {
            callback(collection[i]);
        }
    }
    function some(collection, callback) {
        for (var index = 0; index < collection.length; index++) {
            if (callback(collection[index]) === true) {
                return true;
            }
        }
        return false;
    }
    // largest arity in XHR is 5 - XHR#open
    var apply = function (obj, method, args) {
        switch (args.length) {
        case 0: return obj[method]();
        case 1: return obj[method](args[0]);
        case 2: return obj[method](args[0], args[1]);
        case 3: return obj[method](args[0], args[1], args[2]);
        case 4: return obj[method](args[0], args[1], args[2], args[3]);
        case 5: return obj[method](args[0], args[1], args[2], args[3], args[4]);
        }
    };

    FakeXMLHttpRequest.filters = [];
    FakeXMLHttpRequest.addFilter = function addFilter(fn) {
        this.filters.push(fn);
    };
    var IE6Re = /MSIE 6/;
    FakeXMLHttpRequest.defake = function defake(fakeXhr, xhrArgs) {
        var xhr = new sinonXhr.workingXHR(); // eslint-disable-line new-cap

        each([
            "open",
            "setRequestHeader",
            "send",
            "abort",
            "getResponseHeader",
            "getAllResponseHeaders",
            "addEventListener",
            "overrideMimeType",
            "removeEventListener"
        ], function (method) {
            fakeXhr[method] = function () {
                return apply(xhr, method, arguments);
            };
        });

        var copyAttrs = function (args) {
            each(args, function (attr) {
                try {
                    fakeXhr[attr] = xhr[attr];
                } catch (e) {
                    if (!IE6Re.test(navigator.userAgent)) {
                        throw e;
                    }
                }
            });
        };

        var stateChange = function stateChange() {
            fakeXhr.readyState = xhr.readyState;
            if (xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {
                copyAttrs(["status", "statusText"]);
            }
            if (xhr.readyState >= FakeXMLHttpRequest.LOADING) {
                copyAttrs(["responseText", "response"]);
            }
            if (xhr.readyState === FakeXMLHttpRequest.DONE) {
                copyAttrs(["responseXML"]);
            }
            if (fakeXhr.onreadystatechange) {
                fakeXhr.onreadystatechange.call(fakeXhr, { target: fakeXhr });
            }
        };

        if (xhr.addEventListener) {
            for (var event in fakeXhr.eventListeners) {
                if (fakeXhr.eventListeners.hasOwnProperty(event)) {

                    /*eslint-disable no-loop-func*/
                    each(fakeXhr.eventListeners[event], function (handler) {
                        xhr.addEventListener(event, handler);
                    });
                    /*eslint-enable no-loop-func*/
                }
            }
            xhr.addEventListener("readystatechange", stateChange);
        } else {
            xhr.onreadystatechange = stateChange;
        }
        apply(xhr, "open", xhrArgs);
    };
    FakeXMLHttpRequest.useFilters = false;

    function verifyRequestOpened(xhr) {
        if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR - " + xhr.readyState);
        }
    }

    function verifyRequestSent(xhr) {
        if (xhr.readyState === FakeXMLHttpRequest.DONE) {
            throw new Error("Request done");
        }
    }

    function verifyHeadersReceived(xhr) {
        if (xhr.async && xhr.readyState !== FakeXMLHttpRequest.HEADERS_RECEIVED) {
            throw new Error("No headers received");
        }
    }

    function verifyResponseBodyType(body) {
        if (typeof body !== "string") {
            var error = new Error("Attempted to respond to fake XMLHttpRequest with " +
                                 body + ", which is not a string.");
            error.name = "InvalidBodyException";
            throw error;
        }
    }

    function convertToArrayBuffer(body) {
        var buffer = new ArrayBuffer(body.length);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < body.length; i++) {
            var charCode = body.charCodeAt(i);
            if (charCode >= 256) {
                throw new TypeError("arraybuffer or blob responseTypes require binary string, " +
                                    "invalid character " + body[i] + " found.");
            }
            view[i] = charCode;
        }
        return buffer;
    }

    function isXmlContentType(contentType) {
        return !contentType || /(text\/xml)|(application\/xml)|(\+xml)/.test(contentType);
    }

    function convertResponseBody(responseType, contentType, body) {
        if (responseType === "" || responseType === "text") {
            return body;
        } else if (supportsArrayBuffer && responseType === "arraybuffer") {
            return convertToArrayBuffer(body);
        } else if (responseType === "json") {
            try {
                return JSON.parse(body);
            } catch (e) {
                // Return parsing failure as null
                return null;
            }
        } else if (supportsBlob && responseType === "blob") {
            var blobOptions = {};
            if (contentType) {
                blobOptions.type = contentType;
            }
            return new Blob([convertToArrayBuffer(body)], blobOptions);
        } else if (responseType === "document") {
            if (isXmlContentType(contentType)) {
                return FakeXMLHttpRequest.parseXML(body);
            }
            return null;
        }
        throw new Error("Invalid responseType " + responseType);
    }

    function clearResponse(xhr) {
        if (xhr.responseType === "" || xhr.responseType === "text") {
            xhr.response = xhr.responseText = "";
        } else {
            xhr.response = xhr.responseText = null;
        }
        xhr.responseXML = null;
    }

    FakeXMLHttpRequest.parseXML = function parseXML(text) {
        // Treat empty string as parsing failure
        if (text !== "") {
            try {
                if (typeof DOMParser !== "undefined") {
                    var parser = new DOMParser();
                    return parser.parseFromString(text, "text/xml");
                }
                var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(text);
                return xmlDoc;
            } catch (e) {
                // Unable to parse XML - no biggie
            }
        }

        return null;
    };

    FakeXMLHttpRequest.statusCodes = {
        100: "Continue",
        101: "Switching Protocols",
        200: "OK",
        201: "Created",
        202: "Accepted",
        203: "Non-Authoritative Information",
        204: "No Content",
        205: "Reset Content",
        206: "Partial Content",
        207: "Multi-Status",
        300: "Multiple Choice",
        301: "Moved Permanently",
        302: "Found",
        303: "See Other",
        304: "Not Modified",
        305: "Use Proxy",
        307: "Temporary Redirect",
        400: "Bad Request",
        401: "Unauthorized",
        402: "Payment Required",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        406: "Not Acceptable",
        407: "Proxy Authentication Required",
        408: "Request Timeout",
        409: "Conflict",
        410: "Gone",
        411: "Length Required",
        412: "Precondition Failed",
        413: "Request Entity Too Large",
        414: "Request-URI Too Long",
        415: "Unsupported Media Type",
        416: "Requested Range Not Satisfiable",
        417: "Expectation Failed",
        422: "Unprocessable Entity",
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        505: "HTTP Version Not Supported"
    };

    function makeApi(sinon) {
        sinon.xhr = sinonXhr;

        sinon.extend(FakeXMLHttpRequest.prototype, sinon.EventTarget, {
            async: true,

            open: function open(method, url, async, username, password) {
                this.method = method;
                this.url = url;
                this.async = typeof async === "boolean" ? async : true;
                this.username = username;
                this.password = password;
                clearResponse(this);
                this.requestHeaders = {};
                this.sendFlag = false;

                if (FakeXMLHttpRequest.useFilters === true) {
                    var xhrArgs = arguments;
                    var defake = some(FakeXMLHttpRequest.filters, function (filter) {
                        return filter.apply(this, xhrArgs);
                    });
                    if (defake) {
                        return FakeXMLHttpRequest.defake(this, arguments);
                    }
                }
                this.readyStateChange(FakeXMLHttpRequest.OPENED);
            },

            readyStateChange: function readyStateChange(state) {
                this.readyState = state;

                var readyStateChangeEvent = new sinon.Event("readystatechange", false, false, this);
                var event, progress;

                if (typeof this.onreadystatechange === "function") {
                    try {
                        this.onreadystatechange(readyStateChangeEvent);
                    } catch (e) {
                        sinon.logError("Fake XHR onreadystatechange handler", e);
                    }
                }

                if (this.readyState === FakeXMLHttpRequest.DONE) {
                    // ensure loaded and total are numbers
                    progress = {
                      loaded: this.progress || 0,
                      total: this.progress || 0
                    };

                    if (this.status === 0) {
                        event = this.aborted ? "abort" : "error";
                    }
                    else {
                        event = "load";
                    }

                    if (supportsProgress) {
                        this.upload.dispatchEvent(new sinon.ProgressEvent("progress", progress, this));
                        this.upload.dispatchEvent(new sinon.ProgressEvent(event, progress, this));
                        this.upload.dispatchEvent(new sinon.ProgressEvent("loadend", progress, this));
                    }

                    this.dispatchEvent(new sinon.ProgressEvent("progress", progress, this));
                    this.dispatchEvent(new sinon.ProgressEvent(event, progress, this));
                    this.dispatchEvent(new sinon.ProgressEvent("loadend", progress, this));
                }

                this.dispatchEvent(readyStateChangeEvent);
            },

            setRequestHeader: function setRequestHeader(header, value) {
                verifyState(this);

                if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {
                    throw new Error("Refused to set unsafe header \"" + header + "\"");
                }

                if (this.requestHeaders[header]) {
                    this.requestHeaders[header] += "," + value;
                } else {
                    this.requestHeaders[header] = value;
                }
            },

            // Helps testing
            setResponseHeaders: function setResponseHeaders(headers) {
                verifyRequestOpened(this);
                this.responseHeaders = {};

                for (var header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        this.responseHeaders[header] = headers[header];
                    }
                }

                if (this.async) {
                    this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
                } else {
                    this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
                }
            },

            // Currently treats ALL data as a DOMString (i.e. no Document)
            send: function send(data) {
                verifyState(this);

                if (!/^(get|head)$/i.test(this.method)) {
                    var contentType = getHeader(this.requestHeaders, "Content-Type");
                    if (this.requestHeaders[contentType]) {
                        var value = this.requestHeaders[contentType].split(";");
                        this.requestHeaders[contentType] = value[0] + ";charset=utf-8";
                    } else if (supportsFormData && !(data instanceof FormData)) {
                        this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";
                    }

                    this.requestBody = data;
                }

                this.errorFlag = false;
                this.sendFlag = this.async;
                clearResponse(this);
                this.readyStateChange(FakeXMLHttpRequest.OPENED);

                if (typeof this.onSend === "function") {
                    this.onSend(this);
                }

                this.dispatchEvent(new sinon.Event("loadstart", false, false, this));
            },

            abort: function abort() {
                this.aborted = true;
                clearResponse(this);
                this.errorFlag = true;
                this.requestHeaders = {};
                this.responseHeaders = {};

                if (this.readyState > FakeXMLHttpRequest.UNSENT && this.sendFlag) {
                    this.readyStateChange(FakeXMLHttpRequest.DONE);
                    this.sendFlag = false;
                }

                this.readyState = FakeXMLHttpRequest.UNSENT;
            },

            error: function error() {
                clearResponse(this);
                this.errorFlag = true;
                this.requestHeaders = {};
                this.responseHeaders = {};

                this.readyStateChange(FakeXMLHttpRequest.DONE);
            },

            getResponseHeader: function getResponseHeader(header) {
                if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
                    return null;
                }

                if (/^Set-Cookie2?$/i.test(header)) {
                    return null;
                }

                header = getHeader(this.responseHeaders, header);

                return this.responseHeaders[header] || null;
            },

            getAllResponseHeaders: function getAllResponseHeaders() {
                if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
                    return "";
                }

                var headers = "";

                for (var header in this.responseHeaders) {
                    if (this.responseHeaders.hasOwnProperty(header) &&
                        !/^Set-Cookie2?$/i.test(header)) {
                        headers += header + ": " + this.responseHeaders[header] + "\r\n";
                    }
                }

                return headers;
            },

            setResponseBody: function setResponseBody(body) {
                verifyRequestSent(this);
                verifyHeadersReceived(this);
                verifyResponseBodyType(body);
                var contentType = this.getResponseHeader("Content-Type");

                var isTextResponse = this.responseType === "" || this.responseType === "text";
                clearResponse(this);
                if (this.async) {
                    var chunkSize = this.chunkSize || 10;
                    var index = 0;

                    do {
                        this.readyStateChange(FakeXMLHttpRequest.LOADING);

                        if (isTextResponse) {
                            this.responseText = this.response += body.substring(index, index + chunkSize);
                        }
                        index += chunkSize;
                    } while (index < body.length);
                }

                this.response = convertResponseBody(this.responseType, contentType, body);
                if (isTextResponse) {
                    this.responseText = this.response;
                }

                if (this.responseType === "document") {
                    this.responseXML = this.response;
                } else if (this.responseType === "" && isXmlContentType(contentType)) {
                    this.responseXML = FakeXMLHttpRequest.parseXML(this.responseText);
                }
                this.progress = body.length;
                this.readyStateChange(FakeXMLHttpRequest.DONE);
            },

            respond: function respond(status, headers, body) {
                this.status = typeof status === "number" ? status : 200;
                this.statusText = FakeXMLHttpRequest.statusCodes[this.status];
                this.setResponseHeaders(headers || {});
                this.setResponseBody(body || "");
            },

            uploadProgress: function uploadProgress(progressEventRaw) {
                if (supportsProgress) {
                    this.upload.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
                }
            },

            downloadProgress: function downloadProgress(progressEventRaw) {
                if (supportsProgress) {
                    this.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
                }
            },

            uploadError: function uploadError(error) {
                if (supportsCustomEvent) {
                    this.upload.dispatchEvent(new sinon.CustomEvent("error", {detail: error}));
                }
            }
        });

        sinon.extend(FakeXMLHttpRequest, {
            UNSENT: 0,
            OPENED: 1,
            HEADERS_RECEIVED: 2,
            LOADING: 3,
            DONE: 4
        });

        sinon.useFakeXMLHttpRequest = function () {
            FakeXMLHttpRequest.restore = function restore(keepOnCreate) {
                if (sinonXhr.supportsXHR) {
                    global.XMLHttpRequest = sinonXhr.GlobalXMLHttpRequest;
                }

                if (sinonXhr.supportsActiveX) {
                    global.ActiveXObject = sinonXhr.GlobalActiveXObject;
                }

                delete FakeXMLHttpRequest.restore;

                if (keepOnCreate !== true) {
                    delete FakeXMLHttpRequest.onCreate;
                }
            };
            if (sinonXhr.supportsXHR) {
                global.XMLHttpRequest = FakeXMLHttpRequest;
            }

            if (sinonXhr.supportsActiveX) {
                global.ActiveXObject = function ActiveXObject(objId) {
                    if (objId === "Microsoft.XMLHTTP" || /^Msxml2\.XMLHTTP/i.test(objId)) {

                        return new FakeXMLHttpRequest();
                    }

                    return new sinonXhr.GlobalActiveXObject(objId);
                };
            }

            return FakeXMLHttpRequest;
        };

        sinon.FakeXMLHttpRequest = FakeXMLHttpRequest;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./core");
        require("../extend");
        require("./event");
        require("../log_error");
        makeApi(sinon);
        module.exports = sinon;
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof global !== "undefined" ? global : self
));

/**
 * @depend fake_xdomain_request.js
 * @depend fake_xml_http_request.js
 * @depend ../format.js
 * @depend ../log_error.js
 */
/**
 * The Sinon "server" mimics a web server that receives requests from
 * sinon.FakeXMLHttpRequest and provides an API to respond to those requests,
 * both synchronously and asynchronously. To respond synchronuously, canned
 * answers have to be provided upfront.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {
    
    var push = [].push;

    function responseArray(handler) {
        var response = handler;

        if (Object.prototype.toString.call(handler) !== "[object Array]") {
            response = [200, {}, handler];
        }

        if (typeof response[2] !== "string") {
            throw new TypeError("Fake server response body should be string, but was " +
                                typeof response[2]);
        }

        return response;
    }

    var wloc = typeof window !== "undefined" ? window.location : {};
    var rCurrLoc = new RegExp("^" + wloc.protocol + "//" + wloc.host);

    function matchOne(response, reqMethod, reqUrl) {
        var rmeth = response.method;
        var matchMethod = !rmeth || rmeth.toLowerCase() === reqMethod.toLowerCase();
        var url = response.url;
        var matchUrl = !url || url === reqUrl || (typeof url.test === "function" && url.test(reqUrl));

        return matchMethod && matchUrl;
    }

    function match(response, request) {
        var requestUrl = request.url;

        if (!/^https?:\/\//.test(requestUrl) || rCurrLoc.test(requestUrl)) {
            requestUrl = requestUrl.replace(rCurrLoc, "");
        }

        if (matchOne(response, this.getHTTPMethod(request), requestUrl)) {
            if (typeof response.response === "function") {
                var ru = response.url;
                var args = [request].concat(ru && typeof ru.exec === "function" ? ru.exec(requestUrl).slice(1) : []);
                return response.response.apply(response, args);
            }

            return true;
        }

        return false;
    }

    function makeApi(sinon) {
        sinon.fakeServer = {
            create: function (config) {
                var server = sinon.create(this);
                server.configure(config);
                if (!sinon.xhr.supportsCORS) {
                    this.xhr = sinon.useFakeXDomainRequest();
                } else {
                    this.xhr = sinon.useFakeXMLHttpRequest();
                }
                server.requests = [];

                this.xhr.onCreate = function (xhrObj) {
                    server.addRequest(xhrObj);
                };

                return server;
            },
            configure: function (config) {
                var whitelist = {
                    "autoRespond": true,
                    "autoRespondAfter": true,
                    "respondImmediately": true,
                    "fakeHTTPMethods": true
                };
                var setting;

                config = config || {};
                for (setting in config) {
                    if (whitelist.hasOwnProperty(setting) && config.hasOwnProperty(setting)) {
                        this[setting] = config[setting];
                    }
                }
            },
            addRequest: function addRequest(xhrObj) {
                var server = this;
                push.call(this.requests, xhrObj);

                xhrObj.onSend = function () {
                    server.handleRequest(this);

                    if (server.respondImmediately) {
                        server.respond();
                    } else if (server.autoRespond && !server.responding) {
                        setTimeout(function () {
                            server.responding = false;
                            server.respond();
                        }, server.autoRespondAfter || 10);

                        server.responding = true;
                    }
                };
            },

            getHTTPMethod: function getHTTPMethod(request) {
                if (this.fakeHTTPMethods && /post/i.test(request.method)) {
                    var matches = (request.requestBody || "").match(/_method=([^\b;]+)/);
                    return matches ? matches[1] : request.method;
                }

                return request.method;
            },

            handleRequest: function handleRequest(xhr) {
                if (xhr.async) {
                    if (!this.queue) {
                        this.queue = [];
                    }

                    push.call(this.queue, xhr);
                } else {
                    this.processRequest(xhr);
                }
            },

            log: function log(response, request) {
                var str;

                str = "Request:\n" + sinon.format(request) + "\n\n";
                str += "Response:\n" + sinon.format(response) + "\n\n";

                sinon.log(str);
            },

            respondWith: function respondWith(method, url, body) {
                if (arguments.length === 1 && typeof method !== "function") {
                    this.response = responseArray(method);
                    return;
                }

                if (!this.responses) {
                    this.responses = [];
                }

                if (arguments.length === 1) {
                    body = method;
                    url = method = null;
                }

                if (arguments.length === 2) {
                    body = url;
                    url = method;
                    method = null;
                }

                push.call(this.responses, {
                    method: method,
                    url: url,
                    response: typeof body === "function" ? body : responseArray(body)
                });
            },

            respond: function respond() {
                if (arguments.length > 0) {
                    this.respondWith.apply(this, arguments);
                }

                var queue = this.queue || [];
                var requests = queue.splice(0, queue.length);

                for (var i = 0; i < requests.length; i++) {
                    this.processRequest(requests[i]);
                }
            },

            processRequest: function processRequest(request) {
                try {
                    if (request.aborted) {
                        return;
                    }

                    var response = this.response || [404, {}, ""];

                    if (this.responses) {
                        for (var l = this.responses.length, i = l - 1; i >= 0; i--) {
                            if (match.call(this, this.responses[i], request)) {
                                response = this.responses[i].response;
                                break;
                            }
                        }
                    }

                    if (request.readyState !== 4) {
                        this.log(response, request);

                        request.respond(response[0], response[1], response[2]);
                    }
                } catch (e) {
                    sinon.logError("Fake server request processing", e);
                }
            },

            restore: function restore() {
                return this.xhr.restore && this.xhr.restore.apply(this.xhr, arguments);
            }
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./core");
        require("./fake_xdomain_request");
        require("./fake_xml_http_request");
        require("../format");
        makeApi(sinon);
        module.exports = sinon;
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

/**
 * @depend fake_server.js
 * @depend fake_timers.js
 */
/**
 * Add-on for sinon.fakeServer that automatically handles a fake timer along with
 * the FakeXMLHttpRequest. The direct inspiration for this add-on is jQuery
 * 1.3.x, which does not use xhr object's onreadystatehandler at all - instead,
 * it polls the object for completion with setInterval. Dispite the direct
 * motivation, there is nothing jQuery-specific in this file, so it can be used
 * in any environment where the ajax implementation depends on setInterval or
 * setTimeout.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {
    
    function makeApi(sinon) {
        function Server() {}
        Server.prototype = sinon.fakeServer;

        sinon.fakeServerWithClock = new Server();

        sinon.fakeServerWithClock.addRequest = function addRequest(xhr) {
            if (xhr.async) {
                if (typeof setTimeout.clock === "object") {
                    this.clock = setTimeout.clock;
                } else {
                    this.clock = sinon.useFakeTimers();
                    this.resetClock = true;
                }

                if (!this.longestTimeout) {
                    var clockSetTimeout = this.clock.setTimeout;
                    var clockSetInterval = this.clock.setInterval;
                    var server = this;

                    this.clock.setTimeout = function (fn, timeout) {
                        server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

                        return clockSetTimeout.apply(this, arguments);
                    };

                    this.clock.setInterval = function (fn, timeout) {
                        server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

                        return clockSetInterval.apply(this, arguments);
                    };
                }
            }

            return sinon.fakeServer.addRequest.call(this, xhr);
        };

        sinon.fakeServerWithClock.respond = function respond() {
            var returnVal = sinon.fakeServer.respond.apply(this, arguments);

            if (this.clock) {
                this.clock.tick(this.longestTimeout || 0);
                this.longestTimeout = 0;

                if (this.resetClock) {
                    this.clock.restore();
                    this.resetClock = false;
                }
            }

            return returnVal;
        };

        sinon.fakeServerWithClock.restore = function restore() {
            if (this.clock) {
                this.clock.restore();
            }

            return sinon.fakeServer.restore.apply(this, arguments);
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require) {
        var sinon = require("./core");
        require("./fake_server");
        require("./fake_timers");
        makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

/**
 * @depend util/core.js
 * @depend extend.js
 * @depend collection.js
 * @depend util/fake_timers.js
 * @depend util/fake_server_with_clock.js
 */
/**
 * Manages fake collections as well as fake utilities such as Sinon's
 * timers and fake XHR implementation in one convenient object.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        var push = [].push;

        function exposeValue(sandbox, config, key, value) {
            if (!value) {
                return;
            }

            if (config.injectInto && !(key in config.injectInto)) {
                config.injectInto[key] = value;
                sandbox.injectedKeys.push(key);
            } else {
                push.call(sandbox.args, value);
            }
        }

        function prepareSandboxFromConfig(config) {
            var sandbox = sinon.create(sinon.sandbox);

            if (config.useFakeServer) {
                if (typeof config.useFakeServer === "object") {
                    sandbox.serverPrototype = config.useFakeServer;
                }

                sandbox.useFakeServer();
            }

            if (config.useFakeTimers) {
                if (typeof config.useFakeTimers === "object") {
                    sandbox.useFakeTimers.apply(sandbox, config.useFakeTimers);
                } else {
                    sandbox.useFakeTimers();
                }
            }

            return sandbox;
        }

        sinon.sandbox = sinon.extend(sinon.create(sinon.collection), {
            useFakeTimers: function useFakeTimers() {
                this.clock = sinon.useFakeTimers.apply(sinon, arguments);

                return this.add(this.clock);
            },

            serverPrototype: sinon.fakeServer,

            useFakeServer: function useFakeServer() {
                var proto = this.serverPrototype || sinon.fakeServer;

                if (!proto || !proto.create) {
                    return null;
                }

                this.server = proto.create();
                return this.add(this.server);
            },

            inject: function (obj) {
                sinon.collection.inject.call(this, obj);

                if (this.clock) {
                    obj.clock = this.clock;
                }

                if (this.server) {
                    obj.server = this.server;
                    obj.requests = this.server.requests;
                }

                obj.match = sinon.match;

                return obj;
            },

            restore: function () {
                sinon.collection.restore.apply(this, arguments);
                this.restoreContext();
            },

            restoreContext: function () {
                if (this.injectedKeys) {
                    for (var i = 0, j = this.injectedKeys.length; i < j; i++) {
                        delete this.injectInto[this.injectedKeys[i]];
                    }
                    this.injectedKeys = [];
                }
            },

            create: function (config) {
                if (!config) {
                    return sinon.create(sinon.sandbox);
                }

                var sandbox = prepareSandboxFromConfig(config);
                sandbox.args = sandbox.args || [];
                sandbox.injectedKeys = [];
                sandbox.injectInto = config.injectInto;
                var prop,
                    value;
                var exposed = sandbox.inject({});

                if (config.properties) {
                    for (var i = 0, l = config.properties.length; i < l; i++) {
                        prop = config.properties[i];
                        value = exposed[prop] || prop === "sandbox" && sandbox;
                        exposeValue(sandbox, config, prop, value);
                    }
                } else {
                    exposeValue(sandbox, config, "sandbox", value);
                }

                return sandbox;
            },

            match: sinon.match
        });

        sinon.sandbox.useFakeXMLHttpRequest = sinon.sandbox.useFakeServer;

        return sinon.sandbox;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./extend");
        require("./util/fake_server_with_clock");
        require("./util/fake_timers");
        require("./collection");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 * @depend sandbox.js
 */
/**
 * Test function, sandboxes fakes
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    function makeApi(sinon) {
        var slice = Array.prototype.slice;

        function test(callback) {
            var type = typeof callback;

            if (type !== "function") {
                throw new TypeError("sinon.test needs to wrap a test function, got " + type);
            }

            function sinonSandboxedTest() {
                var config = sinon.getConfig(sinon.config);
                config.injectInto = config.injectIntoThis && this || config.injectInto;
                var sandbox = sinon.sandbox.create(config);
                var args = slice.call(arguments);
                var oldDone = args.length && args[args.length - 1];
                var exception, result;

                if (typeof oldDone === "function") {
                    args[args.length - 1] = function sinonDone(res) {
                        if (res) {
                            sandbox.restore();
                        } else {
                            sandbox.verifyAndRestore();
                        }
                        oldDone(res);
                    };
                }

                try {
                    result = callback.apply(this, args.concat(sandbox.args));
                } catch (e) {
                    exception = e;
                }

                if (typeof exception !== "undefined") {
                    sandbox.restore();
                    throw exception;
                } else if (typeof oldDone !== "function") {
                    sandbox.verifyAndRestore();
                }

                return result;
            }

            if (callback.length) {
                return function sinonAsyncSandboxedTest(done) { // eslint-disable-line no-unused-vars
                    return sinonSandboxedTest.apply(this, arguments);
                };
            }

            return sinonSandboxedTest;
        }

        test.config = {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        };

        sinon.test = test;
        return test;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./sandbox");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
    } else if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(typeof sinon === "object" && sinon || null)); // eslint-disable-line no-undef

/**
 * @depend util/core.js
 * @depend test.js
 */
/**
 * Test case, sandboxes all test functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    
    function createTest(property, setUp, tearDown) {
        return function () {
            if (setUp) {
                setUp.apply(this, arguments);
            }

            var exception, result;

            try {
                result = property.apply(this, arguments);
            } catch (e) {
                exception = e;
            }

            if (tearDown) {
                tearDown.apply(this, arguments);
            }

            if (exception) {
                throw exception;
            }

            return result;
        };
    }

    function makeApi(sinon) {
        function testCase(tests, prefix) {
            if (!tests || typeof tests !== "object") {
                throw new TypeError("sinon.testCase needs an object with test functions");
            }

            prefix = prefix || "test";
            var rPrefix = new RegExp("^" + prefix);
            var methods = {};
            var setUp = tests.setUp;
            var tearDown = tests.tearDown;
            var testName,
                property,
                method;

            for (testName in tests) {
                if (tests.hasOwnProperty(testName) && !/^(setUp|tearDown)$/.test(testName)) {
                    property = tests[testName];

                    if (typeof property === "function" && rPrefix.test(testName)) {
                        method = property;

                        if (setUp || tearDown) {
                            method = createTest(property, setUp, tearDown);
                        }

                        methods[testName] = sinon.test(method);
                    } else {
                        methods[testName] = tests[testName];
                    }
                }
            }

            return methods;
        }

        sinon.testCase = testCase;
        return testCase;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./test");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend times_in_words.js
 * @depend util/core.js
 * @depend match.js
 * @depend format.js
 */
/**
 * Assertions matching the test spy retrieval interface.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal, global) {
    
    var slice = Array.prototype.slice;

    function makeApi(sinon) {
        var assert;

        function verifyIsStub() {
            var method;

            for (var i = 0, l = arguments.length; i < l; ++i) {
                method = arguments[i];

                if (!method) {
                    assert.fail("fake is not a spy");
                }

                if (method.proxy && method.proxy.isSinonProxy) {
                    verifyIsStub(method.proxy);
                } else {
                    if (typeof method !== "function") {
                        assert.fail(method + " is not a function");
                    }

                    if (typeof method.getCall !== "function") {
                        assert.fail(method + " is not stubbed");
                    }
                }

            }
        }

        function verifyIsValidAssertion(assertionMethod, assertionArgs) {
            switch (assertionMethod) {
                case "notCalled":
                case "called":
                case "calledOnce":
                case "calledTwice":
                case "calledThrice":
                    if (assertionArgs.length !== 0) {
                        assert.fail(assertionMethod +
                                    " takes 1 argument but was called with " +
                                    (assertionArgs.length + 1) + " arguments");
                    }
                    break;
                default:
                    break;
            }
        }

        function failAssertion(object, msg) {
            object = object || global;
            var failMethod = object.fail || assert.fail;
            failMethod.call(object, msg);
        }

        function mirrorPropAsAssertion(name, method, message) {
            if (arguments.length === 2) {
                message = method;
                method = name;
            }

            assert[name] = function (fake) {
                verifyIsStub(fake);

                var args = slice.call(arguments, 1);
                verifyIsValidAssertion(name, args);

                var failed = false;

                if (typeof method === "function") {
                    failed = !method(fake);
                } else {
                    failed = typeof fake[method] === "function" ?
                        !fake[method].apply(fake, args) : !fake[method];
                }

                if (failed) {
                    failAssertion(this, (fake.printf || fake.proxy.printf).apply(fake, [message].concat(args)));
                } else {
                    assert.pass(name);
                }
            };
        }

        function exposedName(prefix, prop) {
            return !prefix || /^fail/.test(prop) ? prop :
                prefix + prop.slice(0, 1).toUpperCase() + prop.slice(1);
        }

        assert = {
            failException: "AssertError",

            fail: function fail(message) {
                var error = new Error(message);
                error.name = this.failException || assert.failException;

                throw error;
            },

            pass: function pass() {},

            callOrder: function assertCallOrder() {
                verifyIsStub.apply(null, arguments);
                var expected = "";
                var actual = "";

                if (!sinon.calledInOrder(arguments)) {
                    try {
                        expected = [].join.call(arguments, ", ");
                        var calls = slice.call(arguments);
                        var i = calls.length;
                        while (i) {
                            if (!calls[--i].called) {
                                calls.splice(i, 1);
                            }
                        }
                        actual = sinon.orderByFirstCall(calls).join(", ");
                    } catch (e) {
                        // If this fails, we'll just fall back to the blank string
                    }

                    failAssertion(this, "expected " + expected + " to be " +
                                "called in order but were called as " + actual);
                } else {
                    assert.pass("callOrder");
                }
            },

            callCount: function assertCallCount(method, count) {
                verifyIsStub(method);

                if (method.callCount !== count) {
                    var msg = "expected %n to be called " + sinon.timesInWords(count) +
                        " but was called %c%C";
                    failAssertion(this, method.printf(msg));
                } else {
                    assert.pass("callCount");
                }
            },

            expose: function expose(target, options) {
                if (!target) {
                    throw new TypeError("target is null or undefined");
                }

                var o = options || {};
                var prefix = typeof o.prefix === "undefined" && "assert" || o.prefix;
                var includeFail = typeof o.includeFail === "undefined" || !!o.includeFail;

                for (var method in this) {
                    if (method !== "expose" && (includeFail || !/^(fail)/.test(method))) {
                        target[exposedName(prefix, method)] = this[method];
                    }
                }

                return target;
            },

            match: function match(actual, expectation) {
                var matcher = sinon.match(expectation);
                if (matcher.test(actual)) {
                    assert.pass("match");
                } else {
                    var formatted = [
                        "expected value to match",
                        "    expected = " + sinon.format(expectation),
                        "    actual = " + sinon.format(actual)
                    ];

                    failAssertion(this, formatted.join("\n"));
                }
            }
        };

        mirrorPropAsAssertion("called", "expected %n to have been called at least once but was never called");
        mirrorPropAsAssertion("notCalled", function (spy) {
            return !spy.called;
        }, "expected %n to not have been called but was called %c%C");
        mirrorPropAsAssertion("calledOnce", "expected %n to be called once but was called %c%C");
        mirrorPropAsAssertion("calledTwice", "expected %n to be called twice but was called %c%C");
        mirrorPropAsAssertion("calledThrice", "expected %n to be called thrice but was called %c%C");
        mirrorPropAsAssertion("calledOn", "expected %n to be called with %1 as this but was called with %t");
        mirrorPropAsAssertion(
            "alwaysCalledOn",
            "expected %n to always be called with %1 as this but was called with %t"
        );
        mirrorPropAsAssertion("calledWithNew", "expected %n to be called with new");
        mirrorPropAsAssertion("alwaysCalledWithNew", "expected %n to always be called with new");
        mirrorPropAsAssertion("calledWith", "expected %n to be called with arguments %*%C");
        mirrorPropAsAssertion("calledWithMatch", "expected %n to be called with match %*%C");
        mirrorPropAsAssertion("alwaysCalledWith", "expected %n to always be called with arguments %*%C");
        mirrorPropAsAssertion("alwaysCalledWithMatch", "expected %n to always be called with match %*%C");
        mirrorPropAsAssertion("calledWithExactly", "expected %n to be called with exact arguments %*%C");
        mirrorPropAsAssertion("alwaysCalledWithExactly", "expected %n to always be called with exact arguments %*%C");
        mirrorPropAsAssertion("neverCalledWith", "expected %n to never be called with arguments %*%C");
        mirrorPropAsAssertion("neverCalledWithMatch", "expected %n to never be called with match %*%C");
        mirrorPropAsAssertion("threw", "%n did not throw exception%C");
        mirrorPropAsAssertion("alwaysThrew", "%n did not always throw exception%C");

        sinon.assert = assert;
        return assert;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./match");
        require("./format");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof global !== "undefined" ? global : self
));

  return sinon;
}));

/* globals define, sinon */

define('sinon', [], function() {
  "use strict";

  return {
    'default': sinon
  };
});

define("chai", ["exports"], function (exports) {
  /* globals chai */

  "use strict";

  var expect = chai.expect;
  exports.expect = expect;
  var assert = chai.assert;

  exports.assert = assert;
  var config = chai.config;
  exports.config = config;
  var use = chai.use;
  exports.use = use;
  var Assertion = chai.Assertion;
  exports.Assertion = Assertion;
});
define('ember-mocha', ['exports', 'ember-mocha/describe-module', 'ember-mocha/describe-component', 'ember-mocha/describe-model', 'ember-mocha/it', 'ember-test-helpers'], function (exports, _emberMochaDescribeModule, _emberMochaDescribeComponent, _emberMochaDescribeModel, _emberMochaIt, _emberTestHelpers) {
  'use strict';

  exports.describeModule = _emberMochaDescribeModule['default'];
  exports.describeComponent = _emberMochaDescribeComponent['default'];
  exports.describeModel = _emberMochaDescribeModel['default'];
  exports.it = _emberMochaIt['default'];
  exports.setResolver = _emberTestHelpers.setResolver;
});
define('ember-mocha/describe-component', ['exports', 'ember-mocha/mocha-module', 'ember-test-helpers'], function (exports, _emberMochaMochaModule, _emberTestHelpers) {
  'use strict';

  function describeComponent(name, description, callbacks, tests) {
    (0, _emberMochaMochaModule.createModule)(_emberTestHelpers.TestModuleForComponent, name, description, callbacks, tests);
  }

  describeComponent.only = (0, _emberMochaMochaModule.createOnly)(_emberTestHelpers.TestModuleForComponent);

  describeComponent.skip = (0, _emberMochaMochaModule.createSkip)(_emberTestHelpers.TestModuleForComponent);

  exports['default'] = describeComponent;
});
define('ember-mocha/describe-model', ['exports', 'ember-mocha/mocha-module', 'ember-test-helpers'], function (exports, _emberMochaMochaModule, _emberTestHelpers) {
  'use strict';

  function describeModel(name, description, callbacks, tests) {
    (0, _emberMochaMochaModule.createModule)(_emberTestHelpers.TestModuleForModel, name, description, callbacks, tests);
  }

  describeModel.only = (0, _emberMochaMochaModule.createOnly)(_emberTestHelpers.TestModuleForModel);

  describeModel.skip = (0, _emberMochaMochaModule.createSkip)(_emberTestHelpers.TestModuleForModel);

  exports['default'] = describeModel;
});
define('ember-mocha/describe-module', ['exports', 'ember-mocha/mocha-module', 'ember-test-helpers'], function (exports, _emberMochaMochaModule, _emberTestHelpers) {
  'use strict';

  function describeModule(name, description, callbacks, tests) {
    (0, _emberMochaMochaModule.createModule)(_emberTestHelpers.TestModule, name, description, callbacks, tests);
  }

  describeModule.only = (0, _emberMochaMochaModule.createOnly)(_emberTestHelpers.TestModule);

  describeModule.skip = (0, _emberMochaMochaModule.createSkip)(_emberTestHelpers.TestModule);

  exports['default'] = describeModule;
});
define('ember-mocha/it', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  var originalIt = window.it;

  function wrap(specifier) {
    return function (testName, callback) {
      var wrapper;

      if (!callback) {
        wrapper = null;
      } else if (callback.length === 1) {
        wrapper = function (done) {
          return callback.call(this, done);
        };
      } else {
        wrapper = function () {
          return callback.call(this);
        };
      }

      if (wrapper) {
        wrapper.toString = function () {
          return callback.toString();
        };
      }

      return specifier(testName, wrapper);
    };
  }

  var wrappedIt = wrap(window.it);
  wrappedIt.only = wrap(window.it.only);
  wrappedIt.skip = function (testName, callback) {
    originalIt(testName);
  };

  exports['default'] = wrappedIt;
});
define('ember-mocha/mocha-module', ['exports', 'mocha', 'ember', 'ember-test-helpers'], function (exports, _mocha, _ember, _emberTestHelpers) {
  'use strict';

  exports.createModule = createModule;
  exports.createOnly = createOnly;
  exports.createSkip = createSkip;

  function createModule(Constructor, name, description, callbacks, tests, method) {
    var module;

    if (!tests) {
      if (!callbacks) {
        tests = description;
        callbacks = {};
      } else {
        tests = callbacks;
        callbacks = description;
      }
      module = new Constructor(name, callbacks);
    } else {
      module = new Constructor(name, description, callbacks);
    }

    function moduleBody() {
      (0, _mocha.beforeEach)(function () {
        var self = this;
        return module.setup().then(function () {
          var context = (0, _emberTestHelpers.getContext)();
          var keys = Object.keys(context);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            self[key] = context[key];
          }
        });
      });

      (0, _mocha.afterEach)(function () {
        return module.teardown();
      });

      tests = tests || function () {};
      tests();
    }
    if (method) {
      _mocha.describe[method](module.name, moduleBody);
    } else {
      (0, _mocha.describe)(module.name, moduleBody);
    }
  }

  function createOnly(Constructor) {
    return function (name, description, callbacks, tests) {
      createModule(Constructor, name, description, callbacks, tests, "only");
    };
  }

  function createSkip(Constructor) {
    return function (name, description, callbacks, tests) {
      createModule(Constructor, name, description, callbacks, tests, "skip");
    };
  }
});
define('ember-test-helpers', ['exports', 'ember', 'ember-test-helpers/test-module', 'ember-test-helpers/test-module-for-acceptance', 'ember-test-helpers/test-module-for-integration', 'ember-test-helpers/test-module-for-component', 'ember-test-helpers/test-module-for-model', 'ember-test-helpers/test-context', 'ember-test-helpers/test-resolver'], function (exports, _ember, _emberTestHelpersTestModule, _emberTestHelpersTestModuleForAcceptance, _emberTestHelpersTestModuleForIntegration, _emberTestHelpersTestModuleForComponent, _emberTestHelpersTestModuleForModel, _emberTestHelpersTestContext, _emberTestHelpersTestResolver) {
  'use strict';

  _ember['default'].testing = true;

  exports.TestModule = _emberTestHelpersTestModule['default'];
  exports.TestModuleForAcceptance = _emberTestHelpersTestModuleForAcceptance['default'];
  exports.TestModuleForIntegration = _emberTestHelpersTestModuleForIntegration['default'];
  exports.TestModuleForComponent = _emberTestHelpersTestModuleForComponent['default'];
  exports.TestModuleForModel = _emberTestHelpersTestModuleForModel['default'];
  exports.getContext = _emberTestHelpersTestContext.getContext;
  exports.setContext = _emberTestHelpersTestContext.setContext;
  exports.unsetContext = _emberTestHelpersTestContext.unsetContext;
  exports.setResolver = _emberTestHelpersTestResolver.setResolver;
});
define('ember-test-helpers/-legacy-overrides', ['exports', 'ember', 'ember-test-helpers/has-ember-version'], function (exports, _ember, _emberTestHelpersHasEmberVersion) {
  'use strict';

  exports.preGlimmerSetupIntegrationForComponent = preGlimmerSetupIntegrationForComponent;

  function preGlimmerSetupIntegrationForComponent() {
    var module = this;
    var context = this.context;

    this.actionHooks = {};

    context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    context.actions = module.actionHooks;

    (this.registry || this.container).register('component:-test-holder', _ember['default'].Component.extend());

    context.render = function (template) {
      // in case `this.render` is called twice, make sure to teardown the first invocation
      module.teardownComponent();

      if (!template) {
        throw new Error("in a component integration test you must pass a template to `render()`");
      }
      if (_ember['default'].isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = _ember['default'].Handlebars.compile(template);
      }
      module.component = module.container.lookupFactory('component:-test-holder').create({
        layout: template
      });

      module.component.set('context', context);
      module.component.set('controller', context);

      _ember['default'].run(function () {
        module.component.appendTo('#ember-testing');
      });

      context._element = module.component.element;
    };

    context.$ = function () {
      return module.component.$.apply(module.component, arguments);
    };

    context.set = function (key, value) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].set(context, key, value);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].setProperties(context, hash);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return _ember['default'].get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return _ember['default'].getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error("integration testing template received unexpected action " + actionName);
      }
      hook.apply(module, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      module.teardownComponent();
    };
  }
});
define('ember-test-helpers/abstract-test-module', ['exports', 'klassy', 'ember-test-helpers/wait', 'ember-test-helpers/test-context', 'ember'], function (exports, _klassy, _emberTestHelpersWait, _emberTestHelpersTestContext, _ember) {
  'use strict';

  // calling this `merge` here because we cannot
  // actually assume it is like `Object.assign`
  // with > 2 args
  var merge = _ember['default'].assign || _ember['default'].merge;

  exports['default'] = _klassy.Klass.extend({
    init: function init(name, options) {
      this.context = undefined;
      this.name = name;
      this.callbacks = options || {};

      this.initSetupSteps();
      this.initTeardownSteps();
    },

    setup: function setup(assert) {
      var _this = this;

      return this.invokeSteps(this.setupSteps, this, assert).then(function () {
        _this.contextualizeCallbacks();
        return _this.invokeSteps(_this.contextualizedSetupSteps, _this.context, assert);
      });
    },

    teardown: function teardown(assert) {
      var _this2 = this;

      return this.invokeSteps(this.contextualizedTeardownSteps, this.context, assert).then(function () {
        return _this2.invokeSteps(_this2.teardownSteps, _this2, assert);
      }).then(function () {
        _this2.cache = null;
        _this2.cachedCalls = null;
      });
    },

    initSetupSteps: function initSetupSteps() {
      this.setupSteps = [];
      this.contextualizedSetupSteps = [];

      if (this.callbacks.beforeSetup) {
        this.setupSteps.push(this.callbacks.beforeSetup);
        delete this.callbacks.beforeSetup;
      }

      this.setupSteps.push(this.setupContext);
      this.setupSteps.push(this.setupTestElements);
      this.setupSteps.push(this.setupAJAXListeners);

      if (this.callbacks.setup) {
        this.contextualizedSetupSteps.push(this.callbacks.setup);
        delete this.callbacks.setup;
      }
    },

    invokeSteps: function invokeSteps(steps, context, assert) {
      steps = steps.slice();

      function nextStep() {
        var step = steps.shift();
        if (step) {
          // guard against exceptions, for example missing components referenced from needs.
          return new _ember['default'].RSVP.Promise(function (resolve) {
            resolve(step.call(context, assert));
          }).then(nextStep);
        } else {
          return _ember['default'].RSVP.resolve();
        }
      }
      return nextStep();
    },

    contextualizeCallbacks: function contextualizeCallbacks() {},

    initTeardownSteps: function initTeardownSteps() {
      this.teardownSteps = [];
      this.contextualizedTeardownSteps = [];

      if (this.callbacks.teardown) {
        this.contextualizedTeardownSteps.push(this.callbacks.teardown);
        delete this.callbacks.teardown;
      }

      this.teardownSteps.push(this.teardownContext);
      this.teardownSteps.push(this.teardownTestElements);
      this.teardownSteps.push(this.teardownAJAXListeners);

      if (this.callbacks.afterTeardown) {
        this.teardownSteps.push(this.callbacks.afterTeardown);
        delete this.callbacks.afterTeardown;
      }
    },

    setupTestElements: function setupTestElements() {
      if (!document.querySelector('#ember-testing')) {
        var element = document.createElement('div');
        element.setAttribute('id', 'ember-testing');

        document.body.appendChild(element);
      }
    },

    setupContext: function setupContext(options) {
      var context = this.getContext();

      merge(context, {
        dispatcher: null,
        inject: {}
      });
      merge(context, options);

      (0, _emberTestHelpersTestContext.setContext)(context);
      this.context = context;
    },

    setContext: function setContext(context) {
      this.context = context;
    },

    getContext: function getContext() {
      if (this.context) {
        return this.context;
      }

      return this.context = (0, _emberTestHelpersTestContext.getContext)() || {};
    },

    setupAJAXListeners: function setupAJAXListeners() {
      (0, _emberTestHelpersWait._setupAJAXHooks)();
    },

    teardownAJAXListeners: function teardownAJAXListeners() {
      (0, _emberTestHelpersWait._teardownAJAXHooks)();
    },

    teardownTestElements: function teardownTestElements() {
      document.getElementById('ember-testing').innerHTML = '';

      // Ember 2.0.0 removed Ember.View as public API, so only do this when
      // Ember.View is present
      if (_ember['default'].View && _ember['default'].View.views) {
        _ember['default'].View.views = {};
      }
    },

    teardownContext: function teardownContext() {
      var context = this.context;
      this.context = undefined;
      (0, _emberTestHelpersTestContext.unsetContext)();

      if (context && context.dispatcher && !context.dispatcher.isDestroyed) {
        _ember['default'].run(function () {
          context.dispatcher.destroy();
        });
      }
    }
  });
});
define('ember-test-helpers/build-registry', ['exports', 'ember'], function (exports, _ember) {
  /* globals global, self, requirejs, require */

  'use strict';

  function exposeRegistryMethodsWithoutDeprecations(container) {
    var methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];

    function exposeRegistryMethod(container, method) {
      if (method in container) {
        container[method] = function () {
          return container._registry[method].apply(container._registry, arguments);
        };
      }
    }

    for (var i = 0, l = methods.length; i < l; i++) {
      exposeRegistryMethod(container, methods[i]);
    }
  }

  var Owner = (function () {
    if (_ember['default']._RegistryProxyMixin && _ember['default']._ContainerProxyMixin) {
      return _ember['default'].Object.extend(_ember['default']._RegistryProxyMixin, _ember['default']._ContainerProxyMixin);
    }

    return _ember['default'].Object.extend();
  })();

  exports['default'] = function (resolver) {
    var fallbackRegistry, registry, container;
    var namespace = _ember['default'].Object.create({
      Resolver: { create: function create() {
          return resolver;
        } }
    });

    function register(name, factory) {
      var thingToRegisterWith = registry || container;

      if (!container.lookupFactory(name)) {
        thingToRegisterWith.register(name, factory);
      }
    }

    if (_ember['default'].Application.buildRegistry) {
      fallbackRegistry = _ember['default'].Application.buildRegistry(namespace);
      fallbackRegistry.register('component-lookup:main', _ember['default'].ComponentLookup);

      registry = new _ember['default'].Registry({
        fallback: fallbackRegistry
      });

      if (_ember['default'].ApplicationInstance && _ember['default'].ApplicationInstance.setupRegistry) {
        _ember['default'].ApplicationInstance.setupRegistry(registry);
      }

      // these properties are set on the fallback registry by `buildRegistry`
      // and on the primary registry within the ApplicationInstance constructor
      // but we need to manually recreate them since ApplicationInstance's are not
      // exposed externally
      registry.normalizeFullName = fallbackRegistry.normalizeFullName;
      registry.makeToString = fallbackRegistry.makeToString;
      registry.describe = fallbackRegistry.describe;

      var owner = Owner.create({
        __registry__: registry,
        __container__: null
      });

      container = registry.container({ owner: owner });
      owner.__container__ = container;

      exposeRegistryMethodsWithoutDeprecations(container);
    } else {
      container = _ember['default'].Application.buildContainer(namespace);
      container.register('component-lookup:main', _ember['default'].ComponentLookup);
    }

    // Ember 1.10.0 did not properly add `view:toplevel` or `view:default`
    // to the registry in Ember.Application.buildRegistry :(
    //
    // Ember 2.0.0 removed Ember.View as public API, so only do this when
    // Ember.View is present
    if (_ember['default'].View) {
      register('view:toplevel', _ember['default'].View.extend());
    }

    // Ember 2.0.0 removed Ember._MetamorphView from the Ember global, so only
    // do this when present
    if (_ember['default']._MetamorphView) {
      register('view:default', _ember['default']._MetamorphView);
    }

    var globalContext = typeof global === 'object' && global || self;
    if (requirejs.entries['ember-data/setup-container']) {
      // ember-data is a proper ember-cli addon since 2.3; if no 'import
      // 'ember-data'' is present somewhere in the tests, there is also no `DS`
      // available on the globalContext and hence ember-data wouldn't be setup
      // correctly for the tests; that's why we import and call setupContainer
      // here; also see https://github.com/emberjs/data/issues/4071 for context
      var setupContainer = require('ember-data/setup-container')['default'];
      setupContainer(registry || container);
    } else if (globalContext.DS) {
      var DS = globalContext.DS;
      if (DS._setupContainer) {
        DS._setupContainer(registry || container);
      } else {
        register('transform:boolean', DS.BooleanTransform);
        register('transform:date', DS.DateTransform);
        register('transform:number', DS.NumberTransform);
        register('transform:string', DS.StringTransform);
        register('serializer:-default', DS.JSONSerializer);
        register('serializer:-rest', DS.RESTSerializer);
        register('adapter:-rest', DS.RESTAdapter);
      }
    }

    return {
      registry: registry,
      container: container
    };
  };
});
define('ember-test-helpers/has-ember-version', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports['default'] = hasEmberVersion;

  function hasEmberVersion(major, minor) {
    var numbers = _ember['default'].VERSION.split('-')[0].split('.');
    var actualMajor = parseInt(numbers[0], 10);
    var actualMinor = parseInt(numbers[1], 10);
    return actualMajor > major || actualMajor === major && actualMinor >= minor;
  }
});
define("ember-test-helpers/test-context", ["exports"], function (exports) {
  "use strict";

  exports.setContext = setContext;
  exports.getContext = getContext;
  exports.unsetContext = unsetContext;
  var __test_context__;

  function setContext(context) {
    __test_context__ = context;
  }

  function getContext() {
    return __test_context__;
  }

  function unsetContext() {
    __test_context__ = undefined;
  }
});
define('ember-test-helpers/test-module-for-acceptance', ['exports', 'ember-test-helpers/abstract-test-module', 'ember', 'ember-test-helpers/test-context'], function (exports, _emberTestHelpersAbstractTestModule, _ember, _emberTestHelpersTestContext) {
  'use strict';

  exports['default'] = _emberTestHelpersAbstractTestModule['default'].extend({
    setupContext: function setupContext() {
      this._super({ application: this.createApplication() });
    },

    teardownContext: function teardownContext() {
      _ember['default'].run(function () {
        (0, _emberTestHelpersTestContext.getContext)().application.destroy();
      });

      this._super();
    },

    createApplication: function createApplication() {
      var _callbacks = this.callbacks;
      var Application = _callbacks.Application;
      var config = _callbacks.config;

      var application = undefined;

      _ember['default'].run(function () {
        application = Application.create(config);
        application.setupForTesting();
        application.injectTestHelpers();
      });

      return application;
    }
  });
});
define('ember-test-helpers/test-module-for-component', ['exports', 'ember-test-helpers/test-module', 'ember', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/-legacy-overrides'], function (exports, _emberTestHelpersTestModule, _ember, _emberTestHelpersHasEmberVersion, _emberTestHelpersLegacyOverrides) {
  'use strict';

  exports.setupComponentIntegrationTest = setupComponentIntegrationTest;

  var ACTION_KEY = undefined;
  if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
    ACTION_KEY = 'actions';
  } else {
    ACTION_KEY = '_actions';
  }

  var getOwner = _ember['default'].getOwner;
  exports['default'] = _emberTestHelpersTestModule['default'].extend({
    isComponentTestModule: true,

    init: function init(componentName, description, callbacks) {
      // Allow `description` to be omitted
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = null;
      } else if (!callbacks) {
        callbacks = {};
      }

      this.componentName = componentName;

      if (callbacks.needs || callbacks.unit || callbacks.integration === false) {
        this.isUnitTest = true;
      } else if (callbacks.integration) {
        this.isUnitTest = false;
      } else {
        _ember['default'].deprecate("the component:" + componentName + " test module is implicitly running in unit test mode, " + "which will change to integration test mode by default in an upcoming version of " + "ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit " + "test mode.", false, { id: 'ember-test-helpers.test-module-for-component.test-type', until: '0.6.0' });
        this.isUnitTest = true;
      }

      if (description) {
        this._super.call(this, 'component:' + componentName, description, callbacks);
      } else {
        this._super.call(this, 'component:' + componentName, callbacks);
      }

      if (!this.isUnitTest && !this.isLegacy) {
        callbacks.integration = true;
      }

      if (this.isUnitTest || this.isLegacy) {
        this.setupSteps.push(this.setupComponentUnitTest);
      } else {
        this.callbacks.subject = function () {
          throw new Error("component integration tests do not support `subject()`. Instead, render the component as if it were HTML: `this.render('<my-component foo=true>');`. For more information, read: http://guides.emberjs.com/v2.2.0/testing/testing-components/");
        };
        this.setupSteps.push(this.setupComponentIntegrationTest);
        this.teardownSteps.unshift(this.teardownComponent);
      }

      if (_ember['default'].View && _ember['default'].View.views) {
        this.setupSteps.push(this._aliasViewRegistry);
        this.teardownSteps.unshift(this._resetViewRegistry);
      }
    },

    _aliasViewRegistry: function _aliasViewRegistry() {
      this._originalGlobalViewRegistry = _ember['default'].View.views;
      var viewRegistry = this.container.lookup('-view-registry:main');

      if (viewRegistry) {
        _ember['default'].View.views = viewRegistry;
      }
    },

    _resetViewRegistry: function _resetViewRegistry() {
      _ember['default'].View.views = this._originalGlobalViewRegistry;
    },

    setupComponentUnitTest: function setupComponentUnitTest() {
      var _this = this;
      var resolver = this.resolver;
      var context = this.context;

      var layoutName = 'template:components/' + this.componentName;

      var layout = resolver.resolve(layoutName);

      var thingToRegisterWith = this.registry || this.container;
      if (layout) {
        thingToRegisterWith.register(layoutName, layout);
        thingToRegisterWith.injection(this.subjectName, 'layout', layoutName);
      }

      context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
      context.dispatcher.setup({}, '#ember-testing');

      context._element = null;

      this.callbacks.render = function () {
        var subject;

        _ember['default'].run(function () {
          subject = context.subject();
          subject.appendTo('#ember-testing');
        });

        context._element = subject.element;

        _this.teardownSteps.unshift(function () {
          _ember['default'].run(function () {
            _ember['default'].tryInvoke(subject, 'destroy');
          });
        });
      };

      this.callbacks.append = function () {
        _ember['default'].deprecate('this.append() is deprecated. Please use this.render() or this.$() instead.', false, { id: 'ember-test-helpers.test-module-for-component.append', until: '0.6.0' });
        return context.$();
      };

      context.$ = function () {
        this.render();
        var subject = this.subject();

        return subject.$.apply(subject, arguments);
      };
    },

    setupComponentIntegrationTest: (function () {
      if (!(0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
        return _emberTestHelpersLegacyOverrides.preGlimmerSetupIntegrationForComponent;
      } else {
        return setupComponentIntegrationTest;
      }
    })(),

    setupContext: function setupContext() {
      this._super.call(this);

      // only setup the injection if we are running against a version
      // of Ember that has `-view-registry:main` (Ember >= 1.12)
      if (this.container.lookupFactory('-view-registry:main')) {
        (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
      }

      if (!this.isUnitTest && !this.isLegacy) {
        this.context.factory = function () {};
      }
    },

    teardownComponent: function teardownComponent() {
      var component = this.component;
      if (component) {
        _ember['default'].run(component, 'destroy');
        this.component = null;
      }
    }
  });

  function setupComponentIntegrationTest() {
    var module = this;
    var context = this.context;

    this.actionHooks = context[ACTION_KEY] = {};
    context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    var hasRendered = false;
    var OutletView = module.container.lookupFactory('view:-outlet');
    var OutletTemplate = module.container.lookup('template:-outlet');
    var toplevelView = module.component = OutletView.create();
    var hasOutletTemplate = !!OutletTemplate;
    var outletState = {
      render: {
        owner: getOwner ? getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'application',
        controller: module.context,
        ViewClass: undefined,
        template: OutletTemplate
      },

      outlets: {}
    };

    var element = document.getElementById('ember-testing');
    var templateId = 0;

    if (hasOutletTemplate) {
      _ember['default'].run(function () {
        toplevelView.setOutletState(outletState);
      });
    }

    context.render = function (template) {
      if (!template) {
        throw new Error("in a component integration test you must pass a template to `render()`");
      }
      if (_ember['default'].isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = _ember['default'].Handlebars.compile(template);
      }

      var templateFullName = 'template:-undertest-' + ++templateId;
      this.registry.register(templateFullName, template);
      var stateToRender = {
        owner: getOwner ? getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'index',
        controller: module.context,
        ViewClass: undefined,
        template: module.container.lookup(templateFullName),
        outlets: {}
      };

      if (hasOutletTemplate) {
        stateToRender.name = 'index';
        outletState.outlets.main = { render: stateToRender, outlets: {} };
      } else {
        stateToRender.name = 'application';
        outletState = { render: stateToRender, outlets: {} };
      }

      _ember['default'].run(function () {
        toplevelView.setOutletState(outletState);
      });

      if (!hasRendered) {
        _ember['default'].run(module.component, 'appendTo', '#ember-testing');
        hasRendered = true;
      }

      // ensure the element is based on the wrapping toplevel view
      // Ember still wraps the main application template with a
      // normal tagged view
      context._element = element = document.querySelector('#ember-testing > .ember-view');
    };

    context.$ = function (selector) {
      // emulates Ember internal behavor of `this.$` in a component
      // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
      return selector ? _ember['default'].$(selector, element) : _ember['default'].$(element);
    };

    context.set = function (key, value) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].set(context, key, value);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].setProperties(context, hash);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return _ember['default'].get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return _ember['default'].getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error("integration testing template received unexpected action " + actionName);
      }
      hook.apply(module.context, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      _ember['default'].run(function () {
        toplevelView.setOutletState({
          render: {
            owner: module.container,
            into: undefined,
            outlet: 'main',
            name: 'application',
            controller: module.context,
            ViewClass: undefined,
            template: undefined
          },
          outlets: {}
        });
      });
    };
  }
});
define('ember-test-helpers/test-module-for-integration', ['exports', 'ember', 'ember-test-helpers/abstract-test-module', 'ember-test-helpers/test-resolver', 'ember-test-helpers/build-registry', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/-legacy-overrides', 'ember-test-helpers/test-module-for-component'], function (exports, _ember, _emberTestHelpersAbstractTestModule, _emberTestHelpersTestResolver, _emberTestHelpersBuildRegistry, _emberTestHelpersHasEmberVersion, _emberTestHelpersLegacyOverrides, _emberTestHelpersTestModuleForComponent) {
  'use strict';

  var ACTION_KEY = undefined;
  if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
    ACTION_KEY = 'actions';
  } else {
    ACTION_KEY = '_actions';
  }

  exports['default'] = _emberTestHelpersAbstractTestModule['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      this.resolver = this.callbacks.resolver || (0, _emberTestHelpersTestResolver.getResolver)();
    },

    initSetupSteps: function initSetupSteps() {
      this.setupSteps = [];
      this.contextualizedSetupSteps = [];

      if (this.callbacks.beforeSetup) {
        this.setupSteps.push(this.callbacks.beforeSetup);
        delete this.callbacks.beforeSetup;
      }

      this.setupSteps.push(this.setupContainer);
      this.setupSteps.push(this.setupContext);
      this.setupSteps.push(this.setupTestElements);
      this.setupSteps.push(this.setupAJAXListeners);
      this.setupSteps.push(this.setupComponentIntegrationTest);

      if (_ember['default'].View && _ember['default'].View.views) {
        this.setupSteps.push(this._aliasViewRegistry);
      }

      if (this.callbacks.setup) {
        this.contextualizedSetupSteps.push(this.callbacks.setup);
        delete this.callbacks.setup;
      }
    },

    initTeardownSteps: function initTeardownSteps() {
      this.teardownSteps = [];
      this.contextualizedTeardownSteps = [];

      if (this.callbacks.teardown) {
        this.contextualizedTeardownSteps.push(this.callbacks.teardown);
        delete this.callbacks.teardown;
      }

      this.teardownSteps.push(this.teardownContainer);
      this.teardownSteps.push(this.teardownContext);
      this.teardownSteps.push(this.teardownAJAXListeners);
      this.teardownSteps.push(this.teardownComponent);

      if (_ember['default'].View && _ember['default'].View.views) {
        this.teardownSteps.push(this._resetViewRegistry);
      }

      this.teardownSteps.push(this.teardownTestElements);

      if (this.callbacks.afterTeardown) {
        this.teardownSteps.push(this.callbacks.afterTeardown);
        delete this.callbacks.afterTeardown;
      }
    },

    setupContainer: function setupContainer() {
      var resolver = this.resolver;
      var items = (0, _emberTestHelpersBuildRegistry['default'])(resolver);

      this.container = items.container;
      this.registry = items.registry;

      if ((0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
        var thingToRegisterWith = this.registry || this.container;
        var router = resolver.resolve('router:main');
        router = router || _ember['default'].Router.extend();
        thingToRegisterWith.register('router:main', router);
      }
    },

    setupContext: function setupContext() {
      var subjectName = this.subjectName;
      var container = this.container;

      var factory = function factory() {
        return container.lookupFactory(subjectName);
      };

      this._super({
        container: this.container,
        registry: this.registry,
        factory: factory,
        register: function register() {
          var target = this.registry || this.container;
          return target.register.apply(target, arguments);
        }
      });

      var context = this.context;

      if (_ember['default'].setOwner) {
        _ember['default'].setOwner(context, this.container.owner);
      }

      if (_ember['default'].inject) {
        var keys = (Object.keys || _ember['default'].keys)(_ember['default'].inject);
        keys.forEach(function (typeName) {
          context.inject[typeName] = function (name, opts) {
            var alias = opts && opts.as || name;
            _ember['default'].run(function () {
              _ember['default'].set(context, alias, context.container.lookup(typeName + ':' + name));
            });
          };
        });
      }

      // only setup the injection if we are running against a version
      // of Ember that has `-view-registry:main` (Ember >= 1.12)
      if (this.container.lookupFactory('-view-registry:main')) {
        (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
      }
    },

    setupComponentIntegrationTest: (function () {
      if (!(0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
        return _emberTestHelpersLegacyOverrides.preGlimmerSetupIntegrationForComponent;
      } else {
        return _emberTestHelpersTestModuleForComponent.setupComponentIntegrationTest;
      }
    })(),

    teardownComponent: function teardownComponent() {
      var component = this.component;
      if (component) {
        _ember['default'].run(function () {
          component.destroy();
        });
      }
    },

    teardownContainer: function teardownContainer() {
      var container = this.container;
      _ember['default'].run(function () {
        container.destroy();
      });
    },

    // allow arbitrary named factories, like rspec let
    contextualizeCallbacks: function contextualizeCallbacks() {
      var callbacks = this.callbacks;
      var context = this.context;

      this.cache = this.cache || {};
      this.cachedCalls = this.cachedCalls || {};

      var keys = (Object.keys || _ember['default'].keys)(callbacks);
      var keysLength = keys.length;

      if (keysLength) {
        for (var i = 0; i < keysLength; i++) {
          this._contextualizeCallback(context, keys[i], context);
        }
      }
    },

    _contextualizeCallback: function _contextualizeCallback(context, key, callbackContext) {
      var _this = this;
      var callbacks = this.callbacks;
      var factory = context.factory;

      context[key] = function (options) {
        if (_this.cachedCalls[key]) {
          return _this.cache[key];
        }

        var result = callbacks[key].call(callbackContext, options, factory());

        _this.cache[key] = result;
        _this.cachedCalls[key] = true;

        return result;
      };
    },

    _aliasViewRegistry: function _aliasViewRegistry() {
      this._originalGlobalViewRegistry = _ember['default'].View.views;
      var viewRegistry = this.container.lookup('-view-registry:main');

      if (viewRegistry) {
        _ember['default'].View.views = viewRegistry;
      }
    },

    _resetViewRegistry: function _resetViewRegistry() {
      _ember['default'].View.views = this._originalGlobalViewRegistry;
    }
  });
});
define('ember-test-helpers/test-module-for-model', ['exports', 'ember-test-helpers/test-module', 'ember'], function (exports, _emberTestHelpersTestModule, _ember) {
  /* global DS, require, requirejs */ // added here to prevent an import from erroring when ED is not present

  'use strict';

  exports['default'] = _emberTestHelpersTestModule['default'].extend({
    init: function init(modelName, description, callbacks) {
      this.modelName = modelName;

      this._super.call(this, 'model:' + modelName, description, callbacks);

      this.setupSteps.push(this.setupModel);
    },

    setupModel: function setupModel() {
      var container = this.container;
      var defaultSubject = this.defaultSubject;
      var callbacks = this.callbacks;
      var modelName = this.modelName;

      var adapterFactory = container.lookupFactory('adapter:application');
      if (!adapterFactory) {
        if (requirejs.entries['ember-data/adapters/json-api']) {
          adapterFactory = require('ember-data/adapters/json-api')['default'];
        }

        // when ember-data/adapters/json-api is provided via ember-cli shims
        // using Ember Data 1.x the actual JSONAPIAdapter isn't found, but the
        // above require statement returns a bizzaro object with only a `default`
        // property (circular reference actually)
        if (!adapterFactory || !adapterFactory.create) {
          adapterFactory = DS.JSONAPIAdapter || DS.FixtureAdapter;
        }

        var thingToRegisterWith = this.registry || this.container;
        thingToRegisterWith.register('adapter:application', adapterFactory);
      }

      callbacks.store = function () {
        var container = this.container;
        var store = container.lookup('service:store') || container.lookup('store:main');
        return store;
      };

      if (callbacks.subject === defaultSubject) {
        callbacks.subject = function (options) {
          var container = this.container;

          return _ember['default'].run(function () {
            var store = container.lookup('service:store') || container.lookup('store:main');
            return store.createRecord(modelName, options);
          });
        };
      }
    }
  });
});
define('ember-test-helpers/test-module', ['exports', 'ember', 'ember-test-helpers/abstract-test-module', 'ember-test-helpers/test-resolver', 'ember-test-helpers/build-registry', 'ember-test-helpers/has-ember-version'], function (exports, _ember, _emberTestHelpersAbstractTestModule, _emberTestHelpersTestResolver, _emberTestHelpersBuildRegistry, _emberTestHelpersHasEmberVersion) {
  'use strict';

  exports['default'] = _emberTestHelpersAbstractTestModule['default'].extend({
    init: function init(subjectName, description, callbacks) {
      // Allow `description` to be omitted, in which case it should
      // default to `subjectName`
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = subjectName;
      }

      this.subjectName = subjectName;
      this.description = description || subjectName;
      this.name = description || subjectName;
      this.callbacks = callbacks || {};
      this.resolver = this.callbacks.resolver || (0, _emberTestHelpersTestResolver.getResolver)();

      if (this.callbacks.integration && this.callbacks.needs) {
        throw new Error("cannot declare 'integration: true' and 'needs' in the same module");
      }

      if (this.callbacks.integration) {
        if (this.isComponentTestModule) {
          this.isLegacy = callbacks.integration === 'legacy';
          this.isIntegration = callbacks.integration !== 'legacy';
        } else {
          if (callbacks.integration === 'legacy') {
            throw new Error('`integration: \'legacy\'` is only valid for component tests.');
          }
          this.isIntegration = true;
        }

        delete callbacks.integration;
      }

      this.initSubject();
      this.initNeeds();
      this.initSetupSteps();
      this.initTeardownSteps();
    },

    initSubject: function initSubject() {
      this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
    },

    initNeeds: function initNeeds() {
      this.needs = [this.subjectName];
      if (this.callbacks.needs) {
        this.needs = this.needs.concat(this.callbacks.needs);
        delete this.callbacks.needs;
      }
    },

    initSetupSteps: function initSetupSteps() {
      this.setupSteps = [];
      this.contextualizedSetupSteps = [];

      if (this.callbacks.beforeSetup) {
        this.setupSteps.push(this.callbacks.beforeSetup);
        delete this.callbacks.beforeSetup;
      }

      this.setupSteps.push(this.setupContainer);
      this.setupSteps.push(this.setupContext);
      this.setupSteps.push(this.setupTestElements);
      this.setupSteps.push(this.setupAJAXListeners);

      if (this.callbacks.setup) {
        this.contextualizedSetupSteps.push(this.callbacks.setup);
        delete this.callbacks.setup;
      }
    },

    initTeardownSteps: function initTeardownSteps() {
      this.teardownSteps = [];
      this.contextualizedTeardownSteps = [];

      if (this.callbacks.teardown) {
        this.contextualizedTeardownSteps.push(this.callbacks.teardown);
        delete this.callbacks.teardown;
      }

      this.teardownSteps.push(this.teardownSubject);
      this.teardownSteps.push(this.teardownContainer);
      this.teardownSteps.push(this.teardownContext);
      this.teardownSteps.push(this.teardownTestElements);
      this.teardownSteps.push(this.teardownAJAXListeners);

      if (this.callbacks.afterTeardown) {
        this.teardownSteps.push(this.callbacks.afterTeardown);
        delete this.callbacks.afterTeardown;
      }
    },

    setupContainer: function setupContainer() {
      if (this.isIntegration || this.isLegacy) {
        this._setupIntegratedContainer();
      } else {
        this._setupIsolatedContainer();
      }
    },

    setupContext: function setupContext() {
      var subjectName = this.subjectName;
      var container = this.container;

      var factory = function factory() {
        return container.lookupFactory(subjectName);
      };

      this._super({
        container: this.container,
        registry: this.registry,
        factory: factory,
        register: function register() {
          var target = this.registry || this.container;
          return target.register.apply(target, arguments);
        }
      });

      if (_ember['default'].setOwner) {
        _ember['default'].setOwner(this.context, this.container.owner);
      }

      this.setupInject();
    },

    setupInject: function setupInject() {
      var module = this;
      var context = this.context;

      if (_ember['default'].inject) {
        var keys = (Object.keys || _ember['default'].keys)(_ember['default'].inject);

        keys.forEach(function (typeName) {
          context.inject[typeName] = function (name, opts) {
            var alias = opts && opts.as || name;
            _ember['default'].run(function () {
              _ember['default'].set(context, alias, module.container.lookup(typeName + ':' + name));
            });
          };
        });
      }
    },

    teardownSubject: function teardownSubject() {
      var subject = this.cache.subject;

      if (subject) {
        _ember['default'].run(function () {
          _ember['default'].tryInvoke(subject, 'destroy');
        });
      }
    },

    teardownContainer: function teardownContainer() {
      var container = this.container;
      _ember['default'].run(function () {
        container.destroy();
      });
    },

    defaultSubject: function defaultSubject(options, factory) {
      return factory.create(options);
    },

    // allow arbitrary named factories, like rspec let
    contextualizeCallbacks: function contextualizeCallbacks() {
      var callbacks = this.callbacks;
      var context = this.context;

      this.cache = this.cache || {};
      this.cachedCalls = this.cachedCalls || {};

      var keys = (Object.keys || _ember['default'].keys)(callbacks);
      var keysLength = keys.length;

      if (keysLength) {
        var deprecatedContext = this._buildDeprecatedContext(this, context);
        for (var i = 0; i < keysLength; i++) {
          this._contextualizeCallback(context, keys[i], deprecatedContext);
        }
      }
    },

    _contextualizeCallback: function _contextualizeCallback(context, key, callbackContext) {
      var _this = this;
      var callbacks = this.callbacks;
      var factory = context.factory;

      context[key] = function (options) {
        if (_this.cachedCalls[key]) {
          return _this.cache[key];
        }

        var result = callbacks[key].call(callbackContext, options, factory());

        _this.cache[key] = result;
        _this.cachedCalls[key] = true;

        return result;
      };
    },

    /*
      Builds a version of the passed in context that contains deprecation warnings
      for accessing properties that exist on the module.
    */
    _buildDeprecatedContext: function _buildDeprecatedContext(module, context) {
      var deprecatedContext = Object.create(context);

      var keysForDeprecation = Object.keys(module);

      for (var i = 0, l = keysForDeprecation.length; i < l; i++) {
        this._proxyDeprecation(module, deprecatedContext, keysForDeprecation[i]);
      }

      return deprecatedContext;
    },

    /*
      Defines a key on an object to act as a proxy for deprecating the original.
    */
    _proxyDeprecation: function _proxyDeprecation(obj, proxy, key) {
      if (typeof proxy[key] === 'undefined') {
        Object.defineProperty(proxy, key, {
          get: function get() {
            _ember['default'].deprecate('Accessing the test module property "' + key + '" from a callback is deprecated.', false, { id: 'ember-test-helpers.test-module.callback-context', until: '0.6.0' });
            return obj[key];
          }
        });
      }
    },

    _setupContainer: function _setupContainer(isolated) {
      var resolver = this.resolver;

      var items = (0, _emberTestHelpersBuildRegistry['default'])(!isolated ? resolver : Object.create(resolver, {
        resolve: {
          value: function value() {}
        }
      }));

      this.container = items.container;
      this.registry = items.registry;

      if ((0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
        var thingToRegisterWith = this.registry || this.container;
        var router = resolver.resolve('router:main');
        router = router || _ember['default'].Router.extend();
        thingToRegisterWith.register('router:main', router);
      }
    },

    _setupIsolatedContainer: function _setupIsolatedContainer() {
      var resolver = this.resolver;
      this._setupContainer(true);

      var thingToRegisterWith = this.registry || this.container;

      for (var i = this.needs.length; i > 0; i--) {
        var fullName = this.needs[i - 1];
        var normalizedFullName = resolver.normalize(fullName);
        thingToRegisterWith.register(fullName, resolver.resolve(normalizedFullName));
      }

      if (!this.registry) {
        this.container.resolver = function () {};
      }
    },

    _setupIntegratedContainer: function _setupIntegratedContainer() {
      this._setupContainer();
    }

  });
});
define('ember-test-helpers/test-resolver', ['exports'], function (exports) {
  'use strict';

  exports.setResolver = setResolver;
  exports.getResolver = getResolver;
  var __resolver__;

  function setResolver(resolver) {
    __resolver__ = resolver;
  }

  function getResolver() {
    if (__resolver__ == null) {
      throw new Error('you must set a resolver with `testResolver.set(resolver)`');
    }

    return __resolver__;
  }
});
define('ember-test-helpers/wait', ['exports', 'ember'], function (exports, _ember) {
  /* globals self */

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports._teardownAJAXHooks = _teardownAJAXHooks;
  exports._setupAJAXHooks = _setupAJAXHooks;
  exports['default'] = wait;

  var jQuery = _ember['default'].$;

  var requests;
  function incrementAjaxPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementAjaxPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
      }
    }
  }

  function _teardownAJAXHooks() {
    if (!jQuery) {
      return;
    }

    jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }

  function _setupAJAXHooks() {
    requests = [];

    if (!jQuery) {
      return;
    }

    jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }

  var _internalCheckWaiters;
  if (_ember['default'].__loader.registry['ember-testing/test/waiters']) {
    _internalCheckWaiters = _ember['default'].__loader.require('ember-testing/test/waiters').checkWaiters;
  }

  function checkWaiters() {
    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (_ember['default'].Test.waiters) {
      if (_ember['default'].Test.waiters.any(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var context = _ref2[0];
        var callback = _ref2[1];
        return !callback.call(context);
      })) {
        return true;
      }
    }

    return false;
  }

  function wait(_options) {
    var options = _options || {};
    var waitForTimers = options.hasOwnProperty('waitForTimers') ? options.waitForTimers : true;
    var waitForAJAX = options.hasOwnProperty('waitForAJAX') ? options.waitForAJAX : true;
    var waitForWaiters = options.hasOwnProperty('waitForWaiters') ? options.waitForWaiters : true;

    return new _ember['default'].RSVP.Promise(function (resolve) {
      var watcher = self.setInterval(function () {
        if (waitForTimers && (_ember['default'].run.hasScheduledTimers() || _ember['default'].run.currentRunLoop)) {
          return;
        }

        if (waitForAJAX && requests && requests.length > 0) {
          return;
        }

        if (waitForWaiters && checkWaiters()) {
          return;
        }

        // Stop polling
        self.clearInterval(watcher);

        // Synchronously resolve the promise
        _ember['default'].run(null, resolve);
      }, 10);
    });
  }
});
define('klassy', ['exports'], function (exports) {
  /**
   Extend a class with the properties and methods of one or more other classes.
  
   When a method is replaced with another method, it will be wrapped in a
   function that makes the replaced method accessible via `this._super`.
  
   @method extendClass
   @param {Object} destination The class to merge into
   @param {Object} source One or more source classes
   */
  'use strict';

  var extendClass = function extendClass(destination) {
    var sources = Array.prototype.slice.call(arguments, 1);
    var source;

    for (var i = 0, l = sources.length; i < l; i++) {
      source = sources[i];

      for (var p in source) {
        if (source.hasOwnProperty(p) && destination[p] && typeof destination[p] === 'function' && typeof source[p] === 'function') {

          /* jshint loopfunc:true */
          destination[p] = (function (destinationFn, sourceFn) {
            var wrapper = function wrapper() {
              var prevSuper = this._super;
              this._super = destinationFn;

              var ret = sourceFn.apply(this, arguments);

              this._super = prevSuper;

              return ret;
            };
            wrapper.wrappedFunction = sourceFn;
            return wrapper;
          })(destination[p], source[p]);
        } else {
          destination[p] = source[p];
        }
      }
    }
  };

  // `subclassing` is a state flag used by `defineClass` to track when a class is
  // being subclassed. It allows constructors to avoid calling `init`, which can
  // be expensive and cause undesirable side effects.
  var subclassing = false;

  /**
   Define a new class with the properties and methods of one or more other classes.
  
   The new class can be based on a `SuperClass`, which will be inserted into its
   prototype chain.
  
   Furthermore, one or more mixins (object that contain properties and/or methods)
   may be specified, which will be applied in order. When a method is replaced
   with another method, it will be wrapped in a function that makes the previous
   method accessible via `this._super`.
  
   @method defineClass
   @param {Object} SuperClass A base class to extend. If `mixins` are to be included
   without a `SuperClass`, pass `null` for SuperClass.
   @param {Object} mixins One or more objects that contain properties and methods
   to apply to the new class.
   */
  var defineClass = function defineClass(SuperClass) {
    var Klass = function Klass() {
      if (!subclassing && this.init) {
        this.init.apply(this, arguments);
      }
    };

    if (SuperClass) {
      subclassing = true;
      Klass.prototype = new SuperClass();
      subclassing = false;
    }

    if (arguments.length > 1) {
      var extendArgs = Array.prototype.slice.call(arguments, 1);
      extendArgs.unshift(Klass.prototype);
      extendClass.apply(Klass.prototype, extendArgs);
    }

    Klass.constructor = Klass;

    Klass.extend = function () {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(Klass);
      return defineClass.apply(Klass, args);
    };

    return Klass;
  };

  /**
   A base class that can be extended.
  
   @example
  
   ```javascript
   var CelestialObject = Klass.extend({
     init: function(name) {
       this._super();
       this.name = name;
       this.isCelestialObject = true;
     },
     greeting: function() {
       return 'Hello from ' + this.name;
     }
   });
  
   var Planet = CelestialObject.extend({
     init: function(name) {
       this._super.apply(this, arguments);
       this.isPlanet = true;
     },
     greeting: function() {
       return this._super() + '!';
     },
   });
  
   var earth = new Planet('Earth');
  
   console.log(earth instanceof Klass);           // true
   console.log(earth instanceof CelestialObject); // true
   console.log(earth instanceof Planet);          // true
  
   console.log(earth.isCelestialObject);          // true
   console.log(earth.isPlanet);                   // true
  
   console.log(earth.greeting());                 // 'Hello from Earth!'
   ```
  
   @class Klass
   */
  var Klass = defineClass(null, {
    init: function init() {}
  });

  exports.Klass = Klass;
  exports.defineClass = defineClass;
  exports.extendClass = extendClass;
});
define("mocha", ["exports"], function (exports) {
  /*global mocha, describe, context, it, before, after */

  /**
   * Takes a function that defines a mocha hook, like `beforeEach` and
   * runs its callback inside an `Ember.run`.
   *
   * In the canonical mocha style, beforeEach/afterEach blocks are for
   * taking actions that have potentially asynchronous side effects like
   * making network requests, and in the case of ember doing things like
   * sending events, or visiting pages. In the context of an Ember
   * application this more often than not means doing something inside
   * of an `Ember.run`. The resulting wrapper has a reference to
   * original hook function as the `withoutEmberRun`. E.g.
   *
   *   import { beforeEach } from 'mocha';
   *
   *   beforeEach(function {
   *     // this is run inside `Ember.run`
   *   })
  
   *   beforeEach.withoutEmberRun(function({
   *    // this is not inside `Ember.run`
   *   }))
   *
   * You should almost never need to use the version without `Ember.run`
   *
   * Mocha supports two invocation styles for its hooks depending on the
   * synchronization requirements of the setup code, and this wrapper
   * supports both of them.
   *
   * As normal, if the setup code returns a promise, the testcase will
   * wait until the promise is settled.
  
   * @param {Function} original The native mocha hook to wrap
   * @returns {Function} the wrapped hook
   * @private
   */
  "use strict";

  function wrapMochaHookInEmberRun(original) {
    function wrapper(fn) {
      // the callback expects a `done` parameter
      if (fn.length) {
        return original(function (done) {
          return Ember.run((function (_this) {
            return function () {
              return fn.call(_this, done);
            };
          })(this));
        });
      } else {
        // no done parameter.
        return original(function () {
          return Ember.run((function (_this) {
            return function () {
              return fn.call(_this);
            };
          })(this));
        });
      }
    }
    wrapper.withoutEmberRun = original;
    return wrapper;
  }

  var beforeEach = wrapMochaHookInEmberRun(window.beforeEach);
  var afterEach = wrapMochaHookInEmberRun(window.afterEach);

  exports.mocha = mocha;
  exports.describe = describe;
  exports.context = context;
  exports.it = it;
  exports.before = before;
  exports.beforeEach = beforeEach;
  exports.after = after;
  exports.afterEach = afterEach;
});
/* jshint ignore:start */

runningTests = true;

if (window.Testem) {
  window.Testem.hookIntoTestFramework();
}



/* jshint ignore:end */
//# sourceMappingURL=test-support.map