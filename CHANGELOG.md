## Changelog

### 2015-12-24: 0.2.1

* NPM: Update npm settings.

### 2015-09-12: 0.2.0

* Breaking Change: Remove UMD headers that support RequireJS and browser globals.
* Breaking Change: The json object returned from `extract()` method without the "0" property.
* Breaking Change: Add `replace()` method to RegExp object.

### 2014-09-20: 0.1.3

* Bug Fix: Fix CommonJS factory invoking bug.
* Bug Fix: Fix a bug in multiple(). In the case of multiple(5) that returns /{,}/, and should be /{5,}/.
* Feature: Character Classes now support nesting.
* Feature: Added RegExp.extract() method, that returns a JSON object using capture names as properties.

### 2014-07-03: 0.1.0

* First release.

