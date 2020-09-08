# minicle v2.0.0

Minicle is Node module for easily processing command line switches and
arguments, as well as generating console headers, usage information, and error
output.

There are scads of CLI argument processors out there, so why another one? Mostly
because the others aim to do too much and can be a pain to use when you just
need something quick and simple. All it does is parse CLI options and provide
some convenience output methods. It doesn't handle exotic edge cases, validate
arguments, or anything else.

## Table of Contents

* [Basic Usage](#basic-usage)
* [Git-Style Subcommands](#subcommands)
* [Options](#options)
* [usage()](#usage)
* [usage() Example](#usage-example)
* [header()](#header)
* [License](#license)
* [Todo](#todo)
* [Changelog](#changelog)


## Basic Usage Example <a name="basic-usage"></a>

```javascript
var Minicle = require("minicle");

var optionMap = {
    infile:     { short: "i", vals: [ ] },
    outfile:    { short: "s", vals: [ ], max: 1 },
    verbose:    { short: "v", cnt: 0 },
    "@general": { vals: [ ] }
};

var m = new Minicle(optionMap);
```

The constructor takes `optionMap` and an optional options object. The
`optionMap` object contains the command line switches and their parameters. It
is altered in place, so once it returns, you're done!

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


## Git-style Subcommands <a name="subcommands"></a>

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
$ myprog add --filename foo.txt -o something
$ myprog remove -f foo.txt -F
$ myprog --test one two three
```

The first of these yields:

```javascript
var optionMap = {
    add: {
        "filename":  { short: "f", vals: [ "foo.txt" ] },
        "overwrite": { short: "o", cnt: 1 },
        "@general":  { vals: [ "something" ] },
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
    },
    "@subcommand": "add"  // this is added by minicle at parse time
};
```

For minicle to recognize this, the `options` argument should include `subcommand: true`, e.g.

```javascript
var m = new Minicle(optionMap, { subcommand: true });
```

The top-level keys are the subcommands, and their associated objects are the
same as the regular `optionMap` when not using subcommands. There are two
additional optional top-level entries, `@none` and `@all`, both of which are
optional. The `@none` object specifies switches that can be used when no
subcommand is given, and `@all` specifies switches that can be used with any or
no subcommand.

To avoid a lot of head-scratching confusion, it is important to understand how
the `@general` catchall works with subcommands. The `@all` options should
__not__ include a `@general` entry, and Minicle will remove it for you should
you forget. Each command that accepts general arguments must have its own
`@general`, without which general arguments will throw an error. Note that this
includes the `@none` subcommand.

If a subcommand is used, minicle will insert it into `optionMap` as the value
of a key named `@subcommand`.


## Options <a name="options"></a>

There are currently two settings that can be passed in the optional `options`
argument to the constructor:

* `subcommands`: If `true`, subcommands are enabled.
* `doubleDash`: If `true`, the appearance of `--` in the command line ends
   the parsing of switches and all subsequent arguments go into the appropriate
   `@general` element. This is a common feature of GNU programs.


## usage()<a name="usage"></a>

The `usage` function takes an expanded variant of the
minicle `optionMap`, with added `args` and `desc` attributes (both optional).
It takes two arguments:

```javascript
usage(optionMap, options)
```

The `options` argument may contain the following attributes:

* **`customColors`:** An object containing custom ANSI color callbacks. [See below.](#custom-colors-usage)
* **`exit`:** If true, exit the program after output. Defaults to `true`.
* **`lineChar`:** Separator between commands, defaults to `"-"`
* **`subcommands`:** Defaults `false`, must be `true` if minicle is using git-style subcommands.
* **`usageText`:** Whatever text should follow `Usage:`. Not strictly required, but defaults to `"YOU FORGOT TO SPECIFY options.usageText!"`.
* **`useColors`:** Whether to use ANSI colors. Defaults to `true`.
* **`width`:** Maximum width of output, defaults to 76. Note that this is advisory: content does not wrap.

<a name="custom-colors-usage"></a>
### Custom Colors

Custom colors are supplied using the mysteriously named `customColors` option.
This consists of an object containing callbacks to wrap strings in ANSI color
codes, such as the functions in `ansi-colors` or `chalk`. There are five callbacks
required: `usage`, `switches`, `args`, `desc`, and `cmd`.

If you're using `ansi-colors`, assigned to `ac`, this is what the
`customColors` option would look like if you perversely insisted on duplicating
the defaults:

```javascript
customColors: {
    usage:    ac.white.bold,
    switches: ac.yellow.bold,
    args:     ac.blue.bold,
    desc:     ac.cyan.bold,
    cmd:      ac.green.bold,
}
```

## usage() Example<a name="usage-example"></a>

Starting with the basic data structure we've already seen...

```javascript
var optionMap = {
    infile:     { short: "i", vals: [ ] },
    outfile:    { short: "s", vals: [ ], max: 1 },
    verbose:    { short: "v", cnt: 0 },
    "@general": { vals: [ ] }
};
```

...all you have to do is add `args` and `desc` attributes for the switch arguments
and descriptions, respectively:

```javascript
var mu = require("minicle-usage");

var optionMap = {
    infile:     { short: "i", vals: [ ], args: "<filename>", desc: "Input file." },
    outfile:    { short: "s", vals: [ ], max: 1, args: "<filename>", desc: "Output file." },
    verbose:    { short: "v", cnt: 0, desc: "Increase verbosity level." },
    "@general": { vals: [ ] }
};

mu.usage(optionMap, { usageText: "someprog <cmd> [options]" });
```

This will yield something like:

```
  Usage: someprog <cmd> [options]

   -i, --infile      <filename>       Input file.
   -o, --outfile     <filename>       Output file.
   -v, --verbose                      Increase verbosity level.

```

Note that the `@general` option is ignored, as would be `@subcommand`. Also note
that both `args` and `desc` are both optional, though you'll nearly always want
to include `desc`.

To keep this example simple, subcommands are not shown, but they are fully supported.

The module exports an object with two functions, `usage`, which we just covered,
and the oh-so-trivial `header`, which just takes a string, centers it, and wraps it
in a box:

```javascript
mu.header("Default! Version 1.0!");
```

which outputs

```
============================================================================
=                            Default! Version 1.0!                         =
============================================================================
```

## header()<a name="header"></a>

The `header` function just emits a simple header centered in a box:

```javascript
header(content, options)
```

The `content` argument is the text in the box. The `options` argument may contain
the following attributes:

* **`customColors`:** An object containing custom ANSI color callbacks. [See below.](#custom-colors-header)
* **`lineChar`:** By default, this is a single character, `"="` to use for drawing the box. If eight characters are supplied, they are used for the eight directions, starting from the upper left and proceeding clockwise. Alternatively, `"ascii"`, `"pcdos1"`, and `"pcdos2"` are shortcuts for a few common variations.
* **`useColors`:** A boolean indicating whether to use ANSI colors. Defaults to `true`.
* **`width`:** The width of the header in characters. Defaults to 76.
* **`output`:** A callback function to receive the result. Defaults to `console.log`. If set to `null`, the string is simply returned.

### Custom Colors <a name="custom-colors-header"></a>

Defining custom colors for `header` works the same as for [custom usage colors](#custom-colors-usage)
except that the names are different, e.g.:

```javascript
    options.customColors = {
        border: ac.blue.bold,
        title:  ac.yellow.bold
    };
```


## License <a name="license"></a>

Copyright 2019-2020 Erich Waidthaler and subsequent contributors

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

* Code
    * Unify options.
    * Fix tests.
* Documentation
    * Include examples in color.
    * More examples
    * Intro starting with usage output.

<a name="changelog"></a>
## Changelog

2.0.0:
* Removed exceptions triggered by end-user error and instead return error objects.
* Merged `minicle-usage` into the main Minicle module.
* Replaced '@' in map receptacle entries with '$' so they can be used without brackets in the code.
* Filled in missing documentation on the `customColors` option to the `headers` method.

1.0.6: Updated the docs to announce minicle-usage.

1.0.5: Added `doubleDash` option, improved docs, tested heavily, fixed a bunch of edge cases.

1.0.4: Added `@subcommand` to `optionMap` results, documented same.

1.0.3: We don't talk about this anymore.

1.0.2: Fixed bug that threw an uncaught exception when no CLI arguments were given.

1.0.1: Updated docs to include the necessary options for subcommands.

