/*

Copyright 2019 Eric O'Dell and subsequent contributors

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

//--------------------------------------------------------------------------
// Simple commandline parser that supports short and long switches both with
// and without arguments. Takes an optionMap like so:
//
//    var optionMap = {
//        infile:     { short: "i", vals: [ ] },  // accumulates values
//        outfiles:   { short: "o", vals: [ ], max: 1 }, // captures only one argument
//        preamble:   { short: "p", vals: [ ] },
//        sdlinclude: { short: "s", vals: [ ] },
//        verbose:    { short: "v", cnt: 0 },     // accumulates appearance counts
//        quietMode:  { short: "q", cnt: 0 },
//        debug:      { short: "d", cnt: 0 },
//        help:       { short: "h", cnt: 0 },
//        "@general": { vals: [ ] },               // accumulates naked arguments
//    }
//
// The keys of the optionMap are the long options, the short members in the
// value objects are the short options. If a vals array is provided,
// arguments to the switch are accumulated therein. If a cnt counter is
// provided, the number of appearances of the switch are counted therein.
// You can't do both.
//
// Val options may optionally have a max member which specifies how many
// arguments it accepts before additional arguments are shunted to @general.
//
// The optionMap is altered in place. Bails with a console error message if
// malformed user input is encountered.
//
// Update 2019-03-15: Added support for git-style subcommands. To use, pass
// options { subcommand: true }. In this case, optionMap gains an extra
// level:
//
//     var optionMap = {
//         add:     { ...original optionMap... },
//         status:  { ...original optionMap... },
//         "@none": { ...original optionMap... },
//         "@all":  { ...original optionMap... },
//     }
//
// The @none subcommand provides switches which are valid when no subcommand
// is given. @all contains switches which are valid in all cases. Both are
// optional.
//
// TODO: Document exceptions
//--------------------------------------------------------------------------

function Minicle(optionMap, options = null) {

    if(options === null || options.subcommand === undefined || options.subcommand === false) {

        this.optionMap  = optionMap;
        this.main       = optionMap;
        this.none       = null;
        this.all        = null;
        this.subcommand = false;
        this.startArg   = 2;

    } else {

        this.all = optionMap["@all"]  === undefined ? null : optionMap["@all"];

        if(process.argv[2].substr(0, 1) == "-") {

            optionMap["@subcommand"] = "@none";

            this.startArg   = 2;
            this.main       = optionMap["@none"];
            this.none       = this.main;
            this.subcommand = this.main;

        } else if(optionMap[process.argv[2]] !== undefined) {

            optionMap["@subcommand"] = process.argv[2];

            this.startArg   = 3;
            this.main       = optionMap[process.argv[2]];
            this.none       = optionMap["@none"] === undefined ? null : optionMap["@none"];
            this.subcommand = this.main;

        } else {
            throw new Error("FATAL ERROR: Unknown subcommand '" + process.argv[2] + "'.");
        }

    }

    this.currentMap  = this.main;
    this.subParse();

}


//------------------------------------------------------------------------------
// Given a long switch, s, return the applicable optionMap entry, respecting the
// precedence order: main, all, none.
//------------------------------------------------------------------------------

Minicle.prototype.resolveLong = function(s) {
    if(this.main !== null && this.main[s] !== undefined) {
        this.currentMap = this.main;
        return this.main[s];
    } else if(this.all !== null && this.all[s] !== undefined) {
        this.currentMap = this.all;
        return this.all[s];
    } else if(this.none !== null && this.none[s] !== undefined) {
        this.currentMap = this.none;
        return this.none[s];
    }
    throw new Error("FATAL ERROR: Unknown commandline switch '--" + s + "'");
}


//------------------------------------------------------------------------------
// Given a short switch, c, return the corresponding long switch, respecting the
// precedence order: main, all, none.
//------------------------------------------------------------------------------

Minicle.prototype.resolveShort = function(c) {
    var tables = [ this.main, this.all, this.none ];

    for(var table of tables) {
        if(table === null) {
            continue;
        }
        for(var i in table) {
            if(table[i].short == c.substr(1)) {
                return i;
            }
        }
    }

    return null;
}


//------------------------------------------------------------------------------
// Most of the work of parsing happens here.
//------------------------------------------------------------------------------

Minicle.prototype.subParse = function() {
    var currentArg = null;

    for(var a = this.startArg; a < process.argv.length; a++) {
        var item   = process.argv[a];
        var match  = item.match(/^(-+)?(\S+)/);
        var dashes = match[1] === undefined ? 0 : match[1].length;
        var arg    = match[2];

        if(dashes == 1) {

            if(arg.length > 1) {   // Just split composite simple args

                var args = arg.split("");
                for(var i = 0; i < args.length; i++)
                    process.argv.splice(a + 1 + i, 0, "-" + args[i]);
                continue;

            } else {  // Convert simple args to long args

                var complex = this.resolveShort(item);

                if(complex === null) {
                    throw new Error("FATAL ERROR: Unknown commandline switch '-" + arg + "'");
                } else {
                    arg = complex;
                    dashes = 2;
                }

            }

        }

        if(dashes == 2) {
            var entry = this.resolveLong(arg);
            if(entry.cnt !== undefined) {
                currentArg = null;
                entry.cnt++;
            } else {
                currentArg = arg;
            }
            continue;
        }

        // If we get here, we're looking at an arguments as opposed to switches

        if(currentArg === null) {

            if(this.currentMap["@general"] !== undefined) {
                this.currentMap["@general"].vals.push(item);
            } else {
                throw new Error("FATAL ERROR: Argument '" + item + "' not preceded by an option switch.");
            }

        } else if(entry.vals === undefined) {

            throw new Error("FATAL ERROR: Commandline switch --" + currentArg + "/-" + entry.short + " does not take arguments.");

        } else if(entry.max !== undefined) {

            if(entry.vals.length < entry.max) {
                this.currentMap[currentArg].vals.push(item);
            } else {

                if(this.none !== undefined && this.none["@general"] != undefined) {
                    this.none["@general"].vals.push(item);
                } else if(this.currentMap["@general"] === undefined) {
                    throw new Error("FATAL ERROR: Argument '" + item + "' was not preceded by an option switch.");
                } else {
                    this.currentMap["@general"].vals.push(item);
                }

            }

        } else {

            if(this.currentMap[currentArg] === undefined)
                throw new Error("FATAL ERROR: Argument '" + item + "' wasn't preceded by an option switch.");
            this.currentMap[currentArg].vals.push(item);

        }

    }

}



function parse(optionMap, options) {
    var m = new Minicle(optionMap, options);
}

module.exports = parse;
