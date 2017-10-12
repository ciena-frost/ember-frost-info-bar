import layout from './template'
import Ember from 'ember'
import {computed, readOnly} from 'ember-decorators/object'

const {
  Component,
  String: {
    htmlSafe
  }
} = Ember
export default Component.extend({
  layout,
  @readOnly
  @computed('text')
  raw (text) {
    return htmlSafe(text)
  }
})
