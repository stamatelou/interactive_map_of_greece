/**
 * SVG structure:
 *   <svg> - container for entire map
 *     <g> - handle zoom and drag position
 *       <rect> - overlay a transparent layer for smooth zoom and drag
 *       <g> of <path> - each `path` is a district in the map
 *       <g> of <text> - districts' name
 *     </g>
 *   </svg>
 *
 * Reference:
 *   https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78
 *   http://www.ourd3js.com/wordpress/296/
 *   https://bl.ocks.org/mbostock/4e3925cdc804db257a86fdef3a032a45
 *   https://stackoverflow.com/questions/35443768/how-do-i-fix-zooming-and-panning-in-my-cluster-bundle-graph
 *   https://groups.google.com/forum/#!topic/d3-js/OAJgdKtn1TE
 *   https://groups.google.com/forum/#!topic/d3-js/sg4pnuzWZUU
 */

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [1, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#C0C0C0"

// --------------- Event handler ---------------
const zoom = d3
  .zoom()
  .scaleExtent(ZOOM_THRESHOLD)
  .on("zoom", zoomHandler);

function zoomHandler() {
  g.attr("transform", d3.event.transform);
}

function mouseOverHandler(d, i) {
  d3.select(this).style('fill', HOVER_COLOR);
  d3.select('#tooltip').transition().duration(200).style('opacity', 1)
  d3.select('#tooltip').style("text-align", "left")
  .html("<p><h3>"+(d.properties.name)+"</h3>"+
  "<h4>επιβεβαιωμένα: " + (d.properties.lastvalue_confirmed)+"</h4>"+
  "<h4>τελευταίες 10 μέρες: "+(d.properties.progress)+"</h4></p>"+ 
  "<h4>θάνατοι: "+(d.properties.lastvalue_deaths)+"</h4>"+
  "<h4>τελευταίες 10 μέρες: "+(d.properties.progress_deaths)+"</h4>")
}

/* function mouseOutHandler(d, i, value) {
  console.log(d, i, value)
  d3.select(this).style("fill", color(Math.log(d.properties.progress+1)))
  d3.select('#tooltip').style('opacity', 0)
} */

function mouseMoveHandler(d, i) {
  return tooltip
  .style("top", (d3.event.pageY - 24) + "px")
  .style("left", (d3.event.pageX - 48) + "px");
}

function clickHandler(d, i) {
  d3.select("#map__text").text(`Επιλέξατε ${d.properties.name}`)
}

function clickToZoom(zoomStep) {
  svg
    .transition()
    .duration(ZOOM_DURATION)
    .call(zoom.scaleBy, zoomStep);
}

d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP));
d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP));

//  --------------- Step 1 ---------------
// Prepare SVG container for placing the map,
// and overlay a transparent rectangle for pan and zoom.
const svg = d3
  .select("#map__container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

const g = svg.call(zoom).append("g");

g
  .append("rect")
  .attr("width", WIDTH * OVERLAY_MULTIPLIER)
  .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
  .attr(
    "transform",
    `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
  )
  .style("fill", "none")
  .style("pointer-events", "all");

// --------------- Step 2 ---------------
// Project GeoJSON from 3D to 2D plane, and set
// projection config.
const projection = d3
  .geoMercator() 
  .center([25.5095, 37.5742])
  .scale(3500)
  .translate([WIDTH / 2, HEIGHT / 2]);

// --------------- Step 3 ---------------
// Prepare SVG path and color, import the
// effect from above projection.
const path = d3.geoPath().projection(projection);

var color = d3.scaleQuantize()
 .range(["#1aa260","#ffce44", "	#FF9900", "#de5246"]);

 // --------------- Step 4 ---------------
// 1. Plot the map from data source `greece`
// 2. Place the district name in the map
var tooltip = d3.select('#map__container')
.append('div')
.attr('id', 'tooltip')
.attr('style', 'opacity: 0;');

d3.csv("greece_cases.csv",function(data) {
  console.log(data[0]);
})
function dispatchButton(source) {
  console.log(source)
d3.csv("preprocessed_cases.csv", function(data) {
 
  // calculate and return the smallest and largest data values
  // so the scale's domain is dynamically calculated 
 
  if (source == 'progress_confirmed') {
  color.domain([
    d3.min(data, function(d, i) { console.log(i)
    return Math.log(Number(d['progress_ten_days_confirmed'])+Number(1)); }),
    d3.max(data, function(d) { return Math.log(Number(d['progress_ten_days_confirmed'])+Number(1)); })
    ])}
  else if (source == 'confirmed') {
    color.domain([
      d3.min(data, function(d) { return Math.log(Number(d['latest_value_confirmed'])+Number(1)); }),
      d3.max(data, function(d) { return Math.log(Number(d['latest_value_confirmed'])+Number(1)); }),
      ])}
  else if (source == 'deaths') {
    color.domain([
      d3.min(data, function(d) { return Math.log(Number(d['latest_value_deaths'])+Number(1)); }),
      d3.max(data, function(d) { return Math.log(Number(d['latest_value_deaths'])+Number(1)); }),
      ])};

    d3.json("greece.json", function(json) {
      //Merge the ag. data and GeoJSON
      //Loop through once for each ag. data value
      for (var i = 0; i < data.length; i++) {
        //Grab state name
        var dataState = data[i].county;
        //Grab data value, and convert from string to float
        var progressValue_confirmed = parseFloat(data[i]['progress_ten_days_confirmed']);
        var lastValue_confirmed = parseFloat(data[i]['latest_value_confirmed']);
        var progressValue_deaths = parseFloat(data[i]['progress_ten_days_deaths']);
        var lastValue_deaths = parseFloat(data[i]['latest_value_deaths']);

        //Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name_greek;
          if (dataState == jsonState) {
            //Copy the data value into the JSON
            json.features[j].properties.progress = progressValue_confirmed;
            json.features[j].properties.lastvalue_confirmed = lastValue_confirmed;
            json.features[j].properties.progress_deaths = progressValue_deaths;
            json.features[j].properties.lastvalue_deaths = lastValue_deaths;
            //console.log(dataState,lastValue_deaths, Math.log(lastValue_deaths+1))
            //Stop looking through the JSON
            break;
      }}} 
     g.append("g")
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", function(d) { 
        if (source == 'progress_confirmed') {
        var value =  color(Math.log(d.properties.progress+1))
        } else if (source == 'deaths')  {
          var value =  color(Math.log(d.properties.lastvalue_deaths+1))}
          else if (source == 'confirmed') {
            var value =  color(Math.log(d.properties.lastvalue_confirmed+1))}
        return value}
       )
      .attr("stroke", "#FFF")
      .attr("stroke-width", 1.5)
      .on("mouseover", mouseOverHandler)
      .on("mouseout", function mouseOutHandler(d) {
      if (source == 'progress_confirmed') {
          var value =  color(Math.log(d.properties.progress+1))
      } else if (source == 'deaths')  {
          var value =  color(Math.log(d.properties.lastvalue_deaths+1))}
      else if (source == 'confirmed') {
           var value =  color(Math.log(d.properties.lastvalue_confirmed+1))}
      d3.select(this).style("fill", value)
      d3.select('#tooltip').style('opacity', 0)
      })
      .on("mousemove", mouseMoveHandler)
      .on("click", clickHandler);
    });
  });
}
//const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));
//renderMap(greece);

//function renderMap(root) {
/* d3.json("greece.json", function(root) {
  // Draw districts and register event listeners
  g
    .append("g")
    .selectAll("path")
    .data(root.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "#FFF")
    .attr("stroke-width", 0.5)
    .on("mouseover", mouseOverHandler)
    .on("mouseout", mouseOutHandler)
    .on("mousemove", mouseMoveHandler)
    .on("click", clickHandler);
}) */


