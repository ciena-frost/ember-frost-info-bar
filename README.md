[ci-img]: https://img.shields.io/travis/ciena-frost/ember-frost-info-bar.svg "Travis CI Build Status"
[ci-url]: https://travis-ci.org/ciena-frost/ember-frost-info-bar

[cov-img]: https://img.shields.io/coveralls/ciena-frost/ember-frost-info-bar.svg "Coveralls Code Coverage"
[cov-url]: https://coveralls.io/github/ciena-frost/ember-frost-info-bar

[npm-img]: https://img.shields.io/npm/v/ember-frost-info-bar.svg "NPM Version"
[npm-url]: https://www.npmjs.com/package/ember-frost-info-bar

[ember-observer-badge]: http://emberobserver.com/badges/ember-frost-info-bar.svg "Ember Observer score"
[ember-observer-badge-url]: http://emberobserver.com/addons/ember-frost-info-bar

[ember-img]: https://img.shields.io/badge/ember-2.3+-orange.svg "Ember 2.3+"

[bithound-img]: https://www.bithound.io/github/ciena-frost/ember-frost-info-bar/badges/score.svg "bitHound"
[bithound-url]: https://www.bithound.io/github/ciena-frost/ember-frost-info-bar


# ember-frost-info-bar
###### Dependencies

![Ember][ember-img]
[![NPM][npm-img]][npm-url]

###### Health

[![Travis][ci-img]][ci-url]
[![Coveralls][cov-img]][cov-url]

###### Security

[![bitHound][bithound-img]][bithound-url]

###### Ember Observer score
[![EmberObserver][ember-observer-badge]][ember-observer-badge-url]

## Installation
```
ember install ember-frost-info-bar
```

## Examples
### Template
```handlebars
{{frost-info-bar
  icon=(component 'frost-icon'
    isVisible=isIconVisible
    icon='bacon'
    pack='dummy'
  )
  title=(component 'text-box'
    isVisible=isTitleVisible
    text='&lt;placeholder: title&gt;'
  )
  summary=(component 'text-box'
    isVisible=isSummaryVisible
    text='&lt;placeholder: summary&gt;'
  )
  scope=(component 'text-box'
    isVisible=isScopeVisible
    text='&lt;placeholder: controls&gt;'
  )
  controls=(array
    (component 'frost-button'
      isVisible=isControlsVisible
      icon='infobar-create'
      text='Click me!'
      onClick=(action 'triggerAction')
    )
  )
}}
```

## Testing with ember-hook
The info-bar component is accessible using ember-hook with the top level hook name or you can access the internal components as well -
* Default top level hook - `$hook('info-bar')`
* Icon slot hook - `$hook('<hook-name>-icon')`
* Title slot hook - `$hook('<hook-name>-title')`
* Summary slot hook - `$hook('<hook-name>-summary')'`
* Controls slot hook - `$hook('<hook-name>-controls')'`
* Controls slot item hook - `$hook('<hook-name>-controls-<index>')'`
* Actions slot - `$hook('<hook-name>-action')'`

## Development
### Setup
```
git clone git@github.com:ciena-frost/ember-frost-info-bar.git
cd ember-frost-info-bar
npm install && bower install
```

### Development Server
A dummy application for development is available under `ember-frost-info-bar/tests/dummy`.
To run the server run `ember server` (or `npm start`) from the root of the repository and
visit the app at http://localhost:4200.

### Testing
Run `npm test` from the root of the project to run linting checks as well as execute the test suite
and output code coverage.
