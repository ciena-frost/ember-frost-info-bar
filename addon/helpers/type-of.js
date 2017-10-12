import {helper} from '@ember/component/helper'
import Ember from 'ember'
const {
  Logger: {
    error
  }
} = Ember

export function typeOf (params/*, hash */) {
  if (params.length !== 2) { error(`type-of helper expects 2 arguments, received ${params.length}`) }
  const tester = params[0]
  const type = params[1]
  return typeof tester === type // eslint-disable-line valid-typeof
}

export default helper(typeOf)
