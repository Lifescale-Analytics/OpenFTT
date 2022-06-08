# OpenFTT
Opensource Fault Trace Tool

# License
Please review the LICENSE file.

# Requirements
Web Server (IIS, Apache, NGinX)
ESRI Resource Proxy ( https://github.com/Esri/resource-proxy )
ArcGIS Map Service with Lines, Substations, Structures, and Fault Indicators (if desired)
Vaisala TXD-100 API Subscription (optional, but required for lightning studies)

# Installation
Copy the contents of the repository to the web server.

# Configruation
Modify config.json file.  The config.json file is populated with some defaults.

The proxyURL is the URL of the ESRI resource proxy.

## ArcGIS Configuration
The servername is the URL of the ArcGIS Server.  Typically this will be something like, https://yourarcgisserver.com:6080/.

The baseURL will be the location of your ArcGIS Server's rest interface.  The servername is a macro for the servername field for the server set in the servername field.  This is provided as a convenience, but you can use the entire URI if you prefer.

The mapserverURL is the location for the map service which contains the lines, substations, structures, and fault indicators.  It is assumed these will all occupy the same map service.

The stationLayerID, lineLayerID, structureLayerID, and fiLayerID are the layerIDs within the map service for each layer type.

The maxrecordcount should be set to be the same as the map service.

The linefields and stationfields are used to identify the fields that should be used for lookup and attribute purposes.

## Layer Configuration
It is assumed that the line layer has a primary key (lineid) is present in the following layers: 
* structure layer
* fault indicator layer

