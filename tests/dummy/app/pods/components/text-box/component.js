import Ember from 'ember'
import layout from './template'
import computed from 'ember-computed-decorators'
const {
  Component,
  String: {
    htmlSafe
  }
} = Ember
export default Component.extend({
  layout,
  @computed('text')
  raw (text) {
    return htmlSafe(text)
  }
})
