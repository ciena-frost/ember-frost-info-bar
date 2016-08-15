[ci-img]: https://travis-ci.org/ciena-frost/ember-frost-info-bar.svg "Build Status"
[ci-url]: https://travis-ci.org/ciena-frost/ember-frost-info-bar

[cov-img]: https://coveralls.io/repos/github/ciena-frost/ember-frost-info-bar/badge.svg?branch=master "Code Coverage"
[cov-url]: https://coveralls.io/github/ciena-frost/ember-frost-info-bar

[npm-img]: https://img.shields.io/npm/v/ember-frost-info-bar.svg "NPM Version"
[npm-url]: https://www.npmjs.com/package/ember-frost-info-bar

# ember-frost-info-bar <br /> [![Travis][ci-img]][ci-url] [![Coveralls][cov-img]][cov-url] [![NPM][npm-img]][npm-url]

## Installation
```
ember install ember-frost-info-bar
```

## Slots API

Using [ember-block-slots](https://github.com/ciena-blueplanet/ember-block-slots), this component will provide an icon, title and subtitle area, controls area for components like Search and actions slot.

## Examples
### Block Format
```handlebars
{{#frost-info-bar}}
  {{#block-slot 'icon'}}
    Icon section
  {{/block-slot}}
  {{#block-slot 'title'}}
    Title section
  {{/block-slot}}
  {{#if summary}}
    {{#block-slot 'summary'}}
      Summary section
    {{/block-slot}}
  {{/if}}
  {{#block-slot 'controls'}}
      Context controls section
  {{/block-slot}}
  {{#block-slot 'actions' as |action|}}
    {{action.button icon='frost/infobar-create' text='Click me!' onClick=(action 'triggerAction')}}
  {{/block-slot}}
{{/frost-info-bar}}
```

## Testing with ember-hook
The info-bar component is accessible using ember-hook with the top level hook name or you can access the internal components as well -
* Default top level hook - `$hook('info-bar')`
* Icon slot hook - `$hook('<hook-name>-icon')`
* Title slot hook - `$hook('<hook-name>-title')`
* Summary slot hook - `$hook('<hook-name>-summary')'`
* Controls slot hook - `$hook('<hook-name>-controls')'`
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
