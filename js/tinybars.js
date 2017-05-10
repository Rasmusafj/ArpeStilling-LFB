(function() {
	"use strict";
}());

// define global variables
var tbMargin = {top: 10, right: 0, bottom: 20, left: 25};
var tbWidth = 200 - tbMargin.left - tbMargin.right;
var tbHeight = 600 - tbMargin.top - tbMargin.bottom;
var tbXScale0;
var tbXScale1;

// init the bar object
var tinyBars = d3.select("#tinybar")
	.append("svg")
	.attr("width", tbWidth + tbMargin.left + tbMargin.right)
	.attr("height", tbHeight + tbMargin.top + tbMargin.bottom)
	.attr("transform", "translate(" + tbMargin.left + "," + tbMargin.top + ")");

tinyBars.append("text")
	.attr("class", 'tinybars-title')
	.attr("x", 0)
	.attr("y", tbHeight+tbMargin.bottom-60)
	.attr("fill", "black")
	.attr("font-family", "sans-serif")
	.attr("font-size", "20px")
	.text(function(){
		return "";
	});

function initTinyBars() {
	d3.csv('data/none.csv', function(dataset) {
		// loads the empty dataset by default
		// find the keys in the data
		var keys = d3.keys(dataset[0])
			.filter(function(key) { return key !== 'Borough'; });

		// map data to the keys
		dataset.forEach(function(d) {
			d.values = keys.map(function(name) {
				return {name: name, value: +d[name]};
			});
		});

		// tiny bars needs its own xScales
		tbXScale0 = d3.scale.ordinal()
			.rangeRoundBands([0, tbWidth], 0.05)
			.domain(dataset.map(function(d) { return d.Borough; }));
		tbXScale1 = d3.scale.ordinal()
			.domain(keys).rangeRoundBands([0, tbXScale0.rangeBand()]);

		// define bar colors
		var colors = d3.scale.ordinal()
			.range(["#5495ff", "#ff5492", "#ffa354", "#65ff54"]);

		// set up the axes!
		var xAxis = d3.svg.axis()
			.scale(tbXScale0)
			.orient("bottom")
			.tickValues([]);
//		var yAxis = d3.svg.axis()
//			.scale(yScale)
//			.orient('left')
//			.tickFormat(d3.format(".2"));

		// append the axes to the plot
		tinyBars.append("g")
			.attr('class', 'x axis')
			.attr('transform', 'translate('+[tbMargin.left, tbHeight] + ')')
			.call(xAxis)

		tinyBars.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate("+[tbMargin.left, 0]+")")
			.call(yAxis)
			.append("text")
			.attr('transform', 'rotate(-90)')
			.attr('y', 7)
			.attr('dy', '1mm')
			.style('text-anchor', 'end')
			.text('Fraction of incidents');

		// add the groups to the plot
		var borough = tinyBars.selectAll(".borough")
			.data(dataset)
			.enter()
			.append("g")
			.attr("class", "borough")
			.attr("transform", "translate("+[tbMargin.left+5, 0]+")")
//			.attr("transform", function(d) {
//				return "translate(" + tbXScale0(d.Borough) + ",0)";
//			});

		// add the bars for the group
		var bars = borough.selectAll("rect")
			.data(function(d) { return d.values; } )
			.enter()
			.append("rect")
			.attr('x', function(d) { return tbXScale1(d.name); })
			.attr('y', function(d) { return yScale(d.value); })
			.attr('width', tbXScale1.rangeBand())
			.attr('height', function(d) { return tbHeight - yScale(d.value); })
			.style('fill', function(d) { return colors(d.name); });

		var legend = tinyBars.selectAll(".legend")
			.data(keys.slice().reverse())
			.enter()
			.append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) {
				return "translate(0," + i * 20 + ")";
			});

		legend.append("rect")
			.attr("x", tbWidth - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", colors);

		legend.append("text")
			.attr("x", tbWidth - 24)
			.attr("y", 9)
			.attr("dy", "1mm")
			.style("text-anchor", "end")
			.text(function(d) { return d; });
	});
}

function updateTiny(data) {
	d3.csv('data/' + data, function(dataset) {
		// set up the keys object
		var keys = d3.keys(dataset[0])
			.filter(function(key) { return key !== 'Borough'; });
		dataset.forEach(function(d) {
			d.values = keys.map(function(name) { return {name: name, value: +d[name]}; });
		});

		var lol = tinyBars.select('.tinybars-title')
			.text("")

	  // plot the data!
		var group = tinyBars.selectAll(".borough")
			.data(dataset)

		var bars = group.selectAll("rect")
			.data(function(d) { return d.values; })
			.transition()
			.duration(200)
			.ease('linear')
			.attr('x', function(d) { return tbXScale1(d.name); })
			.attr('y', function(d) { return yScale(d.value); })
			.attr('width', tbXScale1.rangeBand())
			.attr('height', function(d) { return tbHeight - yScale(d.value); })
		})
}
