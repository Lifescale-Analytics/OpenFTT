require([
  "esri/config",
  "esri/Map",
  "esri/widgets/Print",
  //"esri/widgets/CoordinateConversion",
  //"esri/views/MapView",
  "esri/layers/FeatureLayer",
  //"esri/layers/support/Sublayer",
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
  "esri/layers/support/LabelClass",
  //"esri/core/Collection",
  "dojo/json",
  "dojo/text!./config.json",
], function (
  esriConfig,
  Map,
  Print,
  //CoordinateConversion,
  //MapView,
  FeatureLayer,
  //Sublayer,
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
  LabelClass,
 //Collection,
  json,
  data
) {
  
  //configuration
  var serverIP = `${window.location.origin}/`;
  var data = JSON.parse(data);
  esriConfig.apiKey = data.apiKey;
  var gisServerName = data.servername;
  var useProxy = data.useProxy;
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
  var fiHealthCheckPt = data.fiHealthCheckPt;
  var initialExtent = JSON.parse(data.initialExtent);
  var maxRecordCount = data.maxRecordCount;
  var aovPopuptitle = data.aovPopuptitle;
  var aovLinePopuptitle = data.aovLinePopuptitle;
  var ltgPopuptitle = data.ltgPopuptitle;
  var fiInfotitle = data.fiInfotitle;
  var txduid = data.txduid;
  var txdpwd = data.txdpwd;
  var txdenabled = data.txdenabled;
	var integratorenabled = data.integratorenabled;
	var integratorapiauthurl = data.integratorapiauthurl.replace("serverIP", serverIP);
	var integratorbboxurl = data.integratorbboxurl.replace("serverIP", serverIP);
  var integratorpolyurl = data.integratorpolyurl.replace("serverIP", serverIP);
  var mapSpatialReference = parseInt(data.mapSpatialReference);
  var bufferSpatialReference = parseInt(data.bufferSpatialReference);
  var lightningBufferSpatialReference = parseInt(data.lightningBufferSpatialReference);
  var lightningPlotSpatialReference = parseInt(data.lightningPlotSpatialReference);
  var faultLocID = parseInt(data.faultLocID);
  var stationLayerID = parseInt(data.stationLayerID);
  var lineLayerID = parseInt(data.lineLayerID);
  var structureLayerID = parseInt(data.structureLayerID);
  var switchLayerID = parseInt(data.switchLayerID);
  var switchKeys = data.switchKeys;
  var switchEnabled = data.switchEnabled;
  var useSwitchLabel = data.useSwitchLabel;
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
  var useStructureLabel = data.useStructureLabel;
  var useSpanTolerance = data.useSpanTolerance;
  var spanTolerance = parseFloat(data.spanTolerance);
  
  var structureKeyField = fltStructureFields
    .filter((f) => f.key)
    .map((f) => f.name)[0];
  var structureTitleField = fltStructureFields
    .filter((f) => f.isTitle)
    .map((f) => f.name)[0];
  var fltStructureOutFields = fltStructureFields
    .filter((f) => f.outfield)
    .map((f) => f.name);
  var useStationLabel = data.useStationLabel;
  var stationFields = data.stationFields;
  var stationTitleField = stationFields
    .filter((f) => f.isTitle)
    .map((f) => f.name)[0];
  var stationKeyField = stationFields
    .filter((f) => f.key)
    .map((f) => f.name)[0];

  var useStationFilter = data.useStationFilter;
  var stationFilterField = data.stationFilterField;
  var stationOutFields = stationFields
    .filter((f) => f.outfield)
    .map((f) => f.name);

  var structTblHeaders = fltStructureFields
    .filter((f)=> f.tblHeader)
    .map((f) => f.tblHeader + ", " + f.name);

  var queryfields = [stationTitleField, stationKeyField];

  var fiEnabled = data.fiEnabled;
  var fiTimeZone = data.fiTimeZone;
  var fiPrimaryKey = data.fiPrimaryKey;
  var fiFields = data.fiFields;
  var infoFields = fiFields.map((f) => f);
  var fiStatusFields = fiFields.map((f) => f.fieldName);
  var fiHealthStatus = false;

  var aov1PopupFields = data.aov1PopupFields;
  var aov2PopupFields = data.aov2PopupFields;
  var aovLinePopupFields = data.aovLinePopupFields;
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

  //Setup AOV Legend table
  // n color values corresponds to n-1 breakpoints
  var aovColors =  [
      [165,0,38,1],
      [215,48,39,1],
      [244,109,67,1],
      [253,174,97,1],
      [254,224,139,1],
      [217,239,139,1],
      [166,217,106,1],
      [102,189,99,1],
      [26,152,80,1],
      [0,104,55,1]
    ];

  var aovBreakpoints =  [
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9
  ];

  setupAOVLegend(aovColors, aovBreakpoints);
  
  //set up proxyUrl
  if(useProxy){
    urlUtils.addProxyRule({
      urlPrefix: gisServerName,
      proxyUrl: proxyURL,
    });
  
  }

  //create layers for lines/stations/structures/highlights/faults
  var lineRender = {
    type: "simple",
    symbol: {
      type: "simple-line",
      color: [0, 112, 255, 1],
    },
  };

  var stationRender=JSON.parse(data.stationRender);
  var structureRender=JSON.parse(data.structureRender);
  var switchRender=JSON.parse(data.switchRender);

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

  var aovReferenceBusSymbol = {
    type: "simple-marker",
    style: "x",
    outline: { width: 1.25, color: [255, 0, 0, 1] },
    size: 8,
  }

  //AOV File Upload
  document.getElementById("clear-aov").addEventListener("click", (event) => {
    //clear form data
    document.getElementById("uploadForm").reset();
    //clear map graphics
    resetEnvironment(false);
  });

  document.getElementById("uploadForm").addEventListener("change", (event) => {
    var reader = new FileReader();
    reader.onload = (event) => {
      var csvData = $.csv.toObjects(event.target.result);
      aovLayer.removeAll();
      plotAoVOnMap(csvData);
    }
    reader.onerror = (err) => {
      alert(JSON.stringify(err));
    }
    event.target.files.length > 0 && reader.readAsText(event.target.files[0]);
  });

  //set up map services / layers
  var gsvc = new GeometryService({ url: gsvcURL });
  var ltgLayer = new GraphicsLayer();
  var faultsLayer = new GraphicsLayer();
  var startStationLayer = new GraphicsLayer();
  var fiStatusLayer = new GraphicsLayer();
  var aovLayer = new GraphicsLayer();
  //var bufferLayer = new GraphicsLayer();

  const switchLabel = JSON.parse(data.switchLabel);
  const structureLabel = JSON.parse(data.structureLabel);
  const stationLabel = JSON.parse(data.stationLabel);

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
        id: structureLayerID,
        renderer: structureRender,
        visible: false,
      }
    ],
  });

  if(fiEnabled){
    var fiSubLayer = new Sublayer({id: fiLayerID, renderer: fiSymbol, visible: false});
    txMapLayers.sublayers.add(fiSubLayer);
  }

  var switchLayer;
  if(switchEnabled){
    var switchSubLayer = new Sublayer({id: switchLayerID, renderer: switchRender, visible: false});
    txMapLayers.sublayers.add(switchSubLayer);
    switchLayer = txMapLayers.findSublayerById(switchLayerID);
    if(useSwitchLabel) {
      switchLayer.labelingInfo = [switchLabel];
    }

  }

  var structurePopupTemplate = {
    title: "Structure: {" + `${structureTitleField}` + "}",
    outFields: ["*"],
    content: distanceToStation,
  };

  var aovPopupTemplate = {
    title: aovPopuptitle,
    content: [
      {
        type: "fields",
        fieldInfos: null,
      },
    ],
  };

  var aovLinePopupTemplate = {
    title: aovLinePopuptitle,
    content: [
      {
        type: "fields",
        fieldInfos: aovLinePopupFields
      }
    ]
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
  
  var fiLayer;
  if(fiEnabled){
    fiLayer = txMapLayers.findSublayerById(fiLayerID);
    fiLayer.popupTemplate = fiInfoTemplate;
  }

  var stationLayer = txMapLayers.findSublayerById(stationLayerID);
  if(useStationLabel){
    stationLayer.labelingInfo = [stationLabel];
  }

  var structureLayer = txMapLayers.findSublayerById(structureLayerID);
  structureLayer.popupTemplate = structurePopupTemplate;
  if(useStructureLabel){
    structureLayer.labelingInfo = [structureLabel];
  }

  //create output table headers
  var resulttblhdr = document.getElementById("resulttblhdr");
  row = resulttblhdr.insertRow(-1);
  structTblHeaders.map((f)=> { 
    headerCell = document.createElement("TH"); 
    headerCell.innerHTML = f.split(",")[0]; 
    row.appendChild(headerCell); 
  });
  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Station";
  row.appendChild(headerCell);
  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Distance";
  row.appendChild(headerCell);

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
      aovLayer,
    ],
  });

  var btnClearFaults = document.getElementById("clear-faults");
  btnClearFaults.addEventListener("click", function () {
    resetEnvironment(false);
  });

  var btnClearLightning = document.getElementById("clear-lightning");
  btnClearLightning.addEventListener("click", function () {
    resetEnvironment(false);
  });

  var checkAutozoom = document.getElementById("autozoom");
  checkAutozoom.addEventListener("click", function() {
    setCookie("autozoomtofault", checkAutozoom.checked, 365);
  });

  var lineSelect = document.getElementById("lineSelect");
  var stationSelect = document.getElementById("stationSelect");
  var btnLocateLightningADV = document.getElementById("locate-adv-lightning");
  var btnLocateFault = document.getElementById("locate-faults");
  var btnLocateLightning = document.getElementById("locate-lightning");

  
  var lastIndex = -1;
 
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
      //get fault indicators
      getFaultIndicators(defaultLineId);

      //get switches
      getSwitches(defaultLineId);
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

function startup() {
  alert('Here');
  checkCookie();
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

  getInfoDivMinHeight();

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
    getInfoDivMinHeight();
  });
}

startup();