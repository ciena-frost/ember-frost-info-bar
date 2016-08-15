import {expect} from 'chai'
import {$hook, initialize} from 'ember-hook'
import {describeComponent, it} from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import {beforeEach} from 'mocha'

const testTemplate = hbs`
  {{#frost-info-bar hook=hook}}
    {{#block-slot 'icon'}}
      Yielded icon
    {{/block-slot}}
    {{#block-slot 'title'}}
      Yielded title
    {{/block-slot}}
    {{#block-slot 'summary'}}
      Yielded summary
    {{/block-slot}}
    {{#block-slot 'controls'}}
      Yielded controls
    {{/block-slot}}
    {{#block-slot 'actions' as |action|}}
      {{action.button icon='infobar-create' text='Click me!'}}
    {{/block-slot}}
  {{/frost-info-bar}}`

describeComponent(
  'ember-frost-info-bar',
  'Integration: EmberFrostInfoBarComponent',
  {
    integration: true
  },
  function () {
    let props
    beforeEach(function () {
      initialize()
      props = {
        hook: 'my-info-bar'
      }
      this.setProperties(props)
      this.render(testTemplate)
    })

    it('has a default hook name', function () {
      this.render(hbs`
        {{frost-info-bar}}
      `)

      expect($hook('info-bar').hasClass('frost-info-bar')).to.be.true
    })

    it('has a hook for icon', function () {
      expect($hook('my-info-bar-icon').text().trim()).to.eql('Yielded icon')
    })

    it('has a hook for title', function () {
      expect($hook('my-info-bar-title').text().trim()).to.eql('Yielded title')
    })

    it('has a hook for summary', function () {
      expect($hook('my-info-bar-summary').text().trim()).to.eql('Yielded summary')
    })

    it('has a hook for controls', function () {
      expect($hook('my-info-bar-controls').text().trim()).to.eql('Yielded controls')
    })

    it('has a hook for actions', function () {
      expect($hook('my-info-bar-action').text().trim()).to.eql('Click me!')
    })
  }
)
