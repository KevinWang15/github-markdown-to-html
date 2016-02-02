#!/usr/bin/env node

var fs = require('fs');
var process = require('process');
var needle = require('needle');

var fileName = process.argv.splice(2)[0];
var content, style;

if (!fileName || fileName == "--help") {
    printHelp();
    return;
}

try {
    style = fs.readFileSync(__dirname + '/style.css', {encoding: "utf8"});
} catch (Exception) {
    console.log('style.css not found');
    return;
}
try {
    content = fs.readFileSync(fileName, {encoding: "utf8"});
} catch (Exception) {
    console.log('File "' + fileName + '" not found');
    return;
}

var payload = {text: content, mode: "gfm", "context": "github/gollum"},
    options = {
        compressed: true,
        follow: 10,
        accept: 'application/vnd.github.full+json',
        json: true
    };

console.log("Working on it..");
needle.post("https://api.github.com/markdown", payload, options, function (err, resp, body) {
    if (!err && resp.statusCode == 200) {

        var content = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
            '<title>' + fileName + '</title>' +
            '<style>' + style + '</style>' +
            '</head><body>'
            + resp.body + '</body></html>';

        fs.writeFileSync(fileName + ".html", content);
        console.log(fileName + '.html generated');
    }
    else
        console.log(resp.statusCode + " " + resp.statusMessage, resp.body);
});

function printHelp() {
    console.log("Usage: gmd [filename]\n       will generate [filename].html\n\n       e.g. gmd README.md\n            generates README.md.html");
}