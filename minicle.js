#!/usr/bin/env node

/*

Copyright 2019-2020 Eric O'Dell and subsequent contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

const ac = require("ansi-colors");

const ansiRe = new RegExp("(@[0-9A-FXx][0-9A-FXx]@)", "gi");
const styles = {
    //         0    1    2    3    4    5    6    7        0 1 2     TL TC TR
    //        TL   TC   TR    R   BR   BC   BL    L        7   3     ML    MR
    basic:  [ "=", "=", "=", "=", "=", "=", "=", "=" ], // 6 5 4     BL BC BR
    ascii:  [ "+", "-", "+", "|", "+", "-", "+", "|" ],
    pcdos1: [ "┌", "─", "┐", "│", "┘", "─", "└", "│" ],
    pcdos2: [ "╔", "═", "╗", "║", "╝", "═", "╚", "║" ],
};

const errorLevels = [
    { name: "fatal", levelColor: "@CE@", messageColor: "@CF@", locationColor: "@0E@", quit: true },
    { name: "warn",  levelColor: "@E0@", messageColor: "@0E@", locationColor: "@06@", quit: false },
    { name: "info",  levelColor: "@2F@", messageColor: "@0A@", locationColor: "@02@", quit: false },
    { name: "debug", levelColor: "@8F@", messageColor: "@07@", locationColor: "@0F@", quit: false },
];




//##############################################################################
//##############################################################################

module.exports.parseCliArgs = function parseCliArgs(args, opt) {
    var s2l    = { };     // short to long switch LUT
    var sw     = null;    // current switch name
    var ddseen = false;   // true if a doubledash has been seen

    var res = {
        command: null,
        switches: { },   // { cnt: n, args: [ ] }
        errcode: null,
        errmsg:  null,
        general: [ ],
    }


    // Split clustered short options -------------------------------------------

    var tmp = [ ];
    var sub;
    for(var a of args) {
        if(sub = a.match(/^-([^-]+)/)) {
            sub = sub[1].split("");
            for(var s of sub)
                tmp.push("-" + s);
        } else {
            tmp.push(a);
        }
    }
    args = tmp;


    // Handle commands ---------------------------------------------------------

    if(opt.commands) {
        if(!args.length) {
            res.errcode = "NOCMD";
            res.errmsg  = "No command given.";
            return res;
        }

        for(var c of opt.commands) {
            if(c == args[0]) {
                res.command = c;
                break;
            }
        }
        if(res.command == null) {
            res.command = args[0];
            res.errcode = "BADCMD";
            res.errmsg  = "Invalid command given.";
            return res;
        }
        res.command = args[0];
        args = args.slice(1);
    }

    var switches = opt.commands ? opt.switches[res.command] : opt.switches;

    for(var s in switches) {
        res.switches[s] = { cnt: 0, args: [ ] };
        s2l[switches[s].short] = s;
    }


    for(var arg of args) {

        if(ddseen) {
            if(sw === null)
                res.general.push(arg);
            else
                res.switches[sw].args.push(arg);
            continue;
        }

        // Double dashes -------------------------------------------------------

        if(arg == "--") {
            if(opt.ddash) {
                ddseen = true;
                sw = null;
                continue;
            } else {
                res.errcode = "DDASH";
                res.errmsg  = "A double dash appeared in user input.";
                return res;
            }
        }

        // Short options -------------------------------------------------------

        if(arg.charAt(0) == "-" && arg.charAt(1) !== "-") {
            if(sw = s2l[arg.substr(1)]) {
                res.switches[sw].cnt++;
                continue;
            }
            res.errcode = "BADSHORT";
            res.errmsg  = "Invalid short option \"" + arg + "\" given.";
            return res;
        }

        // Long options --------------------------------------------------------

        if(arg.substr(0, 2) == "--") {
            if(switches[arg.substr(2)]) {
                sw = arg.substr(2);
                res.switches[sw].cnt++;
                continue;
            }
            res.errcode = "BADLONG";
            res.errmsg  = "Invalid long option \"" + arg + "\".";
            return res;
        }

        // Arguments -----------------------------------------------------------

        if(!ddseen && sw && (res.switches[sw].args.length < switches[sw].maxArgs || switches[sw].maxArgs === undefined)) {
            res.switches[sw].args.push(arg);
        } else {
            sw = null;
            res.general.push(arg);
        }

    }

    return res;
}

//##############################################################################
//# Patterned loosely after the ANSI markup codes from the venerable Wildcat BBS
//# from the DOS era, ansiMarkup() takes some text and applies ANSI color codes
//# to it, returning the results. Markup consists of a two-digit
//# hexadecimal number bracketed by at-signs, e.g., @0C@ is bright red text on
//# a black background. The first digit encodes the background color and the
//# second the foreground. The values for both are as follows:
//#
//#     0 - Black         8 - Bright black (grey)
//#     1 - Blue          9 - Bright blue
//#     2 - Green         A - Bright green
//#     3 - Cyan          B - Bright cyan
//#     4 - Red           C - Bright red
//#     5 - Magenta       D - Bright magenta
//#     6 - Yellow/brown  E - Bright yellow
//#     7 - White         F - Bright white
//#
//#     X in either position indicates no change from the previous code.
//#
//# Lowercase a-f can be used as well. Applied colors remain in effect until
//# the appearance of the next color code.
//##############################################################################

function ansiMarkup(text) {
    const fg = {
        0: ac.black,        8: ac.blackBright,
        1: ac.blue,         9: ac.blueBright,
        2: ac.green,        A: ac.greenBright,
        3: ac.cyan,         B: ac.cyanBright,
        4: ac.red,          C: ac.redBright,
        5: ac.magenta,      D: ac.magentaBright,
        6: ac.yellow,       E: ac.yellowBright,
        7: ac.white,        F: ac.whiteBright,

                  X: x => x
    };

    const bg = {
        0: ac.bgBlack,      8: ac.bgBlackBright,
        1: ac.bgBlue,       9: ac.bgBlueBright,
        2: ac.bgGreen,      A: ac.bgGreenBright,
        3: ac.bgCyan,       B: ac.bgCyanBright,
        4: ac.bgRed,        C: ac.bgRedBright,
        5: ac.bgMagenta,    D: ac.bgMagentaBright,
        6: ac.bgYellow,     E: ac.bgYellowBright,
        7: ac.bgWhite,      F: ac.bgWhiteBright,

                  X: x => x
    };

    text = text.split(ansiRe);
    var result = [ ];

    for(var i = 0; i < text.length; i++) {
        var isText = !text[i].match(ansiRe);
        if(isText) {
            if(i) {
                text[i-1] = text[i-1].toUpperCase();
                result.push(fg[text[i-1].charAt(2)](bg[text[i-1].charAt(1)](text[i])));
            } else {
                result.push(text[i]);
            }
        }
    }

    return result.join("");
}

module.exports.ansiMarkup = ansiMarkup;


//##############################################################################
//# Returns the length of a string minus any of the @xx@ codes used by
//# ansiMarkup.
//##############################################################################

function plainLength(text) {
    var plain = text.replace(ansiRe, "");
    return plain.length;
}

module.exports.plainLength = plainLength;


//##############################################################################
//# Outputs a colorized error message.
//##############################################################################

module.exports.errmsg = function errmsg(level, message, location = null, options = { }) {

    var verbosity = options.verbosity   !== undefined ? options.verbosity   : verbosity;
    var levels    = options.errorLevels !== undefined ? options.errorLevels : errorLevels;
    var output    = options.output      !== undefined ? options.output      : console.log;

    for(var i = 0; i < levels.length; i++) {
        if(i > verbosity)
            return;
        var lvl = levels[i];
        if(levels[i].name == level) {
            var name = levels[i].name.toUpperCase();
            var result = ansiMarkup(
                lvl.levelColor + "*" + name + "*" + "@07@ "
                + lvl.messageColor + message + "@07@ "
                + (location ? lvl.locationColor + "[" + location + "]" : "")
            );

            if(output === null)
                return result;
            else
                output(result);
            if(lvl.quit)
                process.exit(1);
            return;
        }

    }

    throw new RangeError("Minicle.errmsg level " + level + " does not exist in defined styles.");
}


//##############################################################################
//# Takes a string of text and aligns and wraps it, returning the result as an
//# array of lines. The options argument should contain:
//#
//#     width:       defaults to 76
//#     indent:      positive or negative, defaults to 0
//#     align:      "left", "right", "center", or "full"; defaults to "left"
//#
//# This routine doesn't handle hyphenation. Words that are longer than width
//# are simply broken after width characters. Otherwise, breaks only occur on
//# whitespace. Blank lines are treated the same as all other whitespace.
//#
//# An additional option, ignoreAnsiMarkup, can be given if text contains the
//# @xx@ color codes used by ansiMarkup() so that the rendered line lengths are
//# unaffected. It is false by default.
//##############################################################################

function paragraphize(text, opts = { }) {
    var width  = opts.width  ? opts.width       : 76;
    var indent = opts.indent ? opts.indent      : 0;
    var align  = opts.align  ? opts.align       : "left";

    if(opts.join === undefined)
        opts.join = false;
    var join = opts.join ? true : false;

    if(opts.ignoreAnsiMarkup ? opts.ignoreAnsiMarkup : false)
        var length = plainLength;
    else
        var length = text => text.length;

    var result = [ ];
    var words   = text.split(/\s+/);
    var word    = words.shift();
    var line   = indent ? " ".repeat(indent) : "";

    // TODO: Reused values below should be precalculated once per iteration

    while(word || words.length) {
        if(length(word) > width - 1) {
            var prefix = width - length(line);
            line += word.substr(0, prefix);
            result.push(line);
            line = "";
            words.unshift(word.substr(prefix));
        } else if(length(line) + length(word) > width) {
            result.push(line);
            line = word.substr(1);
        } else if(length(line) + length(word) <= width) {
            line += word;
        }
        if(words.length)
            word = (length(line) ? " " : "") + words.shift();
        else
            word = "";
    }
    if(length(line))
        result.push(line);

    if(align == "right") {
        for(var i = 0; i < result.length; i++)
            result[i] = " ".repeat(width - length(result[i])) + result[i];
    } else if(align == "center") {
        for(var i = 0; i < result.length; i++)
            result[i] = " ".repeat(Math.floor((width - length(result[i])) / 2)) + result[i];
    } else if(align == "full") {

        // FIXME: This can almost certainly be improved upon.

        for(var i = 0; i < result.length; i++) {
            var remaining = width - length(result[i]);
            if(remaining) {
                var tmp = result[i].split(/\s+/);
                if(tmp.length > 1) {
                    var wordlen = 0;
                    for(w = 0; w < tmp.length; w++)
                        wordlen += length(tmp[w]);
                    var gaps = tmp.length - 1;
                    var words = [ ];
                    while(tmp.length) {
                        words.push(tmp.shift());
                        words.push(null);
                    }
                    words.pop();
                    remaining = width - wordlen;

                    for(var w = 0; w < words.length; w++) {
                        if(words[w] === null) {
                            var fill = Math.ceil(remaining / gaps);
                            words[w] = " ".repeat(fill);
                            remaining -= fill;
                            gaps--;
                        }
                    }
                    result[i] = words.join("");
                }
            }
        }
    }

    return join ? result.join("\n") : result;
}
module.exports.paragraphize = paragraphize;


//##############################################################################
//# Generates a box around a block of text. The style argument is an array
//# of strings specifying [ TL, T, TR, R, BR, B, BL, L ] strings to use for the
//# corners and sides of the box. All but T and B should be the same width as
//# the strings above and below them. Options and their defaults are:
//#
//#     width .... Total width of box, sides inclusive. Defaults to 76.
//#
//#     reflow ... All contiguous blocks of text are rewrapped to fit within
//#                the box. Lines beginning with whitespace are not modified and
//#                may cause overflow on the right. Blank lines are unaltered.
//#                Defaults to false.
//#
//#     noRight ... Omit the right side of the box. Defaults to false.
//#
//#     ignoreAnsiMarkup .... Expect @xx@ color codes and exclude them from line
//#                           length calculations. Defaults to false.
//#
//#     padding ... an array of character cell counts, [T, R, B, L]. Defaults to
//#                 [0, 1, 0, 1].
//#
//# The result is returned as an array of lines.
//##############################################################################

// TODO: check for repeated calculations

function textBox(text, style, opts = { }) {
    var width   = opts.width   ? opts.width   : 76;
    var reflow  = opts.reflow  ? opts.reflow  : false;
    var noRight = opts.noRight ? opts.noRight : false;
    var padding = opts.padding ? opts.padding : [0, 1, 0, 1];
    var style   = style        ? style        : "basic";

    if(opts.ignoreAnsiMarkup ? opts.ignoreAnsiMarkup : false)
        var length = plainLength;
    else
        var length = text => text.length;

    if(!style)
        style = "basic";
    if(!Array.isArray(style))
        style = styles[style];

    var innerWidth   = width - (length(style[3]) + padding[3] + (noRight ? 0 : length(style[7]) + padding[1]));
    var vBorderWidth = width - (length(style[3]) + length(style[1]));

    //==========================================================================

    var lines = text.split(/\n/);

    if(reflow) {
        var reflowed = [ ];
        var current  = [ ];

        do {
            var line = lines.shift();
            if(!length(line) || line.match(/^\s+/)) {
                if(current.length) {
                    var tmp = paragraphize(current.join(" "), { width: innerWidth });
                    while(tmp.length)
                        reflowed.push(tmp.shift());
                    current = [ ];
                } else {
                    reflowed.push(line);
                }
            } else {
                current.push(line);
            }
        } while(lines.length);

        if(current.length) {   // TODO: DRY this out
            var tmp = paragraphize(current.join(" "), { width: innerWidth });
            while(tmp.length)
                reflowed.push(tmp.shift());
        }

        lines = reflowed;
    }

    //==========================================================================

    var result = [ ];

    result.push(textLine(width, style, opts.ignoreAnsiMarkup));

    for(var i = 0; i < padding[0]; i++)
        result.push(style[7] + " ".repeat(width).substr(0, vBorderWidth) + (noRight ? "" : style[3]));

    if(noRight) {
        for(var i = 0; i < lines.length; i++) {
            var line = style[7] + " ".repeat(padding[3]) + lines[i];
            result.push(line);
        }
    } else {
        for(var i = 0; i < lines.length; i++) {
            var line = style[7] + " ".repeat(padding[3]) + lines[i];
            var pad = width - length(line) - padding[1] - length(style[3]);
            line += " ".repeat(pad) + " ".repeat(padding[1]) + style[3];
            result.push(line);
        }
    }

    for(var i = 0; i < padding[2]; i++)
        result.push(style[7] + " ".repeat(width).substr(0, vBorderWidth) + (noRight ? "" : style[3]));

    result.push(textLine(width, [style[6], style[5], style[4]], opts.ignoreAnsiMarkup));

    return result;
}

module.exports.textBox = textBox;

//##############################################################################
//# Outputs a simple one-line header box.
//##############################################################################

module.exports.outputHeader = function outputHeader(text = "", style = "pcdos2", boxColor = null, width = 76) {
    var textWidth = width - 4;
    text = ansiSubstr(text.split("\n").shift().trim(), 0, textWidth);
    text = paragraphize(text, {
        width: textWidth, align: "center", ignoreAnsiMarkup: true
    }).join("\n");

    style = styles[style].slice(0);
    style[0] = boxColor + style[0];
    style[2] = style[2] + "@07@";
    style[7] = boxColor + style[7] + "@07@";
    style[3] = boxColor + style[7] + "@07@";
    style[6] = boxColor + style[6];
    style[4] = boxColor + style[4] + "@07@";

    text = textBox(text, style, { width: width, ignoreAnsiMarkup: true });
    console.log(ansiMarkup(text.join("\n")));
}


//##############################################################################
//# Emits a single line of the specified style.
//##############################################################################

module.exports.textLine = function textLine(width = 76, style = "basic", ignoreAnsiMarkup = false) {

    if(ignoreAnsiMarkup ? ignoreAnsiMarkup : false)
        var length = plainLength;
    else
        var length = text => text.length;

    if(!Array.isArray(style))
        style = styles[style];

    var midlen = width - length(style[0]) - length(style[2]);
    return style[0] + ansiSubstr(style[1].repeat(Math.ceil(midlen / length(style[1]))), 0, midlen )+ style[2];
}

var textLine = module.exports.textLine;


//##############################################################################
//# Returns the specified substring of a string with embedded ansiMarkup codes.
//# It can also be used to eliminate unnecessary duplicate codes.
//##############################################################################

function ansiSubstr(text, offset, length) {

    text = text.split(ansiRe);

    var codes = [ ];
    var chars = [ ];
    var prev  = "XX";

    // We're building two arrays here, one of characters and one with the
    // currently active color code.

    for(var i = 0; i < text.length; i++) {
        var isText = !text[i].match(ansiRe);
        if(isText) {
            for(var j = 0; j < text[i].length; j++) {
                codes.push(prev);
                chars.push(text[i].charAt(j));
            }
        } else {
            prev = text[i].substr(1, 2);
        }
    }

    // Here we're going to take a slice of both arrays to emulate the behavior
    // of String.substr. Brendan Eich must have been feeling particularly dickish
    // when he came up with Array.slice(), because the semantics of its arguments
    // are different than the otherwise equivalent String.substr.

    codes = codes.slice(offset, offset + length);  // seriously, what is this shit?
    chars = chars.slice(offset, offset + length);

    // Now that the arrays have been trimmed to length, we're going to walk both of
    // them in order to reconstruct the desired substring complete with properly
    // adjusted markup codes. And yes, this would be far less ornate if JavaScript had
    // pointers like a real language.

    var result = [ ];
    var prev   = "XX";

    while(chars.length) {
        var char = chars.shift();
        var code = codes.shift();
        if(code != prev) {
            result.push("@" + code + "@");
            prev = code;
        }
        result.push(char);
    }

    return result.join("");
}

module.exports.ansiSubstr = ansiSubstr;


//##############################################################################
//# This should move elsewhere as an optional feature. Some entries might go to
//# the default styles.
//#
//#                            0 1 2     TL TC TR
//#                            7   3     ML    MR
//#                            6 5 4     BL BC BR
//#
//##############################################################################

module.exports.extraStyles = {
//                     TL      TC     TR   MR    BR   BC     BL      ML
    lcAsciiGap:      [ "// +", "-",   "+", "|",  "+", "-",   "// +", "// |" ],
    lcAsciiNoGap:    [ "//+",  "-",   "+", "|",  "+", "-",   "//+",  "//|"  ],
    lcPcdos1Gap:     [ "// ┌", "─",   "┐", "│",  "┘", "─",   "// └", "// │" ],
    lcPcdos1NoGap:   [ "//┌",  "─",   "┐", "│",  "┘", "─",   "//└",  "//│"  ],
    lcPcdos2Gap:     [ "// ╔", "═",   "╗", "║",  "╝", "═",   "// ╚", "// ║" ],
    lcPcdos2NoGap:   [ "//╔",  "═",   "╗", "║",  "╝", "═",   "//╚",  "//║"  ],
    lcOpenDash:      [ "//-",  "-",   "-", "",   "-", "-",   "//-",  "//"   ],
    lcOpenDashEq:    [ "//=",  "-=",  "-", "",   "-", "-=",  "//=",  "//"   ],
    lcOpenEqual:     [ "//=",  "=",   "=", "",   "=", "=",   "//=",  "//"   ],
    lcOpenEqId:      [ "//≡",  "=≡",  "=", "",   "=", "=≡",  "//≡",  "//"   ],
    lcOpenIdent:     [ "//≡",  "≡",   "≡", "",   "≡", "≡",   "//≡",  "//"   ],
    lcOpenHash:      [ "//#",  "#",   "#", "",   "#", "#",   "//#",  "//"   ],
    lcOpenAt:        [ "//@",  "@",   "@", "",   "@", "@",   "//@",  "//"   ],
    lcClosedDash:    [ "//-",  "-",   "-", "-",  "-", "-",   "//-",  "//-"   ],
    lcClosedDashEq:  [ "//=",  "-=",  "-", "=",  "-", "-=",  "//=",  "//="   ],
    lcClosedEqual:   [ "//=",  "=",   "=", "=",  "=", "=",   "//=",  "//="   ],
    lcClosedEqId:    [ "//≡",  "=≡",  "=", "≡",  "=", "=≡",  "//≡",  "//≡"   ],
    lcClosedIdent:   [ "//≡",  "≡",   "≡", "≡",  "≡", "≡",   "//≡",  "//≡"   ],
    lcClosedHash:    [ "//#",  "#",   "#", "#",  "#", "#",   "//#",  "//#"   ],
    lcClosedAt:      [ "//@",  "@",   "@", "@",  "@", "@",   "//@",  "//@"   ],
};




