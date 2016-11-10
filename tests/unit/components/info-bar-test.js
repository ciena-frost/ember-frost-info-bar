const expect = chai.expect

import {describeComponent} from 'ember-mocha'
import {beforeEach, it} from 'mocha'
import PropTypeMixin from 'ember-prop-types'

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

    it('sets hook to a default', function () {
      expect(
        component.get('hook'),
        'hook is set to a default'
      ).to.eql('info-bar')
    })

    it('has the expected Mixins', function () {
      expect(
        PropTypeMixin.detect(component),
        'PropTypeMixin Mixin is present'
      ).to.be.true
    })
  }
)
