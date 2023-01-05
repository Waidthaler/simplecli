#!/usr/bin/env node

var m = require("./minicle.js");
var hex = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" ];


m.outputHeader("Minicle Illustration Generator", "pcdos2", "@0B@");

console.log("\n" + m.paragraphize(
    "This program generates text demonstrating Minicle's ANSI text-handling capabilities "
    + "so they can be screenshotted and saved to the /img subdirectory for use in the "
    + "documentation. It also serves as an informal test bed.",
    { join: true }
) + "\n");



for(var bg = 0; bg < 16; bg++) {
    var line = "";
    for(var fg = 0; fg < 16; fg++) {
        line += "@" + hex[bg] + hex[fg] + "@ " + hex[bg] + hex[fg] + " ";
    }
    line += "@07@";
    console.log(m.ansiMarkup(line));
}

console.log("");

m.outputHeader("@0E@MyProg v1.2.0@07@ -- @0B@Processing for something made easy@07@", "pcdos2", "@0C@");

console.log("");

console.log(m.ansiMarkup("This text features both @0B@foreground@07@ and @2E@background@07@ colors."));

console.log("");

var para = "This is a short sample paragraph, intended for use in the documentation of Minicle. It's just long enough to demonstrate the paragraphize method.";

console.log(m.paragraphize("LEFT: " + para, { width: 32, join: true }));
console.log("");
console.log(m.paragraphize("RIGHT: " + para, { width: 32, join: true, align: "right" }));
console.log("");
console.log(m.paragraphize("CENTER: " + para, { width: 32, join: true, align: "center" }));
console.log("");
console.log(m.paragraphize("FULL: " + para, { width: 32, join: true, align: "full" }));
console.log("");

console.log(m.textBox("basic", "basic", { width: 20 }).join("\n"));
console.log("");
console.log(m.textBox("ascii", "ascii", { width: 20 }).join("\n"));
console.log("");
console.log(m.textBox("pcdos1", "pcdos1", { width: 20 }).join("\n"));
console.log("");
console.log(m.textBox("pcdos2", "pcdos2", { width: 20 }).join("\n"));
console.log("\n\n\n");

var es = [
    "lcAsciiGap",
    "lcAsciiNoGap",
    "lcPcdos1Gap",
    "lcPcdos1NoGap",
    "lcPcdos2Gap",
    "lcPcdos2NoGap",
    "lcOpenDash",
    "lcOpenDashEq",
    "lcOpenEqual",
    "lcOpenEqId",
    "lcOpenIdent",
    "lcOpenHash",
    "lcOpenAt",
    "lcClosedDash",
    "lcClosedDashEq",
    "lcClosedEqual",
    "lcClosedEqId",
    "lcClosedIdent",
    "lcClosedHash",
    "lcClosedAt",
];

for(var i = 0; i < es.length; i++) {
    console.log(m.textBox(es[i], m.extraStyles[es[i]], { width: 20 }).join("\n") + "\n");
}



m.errmsg("debug", "This is a debug-level message.", null, { verbosity: 4 });
console.log("");
m.errmsg("info", "This is an info-level message.", null, { verbosity: 4 });
console.log("");
m.errmsg("warn", "This is a warn-level message.", "somefunc", { verbosity: 4 });
console.log("");
m.errmsg("fatal", "This is a fatal-level message.", "other location", { verbosity: 4 });
