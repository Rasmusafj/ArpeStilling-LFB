(function() {
	"use strict";
}());

// global variables
var multi_width = 540;
var multi_height = 540;
var multi_scale = 90000;
var projection_multi;
var color_map = d3.scale.category20();
var fire_stations_data;

//Create geoplotSvg element
var multi_svg = d3.select("#regression")
	.append("svg")
	.attr("width", multi_width)
	.attr("height", multi_height);

// Load in GeoJSON data
function load_geo_data_multi() {
	// colors used for the map
	var colors = {
		'stroke': '#59495e',
		'base': '#cccccc',
		'hover': '#e69eff',
	};

	d3.json("data/london.geojson", function(json) {
		var center = d3.geo.centroid(json);

		// initial projection object
		projection_multi = d3.geo.mercator()
			.scale(1)
			.translate([0,0]);

		// path, draws the map
		var path = d3.geo.path()
			.projection(projection_multi);

		// compute a new bounding-box for the london area
		var b = path.bounds(json);
		var scale = 0.95 / Math.max((b[1][0] - b[0][0]) / geoWidth,
								(b[1][1] - b[0][1]) / geoHeight);
	    var translation = [(geoWidth - scale * (b[1][0] + b[0][0])) / 2,
						   (geoHeight - scale * (b[1][1] + b[0][1])) / 2];

		// project the new bb
		projection_multi.scale(scale).translate(translation);


		multi_svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", colors.stroke)
			.style("stroke-width", "1")
			.style("fill", colors.base);

		// toDo: Add these last
		multi_svg.selectAll("text")
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
		load_fire_stations()

		var current_click = multi_svg.append('g');

		multi_svg.on("click", function() {
			var click_location = d3.mouse(this)
			current_click.selectAll("circle").remove();

			current_click
			.append("circle")
			.transition()
			.duration(750)
			.ease("linear")
			.attr("cx", function(d) { return click_location[0]; })
      		.attr("cy", function(d) { return click_location[1]; })
      		.attr("r", 8)
      		.style("fill", "blue");

			var ETA = find_nearest_station(projection_multi.invert(click_location));
			d3.select("#ETA").text("ETA: " + ETA.toFixed(3) + " minutes")
		});
	});
}

function find_nearest_station(coordinates){
	var best_distance = 1000
	var current_distance = 1000
	fire_stations_data.forEach(function(d){
		current_distance = distance(coordinates[1], coordinates[0], d.lat, d.lon, "K")
		if (current_distance < best_distance){
			best_distance = current_distance
		}
	});
	console.log("here")
	temp = d3.select("#temperature_select").property("value")

	return calculate_ETA(temp, best_distance)
}

function calculate_ETA(average_temp, distance){
	// Calculate the normalized temperature
	var new_temp = (average_temp - 11.885841) / (27.777778 - (-1.666667))
	var new_distance = (distance - 1.060225) / (4.093333 - (0.002817))
	var ETA = 5.69114690172 + new_temp * 0.12194037 + 4.97369134 * new_distance
	return ETA
}

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	return dist
}

// Loads the cluster data
function load_fire_stations() {
    // Load the dataset for 2003 and start visualizations
    "use strict";
    d3.csv("data/fire_stations_all.csv", function(data) {
    	fire_stations_data = data;
    	generate_fire_station_circles();
    });
}

function generate_fire_station_circles(){
	fire_stations = multi_svg.append("g");
	fire_stations.selectAll("circle")
      .data(fire_stations_data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return projection_multi([d.lon, d.lat])[0]; })
      .attr("cy", function(d) { return projection_multi([d.lon, d.lat])[1]; })
      .attr("r", 5)
      .style("fill", "red")
      .style("stroke", "#000")
      .style("stroke-width", 2);
}

load_geo_data_multi();
