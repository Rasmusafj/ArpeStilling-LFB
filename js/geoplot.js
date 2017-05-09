(function() {
	"use strict";
}());

// global variables
var geoWidth = 700;
var geoHeight = 700;
var scale = 90000;
var projection;

//Create geoplotSvg element
var geoplotSvg = d3.select("#geoplot")
	.append("svg")
	.attr("width", geoWidth)
	.attr("height", geoHeight);

// Add a title element
geoplotSvg.append("text")
	.attr("x", 0)
	.attr("y", 50)
	.attr("fill", "black")
	.attr("font-family", "sans-serif")
	.attr("font-size", "40px")
	.text(function(){
		return "Inner London";
	});

// Load in GeoJSON data
function load_geo_data() {
	// colors used for the map
	var colors = {
		'stroke': '#59495e',
		'base': '#cccccc',
		'hover': '#e69eff',
	};

	d3.json("data/london.geojson", function(json) {
		var center = d3.geo.centroid(json);

		// initial projection object
		var projection = d3.geo.mercator()
			.scale(1)
			.translate([0,0]);

		// path, draws the map
		var path = d3.geo.path()
			.projection(projection);

		// compute a new bounding-box for the london area
		var b = path.bounds(json);
		var scale = 0.95 / Math.max((b[1][0] - b[0][0]) / geoWidth,
								(b[1][1] - b[0][1]) / geoHeight);
	    var translation = [(geoWidth - scale * (b[1][0] + b[0][0])) / 2,
						   (geoHeight - scale * (b[1][1] + b[0][1])) / 2];

		// project the new bb
		projection.scale(scale).translate(translation);

		geoplotSvg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", colors.stroke)
			.style("stroke-width", "1")
			.style("fill", colors.base)
			.on('mouseover', function(d) {
				d3.select(this).style('fill', colors.hover);
				// load new dataset for tiny bars
				var ds = d.properties.name.toLowerCase().replace(/ /g, '_');
				ds = ds + '.csv';
				updateTiny(ds);
			})
			.on('mouseout', function() {
				d3.select(this).style('fill', colors.base);
				updateTiny('none.csv');
			});

		geoplotSvg.selectAll("text")
			.data(json.features)
			.enter()
			.append("svg:text")
			.text(function(d) {
				return d.properties.name;
			})
		.attr("x", function(d){
			return path.centroid(d)[0];
		})
		.attr("y", function(d){
			return  path.centroid(d)[1];
		})
		.attr("text-anchor","middle")
		.attr('font-size','7pt');
	});
}

load_geo_data();
