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
//        outfiles:   { short: "o", vals: [ ] },
//        preamble:   { short: "p", vals: [ ] },
//        sdlinclude: { short: "s", vals: [ ] },
//        verbose:    { short: "v", cnt: 0 },     // accumulates appearance counts
//        quietMode:  { short: "q", cnt: 0 },
//        debug:      { short: "d", cnt: 0 },
//        help:       { short: "h", cnt: 0 },
//        @general:   { vals[ ] },                // accumulates naked arguments
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
//--------------------------------------------------------------------------

function parse(optionMap, options = null) {

    var currentArg = null;

    for(var a = 2; a < process.argv.length; a++) {
        var item   = process.argv[a];
        var match  = item.match(/^(-+)?(\S+)/);
        var dashes = match[1] === undefined ? 0 : match[1].length;
        var arg    = match[2];

        if(dashes == 1) {

            if(arg.length > 1) {   // Just split composite simple args

                var args = arg.split("");

                for(var i = 0; i < args.length; i++) {
                    process.argv.splice(a + 1 + i, 0, "-" + args[i]);
                }
                continue;

            } else {  // Convert simple args to long args

                var complex = null;
                for(var i in optionMap) {
                    if(optionMap[i].short == arg) {
                        complex = i;
                        break;
                    }
                }

                if(complex === null) {
                    console.log("FATAL ERROR: Unknown commandline switch '-" + arg + "'");
                } else {
                    arg = complex;
                    dashes = 2;
                }

            }

        }

        if(dashes == 2) {

            if(optionMap[arg] === undefined)
                console.log("FATAL ERROR: Unknown commandline switch '--" + arg + "'");

            currentArg = arg;

            if(optionMap[arg].cnt !== undefined)
                optionMap[arg].cnt++;

            continue;

        }

        // If we get here, we're looking at an argument to a switch

        if(optionMap[currentArg] === undefined) {
            console.log("FATAL ERROR: Invalid commandline argument '" + item + "' supplied without preceding switch.");
        } else if(optionMap[currentArg].vals === undefined) {
            console.log("FATAL ERROR: Commandline switch --" + currentArg + "/-" + optionMap[currentArg].short + " does not take arguments.");
        } else if(optionMap[currentArg].vals.length < (optionMap[currentArg].max === undefined ? Infinity : optionMap[currentArg].max)) {
            optionMap[currentArg].vals.push(item);
        } else {
            if(optionMap["@general"] === undefined) {
                optionMap["@general"] = { vals: [ ] };
            }
            optionMap["@general"].vals.push(item);
        }

    }

}

module.exports = parse;
