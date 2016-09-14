/* jshint expr:true */
import { expect } from 'chai'
import {
  describe,
  it
} from 'mocha'
import {
  typeOf
} from 'ember-frost-info-bar/helpers/type-of'

describe('TypeOfHelper', function () {
  // Replace this with your real tests.
  it('works', function () {
    const tester = {}
    const type = 'object'
    const result = typeOf([tester, type])
    expect(result).to.be.ok
  })
})
