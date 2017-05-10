(function() {
	"use strict";
}());

var	margin_lol = {top: 10, right: 10, bottom: 10, left: 25};
var width_lol = 500 - margin_lol.left - margin_lol.right;
var height_lol = 400 - margin_lol.top - margin_lol.bottom;

var PLOT = d3.select("#temp_plot")
.append("svg")
.attr("width", width_lol + margin_lol.left + margin_lol.right)
.attr("height", height_lol + margin_lol.top + margin_lol.bottom);

var	xTScale = d3.time.scale().range([0, width_lol]);
var	yTScale = d3.scale.linear().range([height_lol, 0]);

var	xAxis = d3.svg.axis().scale(xTScale)
	.orient("bottom").ticks(5);

var	yAxis = d3.svg.axis()
	.scale(yTScale)
	.orient("left")
	.ticks(5);

var	vLine = d3.svg.line()
	.x(function(d) { return xTScale(d.Date); })
	.y(function(d) { return yTScale(d.Count); });

	d3.csv('./data/scaled_counts.csv', function(dataset) {
		dataset.forEach(function(d) {
			d.Date = d3.time.format("(%Y, %m)").parse(d.Date);
			d.Count = +d.Count;
		});

		xTScale.domain(d3.extent(dataset, function(d) { return d.Date; }));
		yTScale.domain([0, d3.max(dataset, function(d) { return d.Count; })]);

		PLOT.append("path")
			.attr("class", "line")
			.attr("transform", "translate("+[margin_lol.left,0]+")")
			.attr("stroke", "magenta")
			.attr("d", vLine(dataset));

		// Add the X Axis
		PLOT.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate("+[margin_lol.left, height_lol]+")")
			.call(xAxis);

		// Add the Y Axis
		PLOT.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate("+[margin_lol.left,0]+")")
			.call(yAxis);


		var legend = PLOT.selectAll('.legend')
			.data("#")
			.enter()
			.append('g')
			.attr('class', 'legend')
			.attr('fill', 'black')
			.attr('transform', function() { return 'translate('+[width_lol-60, 0]+')'; });
		legend.append('rect')
			.attr('width', 20)
			.attr('height', 20)
			.style('fill', "magenta");

		legend.append('text')
			.attr("x", 0)
			.attr("y", 10)
			.attr("dy", "1mm")
			.style("text-anchor", "end")
			.text("# incidents");
	});

	d3.csv('./data/scaled_temps.csv', function(dataset) {
		dataset.forEach(function(d) {
			d.Date = d3.time.format("(%Y, %m)").parse(d.Date);
			d.Count = +d.Count;
		});

		PLOT.append("path")
			.attr("class", "line")
			.attr("transform", "translate("+[margin_lol.left,0]+")")
			.attr("stroke", "teal")
			.attr("d", vLine(dataset));
	
		var legend = PLOT.selectAll(".legend")
				.append('rect')
			.attr('width', 20)
			.attr('height', 20)
			.attr('transform', 'translate(0,30)')
			.style('fill', "teal")

		PLOT.selectAll(".legend").append('text')
			.attr("x", 0)
			.attr("y", 40)
			.attr("dy", "0")
			.style("text-anchor", "end")
			.text("avg. temp.");
	});
