// Author: Marco Ortiz
// Date:   02.13.2018
//**********************************************************************************************

// required node modules **********************/
var minimist = require('minimist');

// Set default values for options passed in via CLI
var knownOptions = {
  string: ['fileName'],
  default: { 
              'indexPrefix': 'api_log_',
              'logType': 'api_log',
              'file_counter': file_counter
           }
};

// Parse CLI arguments and store in "options" object
var options = minimist(process.argv.slice(2), knownOptions);

var fileName  = options.fileName,
 indexPrefix  = options.indexPrefix,
 logType      = options.logType,
 file_counter = options.file_counter;

//**********************************************************************************************

// Dependencies
var fs = require('fs'),                 // used to read files from filesystem
    readline = require('readline');     // used to stream file contents line by line

// Defaults
var filePath = fileName,
    rec_counter = 0,
    header = "",
    objJSONLine,
    line,
    rd;

// Capture date stamp as YYYY.MM.DD
var myIndexName = indexPrefix + filePath.match(/\d{4}-\d{2}-\d{2}/g)[0].replace(/\-/g,".");
var myIndexName = myIndexName + '.' + file_counter;

// Create incoming file stream with raw log data to process
rd = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    console: false
});

// Process log file line-by-line
rd.on('line', function(line) {
    rec_counter++;

    // Create header text
    header = JSON.stringify({ "index":{"_index":myIndexName,"_type":logType, "_id":rec_counter } });

    // *********** Transform Invalid Data/Structures into ElasticSearch Friendly Format ********************
     
    // Stringify the contents of http_body
    objJSONLine = JSON.parse(line);
    objJSONLine.request.http_body = JSON.stringify(objJSONLine.request.http_body);
    objJSONLine.response.http_body = JSON.stringify(objJSONLine.response.http_body);

    // Output results to buffer so it can be captured and saved into new file
    console.log(header);
    console.log(JSON.stringify(objJSONLine));
});
