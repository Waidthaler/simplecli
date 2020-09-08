#!/usr/bin/env node

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
//        "$general": { vals: [ ] },               // accumulates naked arguments
//    }

var Minicle = require("../index.js");
var ac      = require("ansi-colors");

// constructor tests ===========================================================

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
        optionMapJSON: '{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}}',
        testItems: [
            {
                cli: "gonzo",
                expected: null,
                crashExpected: true,
            }, {
                cli: "--able foo bar baz --baker quux --charlie",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1}}',
                crashExpected: false,
            }, {
                cli:  "--able foo bar baz --baker quux johnson --charlie",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"$general":{"vals":["johnson"]}}',
                crashExpected: true,
            }, {
                cli:  "-a foo bar baz -b quux -c",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1}}',
                crashExpected: false,
            }, {
                cli:  "-a foo -a bar -a baz --baker fnord -ccc",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["fnord"],"max":1},"charlie":{"short":"c","cnt":3}}',
                crashExpected: false,
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
            "$general": { vals: [ ] }
        },
        optionMapJSON: '{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":[]}}',
        testItems: [
            {
                cli:  "gonzo",
                expected: '{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":["gonzo"]}}',
                crashExpected: false,
            }, {
                cli:  "--able foo bar baz --baker quux --charlie",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"$general":{"vals":[]}}',
                crashExpected: false,
            }, {
                cli:  "--able foo bar baz --baker quux johnson --charlie",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"$general":{"vals":["johnson"]}}',
                crashExpected: false,
            }, {
                cli:  "-a foo bar baz -b quux -c",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"$general":{"vals":[]}}',
                crashExpected: false,
            }, {
                cli:  "-a foo -a bar -a baz --baker fnord -ccc",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["fnord"],"max":1},"charlie":{"short":"c","cnt":3},"$general":{"vals":[]}}',
                crashExpected: false,
            }, {
                cli:  "-a foo -b bar -- one two three four",
                expected: '{"able":{"short":"a","vals":["foo"]},"baker":{"short":"b","vals":["bar"],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":["one","two","three","four"]}}',
                crashExpected: false,
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
                "$general": { vals: [ ] }
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
            "$none": {
                delta:      { short: "d", vals: [ ] },
                echo:       { short: "e", vals: [ ], max: 1 },
                foxtrot:    { short: "f", cnt: 0 },
                "$general": { vals: [ ] }
            },
            "$all": {
                golf:       { short: "g", vals: [ ] },
                hotel:      { short: "h", vals: [ ], max: 1 },
                india:      { short: "i", cnt: 0 },
            },
        },
        optionMapJSON: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"$none":{"delta":{"short":"d","vals":[]},"echo":{"short":"e","vals":[],"max":1},"foxtrot":{"short":"f","cnt":0},"$general":{"vals":[]}},"$all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":[],"max":1},"india":{"short":"i","cnt":0}}}',
        testItems: [
            {
                cli:  "johnson -a fee fi fo fum -b kermit GONZO -h hoober",
                expected: '{"johnson":{"able":{"short":"a","vals":["fee","fi","fo","fum"]},"baker":{"short":"b","vals":["kermit"],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":["GONZO"]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"$none":{"delta":{"short":"d","vals":[]},"echo":{"short":"e","vals":[],"max":1},"foxtrot":{"short":"f","cnt":0},"$general":{"vals":[]}},"$all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":["hoober"],"max":1},"india":{"short":"i","cnt":0}},"$subcommand":"johnson"}',
                crashExpected: false,
            }, {
                cli:  "--delta foo bar -h one GONZO",
                expected: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"$none":{"delta":{"short":"d","vals":["foo","bar"]},"echo":{"short":"e","vals":[],"max":1},"foxtrot":{"short":"f","cnt":0},"$general":{"vals":["GONZO"]}},"$all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":["one"],"max":1},"india":{"short":"i","cnt":0}}}',
                crashExpected: false,
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
                "$general": { vals: [ ] }
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
            "$none": {
                "$general": { vals: [ ] }
            },
            "$all": {
                golf:       { short: "g", vals: [ ] },
                hotel:      { short: "h", vals: [ ], max: 1 },
                india:      { short: "i", cnt: 0 },
            },
        },
        optionMapJSON: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"$none":{"$general":{"vals":[]}},"$all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":[],"max":1},"india":{"short":"i","cnt":0}}}',
        testItems: [
            {
                cli:  "johnson --golf tee -a fee fi fo fum -b kermit GONZO -h hoobler",
                expected: '{"johnson":{"able":{"short":"a","vals":["fee","fi","fo","fum"]},"baker":{"short":"b","vals":["kermit"],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":["GONZO"]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"$none":{"$general":{"vals":[]}},"$all":{"golf":{"short":"g","vals":["tee"]},"hotel":{"short":"h","vals":["hoobler"],"max":1},"india":{"short":"i","cnt":0}},"$subcommand":"johnson"}',
                crashExpected: false,
            }, {
                cli:  "--golf foo bar -h one GONZO",
                expected: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"$general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"$none":{"$general":{"vals":["GONZO"]}},"$all":{"golf":{"short":"g","vals":["foo","bar"]},"hotel":{"short":"h","vals":["one"],"max":1},"india":{"short":"i","cnt":0}}}',
                crashExpected: false,
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
                "$general": { vals: [ ] }
            },
            nixon: {
                foo:        { short: "f", vals: [ ] },
                bar:        { short: "b", vals: [ ], max: 1 }
            },
            "$none": {
                foo:        { short: "f", vals: [ ] },
                bar:        { short: "b", vals: [ ], max: 1 },
                "$general": { vals: [ ] }
            }
        },
        optionMapJSON: '{"johnson":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"$general":{"vals":[]}},"nixon":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1}},"$none":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"$general":{"vals":[]}}}',
        testItems: [
            {
                cli:  "johnson --foo baz quux --bar skorge twiddleyeah",
                expected: '{"johnson":{"foo":{"short":"f","vals":["baz","quux"]},"bar":{"short":"b","vals":["skorge"],"max":1},"$general":{"vals":["twiddleyeah"]}},"nixon":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1}},"$none":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"$general":{"vals":[]}},"$subcommand":"johnson"}',
                crashExpected: false,
            }, {
                cli:  "nixon --foo baz quux --bar skorge twiddleyeah",
                expected: '{"johnson":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"$general":{"vals":[]}},"nixon":{"foo":{"short":"f","vals":["baz","quux"]},"bar":{"short":"b","vals":["skorge"],"max":1},"$general":{vals:[]}},"$none":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"$general":{"vals":[]}},"$subcommand":"nixon"}',
                crashExpected: true,
            }, {
                cli:  "--foo baz quux --bar skorge twiddleyeah",
                expected: '{"johnson":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"$general":{"vals":[]}},"nixon":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1}},"$none":{"foo":{"short":"f","vals":["baz","quux"]},"bar":{"short":"b","vals":["skorge"],"max":1},"$general":{"vals":["twiddleyeah"]}}}',
                crashExpected: false,
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
    if(map["$subcommand"])
        delete map["$subcommand"];
}


function header(str, level = 1) {
    var line76 = [
        "                                                                            ",
        "----------------------------------------------------------------------------",
        "============================================================================"
    ];

    return str + " " + line76[level].substr(str.length);

}


var fail    = 0;
var okay    = 0;
var total   = 0;


for(var t = 0; t < tests.length; t++) {
    console.log("\n" + ac.bold.bgBlue(header(t + " Testing " + tests[t].name, 2)) + "\n");
    for(var c = 0; c < tests[t].testItems.length; c++) {
        total++;
        console.log("\n" + ac.bold.cyan.bgBlackBright(header(t + "." + c + " ARGS: " + tests[t].testItems[c].cli, 0)) + "\n");

        while(process.argv.length > 2)
            process.argv.pop();

        var args = tests[t].testItems[c].cli.split(/\s+/);

        for(var a = 0; a < args.length; a++)
            process.argv.push(args[a]);

        var crash = false;
        try {
            optionMapRefresh(tests[t].optionMap);
            new Minicle(tests[t].optionMap, { subcommand: tests[t].subcommand, doubleDash: true});
        } catch(e) {
            console.log(ac.red.bold(e) + "\n");
            crash = true;
        }

        if(crash) {
            if(tests[t].testItems[c].crashExpected) {
                console.log(ac.cyan("Result:   ") + ac.bgGreen.bold.white(" OKAY "));
                okay++;
            } else {
                console.log(ac.cyan("Result:   ") + ac.bgRed.bold.yellow(" FAIL "));
                fail++;
            }
        } else {
            var result = JSON.stringify(tests[t].optionMap);
            if(tests[t].testItems[c].expected != result || tests[t].testItems[c].crashExpected) {
                console.log(ac.cyan.bold("Result:   ") + ac.bgRed.yellow.bold(" FAIL "));
                fail++;
            } else {
                console.log(ac.cyan("Result:   ") + ac.bgGreen.white.bold(" OKAY "));
                okay++;
            }
            console.log(ac.cyan("\nExpected: ") + tests[t].testItems[c].expected);
            console.log(ac.cyan("\nReceived: ") + result);
        }
        console.log("");
    }
}


// usage() tests ===============================================================

var tests = [
        {
            om: {
                "able":         { "short": "a", "vals": [] },
                "baker":        { "short": "b", "vals": [], "max": 1 },
                "charlie":      { "short": "c", "cnt": 0 },
                "$general":     { "vals": [] }
            }
        }, {
            om: {
                "able":         { "short": "a", "vals": [] },
                "baker":        { "short": "b", "vals": [], "max": 1 },
                "charlie":      { "short": "c", "cnt": 0 }
            }
        }, {
            om: {
                "johnson": {
                    "able":     { "short": "a", "vals": [] },
                    "baker":    { "short": "b", "vals": [], "max": 1 },
                    "charlie":  { "short": "c", "cnt": 0 },
                    "$general": { "vals": [] }
                },
                "nixon": {
                    "able":     { "short": "a", "vals": [] },
                    "baker":    { "short": "b", "vals": [], "max": 1 },
                    "charlie":  { "short": "c", "cnt": 0 }
                },
                "carter": {
                    "able":     { "short": "a", "vals": [] },
                    "baker":    { "short": "b", "vals": [], "max": 1 },
                    "charlie":  { "short": "c", "cnt": 0 }
                },
                "$none": {
                    "$general": { "vals": [] }
                },
                "$all": {
                    "golf":     { "short": "g", "vals": [] },
                    "hotel":    { "short": "h", "vals": [], "max": 1 },
                    "india":    { "short": "i", "cnt": 0 }
                }
            }
        }, {
            om: {
                "johnson": {
                    "able":     { "short": "a", "vals": [] },
                    "baker":    { "short": "b", "vals": [], "max": 1 },
                    "charlie":  { "short": "c", "cnt": 0 },
                    "$general": { "vals": [] }
                },
                "nixon": {
                    "able":     { "short": "a", "vals": [] },
                    "baker":    { "short": "b", "vals": [], "max": 1 },
                    "charlie":  { "short": "c", "cnt": 0 }
                },
                "carter": {
                    "able":     { "short": "a", "vals": [] },
                    "baker":    { "short": "b", "vals": [], "max": 1 },
                    "charlie":  { "short": "c", "cnt": 0 }
                },
                "$none": {
                    "delta":    { "short": "d", "vals": [] },
                    "echo":     { "short": "e", "vals": [], "max": 1 },
                    "foxtrot":  { "short": "f", "cnt": 0 },
                    "$general": { "vals": [] }
                },
                "$all": {
                    "golf":     { "short": "g", "vals": [] },
                    "hotel":    { "short": "h", "vals": [], "max": 1 },
                    "india":    { "short": "i", "cnt": 0 }
                }
            }
        }, {
            om: {
                "johnson": {
                    "foo":      { "short": "f", "vals": [] },
                    "bar":      { "short": "b", "vals": [], "max": 1 },
                    "$general": { "vals": [] }
                },
                "nixon": {
                    "foo":      { "short": "f", "vals": [] },
                    "bar":      { "short": "b", "vals": [], "max": 1 }
                },
                "$none": {
                    "foo":      { "short": "f", "vals": [] },
                    "bar":      { "short": "b", "vals": [], "max": 1 },
                    "$general": { "vals": [] }
                }
            }
        }
    ];

process.argv.length = 2;

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

for(var t = 0; t < tests.length; t++) {
    console.log("\n" + ac.bold.bgBlue(header(t + ".", 2)) + "\n");
    var m = new Minicle(tests[t]);
    var content = m.usage({
        exit:      false,
        usageText: "This is the usageText.",
        lineChar:  "pcdos1",
        output:    null
    });
    console.log(content);
}


// header() tests ==============================================================

var tests = [
    {
        name: "lineChar default",
        options: {},
        expected: "\"\\n\\u001b[34m\\u001b[1m============================================================================\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m=\\u001b[22m\\u001b[39m                             \\u001b[33m\\u001b[1mlineChar default\\u001b[22m\\u001b[39m                             \\u001b[34m\\u001b[1m=\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m============================================================================\\u001b[22m\\u001b[39m\""
    },
    {
        name: "lineChar ascii",
        options: {
            "lineChar": "ascii"
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m+--------------------------------------------------------------------------+\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m|\\u001b[22m\\u001b[39m                              \\u001b[33m\\u001b[1mlineChar ascii\\u001b[22m\\u001b[39m                              \\u001b[34m\\u001b[1m|\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m+--------------------------------------------------------------------------+\\u001b[22m\\u001b[39m\""
    },
    {
        name: "lineChar pcdos1",
        options: {
            "lineChar": "pcdos1"
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m                             \\u001b[33m\\u001b[1mlineChar pcdos1\\u001b[22m\\u001b[39m                              \\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\u001b[22m\\u001b[39m\""
    },
    {
        name: "lineChar pcdos2",
        options: {
            "lineChar": "pcdos2"
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2551\\u001b[22m\\u001b[39m                             \\u001b[33m\\u001b[1mlineChar pcdos2\\u001b[22m\\u001b[39m                              \\u001b[34m\\u001b[1m\u2551\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\\u001b[22m\\u001b[39m\""
    },
    {
        name: "lineChar 12345678",
        options: {
            "lineChar": "12345678"
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m1222222222222222222222222222222222222222222222222222222222222222222222222223\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m8\\u001b[22m\\u001b[39m                            \\u001b[33m\\u001b[1mlineChar 12345678\\u001b[22m\\u001b[39m                             \\u001b[34m\\u001b[1m4\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m7666666666666666666666666666666666666666666666666666666666666666666666666665\\u001b[22m\\u001b[39m\""
    },
    {
        name: "customColors (red/green)",
        options: {
            "customColors": {
                border: ac.red,
                title: ac.green
            },
        },
        expected: "\"\\n\\u001b[31m============================================================================\\u001b[39m\\n\\u001b[31m=\\u001b[39m                         \\u001b[32mcustomColors (red/green)\\u001b[39m                         \\u001b[31m=\\u001b[39m\\n\\u001b[31m============================================================================\\u001b[39m\""
    },
    {
        name: "customColors (red/green), lineChar pcdos2",
        options: {
            "customColors": {
                border: ac.red,
                title: ac.green
            },
            "lineChar": "pcdos2"
        },
        expected: "\"\\n\\u001b[31m\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\\u001b[39m\\n\\u001b[31m\u2551\\u001b[39m                \\u001b[32mcustomColors (red/green), lineChar pcdos2\\u001b[39m                 \\u001b[31m\u2551\\u001b[39m\\n\\u001b[31m\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\\u001b[39m\""
    },
    {
        name: "useColors = false",
        options: {
            "useColors": false
        },
        expected: "\"\\n============================================================================\\n=                            useColors = false                             =\\n============================================================================\""
    },
    {
        name: "Testing Width 80",
        options: {
            "lineChar": "pcdos1",
            "width": 80
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m                               \\u001b[33m\\u001b[1mTesting Width 80\\u001b[22m\\u001b[39m                               \\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\u001b[22m\\u001b[39m\""
    },
    {
        name: "Testing Width 60",
        options: {
            "lineChar": "pcdos1",
            "width": 60
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m                     \\u001b[33m\\u001b[1mTesting Width 60\\u001b[22m\\u001b[39m                     \\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\u001b[22m\\u001b[39m\""
    },
    {
        name: "Testing Width 40",
        options: {
            "lineChar": "pcdos1",
            "width": 40
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m           \\u001b[33m\\u001b[1mTesting Width 40\\u001b[22m\\u001b[39m           \\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\u001b[22m\\u001b[39m\""
    },
    {
        name: "Testing Width 20",
        options: {
            "lineChar": "pcdos1",
            "width": 20
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m \\u001b[33m\\u001b[1mTesting Width 20\\u001b[22m\\u001b[39m \\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\u001b[22m\\u001b[39m\""
    },
    {
        name: "Testing Width 10",
        options: {
            "lineChar": "pcdos1",
            "width": 10
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\u001b[33m\\u001b[1mTesting \\u001b[22m\\u001b[39m\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\u001b[22m\\u001b[39m\""
    },
    {
        name: "Testing Width 8",
        options: {
            "lineChar": "pcdos1",
            "width": 8
        },
        expected: "\"\\n\\u001b[34m\\u001b[1m\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\u001b[33m\\u001b[1mTestin\\u001b[22m\\u001b[39m\\u001b[34m\\u001b[1m\u2502\\u001b[22m\\u001b[39m\\n\\u001b[34m\\u001b[1m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\u001b[22m\\u001b[39m\""
    }
];


process.argv.length = 2;
var m = new Minicle({});

for(var t = 0; t < tests.length; t++) {
    console.log("\n" + ac.bold.bgBlue(header(t + ". Testing " + tests[t].name, 2)) + "\n");
    var opts = { };
    for(var k in tests[t].options)
        opts[k] = tests[t].options[k];
    opts.output = null;
    var res = m.header(tests[t].name, opts);
    console.log(res);

    if(res == JSON.parse(tests[t].expected)) {
        console.log(ac.cyan("\nResult:   ") + ac.bgGreen.bold.white(" OKAY "));
        okay++;
    } else {
        console.log(ac.cyan("\nResult:   ") + ac.bgRed.bold.yellow(" FAIL "));
        fail++;
    }
    total++;
}


// errmsg() tests ==============================================================

var tests = [
    {
        name: "Testing FATAL error w/location",
        level: "fatal",
        verbosity: 3,
        message: "This is a fatal error message with a location!",
        location: "test.js",
        expected: "\u001b[33m\u001b[1m\u001b[41m FATAL \u001b[49m\u001b[22m\u001b[39m\u001b[31m\u001b[1m This is a fatal error message with a location! \u001b[22m\u001b[39m\u001b[37m\u001b[1m(test.js)\u001b[22m\u001b[39m"
    },
    {
        name: "Testing FATAL error w/o location",
        level: "fatal",
        verbosity: 3,
        message: "This is a fatal error message without a location!",
        expected: "\u001b[33m\u001b[1m\u001b[41m FATAL \u001b[49m\u001b[22m\u001b[39m\u001b[31m\u001b[1m This is a fatal error message without a location!\u001b[22m\u001b[39m"
    },
    {
        name: "Testing FATAL error w/location (suppressed)",
        level: "fatal",
        verbosity: -1,
        message: "This is a fatal error message with a location! But you shouldn't see it.",
        location: "test.js"
    },
    {
        name: "Testing FATAL error w/o location (suppressed)",
        level: "fatal",
        verbosity: -1,
        message: "This is a fatal error message without a location! But you shouldn't see it."
    },
    {
        name: "Testing WARN error w/location",
        level: "warn",
        verbosity: 3,
        message: "This is a warn error message with a location!",
        location: "test.js",
        expected: "\u001b[31m\u001b[1m\u001b[103m WARN \u001b[49m\u001b[22m\u001b[39m\u001b[33m\u001b[1m This is a warn error message with a location! \u001b[22m\u001b[39m\u001b[37m\u001b[1m(test.js)\u001b[22m\u001b[39m"
    },
    {
        name: "Testing WARN error w/o location",
        level: "warn",
        verbosity: 3,
        message: "This is a warn error message without a location!",
        expected: "\u001b[31m\u001b[1m\u001b[103m WARN \u001b[49m\u001b[22m\u001b[39m\u001b[33m\u001b[1m This is a warn error message without a location!\u001b[22m\u001b[39m"
    },
    {
        name: "Testing WARN error w/location (suppressed)",
        level: "warn",
        verbosity: -1,
        message: "This is a warn error message with a location! But you shouldn't see it.",
        location: "test.js"
    },
    {
        name: "Testing WARN error w/o location (suppressed)",
        level: "warn",
        verbosity: -1,
        message: "This is a warn error message without a location! But you shouldn't see it."
    },
    {
        name: "Testing INFO error w/location",
        level: "info",
        verbosity: 3,
        message: "This is a info error message with a location!",
        location: "test.js",
        expected: "\u001b[37m\u001b[1m\u001b[42m INFO \u001b[49m\u001b[22m\u001b[39m\u001b[32m\u001b[1m This is a info error message with a location! \u001b[22m\u001b[39m\u001b[37m\u001b[1m(test.js)\u001b[22m\u001b[39m"
    },
    {
        name: "Testing INFO error w/o location",
        level: "info",
        verbosity: 3,
        message: "This is a info error message without a location!",
        expected: "\u001b[37m\u001b[1m\u001b[42m INFO \u001b[49m\u001b[22m\u001b[39m\u001b[32m\u001b[1m This is a info error message without a location!\u001b[22m\u001b[39m"
    },
    {
        name: "Testing INFO error w/location (suppressed)",
        level: "info",
        verbosity: -1,
        message: "This is a info error message with a location! But you shouldn't see it.",
        location: "test.js"
    },
    {
        name: "Testing INFO error w/o location (suppressed)",
        level: "info",
        verbosity: -1,
        message: "This is a info error message without a location! But you shouldn't see it."
    },
    {
        name: "Testing DEBUG error w/location",
        level: "debug",
        verbosity: 3,
        message: "This is a debug error message with a location!",
        location: "test.js",
        expected: "\u001b[37m\u001b[100m DEBUG \u001b[49m\u001b[39m\u001b[37m This is a debug error message with a location! \u001b[39m\u001b[37m(test.js)\u001b[39m"
    },
    {
        name: "Testing DEBUG error w/o location",
        level: "debug",
        verbosity: 3,
        message: "This is a debug error message without a location!",
        expected: "\u001b[37m\u001b[100m DEBUG \u001b[49m\u001b[39m\u001b[37m This is a debug error message without a location!\u001b[39m"
    },
    {
        name: "Testing DEBUG error w/location (suppressed)",
        level: "debug",
        verbosity: -1,
        message: "This is a debug error message with a location! But you shouldn't see it.",
        location: "test.js"
    },
    {
        name: "Testing DEBUG error w/o location (suppressed)",
        level: "debug",
        verbosity: -1,
        message: "This is a debug error message without a location! But you shouldn't see it."
    }
];

process.argv.length = 2;
var m = new Minicle({ output: console.log });

for(var t = 0; t < tests.length; t++) {
    console.log("\n" + ac.bold.bgBlue(header(t + ". Testing " + tests[t].name, 2)) + "\n");
    var res = m.errmsg(tests[t].level, tests[t].message, tests[t].location, { verbosity: tests[t].verbosity, output: null });
    console.log(res ? res : "");

    if(res == tests[t].expected) {
        console.log(ac.cyan("\nResult:   ") + ac.bgGreen.bold.white(" OKAY "));
        okay++;
    } else {
        console.log(ac.cyan("\nResult:   ") + ac.bgRed.bold.yellow(" FAIL "));
        fail++;
    }
    total++;

    tests[t].expected = res;
}



const fs = require("fs");
fs.writeFileSync("out", JSON.stringify(tests));

console.log("\n");
console.log(ac.green.bold(header("RESULTS:", 1) + "\n"));
console.log(ac.bgGreen.white.bold(" OKAY:  ") + " " + ac.green.bold(okay));
console.log(ac.bgRed.yellow.bold(" FAIL:  ")       + " " +  ac.yellow.bold(fail));
console.log(ac.bgWhite.black(" TOTAL: ") + " " +  ac.white.bold(total));




