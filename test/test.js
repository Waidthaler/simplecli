// This will shortly be replaced by an Experior test suite

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

var {dump} = require('dumper.js');
var parse = require("./minicle.js");

var simpleMap = {
    able:    { short: "a", vals: [ ] },
    baker:   { short: "b", vals: [ ], max: 1 },
    charlie: { short: "c", cnt: 0 },
};

var simpleMapGeneral = {
    able:       { short: "a", vals: [ ] },
    baker:      { short: "b", vals: [ ], max: 1 },
    charlie:    { short: "c", cnt: 0 },
    "@general": { vals: [ ] }
};

var metaMap = {
    johnson: {
        able:       { short: "a", vals: [ ] },
        baker:      { short: "b", vals: [ ], max: 1 },
        charlie:    { short: "c", cnt: 0 },
        "@general": { vals: [ ] }
    },
    nixon: {
        able:       { short: "a", vals: [ ] },
        baker:      { short: "b", vals: [ ], max: 1 },
        charlie:    { short: "c", cnt: 0 },
    },
    carter: {
        able:       { short: "a", vals: [ ] },
        baker:      { short: "b", vals: [ ], max: 1 },
        charlie:    { short: "c", cnt: 0 },
    },
    "@none": {
        delta:      { short: "d", vals: [ ] },
        echo:       { short: "e", vals: [ ], max: 1 },
        foxtrot:    { short: "f", cnt: 0 },
        "@general": { vals: [ ] }
    },
    "@all": {
        golf:       { short: "g", vals: [ ] },
        hotel:      { short: "h", vals: [ ], max: 1 },
        india:      { short: "i", cnt: 0 },
        "@general": { vals: [ ] }
    },
}

//var map = simpleMap;
var map = simpleMapGeneral;
//var map = metaMap;

try {
    parse(map);
    //parse(map, {subcommand: true});
} catch(e) {
    console.log(e);
}

dump(map);



