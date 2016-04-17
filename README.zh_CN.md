# RegexGen.js - JavaScript Regular Expression 产生器

RegexGen.js 是开发给 JavaScript 使用的正则表达式产生器，可以使用浅显易懂的语法来表现复杂的正则表达式。 RegexGen.js 的开发是受到 [JSVerbalExpressions](https://github.com/VerbalExpressions/JSVerbalExpressions) 的启发。

[![MIT](http://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/amobiz/regexgen.js/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/regexgen.js.svg)](http://badge.fury.io/js/regexgen.js) [![David Dependency Badge](https://david-dm.org/amobiz/regexgen.js.svg)](https://david-dm.org/amobiz/regexgen.js)

[![NPM](https://nodei.co/npm/regexgen.js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/regexgen.js.png?downloads=true&downloadRank=true&stars=true) [![NPM](https://nodei.co/npm-dl/regexgen.js.png?months=6&height=3)](https://nodei.co/npm/regexgen.js/)


RegexGen.js 基本上是为那些已经了解正则表达式引擎运作原理，但是不常使用正则表达式的人而开发的。可以这么说，如果你切确知道存在某个表达式可以达成你的任务，但是却经常需要查表才能写出正确的表达式，那么 RegexGen.js 也许就可以帮到你。即使是正则表达式的初学者，也能够从 RegexGen.js 相对容易理解的表现方式，而快速地上手并使用简单的正则表达式。

简单地说，RegexGen.js 帮助人们：

1. 以容易分解以及容易理解的方式表现正则表达式。
2. 不必记忆正则表达式的『元字元 (meta-characters)』、『简写符号 (shortcuts)』，哪些字元在哪些情况下必须『跳脱 (escape)』，哪些情况下不需要？以及一些特殊的『极端情况 (corner cases)』，如 [What literal characters should be escaped in a regex?](http://stackoverflow.com/questions/5484084/what-literal-characters-should-be-escaped-in-a-regex/5484178#5484178)。
3. 重复使用正则表达式 (参考后面的『匹配 IP 位址』范例)。

## 解决的问题

RegexGen.js 努力减轻以下两个问题：

1. 在撰写正则表达式的时候，难以记忆正确的语法，以及需要『跳脱』的字元等。
2. 在正则表达式撰写完成后，难以阅读甚至无法理解其行为、运作原理。

## 目标

RegexGen.js 的设计，谨守着下列目标：

1. 写出来的程式码，应该易读易懂。
2. 产出来的程式码，应该要像人工写的一样紧凑，不要为了产生器本身容易撰写，而产出机械式程式码。尤其是不要产出不必要的 `{}` 或 `()`。
3. 不再需要手动对元字元进行转义。 (除了 `\` 元字元本身。或者使用了表达式置换 (regex ​​overwrite) 功能。)
4. 如果产生器力有未逮，无法产生理想的子表达式，必须要能够在语法中直接指定替代的子表达式。也就是表达式置换功能。

## 开始使用

产生器是以 `regexGen()` 函数的形式提供。

要输出正则表达式时，需要呼叫 `regexGen()` 函数，并将子表达式以参数的形式传入。

个别的子表达式之间，像一般参数一样，以 `,` 逗号隔开。最终输出的正则表达式，将是这些子表达式组合而成的结果。

子表达式可以是字串、数字、一个标准的RegExp 物件，或透过`regexGen()` 函数提供的子方法(也就是子产生器)，随意加以组合(参考后面的『[非正规BNF 语法] (#non-formal-bnf)』。

将字串传入`regexGen()` 函数，或`text()`, `maybe()`, `anyCharOf()` 及`anyCharBut()` 等子方法时，将自动视需要进行『跳脱』处理，因此你不需要记忆哪些字元需要在何时进行跳脱处里。

最后，`regexGen()` 函数回传一个 `RegExp` 物件，你接着可以像平常一样使用该正则表达式物件。

使用时，大致上像这样：

```
var regexGen = require('regexgen.js');
var regex ​​= regexGen( sub-expression [, sub-expression ...] [, modifier ...] )
```

## <a id="non-formal-bnf"></a>非正规 BNF 语法

基本的使用方始，可以参考这里列出的『非正规 BNF 语法』：

(注意，因为这里列出的并不是严谨的[BNF 语法](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form)，故这里称为『非正规 BNF 语法』。)

```
regex ​​::= regexGen( sub-expression [, sub-expression ...] [, modifier ...] )

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

详细的语法请参考 [wiki](wiki) 以及以下的说明及范例。更多的范例可以直接参考测试程式：[test.js](test.js)。

## 安装

``` bash
npm install regexgen.js
```

## 用法

由于产生器是以 `regexGen()` 函数的形式提供，所有的子方法都是透过它来使用。建议可以先将它指定给比较简短的变数，譬如 `_` 符号：

``` javascript
var _ = require('regexgen.js');
var regex ​​= _(
    _.startOfLine(),
    _.capture( 'http', _.maybe( 's' ) ), '://',
    _.capture( _.anyCharBut( ':/' ).repeat() ),
    _.group( ':', _.capture( _.digital().multiple(2,4) ) ).maybe(), '/',
    _.capture( _.anything() ),
    _.endOfLine()
);
var matches = regex.exec( url );
```

注意：虽然不推荐，但是如果你认为以上的作法仍然不够方便，同时也不介意污染全域物件 (譬如撰写小型工具程式时)，你可以使用 `regexGen.mixin()` 函数，将 `regexGen()` 函数的所有的子方法，全部都汇出到全域物件中，这样就可以省略上面范例中 '_.' 的部份：

``` javascript
var regexGen = require('regexgen.js');
regexGen.mixin( global );

var regex ​​= regexGen(
    startOfLine(),
    capture( 'http', maybe( 's' ) ), '://',
    capture( anyCharBut( ':/' ).repeat() ),
    group( ':', capture( digital().multiple(2,4) ) ).maybe(), '/',
    capture( anything() ),
    endOfLine()
);
var matches = regex.exec( url );
```

## 关于回传的 RegExp 物件

由 `regexGen()` 函数回传的是一个标准的 `RegExp` 物件，你可以像平常一样使用它。

不过为了提供除错功能，以及在处理字串时，方便提取内容，该 `RegExp` 物件另外附加了四个属性：
`warnings` 阵列, `captures` 阵列, `extract()` 方法以及 `replace()` 方法。
更多细节请参考 [wiki](wiki) 的说明。

## 范例

#### 简单的密码验证

检查一个字串，该字串必须至少包含六个字元，最多十个字元，字串必须混和数字、小写、大写英文字母，缺一不可。

这个范例取材自 [Mastering Lookahead and Lookbehind](http://www.rexegg.com/regex-lookarounds.html) 这篇文章。

``` javascript
var _ = require('regexgen.js');
var regex ​​= _(
    // 锚点: 匹配字串的起始位置
    _.startOfLine(),
    // 匹配六到十个英数字字元
    _.word().multiple(6,10).
        // 顺序环视：任意字元，直到发现一个小写英文字母 (忽略优先)
        .contains( _.anything().reluctant(), _.anyCharOf(['a','z']) ).
        // 顺序环视：任意字元，直到发现一个大写英文字母 (忽略优先)
        .contains( _.anything().reluctant(), _.anyCharOf(['A','Z']) ).
        // 顺序环视：任意字元，直到发现一个数字字元 (忽略优先)
        .contains( _.anything().reluctant(), _.digital() ),
    // 锚点: 匹配字串的结束位置
    _.endOfLine()
);
```
输出为：
``` javascript
/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)\w{6,10}$/
```

#### 匹配 IP 位址

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=sshKXlr32-AC&pg=PA187&lpg=PA187&dq=mastering+regular+expression+Matching+an+IP+Address&source=bl&ots=daK_ZPacNh&sig=l9eFfP2WvXWkTw_jYPQHSrxEO4Q&hl=zh-TW&sa=X&ei=z3KxU5blK43KkwXdiIGQDQ&ved=0CDcQ6AEwAg#v=onepage&q=mastering%20regular%20expression%20Matching%20an%20IP%20Address&f=false) 这本书。

``` javascript
var _ = require('regexgen.js');
// 0 ~ 199 的情形
var d1 = _.group( _.anyCharOf( '0', '1' ).maybe(), _.digital(), _.digital().maybe() );
// 200 ~ 249 的情形
var d2 = _.group( '2', _.anyCharOf( ['0', '4'] ), _.digital() );
// 250 ~ 255 的情形
var d3 = _.group( '25', _.anyCharOf( ['0', '5'] ) );
// 综和上面三点，批配 0 ~ 255 的情形
var d255 = _.capture( _.either( d1, d2, d3 ) );
var regex ​​= _(
    _.startOfLine(),
    d255, '.', d255, '.', d255, '.', d255,
    _.endOfLine()
);
```
输出为：
``` javascript
/^([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])$/
```

#### 匹配对称的括号

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=sshKXlr32-AC&pg=PA193&lpg=PA193&dq=mastering+regular+expression+Matching+Balanced+Sets+of+Parentheses&source=bl&ots=daK_ZPaeHl&sig=gBcTaTIWQh-9_HSuINjQYHpFn7E&hl=zh-TW&sa=X&ei=YHOxU5_WCIzvkgX-nYHQAw&ved=0CBsQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Matching%20Balanced%20Sets%20of%20Parentheses&f=false) 这本书。

``` javascript
var _ = require('regexgen.js');
var regex ​​= _(
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
输出为：
``` javascript
/\([^()]*(?:\([^()]*\)[^()]*)*\)/
```

#### 匹配任意巢状深度的对称括号

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=sshKXlr32-AC&pg=PA193&lpg=PA193&dq=mastering+regular+expression+Matching+Balanced+Sets+of+Parentheses&source=bl&ots=daK_ZPaeHl&sig=gBcTaTIWQh-9_HSuINjQYHpFn7E&hl=zh-TW&sa=X&ei=YHOxU5_WCIzvkgX-nYHQAw&ved=0CBsQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Matching%20Balanced%20Sets%20of%20Parentheses&f=false) 这本书。
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
一层巢状深度：
``` javascript
var regex ​​= _(
    '(', nestingParentheses( 1 ), ')'
);
```
输出为：
``` javascript
/\((?:[^()]|\([^()]*\))*\)/
```
三层巢状深度：
``` javascript
var regex ​​= _(
    '(', nestingParentheses( 3 ), ')'
);
```
输出为：
``` javascript
/\((?:[^()]|\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))*\)/
```


#### 匹配 HTML 标签

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA200&lpg=PA200&dq=mastering+regular+expression+Matching+an+HTML+Tag&source=bl&ots=PJkiMpkrNX&sig=BiKB6kD_1ZudZw9g-VY-X-E-ylg&hl=zh-TW&sa=X&ei=y3OxU_uEIoPPkwXL3IHQCg&ved=0CFcQ6AEwBg#v=onepage&q=mastering%20regular%20expression%20Matching%20an%20HTML%20Tag&f=false) 这本书。
``` javascript
var _ = require('regexgen.js');
var regex ​​= _(
    '<',
    _.either(
        _.group( '"', _.anyCharBut('"').any(), '"' ),
        _.group( "'", _.anyCharBut("'").any(), "'" ),
        _.group( _.anyCharBut( '"', "'", '>' ) )
    ).any(),
    '>'
);
```
输出为：
``` javascript
/<(?:"[^"]*"|'[^']*'|[^"'>])*>/
```

#### 匹配 HTML anchor 连结

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA201&dq=mastering+regular+expression+Matching+an+HTML+Link&hl=zh-TW&sa=X&ei=QnSxU4W-CMLkkAWLjIDgCg&ved=0CBwQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Matching%20an%20HTML%20Link&f=false) 这本书。
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
输出为：
``` javascript
/<a\b([^>]+)>(.*?)<\/a>/gi
/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i
```
在浏览器中要遍历所有的连结，可以这么做：
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

#### 检验 HTTP URL

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA203&dq=mastering+regular+expression+Examining+an+HTTP+URL&hl=zh-TW&sa=X&ei=b3SxU9nUNojOkwXpjIDYCA&ved=0CBwQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Examining%20an%20HTTP%20URL&f=false) 这本书。
``` javascript
var _ = require('regexgen.js');
var regex ​​= _(
    _.startOfLine(),
    'http', _.maybe( 's' ),​​ '://',
    _.capture( _.anyCharBut( '/:' ).many() ),
    _.group( ':', _.capture( _.digital().many() ) ).maybe(),
    _.capture( '/', _.anything() ).maybe(),
    _.endOfLine()
);
```
输出为：
``` javascript
/^https?:\/\/([^/:]+)(?::(\d+))?(\/.*)?$/
```
在浏览器中要印出匹配的 URL，可以这么做：
``` javascript
var capture = location.href.match( regex ​​);
var host = capture[1];
var port = capture[2] || 80;
var path = capture[3] || '/';
console.log( 'host:' + host + ', port:' + port + ', path:' + path );
```

#### 验证 host 名称

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA203&dq=mastering+regular+expression+Validating+a+Hostname&hl=zh-TW&sa=X&ei=hXSxU5nlKceIkQXc7YHgCA&ved=0CBwQ6AEwAA#v=onepage&q=mastering%20regular%20expression%20Validating%20a%20Hostname&f=false) 这本书。
``` javascript
var _ = require('regexgen.js');
var regex ​​= _(
    _.startOfLine(),
    // 以 . 号分隔的部份 . . .
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
    // 紧接着允许的域名分类 . . .
    _.either(
        'com', 'edu', 'gov', 'int', 'mil', 'net', 'org', 'biz', 'info', 'name', 'museum', 'coop', 'aero',
        _.group( _.anyCharOf( ['a', 'z'] ), _.anyCharOf( ['a', 'z'] ) )
    ),
    _.endOfLine()
);
```
输出为：
``` javascript
/^(?:[a-z0-9]\.|[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\.)*(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|coop|aero|[a-z][a-z])$/
```

#### 解析 CSV 档案

这个范例取材自 [Mastering Regular Expressions](http://books.google.com.tw/books?id=GX3w_18-JegC&pg=PA271&dq=Unrolling+the+CSV+regex&hl=zh-TW&sa=X&ei=x_q0U-qhD43jkAWYqoCgBA&ved=0CBwQ6AEwAA#v=onepage&q=Unrolling%20the%20CSV%20regex&f=false) 这本书。
``` javascript
var _ = require('regexgen.js');
var regex ​​= _(
    _.either( _.startOfLine(), ',' ),
    _.either(
        // 要嘛是双引号所包围的内容
        _.group(
            // 起始双引号
            '"',
            _.capture(
                _.anyCharBut( '"' ).any(),
                _.group(
                    '""',
                    _.anyCharBut( '"' ).any()
                ).any()
            ),
            // 结尾双引号
            '"'
        ),
        // 不然就是除了双引号、逗号之外的文字
        _.capture(
            _.anyCharBut( '",' ).any()
        )
    )
);
```
输出为：
``` javascript
/(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/
```

## 测试

``` bash
$ npm test
```

## 修改记录

[CHANGELOG](CHANGELOG.md)

## 作者

  * [Amobiz](https://github.com/amobiz)
