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
var parse  = require("../minicle.js");
var ac     = require("ansi-colors");

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
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"@general":{"vals":["johnson"]}}',
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
            "@general": { vals: [ ] }
        },
        optionMapJSON: '{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":[]}}',
        testItems: [
            {
                cli:  "gonzo",
                expected: '{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":["gonzo"]}}',
                crashExpected: false,
            }, {
                cli:  "--able foo bar baz --baker quux --charlie",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"@general":{"vals":[]}}',
                crashExpected: false,
            }, {
                cli:  "--able foo bar baz --baker quux johnson --charlie",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"@general":{"vals":["johnson"]}}',
                crashExpected: false,
            }, {
                cli:  "-a foo bar baz -b quux -c",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["quux"],"max":1},"charlie":{"short":"c","cnt":1},"@general":{"vals":[]}}',
                crashExpected: false,
            }, {
                cli:  "-a foo -a bar -a baz --baker fnord -ccc",
                expected: '{"able":{"short":"a","vals":["foo","bar","baz"]},"baker":{"short":"b","vals":["fnord"],"max":1},"charlie":{"short":"c","cnt":3},"@general":{"vals":[]}}',
                crashExpected: false,
            }, {
                cli:  "-a foo -b bar -- one two three four",
                expected: '{"able":{"short":"a","vals":["foo"]},"baker":{"short":"b","vals":["bar"],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":["one","two","three","four"]}}',
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
        optionMapJSON: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"@none":{"delta":{"short":"d","vals":[]},"echo":{"short":"e","vals":[],"max":1},"foxtrot":{"short":"f","cnt":0},"@general":{"vals":[]}},"@all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":[],"max":1},"india":{"short":"i","cnt":0}}}',
        testItems: [
            {
                cli:  "johnson -a fee fi fo fum -b kermit GONZO -h hoober",
                expected: '{"johnson":{"able":{"short":"a","vals":["fee","fi","fo","fum"]},"baker":{"short":"b","vals":["kermit"],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":["GONZO"]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"@none":{"delta":{"short":"d","vals":[]},"echo":{"short":"e","vals":[],"max":1},"foxtrot":{"short":"f","cnt":0},"@general":{"vals":[]}},"@all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":["hoober"],"max":1},"india":{"short":"i","cnt":0}},"@subcommand":"johnson"}',
                crashExpected: false,
            }, {
                cli:  "--delta foo bar -h one GONZO",
                expected: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"@none":{"delta":{"short":"d","vals":["foo","bar"]},"echo":{"short":"e","vals":[],"max":1},"foxtrot":{"short":"f","cnt":0},"@general":{"vals":["GONZO"]}},"@all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":["one"],"max":1},"india":{"short":"i","cnt":0}}}',
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
        optionMapJSON: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"@none":{"@general":{"vals":[]}},"@all":{"golf":{"short":"g","vals":[]},"hotel":{"short":"h","vals":[],"max":1},"india":{"short":"i","cnt":0}}}',
        testItems: [
            {
                cli:  "johnson --golf tee -a fee fi fo fum -b kermit GONZO -h hoobler",
                expected: '{"johnson":{"able":{"short":"a","vals":["fee","fi","fo","fum"]},"baker":{"short":"b","vals":["kermit"],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":["GONZO"]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"@none":{"@general":{"vals":[]}},"@all":{"golf":{"short":"g","vals":["tee"]},"hotel":{"short":"h","vals":["hoobler"],"max":1},"india":{"short":"i","cnt":0}},"@subcommand":"johnson"}',
                crashExpected: false,
            }, {
                cli:  "--golf foo bar -h one GONZO",
                expected: '{"johnson":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0},"@general":{"vals":[]}},"nixon":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"carter":{"able":{"short":"a","vals":[]},"baker":{"short":"b","vals":[],"max":1},"charlie":{"short":"c","cnt":0}},"@none":{"@general":{"vals":["GONZO"]}},"@all":{"golf":{"short":"g","vals":["foo","bar"]},"hotel":{"short":"h","vals":["one"],"max":1},"india":{"short":"i","cnt":0}}}',
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
        optionMapJSON: '{"johnson":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"@general":{"vals":[]}},"nixon":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1}},"@none":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"@general":{"vals":[]}}}',
        testItems: [
            {
                cli:  "johnson --foo baz quux --bar skorge twiddleyeah",
                expected: '{"johnson":{"foo":{"short":"f","vals":["baz","quux"]},"bar":{"short":"b","vals":["skorge"],"max":1},"@general":{"vals":["twiddleyeah"]}},"nixon":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1}},"@none":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"@general":{"vals":[]}},"@subcommand":"johnson"}',
                crashExpected: false,
            }, {
                cli:  "nixon --foo baz quux --bar skorge twiddleyeah",
                expected: '{"johnson":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"@general":{"vals":[]}},"nixon":{"foo":{"short":"f","vals":["baz","quux"]},"bar":{"short":"b","vals":["skorge"],"max":1},"@general":{vals:[]}},"@none":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"@general":{"vals":[]}},"@subcommand":"nixon"}',
                crashExpected: true,
            }, {
                cli:  "--foo baz quux --bar skorge twiddleyeah",
                expected: '{"johnson":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1},"@general":{"vals":[]}},"nixon":{"foo":{"short":"f","vals":[]},"bar":{"short":"b","vals":[],"max":1}},"@none":{"foo":{"short":"f","vals":["baz","quux"]},"bar":{"short":"b","vals":["skorge"],"max":1},"@general":{"vals":["twiddleyeah"]}}}',
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
    if(map["@subcommand"])
        delete map["@subcommand"];
}


function header(str, level = 1) {
    var line76 = [
        "                                                                            ",
        "----------------------------------------------------------------------------",
        "============================================================================"
    ];

    return str + " " + line76[level].substr(str.length);

}

var crashes = 0;
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
            parse(tests[t].optionMap, { subcommand: tests[t].subcommand, doubleDash: true});
        } catch(e) {
            console.log(ac.red.bold(e) + "\n");
            crash = true;
        }

        if(crash) {
            crashes++;
            if(tests[t].testItems[c].crashExpected) {
                console.log(ac.cyan("Result:   ") + ac.bgGreen.bold.white(" OKAY "));
                okay++;
            } else {
                console.log(ac.cyan("Result:   ") + ac.bgRed.bold.yellow(" CRASH "));
                fail++;
            }
        } else {
            var result = JSON.stringify(tests[t].optionMap);
            if(tests[t].testItems[c].expected != result || tests[t].testItems[c].crashExpected) {
                console.log(ac.cyan.bold("Result:   ") + ac.bgYellow.red(" FAIL "));
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


console.log("\n");
console.log(ac.green.bold(header("RESULTS:", 1) + "\n"));
console.log(ac.bgGreen.white.bold("OKAY:  ") + " " + ac.green.bold(okay));
console.log(ac.bgYellow.red("FAIL:  ")       + " " +  ac.yellow.bold(fail));
console.log(ac.bgRed.yellow.bold("CRASH: ")  + " " +  ac.red.bold(crashes));
console.log(ac.bgWhite.black.bold("TOTAL: ") + " " +  ac.white.bold(total));



