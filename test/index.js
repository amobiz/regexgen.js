'use strict';

var expect = require('chai').expect;
var regexGen = require('../');

var _ = regexGen;

describe('regexGen.js - The JavaScript Regular Expression Generator', function () {
	// note that an empty literal RegExp object is //, that is exactly a comment!
	var emptyRegExp = new RegExp('');

	describe('The regexGen() Function', function () {
		it('should always return RegExp instance', function () {
			expect(regexGen()).to.be.a('RegExp');
		});

		it('should generate nothing when given nothing', function () {
			expect(regexGen().source).to.equal(emptyRegExp.source);
			expect(regexGen('').source).to.equal(emptyRegExp.source);
			expect(regexGen(emptyRegExp).source).to.equal(emptyRegExp.source);
		});
	});

	describe('mixin', function () {
		it('should inject methods to specified object', function () {
			var target;

			target = {};
			regexGen.mixin(target);
			expect(target.text).to.equal(regexGen.text);
		});
	});

	describe('Modifiers', function () {
		it('ignoreCase', function () {
			expect(regexGen(_.ignoreCase()).toString()).to.equal(/(?:)/i.toString());
		});
		it('searchAll', function () {
			expect(regexGen(_.searchAll()).toString()).to.equal(/(?:)/g.toString());
		});
		it('searchMultiLine', function () {
			expect(regexGen(_.searchMultiLine()).toString()).to.equal(/(?:)/m.toString());
		});
		it('all modifiers', function () {
			expect(regexGen(_.searchAll(), _.ignoreCase(), _.searchMultiLine()).toString()).to.equal(/(?:)/gim.toString());
		});
		it('duplicated modifiers', function () {
			expect(regexGen(_.searchAll(), _.searchAll(), _.searchAll(), _.ignoreCase(), _.ignoreCase(), _.searchMultiLine(), _.searchMultiLine()).toString()).to.equal(/(?:)/gim.toString());
		});
	});

	describe('Boundaries', function () {
		it('startOfLine', function () {
			expect(regexGen(_.startOfLine(), '^').source).to.equal(/^\^/.source);
		});
		it('endOfLine', function () {
			expect(regexGen('$', _.endOfLine()).source).to.equal(/\$$/.source);
		});
		it('wordBoundary', function () {
			expect(regexGen(_.wordBoundary(), 'ness').source).to.equal(/\bness/.source);
			expect(regexGen('ness', _.wordBoundary()).source).to.equal(/ness\b/.source);
		});
		it('nonWordBoundary', function () {
			expect(regexGen(_.nonWordBoundary(), 'oo').source).to.equal(/\Boo/.source);
			expect(regexGen('y', _.nonWordBoundary()).source).to.equal(/y\B/.source);
		});
	});

	describe('Character Sequence', function () {
		describe('text', function () {
			it('should accept both string literal and text() function', function () {
				expect(regexGen('a', _.text('a')).source).to.equal(/aa/.source);
			});
			it('should not generate group parentheses', function () {
				expect(regexGen('a').source).to.equal(/a/.source);
				expect(regexGen(_.text('a')).source).to.equal(/a/.source);
				expect(regexGen('ab').source).to.equal(/ab/.source);
				expect(regexGen(_.text('ab')).source).to.equal(/ab/.source);
				expect(regexGen(_.text('ab'), 'c').source).to.equal(/abc/.source);
			});
			it('should escape special characters', function () {
				expect(regexGen('.*+?^=!:${}()|[]/\\').source).to.equal(/\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\/.source);
				expect(regexGen(_.text('.*+?^=!:${}()|[]/\\')).source).to.equal(/\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\/.source);
			});
		});
	});

	describe('Character Classes', function () {
		describe('anyCharOf', function () {
			it('should place or escape hyphen and circumflex smartly', function () {
				expect(regexGen(_.anyCharOf('^-')).source).to.equal(/[-^]/.source);
				expect(regexGen(_.anyCharOf('^')).source).to.equal(/[\^]/.source);
				expect(regexGen(_.anyCharOf('-')).source).to.equal(/[-]/.source);
			});
			it('should accept any character sequence', function () {
				expect(regexGen(_.anyCharOf('abc')).source).to.equal(/[abc]/.source);
				expect(regexGen(_.anyCharOf('~!@#$%^&*()-+{}[]<>,./;:|\\')).source).to.equal(/[-~!@#$%&*()+{}[\]<>,./;:|\\^]/.source);
				expect(regexGen(_.anyCharOf("''", '""')).source).to.equal(/[''""]/.source); // jshint ignore:line
			});
			it('should accept square brackets with exact 2 elements as ranged character sequence', function () {
				expect(regexGen(_.anyCharOf(['0', '9'], ['a', 'f'])).source).to.equal(/[0-9a-f]/.source);
				expect(regexGen(_.anyCharOf([0, 9], ['a', 'f'])).source).to.equal(/[0-9a-f]/.source);
				expect(regexGen(_.anyCharOf([10, 9], ['a', 'f'])).source).to.equal(/[a-f]/.source);
				expect(regexGen(_.anyCharOf(['0', '9'], ['a'], ['a', 'f', 'm', 'n'])).source).to.equal(/[0-9]/.source);
			});
			it('should escape (only) "\\", "]" characters', function () {
				expect(regexGen(_.anyCharOf('^+-*/\\=%[]()')).source).to.equal(/[-+*/\\=%[\]()^]/.source);
			});
			it('should accept nested character classes', function () {
				expect(regexGen(_.anyCharOf(
					_.anyCharOf(['a', 'z']),
					_.backspace(),
					_.hexDigital()
				)).source).to.equal(/[a-z\b0-9A-Fa-f]/.source);
			});
		});

		describe('anyCharBut', function () {
			it('should place or escape hyphen and circumflex smartly', function () {
				expect(regexGen(_.anyCharBut('^-')).source).to.equal(/[^-^]/.source);
				expect(regexGen(_.anyCharBut('^')).source).to.equal(/[^^]/.source);
				expect(regexGen(_.anyCharBut('-')).source).to.equal(/[^-]/.source);
			});
			it('should accept any character sequence', function () {
				expect(regexGen(_.anyCharBut('abc')).source).to.equal(/[^abc]/.source);
			});
			it('should accept square brackets with exact 2 elements as ranged character sequence', function () {
				expect(regexGen(_.anyCharBut(['0', '9'], ['a', 'f'])).source).to.equal(/[^0-9a-f]/.source);
				expect(regexGen(_.anyCharBut([0, 9], ['a', 'f'])).source).to.equal(/[^0-9a-f]/.source);
				expect(regexGen(_.anyCharBut([10, 9], ['a', 'f'])).source).to.equal(/[^a-f]/.source);
				expect(regexGen(_.anyCharBut(['0', '9'], ['a'], ['a', 'f', 'm', 'n'])).source).to.equal(/[^0-9]/.source);
			});
			it('should escape (only) "\\", "]" characters', function () {
				expect(regexGen(_.anyCharBut('^+-*/\\=%[]()')).source).to.equal(/[^-+*/\\=%[\]()^]/.source);
			});
			it('should accept nested character classes', function () {
				expect(regexGen(_.anyCharBut(
					_.anyCharOf(['a', 'z']),
					_.backspace(),
					_.hexDigital()
				)).source).to.equal(/[^a-z\b0-9A-Fa-f]/.source);
			});
		});

		describe('anyChar', function () {
			it('should generate a single dot character', function () {
				expect(regexGen(_.anyChar()).source).to.equal(/./.source);
			});
		});

		describe('ascii', function () {
			it('should accept 2 characters hex digital or any number <= 0xFF', function () {
				expect(regexGen(_.ascii('00')).source).to.equal(/\x00/.source);
				expect(regexGen(_.ascii('99', '22')).source).to.equal(/\x99\x22/.source);
				expect(regexGen(_.ascii(99, 22, 0x99, 0x22)).source).to.equal(/\x63\x16\x99\x22/.source);
			});
			it('should not accept anything else', function () {
				expect(regexGen(_.ascii()).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.ascii('1')).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.ascii('001')).source).to.equal(emptyRegExp.source);
			});
		});

		describe('unicode', function () {
			it('should accept 4 characters hex digital or any number <= 0xFFFF', function () {
				expect(regexGen(_.unicode('0000')).source).to.equal(/\u0000/.source);
				expect(regexGen(_.unicode('9999')).source).to.equal(/\u9999/.source);
				expect(regexGen(_.unicode(0, 9999, 0x9999)).source).to.equal(/\u0000\u270f\u9999/.source);
			});
			it('should not accept anything else', function () {
				expect(regexGen(_.unicode()).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.unicode('001')).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.unicode('00001')).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.unicode(0x10000)).source).to.equal(emptyRegExp.source);
			});
		});

		describe('nullChar', function () {
			it('should generate a single null character escape', function () {
				expect(regexGen(_.nullChar()).source).to.equal(/\0/.source);
			});
		});

		describe('controlChar', function () {
			it('should accept a character between A-Z or a-z', function () {
				expect(regexGen(_.controlChar('Z')).source).to.equal(/\cZ/.source);
				expect(regexGen(_.controlChar('c')).source).to.equal(/\cc/.source);
			});
			it('should not accept anything else', function () {
				expect(regexGen(_.controlChar()).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.controlChar(72)).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.controlChar('ZZ')).source).to.equal(emptyRegExp.source);
			});
		});

		describe('backspace', function () {
			it('should generate a single backspace character escape', function () {
				expect(regexGen(_.backspace()).source).to.equal(/[\b]/.source);
			});
		});

		describe('formFeed', function () {
			it('should generate a single form feed character escape', function () {
				expect(regexGen(_.formFeed()).source).to.equal(/\f/.source);
			});
		});

		describe('lineFeed', function () {
			it('should generate a single line feed character escape', function () {
				expect(regexGen(_.lineFeed()).source).to.equal(/\n/.source);
			});
		});

		describe('carriageReturn', function () {
			it('should generate a single carriage return character escape', function () {
				expect(regexGen(_.carriageReturn()).source).to.equal(/\r/.source);
			});
		});

		describe('space', function () {
			it('should generate a single space character escape', function () {
				expect(regexGen(_.space()).source).to.equal(/\s/.source);
			});
		});

		describe('nonSpace', function () {
			it('should generate a single non-space character escape', function () {
				expect(regexGen(_.nonSpace()).source).to.equal(/\S/.source);
			});
		});

		describe('tab', function () {
			it('should generate a single tab character escape', function () {
				expect(regexGen(_.tab()).source).to.equal(/\t/.source);
			});
		});

		describe('vertTab', function () {
			it('should generate a single vertical tab character escape', function () {
				expect(regexGen(_.vertTab()).source).to.equal(/\v/.source);
			});
		});

		describe('digital', function () {
			it('should generate a single digital character escape', function () {
				expect(regexGen(_.digital()).source).to.equal(/\d/.source);
			});
		});

		describe('nonDigital', function () {
			it('should generate a single non-digital character escape', function () {
				expect(regexGen(_.nonDigital()).source).to.equal(/\D/.source);
			});
		});

		describe('word', function () {
			it('should generate a single word character escape', function () {
				expect(regexGen(_.word()).source).to.equal(/\w/.source);
			});
		});

		describe('nonWord', function () {
			it('should generate a single non-word character escape', function () {
				expect(regexGen(_.nonWord()).source).to.equal(/\W/.source);
			});
		});

		describe('anything', function () {
			it('should generate a single dot character with zero to many multiple', function () {
				expect(regexGen(_.anything()).source).to.equal(/.*/.source);
			});
		});

		describe('hexDigital', function () {
			it('should generate a character sets for hex digital', function () {
				expect(regexGen(_.hexDigital()).source).to.equal(/[0-9A-Fa-f]/.source);
			});
		});

		describe('lineBreak', function () {
			it('should generate all type of line break character escapes', function () {
				expect(regexGen(_.lineBreak()).source).to.equal(/\r\n|\r|\n/.source);
			});
		});

		describe('words', function () {
			it('should generate a single word character escape with one to many multiple', function () {
				expect(regexGen(_.words()).source).to.equal(/\w+/.source);
			});
		});
	});

	describe('Quantifiers and Lookaheads', function () {
		describe('any', function () {
			it('should not generate group parentheses if there is only one single character', function () {
				expect(regexGen(_.any('a')).source).to.equal(/a*/.source);
			});
			it('should generate group parentheses if there is more than one character', function () {
				expect(regexGen(_.any('ab')).source).to.equal(/(?:ab)*/.source);
			});
			it('should escape special characters (just as the text() function)', function () {
				expect(regexGen(_.any('.*+?^=!:${}()|[]/\\')).source).to.equal(/(?:\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\)*/.source);
			});
		});

		describe('many', function () {
			it('should not generate group parentheses if there is only one single character', function () {
				expect(regexGen(_.many('a')).source).to.equal(/a+/.source);
			});
			it('should generate group parentheses if there is more than one character', function () {
				expect(regexGen(_.many('ab')).source).to.equal(/(?:ab)+/.source);
			});
			it('should escape special characters (just as the text() function)', function () {
				expect(regexGen(_.many('.*+?^=!:${}()|[]/\\')).source).to.equal(/(?:\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\)+/.source);
			});
		});

		describe('maybe', function () {
			it('should not generate group parentheses if there is only one single character', function () {
				expect(regexGen(_.maybe('a')).source).to.equal(/a?/.source);
			});
			it('should generate group parentheses if there is more than one character', function () {
				expect(regexGen(_.maybe('ab')).source).to.equal(/(?:ab)?/.source);
			});
			it('should escape special characters (just as the text() function)', function () {
				expect(regexGen(_.maybe('.*+?^=!:${}()|[]/\\')).source).to.equal(/(?:\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\)?/.source);
			});
		});

		describe('text', function () {
			it('should support all kind of quantifiers', function () {
				expect(regexGen(_.text('ab').any()).source).to.equal(/(?:ab)*/.source);
				expect(regexGen(_.text('ab').many()).source).to.equal(/(?:ab)+/.source);
				expect(regexGen(_.text('ab').maybe()).source).to.equal(/(?:ab)?/.source);
				expect(regexGen(_.text('ab').repeat()).source).to.equal(/(?:ab)+/.source);
				expect(regexGen(_.text('ab').repeat(5)).source).to.equal(/(?:ab){5}/.source);
				expect(regexGen(_.text('ab').multiple()).source).to.equal(/(?:ab)*/.source);
				expect(regexGen(_.text('ab').multiple(1)).source).to.equal(/(?:ab)+/.source);
				expect(regexGen(_.text('ab').multiple(0, 1)).source).to.equal(/(?:ab)?/.source);
				expect(regexGen(_.text('ab').multiple(5)).source).to.equal(/(?:ab){5,}/.source);
				expect(regexGen(_.text('ab').multiple(5, 9)).source).to.equal(/(?:ab){5,9}/.source);
			});
			it('should not generate quantifier modifier if there is no quantifier', function () {
				expect(regexGen(_.text('ab').repeat().lazy()).source).to.equal(/(?:ab)+?/.source);
				expect(regexGen(_.text('ab').lazy()).source).to.equal(/ab/.source);
			});
			it('(single character) should not generates group parentheses even when there is quantifiers', function () {
				expect(regexGen(_.text('a').repeat()).source).to.equal(/a+/.source);
				expect(regexGen(_.text('a').repeat(1)).source).to.equal(/a{1}/.source);
				expect(regexGen(_.text('a').multiple(0)).source).to.equal(/a*/.source);
				expect(regexGen(_.text('a').multiple(1)).source).to.equal(/a+/.source);
				expect(regexGen(_.text('a').multiple(2, 3)).source).to.equal(/a{2,3}/.source);
			});
			it('(single character) should not generates group parentheses even when there is lookaheads', function () {
				expect(regexGen(_.anything().contains(_.anything().lazy(), 'c')).source).to.equal(/(?=.*?c).*/.source);
				expect(regexGen(_.anything().notContains(_.anything().lazy(), 'c')).source).to.equal(/(?!.*?c).*/.source);
				expect(regexGen(_.text('a').followedBy('c')).source).to.equal(/a(?=c)/.source);
				expect(regexGen(_.text('a').notFollowedBy('c')).source).to.equal(/a(?!c)/.source);
			});
			it('(multiple characters) should generates group parentheses when there is quantifiers', function () {
				expect(regexGen(_.text('ab').repeat()).source).to.equal(/(?:ab)+/.source);
				expect(regexGen(_.text('ab').repeat(1)).source).to.equal(/(?:ab){1}/.source);
				expect(regexGen(_.text('ab').multiple(0)).source).to.equal(/(?:ab)*/.source);
				expect(regexGen(_.text('ab').multiple(1)).source).to.equal(/(?:ab)+/.source);
				expect(regexGen(_.text('ab').multiple(2, 3)).source).to.equal(/(?:ab){2,3}/.source);
			});
			it('(multiple characters) should not generates group parentheses even when there is lookaheads', function () {
				expect(regexGen(_.text('ab').contains(_.anything().lazy(), 'c')).source).to.equal(/(?=.*?c)ab/.source);
				expect(regexGen(_.text('ab').notContains(_.anything().lazy(), 'c')).source).to.equal(/(?!.*?c)ab/.source);
				expect(regexGen(_.text('ab').followedBy('c')).source).to.equal(/ab(?=c)/.source);
				expect(regexGen(_.text('ab').notFollowedBy('c')).source).to.equal(/ab(?!c)/.source);
			});
			it('(multiple characters) should generates group parentheses when there is quantifiers and lookaheads', function () {
				expect(regexGen(_.text('ab').repeat().contains('c')).source).to.equal(/(?=c)(?:ab)+/.source);
				expect(regexGen(_.text('ab').repeat(2).contains('c')).source).to.equal(/(?=c)(?:ab){2}/.source);
				expect(regexGen(_.text('ab').multiple(0).contains('c')).source).to.equal(/(?=c)(?:ab)*/.source);
				expect(regexGen(_.text('ab').multiple(1).contains('c')).source).to.equal(/(?=c)(?:ab)+/.source);
				expect(regexGen(_.text('ab').multiple(2, 3).contains('c')).source).to.equal(/(?=c)(?:ab){2,3}/.source);
				expect(regexGen(_.text('ab').repeat().notContains('c')).source).to.equal(/(?!c)(?:ab)+/.source);
				expect(regexGen(_.text('ab').repeat(2).notContains('c')).source).to.equal(/(?!c)(?:ab){2}/.source);
				expect(regexGen(_.text('ab').multiple(0).notContains('c')).source).to.equal(/(?!c)(?:ab)*/.source);
				expect(regexGen(_.text('ab').multiple(1).notContains('c')).source).to.equal(/(?!c)(?:ab)+/.source);
				expect(regexGen(_.text('ab').multiple(2, 3).notContains('c')).source).to.equal(/(?!c)(?:ab){2,3}/.source);

				expect(regexGen(_.text('ab').repeat().followedBy('c')).source).to.equal(/(?:ab)+(?=c)/.source);
				expect(regexGen(_.text('ab').repeat(2).followedBy('c')).source).to.equal(/(?:ab){2}(?=c)/.source);
				expect(regexGen(_.text('ab').multiple(0).followedBy('c')).source).to.equal(/(?:ab)*(?=c)/.source);
				expect(regexGen(_.text('ab').multiple(1).followedBy('c')).source).to.equal(/(?:ab)+(?=c)/.source);
				expect(regexGen(_.text('ab').multiple(2, 3).followedBy('c')).source).to.equal(/(?:ab){2,3}(?=c)/.source);
				expect(regexGen(_.text('ab').repeat().notFollowedBy('c')).source).to.equal(/(?:ab)+(?!c)/.source);
				expect(regexGen(_.text('ab').repeat(2).notFollowedBy('c')).source).to.equal(/(?:ab){2}(?!c)/.source);
				expect(regexGen(_.text('ab').multiple(0).notFollowedBy('c')).source).to.equal(/(?:ab)*(?!c)/.source);
				expect(regexGen(_.text('ab').multiple(1).notFollowedBy('c')).source).to.equal(/(?:ab)+(?!c)/.source);
				expect(regexGen(_.text('ab').multiple(2, 3).notFollowedBy('c')).source).to.equal(/(?:ab){2,3}(?!c)/.source);
			});
		});
	});

	describe('Grouping', function () {
		describe('either', function () {
			it('should generate no group parentheses when is the only term', function () {
				expect(regexGen(_.either('a', 'b')).source).to.equal(/a|b/.source);
				expect(regexGen(_.either(_.text('a').repeat().followedBy('c'), _.maybe('b'), _.anyCharOf(['0', '9'], ['a', 'f']))).source).to.equal(/a+(?=c)|b?|[0-9a-f]/.source);
			});
			it('should generate group parentheses when there is quantifiers', function () {
				expect(regexGen(_.either('a', 'b').maybe()).source).to.equal(/(?:a|b)?/.source);
				expect(regexGen(_.either('a', 'b').repeat()).source).to.equal(/(?:a|b)+/.source);
				expect(regexGen(_.either('a', 'b').multiple()).source).to.equal(/(?:a|b)*/.source);
				expect(regexGen(_.either('a', 'b').multiple(4, 5)).source).to.equal(/(?:a|b){4,5}/.source);
			});
			it('should generate group parentheses when there is lookaheads', function () {
				expect(regexGen(_.either('a', 'b').followedBy('c')).source).to.equal(/(?:a|b)(?=c)/.source);
				expect(regexGen(_.either('a', 'b').notFollowedBy('c')).source).to.equal(/(?:a|b)(?!c)/.source);
			});
			it('should generate group parentheses when there is quantifiers and lookaheads', function () {
				expect(regexGen(_.either('a', 'b').maybe().followedBy('c')).source).to.equal(/(?:a|b)?(?=c)/.source);
				expect(regexGen(_.either('a', 'b').repeat().followedBy('c')).source).to.equal(/(?:a|b)+(?=c)/.source);
				expect(regexGen(_.either('a', 'b').multiple().notFollowedBy('c')).source).to.equal(/(?:a|b)*(?!c)/.source);
			});
			it('should generate group parentheses when there is sibling', function () {
				expect(regexGen('#', _.either('a', 'b')).source).to.equal(/#(?:a|b)/.source);
				expect(regexGen(_.either('a', 'b'), 'c').source).to.equal(/(?:a|b)c/.source);
				expect(regexGen(_.either('a', 'b'), _.either('0', '1')).source).to.equal(/(?:a|b)(?:0|1)/.source);
				expect(regexGen(_.either('a', 'b').followedBy('c'), _.either('0', '1')).source).to.equal(/(?:a|b)(?=c)(?:0|1)/.source);
				expect(regexGen(_.either('a', 'b'), _.either('0', '1').notFollowedBy('@')).source).to.equal(/(?:a|b)(?:0|1)(?!@)/.source);
			});
		});
		describe('group', function () {
			it('should not generate group parentheses when redundant', function () {
				expect(regexGen(_.group()).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.group(_.group())).source).to.equal(emptyRegExp.source);
				expect(regexGen(_.group(_.maybe('a'))).source).to.equal(/a?/.source);
				expect(regexGen(_.group(_.either('a', 'b'))).source).to.equal(/a|b/.source);
			});
			it('should generate group parentheses when necessary', function () {
				expect(regexGen(_.group(_.maybe('ab'))).source).to.equal(/(?:ab)?/.source);
			});
		});
	});

	describe('Capturing and Back References', function () {
		it('reference by label', function () {
			expect(regexGen(_.startOfLine(), _.capture(_.label('protocol'), 'http', _.maybe('s')), '://', _.capture(_.label('path'), _.anything().multiple()), _.sameAs('path'), _.sameAs('protocol'), _.endOfLine()).source).to.equal(/^(https?):\/\/(.*)\2\1$/.source);
			expect(regexGen(_.startOfLine(), _.capture(_.label('protocol'), 'http', _.maybe('s')), '://', _.capture(_.label('path'), _.anything().multiple()), _.sameAs(2), _.sameAs(1), _.endOfLine()).source).to.equal(/^(https?):\/\/(.*)$/.source);
		});
		it('reference by index', function () {
			expect(regexGen(_.capture(_.startOfLine(), 'http', _.maybe('s')), '://', _.capture(_.anything().multiple()), _.sameAs(2), _.sameAs(1)).source).to.equal(/(^https?):\/\/(.*)\2\1/.source);
			expect(regexGen(_.capture(_.startOfLine(), 'http', _.maybe('s')), '://', _.capture(_.anything().multiple()), _.sameAs('path'), _.sameAs('protocol')).source).to.equal(/(^https?):\/\/(.*)/.source);
		});
		it('parts should be reusable even with captures', function () {
			var hh = _.hexDigital().repeat(2);
			var ip = _.capture(hh, _.group('.', hh).repeat(3)); // capture should not use named label when reusing
			var mac = _.capture(hh, _.group(':', hh).repeat(3));

			expect(regexGen(
				_.startOfLine(),
				'ip: ', ip,
				_.space().many(),
				'mac: ', mac,
				_.space().many(),
				_.capture(_.label('action'), _.words()),
				':', _.sameAs(1), ':', _.sameAs(2), ':', _.sameAs('action'),
				_.endOfLine()
			).source).to.equal(
				/^ip: ([0-9A-Fa-f]{2}(?:\.[0-9A-Fa-f]{2}){3})\s+mac: ([0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){3})\s+(\w+):\1:\2:\3$/.source
			);
		});
	});

	describe('Capture and Extract', function () {
		var sample = 'Conan: 8, Kudo: 17';

		it('extract() should return one json object with given capture names if searchAll() modifier is not given', function () {
			var regex = regexGen(
				_.capture(_.label('name'), _.words()),
				':', _.space().any(),
				_.capture(_.label('age'), _.digital().many())
			);
			var result = regex.extract(sample);

			expect(regex.source).to.equal(/(\w+):\s*(\d+)/.source);
			expect(result).to.eql({
				name: 'Conan',
				age: '8'
			});
		});
		it('extract() should return all matches if searchAll() modifier is given', function () {
			var regex = regexGen(
				_.capture(_.label('name'), _.words()),
				':', _.space().any(),
				_.capture(_.label('age'), _.digital().many()),
				_.searchAll()
			);
			var result = regex.extract(sample);

			expect(regex.source).to.equal(/(\w+):\s*(\d+)/g.source);
			expect(result).to.eql([{
				name: 'Conan',
				age: '8'
			}, {
				name: 'Kudo',
				age: '17'
			}]);
		});
	});

	describe('Capture and Replace', function () {
		it('replace() should takes a replacement template string with capture names of the ${name} form', function () {
			var regex = regexGen(
				_.capture(_.label('temp'),
					_.digital().many(),
					_.group('.', _.digital().many()).maybe()
				),
				'°F'
			);

			expect(regex.replace('The temp is 77.1°F.', '${temp} degrees in Fahrenheit')).to.equal('The temp is 77.1 degrees in Fahrenheit.');
		});
		it('replace() should takes a function that replaces the substring matched', function () {
			var regex = regexGen(
				_.capture(_.label('temp'),
					_.digital().many(),
					_.group('.', _.digital().many()).maybe()
				),
				'°',
				_.capture(_.label('sys'),
					_.either('C', 'F')
				)
			);

			function replacer(matches) {
				if (matches.sys === 'F') {
					return Math.round((matches.temp - 32) * 5 / 9) + '°C';
				}
				return Math.round((matches.temp * 9 / 5) + 32) + '°F';
			}

			expect(regex.replace('The temp is 77.1°F.', replacer)).to.equal('The temp is 25°C.');
			expect(regex.replace('The temp is 21°C.', replacer)).to.equal('The temp is 70°F.');
		});
	});

	describe('regex overwrites', function () {
		it('regex in regexGen', function () {
			var expected;

			expected = /<b>[^<]*(?:(?!<\/?b>)<[^<]*)*<\/b>/;
			expect(regexGen(/<b>[^<]*(?:(?!<\/?b>)<[^<]*)*<\/b>/).source).to.equal(expected.source);
			expect(regexGen(_.regex('<b>[^<]*(?:(?!<\\/?b>)<[^<]*)*<\\/b>')).source).to.equal(expected.source);
			// from example of Mastering Regular Expressions - Unrolling multi-character quotes (p.270)
			expect(regexGen(
				'<b>', // Match the opening <b>
				_.anyCharBut('<').any(), // Now match any "normal" . . .
				_.group( // Any amount of . . .
					_.text('<').notContains( //   match one "special"
						'<', _.maybe('/'), 'b>' //     if not at <b> or </b>,
					),
					_.anyCharBut('<').any() //   and then any amount of "normal"
				).any(),
				'</b>' // And finally the closing </b>
			).source).to.equal(expected.source);
		});
		it('regex in terms', function () {
			expect(regexGen(
				'width:',
				_.space().any(),
				_.capture(
					_.digital().multiple(1)
				),
				';'
			).source).to.equal(/width:\s*(\d+);/.source);
			expect(regexGen(
				_.text('width:').regex('height:'),
				_.space().multiple(),
				_.capture(
					_.digital().multiple(1).regex('[0-9]+')
				),
				';'
			).source).to.equal(/height:\s*([0-9]+);/.source);
		});
	});

	describe('Examples', function () {
		it('Simple Password Validation', function () {
			expect(regexGen(
				// Anchor: the beginning of the string
				_.startOfLine(),
				// Match: six to ten word characters
				_.word().multiple(6, 10)
				// Look ahead: anything, then a lower-case letter
				.contains(_.anything().reluctant(), _.anyCharOf(['a', 'z']))
				// Look ahead: anything, then an upper-case letter
				.contains(_.anything().reluctant(), _.anyCharOf(['A', 'Z']))
				// Look ahead: anything, then one digit
				.contains(_.anything().reluctant(), _.digital()),
				// Anchor: the end of the string
				_.endOfLine()
			).source).to.equal(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)\w{6,10}$/.source);
		});

		it('Matching an IP Address', function () {
			var d1 = _.group(_.anyCharOf('0', '1').maybe(), _.digital(), _.digital().maybe());
			var d2 = _.group('2', _.anyCharOf(['0', '4']), _.digital());
			var d3 = _.group('25', _.anyCharOf(['0', '5']));
			var d255 = _.capture(_.either(d1, d2, d3));

			expect(regexGen(
				_.startOfLine(),
				d255, '.', d255, '.', d255, '.', d255,
				_.endOfLine()
			).source).to.equal(
				/^([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])$/.source
			);
		});

		it('Matching Balanced Sets of Parentheses', function () {
			expect(regexGen(
				'(',
				_.anyCharBut('()').any(),
				_.group(
					'(',
					_.anyCharBut('()').any(),
					')',
					_.anyCharBut('()').any()
				).any(),
				')'
			).source).to.equal(
				/\([^()]*(?:\([^()]*\)[^()]*)*\)/.source
			);
		});

		it('Matching Balanced Sets of Parentheses within Any Given Levels of Depth', function () {
			var nestingParentheses = function (level) {
				if (level < 0) {
					return '';
				}
				if (level === 0) {
					return _.anyCharBut('()').any();
				}
				return _.either(
					_.anyCharBut('()'),
					_.group(
						'(',
						nestingParentheses(level - 1),
						')'
					)
				).any();
			};

			expect(regexGen(
				'(', nestingParentheses(1), ')'
			).source).to.equal(
				/\((?:[^()]|\([^()]*\))*\)/.source
			);

			expect(regexGen(
				'(', nestingParentheses(3), ')'
			).source).to.equal(
				/\((?:[^()]|\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))*\)/.source
			);
		});

		it('Matching an HTML Tag', function () {
			expect(regexGen(
				'<',
				_.either(
					_.group('"', _.anyCharBut('"').any(), '"'),
					_.group("'", _.anyCharBut("'").any(), "'"), // jshint ignore:line
					_.group(_.anyCharBut('"', "'", '>')) // jshint ignore:line
				).any(),
				'>'
			).source).to.equal(/<(?:"[^"]*"|'[^']*'|[^"'>])*>/.source);
		});

		it('Matching an HTML Link', function () {
			expect(regexGen(
				'<a',
				_.wordBoundary(),
				_.capture(
					_.anyCharBut('>').many()
				),
				'>',
				_.capture(
					_.label('Link'),
					_.anything().lazy()
				),
				'</a>',
				_.ignoreCase(),
				_.searchAll()
			).source).to.equal(
				/<a\b([^>]+)>(.*?)<\/a>/gi.source
			);
			expect(regexGen(
				_.wordBoundary(),
				'href',
				_.space().any(), '=', _.space().any(),
				_.either(
					_.group('"', _.capture(_.anyCharBut('"').any()), '"'),
					_.group("'", _.capture(_.anyCharBut("'").any()), "'"), // jshint ignore:line
					_.capture(_.anyCharBut("'", '"', '>', _.space()).many()) // jshint ignore:line
				),
				_.ignoreCase()
			).source).to.equal(
				/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i.source
			);
		});

		it('Examining an HTTP URL', function () {
			expect(regexGen(
				_.startOfLine(),
				'http', _.maybe('s'), '://',
				_.capture(_.anyCharBut('/:').many()),
				_.group(':', _.capture(_.digital().many())).maybe(),
				_.capture('/', _.anything()).maybe(),
				_.endOfLine()
			).source).to.equal(
				/^https?:\/\/([^/:]+)(?::(\d+))?(\/.*)?$/.source
			);
		});

		it('Validating a Hostname', function () {
			expect(regexGen(
				_.startOfLine(),
				// One or more dot-separated parts . . .
				_.either(
					_.group(
						_.anyCharOf(['a', 'z'], ['0', '9']),
						'.'
					),
					_.group(
						_.anyCharOf(['a', 'z'], ['0', '9']),
						_.anyCharOf('-', ['a', 'z'], ['0', '9']).multiple(0, 61),
						_.anyCharOf(['a', 'z'], ['0', '9']),
						'.'
					)
				).any(),
				// Followed by the final suffix part . . .
				_.either(
					'com', 'edu', 'gov', 'int', 'mil', 'net', 'org', 'biz', 'info', 'name', 'museum', 'coop', 'aero',
					_.group(_.anyCharOf(['a', 'z']), _.anyCharOf(['a', 'z']))
				),
				_.endOfLine()
			).source).to.equal(
				/^(?:[a-z0-9]\.|[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\.)*(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|coop|aero|[a-z][a-z])$/.source
			);
		});

		it('Parsing CSV Files', function () {
			expect(regexGen(
				_.either(_.startOfLine(), ','),
				_.either(
					// Either a double-quoted field (with "" for each ")
					_.group(
						// double-quoted field's opening quote
						'"',
						_.capture(
							_.anyCharBut('"').any(),
							_.group(
								'""',
								_.anyCharBut('"').any()
							).any()
						),
						// double-quoted field's closing quote
						'"'
					),
					// Or some non-quote/non-comma text....
					_.capture(
						_.anyCharBut('",').any()
					)
				)
			).source).to.equal(
				/(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/.source
			);
		});
	});
});
