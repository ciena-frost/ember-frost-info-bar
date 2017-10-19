import {helper} from '@ember/component/helper'
export function not (params) {
  const value = params[0]
  return value === undefined
    ? false
    : !value
}
export default helper(not)
