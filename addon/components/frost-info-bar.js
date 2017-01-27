import {Component} from 'ember-frost-core'
import PropTypeMixin, {PropTypes} from 'ember-prop-types'
import SpreadMixin from 'ember-spread'
import layout from '../templates/components/frost-info-bar'

export default Component.extend({
  // == Properties ============================================================

  classNames: ['frost-info-bar'],
  layout
})
