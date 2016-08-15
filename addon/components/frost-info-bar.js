import Ember from 'ember'
const {Component} = Ember
import PropTypeMixin, {PropTypes} from 'ember-prop-types'
import layout from '../templates/components/frost-info-bar'
import BlockSlotMixin from 'ember-block-slots'

export default Component.extend(BlockSlotMixin, PropTypeMixin, {
  classNames: ['frost-info-bar'],
  layout: layout,

  propTypes: {
    hook: PropTypes.string
  },

  getDefaultProps () {
    return {
      hook: 'info-bar'
    }
  }
})
