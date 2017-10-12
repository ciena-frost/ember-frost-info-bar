import Component from '@ember/component'
import {htmlSafe} from '@ember/string'
import layout from './template'
import {computed, readOnly} from 'ember-decorators/object'

export default Component.extend({
  layout,
  @readOnly
  @computed('text')
  raw (text) {
    return htmlSafe(text)
  }
})
