(function() {
	"use strict";
}());

// global variables
var geoWidth = 540;
var geoHeight = 540;
var scale = 90000;
var projection_fire;
var kmeans_data; // Global data variable
var color_map = d3.scale.category20();
var centroids_data;
var kmeans;
var centroids;
var current_kmeans = 0

//Create geoplotSvg element
var fire_stations_svg = d3.select("#fire_stations")
	.append("svg")
	.attr("width", geoWidth)
	.attr("height", geoHeight);

// Add a title element
fire_stations_svg.append("text")
	.attr("x", 0)
	.attr("y", 50)
	.attr("fill", "black")
	.attr("font-family", "sans-serif")
	.attr("font-size", "40px")
	.text(function(){
		return "";
	});


// Load in GeoJSON data
function load_geo_data_fire() {
	// colors used for the map
	var colors = {
		'stroke': '#59495e',
		'base': '#cccccc',
		'hover': '#e69eff',
	};

	d3.json("data/london-specific.geojson", function(json) {
		var center = d3.geo.centroid(json);

		// initial projection object
		projection_fire = d3.geo.mercator()
			.scale(1)
			.translate([0,0]);

		// path, draws the map
		var path = d3.geo.path()
			.projection(projection_fire);

		// compute a new bounding-box for the london area
		var b = path.bounds(json);
		var scale = 0.95 / Math.max((b[1][0] - b[0][0]) / geoWidth,
								(b[1][1] - b[0][1]) / geoHeight);
	    var translation = [(geoWidth - scale * (b[1][0] + b[0][0])) / 2,
						   (geoHeight - scale * (b[1][1] + b[0][1])) / 2];

		// project the new bb
		projection_fire.scale(scale).translate(translation);


		fire_stations_svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", colors.stroke)
			.style("stroke-width", "1")
			.style("fill", colors.base);

		// toDo: Add these last
		fire_stations_svg.selectAll("text")
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

		load_cluster_data()
	});
}

// Loads the cluster data
function load_cluster_data() {
    // Load the dataset for 2003 and start visualizations
    "use strict";
    d3.csv("data/kmeans/classifications.csv", function(data1) {
      kmeans_data = data1;
      d3.json("data/kmeans/centroids.json", function(data2) {
        centroids_data = data2;
        generate_circles();
      });
    });
}

// Init circles in plot
function generate_circles() {
  // We group into two categories
  kmeans = fire_stations_svg.append("g");
  centroids = fire_stations_svg.append("g");

  // Regular data points
  kmeans.selectAll("circle")
      .data(kmeans_data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return projection_fire([d.lon, d.lat])[0]; })
      .attr("cy", function(d) { return projection_fire([d.lon, d.lat])[1]; })
      .attr("r", 3)
      .attr("opacity", 0.6)
      .style("fill", function(d) { return color_map(parseInt(d.k12)); });

  // Centroids
  centroids.selectAll("circle")
      .data(centroids_data["k12"])
      .enter()
      .append("circle")
      .attr("cx", function(d) { return projection_fire([d.lon, d.lat])[0]; })
      .attr("cy", function(d) { return projection_fire([d.lon, d.lat])[1]; })
      .attr("r", 10)
      .style("stroke", "#000")
      .style("stroke-width", 2)
      .style("fill", function(d) {return color_map(parseInt(d.class)); });
};

function updatePlot(le_number) {
  switch(le_number) {
    case 0:
      // Update dots/circles
      kmeans.selectAll("circle")
      .data(kmeans_data)
      .style("fill", function(d) { return color_map(parseInt(d.k12)); });

      redraw_centroids(centroids_data["k12"]);

      break;
    case 1:
      // Update dots/circles
      kmeans.selectAll("circle")
      .data(kmeans_data)
      .data(kmeans_data)
      .style("fill", function(d) { return color_map(parseInt(d.fire_station)); });

      redraw_centroids(centroids_data["fire_station"]);
      
      break;
    default:
   	}
}


function redraw_centroids(my_data){
  var items = centroids.selectAll("circle").data(my_data)
  items.enter().append('circle');

  // If add more kmeans
  items.exit().remove();

  items
      .transition()
      .duration(500)
      .each("start", function() {  // Start animation
       		d3.select(this)  // 'this' means the current element
            .style("fill", "magenta")  // Change color
            .attr("r", 12);})
      .attr("cx", function(d) { return projection_fire([d.lon, d.lat])[0]; })
      .attr("cy", function(d) { return projection_fire([d.lon, d.lat])[1]; }) 
      .each("end", function() {  // End animation
			d3.select(this)  // 'this' means the current element
			.transition()
			.duration(500)
			.style("fill", function(d) {return color_map(parseInt(d.class));}) // Change color
			.attr("r", 10);  // Change radius
	   });
}
// Preview when hovering and add the active effect for the buttons click
// Uses jquery syntax, where we call our d3 functions instead of the d3 syntax
$("#kmeans12").on({
    mouseenter: function () {
    	if (current_kmeans != 0) {
        	updatePlot(0);
    	}
    },
    mouseleave: function () {
        if (current_kmeans != 0) {
        	updatePlot(current_kmeans);
    	}
    },
    click: function () {
        $("#original").removeClass('active');
        $("#kmeans12").addClass('active');
        current_kmeans = 0
    }
});
$("#original").on({
    mouseenter: function () {
        if (current_kmeans != 1) {
        	updatePlot(1);
    	}
    },
    mouseleave: function () {
    	if (current_kmeans != 1) {
        	updatePlot(current_kmeans);
    	}
    },
    click: function () {
        $("#kmeans12").removeClass('active');
        $("#original").addClass('active');
        current_kmeans = 1
    }
    
});

load_geo_data_fire();

