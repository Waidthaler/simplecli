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
var parse = require("../minicle.js");

var tests = [

    {
        name: "SimpleMap",
        subcommand: false,
        options: { doubleDash: true },
        optionMap: {
            able:    { short: "a", vals: [ ] },
            baker:   { short: "b", vals: [ ], max: 1 },
            charlie: { short: "c", cnt: 0 },
        },
        tests: [
            {
                cli: [ "gonzo" ],
                expected: "",
            }, {
                cli: [ "--able", "foo", "bar", "baz", "--baker", "quux", "--charlie" ],
                expected: "",
            }, {
                cli: [ "--able", "foo", "bar", "baz", "--baker", "quux", "johnson", "--charlie" ],
                expected: "",
            }, {
                cli: [ "-a", "foo", "bar", "baz", "-b", "quux", "-c" ],
                expected: "",
            }, {
                cli: [ "-a", "foo", "-a", "bar", "-a", "baz", "--baker", "fnord", "-ccc" ],
                expected: "",
            }
        ]
    },

    {
        name: "simpleMapGeneral",
        subcommand: false,
        options: { doubleDash: true },
        optionMap:  {
            able:       { short: "a", vals: [ ] },
            baker:      { short: "b", vals: [ ], max: 1 },
            charlie:    { short: "c", cnt: 0 },
            "@general": { vals: [ ] }
        },
        tests: [
            {
                cli: [ "gonzo" ],
                expected: "",
            }, {
                cli: [ "--able", "foo", "bar", "baz", "--baker", "quux", "--charlie" ],
                expected: "",
            }, {
                cli: [ "--able", "foo", "bar", "baz", "--baker", "quux", "johnson", "--charlie" ],
                expected: "",
            }, {
                cli: [ "-a", "foo", "bar", "baz", "-b", "quux", "-c" ],
                expected: "",
            }, {
                cli: [ "-a", "foo", "-a", "bar", "-a", "baz", "--baker", "fnord", "-ccc" ],
                expected: "",
            }, {
                cli: [ "-a", "foo", "-b", "bar", "--", "one", "two", "three", "four" ],
                expected: "",
            }
        ]
    },

    {
        name: "metaMap",
        subcommand: true,
        options: { subcommands: true, doubleDash: true },
        optionMap: {
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
            },
        },
        tests: [
            {
                cli: [ "johnson", "-a", "fee", "fi", "fo", "fum", "-b", "kermit", "GONZO", "-h", "hoober" ],
                expected: "",
            }, {
                cli: [ "--delta", "foo", "bar", "-h", "one", "GONZO" ]
                expected: "",
            }
        ]
    },

    {
        name: "metaMapWithBareNone",
        subcommand: true,
        options: { subcommands: true, doubleDash: true },
        optionMap: {
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
                "@general": { vals: [ ] }
            },
            "@all": {
                golf:       { short: "g", vals: [ ] },
                hotel:      { short: "h", vals: [ ], max: 1 },
                india:      { short: "i", cnt: 0 },
            },
        },
        tests: [
            {
                cli: [ "johnson", "--golf", "tee", "-a", "fee", "fi", "fo", "fum", "-b", "kermit", "GONZO", "-h", "hoobler" ],
                expected: "",
            }, {
                cli: [ "--golf", "foo", "bar", "-h", "one", "GONZO" ]
                expected: "",
            }
        ]
    },

    {
        name: "simpleMetaMap",
        subcommand: true,
        options: { subcommands: true, doubleDash: true },
        optionMap: {
            johnson: {
                foo:        { short: "f", vals: [ ] },
                bar:        { short: "b", vals: [ ], max: 1 },
                "@general": { vals: [ ] }
            },
            nixon: {
                foo:        { short: "f", vals: [ ] },
                bar:        { short: "b", vals: [ ], max: 1 }
            },
            "@none": {
                foo:        { short: "f", vals: [ ] },
                bar:        { short: "b", vals: [ ], max: 1 },
                "@general": { vals: [ ] }
            }
        },
        tests: [
            {
                cli: [ "johnson", "--foo", "baz", "quux", "--bar", "skorge", "twiddleyeah" ],
                expected: "",
            }, {
                cli: [ "nixon", "--foo", "baz", "quux", "--bar", "skorge", "twiddleyeah" ],
                expected: "",
            }, {
                cli: [ "--foo", "baz", "quux", "--bar", "skorge", "twiddleyeah" ],
                expected: "",
            }
        ],
    }
];


function optionMapRefresh(map) {
    for(var k in map) {
        if(k == 0)
            continue;
        var curmap = map[k];
        if(curmap.vals !== undefined) {
            curmap.vals = [ ];
        } else if(curmap.cnt !== undefined) {
            curmap.cnt = 0;
        } else {
            optionMapRefresh(curmap);
        }
    }
}


for(var t = 0; t < tests.length; t++) {
    console.log("\n" + t + " Testing " + tests[t].name + " ==================================\n");
    for(var c = 0; c < tests[t].cli.length; c++) {
        console.log("\n" + t + "." + c + " ARGS: " + tests[t].cli[c].join(" ") + " ---------------------------\n");

        while(process.argv.length > 2)
            process.argv.pop();

        for(var a = 0; a < tests[t].cli[c].length; a++)
            process.argv.push(tests[t].cli[c][a]);

        try {
            optionMapRefresh(tests[t].optionMap);
            parse(tests[t].optionMap, { subcommand: tests[t].subcommand, doubleDash: true});
        } catch(e) {
            console.log(e);
            console.log("-------");
        } finally {
            dump(tests[t].optionMap);
        }

    }
}



