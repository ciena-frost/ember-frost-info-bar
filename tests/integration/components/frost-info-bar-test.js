import {expect} from 'chai'
import {
  describeComponent,
  it
} from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import beforeEach from 'mocha'
import {
  $hook,
  initialize
} from 'ember-hook'

describeComponent(
  'ember-frost-info-bar',
  'Integration: EmberFrostInfoBarComponent',
  {
    integration: true
  },
  function () {
    beforeEach (function () {
      initialize()
    })

    it('renders', function () {
      // Set any properties with this.set('myProperty', 'value')
      // Handle any actions with this.on('myAction', function (val) { ... })
      // Template block usage:
      // this.render(hbs`
      //   {{#ember-frost-info-bar}}
      //     template content
      //   {{/ember-frost-info-bar}}
      // `)
      this.render(hbs`{{#frost-info-bar hook='my-info-bar'}}
        {{#block-slot 'icon'}}
          {{frost-icon
            icon='bacon'
            pack='dummy'
          }}
        {{/block-slot}}
        {{#block-slot 'title'}}Main title{{/block-slot}}
        {{#block-slot 'summary'}}summary{{/block-slot}}
        {{#block-slot 'controls'}}
            &lt;placeholder: controls&gt;
        {{/block-slot}}
        {{#block-slot 'actions' as |action|}}
          {{action.button icon='infobar-create' text='Click me!' onClick=(action 'triggerAction')}}
        {{/block-slot}}
      {{/frost-info-bar}}`)
      expect($hook('my-info-bar')).to.have.length(1)
    })

    it('hook for title works', function () {
      expect($hook('my-info-bar-title').text()).to.eql('Main title')
    })

    it('hook for summary works', function () {
      expect($hook('my-info-bar-title').text()).to.eql('summary')
    })

    it('hook for controls works', function () {
      expect($hook('my-info-bar-controls')).to.have.length(1)
    })

    it('hook for default action button works', function () {
      expect($hook('my-info-bar-action').text()).to.eql('Click me!')
    })
  }
)
