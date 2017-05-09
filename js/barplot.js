(function() {
	"use strict";
}());

// define global variables, some of these are used by the tinybars script
var bpMargin = {top: 10, right: 80, bottom: 120, left: -50};
var bpWidth = 600 - bpMargin.left - bpMargin.right;
var bpHeight = 600 - bpMargin.top - bpMargin.bottom;
var yScale;
var yAxis;
var xScale0;
var xScale1;

// scale, can be 'residents' or 'dwellings'
var scaledBy = 'residents';

// init the bar object
var barPlot = d3.select("#barplot")
	.append("svg")
	.attr("width", 0)
	.attr("height", 0)
	.attr("transform", "translate(" + bpMargin.left + "," + bpMargin.top + ")");

d3.csv('data/incidents-all-boroughs.csv', function(dataset) {
	// find the keys in the data
	var keys = d3.keys(dataset[0])
		.filter(function(key) { return key !== 'Borough'; });

	// map data to the keys
	dataset.forEach(function(d) {
		d.values = keys.map(function(name) { return {name: name, value: +d[name]}; });
	});

	// define the axis scales, these are global. They are used 
	xScale0 = d3.scale.ordinal()
		.rangeRoundBands([0, bpWidth], 0.05)
		.domain(dataset.map(function(d) { return d.Borough; }));
	xScale1 = d3.scale.ordinal()
		.domain(keys).rangeRoundBands([0, xScale0.rangeBand()]);

	yScale = d3.scale.linear()
		.range([bpHeight, 0])
		.domain([0, d3.max(dataset, function(d) {
			return d3.max(d.values, function(d) { return d.value; });
		})]);

	// define bar colors
	var colors = d3.scale.ordinal()
		.range(["red", "blue", "green", "orange"]);

	// set up the axes!
	var xAxis = d3.svg.axis()
		.scale(xScale0)
		.orient("bottom");

	yAxis = d3.svg.axis()
		.scale(yScale)
		.orient('right')
		.tickFormat(d3.format(".2"));

	// append the axes to the plot
	// X axis
	barPlot.append("g")
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + bpHeight + ')')
		.call(xAxis)
		.selectAll('text')
		.style('text-anchor', 'end')
		.attr('dx', '-2mm')
		.attr('dy', '-1mm')
		.attr('transform', function() {
			return 'rotate(-65)';
		});

		// Y axis
	barPlot.append("g")
		.attr("class", "y axis")
		.call(yAxis)

	// plot the data!
	var borough = barPlot.selectAll(".g")
		.data(dataset)
		.enter()
		.append("g")
		.on('mouseover', function(d) {
		})
		.attr("class", "g")
		.attr("transform", function(d) {
			return "translate(" + xScale0(d.Borough) + ",0)";
		});

	borough.selectAll("rect")
		.data(function(d) { return d.values; } )
		.enter()
		.append("rect")
		.on('mouseover', function(d) {
			// do stuff
		})
		.attr('x', function(d) { return xScale1(d.name); })
		.attr('y', function(d) { return yScale(d.value); })
		.attr('width', xScale1.rangeBand())
		.attr('height', function(d) { return bpHeight - yScale(d.value); })
		.style('fill', function(d) { return colors(d.name); });

	var legend = barPlot.selectAll(".legend")
		.data(keys.slice().reverse())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) {
			return "translate(80," + i * 20 + ")";
		});

	legend.append("rect")
		.attr("x", bpWidth - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", colors);

	legend.append("text")
		.attr("x", bpWidth - 24)
		.attr("y", 9)
		.attr("dy", "1mm")
		.style("text-anchor", "end")
		.text(function(d) { return d; });

	initTinyBars();
});


function changeBarData(datasetString) {
	var files = {
		'residents': '../data/incidents-all-boroughs-res-scaled.csv',
		'dwellings': '../data/incidents-all-boroughs-dwell-scaled.csv',
	};

	var datafile = files[datasetString];

	d3.csv(datafile, function(dataset) {
		// set up the keys object
		var keys = d3.keys(dataset[0])
			.filter(function(key) { return key !== 'Borough'; });
		dataset.forEach(function(d) {
			d.values = keys.map(function(name) { return {name: name, value: +d[name]}; });
		});

		yScale = d3.scale.linear()
			.range([bpHeight, 0])
			.domain([0, d3.max(dataset, function(d) {
				return d3.max(d.values, function(d) { return d.value; });
			})]);

		barPlot.select(".y.axis")
			.transition()
			.call(yAxis)

		var barGroup = barPlot.selectAll(".g")
			.data(dataset);

		var barBars = barGroup.selectAll("rect")
			.data(function(d) { return d.values; })
			.transition()
			.attr('x', function(d) { return xScale1(d.name); })
			.attr('y', function(d) { return yScale(d.value); })
			.attr('width', xScale1.rangeBand())
			.attr('height', function(d) { return tbHeight - yScale(d.value); });
	});
}
