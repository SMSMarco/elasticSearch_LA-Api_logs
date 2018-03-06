// Author: Marco Ortiz
// Date:   02.21.2018

// Usage:
// $ node input --f c:/LA-API-logs/dailyLogs/2018/01-Jan --i myindex --t mylog
// or just -> $ node input --f c:/LA-API-logs/dailyLogs/2018/01-Jan (defaults)
//*******************************************************************************************************/

var yargs = require('yargs');

// yargs: command line config for HELP and input flags
var argv = yargs.usage('Usage: $0 -f [input JSON file] -i [Elasticsearch index to write to] -t [Elasticsearch type to write]')
    .version('1.0.0') //.version() extracts the current version directly from package.json
    .demand(['f'])
    .alias('f', 'filePath')
    .describe('f', 'Path to input JSON file')
    .alias('i', 'indexPrefix')
    .describe('i', 'Elasticsearch index prefix')
    .default('i', 'api_log_')
    .alias('t', 'logType')
    .describe('t', 'Elasticsearch type name')
    .default('t', 'api_log')
    .alias('v', 'verbose')
    .help('h')
    .alias('h', 'help')
    .example( "1. node $0 --f c:/LA-API-logs/dailyLogs/2018/01-Jan ")
    .example( "" )
    .example( "2. node $0 --f c:/LA-API-logs/dailyLogs/2018/01-Jan --i myindex_ --t mylog" )
    .example( "" )
    .example("NOTE: ElasticSearch names for indexPrefix and logType should be in lower case")
    .epilog('for more information, find the documentation at https://github.com/seniormarketsales/LA-ElasticSearch/blob/master/readme.md')
    .argv;

// when no value was passed to -f
if (argv.filePath == true) {
    argv.filePath = "";
}    

/*** call bash file ******************************************************************/

// call esUpload.sh bash file passing array of file names from the requested directory
const child_process = require('child_process');
const child = child_process.spawn('bash', [__dirname + '/esUpload.sh', argv.filePath, argv.indexPrefix, argv.logType]);
child.on('exit', (code) => {
  if ( code == 1 ) {
    console.log('ElasticSearch upload NOT done');
  } else {
    console.log('ElasticSearch upload DONE for ' + argv.filePath);
  }
});

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)