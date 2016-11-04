const expect = chai.expect

import {describeComponent} from 'ember-mocha'
import {beforeEach, it} from 'mocha'

describeComponent(
  'frost-info-bar',
  'FrostInfoBarComponent',
  {
    unit: true
  },
  function () {
    let component

    beforeEach(function () {
      component = this.subject()
    })

    it('includes className frost-info-bar', function () {
      expect(component.classNames).to.include('frost-info-bar')
    })
  }
)
