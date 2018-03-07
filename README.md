# LA-API logs to Elastic Search

Simple utility that reads LA-API daily logs, converts them into Elastic Search format and Bulk Upload them to the Elastic Search server. The logs can be manage through the Kibana console with the option of creating visualization graphics that can be integrated in a Dashboard interface.

# Software Setup

## 1. Requirements

You need to have a recent version of Java installed. See the [Setup](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html#jvm-version) page for more information.

## 2. Installation

Elastic Search

* [Download](https://www.elastic.co/downloads/elasticsearch) and unzip the Elasticsearch official distribution.

Kibana

* [Download](https://www.elastic.co/downloads/kibana) and unzip the Kibana official distribution.


## 3. Usage

  * Clone this repo
  * Run npm install
  * Run bin/elasticsearch on unix, or bin\elasticsearch.bat on windows.
  * Run bin/kibana on unix, or bin\kibana.bat on windows.
  * Go to the [Help](#help-menu) menu usage section to learn more about running the app with command line arguments


# Steps to Upload Daily LA-API logs to Elastic Search

## 1. Default Log Files Location
Daily log files are written using the [jsonl](http://jsonlines.org/) format - each line on the file represents a fully valid JSON object.

Daily log files are placed in the location specified by `settings.fileLogPath` in the coldbox.cfc (e.g. C:\LA-API-logs\dailyLogs)
    
Find daily log files organized by year, month and day.  example:
```
dailyLogs
   | --- 2018
            |--- 01-Jan
                    |--- LA-API_Daily_Log-2018-01-01.log
                    |--- LA-API_Daily_Log-2018-01-02.log

```

If you want to load logs from a remote server, download the `.log` file to a local directory on your machine.

## 2. Add Metadata to Daily Logs
In order to load log data in bulk into elasticsearch, you must first tell elasticsearch where to load the data in the files.  This is done by including a header row before each row to upload which communicates this information to elasticsearch.

* Process flow:
```
  input.js --> esUpload.sh --> applyHeaders.js --> ElasticSearch server
```  

* Example header row:
```json
{"_index":"LA-API_Daily_Logs-2017.09.01","_type":"api_log", "_id":"1"}
```
Fields:
* _index - this identifies the collection to upload the record (e.g. jsonl line) to
* _type - tells elastic search how to map the data in the json file to fields in the elasticsearch index
* _id - **UNIQUE** id for the record - must be unique within a given elasticsearch index


Use the `input.js` node file to process a log and apply the appropiate header records for each logged row.

#### applyHeaders.js

1. Processes the log file(s) to resolve/replace any data that will cause problems when trying to import into elasticsearch

```javascript
// Process log file line-by-line
rd.on('line', function(line) {
    count++;

    // Create header text
    header = JSON.stringify({ "index":{"_index":myIndexName,"_type":logType, "_id": count } });

    // Transform Invalid Data/Structures into ElasticSearch Friendly Format *******************
     
    // Stringify the contents of http_body
    objJSONLine = JSON.parse(line);
    objJSONLine.request.http_body = JSON.stringify(objJSONLine.request.http_body);
    objJSONLine.response.http_body = JSON.stringify(objJSONLine.response.http_body);

    // Output results to buffer so it can be captured and saved into new file
    console.log(header);
    console.log(JSON.stringify(objJSONLine));
});
```

## 3. Upload logs to Elastic Search

Once the logs have been processed and appropriate header records created, you will need to run statements like the ones in `esUpload.sh` file in order to upload the data into elastic search

example:
```bash
# process raw file into version that includes headers
node input.js PATH_TO_RAW_LOG_FILE.log > PATH_TO_PROCESSED_FILE_WITH_HEADERS.log

# transmit the processed file to elasticsearch
curl -H 'Content-Type: application/x-ndjson' -XPOST 'YOUR_SERVER:YOUR_PORT/_bulk?pretty' --data-binary @PATH_TO_PROCESSED_FILE_WITH_HEADERS.log

```

## 4. Check to make sure data was imported correctly
Using Postman or the Kibana interface, perform a call against the `api_log` index pattern to verify that upload was successful

```bash
# You do not need to include server/port for Kibana console
GET YOUR_SERVER:YOUR_PORT/_cat/indices/api_log*
```

## Help Menu

```bash
$ node input -h

Usage: input -f [input JSON file] -i [Elasticsearch index to write to] -t
[Elasticsearch type to write]

Options:

  --version          Show version number                               [boolean]
  -f, --filePath     Path to input JSON file                          [required]
  -i, --indexPrefix  Elasticsearch index prefix            [default: "api_log_"]
  -t, --logType      Elasticsearch type name                [default: "api_log"]
  -h, --help         Show help                                         [boolean]


Examples:

  1. node input --f c:/LA-API-logs/dailyLogs/2018/01-Jan

  2. node input --f c:/LA-API-logs/dailyLogs/2018/01-Jan --i myindex_ --t mylog

  NOTE: ElasticSearch names for indexPrefix and logType should be in lower case

```
