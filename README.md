# minicle v1.0.5

Minicle is Node module for easily processing command line switches and arguments.

There are scads of CLI argument processors out there, so why another one? Mostly 
because the others aim to do too much and can be a pain to use when you just 
need something quick and simple. All it does is parse CLI options. It doesn't 
handle exotic edge cases, generate usage information, validate arguments, or 
anything else.

NEW in v1.0.5: Minicle now supports GNU-style `--` end-of-switches.

## Table of Contents

* [Basic Usage](#basic-usage)
* [Git-Style Subcommands](#subcommands)
* [Options](#options)
* [License](#license)
* [Todo](#todo)
* [Changelog](#changelog)

<a name="basic-usage"></a>
## Basic Usage Example
```javascript
var parse = require("minicle");

var optionMap = {
    infile:     { short: "i", vals: [ ] },
    outfile:    { short: "s", vals: [ ], max: 1 },
    verbose:    { short: "v", cnt: 0 },
    "@general": { vals: [ ] }
};

parse(optionMap);
```

The `parse` function takes `optionMap` as its sole argument, which is an object 
containing the command line switches and their parameters. It is altered in 
place, so once it returns, you're done!

The keys of the object represent the long form, so `infile` becomes `--infile`. 
The associated value is an object with the switch parameters. The `short` member 
specifies the short form of the switch, e.g., `short: "i"` creates `-i`. 
Switches with a `vals` member containing an array accumulate arguments.

In the case of `infile`, the user can specify `--infile` or `-i`, and any 
non-switch tokens following it will be pushed onto the `vals` array until the next
switch or the end of the CLI arguments. If the optional `max` member is provided,
it specifies a maximum number of arguments, after which further tokens are placed
in the `vals` array of the special `@general` member. If no `@general` member
exists, one will be created.

The following command lines are equivalent:

```javascript
myprog -i foo -i bar
myprog --infile foo --infile bar
myprog --infile foo bar

// will yield:

var optionMap = {
    infile:     { short: "i", vals: [ "foo", "bar" ] },
    outfile:    { short: "s", vals: [ ], max: 1 },
    verbose:    { short: "v", cnt: 0 },
    "@general": { vals: [ ] }
};
```

But if you try passing multiple arguments to `--outfile`, which has `max: 1`, 
all arguments after the first will end up in `@general`:

```javascript
myprog -o foo -o bar
myprog -o foo bar

// will yield:

var optionMap = {
    infile:     { short: "i", vals: [ ] },
    outfile:    { short: "s", vals: [ "foo" ], max: 1 },
    verbose:    { short: "v", cnt: 0 },
    "@general": { vals: [ "bar" ] }
};
```

Switches with a `cnt: 0` member instead of `vals` do not take arguments; they
simply accumulate a count of how many times they have been used. The classical
case is a verbosity switch, e.g.:

```javascript
myprog -v -v -v
myprog --verbose --verbose --verbose
myprog -vvv

// will yield:

var optionMap = {
    infile:     { short: "i", vals: [ ] },
    outfile:    { short: "s", vals: [ ], max: 1 },
    verbose:    { short: "v", cnt: 3 },
    "@general": { vals: [ ] }
};
```

Note that, as usual, short options without arguments can be combined.

<a name="subcommands"></a>
## Git-style Subcommands

Using git-style subcommands requires little more than nesting objects
in `optionMap` with the commands as top-level keys. This optionally
includes `@none`, which defines switches available when no command is
provided, and `@all`, which defines switches available regardless of
the command.

```javascript
var optionMap = {
    add: {
        "filename":  { short: "f", vals: [ ] },
        "overwrite": { short: "o", cnt: 0 },
        "@general":  { vals: [ ] },
    },
    update: {
        "filename":  { short: "f", vals: [ ] },
        "force":     { short: "F", cnt: 0 },
    },
    "@none": {
        "test":      { short: "t", vals: [ ], max: 1 },
        "@general":  { vals: [ ] },
    },
    "@all": {
        "help":      { short: "h", cnt: 0 }
    }
};
```


The following command lines then become possible:

```bash
$ myprog add --filename foo.txt -d
$ myprog remove -f foo.txt -F
$ myprog --test one two three
```

For minicle to recognize this, the `options` argument should include `subcommand: true`, e.g.

```javascript
parse(optionMap, { subcommand: true });
```

The top-level keys are the subcommands, and their associated objects are the 
same as the regular `optionMap` when not using subcommands. There are two 
additional optional top-level entries, `@none` and `@all`, both of which are 
optional. The `@none` object specifies switches that can be used when no 
subcommand is given, and `@all` specifies switches that can be used with any or 
no subcommand. The `@all` options should __not__ include a `@general` entry.

If a subcommand is used, minicle will insert it into `optionMap` as the value
of a key named `@subcommand`.

<a name="options">
## Options

There are currently two settings that can be passed in the optional `options`
argument to the `parse` function:

* `subcommands`: If `true`, subcommands are enabled.
* `doubleDash`: If `true`, the appearance of `--` in the command line ends 
   the parsing of switches and all subsequent arguments go into the appropriate
   `@general` element.

<a name="license"></a>
## License

Copyright 2019 Erich Waidthaler and subsequent contributors

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this 
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, 
this list of conditions and the following disclaimer in the documentation and/or 
other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR 
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON 
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

<a name="todo"></a>
## Todo

* ~~Add -- GNU-style end-of-switches flag. The `max` and `@general` elements made
  clear to me what the author of `getopts` was thinking.~~
* _Much_ more testing.
* ~~Improved docs, more examples, maybe a tutorial. Make it as easy as possible
  for people with different learning modalities to understand.~~
* Update listings

<a name="changelog"></a>
## Changelog

1.0.5: Added `doubleDash` option, improved docs, tested heavily.

1.0.4: Added `@subcommand` to `optionMap` results, documented same.

1.0.3: We don't talk about this anymore.

1.0.2: Fixed bug that threw an uncaught exception when no CLI arguments were given.

1.0.1: Updated docs to include the necessary options for subcommands.

