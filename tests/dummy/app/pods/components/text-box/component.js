import Ember from 'ember'
import layout from './template'
import computed, {readOnly} from 'ember-computed-decorators'
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
