// Author: Marco Ortiz
// Date:   02.16.2018
//**********************************************************************************************

// Dependencies
var fs = require('fs'),                 // used to read files from filesystem
    readline = require('readline');     // used to stream file contents line by line

// Using external command line arguments 
for (let j = 2; j < process.argv.length; j++) {  
    // passing file names via command line arguments by esUpload.sh bash file
    filePath = process.argv[j];
}

// Create incoming file stream with raw log data to process
rd = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    console: false
});

// Process log file line-by-line
rd.on('line', function(line) {
    // Output results to buffer so it can be captured and saved into new file
    console.log(line);
});