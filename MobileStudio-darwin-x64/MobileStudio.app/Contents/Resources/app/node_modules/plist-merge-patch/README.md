# plist-merge-patch
Info.plist merging module.
Inspired by `json-merge-patch`.

The tool is still a baby.
We gladly accept unit test contributions.

## Usage
```
var fs = require("fs");
var plistmergepatch = require("plist-merge-patch");

var session = new plistmergepatch.PlistSession(console);
session.load({
	name: "base",
	read: function() { return fs.readFileSync("Info.plist").toString(); }
});
session.patch({
	name: "patch",
	read: function() { return fs.readFileSync("Patch.plist").toString(); }
});
var result = session.build();
fs.writeFileSync("Result.plist", result);
```

## Working with the repo
```
$ npm install

$ npm test
$ npm test
$ npm test

$ npm publish
```