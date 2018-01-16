import {expect} from 'chai'
import {$hook, initialize} from 'ember-hook'
import {integration} from 'ember-test-utils/test-support/setup-component-test'
import hbs from 'htmlbars-inline-precompile'
import {beforeEach, describe, it} from 'mocha'
import {registerMockComponent, unregisterMockComponent} from '../../helpers/mock-component'

const test = integration('ember-frost-info-bar')
describe(test.label, function () {
  test.setup()

  beforeEach(function () {
    initialize()
  })

  it('should have a default hook name', function () {
    this.render(hbs`
      {{frost-info-bar hook='info-bar'}}
    `)

    expect(
      this.$($hook('info-bar')).hasClass('frost-info-bar'),
      'default hook exists'
    ).to.equal(true)
  })

  describe('Icon section', function () {
    it('should render the icon section when "icon" property is set', function () {
      registerMockComponent(this, 'mock-icon')

      this.render(hbs`
      {{frost-info-bar
        hook='info-bar'
        icon=(component 'mock-icon' class='mock-icon')
      }}
    `)

      expect(
        this.$('.frost-info-bar-icon'),
        'icon section is rendered'
      ).to.have.length(1)

      expect(
        this.$('.mock-icon'),
        'icon component is rendered'
      ).to.have.length(1)

      unregisterMockComponent(this)
    })

    it('should set the icon hook', function () {
      registerMockComponent(this, 'mock-icon')

      this.render(hbs`
      {{frost-info-bar
        hook='info-bar'
        icon=(component 'mock-icon')
      }}
    `)

      expect(
        this.$($hook('info-bar-icon')).hasClass('frost-info-bar-icon'),
        'icon hook is set'
      ).to.equal(true)

      unregisterMockComponent(this)
    })
  })

  describe('Title section', function () {
    it('should set the title hook', function () {
      this.render(hbs`
        {{frost-info-bar
          hook='info-bar'
          title='My Test Title'
        }}
      `)

      expect(
        this.$($hook('info-bar-title')).hasClass('primary-title'),
        'title hook is set'
      ).to.equal(true)
    })

    it('should render the title component if one is passed in', function () {
      registerMockComponent(this, 'mock-title')

      this.render(hbs`
        {{frost-info-bar
          hook='info-bar'
          title=(component 'mock-title' class='mock-title')
        }}
      `)

      expect(
        this.$('.mock-title'),
        'title component is rendered'
      ).to.have.length(1)

      unregisterMockComponent(this)
    })

    it('should render the text if it is passed in', function () {
      this.render(hbs`
        {{frost-info-bar
          hook='info-bar'
          title='My Test Title'
        }}
      `)

      expect(
        this.$('.primary-title').text().trim(),
        'title text is rendered'
      ).to.eql('My Test Title')
    })

    describe('Summary section', function () {
      it('should set the summary hook', function () {
        registerMockComponent(this, 'mock-summary')
        this.render(hbs`
          {{frost-info-bar
            hook='info-bar'
            summary=(component 'mock-summary')
          }}
        `)

        expect(
          this.$($hook('info-bar-summary')).hasClass('sub-title'),
          'summary hook is set'
        ).to.equal(true)

        unregisterMockComponent(this)
      })

      it('should render the summary component if one is passed in', function () {
        registerMockComponent(this, 'mock-summary')

        this.render(hbs`
          {{frost-info-bar
            hook='info-bar'
            summary=(component 'mock-summary' class='mock-summary')
          }}
        `)

        expect(
          this.$('.mock-summary'),
          'summary component is rendered'
        ).to.have.length(1)

        unregisterMockComponent(this)
      })

      it('should render the text if it is passed in', function () {
        this.render(hbs`
          {{frost-info-bar
            hook='info-bar'
            summary='My Test Summary'
          }}
        `)

        expect(
          this.$('.sub-title').text().trim(),
          'summary text is rendered'
        ).to.eql('My Test Summary')
      })
    })
  })

  describe('Scope section', function () {
    it('should set the scope hook', function () {
      registerMockComponent(this, 'mock-scope')
      this.render(hbs`
        {{frost-info-bar
          hook='info-bar'
          scope=(component 'mock-scope')
        }}
      `)

      expect(
        this.$($hook('info-bar-scope')).hasClass('frost-info-bar-scope'),
        'scope hook is set'
      ).to.equal(true)

      unregisterMockComponent(this)
    })

    it('should render the scope component', function () {
      registerMockComponent(this, 'mock-scope')

      this.render(hbs`
        {{frost-info-bar
          hook='info-bar'
          scope=(component 'mock-scope' class='mock-scope')
        }}
      `)

      expect(
        this.$('.mock-scope'),
        'scope component is rendered'
      ).to.have.length(1)

      unregisterMockComponent(this)
    })
  })

  describe('Actions section', function () {
    it('should set the controls hook', function () {
      registerMockComponent(this, 'mock-control')

      this.render(hbs`
        {{frost-info-bar
          hook='info-bar'
          controls=(array (component 'mock-control'))
        }}
      `)

      expect(
        this.$($hook('info-bar-controls')).hasClass('frost-info-bar-controls'),
        'controls hook is set'
      ).to.equal(true)

      unregisterMockComponent(this)
    })

    it('should render the control component', function () {
      registerMockComponent(this, 'mock-control')

      this.render(hbs`
        {{frost-info-bar
          hook='info-bar'
          controls=(array (component 'mock-control' class='mock-control'))
        }}
      `)

      expect(
        this.$('.mock-control'),
        'control component is rendered'
      ).to.have.length(1)

      unregisterMockComponent(this)
    })
  })
})
