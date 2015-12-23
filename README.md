# RegexGen.js - JavaScript Regular Expression Generator

RegexGen.js is a JavaScript regular expression generator that helps to construct complex regular expressions, inspired by [JSVerbalExpressions](https://github.com/VerbalExpressions/JSVerbalExpressions).

RegexGen.js is basically designed for people who know how the regular expression engine works, but not working with it regularly, i.e., they know how to make the regex works but may not remember every meta-characters that constructs the regex.

RegexGen.js helps people don't have to remember: meta-characters, shortcuts, what characters to escape and tricks about corner cases (http://stackoverflow.com/questions/5484084/what-literal-characters-should-be-escaped-in-a-regex/5484178#5484178).

RegexGen.js helps reusing regex patterns. (checkout the [Matching an IP Address] example bellow.)

## The Problems

RegexGen.js tries to ease two problems.

1. While creating a regular expression, it's hard to remember the correct syntax and what characters to escape.
2. After done creating a regular expression, it's hard to read and remember what the regex do.

## The Goals

RegexGen.js is designed to achieve the following goals.

1. The written codes should be easy to read and easy to understand.
2. The generated code should be as compact as possible, e.g., no redundant brackets and parentheses.
3. No more character escaping reguired (except '\\', or if you use regex overwrite.)
4. If the generated code is not good enougth, bad parts can be easily replaced directly in the written codes.

## Getting Started

The generator is exported as a `regexGen()` function.

To generate a regular expression, pass sub-expressions as parameters to the call of `regexGen()` function.

Sub-expressions which are separated by comma are concatenated together to form the whole regular expression.

Sub-expressions can either be a `string`, a `number`, a `RegExp` object, or any combinations of the call to methods (i.e., the `sub-generators`) of the `regexGen()` function object, as the following informal [BNF](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form) syntax.

Strings passed to the the call of `regexGen()`, `text()`, `maybe()`, `anyCharOf()` and `anyCharBut()` methods, are always escaped as necessary, so you don't have to worry about which characters to escape.

The result of calling the `regexGen()` function is a `RegExp` object.

```
var regexGen = require('regexgen.js');
var regex = regexGen( sub-expression [, sub-expression ...] [, modifier ...] )
```

The basic usage can be expressed as the following informal [BNF](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form) syntax.

```
regex ::= regexGen( sub-expression [, sub-expression ...] [, modifier ...] )

sub-expression ::= string | number | RegExp object | term

term ::= sub-generator() [.term-quantifier()] [.term-lookahead()]

sub-generator() ::= regexGen.startOfLine() | regexGen.endOfLine()
    | regexGen.wordBoundary() | regexGen.nonWordBoundary()
    | regexGen.text() | regexGen.maybe() | regexGen.anyChar() | regexGen.anyCharOf() | regexGen.anyCharBut()
    | regexGen.either() | regexGen.group() | regexGen.capture() | regexGen.sameAs()
    | regex() | ... (checkout wiki for all sub-generators.)

term-quantifier() ::= .term-quantifier-generator() [.term-quantifier-modifier()]

term-quantifier-generator() ::= term.any() | term.many() | term.maybe() | term.repeat() | term.multiple()

term-quantifier-modifier() ::= term.greedy() | term.lazy() | term.reluctant()

term-lookahead() ::= term.contains() | term.notContains() | term.followedBy() | term.notFollowedBy()

modifier ::= regexGen.ignoreCase() | regexGen.searchAll() | regexGen.searchMultiLine()
```

Please check out [regexgen.js](index.js) and [wiki](wiki) for API documentations, and check out [test.js](test.js) for more examples.

## Installation
``` bash
npm install regexgen.js
```
## Usage

Since the generator is exported as the `regexGen()` function, everything must be referenced from it.
To simplify codes, assign it to a short variable is preferable.

``` javascript
var _ = require('regexgen.js');
var regex = _(
    _.startOfLine(),
    _.capture( 'http', _.maybe( 's' ) ), '://',
    _.capture( _.anyCharBut( ':/' ).repeat() ),
    _.group( ':', _.capture( _.digital().multiple(2,4) ) ).maybe(), '/',
    _.capture( _.anything() ),
    _.endOfLine()
);
var matches = regex.exec( url );
```

Note: Though not recommended, if you still feel inconvenient, and don't mind the global object being polluted,
use the `regexGen.mixin()` function to export all member functions of the `regexGen()` function object to the global object.

``` javascript
var regexGen = require('regexgen.js');
regexGen.mixin( global );

var regex = regexGen(
    startOfLine(),
    capture( 'http', maybe( 's' ) ), '://',
    capture( anyCharBut( ':/' ).repeat() ),
    group( ':', capture( digital().multiple(2,4) ) ).maybe(), '/',
    capture( anything() ),
    endOfLine()
);
var matches = regex.exec( url );
```

## About The Returned RegExp Object

The `RegExp` object returned from the call of `regexGen()` function, can be used directly as usual.
In addition, there are four properties injected to the `RegExp` object:
`warnings` array, `captures` array, `extract()` method and `replace()` method.
Checkout [wiki](wiki) for details.

## Examples

#### Simple Password Validation

This example is taken from the article: [Mastering Lookahead and Lookbehind](http://www.rexegg.com/regex-lookarounds.html).

``` javascript
var _ = require('regexgen.js');
var regex = _(
    // Anchor: the beginning of the string
    _.startOfLine(),
    // Match: six to ten word characters
    _.word().multiple(6,10).
        // Look ahead: anything, then a lower-case letter
        .contains( _.anything().reluctant(), _.anyCharOf(['a','z']) ).
        // Look ahead: anything, then an upper-case letter
        .contains( _.anything().reluctant(), _.anyCharOf(['A','Z']) ).
        // Look ahead: anything, then one digit
        .contains( _.anything().reluctant(), _.digital() ),
    // Anchor: the end of the string
    _.endOfLine()
);
```
Generates:
``` javascript
/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)\w{6,10}$/
```

#### Matching an IP Address

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=sshKXlr32-AC&pg=PA187&lpg=PA187&dq=mastering+regular+expression+Matching+an+IP+Address&source=bl&ots=daK_ZPacNh&sig=l9eFfP2WvXWkTw_jYPQHSrxEO4Q&hl=zh-TW&sa=X&ei=z3KxU5blK43KkwXdiIGQDQ&ved=0CDcQ6AEwAg#v=onepage&q=mastering%20regular%20expression%20Matching%20an%20IP%20Address&f=false)

``` javascript
var _ = require('regexgen.js');
var d1 = _.group( _.anyCharOf( '0', '1' ).maybe(), _.digital(), _.digital().maybe() );
var d2 = _.group( '2', _.anyCharOf( ['0', '4'] ), _.digital() );
var d3 = _.group( '25', _.anyCharOf( ['0', '5'] ) );
var d255 = _.capture( _.either( d1, d2, d3 ) );
var regex = _(
    _.startOfLine(),
    d255, '.', d255, '.', d255, '.', d255,
    _.endOfLine()
);
```
Generates:
``` javascript
/^([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])$/
```

#### Matching Balanced Sets of Parentheses

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=sshKXlr32-AC&pg=PA193&lpg=PA193&dq=mastering+regular+expression+Matching+Balanced+Sets+of+Parentheses&source=bl&ots=daK_ZPaeHl&sig=gBcTaTIWQh-9_HSuINjQYHpFn7E&hl=zh-TW&sa=X&ei=YHOxU5_WCIzvkgX-nYHQAw&ved=0CBsQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Matching%20Balanced%20Sets%20of%20Parentheses&f=false)

``` javascript
var _ = require('regexgen.js');
var regex = _(
    '(',
    _.anyCharBut( '()' ).any(),
    _.group(
        '(',
        _.anyCharBut( '()' ).any(),
        ')',
        _.anyCharBut( '()' ).any()
    ).any(),
    ')'
);
```
Generates:
``` javascript
/\([^()]*(?:\([^()]*\)[^()]*)*\)/
```

#### Matching Balanced Sets of Parentheses within Any Given Levels of Depth

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=sshKXlr32-AC&pg=PA193&lpg=PA193&dq=mastering+regular+expression+Matching+Balanced+Sets+of+Parentheses&source=bl&ots=daK_ZPaeHl&sig=gBcTaTIWQh-9_HSuINjQYHpFn7E&hl=zh-TW&sa=X&ei=YHOxU5_WCIzvkgX-nYHQAw&ved=0CBsQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Matching%20Balanced%20Sets%20of%20Parentheses&f=false)
``` javascript
var _ = require('regexgen.js');
function nestingParentheses( level ) {
    if ( level < 0 ) {
        return '';
    }
    if ( level === 0 ) {
        return _.anyCharBut( '()' ).any();
    }
    return _.either(
            _.anyCharBut( '()' ),
            _.group(
                '(',
                nestingParentheses( level - 1 ),
                ')'
            )
        ).any();
}
```
Given 1 level of nesting:
``` javascript
var regex = _(
    '(', nestingParentheses( 1 ), ')'
);
```
Generates:
``` javascript
/\((?:[^()]|\([^()]*\))*\)/
```
Given 3 levels of nesting:
``` javascript
var regex = _(
    '(', nestingParentheses( 3 ), ')'
);
```
Generates:
``` javascript
/\((?:[^()]|\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))*\)/
```


#### Matching an HTML Tag

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA200&lpg=PA200&dq=mastering+regular+expression+Matching+an+HTML+Tag&source=bl&ots=PJkiMpkrNX&sig=BiKB6kD_1ZudZw9g-VY-X-E-ylg&hl=zh-TW&sa=X&ei=y3OxU_uEIoPPkwXL3IHQCg&ved=0CFcQ6AEwBg#v=onepage&q=mastering%20regular%20expression%20Matching%20an%20HTML%20Tag&f=false)
``` javascript
var _ = require('regexgen.js');
var regex = _(
    '<',
    _.either(
        _.group( '"', _.anyCharBut('"').any(), '"' ),
        _.group( "'", _.anyCharBut("'").any(), "'" ),
        _.group( _.anyCharBut( '"', "'", '>' ) )
    ).any(),
    '>'
);
```
Generates:
``` javascript
/<(?:"[^"]*"|'[^']*'|[^"'>])*>/
```

#### Matching an HTML Link

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA201&dq=mastering+regular+expression+Matching+an+HTML+Link&hl=zh-TW&sa=X&ei=QnSxU4W-CMLkkAWLjIDgCg&ved=0CBwQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Matching%20an%20HTML%20Link&f=false)
``` javascript
var _ = require('regexgen.js');
var regexLink = _(
    '<a',
    _.wordBoundary(),
    _.capture(
        _.anyCharBut( '>' ).many()
    ),
    '>',
    _.capture(
        _.label( 'Link' ),
        _.anything().lazy()
    ),
    '</a>',
    _.ignoreCase(),
    _.searchAll()
);
var regexUrl = _(
    _.wordBoundary(),
    'href',
    _.space().any(), '=', _.space().any(),
    _.either(
        _.group( '"', _.capture( _.anyCharBut( '"' ).any() ), '"' ),
        _.group( "'", _.capture( _.anyCharBut( "'" ).any() ), "'" ),
        _.capture( _.anyCharBut( "'", '"', '>', _.space() ).many() )
    ),
    _.ignoreCase()
);
```
Generates:
``` javascript
/<a\b([^>]+)>(.*?)<\/a>/gi
/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i
```
Here's how to iterate all links (in browser):
```
var capture, guts, link, url, html = document.documentElement.outerHTML;
while ( (capture = regexLink.exec( html )) ) {
    guts = capture[ 1 ];
    link = capture[ 2 ];
    if ( (capture = regexUrl.exec( guts )) ) {
        url = capture[ 1 ] || capture[ 2 ] || capture[ 3 ];
    }
    console.log( url + ' with link text: ' + link );
}
```

#### Examining an HTTP URL

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA203&dq=mastering+regular+expression+Examining+an+HTTP+URL&hl=zh-TW&sa=X&ei=b3SxU9nUNojOkwXpjIDYCA&ved=0CBwQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Examining%20an%20HTTP%20URL&f=false)
``` javascript
var _ = require('regexgen.js');
var regex = _(
    _.startOfLine(),
    'http', _.maybe( 's' ), '://',
    _.capture( _.anyCharBut( '/:' ).many() ),
    _.group( ':', _.capture( _.digital().many() ) ).maybe(),
    _.capture( '/', _.anything() ).maybe(),
    _.endOfLine()
);
```
Generates:
``` javascript
/^https?:\/\/([^/:]+)(?::(\d+))?(\/.*)?$/
```
Here's a snippet to report about a URL (in browser):
``` javascript
var capture = location.href.match( regex );
var host = capture[1];
var port = capture[2] || 80;
var path = capture[3] || '/';
console.log( 'host:' + host + ', port:' + port + ', path:' + path );
```

#### Validating a Hostname

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA203&dq=mastering+regular+expression+Validating+a+Hostname&hl=zh-TW&sa=X&ei=hXSxU5nlKceIkQXc7YHgCA&ved=0CBwQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Validating%20a%20Hostname&f=false)
``` javascript
var _ = require('regexgen.js');
var regex = _(
    _.startOfLine(),
    // One or more dot-separated parts . . .
    _.either(
        _.group(
            _.anyCharOf( ['a', 'z'], ['0', '9'] ),
            '.'
        ),
        _.group(
            _.anyCharOf( ['a', 'z'], ['0', '9'] ),
            _.anyCharOf( '-', ['a', 'z'], ['0', '9'] ).multiple( 0, 61 ),
            _.anyCharOf( ['a', 'z'], ['0', '9'] ),
            '.'
        )
    ).any(),
    // Followed by the final suffix part . . .
    _.either(
        'com', 'edu', 'gov', 'int', 'mil', 'net', 'org', 'biz', 'info', 'name', 'museum', 'coop', 'aero',
        _.group( _.anyCharOf( ['a', 'z'] ), _.anyCharOf( ['a', 'z'] ) )
    ),
    _.endOfLine()
);
```
Generates:
``` javascript
/^(?:[a-z0-9]\.|[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\.)*(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|coop|aero|[a-z][a-z])$/
```

#### Parsing CSV Files

This example is taken from the book: [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA271&dq=Unrolling+the+CSV+regex&hl=zh-TW&sa=X&ei=x_q0U-qhD43jkAWYqoCgBA&ved=0CBwQ6AEwAA#v=onepage&q=Unrolling%20the%20CSV%20regex&f=false)
``` javascript
var _ = require('regexgen.js');
var regex = _(
    _.either( _.startOfLine(), ',' ),
    _.either(
        // Either a double-quoted field (with "" for each ")
        _.group(
            // double-quoted field's opening quote
            '"',
            _.capture(
                _.anyCharBut( '"' ).any(),
                _.group(
                    '""',
                    _.anyCharBut( '"' ).any()
                ).any()
            ),
            // double-quoted field's closing quote
            '"'
        ),
        // Or some non-quote/non-comma text....
        _.capture(
            _.anyCharBut( '",' ).any()
        )
    )
);
```
Generates:
``` javascript
/(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/
```

## Test
``` bash
$ npm test
```

## Change logs

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

## Author

  * [Amobiz](https://github.com/amobiz)
