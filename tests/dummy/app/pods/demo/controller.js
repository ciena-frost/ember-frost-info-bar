import Ember from 'ember'

export default Ember.Controller.extend({
  notifier: Ember.inject.service('notifier'),

  summary: true,

  actions: {
    triggerAction () {
      this.get('notifier').addNotification({
        message: 'You clicked a button!',
        type: 'success',
        autoClear: true,
        clearDuration: '1500'
      })
    },

    toggleSummary () {
      this.toggleProperty('summary')
    }
  }
})
