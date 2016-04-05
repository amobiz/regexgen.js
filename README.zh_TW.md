# RegexGen.js - JavaScript Regular Expression 產生器

RegexGen.js 是開發給 JavaScript 使用的正則表達式產生器，可以使用淺顯易懂的語法來表現複雜的正則表達式。RegexGen.js 的開發是受到 [JSVerbalExpressions](https://github.com/VerbalExpressions/JSVerbalExpressions) 的啟發。

[![MIT](http://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/amobiz/regexgen.js/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/regexgen.js.svg)](http://badge.fury.io/js/regexgen.js) [![David Dependency Badge](https://david-dm.org/amobiz/regexgen.js.svg)](https://david-dm.org/amobiz/regexgen.js)

[![NPM](https://nodei.co/npm/regexgen.js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/regexgen.js.png?downloads=true&downloadRank=true&stars=true) [![NPM](https://nodei.co/npm-dl/regexgen.js.png?months=6&height=3)](https://nodei.co/npm/regexgen.js/)


RegexGen.js 基本上是為那些已經了解正則表達式引擎運作原理，但是不常使用正則表達式的人而開發的。可以這麼說，如果你切確知道存在某個表達式可以達成你的任務，但是卻經常需要查表才能寫出正確的表達式，那麼 RegexGen.js 也許就可以幫到你。即使是正則表達式的初學者，也能夠從 RegexGen.js 相對容易理解的表現方式，而快速地上手並使用簡單的正則表達式。

簡單地說，RegexGen.js 幫助人們：

1. 以容易分解以及容易理解的方式表現正則表達式。
2. 不必記憶正則表達式的『元字元 (meta-characters)』、『簡寫符號 (shortcuts)』，哪些字元在哪些情況下必須『跳脫 (escape)』，哪些情況下不需要？以及一些特殊的『極端情況 (corner cases)』，如 [What literal characters should be escaped in a regex?](http://stackoverflow.com/questions/5484084/what-literal-characters-should-be-escaped-in-a-regex/5484178#5484178)。
3. 重複使用正則表達式 (參考後面的『匹配 IP 位址』範例)。

## 解決的問題

RegexGen.js 努力減輕以下兩個問題：

1. 在撰寫正則表達式的時候，難以記憶正確的語法，以及需要『跳脫』的字元等。
2. 在正則表達式撰寫完成後，難以閱讀甚至無法理解其行為、運作原理。

## 目標

RegexGen.js 的設計，謹守著下列目標：

1. 寫出來的程式碼，應該易讀易懂。
2. 產出來的程式碼，應該要像人工寫的一樣緊湊，不要為了產生器本身容易撰寫，而產出機械式程式碼。尤其是不要產出不必要的 `{}` 或 `()`。
3. 不再需要手動對元字元進行轉義。(除了 `\` 元字元本身。或者使用了表達式置換 (regex overwrite) 功能。)
4. 如果產生器力有未逮，無法產生理想的子表達式，必須要能夠在語法中直接指定替代的子表達式。也就是表達式置換功能。

## 開始使用

產生器是以 `regexGen()` 函數的形式提供。

要輸出正則表達式時，需要呼叫 `regexGen()` 函數，並將子表達式以參數的形式傳入。

個別的子表達式之間，像一般參數一樣，以 `,` 逗號隔開。最終輸出的正則表達式，將是這些子表達式組合而成的結果。

子表達式可以是字串、數字、一個標準的 RegExp 物件，或透過 `regexGen()` 函數提供的子方法 (也就是子產生器)，隨意加以組合 (參考後面的『[非正規 BNF 語法](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form)』)。

將字串傳入 `regexGen()` 函數，或 `text()`, `maybe()`, `anyCharOf()` 及 `anyCharBut()` 等子方法時，將自動視需要進行『跳脫』處理，因此你不需要記憶哪些字元需要在何時進行跳脫處裡。

最後，`regexGen()` 函數回傳一個 `RegExp` 物件，你接著可以像平常一樣使用該正則表達式物件。

使用時，大致上像這樣：

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
