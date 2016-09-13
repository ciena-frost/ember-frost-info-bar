import {expect} from 'chai'
import {$hook, initialize} from 'ember-hook'
import {describeComponent, it} from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import {beforeEach} from 'mocha'
import sinon from 'sinon'
import Ember from 'ember'

const {
  run: {
    next
  }
} = Ember

const testTemplate = hbs`
  {{frost-info-bar hook=hook
    icon-module=(component 'frost-icon'
      icon='bacon'
      pack='dummy'
    )
    title-module=(component 'text-box'
      text='&lt;placeholder: title&gt;'
    )
    summary-module=(component 'text-box'
      isVisible=summary
      text='&lt;placeholder: summary&gt;'
    )
    controls-module=(component 'text-box'
      text='&lt;placeholder: controls&gt;'
    )
    actions-module=(component 'frost-button'
      design='info-bar'
      icon='infobar-create'
      text='Click me!'
      onClick=(action 'triggerAction')
    )
  }}`

describeComponent(
  'ember-frost-info-bar',
  'Integration: EmberFrostInfoBarComponent',
  {
    integration: true
  },
  function () {
    let props
    let spy
    beforeEach(function () {
      initialize()
      spy = sinon.spy()
      props = {
        hook: 'my-info-bar',
        actions: {
          triggerAction: spy
        }
      }
      this.setProperties(props)
      this.render(testTemplate)
    })
    const text = (el) => el.text().trim()
    it('has a default hook name', function () {
      const el = $hook('my-info-bar')
      expect(el.hasClass('frost-info-bar')).to.be.true
    })

    it('has a hook for icon', function () {
      const el = $hook('my-info-bar-icon')
      expect(el.hasClass('frost-info-bar-icon')).to.be.true
    })

    it('has a hook for title', function () {
      const el = $hook('my-info-bar-title')
      expect(text(el)).to.eql('<placeholder: title>')
    })

    it('has a hook for summary', function () {
      const el = $hook('my-info-bar-summary')
      expect(text(el)).to.eql('<placeholder: summary>')
    })

    it('has a hook for controls', function () {
      const el = $hook('my-info-bar-controls')
      expect(text(el)).to.eql('<placeholder: controls>')
    })

    it('has a hook for actions', function () {
      const el = $hook('my-info-bar-actions')
      expect(text(el)).to.eql('Click me!')
    })
    it('triggers action correctly', function (done) {
      const el = $hook('my-info-bar-actions')
      el.find('button').click()
      next(() => {
        expect(spy.called).to.be.true
        done()
      })
    })
  }
)
