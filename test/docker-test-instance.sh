#!/bin/bash
# Run a Node-RED instance with the current code mounted for testing
#
# Maps port 1880 on the host to port 1880 in the container
# Mounts the current directory to /data/node_modules/node-red-contrib-ecoflow-http-api in the container
# Uses /tmp/testnr on the host for Node-RED data
# Make sure to stop any other Node-RED instances running on port 1880 before running!
#
# Use "docker ps" to check for running containers and "docker stop <container_id>"
# to stop a running container
# 
# After starting, open http://localhost:1880 in a web browser to access Node-RED
# The node should be available in the palette under "Network>ecoflow"

docker run -d -p 1880:1880 -v .:/data/node_modules/node-red-contrib-ecoflow-http-api -v /tmp/testnr:/data nodered/node-red