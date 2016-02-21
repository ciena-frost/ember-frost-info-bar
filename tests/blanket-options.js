/* globals blanket, module */

var options = {
  modulePrefix: 'ember-frost-info-bar',
  filter: '//.*ember-frost-info-bar/.*/',
  antifilter: '//.*(tests|template).*/',
  loaderExclusions: [],
  enableCoverage: true,
  cliOptions: {
    reporters: ['teamcity'],
    autostart: true
  }
}

if (typeof exports === 'undefined') {
  blanket.options(options)
} else {
  module.exports = options
}
