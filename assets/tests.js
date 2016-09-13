define('dummy/tests/blanket-options', ['exports'], function (exports) {
  /* globals blanket, module */

  var options = {
    modulePrefix: 'ember-frost-info-bar',
    filter: '//.*ember-frost-info-bar/.*/',
    antifilter: '//.*(tests|template).*/',
    loaderExclusions: [],
    enableCoverage: true,
    cliOptions: {
      reporters: ['lcov'],
      autostart: true,
      lcovOptions: {
        outputFile: 'coverage/lcov.info',
        renamer: function renamer(fileName) {
          return fileName.replace('ember-frost-info-bar', 'addon') + '.js';
        }
      }
    }
  };

  if (typeof exports === 'undefined') {
    blanket.options(options);
  } else {
    module.exports = options;
  }
});
define('dummy/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('dummy/tests/helpers/resolver', ['exports', 'dummy/resolver', 'dummy/config/environment'], function (exports, _dummyResolver, _dummyConfigEnvironment) {

  var resolver = _dummyResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _dummyConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _dummyConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('dummy/tests/helpers/start-app', ['exports', 'ember', 'dummy/app', 'dummy/config/environment'], function (exports, _ember, _dummyApp, _dummyConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _dummyConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override

    _ember['default'].run(function () {
      application = _dummyApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('dummy/tests/integration/components/ember-frost-info-bar-test', ['exports', 'chai', 'ember-hook', 'ember-mocha', 'mocha', 'sinon', 'ember'], function (exports, _chai, _emberHook, _emberMocha, _mocha, _sinon, _ember) {
  var next = _ember['default'].run.next;

  var testTemplate = _ember['default'].HTMLBars.template((function () {
    return {
      meta: {
        'fragmentReason': {
          'name': 'missing-wrapper',
          'problems': ['wrong-type']
        },
        'revision': 'Ember@2.6.2',
        'loc': {
          'source': null,
          'start': {
            'line': 1,
            'column': 0
          },
          'end': {
            'line': 23,
            'column': 4
          }
        }
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode('\n  ');
        dom.appendChild(el0, el1);
        var el1 = dom.createComment('');
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [['inline', 'frost-info-bar', [], ['hook', ['subexpr', '@mut', [['get', 'hook', ['loc', [null, [2, 24], [2, 28]]]]], [], []], 'icon-module', ['subexpr', 'component', ['frost-icon'], ['icon', 'bacon', 'pack', 'dummy'], ['loc', [null, [3, 16], [6, 5]]]], 'title-module', ['subexpr', 'component', ['text-box'], ['text', '&lt;placeholder: title&gt;'], ['loc', [null, [7, 17], [9, 5]]]], 'summary-module', ['subexpr', 'component', ['text-box'], ['isVisible', ['subexpr', '@mut', [['get', 'summary', ['loc', [null, [11, 16], [11, 23]]]]], [], []], 'text', '&lt;placeholder: summary&gt;'], ['loc', [null, [10, 19], [13, 5]]]], 'controls-module', ['subexpr', 'component', ['text-box'], ['text', '&lt;placeholder: controls&gt;'], ['loc', [null, [14, 20], [16, 5]]]], 'actions-module', ['subexpr', 'component', ['frost-button'], ['design', 'info-bar', 'icon', 'infobar-create', 'text', 'Click me!', 'onClick', ['subexpr', 'action', ['triggerAction'], [], ['loc', [null, [21, 14], [21, 38]]]]], ['loc', [null, [17, 19], [22, 5]]]]], ['loc', [null, [2, 2], [23, 4]]]]],
      locals: [],
      templates: []
    };
  })());

  (0, _emberMocha.describeComponent)('ember-frost-info-bar', 'Integration: EmberFrostInfoBarComponent', {
    integration: true
  }, function () {
    var props = undefined;
    var spy = undefined;
    (0, _mocha.beforeEach)(function () {
      (0, _emberHook.initialize)();
      spy = _sinon['default'].spy();
      props = {
        hook: 'my-info-bar',
        actions: {
          triggerAction: spy
        }
      };
      this.setProperties(props);
      this.render(testTemplate);
    });
    var text = function text(el) {
      return el.text().trim();
    };
    (0, _emberMocha.it)('has a default hook name', function () {
      var el = (0, _emberHook.$hook)('my-info-bar');
      (0, _chai.expect)(el.hasClass('frost-info-bar')).to.be['true'];
    });

    (0, _emberMocha.it)('has a hook for icon', function () {
      var el = (0, _emberHook.$hook)('my-info-bar-icon');
      (0, _chai.expect)(el.hasClass('frost-info-bar-icon')).to.be['true'];
    });

    (0, _emberMocha.it)('has a hook for title', function () {
      var el = (0, _emberHook.$hook)('my-info-bar-title');
      (0, _chai.expect)(text(el)).to.eql('<placeholder: title>');
    });

    (0, _emberMocha.it)('has a hook for summary', function () {
      var el = (0, _emberHook.$hook)('my-info-bar-summary');
      (0, _chai.expect)(text(el)).to.eql('<placeholder: summary>');
    });

    (0, _emberMocha.it)('has a hook for controls', function () {
      var el = (0, _emberHook.$hook)('my-info-bar-controls');
      (0, _chai.expect)(text(el)).to.eql('<placeholder: controls>');
    });

    (0, _emberMocha.it)('has a hook for actions', function () {
      var el = (0, _emberHook.$hook)('my-info-bar-actions');
      (0, _chai.expect)(text(el)).to.eql('Click me!');
    });
    (0, _emberMocha.it)('triggers action correctly', function (done) {
      var el = (0, _emberHook.$hook)('my-info-bar-actions');
      el.find('button').click();
      next(function () {
        (0, _chai.expect)(spy.called).to.be['true'];
        done();
      });
    });
  });
});
define('dummy/tests/test-helper', ['exports', 'dummy/tests/helpers/resolver', 'ember-mocha'], function (exports, _dummyTestsHelpersResolver, _emberMocha) {

  (0, _emberMocha.setResolver)(_dummyTestsHelpersResolver['default']);
});
define('dummy/tests/unit/components/info-bar-test', ['exports', 'ember-mocha', 'mocha'], function (exports, _emberMocha, _mocha) {
  var expect = chai.expect;

  (0, _emberMocha.describeComponent)('frost-info-bar', 'FrostInfoBarComponent', {
    unit: true
  }, function () {
    var component = undefined;

    (0, _mocha.beforeEach)(function () {
      component = this.subject();
    });

    (0, _mocha.it)('includes className frost-info-bar', function () {
      expect(component.classNames).to.include('frost-info-bar');
    });
  });
});
/* jshint ignore:start */

require('dummy/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map