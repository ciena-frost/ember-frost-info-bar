const expect = chai.expect

import PropTypeMixin from 'ember-prop-types'
import {beforeEach, describe, it} from 'mocha'

import {unit} from 'dummy/tests/helpers/ember-test-utils/setup-component-test'

const test = unit('frost-info-bar')
describe(test.label, function () {
  test.setup()

  let component

  beforeEach(function () {
    component = this.subject({
      hook: 'info-bar'
    })
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
    ).to.equal(true)
  })
})
