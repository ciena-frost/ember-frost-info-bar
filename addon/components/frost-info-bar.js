import Ember from 'ember'
const {
  Component
} = Ember
import layout from '../templates/components/frost-info-bar'
import BlockSlotMixin from 'ember-block-slots'

export default Component.extend(BlockSlotMixin, {
  classNames: ['frost-info-bar'],
  layout: layout
})
