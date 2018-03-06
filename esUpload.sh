#!/usr/bin/env bash

# Author: Marco Ortiz
# Date  : 02.16.2018
###########################################################################################

# get array arguments passed by input.js
logsDir=$1
indexPrefix=$2
logType=$3

# Arguments validation
if [[ -z "$logsDir" ]]; then
    echo >&2 "You must supply a filePath argument!"
    exit 1
elif [[ ! -d "$logsDir" ]]; then
    echo >&2 "$logsDir is not a valid directory!"
    exit 1
fi

# .log files only
logFiles=$logsDir/*.log

if [ ! -f $logFiles ]; then
  echo >&2 "There are no *.log files to process in this directory"
  exit 1
fi	

# creates backup
bak=$logsDir'/_bak/'
mkdir -p $bak
cp -r $logsDir/*.log $bak

# creates output directory for ES Transformed files
output=$logsDir'/Transformed/'
mkdir -p $output

# loop through file names: create them in the TRANDFORMED folder and upload them to ElasticSearch
for file in $logsDir/*.log; do
  node applyHeaders.js --fileName=$file --indexPrefix=$indexPrefix --logType=$logType> $output/$(basename "$file")
  curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @$output/$(basename "$file")
done

# creates Uploaded directory for original log files that had been processed
uploaded=$logsDir'/Uploaded/'
mkdir -p $uploaded

# loop through original log files and copy them in the UPLOADED folder
for file in $logsDir/*.log; do
  node processed.js $file > $uploaded/$(basename "$file")
done

# remove original *.log files
rm $logsDir/*.log  
