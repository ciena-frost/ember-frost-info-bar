import Ember from 'ember'

const {
  Controller,
  get,
  inject: {
    service
  }
} = Ember
// BEGIN-SNIPPET controller
export default Controller.extend({
  notifier: service('notifier'),

  actions: {
    triggerAction () {
      get(this, 'notifier').addNotification({
        message: 'You clicked a button!',
        type: 'success',
        autoClear: true,
        clearDuration: '1500'
      })
    }
  }
})
// END-SNIPPET
