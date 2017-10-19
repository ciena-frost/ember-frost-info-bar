import Controller from '@ember/controller'
import {get} from '@ember/object'
import {inject as service} from '@ember/service'
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
