define([
  'dojo/_base/declare', 
  'jimu/BaseWidget', 
  "esri/config",
  "esri/map",
  "esri/dijit/Print",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/geometry/Polyline",
  "esri/geometry/Point",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/tasks/locator",
  "esri/tasks/GeometryService",
  "esri/geometry/geometryEngine",
  "esri/tasks/ProjectParameters",
  "esri/tasks/BufferParameters",
  "esri/tasks/QueryTask",
  "esri/tasks/query",
  "esri/graphic",
  "esri/SpatialReference",
  "esri/dijit/BasemapToggle",
  "esri/dijit/Scalebar",
  "esri/layers/MapImageLayer",
  "esri/geometry/Extent",
  "esri/urlUtils",
  "esri/geometry/webMercatorUtils",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/TextSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  "esri/layers/LabelClass",
  "dojo/json",
  "dojo/ready",
  "dojo/text!./config.json",
  "jimu/loaderplugins/jquery-loader!./widgets/openFTT/libs/jquery-3.6.0.min.js, ./widgets/openFTT/libs/jquery.csv.min.js, ./widgets/openFTT/libs/jquery-ui.min.js, ./widgets/openFTT/libs/jquery-ui-timepicker-addon.min.js",
  "moment/moment",
  "./libs/moment-timezone-with-data",
  './widgets/openFTT/utils.js',
],
function(
  declare,
  BaseWidget,
  esriConfig,
  Map,
  Print,
  ArcGISDynamicMapServiceLayer,
  Polyline,
  Point,
  GraphicsLayer,
  FeatureLayer,
  Locator,
  GeometryService,
  geometryEngine,
  ProjectParameters,
  BufferParameters,
  QueryTask,
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
  SimpleFillSymbol,
  SimpleLineSymbol,
  Color,
  LabelClass,
  json,
  ready,
  data,
  $,
  moment,
  openTab,
) 
{
  //To create a widget, you need to derive from BaseWidget.
  var clazz =  declare([BaseWidget], {
    // Custom widget code goes here
    baseClass: 'openFTT',
    // this property is set by the framework when widget is loaded.
    name: 'Open Fault Trace Tool',
    // add additional properties here
    
    //Begin Configuration Variables
    serverIP: `http://localhost/`,
    apiKey: '',
    gisServerName: '',
    useProxy: false,
    proxyURL: '',
    baseURL: '',
    gsvcURL: '',
    txdurl: '',
    locatorURL: '',
    fiURL: '',
    mapServerURL: '',
    printServiceUrl: '',
    stationLayerID: '',
    structureLayerID: '',
    fiLayerID: '',
    fiHealthCheckPt: '',
    initialExtent: null,
    maxRecordCount: 0,
    aovPopuptitle: '',
    aovLinePopuptitle: '',
    ltgPopuptitle: '',
    fiInfotitle: '',
    txduid: '',
    txdpwd: '',
    txdenabled: '',
    integratorenabled: false,
    integratorapiauthurl: '',
    integratorbboxurl: '',
    integratorpolyurl: '',
    mapSpatialReference: 0,
    bufferSpatialReference: 0,
    lightningBufferSpatialReference: 0,
    lightningPlotSpatialReference: 0,
    faultLocID: 0,
    stationLayerID: '',
    lineLayerID: '',
    structureLayerID: 0,
    switchLayerID: '',
    switchKeys: '',
    switchEnabled: '',
    useSwitchLabel: '',
    fiLayerID: '',
    maxRecordCount: '',
    timezone: '',
    lineFields: '',
    lineOutFields: [],
    lineKeyField: '',
    lineSortFields: [],
    fltStructureFields: '',
    useStructureProximity: '',
    structureProximityFt: '',
    useStructureLabel: false,
    useSpanTolerance: false,
    spanTolerance: 0.0,
    structureKeyField: '',
    structureTitleField: '',
    fltStructureOutFields: [],
    useStationLabel: false,
    stationFields: [],
    stationTitleField: '',
    stationKeyField: '',

    useStationFilter: false,
    stationFilterField: '',
    stationOutFields: [],

    structTblHeaders: [],

    queryfields: [],

    fiEnabled: false,
    fiTimeZone: '',
    fiPrimaryKey: '',
    fiFields: [], 
    infoFields: [], 
    fiStatusFields: [], 
    fiHealthStatus: false,

    aov1PopupFields: '',
    aov2PopupFields: '',
    aovLinePopupFields: '',
    ltgPopupFields: [],

    lineGeometries: null,
    stationGeometries: null,
    structureGeometries: null,
    startStationGeometries: null,
    startStationName : '',
    defaultLineId: '',
    defaultStationName: '',
    stationList: [],
    fltVals: null,
    ltgPoints: [],
    fiPoints: [],
    fiSCADANames: [],
    maxDiff: null,
    bookmarkParams: [],
    bookmarkFuncsWithBookmark: [],
    loader: null,

    colorWays: [],
    aovColors: [],
    aovBreakpoints: [],

    lineRender: null,
    stationRender: null,
    structureRender: null,
    switchRender: null,

    ltgSymbol: null,
    ltgEllipseSymbol: null,
    fiSymbol: null,
    aovReferenceBusSymbol: null,

    //set up map services / layers
    gsvc: null,
    ltgLayer: null,
    faultsLayer: null,
    startStationLayer: null,
    fiStatusLayer: null,
    aovLayer: null,
    switchLayer: null,
    //var bufferLayer = new GraphicsLayer();

    switchLabel: null,
    structureLabel: null,
    stationLabel: null,

    txMapLayers: null,

    aov1PopupTemplate: null,
    aov2PopupTemplate: null,
    aovLinePopupTemplate: null,
    ltgPopupTemplate: null,
    fiInfoTemplate: null,
    fiStatusTemplate: null,

    lineLayer: null,
    fiLayer: null,
    stationLayer: null,
    structureLayer: null,

    btnClearFaults: null,
    btnClearLightning: null,
    checkAutozoom: null,

    lineSelect: null,
    stationSelect: null,
    btnLocateLightningADV: null,
    btnLocateFault: null,
    btnLocateLightning: null,

    view: null,

    lastIndex: -1,

    //End Configuration Variables

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('OpenFTT::postCreate::Begin');

      this.apiKey = this.config.apiKey,
      this.gisServerName = this.config.servername;
      this.useProxy = this.config.useProxy;
      this.proxyURL = this.config.proxyURL.replace("serverIP", this.serverIP);
      this.baseURL = this.config.baseURL.replace("servername", this.gisServerName);
      this.gsvcURL = this.config.gsvcURL.replace("baseURL", this.baseURL);
      this.txdurl = this.config.txdurl.replace("serverIP", this.serverIP);
      this.locatorURL = this.config.locatorURL;
      this.fiURL = this.config.fiURL.replace("serverIP", this.serverIP);
      this.mapServerURL = this.config.mapServerURL.replace("baseURL", this.baseURL);
      this.printServiceUrl = this.config.printServiceURL;
      this.stationLayerID = this.config.stationLayerID;
      this.structureLayerID = this.config.structureLayerID;
      this.fiLayerID = this.config.fiLayerID;
      this.fiHealthCheckPt = this.config.fiHealthCheckPt;
      this.initialExtent = JSON.parse(this.config.initialExtent);
      this.maxRecordCount = this.config.maxRecordCount;
      this.aovPopuptitle = this.config.aovPopuptitle;
      this.aovLinePopuptitle = this.config.aovLinePopuptitle;
      this.ltgPopuptitle = this.config.ltgPopuptitle;
      this.fiInfotitle = this.config.fiInfotitle;
      this.txduid = this.config.txduid;
      this.txdpwd = this.config.txdpwd;
      this.txdenabled = this.config.txdenabled;
      this.integratorenabled = this.config.integratorenabled;
      this.integratorapiauthurl = this.config.integratorapiauthurl.replace("serverIP", this.serverIP);
      this.integratorbboxurl = this.config.integratorbboxurl.replace("serverIP", this.serverIP);
      this.integratorpolyurl = this.config.integratorpolyurl.replace("serverIP", this.serverIP);
      this.mapSpatialReference = parseInt(this.config.mapSpatialReference);
      this.bufferSpatialReference = parseInt(this.config.bufferSpatialReference);
      this.lightningBufferSpatialReference = parseInt(this.config.lightningBufferSpatialReference);
      this.lightningPlotSpatialReference = parseInt(this.config.lightningPlotSpatialReference);
      this.faultLocID = parseInt(this.config.faultLocID);
      this.stationLayerID = this.config.stationLayerID;
      this.lineLayerID = this.config.lineLayerID;
      this.structureLayerID = this.config.structureLayerID;
      this.switchLayerID = this.config.switchLayerID;
      this.switchKeys = this.config.switchKeys;
      this.switchEnabled = this.config.switchEnabled;
      this.useSwitchLabel = this.config.useSwitchLabel;
      this.fiLayerID = this.config.fiLayerID;
      this.maxRecordCount = parseInt(this.config.maxRecordCount);
      this.timezone = this.config.timezone;
      this.lineFields = this.config.lineFields;
      this.lineOutFields = this.lineFields.filter((f) => f.outfield).map((f) => f.name);
      this.lineKeyField = this.lineFields.filter((f) => f.key).map((f) => f.name)[0];
      this.lineSortFields = this.lineFields.filter((f) => f.orderby).map((f) => f.name);
      this.fltStructureFields = this.config.structureFields;
      this.useStructureProximity = this.config.useStructureProximity;
      this.structureProximityFt = this.config.structureProximityFt;
      this.useStructureLabel = this.config.useStructureLabel;
      this.useSpanTolerance = this.config.useSpanTolerance;
      this.spanTolerance = parseFloat(this.config.spanTolerance);

      this.structureKeyField = this.fltStructureFields.filter((f) => f.key).map((f) => f.name)[0];
      this.structureTitleField = this.fltStructureFields.filter((f) => f.isTitle).map((f) => f.name)[0];
      this.fltStructureOutFields = this.fltStructureFields.filter((f) => f.outfield).map((f) => f.name);
      this.useStationLabel = this.config.useStationLabel;
      this.stationFields = this.config.stationFields;
      this.stationTitleField = this.stationFields.filter((f) => f.isTitle).map((f) => f.name)[0];
      this.stationKeyField = this.stationFields.filter((f) => f.key).map((f) => f.name)[0];

      this.useStationFilter = this.config.useStationFilter;
      this.stationFilterField = this.config.stationFilterField;
      this.stationOutFields = this.stationFields.filter((f) => f.outfield).map((f) => f.name);

      this.structTblHeaders = this.fltStructureFields.filter((f)=> f.tblHeader).map((f) => f.tblHeader + ", " + f.name);

      this.queryfields = [this.stationTitleField, this.stationKeyField];

      this.fiEnabled = this.config.fiEnabled;
      this.fiTimeZone = this.config.fiTimeZone;
      this.fiPrimaryKey = this.config.fiPrimaryKey;
      this.fiFields = this.config.fiFields;
      this.infoFields = this.fiFields.map((f) => f);
      this.fiStatusFields = this.fiFields.map((f) => f.fieldName);
      this.fiHealthStatus = false;

      this.aov1PopupFields = this.config.aov1PopupFields;
      this.aov2PopupFields = this.config.aov2PopupFields;
      this.aovLinePopupFields = this.config.aovLinePopupFields;
      this.ltgPopupFields = this.config.ltgPopupFields;

      this.colorWays = [
        [128, 0, 38, 1],
        [252, 78, 42, 1],
        [14, 115, 73, 1],
      ];

      //Setup AOV Legend table
      // n color values corresponds to n-1 breakpoints
      this.aovColors = [
          [165,0,38,255],
          [215,48,39,255],
          [244,109,67,255],
          [253,174,97,255],
          [254,224,139,255],
          [217,239,139,255],
          [166,217,106,255],
          [102,189,99,255],
          [26,152,80,255],
          [0,104,55,255]
        ];

      this.aovBreakpoints = [
          0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9
      ];

      //create layers for lines/stations/structures/highlights/faults
      this.lineRender = {
        type: "simple",
        symbol: {
          type: "simple-line",
          color: [0, 112, 255, 1],
        },
      };

      this.stationRender=JSON.parse(this.config.stationRender);
      this.structureRender=JSON.parse(this.config.structureRender);
      this.switchRender=JSON.parse(this.config.switchRender);

      this.ltgSymbol = {
        type: "picture-marker",
        url: "resources/ltg2.png",
        width: 170,
        height: 20,
        xoffset: 75,
        angle: 0,
      };

      this.ltgEllipseSymbol = {
        type: "simple-fill",
        color: [255, 255, 255, 0],
        outline: {
          color: [0, 0, 0],
          width: 1,
        },
      };

      this.fiSymbol = {
        type: "simple",
        symbol: {
          type: "simple-marker",
          style: "circle",
          outline: { width: 2.25, color: [0, 0, 0, 1] },
          color: [0, 0, 0, 0],
          size: 8,
        },
      };

      this.aovReferenceBusSymbol = {
        type: "simple-marker",
        style: "x",
        outline: { width: 1.25, color: [255, 0, 0, 255] },
        size: 8,
      };

      this.switchLabel = JSON.parse(this.config.switchLabel);
      this.structureLabel = JSON.parse(this.config.structureLabel);
      this.stationLabel = JSON.parse(this.config.stationLabel);

      this.structurePopupTemplate = {
        title: "Structure: {" + `${this.structureTitleField}` + "}",
        outFields: ["*"],
        content: this.distanceToStation,
      };

      this.aov1PopupTemplate = {
        title: this.aovPopuptitle,
        content: this.aov1PopupFields
      };

      this.aov2PopupTemplate = {
        title: this.aovPopuptitle,
        content: this.aov2PopupFields
      };

      this.aovLinePopupTemplate = {
        title: this.aovLinePopuptitle,
        content: this.aovLinePopupFields
      };

      this.ltgPopupTemplate = {
        title: this.ltgPopuptitle,
        content: [
          {
            type: "fields",
            fieldInfos: this.ltgPopupFields,
          },
        ],
      };

      this.fiInfoTemplate = {
        title: this.fiInfotitle,
        content: [
          {
            type: "fields",
            fieldInfos: this.infoFields,
          },
        ],
      };

      console.log('OpenFTT::postCreate::End');
    },

    // onOpen: function(){
    //   console.log('OpenFTT::onOpen');
    // },

    // onClose: function(){
    //   console.log('OpenFTT::onClose');
    // },

    // onMinimize: function(){
    //   console.log('OpenFTT::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('OpenFTT::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('OpenFTT::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('OpenFTT::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('OpenFTT::onPositionChange');
    // },

    // resize: function(){
    //   console.log('OpenFTT::resize');
    // }

    //OpenFTT Code
    getWidth: function(xmin, xmax) {
      return Math.abs(Math.abs(xmax) - Math.abs(xmin));
    },

    getHeight: function(ymin, ymax) {
      return Math.abs(Math.abs(ymax) - Math.abs(ymin));
    },

    getCookie: function(cname) {
      let name = cname + "=";
      let ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },

    checkCookie: function() {
      let autozoom = (getCookie("autozoomtofault")==='true');
      document.getElementById("autozoom").checked = autozoom;
    },

    openTab: function(evt, tabName) {
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
      //resize infoDiv minHeight by tab
      getInfoDivMinHeight();
    },

    getInfoDivMinHeight: function(){
      var minHeight=71;
      var openBlock=0;
    
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i=0; i< tabcontent.length; i++){
        if(tabcontent[i].style.display== "block"){
          openBlock=1;
          switch(i){
            case 0:
            case 1:
              //faults, lightning
              minHeight=156;
              break;
            case 2:
              //AOV
              minHeight=278;
              break;
    
            case 3:
            case 6:
              //bookmarks,  help
              minHeight=71;
              break;
            case 5:
              //tools
              minHeight=71;
              if($("#printpanel")[0].style.display=='block') { 
                minHeight +=500;
              }
              break;
            case 4:
              //legend
              minHeight=223;
              break;
          }
        }
        //stop going through for loop if we've found the open block
        if(openBlock==1){
          break;
        }
      }
    
      //is the ltgresults tab open
      if($("#ltgresults")[0].style.display=='block'){
        minHeight+=300;
      }
    
      //is the fltresults tab open
      if($("#fltresults")[0].style.display=='block'){
        minHeight+=300;
      }
    
      var infoDiv = $("#infoDiv");
      infoDiv.height(minHeight);
      infoDiv.draggable().resizable({
        minHeight: minHeight,
        minWidth: infoDiv.outerWidth(),
      });
    },

    setupAOVLegend: function(colors, breakpoints) {
      var aovLegendTable = document.getElementById("aovLegend");
      const tableBody = document.createElement("tbody");
      for (let row = 0; row < colors.length; row++) {
        const currentRow = document.createElement("tr");
        const colorCell = document.createElement("td");
        const colorCircle = document.createElement("span");
        colorCircle.style.background = `rgb(${colors[row][0]}, ${colors[row][1]}, ${colors[row][2]})`;
        colorCircle.className = 'circle';
        colorCell.appendChild(colorCircle);
        colorCell.style.width = '100px';
        currentRow.appendChild(colorCell);
        const textCell = document.createElement("td");
        textCell.textContent = (`${row === 0 ? 0 : breakpoints[row - 1]} - ${row === 0 ? breakpoints[row] : (row === colors.length - 1 ) ? '1' : breakpoints[row]}`);
        currentRow.appendChild(textCell);
        tableBody.appendChild(currentRow);
      }
      aovLegendTable.appendChild(tableBody);
    },

    downloadLightning: function(){
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
    },

    //Determine color for Area of Vulnerability
    aovColorVal: function(value) {
      
      let numValue = parseFloat(value);

      //0 case
      if (0 <= numValue < this.aovBreakpoints[0]) {
        return this.aovColors[0];
      };

      //1 to (n-1)
      for(i = 0; i < this.aovBreakpoints.length; i++) {
          if (this.aovBreakpoints[i] <= numValue < this.aovBreakpoints[i + 1]) {
            return this.aovColors[i + 1];    
          };
      };

      //n case
      return this.aovColors[this.aovColors.length - 1];
    },

    aovLineSymbol: function(value) {
      var colorVal = this.aovColorVal(value);

      var symbol = {
        type: "esriSLS",
        style: "esriSLSSolid",
        color: colorVal,
        width: 2
      };

      return symbol;
    },

    aovStatusSymbol: function(value) {
      var colorVal = this.aovColorVal(value);
      
      var symbol = {
        type: "esriSMS",
        style: "esriSMSCircle",
        outline: { width: 1, color: [0, 0, 0, 255], type: "esriSLS", style:"esriSLSSolid" },
        color: colorVal,
        size: 8,
        angle: 0,
        xoffset: 0,
        yoffset: 0,
      };

      return symbol;
    },

    fiStatusSymbol: function(status) {
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
    },

    startStationSymbol: function(faultLocID) {
      var colorWayVal = colorWays[faultLocID];
      var myStartStationSymbol = {
        type: "simple-marker",
        style: "diamond",
        outline: { color: colorWayVal },
        size: 7,
        color: colorWayVal,
      };

      return myStartStationSymbol;
    },

    faultLocationSymbol: function(faultLocID) {
      var colorWayVal = colorWays[faultLocID];
      var myFaultLocationSymbol = {
        type: "simple-marker",
        style: "x",
        outline: { width: 1.25, color: colorWayVal },
        size: 12,
      };
      return myFaultLocationSymbol;
    },

    //ui components
    displayFIInfo: function(feature) {
      var div = document.createElement("div");
      var output="";
      if(fiHealthCheckPt.length > 0 ) {
        if(!fiHealthStatus){
          output += "<div><font color='red'>WARNING! FI Point Server Offline</font></div>";
        }
      } 

      output += "<table cellpadding=2><tr align=left><th>Point</th><th>Time</th><th>Value</th><th>Status</th></tr>";

      if (feature.graphic.attributes.rawdata.length > 0) {
        output += feature.graphic.attributes.rawdata.map(function (item) {
        var ct = moment
          .tz(item.Time, "YYYY-MM-DDTHH:mm:ss", fiTimeZone)
          .tz(timezone)
          .format("MM/DD/YYYY HH:mm:ss");
          let mapname = fiSCADANames.find(
            (scmap) => scmap.scadapt.includes(item.Pointname)
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
    },

    distanceToStation: function(feature) {
      var div = document.createElement("div");
      var lso = document.getElementById("lineSelect");
      var lname = lso.options[lso.selectedIndex].text;
      var output = "";
      output += "<B>Via Line: " + lname + "</B><BR />";

      //try{
          //var strPt = new Point(feature.graphic.attributes.LONGITUDE, feature.graphic.attributes.LATITUDE,{wkid: mapSpatialReference});
        var poi = new Point({
            longitude: feature.graphic.geometry.longitude,
            latitude: feature.graphic.geometry.latitude,
            spatialReference: { wkid: mapSpatialReference }
        });
        //var poi = getPoint(feature.graphic.geometry.longitude, feature.graphic.geometry.latitude);

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

    //} catch (e) { 
    //   console.log("error with line calc: " + e.toString());
      //}

      var sldistance = sldisttostation(poi);
      output += "<br /><b>Via Straight line:</b> <br />";
      output += sldistance.map(function (p) {
        return p;
      });

      output = output.replace(/,/gi, "");

      div.innerHTML = output;
      return div;
    },

    //get straight line distance, good for sanity checking may disable in final release.
    sldisttostation: function(poi) {
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
    },

    distToStation: function(vertexOfInterest) {
      var outputDist = [];
      var pointOfInterest = getPoint(vertexOfInterest.coordinate.longitude, vertexOfInterest.coordinate.latitude);
      var segLength = [];

      //for each station get distance to point
      for (var i = 0; i < stationList.length; i++) {
        var stationPoint = getPoint(stationList[i].longitude,stationList[i].latitude);

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
    },

    getSegmentLength: function(lineGeometry, pointOfInterest, startInfo, topology) {
      var totalLength = 0;

      //loop through line geometry, using topology where necessary to navigate to next line geometry

      var curPt, nextPt;

      //only look for faults within the line length
      //loop through topology, accumulating distances
      var startPt = getPoint(startInfo.startPoint[0], startInfo.startPoint[1]);

      curPt = startPt;
      for (let t in topology) {
        var pCoords = lineGeometry[topology[t]].paths[0][0];
        nextPt = getPoint(pCoords[0], pCoords[1]);

        //determine direction of segment, ignore start
        if (isReversed(curPt, nextPt)) {
          //reverse the paths within this segment.
          lineGeometry[topology[t]].paths[0].reverse();
          var pCoords = lineGeometry[topology[t]].paths[0][0];
          nextPt = getPoint(pCoords[0], pCoords[1]);
          //if other endpoint still doesn't match, then throw away this path
          if (isReversed(curPt, nextPt)) {
            return 0;
          }
        }
        var lenPaths = lineGeometry[topology[t]].paths[0].length - 1;

        for (var i = 0; i <= lenPaths; i++) {
          var pathcoords = lineGeometry[topology[t]].paths[0][i];
          nextPt = getPoint(pathcoords[0], pathcoords[1]);
          if (curPt) {
            var seg = new Polyline();
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
    },

    setLineDefinitionExpression: function(lineID) {
      lineLayer.definitionExpression = `${lineKeyField} = '${lineID}'`;
      if (!lineLayer.visible) {
        lineLayer.visible = true;
      }
      return queryForLineGeometries();
    },

    queryForLineGeometries: function() {
      var lineQuery = lineLayer.createQuery();

      return lineLayer.queryFeatures(lineQuery).then(function (response) {
        lineGeometries = response.features.map(function (feature) {
          return feature.geometry;
        });
        return lineGeometries;
      });
    },

    setFIDefinitionExpression: function(lineID) {
      if(fiEnabled){
        fiLayer.definitionExpression = `${fiPrimaryKey} = '${lineID}'`;

        if (!fiLayer.visible) {
          fiLayer.visible = true;
        }
        queryForFIStatus();
      }
    },

    setSwitchDefinitionExpression: function(lineID) {
      if(this.switchEnabled){
        this.switchLayer.definitionExpression = this.switchKeys.map((key) => `${key.name} = '${lineID}'`).join(' OR ');
        if (!this.switchLayer.visible) {
          this.switchLayer.visible = true;
        }
      }
    },

    queryForFIStatus: function() {
      if(fiEnabled){
        var fiQuery = fiLayer.createQuery();
        fiQuery.outFields = fiStatusFields;
    
        fiLayer.queryFeatures(fiQuery).then(function (response) {
          response.features.forEach(function (feature) {
            getFIStatusPointsFromAPI(feature);
          });
        });
      }
    },

    getFIStatusPointsFromAPI: function(feature) {
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
      if(fiHealthCheckPt.length>0) {
        url+= "&healthcheckpt=" + fiHealthCheckPt;
      }
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          processFIResponse(this.responseText, feature, evttime);
        }
      };

      xhttp.open("GET", url, true);
      xhttp.send();
    },

    processFIResponse: function(rsp, feature) {
      if (isValidJSON(rsp)) {
        var fiStatus = JSON.parse(rsp);
        fiHealthStatus = getFIServerHealth(fiStatus.healthdata);
        if(fiHealthStatus){
          var fiPointHealth=getFIPointHealth(fiStatus, feature);
          var symbol = fiStatusSymbol(fiStatus.didAssert);

          if(!fiPointHealth || rsp.indexOf("SCAN INHIBIT") > 0) {
              symbol = fiStatusSymbol("OFFLINE");
          }
          feature.symbol = symbol;
          feature.attributes.rawdata = fiStatus.rawdata;
          fiPoints.push(feature);
          redrawFI(feature);
    
        } else {
          alert("FI Point Server Offline");
        }
      }
    },

    getFIPointHealth: function(rsp, feature){

      var defaultStatusField = fiFields
          .filter((f) => f.isDefaultStatusFeature)
          .map((f) => f.fieldName);

      var defaultStatus=false;

      if(feature.attributes[defaultStatusField] != "N"){
          defaultStatus =true;
      }
      
      //check to see if rsp had data, if not use default value
      if(rsp.rawdata.length > 0 ) { 
          //identify the status fields from the configuration
          var statusField = fiFields
              .filter((f) => f.isStatusFeature && ! f.isDefaultStatusFeature)
              .map((f) => f.fieldName);
          // if there are no status fields, then use the default value
          if (statusField && statusField.length > 0) {
              for(var status in statusField){
                  //check for status output from FIAPI
                  if(feature.attributes[statusField[status]].includes(",")) {
                      //split multiple scada points into separate values since that is how they come back from the FIAPI
                      let scadaHealthPoints = feature.attributes[statusField[status]].split(",");
                      //loop through health points to find status
                      for(var hp in scadaHealthPoints){
                          if(rsp.rawdata.filter((pt) => pt.Pointname === scadaHealthPoints[hp])[0].Value == 0) {
                              return true;
                          }
                      }
                      return defaultStatus;
                  } else {
                      //only one status field
                      let scadaHealthPoint = feature.attributes[statusField[status]];
                      if(rsp.rawdata.filter((pt) => pt.Pointname === scadaHealthPoint)[0].Value == 0) {
                          return true;
                      } else { 
                          return defaultStatus;
                      }
                  }


              }
              
          }
      }
      return defaultStatus;
    },

    getFIServerHealth: function(rsp){
      if(fiHealthCheckPt.length > 0) {
        //find most recent health point entry
        //get evtDate
        var evtDate=moment().tz(fiTimeZone);
        var minDiff=15;
        //get health point date/time
        var curtime = moment.tz(rsp['Time'],"YYYY-MM-DDTHH:mm:ss.SSS",fiTimeZone);
        var curdiff = Math.abs(evtDate.diff(curtime,'minutes'));
        if(curdiff<minDiff) { 
            return true;
        }
        return false;
        
      } 
      return true;
    },

    redrawFI: function(feature) {
      fi = new Graphic({
        geometry: feature.geometry,
        symbol: feature.symbol,
        attributes: feature.attributes,
        popupTemplate: fiStatusTemplate,
      });
      //check to see if there are already graphics in the status layer, and if so see if they need to be replaced.
      if(fiStatusLayer.graphics.length > 0){
          console.log("to here");
          //fiStatusLayer.graphics.items[0].geometry.x;
          let eg=fiStatusLayer.graphics.items.find((i) => i.geometry.x==feature.geometry.x && i.geometry.y == feature.geometry.y)
          fiStatusLayer.remove(eg);
      } 
      fiStatusLayer.add(fi);
    },

    isValidJSON: function(input) {
      try {
        JSON.parse(input);
      } catch (e) {
        return false;
      }
      return true;
    },

    getFaultIndicators: function(lineID) {
      if (this.fiEnabled) {
        fiPoints = [];
        fiStatusLayer.removeAll();

        //put all fault indicators associated with line on the map
        setFIDefinitionExpression(lineID);
      }
    },

    getSwitches: function(lineID) {
      if (this.switchEnabled) {
        this.setSwitchDefinitionExpression(lineID);
      }
    },

    queryForStartStationGeometries: function(featureset) {
      startStationGeometries = featureset.features.map(function (feature) {
        return feature.geometry;
      });
      return startStationGeometries;
    },

    addStartStationToMap: function(stationGeometry) {
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
    },

    setCookie: function(cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    showPOI: function() {
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
    },

    stationChangeFunc: function(startStationName) {
      stationLayer.createFeatureLayer().then(function (startStationLayer) {
        var query = startStationLayer.createQuery();
        query.where = `${stationKeyField} = '${startStationName}'`;
        startStationLayer
          .queryFeatures(query)
          .then(queryForStartStationGeometries)
          .then(addStartStationToMap);
      });
    },

    stationSelectFunc: function(selectedIndex) {
      if (lastIndex != 0 && lastIndex != selectedIndex) {
        faultLocID += 1;
      }
      lastIndex = selectedIndex;
    },

    setupEventListeners: function() {
      lineSelect.addEventListener("change", function () {
        var lineID = event.target.value;
        //reset
        this.resetEnvironment(true);
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
    },

    validateLightningParms: function(showAlert = false) {
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
    },

    validateLightningParmsAdv: function() {
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
    },

    selectLine: function() {
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
    },

    compToHex: function(c) {
      var hex= c.toString(16);
      return hex.length ==1?"0" + hex:hex;
    },
   
    color2hex: function(color) {
      colors=color.replace("rgb","").replace("(","").replace(")","").replaceAll(" ","").split(",");
      return "#" + compToHex(parseInt(colors[0])) + compToHex(parseInt(colors[1])) + compToHex(parseInt(colors[2]));
    },
  
    getOutput: function() {
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
    },

    getUrlParameter: function(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
      var results = regex.exec(location.search);
      return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    zoomTo: function(dest) {
      view.goTo(
        {
          target: dest,
        },
        {
          animate: false,
        }
      );
    },

    populateEvtTime: function() {
      //evttime.value = "10/21/2020 13:58:37.603";  //debugging date
      var evttime = document.getElementById("evttime");
      evttime.value = moment.tz(this.timezone).format("MM/DD/YYYY HH:mm:ss.SSS");

      var ltgevttime = document.getElementById("ltgevttime");
      ltgevttime.value = evttime.value;

      var ltgevttimestop = document.getElementById("ltgevttimestop");
      ltgevttimestop.value = evttime.value;
    },

    populateLineDropDown: function(showLoader = false) {
      let self = this;
      this.lineLayer.definitionExpression = "1=1";
      
      var queryTask = new QueryTask(this.lineLayer.url);
      var query = new Query();
      query.orderByFields = this.lineSortFields;
      query.outFields = this.lineOutFields;
      query.returnGeometry=false;
      query.returnDistinctValues=true;

      this.lineLayer
        .queryFeatureCount()
        .then(function (numFeatures) {
          if (showLoader) {
            self.loader.show();
          }
          var numPages = Math.ceil(numFeatures / self.maxRecordCount);
          var resultPages = [];
          for (var i = 0; i < numPages; i++) {
            resultPages.push(i * self.maxRecordCount);
          }
          return Promise.all(
            resultPages.map(function (resultPageStart) {
              query.start = resultPageStart;
              query.num = self.maxRecordCount - 1;
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
        .then(self.getLineValues)
        .then(self.getUniqueValues2)
        .then(self.addToLineSelect)
        .then(self.selectLine);
    },

    getLineValues: function(features) {
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
    },

    addToLineSelect: function(values) {
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
    },

    populateStationDropDown: function(lineGeometries) {
        //buffer lineGeometries
        var distance=1000;
        if(useStationFilter){
          distance=2000;
        }
        var params = new BufferParameters({
          distances: [distance],
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

          stationGeometries = getStationValuesFromBuffer(lineBuffer)
            .then(getUniqueValues2)
            .then(addToStationSelect)
            .then(getStartStation);
        });
    },

    setStructureDefinitionExpression: function(lineID) {
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
    },

    setStructureDefByProx: function(values){
      var defExpr="";
      values.forEach(function(value) {
      if(!isNaN(value)){
        defExpr += `${structureKeyField} = ${value} OR `;
      } else {
        defExpr += `${structureKeyField} = '${value}' OR `;
      }
      
      });
      defExpr = defExpr.substring(0,defExpr.length -4);
      structureLayer.definitionExpression = defExpr;	  
      if (!structureLayer.visible) {
        structureLayer.visible = true;
      }
      return queryForStructureGeometries();
    },

    queryForStructuresByProx: function(linebuffer){
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
    },

    queryForStructureGeometries: function() {
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
    },

    getStationValuesFromBuffer: function(lineBuffer, getStationValuesFields = "*") {
      var query = stationLayer.createQuery();
      if(useStationFilter){
        //use txline id to filter station list
        var lineid = lineLayer.definitionExpression.split("=")[1].replaceAll("'","").trim()
        query.where = `${stationFilterField} like '%${lineid}%'`;
      }

      query.geometry = lineBuffer;
      query.outFields = stationOutFields;
      query.spatialRelationship = "intersects";
      return getStationValuesFromQuery(query);
    },

    getStationValuesFromQuery: function(query){
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
    },

    addToStationSelect: function(values) {
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
    },

    setStationDefinitionExpression: function(defExpr) {
      stationLayer.definitionExpression = defExpr;
      if (!stationLayer.visible) {
        stationLayer.visible = true;
      }
      return queryForStationGeometries();
    },

    queryForStationGeometries: function() {
      var stationQuery = stationLayer.createQuery();

      return stationLayer.queryFeatures(stationQuery).then(function (response) {
        stationGeometries = response.features.map(function (feature) {
          return feature.geometry;
        });
        return stationGeometries;
      });
    },

    setStationByName: function() {
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
    },

    getStartStation: function(stationGeometries) {
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
    },

    resetEnvironment: function(full) {
      //if full reset do everything
      //if not full reset just clear faults / start stations / lightning
      this.ltgLayer.clear();
      this.faultsLayer.clear();
      this.startStationLayer.clear();
      this.fiStatusLayer.clear();
      this.aovLayer.clear();

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

      //resize min infoDiv height
      getInfoDivMinHeight();

      //clear scada mapping
      this.fiSCADANames.length = 0;

      //complete reset
      if (full) {
        this.lineLayer.visible = false;
        this.stationLayer.visible = false;
        this.structureLayer.visible = false;

        this.stationLayer.definitionExpression = "1=1";
        var sg = this.queryForStationGeometries();
        this.structureLayer.definitionExpression = "1=1";
        var tg = this.queryForStructureGeometries();

        if(this.fiEnabled){
          this.fiLayer.visible = false;
          this.fiLayer.definitionExpression = "1=1";  
        }

        //reset form
        this.stationSelect.options.length = 0;
        document.getElementById("faultDistance").value = "";

        //reset globals
        this.lineGeometries = null;
        this.stationGeometries = null;
        this.structureGeometries = null;
        this.stationList.length = 0;
        this.selectedStationName = "";
      }
    },

    getUniqueValues: function(values) {
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
    },

    getUniqueValues2: function(values) {
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
    },

    validateFormParameters: function() {
      if (lineSelect.selectedIndex == 0) {
        alert("Please select a line!");
        return;
      }
      var distance = parseFloat(document.getElementById("faultDistance").value);
      buildBookMarkLink();

      if (!isNaN(distance) && isFinite(distance) && distance > 0) {
        if (lineSelect.selectedIndex == 0) {
          //output = "<font color='red'>Please Select Line</font>";
          alert("Please Select Line!");
          return;
        } else {
          if (stationSelect.selectedIndex == 0) {
            //output = "<font color='red'>Please Select Station</font>";
            alert("Please select a station");
            return;
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

        //resize info div container
        getInfoDivMinHeight();

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
        //output = "<font color='red'>Please enter a valid distance!</font>";
        alert("Please enter a valid distance!");
        return;
      }

      if (validateLightningParms(false)) {
        //if good, start lightning search
        lightningSearch();
      }
      return "";
    },

    buildBookMarkLink: function() {
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
    },

    getFaultLocations: function(distance) {
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

        //resize info div container
        getInfoDivMinHeight();

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
    },

    cleanFaultCoords: function(faultCoords) {
      for (c = faultCoords.length - 1; c >= 0; c--) {
        //if null clear it out
        if (faultCoords[c].length == 0) {
          faultCoords.splice(c, 1);
        }
      }
    },

    getSegmentEndPoints: function(lineGeometries) {
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
    },

    getNeighbors: function(lineEnds) {
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
              (isNeighbor(curStartX, curStartY, lineEnds[r].startPt[0], lineEnds[r].startPt[1])) ||
              (isNeighbor(curStartX, curStartY, lineEnds[r].endPt[0], lineEnds[r].endPt[1])) ||
              (isNeighbor(curEndX, curEndY, lineEnds[r].startPt[0], lineEnds[r].startPt[1])) ||
              (isNeighbor(curEndX, curEndY, lineEnds[r].endPt[0], lineEnds[r].endPt[1]))
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
    },

    isNeighbor: function(x,y,x1,y1){
      if(useSpanTolerance){
        var pt1 = getPoint(x,y);
        var pt2 = getPoint(x1,y1);

        if(Math.abs(pt1.latitude-pt2.latitude) <= spanTolerance && Math.abs(pt1.longitude-pt2.longitude) <= spanTolerance ) {
          return true;
        }
      } else {
        if(x==x1 && y==y1){
          return true;
        }
      }
      return false;
    },

    getStartPosition: function(startPt, lineEnds) {
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
        var lineend1=getPoint(lineEnds[ln].startPt[0], lineEnds[ln].startPt[1]);
        
        studyPointsl1.push(lineend1);
        end1pl.addPath(studyPointsl1);

        //other end
        
        var end2pl = new Polyline();
        var lineend2= getPoint(lineEnds[ln].endPt[0],lineEnds[ln].endPt[1]);
        
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
    },

    getPaths: function(neighbors, paths, path, startID) {
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
    },
 
    getPoint: function(lon,lat) {
      var pt;
      if(Math.abs(lon) <= 180 ) {
          //we're using wgs84 coords
          pt = new Point(lon, lat, 4326);
      } else {
          //we need to project
          var wgs84coords=webMercatorUtils.xyToLngLat(lon,lat);
          pt = new Point(wgs84coords[0], wgs84coords[1], 4326);
      }
      return pt;
    },

    getFaultCoords: function(lineGeometry, distance, startInfo, topology) {
      var coords = [];
      var totalLength = 0;

      //loop through line geometry, using topology where necessary to navigate to next line geometry

      var curPt, nextPt;

      //only look for faults within the line length
      //loop through topology, accumulating distances
      var startPt = getPoint(startInfo.startPoint[0],startInfo.startPoint[1]);
    

      curPt = startPt;
      for (let t in topology) {
        var pCoords = lineGeometry[topology[t]].paths[0][0];
        var nextPt=getPoint(pCoords[0], pCoords[1]);

        //determine direction of segment, ignore start
        if (isReversed(curPt, nextPt)) {
          //reverse the paths within this segment.
          lineGeometry[topology[t]].paths[0].reverse();
          var pCoords = lineGeometry[topology[t]].paths[0][0];
          nextPt = getPoint(pCoords[0], pCoords[1]);

          //if other endpoint still doesn't match, then throw away this path
          if (isReversed(curPt, nextPt)) {
            return coords;
          }
        }
        var lenPaths = lineGeometry[topology[t]].paths[0].length - 1;

        for (var i = 0; i <= lenPaths; i++) {
          var pathcoords = lineGeometry[topology[t]].paths[0][i];
          nextPt = getPoint(pathcoords[0],pathcoords[1]);
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
    },

    isReversed: function(pta, ptb) {
      var output = true;
      if(isNeighbor(pta.x,pta.y,ptb.x,ptb.y)){
        output = false;
      }

      return output;
    },

    plotFaultsOnMap: function(faultCoords) {
      var ft;
      var fltPts = [];

      for (pt in faultCoords) {
        var newpt = getPoint(faultCoords[pt][0][0], faultCoords[pt][0][1]);

        ft = new Graphic({
          geometry: newpt,
          symbol: faultLocationSymbol(faultLocID),
        });
        faultsLayer.add(ft);
        fltPts.push(newpt);
      }
      return fltPts;
    },

    plotAoVOnMap: function(csvData) {
      let zoomPoint;
      try {
        //Replace empty voltages with 1
        csvData.forEach(x => {
          if (x.Bus1Val == '')
            x.Bus1Val = 1;
          if (x.Bus2Val == '')
            x.Bus2Val = 1;
        });
        
        //Set all matching bus names to min value for that bus
        let uniqueNames1 = [...new Set(csvData.map(x => x.Bus1Name))];
        let uniqueNames2 = [...new Set(csvData.map(x => x.Bus2Name))];
        let allUniqueNames = new Set([...uniqueNames1, ...uniqueNames2]);
        
        allUniqueNames.forEach(nameToSet => {
          let minVal1 = Math.min(...csvData.filter(x => x.Bus1Name === nameToSet).map(x => x.Bus1Val));
          let minVal2 = Math.min(...csvData.filter(x => x.Bus2Name === nameToSet).map(x => x.Bus2Val));
          let realMinVal = Math.min(minVal1, minVal2);
          csvData.forEach(x => {
            if (x.Bus1Name === nameToSet) {
              x.Bus1Val = realMinVal;
            }
            if (x.Bus2Name === nameToSet) {
              x.Bus2Val = realMinVal;
            }
          });
        });

        let pointsPlotted = [];

        //Used to determine if we've already plotted a bus node
        let uniqueNameArray = Array.from(allUniqueNames);
        
        for(pt in csvData) {
          var aovAttributes = csvData[pt];

          //Plot the reference bus
          if (aovAttributes["Bus1Name"].toLowerCase().includes("reference")) {
            var referencePoint = this.getPoint(aovAttributes["Bus1X"], aovAttributes["Bus1Y"]);
            this.aovPopupTemplate.content[0].fieldInfos = this.aov1PopupFields;
            var referenceBus = new Graphic({
              geometry: referencePoint,
              attributes: this.aovAttributes,
              popupTemplate: this.aov1PopupTemplate,
            });
            this.aovLayer.add(referenceBus);
            pointsPlotted.push(referenceBus);
          }

          //Skip over rows missing coordinates
          if (isNaN(aovAttributes["Bus1X"]) || isNaN(aovAttributes["Bus1Y"]) || isNaN(aovAttributes["Bus2X"]) || isNaN(aovAttributes["Bus2Y"]))
            continue;
          
          var aovpoint1 = this.getPoint(aovAttributes["Bus1X"], aovAttributes["Bus1Y"]);
          var aovpoint2 = this.getPoint(aovAttributes["Bus2X"], aovAttributes["Bus2Y"]);
          zoomPoint = aovpoint1;
    
          //this.aovPopupTemplate.content[0].fieldInfos = this.aov1PopupFields;
          var aovSymbol1 = this.aovStatusSymbol(aovAttributes["Bus1Val"]);

          //Cache line name for plotting the line
          var lineNameCache = aovAttributes["LineName"];
          
          //Get all lines for aovSymbol1
          var lines1 = csvData.filter(lineItem => lineItem.Bus1Name === aovAttributes.Bus1Name).map(lineItem => lineItem.LineName);
          var lines2 = csvData.filter(lineItem => lineItem.Bus2Name === aovAttributes.Bus1Name).map(lineItem => lineItem.LineName);
          var lines = [...lines1, ...lines2];
          aovAttributes.LineName = lines.join('<br/>');
          var aov1 = new Graphic({
            geometry: {x: aovAttributes["Bus1X"], y: aovAttributes["Bus1Y"]},
            attributes: aovAttributes,
            symbol: aovSymbol1,
            infoTemplate: this.aov1PopupTemplate,
          });
          
          //this.aovPopupTemplate.content[0].fieldInfos = this.aov2PopupFields;
          var aovSymbol2 = this.aovStatusSymbol(aovAttributes["Bus2Val"]);

          var aov2 = new Graphic({
            geometry: {x: aovAttributes["Bus2X"], y: aovAttributes["Bus2Y"]},
            attributes: aovAttributes,
            symbol: aovSymbol2,
            infoTemplate: this.aov2PopupTemplate,
          });
          
          const polyLine = {
            paths: [[
              [aovAttributes["Bus1X"], aovAttributes["Bus1Y"]],
              [aovAttributes["Bus2X"], aovAttributes["Bus2Y"]],
            ]]
          };
    
          var aovLineAttributes = {
            "Line": lineNameCache, 
            "Value": Math.min(aovAttributes["Bus1Val"], aovAttributes["Bus2Val"])
          };
          
          var aovLineStatus = this.aovLineSymbol(aovLineAttributes.Value);
          
          var aovLine = new Graphic({
            geometry: polyLine,
            symbol: aovLineStatus,
            attributes: aovLineAttributes,
            infoTemplate: this.aovLinePopupTemplate,
          });
          
          //Look up bus node in unique name aray.  Plot if in array, then remove from array
          var uniqueNameIndex = uniqueNameArray.indexOf(aov1.attributes.Bus1Name);
          if (uniqueNameIndex > -1) {
            this.aovLayer.add(aov1);
            uniqueNameArray.splice(uniqueNameIndex, 1);
          }
          uniqueNameIndex = uniqueNameArray.indexOf(aov2.attributes.Bus2Name);
          if (uniqueNameIndex > -1) {
            this.aovLayer.add(aov2);
            uniqueNameArray.splice(uniqueNameIndex, 1);
          }
        
          this.aovLayer.add(aovLine);
        }
      } catch (error) {
        alert(error);
      } finally {
        var spReference = new SpatialReference("4326");
        this.aovLayer.spatialReference = spReference; 
        this.aovLayer.initialExtent = this.initialExtent;
        this.aovLayer.initialExtent.getWidth = this.getWidth;
        this.aovLayer.initialExtent.getHeight = this.getHeight;
        this.map.removeLayer(this.aovLayer);
        this.map.addLayer(this.aovLayer);
        this.aovLayer.show();
      }
    },

    findNearestStructures: function(faultPoints) {
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
    },

    getFltStructures: function(faultBuffer, fields = fltStructureOutFields) {
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

        //resize info div container
        getInfoDivMinHeight();

        for (var i = 0; i < fltVals.length; i++) {
          var myColor = JSON.stringify(colorWays[faultLocID]);
          myColor = myColor.replace("[", "");
          myColor = myColor.replace("]", "");
          var tbl = document
            .getElementById("resultstbl")
            .getElementsByTagName("tbody")[0];
          var row = tbl.insertRow(tbl.rows.length);
          var cells=[];
          var j;
          for(j =0; j < structTblHeaders.length; j++){
            var cell = row.insertCell(j);
            cells.push(cell);
          }
          var sta = row.insertCell(j);
          var dis = row.insertCell(++j);
          var strinfo = fltVals[i].split("|");
          cells[0].innerHTML =
            "<p style='color:rgba(" + myColor + ");'>" + strinfo[0] + "</p>";
          for(j=1; j< structTblHeaders.length; j++){
            cells[j].innerHTML = strinfo[j];
          }
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
    },

    processNextBookmark: function() {
      if (bookmarkFuncsWithBookmark.length > 0) {
        var curBookmarkFunc = bookmarkFuncsWithBookmark.shift();
        if (curBookmarkFunc) {
          curBookmarkFunc.func(curBookmarkFunc.bookmark);
        }
      } else {
        loader.hide();
      }
    },

    lightningSearch: function() {
      //get line buffer
      if (txdenabled || integratorenabled) {
        var params = new BufferParameters({
          distances: [1],
          unit: "kilometers",
          geodesic: true,
          geometries: lineGeometries,
          unionResults: true,
          bufferSpatialReference: bufferSpatialReference,
          outSpatialReference: lightningBufferSpatialReference,
          req: null,
          rsp: null,
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
            maxDiff = parseInt(document.getElementById("timewindow").value) / 1000;

            //Split on VAPI variable here
            if (integratorenabled) {
              req = makeVAPIpolyRequestBody(lineBuffer);
              rsp = authorizeVAPI("polygon",req);
            } else {
              req = makeTXDpolyrequest(lineBuffer);
              rsp = sendTXDrequest(req, "evttime");
            }

          });
      } else {
        console.log("Lightning search feature not enabled");
      }
    },

    lightningSearchAdv: function() {
      if (integratorenabled) {
        authorizeVAPI("point","");

      } else if (txdenabled) {
        maxDiff = 0;
        var req = makeTXDpointrequest();
        var rsp = sendTXDrequest(req, "ltgevttime");
      } else {
        console.log("Lightning search feature not enabled");
      }
    },

    //authorize VAPI 
    authorizeVAPI: function(apiType, reqBody){
      //get auth token
      var xhttp = new XMLHttpRequest();
      xhttp.timeout=15000;
      xhttp.ontimeout = (e) => {
        alert("Vaisala Integrator API Error: No response from authorization server");
      }
      xhttp.onreadystatechange=function() {
        if(this.readyState==4 && this.status==200) {
          //if successfully authorized, perform search
          sendVAPIRequest(this.response,apiType,reqBody);
        }
        //todo: build out responses for other statuses (400 - Bad request, 401 - Authen, 404 - NF, 500 - Server).

      };
      //send request
      xhttp.open("GET",integratorapiauthurl,true);
      xhttp.responseType='json';
      xhttp.send();
    },

    //VAPI Point Functions
    makeVAPIpointQueryString: function() {
      //get parameters
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
        .format();

      var evttimevalstop = moment.tz(
        evttimestop.value,
        "MM/DD/YYYY HH:mm:ss.SSS",
        timezone
      );
      var gmtStringstop = evttimevalstop
        .clone()
        .tz("GMT")
        .format();

      var lat = document.getElementById("ltgLat").value;
      var lon = document.getElementById("ltgLon").value;
      var dist = document.getElementById("ltgDistance").value;
      var radiusm = parseFloat(dist) * 1609.34;

      //return qs
      return `start=${gmtString}&end=${gmtStringstop}&longitude=${lon}&latitude=${lat}&radius=${radiusm}&inclEllipse=none&fields=analysis&page=0&size=2000`;
    },

    //VAPI Poly Functions
    makeVAPIpolyRequestBody: function(lineBuffers) {
      var reqJSON = {
        "geometry" : {
          "type" : "Polygon",
          "coordinates": [[]]
        }
      };
      for (i = 0; i < lineBuffers.rings[0].length; i++) {
        var coords=[];
        coords.push(parseFloat(lineBuffer.rings[0][i][0].toFixed(4)));
        coords.push(parseFloat(lineBuffer.rings[0][i][1].toFixed(4)));
        reqJSON.geometry.coordinates[0].push(coords);
      }
      return reqJSON;
    },
  
    makeVAPIpolyQueryString: function(){
      var evttime = document.getElementById("evttime");
      var timewindow =  parseInt(document.getElementById("timewindow").value)/2;


      var evttimeval = moment.tz(
        evttime.value,
        "MM/DD/YYYY HH:mm:ss.SSS",
        timezone
      );
      var evttimevalstart = evttimeval.add(-timewindow,'ms');

      var gmtString = evttimevalstart
        .clone()
        .tz("GMT")
        .format("YYYY-MM-DDTHH:mm:ss.SSS");

      var evttimevalstop = evttimeval.add(timewindow*2,'ms');

      var gmtStringstop = evttimevalstop
        .clone()
        .tz("GMT")
        .format("YYYY-MM-DDTHH:mm:ss.SSS");
      
      var qs = `start=${gmtString}Z&end=${gmtStringstop}Z&inclEllipse=none&fields=analysis&page=0&size=2000`;
      return qs;
    },

    //VAPI Helper Functions
    sendVAPIRequest: function(authresponse, apiType, reqbody) {
      var xhttp = new XMLHttpRequest();
      xhttp.timeout=15000;
      xhttp.ontimeout = (e) => {
        alert("Vaisala Integrator API Error: No response from server.");
      }
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          if(apiType=="polygon"){
            processVAPIResponse(this.response, "evttime");

          } else {
            processVAPIResponse(this.response, "ltgevttime");
          }
        }
        //todo: build out responses for other statuses (400 - Bad request,401 - Authen, 403 - Author, 404 - Not found )
      };

      var authtoken = authresponse.access_token;
      xhttp.responseType='json';

      if(apiType=="polygon") {
        var qs=makeVAPIpolyQueryString();
        var apiurl = `${integratorpolyurl}${qs}`;
        xhttp.open("POST",apiurl,true);
        xhttp.setRequestHeader("Accept", "application/geo+json");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + authtoken);
        xhttp.send(JSON.stringify(reqbody));
      } else {
        var qs=makeVAPIpointQueryString();
        var apiurl = `${integratorbboxurl}${qs}`;
        xhttp.open("GET",apiurl,true);
        xhttp.setRequestHeader("Authorization", "Bearer " + authtoken);
        xhttp.send();
      }
    },

    //processVAPI response
    processVAPIResponse: function(rsp, starttimefield){
      ltgPoints =[];
      ltgdata = rsp.features ? rsp.features : rsp;  //response should already be json object.
      //loop through events
      for(i=0;i<ltgdata.length;i++){
        var lTime = moment(ltgdata[i].properties ? ltgdata[i].properties.time : ltgdata[i].time);
        var curTime = lTime.clone().tz(timezone).format("MM/DD/YYYY HH:mm:ss.SSS");
        ltgPoints.push({
          id: i,
          lat: ltgdata[i].geometry ? ltgdata[i].geometry.coordinates[1] : ltgdata[i].location.coordinates[1],
          lon: ltgdata[i].geometry ? ltgdata[i].geometry.coordinates[0] : ltgdata[i].location.coordinates[0],
          signal: ltgdata[i].properties ? ltgdata[i].properties.signalStrengthKA : ltgdata[i].signalStrengthKA,
          time: curTime,
          smin: ltgdata[i].properties ? ltgdata[i].properties.ellSemiMinM : ltgdata[i].ellSemiMinM,
          smaj: ltgdata[i].properties ? ltgdata[i].properties.ellSemiMajM : ltgdata[i].ellSemiMajM,
          angle: degree2Radium(ltgdata[i].properties ? ltgdata[i].properties.ellAngleDeg : ltgdata[i].ellAngleDeg),
        });
      }

      //plot lightning
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
        //resize the infoDiv
        getInfoDivMinHeight();

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
    },

    //txd100 API third party url
    makeTXDpointrequest: function() {
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
    },

    makeTXDpolyrequest: function(lineBuffers) {
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
    },

    sendTXDrequest: function(xml, starttimefield) {
      var xhttp = new XMLHttpRequest();
      xhttp.timeout=15000; //15 second timeout
      xhttp.ontimeout = (e) => {
        alert("TXD Error: No response from TXD Server.");
      }   
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          processLightningResponse(this.responseText, starttimefield);
        }
      };
      if(txdenabled=="demo"){
        xhttp.open("GET", txdurl, true);
      } else {
        xhttp.open("POST", txdurl, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //xhttp.setRequestHeader("User-agent", "VaisalaTDX100Client/1.0");
      }
        xhttp.send("request=" + xml);
    },

    processLightningResponse: function(rsp, starttimefield) {
      ltgPoints = [];
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(rsp, "text/xml");
      var rspType = xmlDoc
        .getElementsByTagName("response")[0]
        .getAttribute("type");
      if (rspType == "success") {
        
        if(xmlDoc.getElementsByTagName("error-message").length > 0){
          var e = xmlDoc.getElementsByTagName("error-message")[0].childNodes[0].nodeValue;
          //ignore no data found message, handled elsewhere
          if(e!="No data found for the request."){
            if(e.length > 0 ){
              alert("TXD Error: " + e);
            }
          }
        }

      
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
          //resize the infoDiv
          getInfoDivMinHeight();

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
        alert("TXD Error: " + e);
      }
    },

    //confidence ellipse
    degree2Radium: function(deg) {
      return deg * (Math.PI / 180);
    },

    radium2Degree: function(rad) {
      return rad * (180 / Math.PI);
    },

    getPointsForEllipse: function(lat1, lon1, xaxis, yaxis, rotation) {
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
    },

    plotLightning: function(ltgPoints) {
      var ltgtresultdiv = document.getElementById("ltgresults");
      ltgtresultdiv.style.display = "block";
      var tbl = document
        .getElementById("resultstblltg")
        .getElementsByTagName("tbody")[0];

      for (pt in ltgPoints) {
        var ltgpoint = new Point(ltgPoints[pt]["lon"], ltgPoints[pt]["lat"], {
          wkid: lightningPlotSpatialReference,
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
          spatialReference: { wkid: lightningPlotSpatialReference },
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
    },

    startup: function() {
      this.inherited(arguments);
      console.log('OpenFTT::startup::Begin');
      let self = this;
  
      let timezoneLabels = document.getElementsByClassName("current-timezone");
      let curTimezoneFormat = moment().tz(this.timezone).format("z");

      for (var i = 0; i < timezoneLabels.length; i++) {
        timezoneLabels[i].innerHTML = `(${curTimezoneFormat})`;
      }
      
      this.loader = $("#loader");

      //change color for multi-endied fault location
      //var faultLocID = 0;
      
      this.setupAOVLegend(this.aovColors, this.aovBreakpoints);
      
      //set up proxyUrl
      if(this.useProxy){
        urlUtils.addProxyRule({
          urlPrefix: this.gisServerName,
          proxyUrl: this.proxyURL,
        });
      }

      //AOV File Upload
      document.getElementById("clear-aov").addEventListener("click", (event) => {
        //clear form data
        document.getElementById("uploadForm").reset();
        //clear map graphics
        this.resetEnvironment(false);
      });

      document.getElementById("uploadForm").addEventListener("change", (event) => {
        var reader = new FileReader();
        reader.onload = (event) => {
          var csvData = $.csv.toObjects(event.target.result);
          this.aovLayer.clear();
          this.plotAoVOnMap(csvData);
        }
        reader.onerror = (err) => {
          alert(JSON.stringify(err));
        }
        event.target.files.length > 0 && reader.readAsText(event.target.files[0]);
      });

      this.lineLayer = new FeatureLayer(this.mapServerURL, {
        id: this.lineLayerID,
        renderer: this.lineRender,
        visible: false,
      });
      this.map.addLayer(this.lineLayer);

      this.stationLayer = new FeatureLayer(this.mapServerURL, {
        id: this.stationLayerID,
        renderer: this.stationRender,
        visible: false,
      });
      this.map.addLayer(this.stationLayer);

      this.structureLayer = new FeatureLayer(this.mapServerURL, {
        id: this.structureLayerID,
        renderer: this.structureRender,
        visible: false,
      });
      this.map.addLayer(this.structureLayer);

      if(this.fiEnabled){
        var fiSubLayer = new FeatureLayer(this.mapServerURL, {id: this.fiLayerID, renderer: this.fiSymbol, visible: false});
        this.map.addLayer(fiSubLayer);
      }

      if(this.switchEnabled){
        this.switchLayer = new FeatureLayer(this.mapServerURL, {id: this.switchLayerID, renderer: this.switchRender, visible: false});
        this.map.addLayer(this.switchLayer);
        this.switchLayer = this.map.getLayer(this.switchLayerID);
        if(this.useSwitchLabel) {
          this.switchLayer.labelingInfo = [this.switchLabel];
        }
      }

      //set up map services / layers
      this.gsvc = new GeometryService({ url: this.gsvcURL });
      this.ltgLayer = new GraphicsLayer();
      this.map.addLayer(this.ltgLayer);
      this.faultsLayer = new GraphicsLayer();
      this.map.addLayer(this.faultsLayer);
      this.startStationLayer = new GraphicsLayer();
      this.map.addLayer(this.startStationLayer);
      this.fiStatusLayer = new GraphicsLayer();
      this.map.addLayer(this.fiStatusLayer);
      this.aovLayer = new GraphicsLayer();
      this.map.addLayer(this.aovLayer);

      this.fiStatusTemplate = {
        title: this.fiInfotitle,
        content: this.displayFIInfo,
      };

      this.lineLayer = this.map.getLayer(this.lineLayerID);
      
      if(this.fiEnabled){
        this.fiLayer = this.map.getLayer(this.fiLayerID);
        if (this.fiLayer) {this.fiLayer.popupTemplate = this.fiInfoTemplate};
      }

      this.stationLayer = this.map.getLayer(this.stationLayerID);
      if(this.useStationLabel){
        if (this.stationLayer) {this.stationLayer.labelingInfo = [this.stationLabel]};
      }

      this.structureLayer = this.map.getLayer(this.structureLayerID);
      if (this. structureLayer) { 
        this.structureLayer.popupTemplate = this.structurePopupTemplate
      };
      if (this.useStructureLabel) {
        if (this.structureLayer) { 
          this.structureLayer.labelingInfo = [this.structureLabel] 
        };
      }

      //create output table headers
      var resulttblhdr = document.getElementById("resulttblhdr");
      row = resulttblhdr.insertRow(-1);
      this.structTblHeaders.map((f)=> { 
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

      this.btnClearFaults = document.getElementById("clear-faults");
      this.btnClearFaults.addEventListener("click", function () {
        self.resetEnvironment(false);
      });

      this.btnClearLightning = document.getElementById("clear-lightning");
      this.btnClearLightning.addEventListener("click", function () {
        self.resetEnvironment(false);
      });

      this.checkAutozoom = document.getElementById("autozoom");
      this.checkAutozoom.addEventListener("click", function() {
        self.setCookie("autozoomtofault", this.checkAutozoom.checked, 365);
      });

      this.lineSelect = document.getElementById("lineSelect");
      this.stationSelect = document.getElementById("stationSelect");
      this.btnLocateLightningADV = document.getElementById("locate-adv-lightning");
      this.btnLocateFault = document.getElementById("locate-faults");
      this.btnLocateLightning = document.getElementById("locate-lightning");
 
      this.initialExtent.getWidth = this.getWidth;
      this.initialExtent.getHeight = this.getHeight;
      this.view = new Map(this.map.container, {
        map: this.map,
        extent: this.initialExtent,
        spatialReference: new SpatialReference(4326),
      });
      this.view.getWidth = this.getWidth;
      this.view.getHeight = this.getHeight;


      ready(function () {
        //if commandline is null use normal work flow, else autopopulate form with CLI value
        var srch = location.search;
        if (srch.length > 0) {
          var params = new URLSearchParams(window.location.search);

          var totalLine = params.get("totalLine");

          if (totalLine == null) {
            totalLine = 1;
          } else {
            totalLine = self.parseInt(totalLine);
          }

          var paramsToProcess = [];
          for (var i = 0; i < totalLine; i++) {
            var eventTime = self.getUrlParameter(`eventtime_${i}`);
            //select line
            var lineId = self.getUrlParameter(`lineid_${i}`);
            //select start station
            var stationName = self.getUrlParameter(`stationname_${i}`);
            //populate distance
            var distance = self.getUrlParameter(`distance_${i}`);
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
              self.populateEvtTime();
            }

            if (bookmark.lineID != "") {
              allParms += 100;
              defaultLineId = bookmark.lineID;
            } else {
              //self.populateLineDropDown();
            }

            if (bookmark.stationName != "") {
              allParms += 10;
              defaultStationName = bookmark.stationName;
            }

            if (bookmark.distance != "") {
              allParms += 1;
              var distance = self.parseFloat(bookmark.distance).toFixed(3);
              document.getElementById("faultDistance").value = distance;
            }
            return allParms;
          };

          self.populateEvtTime();

          bookmarkFuncsWithBookmark = [];
          for (var i = 1; i < paramsToProcess.length; i++) {
            var curBookmark = paramsToProcess[i];
            bookmarkFuncsWithBookmark.push({
              bookmark: curBookmark,
              func: (bookmark) => {
                setBookmarkFields(bookmark);
                self.setStationByName(bookmark.stationName);
                self.stationSelectFunc(startStationID);
                self.getStartStation(stationGeometries);
              },
            });
          }

          setBookmarkFields(paramsToProcess[0]);
          //self.populateLineDropDown(true);

          var zoomToFault = self.getUrlParameter("zoomToFault");
          if (zoomToFault.toUpperCase() == "N") {
            document.getElementById("autozoom").checked = false;
          }
          //get fault indicators
          self.getFaultIndicators(self.defaultLineId);

          //get switches
          self.getSwitches(self.defaultLineId);
        } else {
          //populate event time with default value
          self.populateEvtTime();
          self.populateLineDropDown();
        }
        self.setupEventListeners();
      });

      const copyLatLongAction = {
        title: "Copy",
        id: "copyAction",
        className: "fa fa-clipboard",
      };

      this.view.on("double-click", function (event) {
        event.stopPropagation();
        // Get the coordinates of the click on the view
        var longitude = event.mapPoint.longitude;
        var latitude = event.mapPoint.latitude;

        var lon = Math.round(longitude * 1000) / 1000;
        var lat = Math.round(latitude * 1000) / 1000;

        this.view.popup.open({
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

        this.view.popup.on("trigger-action", (event) => {
          if (event.action.id === "copyAction") {
            copyLatLong();
          }
        });
      });
  
      var locator = new Locator(this.locatorURL);
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

      this.checkCookie();

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

      this.getInfoDivMinHeight();

      $("#togglePrintView").click(function () {
        $(".esri-print").toggle();
        self.getInfoDivMinHeight();
      });

      console.log('OpenFTT::startup::Finish');
    }
    //methods to communication between widgets:
  });
  return clazz;
});
