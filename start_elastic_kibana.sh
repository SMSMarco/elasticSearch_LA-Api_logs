#!/usr/bin/bash

# ElasticSearch
echo "Starting ElasticSearch..."
cd ~/documents/software/elasticsearch-6.1.2/bin
start elasticsearch.bat

#Kibana
echo "Starting Kibana..."
cd ~/documents/software/kibana-6.1.2-windows-x86_64/bin
start kibana.bat


