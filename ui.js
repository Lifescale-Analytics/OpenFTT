let eventIntervalID;
var configValues;
$.getJSON('config.json', function(config) {
  configValues = config;
});

function getCookie(cname) {
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
}

function checkCookie() {
  let autozoom = (getCookie("autozoomtofault")==='true');
  eventDefault = (getCookie("eventtabdefault")==='true');
  document.getElementById("autozoom").checked = autozoom;
}

function clearEventsTable() {
  var tbodyevt = document.getElementById("tblevt");
  var newtblevt = document.createElement("tbody");
  newtblevt.setAttribute("id", "tblevt");
  tbodyevt.parentNode.replaceChild(newtblevt, tbodyevt);
}

function updateEventTimes(timespan) {
  var evtstoptime = document.getElementById("evtstoptime");
  evtstoptime.value = moment().tz(configValues.timezone).format("MM/DD/YYYY HH:mm:ss.SSS");
  
  var evtstarttime = document.getElementById("evtstarttime");
  evtstarttime.value = moment(new Date(evtstoptime.value).toISOString()).subtract(timespan, "hours").format("MM/DD/YYYY HH:mm:ss.SSS");
}

function enableAutoEventRefresh() {
  eventIntervalID = setInterval(function() {
      clearEventsTable();
      let timespan = document.getElementById("eventTimeFrame").value
      updateEventTimes(timespan);
      document.getElementById("load-events").click();  
    }, parseInt(configValues.eventsRefreshInterval) * 1000); 
}

function disableAutoEventRefresh() {
  eventIntervalID && clearInterval(eventIntervalID);
  eventIntervalID = null;
}

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

  if (tabName == "evtPanel") {
    //clear & load events
    clearEventsTable();
    document.getElementById("load-events").click();
  } else {
    //clear reload timer, remove grid data and hide div
    clearEventsTable();
    disableAutoEventRefresh();
    var evtresultsdiv = document.getElementById("evtresults");
    evtresultsdiv.style.display = "none";
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
  
}

function getInfoDivMinHeight(){
  var minHeight=71;
  var openBlock=0;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i=0; i< tabcontent.length; i++){
    if(tabcontent[i].style.display== "block"){
      openBlock=1;
      switch(i){
        case 0:
          //faults
          minHeight=176;
          break;
        case 2:
          //lightning
          minHeight=156;
          break;
        case 3:
          //AOV
          minHeight=278;
          break;
        case 1:
          //events
          minHeight=100;
          break;
        case 4:
        case 7:
          //bookmarks,  help
          minHeight=71;
          break;
        case 6:
          //tools
          minHeight=71;
          if($("#printpanel")[0].style.display=='block') { 
            minHeight +=500;
          }
          break;
        case 5:
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

  //is the evtresults tab open
  if($("#evtresults")[0].style.display=='block'){
    minHeight+=300;
  }

  var infoDiv = $("#infoDiv");
  infoDiv.height(minHeight);
  infoDiv.draggable().resizable({
    minHeight: minHeight,
    minWidth: infoDiv.outerWidth(),
  });

}

function setupAOVLegend(colors, breakpoints) {
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
