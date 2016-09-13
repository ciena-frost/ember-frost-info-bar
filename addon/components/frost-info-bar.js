import Ember from 'ember'
import PropTypeMixin, {PropTypes} from 'ember-prop-types'
import layout from '../templates/components/frost-info-bar'

const {
  Component
} = Ember

export default Component.extend(PropTypeMixin, {
  classNames: ['frost-info-bar'],
  layout,

  propTypes: {
    hook: PropTypes.string
  },
  getDefaultProps () {
    return {
      hook: 'info-bar'
    }
  }
})
