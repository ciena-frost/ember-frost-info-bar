# 12.0.0 (2018-02-27)
* **Changed** spacing between info bar title and sub-title

NOTE: This was intended to be a patch to be released as 11.0.1 but a mistake was made in the usage of `pr-bumper` causing it to be released as a major instead.

# 11.0.0 (2018-01-17)
* **Updated** `ember-frost-test` to `^4.0.0`
* **Added** `chai-jquery` @ `^2.0.0`
* **Updated** `ember-cli-chai` to `0.4.3`
* **Updated** `ember-cli-mocha` to `0.14.4`
* **Updated** `ember-sinon` to `^0.7.0`
* **Updated** `ember-test-utils` to `^8.1.0`
* **Added** `sinon-chai` @ `^2.14.0`
* **Updated** `ember-cli-code-coverage` to `0.3.12`
* **Updated** `ember-cli-frost-blueprints` to `^5.0.1`
* **Updated** `ember-cli-htmlbars-inline-precompile` to `0.3.12`
* **Added** ignore the linting of the `CHANGELOG.md`
* **Added** ignoring of `package-lock` until we are ready to move to node 8
* **Removed** useLintTree ember-cli-mocha configuration from `ember-cli-build.js`
* **Removed** `.remarkrc` file since it is now provided by `ember-test-utils`
* **Removed** the blueprint file since packages are now included via dependencies
* **Added** `ember-browserify` @ `^1.2.0`
* **Updated** pin `ember-code-snippet` to `1.7.0`
* **Updated** `ember-cli-sass` to `7.1.1`
* **Updated** `ember-computed-decorators` to `0.3.0` and left a devDependency since only used by dummy app
* **Updated** `ember-frost-core` to `^5.1.1` and moved to a dependency instead of a devDependency
* **Updated** `ember-hook` to `1.4.2` and moved to a dependency instead of a devDependency
* **Updated** `ember-prop-types` to `^6.0.1` and left a devDependency since only used by dummy app
* **Removed** unused `ember-spread` package
* **Removed** unused `ember-concurrency` package
* **Removed** unused `ember-elsewhere` package
* **Updated** `ember-frost-notifier` to `^7.0.0`
* **Updated** move code coverage config file to tests/dummy/config/ and add json-summary reporter"

# 10.0.1 (2017-12-13)
* Change semver range of `ember-resolver` to align with other repos

# 10.0.0 (2017-11-03)

## WARNING: THIS REVERTS EMBER CLI 2.16.2 BACK TO 2.12.3

We apologize for this change. Unfortunately, due to the internal needs of our organization this became a required action.

The 2.16.2 changes are now located in the `ember-cli-2.16.2` branch and will hopefully be contained in a versioned release again in the future.

# 9.0.0 (2017-10-19)
* **Removed** bower.json and .bowerrc since no longer needed
* **Removed** ember-cli-visual-regression
* **Removed** unused ember-cli-notifications package
* **Updated** to use mock-component helper from `ember-test-utils`
* **Updated** testing dependencies
* **Updated** version of ember-test-utils and fix linting
* **Updated** to Ember CLI 2.16.2 and babel 6
* **Updated** ember-computed-decorators to new version which is now ember-decorators
* **Updated** dependencies to latest versions
* **Updated** to imports to use new Ember Javascript Modules API syntax: https://github.com/ember-cli/ember-rfc176-data
* **Added** eslint plugin to enforce Ember Javascript Modules API syntax usage
* **Removed** code coverage verification until issue is resolved: https://github.com/kategengler/ember-cli-code-coverage/issues/133
* **Updated** pr-bumper to version 3 which requires updating to use node 8.1.2
* **Added** package-lock.json

# 8.3.9 (2017-08-10)
* Upgrade ember-cli 2.12.3 inter-dependencies

# 8.3.8 (2017-07-05)
* Upgrade `ember-cli` to `2.12.3`


# 8.3.7 (2017-05-23)
* Fix https://github.com/ciena-frost/ember-frost-info-bar/issues/69
  * Specify min-height for info-bar to prevent firefox from ignoring height

# 8.3.6 (2017-05-10)
* **Updated** the secure auth tokens in `.travis.yml`


# 8.3.5 (2017-04-21)
* **Added** blueprint check

# 8.3.4 (2017-03-23)
* **Fixed** `ember` and `ember-cli` dependencies

# 8.3.3
* **Updated** the travis scripts used for bumping and publishing

# 8.3.2

* **Updated** Travis to test Chrome as well as Firefox.
* **Updated** testem to use custom reporter from `ember-test-utils`.
* **Updated** Travis to only publish when git tags are added in preparation for non-version bump pull requests.
* **Updated** linting to use linting tools from `ember-test-utils`.


# 8.3.1
* **Updated** integration/unit tests to remove the deprecated use of `describeComponent()`



# 8.3.0

* **Updated** class names to use prefix `frost-info-bar-` so they don't have collisions with other
components not using scoped class names.
* **Updated** component to extend component from `ember-frost-core` so we have standard hook and
spread support for a Frost component.


# 8.2.1

* **Upgraded** to test against Ember 2.11.


# 8.2.0

* **Added** additional builds to CI to make sure addon works with latest versions of Ember.
* **Removed** files from npm package that aren't necessary (all of the various config files).
* **Updated** dependencies to latest versions.


# 8.1.4
* **Fixed** missing icon on demo application

# 8.1.3
* **Updated** `ember-frost-notifier` to `^4.0.0`



# 8.1.2
* Fixed missing icon in dummy app



# 8.1.1
* Fix naming of icon pack


# 8.1.0
* Add icons related to the addon


# 8.0.0
Updated Dependencies to use version ^1.0.0 of ember-frost-core. None of the existing functionality
was broken so further modification was not required.


# 7.0.2
- **Added** test to verify mixin is present


# 7.0.1
- **Added/Updated** unit/integration tests to increase test coverage
- **Removed** unused `index` from template's control `each` section
- **Added** `{{if title}}` clause around `div` for `primary-title` class and `-title` hook

<!-- Reviewable:start -->
---
This change is [<img src="https://reviewable.io/review_button.svg" height="34" align="absmiddle" alt="Reviewable"/>](https://reviewable.io/reviews/ciena-frost/ember-frost-info-bar/45)
<!-- Reviewable:end -->


# 7.0.0
**update** node version.
**update** blueprint
**remove** mirage.


# 6.0.0
No CHANGELOG section found in Pull Request description.
Use a `# CHANGELOG` section in your Pull Request description to auto-populate the `CHANGELOG.md`

# 5.0.1

* Removed the unused dependency on liquid-fire

# 5.0.0

* **Updated** interface, now `controls` will take an array of components.
* **Updated** interface, now `title` and `summary` will take either component or string.
* **Added** `array` helper and `type-of` helper




# 4.0.1
- Call super init in index.js with applying context.

# 4.0.0
- Switched from block-slots to `(component)` helper.

# 3.1.1

* **Updated** `ember-hook` dependency in blueprint to latest version
* **Removed** unneeded configuration object for `ember-hook` since it will now work correctly
in the development environment.

<!-- Reviewable:start -->
---
This change is [<img src="https://reviewable.io/review_button.svg" height="34" align="absmiddle" alt="Reviewable"/>](https://reviewable.io/reviews/ciena-frost/ember-frost-info-bar/36)
<!-- Reviewable:end -->


# 3.1.0

* **Updated** Ember, Ember-CLI and Ember data to ~2.6.0
* **Updated** npm and bower dependencies
* **Added** `ember-prop-types` to the frost-info-bar component
* **Added** a default hook name for the frost-info-bar component
* **Added** hook names for different block-slot sections in the frost-info-bar component
* **Added** tests to validate the new hook names in the frost-info-bar component
* **Updated** README to explain usage of the hooks for the frost-info-bar component


# 3.0.2

- Updated ember-block-slots, fixed up icon css and fixed broken demo app

# 3.0.1
No CHANGELOG section found in Pull Request description.
Use a `# CHANGELOG` section in your Pull Request description to auto-populate the `CHANGELOG.md`

# 3.0.0
* **Fixed** upgrading repo to use block-slots >=1.0.0

# 2.1.1
* **Fixed** Usage of single quotes was updated to double quotes when setting a class in a div

<!-- Reviewable:start -->
---
This change is [<img src="https://reviewable.io/review_button.svg" height="35" align="absmiddle" alt="Reviewable"/>](https://reviewable.io/reviews/ciena-frost/ember-frost-info-bar/20)
<!-- Reviewable:end -->


# 2.1.0
No CHANGELOG section found in Pull Request description.
Use a `# CHANGELOG` section in your Pull Request description to auto-populate the `CHANGELOG.md`
