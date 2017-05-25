import {Component} from 'ember-frost-core'
import layout from '../templates/components/frost-info-bar'

export default Component.extend({
  // == Properties ============================================================

  classNames: ['frost-info-bar'],
  layout,
  hook: 'info-bar'
})
