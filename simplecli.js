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
//    }
//
// The keys of the optionMap are the long options, the short members in the
// value objects are the short options. If a vals array is provided,
// arguments to the switch are accumulated therein. If a cnt counter is
// provided, the number of appearances of the switch are counted therein.
// You can't do both.
//
// The optionMap is altered in place. Bails with a call to cpov.error if
// malformed user input is encountered.
//--------------------------------------------------------------------------

function parse(optionMap) {

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
                    this.error("fatal", "Unknown commandline switch '-" + arg + "'", "CEPHALOPOV");
                } else {
                    arg = complex;
                    dashes = 2;
                }

            }

        }

        if(dashes == 2) {

            if(optionMap[arg] === undefined)
                this.error("fatal", "Unknown commandline switch '--" + arg + "'", "CEPHALOPOV");

            currentArg = arg;

            if(optionMap[arg].cnt !== undefined)
                optionMap[arg].cnt++;

            continue;

        }

        // If we get here, we're looking at an argument to a switch

        if(optionMap[currentArg] === undefined)
            this.error("fatal", "Invalid commandline argument '" + item + "' supplied without preceding switch.", "CEPHALOPOV");
        else if(optionMap[currentArg].vals === undefined)
            this.error("fatal", "Commandline switch --" + currentArg + "/-" + optionMap[currentArg].short + " does not take arguments.", "CEPHALOPOV");
        else
            optionMap[currentArg].vals.push(item);

    }

}

module.exports = parse;
