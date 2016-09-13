/* globals module */

'use strict'

module.exports = {
  name: 'ember-frost-info-bar',
  init: function (app) {
    this._super(...arguments)
    this.options = this.options || {}
    this.options.babel = this.options.babel || {}
    this.options.babel.optional = this.options.babel.optional || []

    if (this.options.babel.optional.indexOf('es7.decorators') === -1) {
      this.options.babel.optional.push('es7.decorators')
    }
  },
  included: function (app) {
    this._super.included(app)
  }
}
