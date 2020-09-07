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

function Minicle(optionMap, options = null) {


    if(optionMap["$all"] !== undefined && optionMap["$all"]["$general"] !== undefined)
        delete optionMap["$all"]["$general"];

    if(options !== null)
        this.doubleDash = options.doubleDash ? true : false;

    if(options === null || options.subcommands === undefined || options.subcommands === false) {

        this.optionMap   = optionMap;
        this.main        = optionMap;
        this.none        = null;
        this.all         = null;
        this.subcommands = false;
        this.subname     = null;
        this.startArg    = 2;

    } else {

        this.all = optionMap["$all"]  === undefined ? null : optionMap["$all"];

        if(process.argv[2] === undefined) {

            return;

        } else if(process.argv[2].substr(0, 1) == "-") {

            this.startArg    = 2;
            this.main        = optionMap["$none"];
            this.none        = this.main;
            this.subcommands = this.main;
            this.subname     = "$none";

        } else if(optionMap[process.argv[2]] !== undefined) {

            this.startArg    = 3;
            this.main        = optionMap[process.argv[2]];
            this.none        = optionMap["$none"] === undefined ? null : optionMap["$none"];
            this.subcommands = this.main;
            this.subname     = optionMap["$subcommand"] = process.argv[2];

        } else {
            throw new Error("FATAL ERROR: Unknown subcommand '" + process.argv[2] + "'.");
        }

    }

    this.currentMap = this.main;
    this.subParse();

}


//------------------------------------------------------------------------------
// Given a long switch, s, return the applicable optionMap entry, respecting the
// precedence order: main, all, none.
//------------------------------------------------------------------------------

Minicle.prototype.resolveLong = function(s) {

    if(this.main === undefined)
        throw new Error("FATAL ERROR: Missing subcommand.");

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
// Takes care of shoving an argument into the appropriate $general receptacle.
//------------------------------------------------------------------------------

Minicle.prototype.addGeneral = function(item) {
    if(this.currentMap !== null && this.currentMap["$general"]) {
        this.currentMap["$general"].vals.push(item);
    } else if(this.currentArg === undefined && this.main["$general"] !== undefined) {
        this.none["$general"].vals.push(item);
    } else {
        throw new Error("FATAL ERROR: Argument '" + item + "' was not preceded by an option switch.");
    }
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

        // New in 1.0.5: Minicle now supports the GNU-style "--" option, which
        // halts processing of switch arguments and shunts everything into the
        // appropriate $general vals.

        if(process.argv[a] == "--" && this.doubleDash) {
            a++;
            while(a < process.argv.length)
                this.addGeneral(process.argv[a++]);
            return;
        }

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

            this.addGeneral(item);

        } else if(entry.vals === undefined) {

            throw new Error("FATAL ERROR: Commandline switch --" + currentArg + "/-" + entry.short + " does not take arguments.");

        } else if(entry.max !== undefined) {

            if(entry.vals.length < entry.max) {
                this.currentMap[currentArg].vals.push(item);
            } else {
                this.addGeneral(item);
            }


        } else {

            if(this.currentMap[currentArg] === undefined)
                throw new Error("FATAL ERROR: Argument '" + item + "' is not preceded by an option switch.");

            this.currentMap[currentArg].vals.push(item);

        }

    }

}


//==============================================================================
// Outputs the runtime header to console. This will become progressively more
// ostentatious and ridiculous as time goes by. The options object may contain:
//
//     lineChar .... A single character used for the borders. Defaults to "=".
//                   Alternatively, this can be a string of eight characters, one
//                   for each corner and side, starting with the upper left
//                   corner and proceeding clockwise. The following shortcuts
//                   are available: "ascii", "pcdos1", "pcdos2".
//
//     customColors ... An object containing { border: x, title: y }, where x
//                      and y are functions that wrap strings in ANSI color
//                      codes, e.g. ansiColors.blue.bold or chalk.blue.bold
//
//     width ....... The width of the header in characters. Defaults to 76.
//
//     useColors ... A boolean indicating whether to use ANSI colors. Defaults
//                   to true.
//
//     output ...... A callback to produce output. Defaults to console.log. If
//                   set to null, returns the output string.
//==============================================================================

Minicle.prototype.header = function(content, options) {

    if(options === undefined)
        options = { };

    if(options.lineChar === undefined)
        options.lineChar = "========";
    else if(options.lineChar === "ascii")
        options.lineChar = "+-+|+-+|";
    else if(options.lineChar === "pcdos1")
        options.lineChar = "┌─┐│┘─└│";
    else if(options.lineChar === "pcdos2")
        options.lineChar = "╔═╗║╝═╚║";
    else if(options.lineChar.length == 1)
        options.lineChar = options.lineChar.repeat(8);

    if(options.width === undefined)
        options.width = 76;
    if(options.useColors === undefined)
        options.useColors = true;

    if(options.customColors === undefined) {
        options.customColors = {
            border: ac.blue.bold,
            title:  ac.yellow.bold
        };
    }
    if(options.customColors.border === undefined)
        options.customColors.border = ac.blue.bold;
    if(options.customColors.title === undefined)
        options.customColors.title = ac.yellow.bold;

    if(options.output === undefined)
        options.output = console.log;

    var pad = ((options.width - 2) / 2) - (content.length / 2);

    if(pad < 0) {
        content = content.substr(0, content.length + pad - 4);
        pad = 0;
    }

    var header = "\n" + options.customColors.border(options.lineChar[0] + options.lineChar[1].repeat(options.width - 2) + options.lineChar[2]) + "\n"
        + options.customColors.border(options.lineChar[7]) + " ".repeat(Math.floor(pad)) + options.customColors.title(content)
        +  " ".repeat(Math.ceil(pad)) + options.customColors.border(options.lineChar[3]) + "\n"
        + options.customColors.border(options.lineChar[6] + options.lineChar[5].repeat(options.width - 2) + options.lineChar[4]);

    if(!options.useColors)
        header = ac.unstyle(header);

    if(options.output === null)
        return header;
    else
        options.output(header);

}


//==============================================================================
// Outputs usage instructions. Takes an extended minicle optionMap (see README)
// and an options object. The options object may contain:
//
//     exit ........... If true, exit the program after output. Defaults to true.
//     usageText ...... Whatever text should follow "Usage: ".
//     width .......... Maximum width of output, defaults to 76. Note that this
//                      is advisory: content does not wrap.
//     customColors ... As with header, an object specifying a set of ANSIfying
//                      functions: { usage, switches, args, desc, cmd }
//     useColors ...... Whether to use ANSI colors. Defaults to true.
//     lineChar ....... Separator between commands, defaults to "-"
//     output ......... A callback to produce output. Defaults to console.log. If
//                      set to null, returns the output string.
//
//==============================================================================

Minicle.prototype.usage = function(options) {

    if(options === undefined)
        options = { };

    if(options.exit === undefined)
        options.exit = true;
    if(options.usageText === undefined)
        options.usageText = "YOU FORGOT TO SPECIFY options.usageText!";
    if(options.width === undefined)
        options.width = 76;
    if(options.useColors === undefined)
        options.useColors = true;
    if(options.lineChar === undefined)
        options.lineChar = "-";

    if(options.customColors === undefined)
        options.customColors = {
            usage:    ac.white.bold,
            switches: ac.yellow.bold,
            args:     ac.blue.bold,
            desc:     ac.cyan.bold,
            cmd:      ac.green.bold,
        };

    if(options.output === undefined)
        options.output = console.log;

    var content = [ ];
    content.push(ac.white.bold("  Usage: " + options.usageText));

    // Calculate column widths -------------------------------------------------

    var max = { long: 0, args: 0, desc: 0 };
    if(this.subcommands) {
        for(var cmd in this.optionMap) {
            this.getWidths(this.optionMap[cmd], max);
        }
    } else {
        this.getWidths(this.optionMap, max);
    }

    var minWidth = 10 + max.long + max.args + max.desc;
    var pad = 1;
    if(minWidth < options.width)
        pad = Math.floor((options.width - minWidth) / 2);
    if(pad < 1)
        pad = 1;

    // Assemble the output lines -----------------------------------------------

    if(this.subcommands) {
        for(var cmd in this.optionMap) {
            if(cmd == "$all")
                var separator = " (all commands) ";
            else if(cmd == "$none")
                var separator = " (no command) ";
            else if(cmd == "$general" || cmd == "$subcommand")
                continue;
            else
                var separator = " cmd: " + cmd + " ";
            separator += options.lineChar.repeat(options.width - separator.length);
            content.push(options.customColors.cmd("\n" + separator + "\n"));
            for(var longOpt in this.optionMap[cmd]) {
                if(longOpt.substr(0, 1) == "$")
                    continue;
                content.push(this.formatOption(longOpt, this.optionMap[cmd][longOpt], max, pad, options.customColors));
            }
        }
    } else {
        content.push("");
        for(var longOpt in this.optionMap) {
            if(longOpt.substr(0, 1) == "$")
                continue;
            content.push(this.formatOption(longOpt, this.optionMap[longOpt], max, pad, options.customColors));
        }
    }

    content = content.join("\n") + "\n";
    if(!options.useColors)
        content = ac.unstyle(content);

    if(options.output === null)
        return content;
    else
        options.output(content);

    if(options.exit)
        process.exit(0);
}


//------------------------------------------------------------------------------
// Takes a long option, its corresponding optionMap value, the max object, a pad
// value, and options.customColors, and returns a formatted version.
//------------------------------------------------------------------------------

Minicle.prototype.formatOption = function(longOpt, map, max, pad, color) {
    longOpt += " ".repeat((max.long - longOpt.length) + pad);
    var args = map.args === undefined ? "" : map.args;
    args +=  " ".repeat((max.args - args.length) + pad);
    var desc = map.desc === undefined ? "" : map.desc;

    if(map.short === undefined)
        return ac.yellow.bold("    --" + longOpt + "    ")
            + ac.blue.bold(args) + ac.cyan.bold(desc);
    else
        return ac.yellow.bold("    -" + map.short + ", --" + longOpt)
            + ac.blue.bold(args) + ac.cyan.bold(desc);

}


//------------------------------------------------------------------------------
// Given a whole map or a subcommand map and an object (see def. of max above),
// finds max lengths for each element.
//------------------------------------------------------------------------------

Minicle.prototype.getWidths = function(map, max) {
    for(var longOpt in map) {

        var args = map[longOpt].args ? map[longOpt].args : "";
        var desc = map[longOpt].desc ? map[longOpt].desc : "";

        if(longOpt.length > max.long)
            max.long = longOpt.length;
        if(args.length > max.args)
            max.args = args.length;
        if(desc.length > max.desc)
            max.desc = desc.length;
    }
}




module.exports = Minicle;
