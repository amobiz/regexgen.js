/* eslint-env node, browser */
/*!
 * RegexGen.js - JavaScript Regular Expression Generator v0.3.0
 * https://github.com/amobiz/regexgen.js
 *
 * Supports CommonJS(node.js).
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2014-06-11
 * Update: 2015-12-19
 */

/**
 * @fileOverview RegexGen.js is a JavaScript regular expression generator
 *  that helps to construct complex regular expressions.
 * @author Amobiz(amobiz.tw+github@gmail.com)
 * @version 0.2.0
 * @license MIT
 *
 */
'use strict';

////////////////////////////////////////////////////

var regexCodes = {
	captureParentheses: /(\((?!\?[:=!]))/g,

	characterClassChars: /^(?:.|\\[bdDfnrsStvwW]|\\x[A-Fa-f0-9]{2}|\\u[A-Fa-f0-9]{4}|\\c[A-Z])$/,

	characterClassExpr: /^\[\^?(.*)]$/,

	ctrlChars: /^[A-Za-z]$/,

	hexAsciiCodes: /^[0-9A-Fa-f]{2}$/,

	hexUnicodes: /^[0-9A-Fa-f]{4}$/,

	//
	// Regular Expressions
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	// metaChars: /([.*+?^=!:${}()|\[\]\/\\])/g,
	//
	// How to escape regular expression in javascript?
	// http://stackoverflow.com/questions/2593637/how-to-escape-regular-expression-in-javascript
	// answerd by Gracenotes
	// metaChars: /([.?*+^$[\]\\(){}|-])/g,
	//
	// using Gracenotes version plus '\/'.
	// note that MDN's version includes: ':', '=', '!' and '-',
	// they are metacharacters only when used in (?:), (?=), (?!) and [0-9] (character classes), respectively.
	// metaChars: /([.?*+^$[\]\/\\(){}|-])/g,
	//
	// According to the book Regular Expression Cookbook
	// (added '/' for convenience when using the /regex/ literal):
	//
	metaChars: /([$()*+.?[\\^{|\/])/g,

	//
	// What literal characters should be escaped in a regex? (corner cases)
	// http://stackoverflow.com/questions/5484084/what-literal-characters-should-be-escaped-in-a-regex
	//
	// How to escape square brackets inside brackets in grep
	// http://stackoverflow.com/questions/21635126/how-to-escape-square-brackets-inside-brackets-in-grep?rq=1
	//
	metaClassChars: /([-\]\\^])/g,

	// treat any single character, meta characters, character classes, back reference, unicode character, ascii character,
	// control character and special escaped character in regular expression as a unit term.
	unitTerms: /^(?:.|\\[bBdDfnrsStvwW]|\\x[A-Fa-f0-9]{2}|\\u[A-Fa-f0-9]{4}|\\c[A-Z]|\\[$()*+.?[\/\\^{|]|\[(?:\\\]|[^\]])*?\]|\\\d{1,2})$/
};

var zeropad = '00000000';

////////////////////////////////////////////////////////
// regexGen
////////////////////////////////////////////////////////

/**
 * The Generator
 * =============
 *
 * The generator is exported as the `regexGen()` function, everything must be referenced from it.
 *
 * To generate a regular expression, pass sub-expressions as parameters to the call of `regexGen()` function.
 *
 * Sub-expressions are then concatenated together to form a whole regular expression.
 *
 * Sub-expressions can either be a `string`, a `number`, a `RegExp` object,
 * or any combinations of the call to methods (i.e., the `sub-generators`) of the `regexGen()` function object.
 *
 * Strings passed to the the call of `regexGen()`, `text()`, `maybe()`, `many()`, `any()`, `anyCharOf()`
 * and `anyCharBut()` functions, are always escaped as necessary,
 * so you don't have to worry about which characters to escape.
 *
 * The result of calling the `regexGen()` function is a `RegExp` object.
 * See __<a href="#user-content-the-regexp-object">The RegExp Object</a>__ section for detail.
 *
 * Since everything must be referenced from the `regexGen()` function,
 * to simplify codes, assign it to a short variable is preferable.
 *
 * @example
 *  var _ = regexGen;
 *
 *  var regex = regexGen(
 *	  _.startOfLine(),
 *	  _.capture( 'http', _.maybe( 's' ) ), '://',
 *	  _.capture( _.anyCharBut( ':/' ).repeat() ),
 *	  _.group( ':', _.capture( _.digital().multiple(2,4) ) ).maybe(), '/',
 *	  _.capture( _.anything() ),
 *	  _.endOfLine()
 *  );
 *  var matches = regex.exec( url );
 *
 * @namespace regexGen
 * @returns {RegExp} the generated RegExp object.
 */
function regexGen() {
	var i, n, context, term, terms, pattern, modifiers, regex;

	terms = [];
	modifiers = [];
	context = {
		captures: ['0'],
		warnings: []
	};
	for (i = 0, n = arguments.length; i < n; ++i) {
		term = arguments[i];
		if (term instanceof Modifier) {
			if (modifiers.indexOf(term._modifier) !== -1) {
				context.warnings.push('duplicated modifier: ' + term._modifier);
				continue;
			}
			modifiers.push(term._modifier);
		} else {
			terms.push(term);
		}
	}
	pattern = new Sequence(terms)._generate(context, 0);
	regex = new RegExp(pattern, modifiers.join(''));
	_mixin(regex, {
		warnings: context.warnings,
		captures: context.captures,
		extract: extract,
		replace: replace
	});
	return regex;
}

////////////////////////////////////////////////////////

function extract(text) {
	var self = this;
	var json, all;

	if (self.global) {
		self.lastIndex = 0;
		all = [];
		while ((json = extractor())) {
			all.push(json);
		}
		return all;
	}

	return extractor();

	function extractor() {
		var results;

		results = self.exec(text);
		return _capturesToJson(self.captures, results);
	}
}

/**
 * This method returns a new string with some or all matches of a pattern replaced by a pre-defined replacement.
 * The replacement can be a string or a function to be called for each match.
 *
 * @param {String} text - the string being examined.
 * @param {String | Function} replacement - the string or function that replaces the substring matched.
 *	  The function should be of the `function(matches, offset, text)` signature.
 * @returns {String} a new string with some or all matches of a pattern replaced by a replacement.
 *
 * @example
 * var _ = regexGen;
 * var regex = regexGen(
 *   _.capture( _.label('temp'),
 *	 _.digital().many(),
 *	 _.maybe(
 *	   '.',
 *	   _.digital().many()
 *	 )
 *   ),
 *   'F'
 * );
 * regex.replace("The temp is 11.3F.", "${temp} degree in Fahrenheit");
 * regex.replace("The temp is 11.3F.", function(matches, offset, string) {
 *   return ((matches.temp - 32) * 5/9) + 'C';
 * });
 *
 */
function replace(text, replacement) {
	var varRegex = /\${([^}]+)}/g;

	var self = this;
	var replacementCache;

	if (typeof replacement === 'string') {
		if (!self._replacementCache) {
			self._replacementCache = {};
		}
		replacementCache = self._replacementCache;
		if (!replacementCache[replacement]) {
			replacementCache[replacement] = replacement.replace(varRegex, function (matches, variable) {
				var idx;

				idx = self.captures.indexOf(variable);
				return idx === -1 ? matches : '$' + idx;
			});
		}
		return text.replace(self, replacementCache[replacement]);
	} else if (typeof replacement === 'function') {
		return text.replace(self, replacer);
	}
	return text;

	function replacer() {
		var offset, string, json;

		offset = arguments[arguments.length - 2];
		string = arguments[arguments.length - 1];
		json = _capturesToJson(self.captures, arguments);
		return replacement(json, offset, string);
	}
}

function _capturesToJson(captures, values) {
	var i, n, json;

	if (!values) {
		return null;
	}

	json = {};
	for (i = 1, n = captures.length; i < n; ++i) {
		json[captures[i]] = values[i];
	}
	return json;
}

////////////////////////////////////////////////////////

function _mixin(obj) {
	var i, k, ext;

	for (i = 1; i < arguments.length; ++i) {
		ext = arguments[i];
		for (k in ext) {
			if (ext.hasOwnProperty(k)) {
				obj[k] = ext[k];
			}
		}
	}
	return obj;
}

////////////////////////////////////////////////////////

function toHex(value, digits) {
	var ret;

	ret = value.toString(16);
	if (ret.length < digits) {
		return zeropad.substring(0, digits - ret.length) + ret;
	}
	return ret;
}

function isArray(o) {
	return (Object.prototype.toString.call(o) === '[object Array]');
}

////////////////////////////////////////////////////////

_mixin(regexGen, {

	/**
	 * A utility function helps using the regexGen generator.
	 * @memberof regexGen
	 * @param {Object} global - the target object that sub-generators will inject to.
	 */
	mixin: function (global) {
		_mixin(global, regexGen);
	},

	////////////////////////////////////////////////////
	// Modifiers
	////////////////////////////////////////////////////

	/**
	 * Case-insensitivity modifier.
	 * @memberof regexGen
	 * @static
	 */
	ignoreCase: function () {
		return new Modifier('i');
	},

	/**
	 * Default behaviour is with "g" modifier,
	 * so we can turn this another way around
	 * than other modifiers
	 * @memberof regexGen
	 * @static
	 */
	searchAll: function () {
		return new Modifier('g');
	},

	/**
	 * Multiline
	 * @memberof regexGen
	 * @static
	 */
	searchMultiLine: function () {
		return new Modifier('m');
	},

	////////////////////////////////////////////////////
	// Boundaries
	////////////////////////////////////////////////////

	/**
	 * @memberof regexGen
	 * @returns {Term}
	 */
	startOfLine: function () {
		return new Term('^');
	},

	/**
	 * @memberof regexGen
	 * @returns {Term}
	 */
	endOfLine: function () {
		return new Term('$');
	},

	/**
	 * Matches a word boundary. A word boundary matches the position
	 * where a word character is not followed or preceeded by another word-character.
	 * Note that a matched word boundary is not included in the match.
	 * In other words, the length of a matched word boundary is zero.
	 * (Not to be confused with [\b].)
	 *
	 * @memberof regexGen
	 * @static
	 * @returns {Term} the word boundary expression term object.
	 */
	wordBoundary: function () {
		return new Term('\\b');
	},

	/**
	 * Matches a non-word boundary.
	 * This matches a position where the previous and next character
	 * are of the same type: Either both must be words, or both must be non-words.
	 * The beginning and end of a string are considered non-words.
	 *
	 * @memberof regexGen
	 * @static
	 * @returns {Term}  the non-word boundary expression term object.
	 */
	nonWordBoundary: function () {
		return new Term('\\B');
	},

	////////////////////////////////////////////////////
	// Literal Characters
	////////////////////////////////////////////////////

	/**
	 * Any character sequence (abc).
	 * @memberof regexGen
	 * @param   {String} value the character sequence.
	 * @returns {Term} the text literal expression term object.
	 */
	text: function (value) {
		return Term.sanitize(value);
	},

	////////////////////////////////////////////////////
	// Character Classes
	////////////////////////////////////////////////////

	/**
	 * Any given character ([abc])
	 * usage: anyCharOf( [ 'a', 'c' ], ['2', '6'], 'fgh', 'z' ): ([a-c2-6fghz])
	 * @memberof regexGen
	 * @returns {Term}
	 */
	anyCharOf: function () {
		var warnings;

		warnings = [];
		return new Term('[' + Term.charClasses(arguments, true, warnings) + ']')._warn(warnings);
	},

	/**
	 * Anything but these characters ([^abc])
	 * usage: anyCharBut( [ 'a', 'c' ], ['2', '6'], 'fgh', 'z' ): ([^a-c2-6fghz])
	 * @memberof regexGen
	 * @returns {Term}
	 */
	anyCharBut: function () {
		var warnings;

		warnings = [];
		return new Term('[^' + Term.charClasses(arguments, false, warnings) + ']')._warn(warnings);
	},

	////////////////////////////////////////////////////
	// Character Shorthands
	////////////////////////////////////////////////////

	/**
	 * Matches any single character except the newline character (.)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	anyChar: function () {
		return new Term('.');
	},

	/**
	 * Matches the character with the code hh (two hexadecimal digits)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	ascii: function () {
		var i, n, value, values, warning;

		values = '';
		warning = [];
		n = arguments.length;
		if (n > 0) {
			for (i = 0; i < n; ++i) {
				value = arguments[i];
				if (typeof value === 'string' && regexCodes.hexAsciiCodes.test(value)) {
					values += '\\x' + value;
					continue;
				} else if (typeof value === 'number' && (0 <= value && value <= 0xFF)) {
					values += '\\x' + toHex(value, 2);
					continue;
				}
				warning.push(value.toString());
			}
			return new Term(values)._warn(warning.length === 0 ? '' : 'ascii(): values are not valid 2 hex digitals ascii code(s): ', warning);
		}
		return new Term()._warn('ascii(): no values given, should provides a 2 hex digitals ascii code or any number <= 0xFF.');
	},

	/**
	 * Matches the character with the code hhhh (four hexadecimal digits).
	 * @memberof regexGen
	 * @returns {Term}
	 */
	unicode: function () {
		var i, n, value, values, warning;

		values = '';
		warning = [];
		n = arguments.length;
		if (n > 0) {
			for (i = 0, n = arguments.length; i < n; ++i) {
				value = arguments[i];
				if (typeof value === 'string' && regexCodes.hexUnicodes.test(value)) {
					values += '\\u' + value;
					continue;
				} else if (typeof value === 'number' && (0 <= value && value <= 0xFFFF)) {
					values += '\\u' + toHex(value, 4);
					continue;
				}
				warning.push(value.toString());
			}
			return new Term(values)._warn(warning.length === 0 ? '' : 'unicode(): values are not valid 2 hex digitals unicode code(s): ', warning);
		}
		return new Term()._warn('unicode(): no values given, should provides a 2 hex digitals ascii code or any number <= 0xFFFF.');
	},

	/**
	 * Matches a NULL (U+0000) character.
	 * Do not follow this with another digit,
	 * because \0<digits> is an octal escape sequence.
	 * @memberof regexGen
	 * @returns {Term}
	 */
	nullChar: function () {
		return new Term('\\0');
	},

	/**
	 * Matches a control character in a string.
	 * Where X is a character ranging from A to Z.
	 * @memberof regexGen
	 * @returns {Term}
	 */
	controlChar: function (value) {
		if (typeof value === 'string' && regexCodes.ctrlChars.test(value)) {
			return new Term('\\c' + value);
		}
		return new Term()._warn('controlChar(): specified character is not a valid control character: ', value);
	},

	/**
	 * Matches a backspace (U+0008).
	 * You need to use square brackets if you want to match a literal backspace character.
	 * (Not to be confused with \b.)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	backspace: function () {
		return new Term('[\\b]');
	},

	/**
	 * Matches a form feed: (\f)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	formFeed: function () {
		return new Term('\\f');
	},

	/**
	 * Matches a line feed: (\n)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	lineFeed: function () {
		return new Term('\\n');
	},

	/**
	 * Matches a carriage return: (\r)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	carriageReturn: function () {
		return new Term('\\r');
	},

	/**
	 * Matches a single white space character, including space, tab, form feed, line feed: (\s)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	space: function () {
		return new Term('\\s');
	},

	/**
	 * Matches a single character other than white space: (\S)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	nonSpace: function () {
		return new Term('\\S');
	},

	/**
	 * Matches a tab (U+0009): (\t)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	tab: function () {
		return new Term('\\t');
	},

	/**
	 * Matches a vertical tab (U+000B): (\s)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	vertTab: function () {
		return new Term('\\v');
	},

	/**
	 * Matches a digit character: (\d)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	digital: function () {
		return new Term('\\d');
	},

	/**
	 * Matches any non-digit character
	 * @memberof regexGen
	 * @returns {Term}
	 */
	nonDigital: function () {
		return new Term('\\D');
	},

	/**
	 * Matches any alphanumeric character including the underscore: (\w)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	word: function () {
		return new Term('\\w');
	},

	/**
	 * Matches any non-word character.
	 * @memberof regexGen
	 * @returns {Term}
	 */
	nonWord: function () {
		return new Term('\\W');
	},

	////////////////////////////////////////////////////
	// Extended Character Shorthands
	////////////////////////////////////////////////////

	/**
	 * Matches any characters except the newline character: (.*)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	anything: function () {
		return new Term('.', '*');
	},

	/**
	 * @memberof regexGen
	 * @returns {Term}
	 */
	hexDigital: function () {
		return new Term('[0-9A-Fa-f]');
	},

	/**
	 * Matches any line break, includes Unix and windows CRLF
	 * @memberof regexGen
	 * @returns {Term}
	 */
	lineBreak: function () {
		return this.either(this.group(this.carriageReturn(), this.lineFeed()),
			this.carriageReturn(),
			this.lineFeed()
		);
	},

	/**
	 * Matches any alphanumeric character sequence including the underscore: (\w+)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	words: function () {
		return new Term('\\w', '+');
	},

	////////////////////////////////////////////////////
	// Quantifiers
	////////////////////////////////////////////////////

	/**
	 * @memberof regexGen
	 * @returns {Term}
	 */
	any: function (value) {
		return Term.sanitize(value, '*');
	},

	/**
	 * occurs one or more times (x+)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	many: function (value) {
		return Term.sanitize(value, '+');
	},

	/**
	 * Any optional character sequence, shortcut for Term.maybe ((?:abc)?)
	 * @memberof regexGen
	 * @returns {Term}
	 */
	maybe: function (value) {
		return Term.sanitize(value, '?');
	},

	////////////////////////////////////////////////////
	// Grouping and back references
	////////////////////////////////////////////////////

	/**
	 * Adds alternative expressions
	 * @memberof regexGen
	 * @returns {Sequence}
	 */
	either: function () {
		return new Sequence(arguments, '', '', '|')._warn(
			arguments.length >= 2 ? '' : 'eidther(): this function needs at least 2 sub-expressions. given only: ', arguments[0]
		);
	},

	/**
	 * Matches specified terms but does not remember the match. The generated parentheses are called non-capturing parentheses.
	 * @memberof regexGen
	 * @returns {Sequence}
	 */
	group: function () {
		return new Sequence(arguments);
	},

	/**
	 * Matches specified terms and remembers the match. The generated parentheses are called capturing parentheses.
	 * label 是用來供 back reference 索引 capture 的編號。
	 * 計算方式是由左至右，計算左括號出現的順序，也就是先深後廣搜尋。
	 * capture( label('cap1'), capture( label('cap2'), 'xxx' ), capture( label('cap3'), '...' ), 'something else' )
	 * @memberof regexGen
	 * @returns {Capture}
	 */
	capture: function () {
		var label, sequence;

		if (arguments.length > 0 && arguments[0] instanceof Label) {
			label = arguments[0]._label;
			sequence = Array.prototype.slice.call(arguments, 1);
		} else {
			label = '';
			sequence = arguments;
		}
		return new Capture(label, sequence);
	},

	/**
	 * label is a reference to a capture group, and is allowed only in the capture() method
	 * @memberof regexGen
	 * @returns {Label}
	 */
	label: function (label) {
		return new Label(label);
	},

	/**
	 * back reference
	 * @memberof regexGen
	 * @returns {CaptureReference}
	 */
	sameAs: function (label) {
		return new CaptureReference(label);
	},

	////////////////////////////////////////////////////

	/**
	 * trust me, just put the value as is.
	 * @memberof regexGen
	 * @returns {Term | RegexOverwrite}
	 */
	regex: function (value) {
		if (value instanceof RegExp) {
			return new RegexOverwrite(value.source);
		} else if (typeof value === 'string') {
			return new RegexOverwrite(value);
		}
		return new Term(value)._warn('regex(): specified regex is not a RegExp instance or is not a string: ', value);
	}
});

////////////////////////////////////////////////////////
// Term
////////////////////////////////////////////////////////

/**
 * Construct a Term object.
 *
 * The Term object represents a valid fragment of regular expression
 * that forms a small part of the whole regular expression.
 *
 * @class Term
 * @protected
 * @param {Object} body - a valid regular expression unit.
 * @param {String} quantifiers - the quantifiers applied on this term.
 */
function Term(body, quantifiers) {
	this._init(body, quantifiers);
}

_mixin(Term, /** @lends Term */ {
	/**
	 * Quote regular expression characters.
	 *
	 * Takes string and puts a backslash in front of every character that is part of the regular expression syntax.
	 *
	 * @static
	 * @protected
	 * @param   {String} value - the string to quote.
	 * @returns {String} the quoted string.
	 */
	quote: function (value) {
		return value.replace(regexCodes.metaChars, '\\$1');
	},

	/**
	 * Quote the terms so they can be put into character classes (square brackets).
	 *
	 * @static
	 * @protected
	 * @param   {Array} list - the input term(s) to convert.
	 * @param   {Boolean} positive - treat for positive or negative character classes.
	 * @param   {Array}   warnings - [output] a collection array to keep errors / warnings while converting character classes.
	 * @returns a single character sequence that can fit into character classes.
	 */
	charClasses: function (list, positive, warnings) {
		var i, v, sets, value, hyphen, circumflex;

		hyphen = circumflex = '';
		sets = [];
		for (i = 0; i < list.length; ++i) {
			v = list[i];
			v = range(v) || chars(v) || term(v);
			if (v) {
				sets.push(v);
			} else {
				warnings.push('invalid character: ' + v);
			}
		}
		value = sets.join('');

		if (value) {
			return (hyphen + value + circumflex);
		}

		value = hyphen + circumflex;
		if (value.length === 1 && positive) {
			return Term.quote(value);
		}
		return value;

		function range(pair) {
			if (isArray(pair)) {
				if ((pair.length === 2 &&
					((typeof pair[0] === 'number' && (0 <= pair[0] && pair[0] <= 9)) || (typeof pair[0] === 'string' && regexCodes.characterClassChars.test(pair[0]))) &&
					((typeof pair[1] === 'number' && (0 <= pair[1] && pair[1] <= 9)) || (typeof pair[1] === 'string' && regexCodes.characterClassChars.test(pair[1]))))) {
					return pair[0] + '-' + pair[1];
				}
			}
		}

		// bunch of characters
		function chars(c) {
			var s;

			if (typeof c === 'string') {
				s = c;

				if (s.indexOf('-') !== -1) {
					hyphen = '-';
					s = s.replace(/-/g, '');
				}
				if (s.indexOf('^') !== -1) {
					circumflex = '^';
					s = s.replace(/\^/g, '');
				}
				return s.replace(regexCodes.metaClassChars, '\\$1');
			}
		}

		function term(t) {
			var match, result;

			if (t instanceof Term) {
				if (t._quantifiers) {
					warnings.push('ignoring quantifier of embeded character class: ' + t._quantifiers);
				}
				if (t._preLookaheads || t._lookaheads) {
					warnings.push('ignoring lookaheads of embeded character class: ' + t._preLookaheads + ' : ' + t._lookaheads);
				}
				match = t._body.match(regexCodes.characterClassExpr);
				if (match && match[1]) {
					result = match[1];
					if (match[0] === '^') {
						warnings.push('ignoring negation directive of embeded character class');
						result = result.substring(1);
					}
					return result;
				} else if (regexCodes.characterClassChars.test(t._body)) {
					return t._body;
				}
			}
		}
	},

	/**
	 * Sanitation function for adding anything safely to the expression.
	 *
	 * @static
	 * @protected
	 * @param   {Object} body - the expression object to sanitize.
	 * @param   {String} quantifiers - the quantifiers applied on this term.
	 * @returns {Term}   a new Term object with contents sanitized.
	 */
	sanitize: function (body, quantifiers) {
		if (body instanceof Term) {
			return body;
		} else if (typeof body === 'string') {
			return new Term(Term.quote(body), quantifiers);
		} else if (typeof body === 'number') {
			return new Term(body.toString(), quantifiers);
		} else if (body instanceof RegExp) {
			return new RegexOverwrite(body.source);
		}
		return new Term()._warn('invalid regular expression: ', body);
	},

	/**
	 * Test if the given expression is a unit term.
	 *
	 * @static
	 * @protected
	 * @param   {String} expression - the expression string to test.
	 * @returns {Boolean} true is the given expression is a unit term.
	 */
	isUnitTerm: function (expression) {
		return regexCodes.unitTerms.test(expression);
	},

	/**
	 * Wrap the given expression if it is not a unit term.
	 *
	 * @static
	 * @protected
	 * @param   {String} body - the expression string to test.
	 * @returns {String} a unit expression that is properly protected.
	 */
	wrap: function (body) {
		if (Term.isUnitTerm(body)) {
			return body;
		}
		return '(?:' + body + ')';
	}
});

////////////////////////////////////////////////////

_mixin(Term.prototype, /** @lends Term.prototype */ {
	/**
	 * Initialize the term object, setup default values.
	 *
	 * @protected
	 * @param {String} body - the expression string.
	 * @param {String} quantifiers - the quantifiers applied on this term.
	 */
	_init: function (body, quantifiers) {
		this._body = body || '';
		this._quantifiers = quantifiers || '';
		this._greedy = '';
		this._preLookaheads = '';
		this._lookaheads = '';
		this._overwrite = '';
	},

	/**
	 *
	 * important: _generate and _generateBody should never modify the term object.
	 *
	 * implementation notes:
	 *
	 * termRequiresWrap tells fragile term(s) in sub-expression that if protection is required.
	 * There are 2 situations:
	 * 0.no: If there is only one term, then the terms need not protection at all.
	 * 1.maybe: If the sub-expression is composed with more then one term,
	 * and the terms will be evaluated in order, i.e., will be concatenated directly,
	 * then the terms need not protection, unless it is the "either" expression.
	 *
	 * [in traditional chinese]
	 *
	 * termRequiresWrap 是要通知元素是否需要使用 group 來保護內容。
	 *
	 * 有兩種狀況:
	 *
	 * 0.no: 元素沒有兄弟元素(僅有一個子元素)，則元素本身不需要特別保護。
	 * 1.maybe: 有兄弟元素，且兄弟元素之間將直接接合(concatenated)，
	 * 元素應視需要(目前只有 either 運算式有此需要)自我保護。
	 *
	 * @protected
	 * @param   {Object} context - the context object of the regexGen generator.
	 * @param   {Number} termRequiresWrap - should the term requires wrap. See possible values descripted above.
	 * @returns {String} the generated regular expression string literal.
	 */
	_generate: function (context, termRequiresWrap) {
		var i, n, body, bodyRequiresWrap;

		bodyRequiresWrap = requiresWrap(this, termRequiresWrap);
		// let captures and labels have chances to evaluate.
		body = this._generateBody(context, bodyRequiresWrap);
		if (this._warnings && this._warnings.length > 0) {
			for (i = 0, n = this._warnings.length; i < n; ++i) {
				context.warnings.push(this._warnings[i]);
			}
		}
		if (this._overwrite) {
			body = this._overwrite._generate(context, termRequiresWrap);
		} else {
			body = lookahead(this._preLookaheads) + body + (this._quantifiers ? (this._quantifiers + this._greedy) : '') + lookahead(this._lookaheads);
		}
		return body;

		function requiresWrap(term, givenWrap) {
			var wrap;

			if (term._quantifiers) {
				wrap = 2;
			} else if (term._preLookaheads || term._lookaheads) {
				wrap = 1;
			} else {
				wrap = 0;
			}

			return Math.max(wrap, givenWrap);
		}

		function lookahead(value) {
			return typeof value === 'string' ? value : new Sequence(value)._generate(context, false);
		}
	},

	/**
	 * @protected
	 * @param   {Object} context - the context object of the regexGen generator.
	 * @param   {Number} bodyRequiresWrap - should the body of term requires wrap. See possible values descripted in {@link #_generate}.
	 * @returns {String} the generated regular expression string literal (body part).
	 */
	_generateBody: function (context, bodyRequiresWrap) {
		return bodyRequiresWrap === 2 ? Term.wrap(this._body) : this._body;
	},

	/**
	 * @protected
	 * @param   {String} msg -
	 * @param   {Object} values -
	 */
	_warn: function (msg, values) {
		if (msg) {
			if (!this._warnings) {
				this._warnings = [];
			}
			this._warnings.push(msg + (values ? JSON.stringify(values) : ''));
		}
		return this;
	},

	////////////////////////////////////////////////////
	// Lookahead
	////////////////////////////////////////////////////

	/**
	 * @param   {...Object} terms -
	 */
	contains: function () {
		var sequence;

		sequence = new Sequence(arguments, '(?=', ')');
		if (typeof this._preLookaheads === 'string') {
			this._preLookaheads = [sequence];
		} else {
			this._preLookaheads.push(sequence);
		}
		return this;
	},

	/**
	 * @param   {...Object} terms -
	 */
	notContains: function () {
		var sequence;

		sequence = new Sequence(arguments, '(?!', ')');
		if (typeof this._preLookaheads === 'string') {
			this._preLookaheads = [sequence];
		} else {
			this._preLookaheads.push(sequence);
		}
		return this;
	},

	/**
	 * Matches 'x' only if 'x' is followed by 'y'. This is called a lookahead. (x(?=y))
	 *
	 * @param   {...Object} terms -
	 */
	followedBy: function () {
		var sequence;

		sequence = new Sequence(arguments, '(?=', ')');
		if (typeof this._lookaheads === 'string') {
			this._lookaheads = [sequence];
		} else {
			this._lookaheads.push(sequence);
		}
		return this;
	},

	/**
	 * Matches 'x' only if 'x' is not followed by 'y'. This is called a negated lookahead. (x(?!y))
	 *
	 * @param   {...Object} terms -
	 */
	notFollowedBy: function () {
		var sequence;

		sequence = new Sequence(arguments, '(?!', ')');
		if (typeof this._lookaheads === 'string') {
			this._lookaheads = [sequence];
		} else {
			this._lookaheads.push(sequence);
		}
		return this;
	},

	////////////////////////////////////////////////////
	// Quantifiers
	////////////////////////////////////////////////////

	/**
	 * Matches the expression generated by the preceding sub-generator 0 or more times. Equivalent to `/(.*)/` and `/.{0,}/`.
	 */
	any: function () {
		this._quantifiers = '*';
		return this;
	},

	/**
	 * occurs one or more times (x+)
	 */
	many: function () {
		this._quantifiers = '+';
		return this;
	},

	/**
	 * occurs zero or one times (x?)
	 */
	maybe: function () {
		this._quantifiers = '?';
		return this;
	},

	/**
	 * occurs at least once or exactly specified times (+|{n})
	 */
	repeat: function (times) {
		if (typeof times === 'number') {
			this._quantifiers = '{' + times + '}';
		} else {
			this._quantifiers = '+';
		}
		return this;
	},

	/**
	 * occurs at least min times and (optional) at most max times (?|*|+|{min,}|{min,max})
	 * occurs at least min times and (optional) at most max times (?|*|+|{min,}|{min,max})
	 */
	multiple: function (optionalMinTimes, optionalMaxTimes) {
		var minTimes, maxTimes;

		minTimes = (typeof optionalMinTimes === 'number' ? optionalMinTimes.toString() : '0');
		maxTimes = (typeof optionalMaxTimes === 'number' ? optionalMaxTimes.toString() : '');
		if (maxTimes === '') {
			if (minTimes === '0') {
				this._quantifiers = '*';
				return this;
			} else if (minTimes === '1') {
				this._quantifiers = '+';
				return this;
			}
		} else if (minTimes === '0' && maxTimes === '1') {
			// 'maybe' is more clear for this situation
			this._quantifiers = '?';
			return this;
		}

		// note that {,n} is not valid.
		this._quantifiers = '{' + minTimes + ',' + maxTimes + '}';
		return this;
	},

	/**
	 * Makes a quantifier greedy. Note that quantifier are greedy by default.
	 *
	 * @example
	 *   anyChar().any().greedy()	   // ==> /.\u002A/
	 *   anyChar().many().greedy()	  // ==> /.+/
	 *   anyChar().maybe().greedy()	 // ==> /.?/
	 */
	greedy: function () {
		this._greedy = '';
		return this;
	},

	/**
	 * Makes a quantifier lazy.
	 *
	 * @example
	 *   anyChar().any().lazy()		  // ==> /.*?/
	 *   anyChar().many().lazy()		 // ==> /.+?/
	 *   anyChar().maybe().lazy()		// ==> /.??/
	 *   anyChar().multiple(5,9).lazy()  // ==> /.{5,9}?/
	 *
	 */
	lazy: function () {
		this._greedy = '?';
		return this;
	},

	/**
	 * This is an alias of [`lazy()`]{@link #lazy}.
	 */
	reluctant: function () {
		this._greedy = '?';
		return this;
	},

	// Term.prototype.possessive = function() {
	//	 this._greedy = '+';
	// };

	////////////////////////////////////////////////////

	/**
	 * Use the given regex, i.e., trust me, just put the value as is.
	 *
	 * @example
	 * regex( /\w\d/ )	   // ==> /\w\d/
	 * regex( "\\w\\d" )	 // ==> /\w\d/
	 *
	 * @param {RegExp | String} value
	 */
	regex: function (value) {
		if (value instanceof RegExp) {
			this._overwrite = new RegexOverwrite(value.source);
		} else if (typeof value === 'string') {
			this._overwrite = new RegexOverwrite(value);
		} else {
			this._warn('regex(): specified regex is not a RegExp instance or is not a string. given: ', value);
		}
		return this;
	}
});

////////////////////////////////////////////////////////
// Sequence
////////////////////////////////////////////////////////

/**
 * @class Sequence
 * @extends Term
 * @protected
 */
function Sequence(sequence, prefixes, suffixes, join) {
	this._init(Sequence.normalize(sequence));
	this._prefixes = prefixes || '';
	this._suffixes = suffixes || '';
	this._join = join || '';
}

/**
 * @memberof Sequence
 * @static
 * @function
 */
Sequence.normalize = function (list) {
	var i, n, term, terms;

	terms = [];
	if (list && list.length > 0) {
		for (i = 0, n = list.length; i < n; ++i) {
			term = list[i];
			term = Term.sanitize(term);
			terms.push(term);
		}
	}
	return terms;
};

Sequence.prototype = new Term();

_mixin(Sequence.prototype, /** @lends Sequence.prototype */ {
	/**
	 * bodyRequiresWrap 是要通知子元素是否需要使用 group 保護 body 內容主體。
	 * 有三種狀況:
	 * 0.no: 子元素沒有兄弟元素(僅有一個子元素)，則子元素本身不需要特別保護。
	 * 1.maybe: 有兄弟元素，且兄弟元素之間將直接接合(concatenated)，子元素應視需要自我保護(目前只有 either 運算式有此需要)。
	 * 2.must: 子元素具有 quantifiers，應視需要自我保護(除非是 unit term)。
	 * @protected
	 * @param context {Object} - The generator context.
	 * @param bodyRequiresWrap {Number} - The wrap information.
	 * @return {String} - The generated body expression.
	 */
	_generateBody: function (context, bodyRequiresWrap) {
		var i, n, term, terms, body, values, termRequiresWrap;

		terms = this._body;

		// 下列兩種狀況下，子元素不需特別加以保護：
		// 1.若只有一個子元素，
		// 2.若母運算式採用 either 運算子 (|)，
		//   由於 either 的優先權極小，內部分隔的子元素不需要保護來自兄弟元素的侵擾。
		//   可以將各個子元素視為已受群組保護，而只需要保護好整個 either 母運算式不受外部侵擾即可。
		//   (見下面說明)
		termRequiresWrap = (terms.length === 1 || this._join === '|') ? 0 : 1;
		values = [];
		for (i = 0, n = terms.length; i < n; ++i) {
			term = terms[i];
			body = term._generate(context, termRequiresWrap);
			values.push(body);
		}
		body = values.join(this._join);

		if (this._prefixes || this._suffixes) {
			return this._prefixes + body + this._suffixes;
		}

		// 下列兩種狀況，此母運算式需要自我保護：
		// 1.若 bodyRequiresWrap === 2，表示外部要求一定要群組，目前只有當元素具有 quantifiers 時，才會符合此項。
		// 2.若 bodyRequiresWrap === 1，表示目前的運算式將與其他運算式直接接合(concatenated)，此時需要保護 either 運算式。
		// 注意，若 bodyRequiresWrap === 0，表示此母運算式已受適當的保護，不需要擔心受到外部及兄弟元素的侵擾。
		//
		// switch ( bodyRequiresWrap.toString() + termRequiresWrap.toString() ) {
		//	 case '00':  // /()((a))/		=> /a/
		//				 // /()((a)|(b))/	=> /a|b/
		//	 case '01':  // /()((a)(b))/	 => /ab/
		//	 case '10':  // /(o)((a))/	   => /oa/
		//				 // /(o)((a)|(b))/   => /o(a|b)/
		//	 case '11':  // /(o)((a)(b))/	=> /oab/
		//	 case '20':  // /(o)((a))?/	  => /o(a)?/
		//				 // /(o)((a)|(b))?/  => /o(a|b)?/
		//	 case '21':  // /(o)((a)(b))?/   => /o(ab)?/
		// }
		//
		// 注意：註解的 if 判斷式與下面的 if 判斷式等價，但比較容易了解。
		// if ( bodyRequiresWrap === 2 || (bodyRequiresWrap === 1 && terms.length !== 1 && this._join === '|') ) {
		if (bodyRequiresWrap === 2 || (bodyRequiresWrap === 1 && !termRequiresWrap)) {
			return Term.wrap(body);
		}
		return body;
	}
});

////////////////////////////////////////////////////////
// Capture
////////////////////////////////////////////////////////

/**
 * @class Capture
 * @extends Sequence
 * @protected
 */
function Capture(label, sequence) {
	Sequence.call(this, sequence, '(', ')');
	this._label = label;
}

/**
 * @memberof Capture
 * @static
 * @function
 */
Capture.currentLabel = function (context) {
	return Label.normalize(context.captures.length);
};

/**
 * @memberof Capture
 * @static
 * @function
 */
Capture.register = function (context, captureLabel) {
	context.captures.push(captureLabel);
};

/**
 * @memberof Capture
 * @static
 * @function
 */
Capture.lookup = function (context, captureLabel) {
	var index;

	index = context.captures.indexOf(captureLabel);
	if (index !== -1) {
		return '\\' + index;
	}
	return null;
};

Capture.prototype = new Sequence();

_mixin(Capture.prototype, {
	/**
	 * @memberof Capture#
	 * @protected
	 * @function
	 */
	_generateBody: function (context, bodyRequiresWrap) {
		// note: don't assign this._label here, or the regex can't reuse.
		Capture.register(context, this._label === '' ? Capture.currentLabel(context) : this._label);
		return Sequence.prototype._generateBody.call(this, context, bodyRequiresWrap);
	}
});

////////////////////////////////////////////////////////
// CaptureReference
////////////////////////////////////////////////////////

/**
 * @class CaptureReference
 * @extends Term
 * @protected
 */
function CaptureReference(label) {
	this._init();
	this._label = Label.normalize(label);
}

CaptureReference.prototype = new Term();

_mixin(CaptureReference.prototype, {
	/**
	 * @memberof CaptureReference
	 * @protected
	 * @function
	 * @protected
	 */
	_generateBody: function (context) {
		var backreference;

		backreference = Capture.lookup(context, this._label);
		if (backreference) {
			return backreference;
		}
		this._warn('sameAs(): back reference has no matching capture: ', this._label);
		return '';
	}
});

////////////////////////////////////////////////////////
// Label
////////////////////////////////////////////////////////

/**
 * @class Label
 * @protected
 */
function Label(label) {
	this._label = label;
}

/**
 * @memberof Label
 * @static
 * @function
 * @protected
 */
Label.normalize = function (label) {
	if (typeof label === 'string') {
		return label;
	} else if (typeof label === 'number') {
		return label.toString();
	} else if (label instanceof Label) {
		return label._label;
	}
	return '__invalid_label__(' + label.toString() + ')';
};

////////////////////////////////////////////////////////
// RegexOverwrite
////////////////////////////////////////////////////////

/**
 * @class RegexOverwrite
 * @extends Term
 * @protected
 */
function RegexOverwrite(value) {
	this._init(value);
}

RegexOverwrite.prototype = new Term();

_mixin(RegexOverwrite.prototype, {
	/**
	 * @memberof RegexOverwrite
	 * @function
	 * @protected
	 */
	_registerCaptures: function (context) {
		var i, n, captures;

		captures = this._body.match(regexCodes.captureParentheses);
		if (captures && captures.length > 0) {
			for (i = 0, n = captures.length; i < n; ++i) {
				Capture.register(context, Capture.currentLabel(context));
			}
		}
	},
	/**
	 * @memberof RegexOverwrite
	 * @function
	 * @protected
	 */
	_generateBody: function (context, bodyRequiresWrap) {
		this._registerCaptures(context);
		return Term.prototype._generateBody.call(this, context, bodyRequiresWrap);
	}
});

////////////////////////////////////////////////////////
// Modifier
////////////////////////////////////////////////////////

/**
 * @class Modifier
 * @protected
 */
function Modifier(modifier) {
	this._modifier = modifier;
}

////////////////////////////////////////////////////////

module.exports = regexGen;
