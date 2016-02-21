import {expect} from 'chai'
import {describeComponent, it} from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'

describeComponent(
  'ember-frost-info-bar',
  'Integration: EmberFrostInfoBarComponent',
  {
    integration: true
  },
  function () {
    it('renders', function () {
      // Set any properties with this.set('myProperty', 'value')
      // Handle any actions with this.on('myAction', function (val) { ... })
      // Template block usage:
      // this.render(hbs`
      //   {{#ember-frost-info-bar}}
      //     template content
      //   {{/ember-frost-info-bar}}
      // `)

      this.render(hbs`{{ember-frost-info-bar}}`)
      expect(this.$()).to.have.length(1)
    })
  }
)
