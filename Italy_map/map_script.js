//set width and height of svg shape
var width = 500,
    height = 600;

var margin = { top: -5, right: -5, bottom: -5, left: -5 }

var sumDelPop=0; //var for the sum of crimes divided population
var sumDel=0 //var for the sum of crimes
var colorProv = null; //province colour scale
var colorReg = null; //province colour scale
var numbers = []; //for set of numbers of delicts of each territory
var list_crimes = []; //list of all crimes retrieved from dataset (in 'manageCrimesSelection.js' file)
var count = 0; //count number of swapping among maps 
var population=0;





//create leaflet container
var leafletCont= d3.select('#content').append('div').attr('class', 'leaflet-control-container')
                                      .append('div').attr('class','leaflet-top leaflet-left')
                                      .append('div').attr('id','slide').attr('class','leaflet-control-zoom leaflet-bar leaflet-control leaflet-zoom-anim')


//zoom 
let container = d3.selectAll("svg g");

var zoom = d3.zoom()
                .scaleExtent([1, 10])
                .on("zoom", zoomed);

var drag = d3.drag()
                .subject(function (d) { return d; })
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);

var slider = d3.select("#slide").append("p").append("input")
                .datum({})
                .attr("type", "range")
                .attr("value", zoom.scaleExtent()[0])
                .attr("min", zoom.scaleExtent()[0])
                .attr("max", zoom.scaleExtent()[1])
                .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
                .on("input", slided);

var svg = d3.selectAll("svg")
            .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
            .call(zoom);

function zoomed() {
      const currentTransform = d3.event.transform;
      container.attr("transform", currentTransform);
      slider.property("value", currentTransform.k);
}
function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
}
function dragged(d) {
      d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}
function dragended(d) {
      d3.select(this).classed("dragging", false);
}
function slided(d) {
      zoom.scaleTo(d3.selectAll("svg"), d3.select(this).property("value"));
}

//tooltip defined for show name of region when arrive the mouse
var tooltip = d3.select("#content")
     .append("div")
     .attr("class", "tooltip hidden")
     .attr("id","tooltip");
 
var selectAllProv = d3.select('.leaflet-top')
                    //.append('div').attr('class','leaflet-control-container')
                    //.append('div').attr('class','leaflet-up leaflet-left')
                    .append('div').attr('id','checkAll').attr('class', 'leaflet-bar leaflet-control')
                    .text('Select All ')
                    .append('input')
                    .attr('type','checkbox').attr( 'id','selectAll')
                  
//manage events of selectAllProv
d3.select("#selectAll").on("change", selectAllTer); //select or unselect all reg/prov
//---------------------------------------------------------------
//---------------------------------------------------------------


//MENU VARIABLES
var visualization = '0'; //variable that contain the visualization type of the moment: =0 =>vis. for provinces; =1 => vis. for regions 
var computationType=0; //variable that contain the computationType of the moment: =0 =>number of crimes; =1 => num.crimes/population 
var selectedYears=["2012","2013","2014","2015","2016","2017","2018","2019"]; //variable tha contain the years selected (start with all years selected))
var selected_crimes = []; //variable that contain crimes selected

//MENU CODE

//compute for number of crimes or num.crimes/population 
d3.select('#computationCrimes')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));//0 if choose only number of crimes or 1 if choose num_crimes/pop
    loadComputationMap(newData);
    //loadComputationParallelCoordinates(newData); (valerio [menu])
});
computeColourScales();//compute colour scales considering only num crimes
//compute parCoord(); //(valerio [start function]) compute par. coord. considering only num crimes

//visualize for region or province map
d3.select('#visualization')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));//0 if choose to vis. for province or 1 if choose to vis for regions
    visualization=newData; //variable that mantain value 0 or 1 (default setted to 0 => visualize for provinces)
    loadMap(newData);
    //loadParallelCoordinates(newData); (valerio [menu]) (must load par. coord. with prov or reg)
});
loadMap("0");//Province map
//loadParallelCoordinates(newData); (valerio [start function])

//Years (valerio=>function to implement is on 'updateSelectedYears' function)
d3.selectAll(".yearCheckbox").on("change",updateSelectedYears); //update list of selected years ('selectedYears') + map

d3.selectAll(".yearCheckbox").property('checked',true);//start with all years selected
    
//manage years checkboxes
var expanded = false;
function showCheckboxes() {
  var checkboxes = d3.select("#yearCheckboxes");
  if (!expanded) {
    checkboxes.node().style.display = "block";
    expanded = true;
  } else {
    checkboxes.node().style.display = "none";
    expanded = false;
  }
}