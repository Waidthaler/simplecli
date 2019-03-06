# minicle
A Node.js module for easily processing command line switches and arguments.

There are scads of CLI argument processors out there, so why another one? Mostly 
because the others aim to do too much and can be a pain to use when you just 
need something quick and simple. All it does is parse CLI options. It doesn't 
handle exotic edge cases, generate usage information, validate arguments, or 
anything else.

## Usage Example
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
place.

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
