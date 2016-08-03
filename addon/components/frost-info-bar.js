import Ember from 'ember'
import layout from '../templates/components/frost-info-bar'
import BlockSlotMixin from 'ember-block-slots'

export default Ember.Component.extend( BlockSlotMixin, {
  classNames: ['frost-info-bar'],
  layout: layout
})
