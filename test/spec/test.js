/* jshint strict: false, -W085 */
/* global describe, it, expect */
/* global regexGen,
        ignoreCase, searchAll, searchMultiLine,
        startOfLine, endOfLine, wordBoundary, nonWordBoundary,
        text, maybe,
        anyChar, anyCharOf, anyCharBut, ascii, unicode, nullChar, controlChar,
        backspace, formFeed, lineFeed, carriageReturn, lineBreak, space, nonSpace, tab, vertTab,
        digital, nonDigital, hexDigital, word, words, nonWord, anything, regex,
        either, group, capture, label, sameAs */

// about jshint -W085:
// Unexpected 'with'
// http://jslinterrors.com/unexpected-with

(function () {

    describe('regexGen.js - The JavaScript Regular Expression Generator', function () {

        // note that an empty literal RegExp object is //, that is exactly a comment!
        var emptyRegExp = new RegExp('');

        describe('The regexGen() function', function () {
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
                regexGen.mixin( window );
                expect(text).to.equal(regexGen.text);
            });
        });

        describe('Modifiers', function () {
            with ( regexGen ) {
                it('ignoreCase', function () {
                    expect(regexGen(ignoreCase()).toString()).to.equal(/(?:)/i.toString());
                });
                it('searchAll', function () {
                    expect(regexGen(searchAll()).toString()).to.equal(/(?:)/g.toString());
                });
                it('searchMultiLine', function () {
                    expect(regexGen(searchMultiLine()).toString()).to.equal(/(?:)/m.toString());
                });
                it('all modifiers', function () {
                    expect(regexGen(searchAll(),ignoreCase(),searchMultiLine()).toString()).to.equal(/(?:)/gim.toString());
                });
                it('duplicated modifiers', function () {
                    expect(regexGen(searchAll(),searchAll(),searchAll(),ignoreCase(),ignoreCase(),searchMultiLine(),searchMultiLine()).toString()).to.equal(/(?:)/gim.toString());
                });
            }
        });

        describe('Boundaries', function () {
            with ( regexGen ) {
                it('startOfLine', function () {
                    expect(regexGen(startOfLine(), '^').source).to.equal(/^\^/.source);
                });
                it('endOfLine', function () {
                    expect(regexGen('$',endOfLine()).source).to.equal(/\$$/.source);
                });
                it('wordBoundary', function () {
                    expect(regexGen(wordBoundary(), 'ness').source).to.equal(/\bness/.source);
                    expect(regexGen('ness', wordBoundary()).source).to.equal(/ness\b/.source);
                });
                it('nonWordBoundary', function () {
                    expect(regexGen(nonWordBoundary(), 'oo').source).to.equal(/\Boo/.source);
                    expect(regexGen('y', nonWordBoundary()).source).to.equal(/y\B/.source);
                });
            }
        });

        describe('Character Sequence', function () {
            with ( regexGen ) {
                describe('text', function () {
                    it('should accept both string literal and text() function', function () {
                        expect(regexGen('a', text('a')).source).to.equal(/aa/.source);
                    });
                    it('should not generate group parentheses', function () {
                        expect(regexGen('a').source).to.equal(/a/.source);
                        expect(regexGen(text('a')).source).to.equal(/a/.source);
                        expect(regexGen('ab').source).to.equal(/ab/.source);
                        expect(regexGen(text('ab')).source).to.equal(/ab/.source);
                        expect(regexGen(text('ab'), 'c').source).to.equal(/abc/.source);
                    });
                    it('should escape special characters', function () {
                        expect(regexGen('.*+?^=!:${}()|[]/\\').source).to.equal(/\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\/.source);
                        expect(regexGen(text('.*+?^=!:${}()|[]/\\')).source).to.equal(/\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\/.source);
                    });
                });
            }
        });

        describe('Character Classes', function () {
            with ( regexGen ) {
                describe('anyCharOf', function () {
                    it('should place or escape hyphen and circumflex smartly', function () {
                        expect(regexGen(anyCharOf('^-')).source).to.equal(/[-^]/.source);
                        expect(regexGen(anyCharOf('^')).source).to.equal(/[\^]/.source);
                        expect(regexGen(anyCharOf('-')).source).to.equal(/[-]/.source);
                    });
                    it('should accept any character sequence', function () {
                        expect(regexGen(anyCharOf('abc')).source).to.equal(/[abc]/.source);
                        expect(regexGen(anyCharOf('~!@#$%^&*()-+{}[]<>,./;:|\\')).source).to.equal(/[-~!@#$%&*()+{}[\]<>,./;:|\\^]/.source);
                        expect(regexGen(anyCharOf("''", '""')).source).to.equal(/[''""]/.source);   // jshint ignore:line
                    });
                    it('should accept square brackets with exact 2 elements as ranged character sequence', function () {
                        expect(regexGen(anyCharOf(['0','9'],['a','f'])).source).to.equal(/[0-9a-f]/.source);
                        expect(regexGen(anyCharOf([0,9],['a','f'])).source).to.equal(/[0-9a-f]/.source);
                        expect(regexGen(anyCharOf([10,9],['a','f'])).source).to.equal(/[a-f]/.source);
                        expect(regexGen(anyCharOf(['0','9'], ['a'], ['a','f','m','n'])).source).to.equal(/[0-9]/.source);
                    });
                    it('should escape (only) "\\", "]" characters', function () {
                        expect(regexGen(anyCharOf('^+-*/\\=%[]()')).source).to.equal(/[-+*/\\=%[\]()^]/.source);
                    });
                    it('should accept nested character classes', function () {
                        expect(regexGen(anyCharOf(
                            anyCharOf( [ 'a', 'z' ] ),
                            backspace(),
                            hexDigital()
                        )).source).to.equal(/[a-z\b0-9A-Fa-f]/.source);
                    });
                });

                describe('anyCharBut', function () {
                    it('should place or escape hyphen and circumflex smartly', function () {
                        expect(regexGen(anyCharBut('^-')).source).to.equal(/[^-^]/.source);
                        expect(regexGen(anyCharBut('^')).source).to.equal(/[^^]/.source);
                        expect(regexGen(anyCharBut('-')).source).to.equal(/[^-]/.source);
                    });
                    it('should accept any character sequence', function () {
                        expect(regexGen(anyCharBut('abc')).source).to.equal(/[^abc]/.source);
                    });
                    it('should accept square brackets with exact 2 elements as ranged character sequence', function () {
                        expect(regexGen(anyCharBut(['0','9'],['a','f'])).source).to.equal(/[^0-9a-f]/.source);
                        expect(regexGen(anyCharBut([0,9],['a','f'])).source).to.equal(/[^0-9a-f]/.source);
                        expect(regexGen(anyCharBut([10,9],['a','f'])).source).to.equal(/[^a-f]/.source);
                        expect(regexGen(anyCharBut(['0','9'], ['a'], ['a','f','m','n'])).source).to.equal(/[^0-9]/.source);
                    });
                    it('should escape (only) "\\", "]" characters', function () {
                        expect(regexGen(anyCharBut('^+-*/\\=%[]()')).source).to.equal(/[^-+*/\\=%[\]()^]/.source);
                    });
                    it('should accept nested character classes', function () {
                        expect(regexGen(anyCharBut(
                            anyCharOf( [ 'a', 'z' ] ),
                            backspace(),
                            hexDigital()
                        )).source).to.equal(/[^a-z\b0-9A-Fa-f]/.source);
                    });
                });

                describe('anyChar', function () {
                    it('should generate a single dot character', function () {
                        expect(regexGen(anyChar()).source).to.equal(/./.source);
                    });
                });

                describe('ascii', function () {
                    it('should accept 2 characters hex digital or any number <= 0xFF', function () {
                        expect(regexGen(ascii('00')).source).to.equal(/\x00/.source);
                        expect(regexGen(ascii('99', '22')).source).to.equal(/\x99\x22/.source);
                        expect(regexGen(ascii(99,22,0x99,0x22)).source).to.equal(/\x63\x16\x99\x22/.source);
                    });
                    it('should not accept anything else', function () {
                        expect(regexGen(ascii()).source).to.equal(emptyRegExp.source);
                        expect(regexGen(ascii('1')).source).to.equal(emptyRegExp.source);
                        expect(regexGen(ascii('001')).source).to.equal(emptyRegExp.source);
                    });
                });

                describe('unicode', function () {
                    it('should accept 4 characters hex digital or any number <= 0xFFFF', function () {
                        expect(regexGen(unicode('0000')).source).to.equal(/\u0000/.source);
                        expect(regexGen(unicode('9999')).source).to.equal(/\u9999/.source);
                        expect(regexGen(unicode(0,9999,0x9999)).source).to.equal(/\u0000\u270f\u9999/.source);
                    });
                    it('should not accept anything else', function () {
                        expect(regexGen(unicode()).source).to.equal(emptyRegExp.source);
                        expect(regexGen(unicode('001')).source).to.equal(emptyRegExp.source);
                        expect(regexGen(unicode('00001')).source).to.equal(emptyRegExp.source);
                        expect(regexGen(unicode(0x10000)).source).to.equal(emptyRegExp.source);
                    });
                });

                describe('nullChar', function () {
                    it('should generate a single null character escape', function () {
                        expect(regexGen(nullChar()).source).to.equal(/\0/.source);
                    });
                });

                describe('controlChar', function () {
                    it('should accept a character between A-Z or a-z', function () {
                        expect(regexGen(controlChar('Z')).source).to.equal(/\cZ/.source);
                        expect(regexGen(controlChar('c')).source).to.equal(/\cc/.source);
                    });
                    it('should not accept anything else', function () {
                        expect(regexGen(controlChar()).source).to.equal(emptyRegExp.source);
                        expect(regexGen(controlChar(72)).source).to.equal(emptyRegExp.source);
                        expect(regexGen(controlChar('ZZ')).source).to.equal(emptyRegExp.source);
                    });
                });

                describe('backspace', function () {
                    it('should generate a single backspace character escape', function () {
                        expect(regexGen(backspace()).source).to.equal(/[\b]/.source);
                    });
                });

                describe('formFeed', function () {
                    it('should generate a single form feed character escape', function () {
                        expect(regexGen(formFeed()).source).to.equal(/\f/.source);
                    });
                });

                describe('lineFeed', function () {
                    it('should generate a single line feed character escape', function () {
                        expect(regexGen(lineFeed()).source).to.equal(/\n/.source);
                    });
                });

                describe('carriageReturn', function () {
                    it('should generate a single carriage return character escape', function () {
                        expect(regexGen(carriageReturn()).source).to.equal(/\r/.source);
                    });
                });

                describe('space', function () {
                    it('should generate a single space character escape', function () {
                        expect(regexGen(space()).source).to.equal(/\s/.source);
                    });
                });

                describe('nonSpace', function () {
                    it('should generate a single non-space character escape', function () {
                        expect(regexGen(nonSpace()).source).to.equal(/\S/.source);
                    });
                });

                describe('tab', function () {
                    it('should generate a single tab character escape', function () {
                        expect(regexGen(tab()).source).to.equal(/\t/.source);
                    });
                });

                describe('vertTab', function () {
                    it('should generate a single vertical tab character escape', function () {
                        expect(regexGen(vertTab()).source).to.equal(/\v/.source);
                    });
                });

                describe('digital', function () {
                    it('should generate a single digital character escape', function () {
                        expect(regexGen(digital()).source).to.equal(/\d/.source);
                    });
                });

                describe('nonDigital', function () {
                    it('should generate a single non-digital character escape', function () {
                        expect(regexGen(nonDigital()).source).to.equal(/\D/.source);
                    });
                });

                describe('word', function () {
                    it('should generate a single word character escape', function () {
                        expect(regexGen(word()).source).to.equal(/\w/.source);
                    });
                });

                describe('nonWord', function () {
                    it('should generate a single non-word character escape', function () {
                        expect(regexGen(nonWord()).source).to.equal(/\W/.source);
                    });
                });

                describe('anything', function () {
                    it('should generate a single dot character with zero to many multiple', function () {
                        expect(regexGen(anything()).source).to.equal(/.*/.source);
                    });
                });

                describe('hexDigital', function () {
                    it('should generate a character sets for hex digital', function () {
                        expect(regexGen(hexDigital()).source).to.equal(/[0-9A-Fa-f]/.source);
                    });
                });

                describe('lineBreak', function () {
                    it('should generate all type of line break character escapes', function () {
                        expect(regexGen(lineBreak()).source).to.equal(/\r\n|\r|\n/.source);
                    });
                });

                describe('words', function () {
                    it('should generate a single word character escape with one to many multiple', function () {
                        expect(regexGen(words()).source).to.equal(/\w+/.source);
                    });
                });
            }
        });

        describe('Quantifiers and Lookaheads', function () {
            with ( regexGen ) {
                describe('any', function () {
                    it('should not generate group parentheses if there is only one single character', function () {
                        expect(regexGen(any('a')).source).to.equal(/a*/.source);
                    });
                    it('should generate group parentheses if there is more than one character', function () {
                        expect(regexGen(any('ab')).source).to.equal(/(?:ab)*/.source);
                    });
                    it('should escape special characters (just as the text() function)', function () {
                        expect(regexGen(any('.*+?^=!:${}()|[]/\\')).source).to.equal(/(?:\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\)*/.source);
                    });
                });

                describe('many', function () {
                    it('should not generate group parentheses if there is only one single character', function () {
                        expect(regexGen(many('a')).source).to.equal(/a+/.source);
                    });
                    it('should generate group parentheses if there is more than one character', function () {
                        expect(regexGen(many('ab')).source).to.equal(/(?:ab)+/.source);
                    });
                    it('should escape special characters (just as the text() function)', function () {
                        expect(regexGen(many('.*+?^=!:${}()|[]/\\')).source).to.equal(/(?:\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\)+/.source);
                    });
                });

                describe('maybe', function () {
                    it('should not generate group parentheses if there is only one single character', function () {
                        expect(regexGen(maybe('a')).source).to.equal(/a?/.source);
                    });
                    it('should generate group parentheses if there is more than one character', function () {
                        expect(regexGen(maybe('ab')).source).to.equal(/(?:ab)?/.source);
                    });
                    it('should escape special characters (just as the text() function)', function () {
                        expect(regexGen(maybe('.*+?^=!:${}()|[]/\\')).source).to.equal(/(?:\.\*\+\?\^=!:\$\{}\(\)\|\[]\/\\)?/.source);
                    });
                });

                describe('text', function () {
                    it('should support all kind of quantifiers', function () {
                        expect(regexGen(text('ab').any()).source).to.equal(/(?:ab)*/.source);
                        expect(regexGen(text('ab').many()).source).to.equal(/(?:ab)+/.source);
                        expect(regexGen(text('ab').maybe()).source).to.equal(/(?:ab)?/.source);
                        expect(regexGen(text('ab').repeat()).source).to.equal(/(?:ab)+/.source);
                        expect(regexGen(text('ab').repeat(5)).source).to.equal(/(?:ab){5}/.source);
                        expect(regexGen(text('ab').multiple()).source).to.equal(/(?:ab)*/.source);
                        expect(regexGen(text('ab').multiple(1)).source).to.equal(/(?:ab)+/.source);
                        expect(regexGen(text('ab').multiple(0,1)).source).to.equal(/(?:ab)?/.source);
                        expect(regexGen(text('ab').multiple(5)).source).to.equal(/(?:ab){5,}/.source);
                        expect(regexGen(text('ab').multiple(5,9)).source).to.equal(/(?:ab){5,9}/.source);
                    });
                    it('should not generate quantifier modifier if there is no quantifier', function () {
                        expect(regexGen(text('ab').repeat().lazy()).source).to.equal(/(?:ab)+?/.source);
                        expect(regexGen(text('ab').lazy()).source).to.equal(/ab/.source);
                    });
                    it('(single character) should not generates group parentheses even when there is quantifiers', function () {
                        expect(regexGen(text('a').repeat()).source).to.equal(/a+/.source);
                        expect(regexGen(text('a').repeat(1)).source).to.equal(/a{1}/.source);
                        expect(regexGen(text('a').multiple(0)).source).to.equal(/a*/.source);
                        expect(regexGen(text('a').multiple(1)).source).to.equal(/a+/.source);
                        expect(regexGen(text('a').multiple(2,3)).source).to.equal(/a{2,3}/.source);
                    });
                    it('(single character) should not generates group parentheses even when there is lookaheads', function () {
                        expect(regexGen(anything().contains(anything().lazy(),'c')).source).to.equal(/(?=.*?c).*/.source);
                        expect(regexGen(anything().notContains(anything().lazy(),'c')).source).to.equal(/(?!.*?c).*/.source);
                        expect(regexGen(text('a').followedBy('c')).source).to.equal(/a(?=c)/.source);
                        expect(regexGen(text('a').notFollowedBy('c')).source).to.equal(/a(?!c)/.source);
                    });
                    it('(multiple characters) should generates group parentheses when there is quantifiers', function () {
                        expect(regexGen(text('ab').repeat()).source).to.equal(/(?:ab)+/.source);
                        expect(regexGen(text('ab').repeat(1)).source).to.equal(/(?:ab){1}/.source);
                        expect(regexGen(text('ab').multiple(0)).source).to.equal(/(?:ab)*/.source);
                        expect(regexGen(text('ab').multiple(1)).source).to.equal(/(?:ab)+/.source);
                        expect(regexGen(text('ab').multiple(2,3)).source).to.equal(/(?:ab){2,3}/.source);
                    });
                    // TODO
                    it('(multiple characters) should not generates group parentheses even when there is lookaheads', function () {
                        expect(regexGen(text('ab').contains(anything().lazy(),'c')).source).to.equal(/(?=.*?c)ab/.source);
                        expect(regexGen(text('ab').notContains(anything().lazy(),'c')).source).to.equal(/(?!.*?c)ab/.source);
                        expect(regexGen(text('ab').followedBy('c')).source).to.equal(/ab(?=c)/.source);
                        expect(regexGen(text('ab').notFollowedBy('c')).source).to.equal(/ab(?!c)/.source);
                    });
                    it('(multiple characters) should generates group parentheses when there is quantifiers and lookaheads', function () {
                        expect(regexGen(text('ab').repeat().contains('c')).source).to.equal(/(?=c)(?:ab)+/.source);
                        expect(regexGen(text('ab').repeat(2).contains('c')).source).to.equal(/(?=c)(?:ab){2}/.source);
                        expect(regexGen(text('ab').multiple(0).contains('c')).source).to.equal(/(?=c)(?:ab)*/.source);
                        expect(regexGen(text('ab').multiple(1).contains('c')).source).to.equal(/(?=c)(?:ab)+/.source);
                        expect(regexGen(text('ab').multiple(2,3).contains('c')).source).to.equal(/(?=c)(?:ab){2,3}/.source);
                        expect(regexGen(text('ab').repeat().notContains('c')).source).to.equal(/(?!c)(?:ab)+/.source);
                        expect(regexGen(text('ab').repeat(2).notContains('c')).source).to.equal(/(?!c)(?:ab){2}/.source);
                        expect(regexGen(text('ab').multiple(0).notContains('c')).source).to.equal(/(?!c)(?:ab)*/.source);
                        expect(regexGen(text('ab').multiple(1).notContains('c')).source).to.equal(/(?!c)(?:ab)+/.source);
                        expect(regexGen(text('ab').multiple(2,3).notContains('c')).source).to.equal(/(?!c)(?:ab){2,3}/.source);

                        expect(regexGen(text('ab').repeat().followedBy('c')).source).to.equal(/(?:ab)+(?=c)/.source);
                        expect(regexGen(text('ab').repeat(2).followedBy('c')).source).to.equal(/(?:ab){2}(?=c)/.source);
                        expect(regexGen(text('ab').multiple(0).followedBy('c')).source).to.equal(/(?:ab)*(?=c)/.source);
                        expect(regexGen(text('ab').multiple(1).followedBy('c')).source).to.equal(/(?:ab)+(?=c)/.source);
                        expect(regexGen(text('ab').multiple(2,3).followedBy('c')).source).to.equal(/(?:ab){2,3}(?=c)/.source);
                        expect(regexGen(text('ab').repeat().notFollowedBy('c')).source).to.equal(/(?:ab)+(?!c)/.source);
                        expect(regexGen(text('ab').repeat(2).notFollowedBy('c')).source).to.equal(/(?:ab){2}(?!c)/.source);
                        expect(regexGen(text('ab').multiple(0).notFollowedBy('c')).source).to.equal(/(?:ab)*(?!c)/.source);
                        expect(regexGen(text('ab').multiple(1).notFollowedBy('c')).source).to.equal(/(?:ab)+(?!c)/.source);
                        expect(regexGen(text('ab').multiple(2,3).notFollowedBy('c')).source).to.equal(/(?:ab){2,3}(?!c)/.source);
                    });
                });
            }
        });

        describe('Grouping', function () {
            describe('either', function () {
                with ( regexGen ) {
                    it('should generate no group parentheses when is the only term', function () {
                        expect(regexGen(either('a', 'b')).source).to.equal(/a|b/.source);
                        expect(regexGen(either(text('a').repeat().followedBy('c'), maybe('b'), anyCharOf(['0','9'],['a','f']))).source).to.equal(/a+(?=c)|b?|[0-9a-f]/.source);
                    });
                    it('should generate group parentheses when there is quantifiers', function () {
                        expect(regexGen(either('a', 'b').maybe()).source).to.equal(/(?:a|b)?/.source);
                        expect(regexGen(either('a', 'b').repeat()).source).to.equal(/(?:a|b)+/.source);
                        expect(regexGen(either('a', 'b').multiple()).source).to.equal(/(?:a|b)*/.source);
                        expect(regexGen(either('a', 'b').multiple(4,5)).source).to.equal(/(?:a|b){4,5}/.source);
                    });
                    it('should generate group parentheses when there is lookaheads', function () {
                        expect(regexGen(either('a', 'b').followedBy('c')).source).to.equal(/(?:a|b)(?=c)/.source);
                        expect(regexGen(either('a', 'b').notFollowedBy('c')).source).to.equal(/(?:a|b)(?!c)/.source);
                    });
                    it('should generate group parentheses when there is quantifiers and lookaheads', function () {
                        expect(regexGen(either('a', 'b').maybe().followedBy('c')).source).to.equal(/(?:a|b)?(?=c)/.source);
                        expect(regexGen(either('a', 'b').repeat().followedBy('c')).source).to.equal(/(?:a|b)+(?=c)/.source);
                        expect(regexGen(either('a', 'b').multiple().notFollowedBy('c')).source).to.equal(/(?:a|b)*(?!c)/.source);
                    });
                    it('should generate group parentheses when there is sibling', function () {
                        expect(regexGen('#', either('a', 'b')).source).to.equal(/#(?:a|b)/.source);
                        expect(regexGen(either('a', 'b'), 'c').source).to.equal(/(?:a|b)c/.source);
                        expect(regexGen(either('a', 'b'), either('0', '1')).source).to.equal(/(?:a|b)(?:0|1)/.source);
                        expect(regexGen(either('a', 'b').followedBy('c'), either('0', '1')).source).to.equal(/(?:a|b)(?=c)(?:0|1)/.source);
                        expect(regexGen(either('a', 'b'), either('0', '1').notFollowedBy('@')).source).to.equal(/(?:a|b)(?:0|1)(?!@)/.source);
                    });
                }
            });
            describe('group', function () {
                with ( regexGen ) {
                    it('should not generate group parentheses when redundant', function () {
                        expect(regexGen(group()).source).to.equal(emptyRegExp.source);
                        expect(regexGen(group(group())).source).to.equal(emptyRegExp.source);
                        expect(regexGen(group(maybe('a'))).source).to.equal(/a?/.source);
                        expect(regexGen(group(either('a', 'b'))).source).to.equal(/a|b/.source);
                    });
                    it('should generate group parentheses when necessary', function () {
                        expect(regexGen(group(maybe('ab'))).source).to.equal(/(?:ab)?/.source);
                    });
                }
            });
        });

        describe('Capturing and back references', function () {
            with ( regexGen ) {
                it('reference by label', function () {
                    expect(regexGen(startOfLine(), capture(label('protocol'), 'http', maybe('s')), '://', capture(label('path'), anything().multiple()), sameAs('path'), sameAs('protocol'), endOfLine()).source).to.equal(/^(https?):\/\/(.*)\2\1$/.source);
                    expect(regexGen(startOfLine(), capture(label('protocol'), 'http', maybe('s')), '://', capture(label('path'), anything().multiple()), sameAs(2), sameAs(1), endOfLine()).source).to.equal(/^(https?):\/\/(.*)$/.source);
                });
                it('reference by index', function () {
                    expect(regexGen(capture(startOfLine(), 'http', maybe('s')), '://', capture(anything().multiple()), sameAs(2), sameAs(1)).source).to.equal(/(^https?):\/\/(.*)\2\1/.source);
                    expect(regexGen(capture(startOfLine(), 'http', maybe('s')), '://', capture(anything().multiple()), sameAs('path'), sameAs('protocol')).source).to.equal(/(^https?):\/\/(.*)/.source);
                });
                it('parts should be reusable even with captures', function () {
                    var hh = hexDigital().repeat( 2 );
                    var ip = capture( hh, group( '.', hh ).repeat( 3 ) );  // capture should not use named label when reusing
                    var mac = capture( hh, group( ':', hh ).repeat( 3 ) );
                    expect(regexGen(
                        startOfLine(),
                        'ip: ', ip,
                        space().many(),
                        'mac: ', mac,
                        space().many(),
                        capture( label( 'action' ), words() ),
                        ':', sameAs(1), ':', sameAs(2), ':', sameAs('action'),
                        endOfLine()
                    ).source).to.equal(
                        /^ip: ([0-9A-Fa-f]{2}(?:\.[0-9A-Fa-f]{2}){3})\s+mac: ([0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){3})\s+(\w+):\1:\2:\3$/.source
                    );
                });
            }
        });

        describe('Capture and extract', function () {
            with ( regexGen ) {
                var sample = 'Conan: 8, Kudo: 17';
                it('extract() should return one json object with given capture names', function () {
                    var regex = regexGen(
                        capture(label('name'), words()),
                        ':', space().any(),
                        capture(label('age'), digital().many())
                        );
                    var result = regex.extract(sample);
                    expect(regex.source).to.equal(/(\w+):\s*(\d+)/.source);
                    expect(result).to.eql({
                        '0': 'Conan: 8',
                        name: 'Conan',
                        age: '8'
                    });
                });
                it('extractAll() should return only one json object if searchAll() modifier is not given', function () {
                    var regex = regexGen(
                        capture(label('name'), words()),
                        ':', space().any(),
                        capture(label('age'), digital().many())
                        );
                    var result = regex.extractAll(sample);
                    expect(regex.source).to.equal(/(\w+):\s*(\d+)/.source);
                    expect(result).to.eql([{
                        '0': 'Conan: 8',
                        name: 'Conan',
                        age: '8'
                    }]);
                });
                it('extractAll() should return all matches if searchAll() modifier is given', function () {
                    var regex = regexGen(
                        capture(label('name'), words()),
                        ':', space().any(),
                        capture(label('age'), digital().many()),
                        searchAll()
                    );
                    var result = regex.extractAll(sample);
                    expect(regex.source).to.equal(/(\w+):\s*(\d+)/g.source);
                    expect(result).to.eql([{
                        '0': 'Conan: 8',
                        name: 'Conan',
                        age: '8'
                    }, {
                        '0': 'Kudo: 17',
                        name: 'Kudo',
                        age: '17'
                    }]);
                });
            }
        });

        describe('regex overwrites', function () {
            with ( regexGen ) {
                it('regex in regexGen', function () {
                    var expected = /<b>[^<]*(?:(?!<\/?b>)<[^<]*)*<\/b>/;
                    expect(regexGen(/<b>[^<]*(?:(?!<\/?b>)<[^<]*)*<\/b>/).source).to.equal(expected.source);
                    expect(regexGen(regex('<b>[^<]*(?:(?!<\\/?b>)<[^<]*)*<\\/b>')).source).to.equal(expected.source);
                    // from example of Mastering Regular Expressions - Unrolling multi-character quotes (p.270)
                    expect(regexGen(
                        '<b>',                          // Match the opening <b>
                        anyCharBut( '<' ).any(),        // Now match any "normal" . . .
                        group(                          // Any amount of . . .
                            text( '<' ).notContains(    //   match one "special"
                                '<', maybe('/'), 'b>'   //     if not at <b> or </b>,
                            ),
                            anyCharBut( '<' ).any()     //   and then any amount of "normal"
                        ).any(),
                        '</b>'                          // And finally the closing </b>
                    ).source).to.equal(expected.source);
                });
                it('regex in terms', function () {
                    expect(regexGen(
                        'width:',
                        space().any(),
                        capture(
                            digital().multiple(1)
                        ),
                        ';'
                    ).source).to.equal(/width:\s*(\d+);/.source);
                    expect(regexGen(
                        text('width:').regex('height:'),
                        space().multiple(),
                        capture(
                            digital().multiple(1).regex('[0-9]+')
                        ),
                        ';'
                    ).source).to.equal(/height:\s*([0-9]+);/.source);
                });
            }
        });

        describe('Examples', function() {
            it('Simple Password Validation', function () {
                with ( regexGen ) {
                    expect(regexGen(
                        // Anchor: the beginning of the string
                        startOfLine(),
                        // Match: six to ten word characters
                        word().multiple(6,10).
                            // Look ahead: anything, then a lower-case letter
                            contains( anything().reluctant(), anyCharOf(['a','z']) ).
                            // Look ahead: anything, then an upper-case letter
                            contains( anything().reluctant(), anyCharOf(['A','Z']) ).
                            // Look ahead: anything, then one digit
                            contains( anything().reluctant(), digital() ),
                        // Anchor: the end of the string
                        endOfLine()
                    ).source).to.equal(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)\w{6,10}$/.source);
                }
            });

            it('Matching an IP Address', function() {
                with ( regexGen ) {
                    var d1 = group( anyCharOf( '0', '1' ).maybe(), digital(), digital().maybe() );
                    var d2 = group( '2', anyCharOf( ['0', '4'] ), digital() );
                    var d3 = group( '25', anyCharOf( ['0', '5'] ) );
                    var d255 = capture( either( d1, d2, d3 ) );
                    expect(regexGen(
                        startOfLine(),
                        d255, '.', d255, '.', d255, '.', d255,
                        endOfLine()
                    ).source).to.equal(
                        /^([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])$/.source
                    );
                }
            });

            it('Matching Balanced Sets of Parentheses', function() {
                with ( regexGen ) {
                    expect(regexGen(
                        '(',
                        anyCharBut( '()' ).any(),
                        group(
                            '(',
                            anyCharBut( '()' ).any(),
                            ')',
                            anyCharBut( '()' ).any()
                        ).any(),
                        ')'
                    ).source).to.equal(
                        /\([^()]*(?:\([^()]*\)[^()]*)*\)/.source
                    );
                }
            });

            it('Matching Balanced Sets of Parentheses within Any Given Levels of Depth', function() {
                with ( regexGen ) {
                    var nestingParentheses = function( level ) {
                        if ( level < 0 ) {
                            return '';
                        }
                        if ( level === 0 ) {
                            return anyCharBut( '()' ).any();
                        }
                        return either(
                                anyCharBut( '()' ),
                                group(
                                    '(',
                                    nestingParentheses( level - 1 ),
                                    ')'
                                )
                            ).any();
                    };

                    expect(regexGen(
                        '(', nestingParentheses( 1 ), ')'
                    ).source).to.equal(
                        /\((?:[^()]|\([^()]*\))*\)/.source
                    );

                    expect(regexGen(
                        '(', nestingParentheses( 3 ), ')'
                    ).source).to.equal(
                        /\((?:[^()]|\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))*\)/.source
                    );
                }
            });

            it('Matching an HTML Tag', function() {
                with( regexGen ) {
                    expect(regexGen(
                        '<',
                        either(
                            group( '"', anyCharBut('"').any(), '"' ),
                            group( "'", anyCharBut("'").any(), "'" ),   // jshint ignore:line
                            group( anyCharBut( '"', "'", '>' ) )        // jshint ignore:line
                        ).any(),
                        '>'
                    ).source).to.equal( /<(?:"[^"]*"|'[^']*'|[^"'>])*>/.source );
                }
            });


            it('Matching an HTML Link', function() {
                with ( regexGen ) {
                    expect(regexGen(
                        '<a',
                        wordBoundary(),
                        capture(
                            anyCharBut( '>' ).many()
                        ),
                        '>',
                        capture(
                            label( 'Link' ),
                            anything().lazy()
                        ),
                        '</a>',
                        ignoreCase(),
                        searchAll()
                    ).source).to.equal(
                        /<a\b([^>]+)>(.*?)<\/a>/gi.source
                    );
                    expect(regexGen(
                        wordBoundary(),
                        'href',
                        space().any(), '=', space().any(),
                        either(
                            group( '"', capture( anyCharBut( '"' ).any() ), '"' ),
                            group( "'", capture( anyCharBut( "'" ).any() ), "'" ),  // jshint ignore:line
                            capture( anyCharBut( "'", '"', '>', space() ).many() )  // jshint ignore:line
                        ),
                        ignoreCase()
                    ).source).to.equal(
                        /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^'">\s]+))/i.source
                    );
                }
            });

            it('Examining an HTTP URL', function() {
                with ( regexGen ) {
                    expect(regexGen(
                        startOfLine(),
                        'http', maybe( 's' ), '://',
                        capture( anyCharBut( '/:' ).many() ),
                        group( ':', capture( digital().many() ) ).maybe(),
                        capture( '/', anything() ).maybe(),
                        endOfLine()
                    ).source).to.equal(
                        /^https?:\/\/([^/:]+)(?::(\d+))?(\/.*)?$/.source
                    );
                }
            });

            it('Validating a Hostname', function() {
                with ( regexGen ) {
                    expect(regexGen(
                        startOfLine(),
                        // One or more dot-separated parts . . .
                        either(
                            group(
                                anyCharOf( ['a', 'z'], ['0', '9'] ),
                                '.'
                            ),
                            group(
                                anyCharOf( ['a', 'z'], ['0', '9'] ),
                                anyCharOf( '-', ['a', 'z'], ['0', '9'] ).multiple( 0, 61 ),
                                anyCharOf( ['a', 'z'], ['0', '9'] ),
                                '.'
                            )
                        ).any(),
                        // Followed by the final suffix part . . .
                        either(
                            'com', 'edu', 'gov', 'int', 'mil', 'net', 'org', 'biz', 'info', 'name', 'museum', 'coop', 'aero',
                            group( anyCharOf( ['a', 'z'] ), anyCharOf( ['a', 'z'] ) )
                        ),
                        endOfLine()
                    ).source).to.equal(
                        /^(?:[a-z0-9]\.|[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\.)*(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|coop|aero|[a-z][a-z])$/.source
                    );
                }
            });

            it('Parsing CSV Files', function() {
                with ( regexGen ) {
                    expect(regexGen(
                        either( startOfLine(), ',' ),
                        either(
                            // Either a double-quoted field (with "" for each ")
                            group(
                                // double-quoted field's opening quote
                                '"',
                                capture(
                                    anyCharBut( '"' ).any(),
                                    group(
                                        '""',
                                        anyCharBut( '"' ).any()
                                    ).any()
                                ),
                                // double-quoted field's closing quote
                                '"'
                            ),
                            // Or some non-quote/non-comma text....
                            capture(
                                anyCharBut( '",' ).any()
                            )
                        )
                    ).source).to.equal(
                        /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/.source
                    );
                }
            });

        });
    });
})();
