import {expect} from 'chai'
import {$hook, initialize} from 'ember-hook'
import {describeComponent} from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import {beforeEach, describe, it} from 'mocha'
import {
  registerMockComponent,
  unregisterMockComponent
} from '../../helpers/mock-component'

describeComponent(
  'ember-frost-info-bar',
  'Integration: EmberFrostInfoBarComponent',
  {
    integration: true
  },
  function () {
    beforeEach(function () {
      initialize()
    })

    it('renders', function (done) {
      this.render(hbs`
        {{frost-info-bar hook='my-info-bar'
          icon=(component 'frost-icon'
            icon='bacon'
            pack='dummy'
          )
          title=(component 'text-box'
            text='&lt;placeholder: title&gt;'
          )
          summary=(component 'text-box'
            isVisible=summary
            text='&lt;placeholder: summary&gt;'
          )
          scope=(component 'text-box'
            text='&lt;placeholder: scope&gt;'
          )
          controls=(array
            (component 'frost-button'
              hook='create'
              isVisible=isControlsVisible
              icon='infobar-create'
              text='Click me!'
            )
          )
        }}
      `)

      const el = $hook('my-info-bar')
      return capture('frost-info-bar', done, {
        targetElement: el[0],
        experimentalSvgs: true
      })
    })

    it('renders the default component', function () {
      this.render(hbs`
        {{frost-info-bar}}
      `)

      expect(
        this.$('.frost-info-bar')
      ).to.have.length(1)
    })

    it('has a default hook name', function () {
      this.render(hbs`
        {{frost-info-bar}}
      `)

      expect(
        this.$($hook('info-bar')).hasClass('frost-info-bar')
      ).to.be.true
    })

    describe('Icon section', function () {
      it('renders the icon section when "icon" property is set', function () {
        registerMockComponent(this, 'mock-icon')

        this.render(hbs`
        {{frost-info-bar
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

      it('sets the icon hook', function () {
        registerMockComponent(this, 'mock-icon')

        this.render(hbs`
        {{frost-info-bar
          icon=(component 'mock-icon')
        }}
      `)

        expect(
          this.$($hook('info-bar-icon')).hasClass('frost-info-bar-icon'),
          'icon hook is set'
        ).to.be.true

        unregisterMockComponent(this)
      })
    })

    describe('Title section', function () {
      it('sets the title hook', function () {
        this.render(hbs`
          {{frost-info-bar
            title='My Test Title'
          }}
        `)

        expect(
          this.$($hook('info-bar-title')).hasClass('primary-title'),
          'title hook is set'
        ).to.be.true
      })

      it('renders the title component if one is passed in', function () {
        registerMockComponent(this, 'mock-title')

        this.render(hbs`
          {{frost-info-bar
            title=(component 'mock-title' class='mock-title')
          }}
        `)

        expect(
          this.$('.mock-title'),
          'title component is rendered'
        ).to.have.length(1)

        unregisterMockComponent(this)
      })

      it('renders the text if it is passed in', function () {
        this.render(hbs`
          {{frost-info-bar
            title='My Test Title'
          }}
        `)

        expect(
          this.$('.primary-title').text().trim(),
          'title text is rendered'
        ).to.eql('My Test Title')
      })

      describe('Summary section', function () {
        it('sets the summary hook', function () {
          registerMockComponent(this, 'mock-summary')
          this.render(hbs`
            {{frost-info-bar
              summary=(component 'mock-summary')
            }}
          `)

          expect(
            this.$($hook('info-bar-summary')).hasClass('sub-title'),
            'summary hook is set'
          ).to.be.true

          unregisterMockComponent(this)
        })

        it('renders the summary component if one is passed in', function () {
          registerMockComponent(this, 'mock-summary')

          this.render(hbs`
            {{frost-info-bar
              summary=(component 'mock-summary' class='mock-summary')
            }}
          `)

          expect(
            this.$('.mock-summary'),
            'summary component is rendered'
          ).to.have.length(1)

          unregisterMockComponent(this)
        })

        it('renders the text if it is passed in', function () {
          this.render(hbs`
            {{frost-info-bar
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
      it('sets the scope hook', function () {
        registerMockComponent(this, 'mock-scope')
        this.render(hbs`
          {{frost-info-bar
            scope=(component 'mock-scope')
          }}
        `)

        expect(
          this.$($hook('info-bar-scope')).hasClass('scope'),
          'scope hook is set'
        ).to.be.true

        unregisterMockComponent(this)
      })

      it('renders the scope component', function () {
        registerMockComponent(this, 'mock-scope')

        this.render(hbs`
          {{frost-info-bar
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
      it('sets the controls hook', function () {
        registerMockComponent(this, 'mock-control')

        this.render(hbs`
          {{frost-info-bar
            controls=(array (component 'mock-control'))
          }}
        `)

        expect(
          this.$($hook('info-bar-controls')).hasClass('controls'),
          'controls hook is set'
        ).to.be.true

        unregisterMockComponent(this)
      })

      it('renders the control component', function () {
        registerMockComponent(this, 'mock-control')

        this.render(hbs`
          {{frost-info-bar
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
  }
)
