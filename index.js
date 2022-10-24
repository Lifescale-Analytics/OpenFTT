function openTab(evt, tabName) {
  var evttime = document.getElementById("evttime");
  var ltgevttime = document.getElementById("ltgevttime");
  var evtwindow = document.getElementById("timewindow");
  // var ltgwindow = document.getElementById("ltgtimewindow");

  if (tabName == "ltgPanel") {
    //copy evttime from fault panel
    ltgevttime.value = evttime.value;
    //ltgwindow.value = evtwindow.value;
  }

  //else {
  //don't overwrite timestamps with blank values
  //if (ltgevttime.value.length > 0) {
  //	evttime.value=ltgevttime.value;
  //evtwindow.value = ltgwindow.value;
  //}
  //}

  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function downloadLightning(){
  var csv=[];
  var ltgtbl = document.getElementById("resultstblltg").querySelectorAll('tr');
  ltgtbl.forEach(function(row){
    var cols=row.querySelectorAll('td,th');
    var csvcols=[];
    cols.forEach(function(c){
      csvcols.push(c.innerText);
    });
    csv.push(csvcols.join(","));
  });

  var csvdata = csv.join('\n');
  CSVFile = new Blob([csvdata], {type: "text/csv"});
  var link = document.createElement('a');
  
  link.download = "lightning.csv";
  var url = window.URL.createObjectURL(CSVFile);
  link.href=url;
  link.style.display="none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

}

require([
  "esri/config",
  "esri/Map",
  "esri/widgets/Print",
  "esri/widgets/CoordinateConversion",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/support/Sublayer",
  "esri/geometry/Polyline",
  "esri/geometry/Point",
  "esri/layers/GraphicsLayer",
  "esri/tasks/Locator",
  "esri/tasks/GeometryService",
  "esri/geometry/geometryEngine",
  "esri/tasks/support/ProjectParameters",
  "esri/tasks/support/BufferParameters",
  "esri/tasks/support/Query",
  "esri/Graphic",
  "esri/geometry/SpatialReference",
  "esri/widgets/BasemapToggle",
  "esri/widgets/ScaleBar",
  "esri/layers/MapImageLayer",
  "esri/geometry/Extent",
  "esri/core/urlUtils",
  "esri/geometry/support/webMercatorUtils",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/TextSymbol",
  "dojo/json",
  "dojo/text!./config.json",
], function (
  esriConfig,
  Map,
  Print,
  CoordinateConversion,
  MapView,
  FeatureLayer,
  Sublayer,
  Polyline,
  Point,
  GraphicsLayer,
  Locator,
  GeometryService,
  geometryEngine,
  ProjectParameters,
  BufferParameters,
  Query,
  Graphic,
  SpatialReference,
  BasemapToggle,
  ScaleBar,
  MapImageLayer,
  Extent,
  urlUtils,
  webMercatorUtils,
  PictureMarkerSymbol,
  TextSymbol,
  json,
  data
) {
  //configuration
  var serverIP = `${window.location.origin}/`;
  var data = JSON.parse(data);
  esriConfig.apiKey = data.apiKey;
  var gisServerName = data.servername;
  var proxyURL = data.proxyURL.replace("serverIP", serverIP);
  var baseURL = data.baseURL.replace("servername", gisServerName);
  var gsvcURL = data.gsvcURL.replace("baseURL", baseURL);
  var txdurl = data.txdurl.replace("serverIP", serverIP);
  var locatorURL = data.locatorURL;
  var fiURL = data.fiURL.replace("serverIP", serverIP);
  var mapServerURL = data.mapServerURL.replace("baseURL", baseURL);
  var printServiceUrl = data.printServiceURL;
  var stationLayerID = data.stationLayerID;
  var structureLayerID = data.structureLayerID;
  var fiLayerID = data.fiLayerID;
  var initialExtent = JSON.parse(data.initialExtent);
  var maxRecordCount = data.maxRecordCount;
  var ltgPopuptitle = data.ltgPopuptitle;
  var fiInfotitle = data.fiInfotitle;
  var txduid = data.txduid;
  var txdpwd = data.txdpwd;
  var txdenabled = data.txdenabled;
  var mapSpatialReference = parseInt(data.mapSpatialReference);
  var bufferSpatialReference = parseInt(data.bufferSpatialReference);
  var lightningSpatialReference = parseInt(data.lightningSpatialReference);
  var faultLocID = parseInt(data.faultLocID);
  var stationLayerID = parseInt(data.stationLayerID);
  var lineLayerID = parseInt(data.lineLayerID);
  var structureLayerID = parseInt(data.structureLayerID);
  var switchLayerID = parseInt(data.switchLayerID);
  var switchPrimaryKey = data.switchPrimaryKey;
  var switchEnabled = data.switchEnabled;
  var fiLayerID = parseInt(data.fiLayerID);
  var maxRecordCount = parseInt(data.maxRecordCount);
  var timezone = data.timezone;
  var lineFields = data.lineFields;
  var lineOutFields = lineFields.filter((f) => f.outfield).map((f) => f.name);
  var lineKeyField = lineFields.filter((f) => f.key).map((f) => f.name)[0];
  var lineSortFields = lineFields.filter((f) => f.orderby).map((f) => f.name);
  var fltStructureFields = data.structureFields;
  var useStructureProximity= data.useStructureProximity;
  var structureProximityFt = data.structureProximityFt;
  var structureKeyField = fltStructureFields
    .filter((f) => f.key)
    .map((f) => f.name)[0];
  var structureTitleField = fltStructureFields
    .filter((f) => f.isTitle)
    .map((f) => f.name)[0];
  var fltStructureOutFields = fltStructureFields
    .filter((f) => f.outfield)
    .map((f) => f.name);

  var stationFields = data.stationFields;
  var stationTitleField = stationFields
    .filter((f) => f.isTitle)
    .map((f) => f.name)[0];
  var stationKeyField = stationFields
    .filter((f) => f.key)
    .map((f) => f.name)[0];

  var stationOutFields = stationFields
    .filter((f) => f.outfield)
    .map((f) => f.name);

  var queryfields = [stationTitleField, stationKeyField];

  var fiEnabled = data.fiEnabled;
  var fiTimeZone = data.fiTimeZone;
  var fiPrimaryKey = data.fiPrimaryKey;
  var fiFields = data.fiFields;
  var infoFields = fiFields.map((f) => f);
  var fiStatusFields = fiFields.map((f) => f.fieldName);

  var ltgPopupFields = data.ltgPopupFields;

  var timezoneLabels = document.getElementsByClassName("current-timezone");
  var curTimezoneFormat = moment().tz(timezone).format("z");
  for (var i = 0; i < timezoneLabels.length; i++) {
    timezoneLabels[i].innerHTML = `(${curTimezoneFormat})`;
  }

  //end configuration

  //global variables
  var lineGeometries,
    stationGeometries,
    structureGeometries,
    startStationGeometries;
  var startStationName = "";
  var defaultLineId = "";
  var defaultStationName = "";
  var stationList = [];
  var fltVals;
  var ltgPoints = [];
  var fiPoints = [];
  var fiSCADANames = [];
  var maxDiff;
  var bookmarkParams = [];
  var bookmarkFuncsWithBookmark = [];
  var loader = $("#loader");

  //change color for multi-endied fault location
  //var faultLocID = 0;
  var colorWays = [
    [128, 0, 38, 1],
    [252, 78, 42, 1],
    [14, 115, 73, 1],
  ];

  //set up proxyUrl
  urlUtils.addProxyRule({
    urlPrefix: gisServerName,
    proxyUrl: proxyURL,
  });

  //create layers for lines/stations/structures/highlights/faults
  var lineRender = {
    type: "simple",
    symbol: {
      type: "simple-line",
      color: [0, 112, 255, 1],
    },
  };

  var lineRender2 = {
    type: "simple-line",
    color: [255, 0, 0, 1],
  };

  var stationRender = {
    type: "simple",
    symbol: {
      type: "simple-marker",
      style: "square",
      outline: { color: [0, 92, 230, 1] },
      size: 6,
      color: [0, 92, 230, 1],
    },
  };

  var structureRender = {
    type: "simple",
    symbol: {
      type: "simple-marker",
      style: "cross",
      size: 4,
    },
  };

  var switchRender = {
    type: "simple",
    symbol: {
      type: "simple-marker",
      style: "diamond",
      outline: { color: [0, 127, 81, 1] },
      color: [0, 127, 81, .7] ,
    },
  };

  var ltgSymbol = {
    type: "picture-marker",
    url: "resources/ltg2.png",
    width: 170,
    height: 20,
    xoffset: 75,
    angle: 0,
  };

  var ltgEllipseSymbol = {
    type: "simple-fill",
    color: [255, 255, 255, 0],
    outline: {
      color: [0, 0, 0],
      width: 1,
    },
  };

  var fiSymbol = {
    type: "simple",
    symbol: {
      type: "simple-marker",
      style: "circle",
      outline: { width: 2.25, color: [0, 0, 0, 1] },
      color: [0, 0, 0, 0],
      size: 8,
    },
  };

  function fiStatusSymbol(status) {
    var curStatus = status.toUpperCase();
    var colorVal = [255, 0, 0, 1];
    if (curStatus == "TRUE") {
      colorVal = [0, 255, 0, 1];
    } else if (curStatus == "OFFLINE") {
      colorVal = [253, 184, 99, 1];
    }

    var symbol = {
      type: "simple-marker",
      style: "circle",
      outline: { width: 1.5, color: [0, 0, 0, 1] },
      color: colorVal,
      size: 8,
    };

    return symbol;
  }

  function startStationSymbol(faultLocID) {
    var colorWayVal = colorWays[faultLocID];
    var myStartStationSymbol = {
      type: "simple-marker",
      style: "diamond",
      outline: { color: colorWayVal },
      size: 7,
      color: colorWayVal,
    };

    return myStartStationSymbol;
  }

  function faultLocationSymbol(faultLocID) {
    var colorWayVal = colorWays[faultLocID];
    var myFaultLocationSymbol = {
      type: "simple-marker",
      style: "x",
      outline: { width: 1.25, color: colorWayVal },
      size: 12,
    };
    return myFaultLocationSymbol;
  }

  //set up map services / layers
  var gsvc = new GeometryService({ url: gsvcURL });
  var ltgLayer = new GraphicsLayer();
  var faultsLayer = new GraphicsLayer();
  var startStationLayer = new GraphicsLayer();
  var fiStatusLayer = new GraphicsLayer();
  //var bufferLayer = new GraphicsLayer();

  var txMapLayers = new MapImageLayer({
    url: mapServerURL,
    sublayers: [
      {
        id: stationLayerID,
        renderer: stationRender,
        visible: false,
      },
      {
        id: lineLayerID,
        renderer: lineRender,
        visible: false,
      },
      {
        id: fiLayerID,
        renderer: fiSymbol,
        visible: false,
      },
      {
        id: structureLayerID,
        renderer: structureRender,
        visible: false,
      },
      {
        id: switchLayerID,
        renderer: switchRender,
        visible: false,
      },
    ],
  });

  var structurePopupTemplate = {
    title: "Structure: {" + `${structureTitleField}` + "}",
    outFields: ["*"],
    content: distanceToStation,
  };

  var ltgPopupTemplate = {
    title: ltgPopuptitle,
    content: [
      {
        type: "fields",
        fieldInfos: ltgPopupFields,
      },
    ],
  };

  var fiInfoTemplate = {
    title: fiInfotitle,
    content: [
      {
        type: "fields",
        fieldInfos: infoFields,
      },
    ],
  };

  var fiStatusTemplate = {
    title: fiInfotitle,
    content: displayFIInfo,
  };

  var lineLayer = txMapLayers.findSublayerById(lineLayerID);
  var stationLayer = txMapLayers.findSublayerById(stationLayerID);
  var structureLayer = txMapLayers.findSublayerById(structureLayerID);
  var fiLayer = txMapLayers.findSublayerById(fiLayerID);
  var switchLayer = txMapLayers.findSublayerById(switchLayerID);
  structureLayer.popupTemplate = structurePopupTemplate;
  fiLayer.popupTemplate = fiInfoTemplate;

  //create Map
  var map = new Map({
    basemap: "gray",
    highlightOptions: {
      color: [56, 168, 0, 1],
    },
    layers: [
      txMapLayers,
      ltgLayer,
      faultsLayer,
      startStationLayer,
      fiStatusLayer,
    ],
  });

  

  //ui components
  function displayFIInfo(feature) {
    var div = document.createElement("div");

    var output =
      "<table cellpadding=2><tr align=left><th>Point</th><th>Time</th><th>Value</th><th>Status</th></tr>";

    if (feature.graphic.attributes.rawdata.length > 0) {
      output += feature.graphic.attributes.rawdata.map(function (item) {
        var ct = moment
          .tz(item.Time, "YYYY-MM-DDTHH:mm:ss", fiTimeZone)
          .tz(timezone)
          .format("MM/DD/YYYY HH:mm:ss");
        let mapname = fiSCADANames.find(
          (scmap) => scmap.scadapt === item.Pointname
        ).mapname;

        return (
          "<tr align=left><td>" +
          mapname +
          "</td><td>" +
          ct +
          "</td><td>" +
          item.Value +
          "</td><td>" +
          item.Status +
          "</td></tr>"
        );
      });
      output = output.replace(/,/gi, "");
    } else {
      output += "<tr><td colspan=3>No SCADA Data Found</td></tr>";
    }
    output += "</table>";
    div.innerHTML = output;
    return div;
  }

  function distanceToStation(feature) {
    var div = document.createElement("div");
    var lso = document.getElementById("lineSelect");
    var lname = lso.options[lso.selectedIndex].text;
    var output = "";
    output += "<B>Via Line: " + lname + "</B><BR />";

    //var strPt = new Point(feature.graphic.attributes.LONGITUDE, feature.graphic.attributes.LATITUDE,{wkid: mapSpatialReference});
    var poi = new Point({
        longitude: feature.graphic.geometry.longitude,
        latitude: feature.graphic.geometry.latitude,
		spatialReference: { wkid: mapSpatialReference }
    });

    //identify the line vertex with the smallest distance from structure
    var voi;
    var smallestvoiddist;
    for (i = 0; i < lineGeometries.length; i++) {
      var newline = new Polyline({
        paths: lineGeometries[i].paths,
        spatialReference: { wkid: mapSpatialReference },
      });
      var nve = geometryEngine.nearestVertex(newline, poi);
	  //initialize voi and smallestvoidist.
	  if (i==0) {
			voi=nve;
			smallestvoiddist = nve.distance;
	  }
      if (nve.distance < smallestvoiddist) {
        voi = nve;
        smallestvoiddist = nve.distance;
      }
    }

    var distances = distToStation(voi);
    output += distances.map(function (p) {
      return p;
    });

    var sldistance = sldisttostation(poi);
    output += "<br /><b>Via Straight line:</b> <br />";
    output += sldistance.map(function (p) {
      return p;
    });

    output = output.replace(/,/gi, "");

    div.innerHTML = output;
    return div;
  }

  //get straight line distance, good for sanity checking may disable in final release.
  function sldisttostation(poi) {
    var outputDist = [];

    //for each station get coords, get distance from POI.
    for (var i = 0; i < stationList.length; i++) {
      var stationPoint = new Point({
        longitude: stationList[i].longitude,
        latitude: stationList[i].latitude,
        spatialReference: {wkid: mapSpatialReference}
      });
      var seg = new Polyline();
	  seg.spatialReference = SpatialReference({wkid: mapSpatialReference });
      seg.addPath([poi, stationPoint]);
      var segLength = geometryEngine.geodesicLength(seg, "miles");
      var out = segLength.toFixed(2) + " to " + stationList[i].name + "<br />";
      outputDist.push(out);
    }
    return outputDist;
  }

  function distToStation(vertexOfInterest) {
    var outputDist = [];
    var pointOfInterest = new Point(vertexOfInterest.coordinate);
    var segLength = [];

    //for each station get distance to point
    for (var i = 0; i < stationList.length; i++) {
      var stationPoint = new Point({
        longitude: stationList[i].longitude,
        latitude: stationList[i].latitude,
        spatialReference: {wkid: mapSpatialReference},
      });


      var stationPoints = [];
      stationPoints.push(stationPoint);
      //get endpoints for all the lines/paths
      var segmentEndpoints = getSegmentEndPoints(lineGeometries);
      //get start point on line - nearest to substation
      var startPos = getStartPosition(stationPoints, segmentEndpoints);
      //build network topology from start station
      var neighbors = getNeighbors(segmentEndpoints);
      //
      //printNeighbors(neighbors);
      //get paths
      var curPath = [];
      var paths = [];

      //multiple segment line, get neighbors, else specify current line as path.

      if (neighbors.length > 1) {
        getPaths(neighbors, paths, curPath, startPos.id.toString());
      } else {
        paths.push(startPos.id.toString());
      }

      //find distance to point
      if (paths.length < 1) {
        paths.push(curPath);
      }

      for (let p in paths) {
        segLength.push({
          name: stationList[i].name,
          distance: getSegmentLength(
            lineGeometries,
            pointOfInterest,
            startPos,
            paths[p]
          ),
        });
      }

      for (let s in segLength) {
        if (segLength[s].distance > 0) {
          var out =
            segLength[s].distance.toFixed(2) +
            " to " +
            segLength[s].name +
            "<br />";
          outputDist.push(out);
        }
      }
    }
    outputDist = getUniqueValues(outputDist);
    return outputDist;
  }

  function getSegmentLength(
    lineGeometry,
    pointOfInterest,
    startInfo,
    topology
  ) {
    var totalLength = 0;

    //loop through line geometry, using topology where necessary to navigate to next line geometry

    var curPt, nextPt;

    //only look for faults within the line length
    //loop through topology, accumulating distances
    var startPt = new Point(startInfo.startPoint[0], startInfo.startPoint[1], {
      wkid: mapSpatialReference,
    });

    curPt = startPt;
    for (let t in topology) {
      var pCoords = lineGeometry[topology[t]].paths[0][0];
      nextPt = new Point(pCoords[0], pCoords[1], { wkid: mapSpatialReference });

      //determine direction of segment, ignore start
      if (isReversed(curPt, nextPt)) {
        //reverse the paths within this segment.
        lineGeometry[topology[t]].paths[0].reverse();
        var pCoords = lineGeometry[topology[t]].paths[0][0];
        nextPt = new Point(pCoords[0], pCoords[1], { wkid: mapSpatialReference });
        //if other endpoint still doesn't match, then throw away this path
        if (isReversed(curPt, nextPt)) {
          return 0;
        }
      }
      var lenPaths = lineGeometry[topology[t]].paths[0].length - 1;

      for (var i = 0; i <= lenPaths; i++) {
        var pathcoords = lineGeometry[topology[t]].paths[0][i];
        nextPt = new Point(pathcoords[0], pathcoords[1], { wkid: mapSpatialReference });
        if (curPt) {
          var seg = new Polyline({ wkid: mapSpatialReference });
          seg.addPath([curPt, nextPt]);
          var segLength = geometryEngine.geodesicLength(seg, "miles");
          totalLength += segLength;
          if (geometryEngine.equals(curPt, pointOfInterest)) {
            //coords.push(lineGeometry[topology[t]].paths[0][i]);
            return totalLength;
          }
        }
        curPt = nextPt;
      }
    }
    return totalLength;
  }

  function setLineDefinitionExpression(lineID) {
    lineLayer.definitionExpression = `${lineKeyField} = '${lineID}'`;
    if (!lineLayer.visible) {
      lineLayer.visible = true;
    }
    return queryForLineGeometries();
  }

  function queryForLineGeometries() {
    var lineQuery = lineLayer.createQuery();

    return lineLayer.queryFeatures(lineQuery).then(function (response) {
      lineGeometries = response.features.map(function (feature) {
        return feature.geometry;
      });
      return lineGeometries;
    });
  }

  function setFIDefinitionExpression(lineID) {
    fiLayer.definitionExpression = `${fiPrimaryKey} = '${lineID}'`;

    if (!fiLayer.visible) {
      fiLayer.visible = true;
    }
    queryForFIStatus();
  }

  function setSwitchDefinitionExpression(lineID) {
    switchLayer.definitionExpression = `${switchPrimaryKey} = '${lineID}'`;
    if (!switchLayer.visible) {
      switchLayer.visible = true;
    }
  }

  function queryForFIStatus() {
    var fiQuery = fiLayer.createQuery();
    fiQuery.outFields = fiStatusFields;

    fiLayer.queryFeatures(fiQuery).then(function (response) {
      response.features.forEach(function (feature) {
        var statusField = fiFields
          .filter((f) => f.isStatusFeature)
          .map((f) => f.fieldName);
        if (statusField && statusField.length > 0) {
          if (feature.attributes[statusField[0]] == "N") {
            var symbol = fiStatusSymbol("OFFLINE");

            fi = new Graphic({
              geometry: feature.geometry,
              symbol: symbol,
              attributes: feature.attributes,
              popupTemplate: fiInfoTemplate,
            });
            fiStatusLayer.add(fi);
          } else {
            getFIStatusPointsFromAPI(feature);
          }
        }
      });
    });
  }

  function getFIStatusPointsFromAPI(feature) {
    //get list of fi's from gis and loop through them to get status.

    var evttime = moment
      .tz(
        document.getElementById("evttime").value,
        "MM/DD/YYYY HH:mm:ss.SSS",
        timezone
      )
      .tz(fiTimeZone)
      .format("MM/DD/YYYY HH:mm:ss.SSS");
    var url = fiURL + "pointname=";
    var displayFields = fiFields
      .filter((f) => f.forDisplay)
      .map((f) => f.fieldName);
    for (var attr in feature.attributes) {
      if (displayFields.includes(attr)) {
        if (
          feature.attributes[attr] != null &&
          feature.attributes[attr].length > 0
        ) {
          let scptmap = {
            scadapt: feature.attributes[attr],
            mapname: attr.substring(6),
          };
          fiSCADANames.push(scptmap);
          url += feature.attributes[attr] + ",";
        }
      }
    }

    url = url.substring(0, url.length - 1);
    url += "&eventtime=" + evttime;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        processFIResponse(this.responseText, feature, evttime);
      }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
  }

  function processFIResponse(rsp, feature) {
    if (isValidJSON(rsp)) {
      var fiStatus = JSON.parse(rsp);
      var symbol = fiStatusSymbol(fiStatus.didAssert);
      feature.symbol = symbol;
      feature.attributes.rawdata = fiStatus.rawdata;
      fiPoints.push(feature);
      redrawFI(feature);
    }
  }

  function redrawFI(feature) {
    fi = new Graphic({
      geometry: feature.geometry,
      symbol: feature.symbol,
      attributes: feature.attributes,
      popupTemplate: fiStatusTemplate,
    });
    fiStatusLayer.add(fi);
  }

  function isValidJSON(input) {
    try {
      JSON.parse(input);
    } catch (e) {
      return false;
    }
    return true;
  }

  function getFaultIndicators(lineID) {
    if (fiEnabled) {
      fiPoints = [];
      fiStatusLayer.removeAll();

      //put all fault indicators associated with line on the map
      setFIDefinitionExpression(lineID);
    }
  }

  function getSwitches(lineID) {
    if (switchEnabled) {
      setSwitchDefinitionExpression(lineID);
    }
  }

  function queryForStartStationGeometries(featureset) {
    startStationGeometries = featureset.features.map(function (feature) {
      return feature.geometry;
    });
    return startStationGeometries;
  }

  function addStartStationToMap(stationGeometry) {
    //startStationLayer.removeAll();

    var pt = {
      type: "point",
      longitude: stationGeometry[0].longitude,
      latitude: stationGeometry[0].latitude
    };

    var startSt = new Graphic({
      geometry: pt,
      symbol: startStationSymbol(faultLocID),
    });
    startStationLayer.add(startSt);
  }

  var btnClearFaults = document.getElementById("clear-faults");
  btnClearFaults.addEventListener("click", function () {
    resetEnvironment(false);
  });

  var btnClearLightning = document.getElementById("clear-lightning");
  btnClearLightning.addEventListener("click", function () {
    resetEnvironment(false);
  });

  function showPOI() {
    var lat = document.getElementById("ltgLat");
    var lon = document.getElementById("ltgLon");
    var distance = parseFloat(document.getElementById("ltgDistance").value);

    var ltgPOI = new Point({
      latitude: lat.value,
      longitude: lon.value,
      spatialReference: { wkid: 4326 },
    });

    ltg = new Graphic({
      geometry: ltgPOI,
      symbol: faultLocationSymbol(0),
    });

    ltgLayer.add(ltg);

    var params = new BufferParameters({
      distances: [distance],
      unit: "miles",
      geodesic: true,
      unionResults: true,
      geometries: ltgPOI,
      bufferSpatialReference: bufferSpatialReference,
      outSpatialReference: mapSpatialReference,
    });

    var poi = gsvc.buffer(params).then(function (poiPoints) {
      poiBuffer = poiPoints[0];
      ltgLayer.add(
        new Graphic({
          geometry: poiBuffer,
          symbol: { type: "simple-fill", color: [255, 120, 0, 0.3] },
        })
      );

      var autoZoom = document.getElementById("autozoomltg").checked;
      if (autoZoom) {
        zoomTo(poiBuffer);
      }
    });
  }

  var lineSelect = document.getElementById("lineSelect");
  var stationSelect = document.getElementById("stationSelect");
  var btnLocateLightningADV = document.getElementById("locate-adv-lightning");
  var btnLocateFault = document.getElementById("locate-faults");
  var btnLocateLightning = document.getElementById("locate-lightning");

  function stationChangeFunc(startStationName) {
    stationLayer.createFeatureLayer().then(function (startStationLayer) {
      var query = startStationLayer.createQuery();
      query.where = `${stationKeyField} = '${startStationName}'`;
      startStationLayer
        .queryFeatures(query)
        .then(queryForStartStationGeometries)
        .then(addStartStationToMap);
    });
  }
  var lastIndex = -1;
  function stationSelectFunc(selectedIndex) {
    if (lastIndex != 0 && lastIndex != selectedIndex) {
      faultLocID += 1;
    }
    lastIndex = selectedIndex;
  }

  function setupEventListeners() {
    lineSelect.addEventListener("change", function () {
      var lineID = event.target.value;
      //reset
      resetEnvironment(true);
      //make sure we aren't on Please select...
      if (lineID.length > 0) {
        //highlight line
        lineGeometries = setLineDefinitionExpression(lineID)
          .then(function(lineInfo){
			
			//highlight structures if using proximity
			if(useStructureProximity){
				structureGeometries = setStructureDefinitionExpression(lineInfo);
			}
            return populateStationDropDown(lineInfo);
          }
        );
		
		//highlight structures if using key
		if(!useStructureProximity){
			structureGeometries = setStructureDefinitionExpression(lineID);
		}
		  
        //get fault indicators
        getFaultIndicators(lineID);

        //get switches
        getSwitches(lineID);
      }
    });

    stationSelect.addEventListener("change", function () {
      stationChangeFunc(event.target.value);
    });

    btnLocateLightningADV.addEventListener("click", function () {
      if (validateLightningParmsAdv()) {
        showPOI();
        lightningSearchAdv();
      }
    });

    stationSelect.addEventListener("click", function () {
      stationSelectFunc(stationSelect.selectedIndex);
    });

    btnLocateFault.addEventListener("click", function () {
      //ensure form parameters are correct
      validateFormParameters();
    });

    btnLocateLightning.addEventListener("click", function () {
      //ensure form parameters are correct
      if (validateLightningParms(true)) {
        //if good, start lightning search
        lightningSearch();
      }
    });
  }

  function validateLightningParms(showAlert = false) {
    if (lineSelect.selectedIndex == 0) {
      showAlert && alert("Please Select Line");
      return false;
    }
    var maxDiff = parseInt(document.getElementById("timewindow").value);
    if (isNaN(maxDiff) || maxDiff < 0 || maxDiff > 999) {
      showAlert && alert("Please enter valid value for Time Window");
      return false;
    }
    var evttime = document.getElementById("evttime");
    if (
      !moment.tz(evttime.value, "MM/DD/YYYY HH:mm:ss.SSS", timezone).isValid()
    ) {
      showAlert && alert("Please enter a valid Date/Time");
      return false;
    }
	/*
    var lat = document.getElementById("ltgLat");
    var lon = document.getElementById("ltgLon");
    if (lat.value == "" || lon.value == "") {
      showAlert && alert("Please enter a valid address!");
      return false;
    }
	*/
    return true;
  }

  function validateLightningParmsAdv() {
    var lat = document.getElementById("ltgLat");
    var lon = document.getElementById("ltgLon");

    if (
      isNaN(lat.value) ||
      isNaN(lon.value) ||
      lat.value.length < 1 ||
      lon.value.length < 1
    ) {
      alert("Please enter a valid value for the coordinates");
      return false;
    }

    /*
        var maxDiff = parseInt(document.getElementById("ltgtimewindow").value);
        if (isNaN(maxDiff) || maxDiff < 0 || maxDiff > 999) {
            alert("Please enter valid value for Time Window");
            return false;
        }
        */

    var evttime = document.getElementById("ltgevttime");
    if (
      !moment.tz(evttime.value, "MM/DD/YYYY HH:mm:ss.SSS", timezone).isValid()
    ) {
      alert("Please enter a valid Start Date/Time");
      return false;
    }

    var evttimestop = document.getElementById("ltgevttimestop");
    if (
      !moment
        .tz(evttimestop.value, "MM/DD/YYYY HH:mm:ss.SSS", timezone)
        .isValid()
    ) {
      alert("Please enter a valid Stop Date/Time");
      return false;
    }
    return true;
  }

  var view = new MapView({
    container: "viewDiv",
    map: map,
    extent: initialExtent
  });



  //widgets
  var toggle = new BasemapToggle({
    view: view,
    nextBasemap: "hybrid",
  });

  var scaleBar = new ScaleBar({
    view: view,
    unit: "non-metric",
    style: "line",
  });

  var ccWidget = new CoordinateConversion({
    view: view,
  });

  var print = new Print({
    view: view,
    printServiceUrl: printServiceUrl,
    container: document.getElementById("printpanel")
  });

  view.ui.add("infoDiv", "top-right");
  view.ui.add(toggle, "bottom-right");
  view.ui.add(scaleBar, "bottom-left");
  view.ui.add(ccWidget, "bottom-left");
  //view.ui.add(print, "top-right");

  view.when(function () {

    //if commandline is null use normal work flow, else autopopulate form with CLI value
    var srch = location.search;
    if (srch.length > 0) {
      var params = new URLSearchParams(window.location.search);

      var totalLine = params.get("totalLine");

      if (totalLine == null) {
        totalLine = 1;
      } else {
        totalLine = parseInt(totalLine);
      }

      var paramsToProcess = [];
      for (var i = 0; i < totalLine; i++) {
        var eventTime = getUrlParameter(`eventtime_${i}`);
        //select line
        var lineId = getUrlParameter(`lineid_${i}`);
        //select start station
        var stationName = getUrlParameter(`stationname_${i}`);
        //populate distance
        var distance = getUrlParameter(`distance_${i}`);
        paramsToProcess.push({
          lineID: lineId,
          stationName: stationName,
          evntTime: eventTime,
          distance: distance,
        });
      }

      var setBookmarkFields = (bookmark) => {
        var allParms = 0;
        if (bookmark.evntTime != "") {
          allParms += 1000;
          //parse time from CLI
          var cliTime = moment.tz(bookmark.evntTime, "GMT");
          var localTime = cliTime
            .clone()
            .tz(timezone)
            .format("MM/DD/YYYY HH:mm:ss.SSS");
          document.getElementById("evttime").value = localTime;
        } else {
          populateEvtTime();
        }

        if (bookmark.lineID != "") {
          allParms += 100;
          defaultLineId = bookmark.lineID;
        } else {
          populateLineDropDown();
        }

        if (bookmark.stationName != "") {
          allParms += 10;
          defaultStationName = bookmark.stationName;
        }

        if (bookmark.distance != "") {
          allParms += 1;
          var distance = parseFloat(bookmark.distance).toFixed(3);
          document.getElementById("faultDistance").value = distance;
        }
        return allParms;
      };

      populateEvtTime();

      bookmarkFuncsWithBookmark = [];
      for (var i = 1; i < paramsToProcess.length; i++) {
        var curBookmark = paramsToProcess[i];
        bookmarkFuncsWithBookmark.push({
          bookmark: curBookmark,
          func: (bookmark) => {
            setBookmarkFields(bookmark);
            setStationByName(bookmark.stationName);
            stationSelectFunc(startStationID);
            getStartStation(stationGeometries);
          },
        });
      }

      setBookmarkFields(paramsToProcess[0]);
      populateLineDropDown(true);

      var zoomToFault = getUrlParameter("zoomToFault");
      if (zoomToFault.toUpperCase() == "N") {
        document.getElementById("autozoom").checked = false;
      }
    } else {
      //populate event time with default value
      populateEvtTime();
      populateLineDropDown();
    }
    setupEventListeners();
  });

  const copyLatLongAction = {
    title: "Copy",
    id: "copyAction",
    className: "fa fa-clipboard",
  };

  view.on("double-click", function (event) {
    event.stopPropagation();
    // Get the coordinates of the click on the view
    var longitude = event.mapPoint.longitude;
    var latitude = event.mapPoint.latitude;

    var lon = Math.round(longitude * 1000) / 1000;
    var lat = Math.round(latitude * 1000) / 1000;

    view.popup.open({
      title: `POI`,
      content: `Latitude: ${lat}/ Longitude: ${lon}`,
      location: event.mapPoint,
      actions: [copyLatLongAction],
    });

    function copyLatLong() {
      document.getElementById("ltgLat").value = latitude;
      document.getElementById("ltgLon").value = longitude;
      document.getElementById("lightningPanel").click();
    }

    view.popup.on("trigger-action", (event) => {
      if (event.action.id === "copyAction") {
        copyLatLong();
      }
    });
  });

  function selectLine() {
    if (defaultLineId != "") {
      lineSelect.value = defaultLineId;
      lineGeometries = setLineDefinitionExpression(defaultLineId)
        .then(function(lineInfo){

          //highlight structures if using proximity
		  if(useStructureProximity){
			structureGeometries = setStructureDefinitionExpression(lineInfo);
		  }
		  
		  //get stations
          return populateStationDropDown(lineInfo);

        }
      );
	  
	  //highlight structures if using key
	  if(!useStructureProximity){
		structureGeometries = setStructureDefinitionExpression(defaultLineId);
	  }
      //highlights fault indicators
      getFaultIndicators(defaultLineId);
      return lineGeometries;
    }
  }
 
  function compToHex(c){
	var hex= c.toString(16);
	return hex.length ==1?"0" + hex:hex;
  }
 
  function color2hex(color){
		colors=color.replace("rgb","").replace("(","").replace(")","").replaceAll(" ","").split(",");
		return "#" + compToHex(parseInt(colors[0])) + compToHex(parseInt(colors[1])) + compToHex(parseInt(colors[2]));
  }

  function getOutput() {
    //build in 3 second delay to allow zoom to finish
    setTimeout(function () {
      //take screenshot
      view.takeScreenshot().then(function (screenshot) {
        //build canvas
        const imageData = screenshot.data;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = imageData.height;
        canvas.width = imageData.width+300;

        //add screenshot to canvas
		let hdrfont = "bold 12px Arial";
		let nfont = "12px Arial";
		
        context.putImageData(imageData, 0, 0);
        context.font = "12px Arial";
        context.fillStyle = "#ffffff";
	
		var stninfo = document.getElementById("resultstbl");
		var ltginfo = document.getElementById("resultstblltg");
		
		
		
        let canvasheight = 75 + 15 * (ltginfo.tBodies[0].rows.length + stninfo.tBodies[0].rows.length + ltginfo.tBodies[0].rows.length); //add rows for the number of structures/stationsj j+ ltgPoints)
        context.fillRect(canvas.width - 300, 0, 300, canvasheight);
        context.fillStyle = "#000";
        const leftmargin = imageData.width+1;
		const lineheight = 15;
		var curLine = 15;
        let eventTime = document.getElementById("evttime").value;
        context.fillText("Event Time: " + eventTime, leftmargin, curLine);
        let lineID = document.getElementById("lineSelect");
        lineID = lineID.options[lineID.selectedIndex].text;
		curLine+=lineheight;
        context.fillText("Line ID: " + lineID, leftmargin, curLine);
		
		//get Structure info
		context.font = hdrfont;
		curLine +=lineheight;
		context.fillText("Nearest Structure(s):",leftmargin, curLine);
		context.font = nfont;
		hdr = Array.from(stninfo.tHead.rows[0].cells).map(c=> c.innerText).toString();
		curLine+=lineheight;
		context.fillText(hdr,leftmargin,curLine);
		for(i=0;i<stninfo.tBodies[0].rows.length;i++){
				curLine+=lineheight;
				color = color2hex(stninfo.tBodies[0].rows[i].cells[0].childNodes[0].style.color.toString());
				context.fillStyle = color;
				curRow = Array.from(stninfo.tBodies[0].rows[i].cells).map(c=> c.innerText).toString();
				context.fillText(curRow,leftmargin,curLine);
		}
		
		
		//populate ltg info
		curLine +=lineheight;
		context.fillStyle = "#000000";
		context.font=hdrfont;
        flt = "Nearest Lightning";
        context.fillText(flt, leftmargin, curLine);
		context.font=nfont;
		curLine +=lineheight;
		flt = Array.from(ltginfo.tHead.rows[0].cells).map(c=> c.innerText).toString();
		context.fillText(flt, leftmargin, curLine);
		context.fillStyle = "#000000";
		
        for (i=0;i<ltginfo.tBodies[0].rows.length;i++) {
		  curLine +=lineheight;
		  flt = Array.from(ltginfo.tBodies[0].rows[i].cells).map(c=>c.innerText).toString();
          context.fillText(flt, leftmargin, curLine);
        }

        const dataUrl = canvas.toDataURL();

        //download image
        //set file name
        //assumes event time is in ISO format (eg YYYY-MM-DDTHH:MM:SSZ);

        var d = new Date(eventTime);
        if (isNaN(d)) {
          d = new Date();
        }
        var dstring = d.toISOString().replace(/[:.]/g, "-");
        var filename = dstring + lineID + ".png";

        //download file
        const element = document.getElementById("output");
        if (element.childElementCount > 0) {
          element.removeChild(element.firstChild);
        }
        const el2 = document.createElement("a");
        el2.setAttribute("href", dataUrl);
        el2.setAttribute("id", "outputjpg");

        //debugging
        //const el2 = document.createElement("img");
        //el2.setAttribute("src", dataUrl);
        //end debugging

        //el2.setAttribute("download", filename);
        //const text = document.createTextNode("download");
        //el2.appendChild(text);
        element.appendChild(el2);
      });
    }, 5000);
  }

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  function zoomTo(dest) {
    view.goTo(
      {
        target: dest,
      },
      {
        animate: false,
      }
    );
  }

  function populateEvtTime() {
    //evttime.value = "10/21/2020 13:58:37.603";  //debugging date
    var evttime = document.getElementById("evttime");
    evttime.value = moment.tz(timezone).format("MM/DD/YYYY HH:mm:ss.SSS");

    var ltgevttime = document.getElementById("ltgevttime");
    ltgevttime.value = evttime.value;

    var ltgevttimestop = document.getElementById("ltgevttimestop");
    ltgevttimestop.value = evttime.value;
  }

  function populateLineDropDown(showLoader = false) {
    lineLayer.definitionExpression = "1=1";
	lineLayer.createFeatureLayer().then(function (lineFeatureLayer){
      var query = lineFeatureLayer.createQuery();
	  query.orderByFields = lineSortFields;
      query.outFields = lineOutFields;
	  query.returnGeometry=false;
	  query.returnDistinctValues=true;

      lineFeatureLayer
        .queryFeatureCount()
        .then(function (numFeatures) {
          if (showLoader) {
            loader.show();
          }
          var numPages = Math.ceil(numFeatures / maxRecordCount);
          var resultPages = [];
          for (var i = 0; i < numPages; i++) {
            resultPages.push(i * maxRecordCount);
          }
          return Promise.all(
            resultPages.map(function (resultPageStart) {
              query.start = resultPageStart;
              query.num = maxRecordCount - 1;
              return lineFeatureLayer.queryFeatures(query);
            })
          );
        })
        .then(function (featureSets) {
          var features = [];
          featureSets.forEach(function (featureSet) {
            features = features.concat(featureSet.features);
          });
          return features;
        })
        .then(getLineValues)
        .then(getUniqueValues2)
        .then(addToLineSelect)
        .then(selectLine);
    });
  }

  function getLineValues(features) {
    var values = features.map(function (feature) {
      //do some filtering of invalid data
      var fields = [];
      lineFields.map((f) => {
        var curVal = feature.attributes[f.name];
        if (curVal != null && curVal !== "") {
          fields.push(curVal);
        }
      });
      return fields.join("|");
    });
    return values;
  }

  function addToLineSelect(values) {
    values.sort();
    var lineSelectOptions = Array.from(lineSelect.options).map((o) => o.value);
    values.forEach(function (value) {
      if (value.length >= 5) {
        var optvals = value.split("|");
        if (!lineSelectOptions.includes(optvals[1])) {
          var option = document.createElement("option");
          option.value = optvals[1];
          option.text = optvals[0];
          lineSelect.add(option);
        }
      }
    });
  }

  function populateStationDropDown(lineGeometries) {
    //buffer lineGeometries
    var params = new BufferParameters({
      distances: [1000],
      unit: "feet",
      geodesic: true,
      geometries: lineGeometries,
      unionResults: true,
      bufferSpatialReference: bufferSpatialReference,
      outSpatialReference: mapSpatialReference,
    });

    gsvc.buffer(params).then(function (lineBuffers) {
      lineBuffer = lineBuffers[0];
      //bufferLayer.add(new Graphic({geometry: lineBuffer}));
      zoomTo(lineBuffer);

      stationGeometries = getStationValues(lineBuffer)
        .then(getUniqueValues2)
        .then(addToStationSelect)
        .then(getStartStation);
    });
  }

  function setStructureDefinitionExpression(lineID) {
    //if the structure layer uses lineids for filtering, if not use proximity
	if(!useStructureProximity) { 
      structureLayer.definitionExpression = `${structureKeyField} = '${lineID}'`;
	  if (!structureLayer.visible) {
		structureLayer.visible = true;
      }
      return queryForStructureGeometries();
    } else {
      //buffer line geometries.
      var params = new BufferParameters({
        distances: [`${structureProximityFt}`] ,
        unit: "feet",
        geodesic: true,
        geometries: lineID,
        unionResults: true,
        bufferSpatialReference: bufferSpatialReference,
        outSpatialReference: mapSpatialReference,
      });

      return gsvc.buffer(params).then(function (lineBuffers){
        lineBuffer = lineBuffers[0];
        return queryForStructuresByProx(lineBuffer)
			   .then(getUniqueValues)
               .then(setStructureDefByProx);

      });

    }
    
  
  }

  function setStructureDefByProx(values){
	var defExpr="";
	values.forEach(function(value) {
		defExpr += `${structureKeyField} = '${value}' OR `;
	});
	defExpr = defExpr.substring(0,defExpr.length -4);
	structureLayer.definitionExpression = defExpr;	  
	if (!structureLayer.visible) {
		structureLayer.visible = true;
    }
	return queryForStructureGeometries();
  }

  function queryForStructuresByProx(linebuffer){
    var query = structureLayer.createQuery();
    query.geometry =linebuffer;
    query.outFields=structureKeyField;
    query.spatialRelationship = "intersects";
    return structureLayer.queryFeatures(query).then(function (response){
      var features=response.features;

      var values = features.map(function (feature){
		return feature.attributes[structureKeyField];
      });
	  return values;
    });
  }

  function queryForStructureGeometries() {
    var structureQuery = structureLayer.createQuery();
    return structureLayer
      .queryFeatures(structureQuery)
      .then(function (response) {
        //structureDefExpr = "";
        structureGeometries = response.features.map(function (feature) {
          return feature.geometry;
        });
        return structureGeometries;
      });
  }

  function getStationValues(lineBuffer, getStationValuesFields = "*") {
    var query = stationLayer.createQuery();
    query.geometry = lineBuffer;
    query.outFields = stationOutFields;
    query.spatialRelationship = "intersects";
    return stationLayer.queryFeatures(query).then(function (response) {
      var features = response.features;

      var values = features.map(function (feature) {
        var fields = [];
        stationFields.map((f) => {
			if(f.isAttribute) {
				var curVal = feature.attributes[f.name];
				fields.push(curVal);
            }
			
        });
		//get geometry from the map service instead of the attributes.
		var lat=feature.geometry.latitude;
		fields.push(lat);
		var lon=feature.geometry.longitude;
		fields.push(lon);
        return fields.join("|");
      });
      return values;
    });
  }

  function addToStationSelect(values) {
    var option = document.createElement("option");
    var defExpr = "";

    option.text = "Please select";
    stationSelect.options.length = 0;
    stationSelect.add(option);
    values.sort();
    values.forEach(function (value) {
      var optvals = value.split("|");
      var option = document.createElement("option");
      option.text = optvals[0];
      option.value = optvals[1];
      stationList.push({
        name: optvals[0],
        itsid: optvals[1],
        latitude: optvals[2],
        longitude: optvals[3],
      });
      stationSelect.add(option);
      defExpr += `${stationKeyField} = '${optvals[1]}' OR `;
    });
    defExpr = defExpr.substring(0, defExpr.length - 4);
    return setStationDefinitionExpression(defExpr);
  }

  function setStationDefinitionExpression(defExpr) {
    stationLayer.definitionExpression = defExpr;
    if (!stationLayer.visible) {
      stationLayer.visible = true;
    }
    return queryForStationGeometries();
  }

  function queryForStationGeometries() {
    var stationQuery = stationLayer.createQuery();

    return stationLayer.queryFeatures(stationQuery).then(function (response) {
      stationGeometries = response.features.map(function (feature) {
        return feature.geometry;
      });
      return stationGeometries;
    });
  }

  function setStationByName() {
    var a = FuzzySet([defaultStationName]);
    var bestMatchScore = 0;
    var bestMatchValue = "";

    var stationNames = document.getElementById("stationSelect");
    for (var i = 0; i < stationNames.options.length; i++) {
      var match = a.get(stationNames.options[i].text);
      if (match != null) {
        if (match[0][0] > bestMatchScore) {
          bestMatchScore = match[0][0];
          bestMatchValue = stationNames.options[i].value;
          bestMatchName = stationNames.options[i].text;
        }
      }
    }

    startStationName = bestMatchName;
    startStationID = bestMatchValue;
    stationNames.value = startStationID;
  }

  function getStartStation(stationGeometries) {
    if (defaultStationName != "") {
      setStationByName();
      stationLayer.createFeatureLayer().then(function (startStationLayer) {
        var query = startStationLayer.createQuery();
        query.where = `${stationKeyField} = '${startStationID}'`;
        startStationLayer
          .queryFeatures(query)
          .then(queryForStartStationGeometries)
          .then(addStartStationToMap)
          .then(validateFormParameters);
      });
    }
    return stationGeometries;
  }

  function resetEnvironment(full) {
    //if full reset do everything
    //if not full reset just clear faults / start stations / lightning
    ltgLayer.removeAll();
    faultsLayer.removeAll();
    startStationLayer.removeAll();
    fiStatusLayer.removeAll();

    faultLocID = 0;
    lastIndex = 0;
    //rslt.innerHTML="";
    stationSelect.selectedIndex = 0;
    document.getElementById("faultDistance").value = "";

    //clear fault table
    var tbody = document.getElementById("tb");
    var newtb = document.createElement("tbody");
    newtb.setAttribute("id", "tb");
    tbody.parentNode.replaceChild(newtb, tbody);

    //clear lightning table
    var tbodyltg = document.getElementById("tbltg");
    var newtbltg = document.createElement("tbody");
    newtbltg.setAttribute("id", "tbltg");
    tbodyltg.parentNode.replaceChild(newtbltg, tbodyltg);

    //hide fault results block
    var fltresultdiv = document.getElementById("fltresults");
    fltresultdiv.style.display = "none";

    //hide lighting results block
    var ltgresultdiv = document.getElementById("ltgresults");
    ltgresultdiv.style.display = "none";

    //document.getElementById("ltgLat").value="";
    //document.getElementById("ltgLon").value="";
    document.getElementById("ltgAddress").value = "";

    //clear scada mapping
    fiSCADANames.length = 0;

    //complete reset
    if (full) {
      lineLayer.visible = false;
      stationLayer.visible = false;
      structureLayer.visible = false;
      fiLayer.visible = false;

      stationLayer.definitionExpression = "1=1";
      var sg = queryForStationGeometries();
      structureLayer.definitionExpression = "1=1";
      var tg = queryForStructureGeometries();
      fiLayer.definitionExpression = "1=1";

      //reset form
      stationSelect.options.length = 0;
      document.getElementById("faultDistance").value = "";

      //reset globals
      lineGeometries = null;
      stationGeometries = null;
      structureGeometries = null;
      stationList.length = 0;
      selectedStationName = "";
    }
  }

  function getUniqueValues(values) {
    var uniqueValues = [];
    values.forEach(function (item, i) {
      if (
        (uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) &&
        item !== ""
      ) {
        uniqueValues.push(item);
      }
    });
    return uniqueValues;
  }

  function getUniqueValues2(values) {
    try {
      var uniqueValues = [];
      var uniqueIDs = [];
      values.forEach(function (item, i) {
        if (item.length > 0 && item.indexOf("|") > 0) {
          if (uniqueValues.length < 1) {
            uniqueValues.push(item);
            uniqueIDs.push(item.split("|")[1]);
          } else {
            var curID = item.split("|")[1];
            if (curID.length > 0 && uniqueIDs.indexOf(curID) === -1) {
              uniqueValues.push(item);
              uniqueIDs.push(item.split("|")[1]);
            }
          }
        }
      });
      return uniqueValues;
    } catch (e) {
      alert(e);
    }
  }

  function validateFormParameters() {
    if (lineSelect.selectedIndex == 0) {
      alert("Please select a line!");
      return;
    }
    var distance = parseFloat(document.getElementById("faultDistance").value);
    buildBookMarkLink();

    if (!isNaN(distance) && isFinite(distance) && distance > 0) {
      if (lineSelect.selectedIndex == 0) {
        output = "<font color='red'>Please Select Line</font>";
      } else {
        if (stationSelect.selectedIndex == 0) {
          output = "<font color='red'>Please Select Station</font>";
        } else {
          lineID = lineSelect.value;
          getFaultIndicators(lineID);
          queryForFIStatus();

          //all form values are valid, go get fault!

          getFaultLocations(distance);
        }
      }
    } else if (distance < 0) {
      //distance is 0 set fault at start station.
      var newpt = {
        type: "point",
        longitude: startStationGeometries[0].longitude,
        latitude: startStationGeometries[0].latitude
      };

      var ft = new Graphic({
        geometry: newpt,
        symbol: faultLocationSymbol(faultLocID),
      });
      faultsLayer.add(ft);

      var fltresultdiv = document.getElementById("fltresults");
      fltresultdiv.style.display = "block";
      var tbl = document
        .getElementById("resultstbl")
        .getElementsByTagName("tbody")[0];
      var row = tbl.insertRow(tbl.rows.length);
      var str = row.insertCell(0);
      var own = row.insertCell(1);
      var sta = row.insertCell(2);
      var dis = row.insertCell(3);
      str.innerHTML = "<font color='red'>No fault coordinates found.</font>";
      own.innerHTML = "NA";
      sta.innerHTML =
        document.getElementById("stationSelect").options[
          document.getElementById("stationSelect").selectedIndex
        ].text;
      dis.innerHTML = document.getElementById("faultDistance").value;

      processNextBookmark();
    } else {
      output = "<font color='red'>Please enter a valid distance!</font>";
    }

    if (validateLightningParms(false)) {
      //if good, start lightning search
      lightningSearch();
    }
    return "";
  }

  function buildBookMarkLink() {
    var bml = document.getElementById("bookmarklink");

    var stationSel = document.getElementById("stationSelect");
    var evttime = document.getElementById("evttime");
    var evttimeval = moment.tz(
      evttime.value,
      "MM/DD/YYYY HH:mm:ss.SSS",
      timezone
    );

    if (
      bookmarkParams.filter(
        (b) => b.lineID !== document.getElementById("lineSelect").value
      ).length > 0
    ) {
      //Bookmarks only available for the same line
      bookmarkParams = [];
    }

    var selectedStation = stationSel.options[stationSel.selectedIndex];
    bookmarkParams.push({
      lineID: document.getElementById("lineSelect").value,
      stationName:
        selectedStation == undefined || selectedStation == null
          ? ""
          : selectedStation.text,
      evntTime:
        evttimeval.clone().tz("GMT").format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z",
      distance: document.getElementById("faultDistance").value,
    });

    var params = {};
    for (var i = 0; i < bookmarkParams.length; i++) {
      params[`lineid_${i}`] = bookmarkParams[i].lineID;
      params[`stationname_${i}`] = bookmarkParams[i].stationName;
      params[`eventtime_${i}`] = bookmarkParams[i].evntTime;
      params[`distance_${i}`] = bookmarkParams[i].distance;
    }

    params["zoomToFault"] = autozoom.checked ? "y" : "n";
    params["totalLine"] = bookmarkParams.length;

    var searchParams = new URLSearchParams(params);

    bml.value =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      searchParams.toString();
  }

  function getFaultLocations(distance) {
    //get endpoints for all the lines/paths
    var segmentEndpoints = getSegmentEndPoints(lineGeometries);
    //get start point on line - nearest to substation
    var startPos = getStartPosition(startStationGeometries, segmentEndpoints);
    //build network topology from start station
    var neighbors = getNeighbors(segmentEndpoints);
    //
    //printNeighbors(neighbors);
    //get paths
    var curPath = [];
    var paths = [];
    //multiple segment line, get neighbors, else specify current line as path.
    if (neighbors.length > 1) {
      getPaths(neighbors, paths, curPath, startPos.id.toString());
    } else {
      paths.push(startPos.id.toString());
    }
    //find position(s)  & plot fault(s) on map
    var faultCoords = [];

    if (paths.length < 1) {
      paths.push(curPath);
    }
    for (let p in paths) {
      faultCoords.push(
        getFaultCoords(lineGeometries, distance, startPos, paths[p])
      );
    }

    //remove empty values
    cleanFaultCoords(faultCoords);
    //plot faults on map, if any remain
    if (faultCoords.length > 0) {
      var fltpts = plotFaultsOnMap(faultCoords);
      //find nearest structures
      findNearestStructures(fltpts);
    } else {
      //no fault coordinates found
      var fltresultdiv = document.getElementById("fltresults");
      fltresultdiv.style.display = "block";
      var tbl = document
        .getElementById("resultstbl")
        .getElementsByTagName("tbody")[0];
      var row = tbl.insertRow(tbl.rows.length);
      var str = row.insertCell(0);
      var own = row.insertCell(1);
      var sta = row.insertCell(2);
      var dis = row.insertCell(3);
      str.innerHTML = "<font color='red'>No fault coordinates found.</font>";
      own.innerHTML = "NA";
      sta.innerHTML =
        document.getElementById("stationSelect").options[
          document.getElementById("stationSelect").selectedIndex
        ].text;
      dis.innerHTML = document.getElementById("faultDistance").value;
      processNextBookmark();
    }
    return "";
  }

  function cleanFaultCoords(faultCoords) {
    for (c = faultCoords.length - 1; c >= 0; c--) {
      //if null clear it out
      if (faultCoords[c].length == 0) {
        faultCoords.splice(c, 1);
      }
    }
  }

  function getSegmentEndPoints(lineGeometries) {
    var startEndVal = [];

    var i = 0;
    for (let ln in lineGeometries) {
      for (let pth in lineGeometries[ln].paths) {
        var lenPaths = lineGeometries[ln].paths[pth].length - 1;
        var startPt = lineGeometries[ln].paths[pth][0];
        var endPt = lineGeometries[ln].paths[pth][lenPaths];

        var val = {
          id: i,
          line: ln,
          path: pth,
          startPt: startPt,
          endPt: endPt,
          neighbors: null,
        };
        i++;
        startEndVal.push(val);
      }
    }
    return startEndVal;
  }

  function getNeighbors(lineEnds) {
    //loop through each of the lines looking for neighbors
    for (let ln in lineEnds) {
      var curStartX = lineEnds[ln].startPt[0];
      var curStartY = lineEnds[ln].startPt[1];
      var curEndX = lineEnds[ln].endPt[0];
      var curEndY = lineEnds[ln].endPt[1];
      var neighbors = "";

      //loop through lines looking for neighbors.
      for (let r in lineEnds) {
        //skip current row, not a neighbor to itself
        if (r != ln) {
          if (
            (curStartX == lineEnds[r].startPt[0] &&
              curStartY == lineEnds[r].startPt[1]) ||
            (curStartX == lineEnds[r].endPt[0] &&
              curStartY == lineEnds[r].endPt[1]) ||
            (curEndX == lineEnds[r].startPt[0] &&
              curEndY == lineEnds[r].startPt[1]) ||
            (curEndX == lineEnds[r].endPt[0] && curEndY == lineEnds[r].endPt[1])
          ) {
            if (neighbors.length > 0) {
              neighbors += "," + r;
            } else {
              neighbors += r;
            }
          }
        }
      }
      lineEnds[ln].neighbors = neighbors;
    }
    return lineEnds;
  }

  function getStartPosition(startPt, lineEnds) {
    var dist1;
    var dist2;
    var closestPt;
    var distTot;
    var reverseFlag = false;
    var closestLine = 0;
    var closestPath = 0;
	var first=true;

    //loop through line line ends, determine which end of which path is the start location

	//assume point is wgs84, convert to mapunits
	var startpoint=new Point({latitude: startPt[0].latitude,longitude: startPt[0].longitude});

    for (let ln in lineEnds) {
	  var studyPointsl1=[];
      var studyPointsl2=[];
	  studyPointsl1.push(startpoint);
	  studyPointsl2.push(startpoint);

	  //first end
	  var end1pl=new Polyline();
	  var endptwgs84 = webMercatorUtils.xyToLngLat(lineEnds[ln].startPt[0], lineEnds[ln].startPt[1]);
	  var lineend1=new Point({longitude: endptwgs84[0], latitude: endptwgs84[1]});
	  studyPointsl1.push(lineend1);
      end1pl.addPath(studyPointsl1);

	  //other end
	  var end2pl = new Polyline();
	  endptwgs84 = webMercatorUtils.xyToLngLat(lineEnds[ln].endPt[0], lineEnds[ln].endPt[1]);
	  var lineend2=new Point({longitude: endptwgs84[0], latitude: endptwgs84[1]});
	  studyPointsl2.push(lineend2);
      end2pl.addPath(studyPointsl2);


      dist1 = geometryEngine.geodesicLength(end1pl, "feet");
      dist2 = geometryEngine.geodesicLength(end2pl, "feet");

	  //init the distance on the first run through the loop
	  if(first){
		distTot=dist2;
		first=false;
	  }

      //determine if this is the shortest distance so far
      if (dist1 <= distTot || dist2 <= distTot) {
        closestLine = lineEnds[ln].line;
        closestPath = lineEnds[ln].path;
        id = ln;

        //reverse lineGeometry since we are starting at wrong end.
        if (dist1 > dist2) {
          reverseFlag = true;
          distTot = dist2;
          closestPt = lineEnds[ln].endPt;
        } else {
          reverseFlag = false;
          distTot = dist1;
          closestPt = lineEnds[ln].startPt;
        }
      }
    }

    var output = {
      line: closestLine,
      path: closestPath,
      startPoint: closestPt,
      id: id,
    };
    return output;
    //return id;
  }

  function getPaths(neighbors, paths, path, startID) {
    //get neighbors
    if (startID != null && startID.length > 0) {
      var nbrs = neighbors[startID].neighbors.split(",");

      //remove visited neighbors
      for (let p in path) {
        var visited = nbrs.indexOf(path[p]);
        if (visited > -1) {
          nbrs.splice(visited, 1);
        }
      }

      path.push(startID);

      //if we are at the end push path to paths list
      if (nbrs.length < 1) {
        paths.push(path);
        return;
      }

      //visit neighbor nodes
      for (let nbr in nbrs) {
        var myPath = path.slice();
        getPaths(neighbors, paths, myPath, nbrs[nbr]);
      }
    }
    return;
  }

  function getFaultCoords(lineGeometry, distance, startInfo, topology) {
    var coords = [];
    var totalLength = 0;

    //loop through line geometry, using topology where necessary to navigate to next line geometry

    var curPt, nextPt;

    //only look for faults within the line length
    //loop through topology, accumulating distances
	var wgs84coords = webMercatorUtils.xyToLngLat(startInfo.startPoint[0],startInfo.startPoint[1]);
	
    var startPt = new Point({
		longitude: wgs84coords[0], 
		latitude: wgs84coords[1]
	});

    curPt = startPt;
    for (let t in topology) {
      var pCoords = lineGeometry[topology[t]].paths[0][0];
	  var wgs84pCoords = webMercatorUtils.xyToLngLat(pCoords[0], pCoords[1]);
      nextPt = new Point({
		  longitude: wgs84pCoords[0], 
		  latitude: wgs84pCoords[1]
	  });

      //determine direction of segment, ignore start
      if (isReversed(curPt, nextPt)) {
        //reverse the paths within this segment.
        lineGeometry[topology[t]].paths[0].reverse();
        var pCoords = lineGeometry[topology[t]].paths[0][0];
		var wgs84pCoords=webMercatorUtils.xyToLngLat(pCoords[0], pCoords[1]);
        nextPt = new Point({
		longitude: wgs84pCoords[0], latitude: wgs84pCoords[1]});
        //if other endpoint still doesn't match, then throw away this path
        if (isReversed(curPt, nextPt)) {
          return coords;
        }
      }
      var lenPaths = lineGeometry[topology[t]].paths[0].length - 1;

      for (var i = 0; i <= lenPaths; i++) {
        var pathcoords = lineGeometry[topology[t]].paths[0][i];
		var pathcoordswgs84 = webMercatorUtils.xyToLngLat(pathcoords[0], pathcoords[1]);
        nextPt = new Point({longitude: pathcoordswgs84[0], latitude: pathcoordswgs84[1]});
        if (curPt) {
          var seg = new Polyline();
		  //seg.spatialReference = SpatialReference({ wkid: mapSpatialReference });
          seg.addPath([curPt, nextPt]);
          var segLength = geometryEngine.geodesicLength(seg, "miles");
          totalLength += segLength;
          if (totalLength > distance) {
            coords.push(lineGeometry[topology[t]].paths[0][i]);
            return coords;
          }
        }
        curPt = nextPt;
      }
    }
    return coords;
  }

  function isReversed(pta, ptb) {
    var output = false;
    if (pta.x != ptb.x && pta.y != ptb.y) {
      output = true;
    }

    return output;
  }

  function plotFaultsOnMap(faultCoords) {
    var ft;
    var fltPts = [];

    for (pt in faultCoords) {
      var newpt = new Point(faultCoords[pt][0][0], faultCoords[pt][0][1], {
        wkid: mapSpatialReference,
      });

      ft = new Graphic({
        geometry: newpt,
        symbol: faultLocationSymbol(faultLocID),
      });
      faultsLayer.add(ft);
      fltPts.push(newpt);
    }
    return fltPts;
  }

  function findNearestStructures(faultPoints) {
    //buffer faultPoints
    var params = new BufferParameters({
      distances: [300],
      unit: "feet",
      geodesic: true,
      unionResults: true,
      geometries: faultPoints,
      bufferSpatialReference: bufferSpatialReference,
      outSpatialReference: mapSpatialReference, //needs to be double checked the spatial reference 3/15/2022
    });

    var nearestStructures = gsvc.buffer(params).then(function (faultPoints) {
      faultPoint = faultPoints[0];
      getFltStructures(faultPoint);
    });
    return nearestStructures;
  }

  function getFltStructures(faultBuffer, fields = fltStructureOutFields) {
    var query = structureLayer.createQuery();
    query.geometry = faultBuffer;
    query.outFields = fields;
    query.returnGeometry = true;
    query.spatialRelationship = "intersects";
    return structureLayer.queryFeatures(query).then(function (response) {
      var features = response.features;
      var values = features.map(function (feature) {
        var fields = [];
        fltStructureFields.map((f) => {
          var curVal = f.isAttribute
            ? feature.attributes[f.name]
            : feature.geometry[f.name];
          if (curVal) {
            fields.push(curVal);
          }
        });
        return fields.join("|");
      });

      var autoZoom = document.getElementById("autozoom").checked;
      if (autoZoom) {
        zoomTo(faultBuffer);
      }

      fltVals = getUniqueValues(values);

      var fltresultdiv = document.getElementById("fltresults");
      fltresultdiv.style.display = "block";

      for (var i = 0; i < fltVals.length; i++) {
        var myColor = JSON.stringify(colorWays[faultLocID]);
        myColor = myColor.replace("[", "");
        myColor = myColor.replace("]", "");
        var tbl = document
          .getElementById("resultstbl")
          .getElementsByTagName("tbody")[0];
        var row = tbl.insertRow(tbl.rows.length);
        var str = row.insertCell(0);
        var own = row.insertCell(1);
        var sta = row.insertCell(2);
        var dis = row.insertCell(3);
        var strinfo = fltVals[i].split("|");
        str.innerHTML =
          "<p style='color:rgba(" + myColor + ");'>" + strinfo[0] + "</p>";
        own.innerHTML = strinfo[1];
        sta.innerHTML =
          document.getElementById("stationSelect").options[
            document.getElementById("stationSelect").selectedIndex
          ].text;
        dis.innerHTML = parseFloat(
          document.getElementById("faultDistance").value
        ).toFixed(3);
      }
      processNextBookmark();
    });

    return "";
  }

  function processNextBookmark() {
    if (bookmarkFuncsWithBookmark.length > 0) {
      var curBookmarkFunc = bookmarkFuncsWithBookmark.shift();
      if (curBookmarkFunc) {
        curBookmarkFunc.func(curBookmarkFunc.bookmark);
      }
    } else {
      loader.hide();
    }
  }

  function lightningSearch() {
    //get line buffer
    if (txdenabled) {
      var params = new BufferParameters({
        distances: [1],
        unit: "kilometers",
        geodesic: true,
        geometries: lineGeometries,
        unionResults: true,
        bufferSpatialReference: bufferSpatialReference,
        outSpatialReference: lightningSpatialReference,
      });

      gsvc
        .buffer(params)
        .then(function (linebuffers) {
          var newlb = geometryEngine.generalize(
            linebuffers[0],
            500,
            true,
            "feet"
          );
          return newlb;
        })
        .then(function (linebuffers) {
          var projlb = webMercatorUtils.webMercatorToGeographic(linebuffers);
          return projlb;
        })
        .then(function (linebuffers) {
          //for debugging buffer geometry
          //ltgLayer.add(new Graphic({geometry: linebuffers, symbol: { type: "simple-fill", color:[255,120,0,0.3] }}));
          return linebuffers;
        })
        .then(function (linebuffers) {
          lineBuffer = linebuffers;
          maxDiff =
            parseInt(document.getElementById("timewindow").value) / 1000;
          var req = makeTXDpolyrequest(lineBuffer);
          var rsp = sendTXDrequest(req, "evttime");
        });
    } else {
      console.log("Lightning search feature not enabled");
    }
  }

  function lightningSearchAdv() {
    if (txdenabled) {
      maxDiff = 0;
      var req = makeTXDpointrequest();
      var rsp = sendTXDrequest(req, "ltgevttime");
    } else {
      console.log("Lightning search feature not enabled");
    }
  }

  //txd100 API third party url
  function makeTXDpointrequest() {
    var evttime = document.getElementById("ltgevttime");
    var evttimestop = document.getElementById("ltgevttimestop");

    var evttimeval = moment.tz(
      evttime.value,
      "MM/DD/YYYY HH:mm:ss.SSS",
      timezone
    );
    var gmtString = evttimeval
      .clone()
      .tz("GMT")
      .format("ddd MMM DD HH:mm:ss z YYYY");

    var evttimevalstop = moment.tz(
      evttimestop.value,
      "MM/DD/YYYY HH:mm:ss.SSS",
      timezone
    );
    var gmtStringstop = evttimevalstop
      .clone()
      .tz("GMT")
      .format("ddd MMM DD HH:mm:ss z YYYY");

    //var timewindow = document.getElementById("ltgtimewindow").value;
    //Format expected by TXD100 API Tue Oct 24 23:21:04 GMT 2006
    var lat = document.getElementById("ltgLat").value;
    var lon = document.getElementById("ltgLon").value;
    var dist = document.getElementById("ltgDistance").value;
    var radiusm = parseFloat(dist) * 1609.34;

    var xmlReq = "<request>";
    xmlReq += "<userId>" + txduid + "</userId>";
    xmlReq += "<password>" + txdpwd + "</password>";
    xmlReq += '<location-query type="pointRadius" cloud="false">';
    xmlReq += "<lat>" + lat + "</lat>";
    xmlReq += "<lon>" + lon + "</lon>";
    xmlReq += "<radius-m>" + radiusm + "</radius-m>";
    xmlReq += "</location-query>";
    xmlReq += "<time-query>";
    xmlReq += "<start-time>" + gmtString + "</start-time>";
    xmlReq += "<end-time>" + gmtStringstop + "</end-time>";
    //xmlReq += "<duration units=\"seconds\">" + timewindow + "</duration>";
    xmlReq += "</time-query>";
    xmlReq += "</request>";

    return xmlReq;
  }

  function makeTXDpolyrequest(lineBuffers) {
    var evttime = document.getElementById("evttime");
    var evttimeval = moment.tz(
      evttime.value,
      "MM/DD/YYYY HH:mm:ss.SSS",
      timezone
    );
    var gmtString = evttimeval
      .clone()
      .tz("GMT")
      .format("ddd MMM DD HH:mm:ss z YYYY");
    //Format expected by TXD100 API Tue Oct 24 23:21:04 GMT 2006
    var xmlReq = "<request>";
    xmlReq += "<userId>" + txduid + "</userId>";
    xmlReq += "<password>" + txdpwd + "</password>";
    xmlReq += '<location-query type="polygon" cloud="false">';
    for (i = 0; i < lineBuffers.rings[0].length; i++) {
      xmlReq += "<point>";
      xmlReq += "<lat>" + lineBuffer.rings[0][i][1].toFixed(4) + "</lat>";
      xmlReq += "<lon>" + lineBuffer.rings[0][i][0].toFixed(4) + "</lon>";
      xmlReq += "</point>";
    }
    xmlReq += "</location-query>";
    xmlReq += "<time-query>";
    xmlReq += "<start-time>" + gmtString + "</start-time>";
    xmlReq += '<duration units="seconds">1</duration>';
    xmlReq += "</time-query>";
    xmlReq += "</request>";

    return xmlReq;
  }

  function sendTXDrequest(xml, starttimefield) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        processLightningResponse(this.responseText, starttimefield);
      }
    };
    xhttp.open("POST", txdurl, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //xhttp.setRequestHeader("User-agent", "VaisalaTDX100Client/1.0");

    xhttp.send("request=" + xml);
  }

  function processLightningResponse(rsp, starttimefield) {
    ltgPoints = [];
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(rsp, "text/xml");
    var rspType = xmlDoc
      .getElementsByTagName("response")[0]
      .getAttribute("type");
    if (rspType == "success") {
      var evttime = document.getElementById(starttimefield).value;
      var timeparts = evttime.split(":");

      var secs = timeparts[2];

      var r = xmlDoc.getElementsByTagName("row");
      var j = 1;
      for (i = 0; i < r.length; i++) {
        //get details
        if (maxDiff > 0) {
          var curdatetime = r[i].getElementsByTagName("date")[0].childNodes[0].nodeValue + " " + r[i].getElementsByTagName("time")[0].childNodes[0].nodeValue;
          var lTime = moment.tz(curdatetime,"MMM DD, YYYY HH:mm:ss:SSS","GMT");
          var curTime = lTime.clone().tz(timezone).format("MM/DD/YYYY HH:mm:ss.SSS");
          var curSecs = curTime.split(":")[2];
          if (Math.abs(curSecs - secs) < maxDiff) {
            var curlat = parseFloat(r[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue);
            var curlon = parseFloat(r[i].getElementsByTagName("lon")[0].childNodes[0].nodeValue);
            var curSig = parseFloat(r[i].getElementsByTagName("signal")[0].childNodes[0].nodeValue).toFixed(2);
            var semimajor = parseFloat(r[i].getElementsByTagName("semi-major-axis")[0].childNodes[0].nodeValue);
            var semiminor = parseFloat(r[i].getElementsByTagName("semi-minor-axis")[0].childNodes[0].nodeValue);
            var angle_rad = parseFloat(r[i].getElementsByTagName("angle")[0].childNodes[0].nodeValue);
			
            ltgPoints.push({
              id: j,
              lat: curlat,
              lon: curlon,
              signal: curSig,
              time: curTime,
              smin: semiminor,
              smaj: semimajor,
              angle: angle_rad,
            });
            j++;
          }
        } else {
          //for data prefiltered by api
		  //for data prefiltered by api
		  var curdatetime = r[i].getElementsByTagName("date")[0].childNodes[0].nodeValue + " " + r[i].getElementsByTagName("time")[0].childNodes[0].nodeValue;
		  var lTime = moment.tz(curdatetime,"MMM DD, YYYY HH:mm:ss:SSS","GMT");
		  var curTime = lTime.clone().tz(timezone).format("MM/DD/YYYY HH:mm:ss.SSS");
          var curSecs = curTime.split(":")[2];
          var semimajor = parseFloat(r[i].getElementsByTagName("semi-major-axis")[0].childNodes[0].nodeValue);
          var semiminor = parseFloat(r[i].getElementsByTagName("semi-minor-axis")[0].childNodes[0].nodeValue);
          var angle_rad = parseFloat(r[i].getElementsByTagName("angle")[0].childNodes[0].nodeValue);

          var curlat = parseFloat(r[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue);
          var curlon = parseFloat(r[i].getElementsByTagName("lon")[0].childNodes[0].nodeValue);
          var curSig = parseFloat(r[i].getElementsByTagName("signal")[0].childNodes[0].nodeValue).toFixed(2);

          ltgPoints.push({
            id: j,
            lat: curlat,
            lon: curlon,
            signal: curSig,
            time: curTime,
            smin: semiminor,
            smaj: semimajor,
            angle: angle_rad,
          });
          j++;
        }
      }

      if (ltgPoints.length > 0) {
        plotLightning(ltgPoints);
      } else {
        ltgPoints.push({
          id: "No Lightning Found",
          lat: "",
          lon: "",
          signal: "",
          time: "",
        });
        var ltgtresultdiv = document.getElementById("ltgresults");
        ltgtresultdiv.style.display = "block";
        var tbl = document
          .getElementById("resultstblltg")
          .getElementsByTagName("tbody")[0];
        var row = tbl.insertRow(tbl.rows.length);
        var str = row.insertCell(0);
        var tim = row.insertCell(1);
        str.innerHTML = "<font color='red'>No lightning found.</font>";
        tim.innerHTML = document.getElementById(starttimefield).value;
        var outputType = getUrlParameter("output");
        if (outputType.length > 0 && outputType == "jpg") {
          getOutput();
        }
      }
    } else {
      var e =
        xmlDoc.getElementsByTagName("error-message")[0].childNodes[0].nodeValue;
      alert(e);
    }
  }

  //confidence ellipse

  const degree2Radium = (deg) => {
    return deg * (Math.PI / 180);
  };

  const radium2Degree = (rad) => {
    return rad * (180 / Math.PI);
  };

  const getPointsForEllipse = (lat1, lon1, xaxis, yaxis, rotation) => {
    //axis distance in km
    var rEarth = 9000; //# Earth's average radius in km, actual is closer to 6378.137
    var rXaxis = xaxis / 10 / rEarth; // /1000 converts meters to km
    var rYaxis = yaxis / 10 / rEarth; //that shall be km distance, just use xaxis/yaxis at line 44, 45 if you want to measure by dms

    var rRotation = rotation;
    var polygonRings = [];
    for (var i = 0; i <= 360; i += 10) {
      var t = degree2Radium(i); // # ellipse math ref
      var x = rXaxis * Math.cos(t); // # ellipse math
      var y = rYaxis * Math.sin(t); // # ellipse math
      var rot_x = lon1 + x * Math.cos(rRotation) - y * Math.sin(rRotation); // # rotate/transpose ellipse
      var rot_y = lat1 + y * Math.cos(rRotation) + x * Math.sin(rRotation); // # rotate/transpose ellipse
      polygonRings.push([rot_x, rot_y]);
    }
    return polygonRings;
  };

  function plotLightning(ltgPoints) {
    var ltgtresultdiv = document.getElementById("ltgresults");
    ltgtresultdiv.style.display = "block";
    var tbl = document
      .getElementById("resultstblltg")
      .getElementsByTagName("tbody")[0];

    for (pt in ltgPoints) {
      var ltgpoint = new Point(ltgPoints[pt]["lon"], ltgPoints[pt]["lat"], {
        wkid: lightningSpatialReference,
      });
      var ltgattr = ltgPoints[pt];

      ltg = new Graphic({
        geometry: ltgpoint,
        symbol: ltgSymbol,
        attributes: ltgattr,
        popupTemplate: ltgPopupTemplate,
      });
      ltgLayer.add(ltg);

      ltgid = new TextSymbol({
        text: ltgattr["time"] + ", " + ltgattr["signal"] + " kA",
        xoffset: 70,
        yoffset: -3,
      });
      ltglbl = new Graphic(ltgpoint, ltgid);
      ltgLayer.add(ltglbl);

      var row = tbl.insertRow(tbl.rows.length);
      var id = row.insertCell(0);
      var tim = row.insertCell(1);
      var sig = row.insertCell(2);
      var lat = row.insertCell(3);
      var lon = row.insertCell(4);

      id.innerHTML = ltgPoints[pt]["id"];
      tim.innerHTML = ltgPoints[pt]["time"];
      sig.innerHTML = ltgPoints[pt]["signal"];
      lat.innerHTML = ltgPoints[pt]["lat"].toFixed(4);
      lon.innerHTML = ltgPoints[pt]["lon"].toFixed(4);

      //replace to the following with the relavent data in ltgPoints
      var polygonEllipse = {
        type: "polygon",
        rings: getPointsForEllipse(
          ltgPoints[pt]["lat"],
          ltgPoints[pt]["lon"],
          ltgPoints[pt]["smaj"],
          ltgPoints[pt]["smin"],
          ltgPoints[pt]["angle"]
        ),
        spatialReference: { wkid: mapSpatialReference },
      };

      var polygonEllipseGraphic = new Graphic({
        geometry: polygonEllipse,
        symbol: ltgEllipseSymbol,
      });
      ltgLayer.addMany([polygonEllipseGraphic]);
    }

    var outputType = getUrlParameter("output");
    if (outputType.length > 0 && outputType == "jpg") {
      getOutput();
    }
  }
  var locator = new Locator(locatorURL);
  $("#ltgAddress").autocomplete({
    source: function (request, response) {
      const params = {
        text: request.term, // Suggestion text
      };
      locator.suggestLocations(params).then((data) => {
        // Show a list of the suggestions
        var formattedData = data.map((d) => {
          return {
            label: d.text,
            value: d.text,
            magicKey: d.magicKey,
          };
        });
        response(formattedData);
      });
    },
    minLength: 2,
    select: function (event, ui) {
      var item = ui.item;
      var address = { singleLine: item.value };
      var newaddress = { address: address, magicKey: item.Magickey };
      locator.addressToLocations(newaddress).then((results) => {
        if (results.length > 0) {
          var lat = document.getElementById("ltgLat");
          var lon = document.getElementById("ltgLon");
          lat.value = results[0].location.latitude;
          lon.value = results[0].location.longitude;
        }
      });
    },
  });
});

$(document).ready(function () {
  document.getElementById("defaultOpen").click();
  $("#evttime").datetimepicker({
    timeFormat: "HH:mm:ss.l",
  });

  $("#ltgevttime").datetimepicker({
    timeFormat: "HH:mm:ss.l",
  });

  $("#ltgevttimestop").datetimepicker({
    timeFormat: "HH:mm:ss.l",
  });

  var infoDiv = $("#infoDiv");
  infoDiv.draggable().resizable({
    minHeight: infoDiv.outerHeight(),
    minWidth: infoDiv.outerWidth(),
  });

  $("#btnPanel").hover(
    function () {
      $(infoDiv).draggable("enable");
    },
    function () {
      $(infoDiv).draggable("disable");
    }
  );

  $("#minimizeButton").click(function () {
    $("#infoDiv").hide();
    $("#minimizedInfoBar").show();
  });

  $("#maximizeButton").click(function () {
    $("#infoDiv").show();
    $("#minimizedInfoBar").hide();
  });

  $("#togglePrintView").click(function () {
    $(".esri-print").toggle();
  });
});
