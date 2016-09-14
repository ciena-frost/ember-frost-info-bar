/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import {
  typeOf
} from 'ember-frost-info-bar/helpers/type-of';

describe('TypeOfHelper', function() {
  // Replace this with your real tests.
  it('works', function() {
    let result = typeOf(42);
    expect(result).to.be.ok;
  });
});
