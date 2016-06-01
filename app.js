//Responsiveness TODO:
////Replace chart with table of values when too small
////Check for whatever can be moved to stylesheet
function makeChart(data) {
    var bars, line, height, width,
        yScale = d3.scale.linear().domain(d3.extent(data.productivity)),
        xScale = d3.scale.ordinal().domain(data.years),
        animationDurationMax = 2000,
        barAnimationDuration = (animationDurationMax) / data.wages.length;
    var chart = document.getElementById('chart');
    var margin = { top: 50, right: 10, bottom: 70, left: 80 },
        container = d3.select('#chart'),
        barPadding = 1;
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(0);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");
    var barTooltip = d3.select('body').append("div")
        .classed('barTooltip', true)
        .style('opacity', 0);
    var circleTooltip = d3.select('body').append("div")
        .classed('circleToolTip', true)
        .style('opacity', 0);
    var lineColor = "orange"

    function prepareChart() {
        chart.innerHTML = '';

        var windowWidth = window.innerWidth,
            chartWidth = windowWidth * 0.9
        windowPadding = (windowWidth * 0.2) / 2,
            aspectRatio = 1.6;
        width = (chartWidth) - margin.left - margin.right;
        height = (width / aspectRatio) - margin.top - margin.bottom;

        var lineGraphGen = d3.svg.line()
            .x(function(d, i) {
                return xScale(data.years[i]);
            })
            .y(function(d) {
                return yScale(d);
            })
            .interpolate('linear');

        var svg = container.append('svg').style('background', '#eee')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(0,' + margin.top + ')');

        var tickModifier;

        if (width > 800) {
            tickModifier = 2;
        } else if (width > 500) {
            tickModifier = 3;
        } else if (width > 300) {
            tickModifier = 6;
        } else {
            tickModifier = 10;
        }

        xAxis.tickValues(xScale.domain().filter(function(x) {
            return !(+x % tickModifier) }));
        yAxis.ticks(height / 50)

        xScale.rangeBands([margin.left, width]);
        yScale.range([height, margin.top]);
        //add axes
        var axes = svg.selectAll('.axis')
            .data([{
                axis: xAxis,
                x: 0,
                y: yScale(0),
                class: 'x'
            }, {
                axis: yAxis,
                x: xScale.range()[0],
                y: 0,
                class: 'y'
            }]);
        axes.enter().append('g')
            .attr({
                'class': function(d) {
                    return 'axis ' + d.class;
                },
                'transform': function(d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                }
            });
        axes.each(function(axisObj) {
            d3.select(this).call(axisObj.axis);
        });
        axes.selectAll('.x.axis text')
            .style('text-anchor', 'end')
            .attr({
                'dy': '-0.005em',
                'dx': '-0.8em',
                'transform': 'rotate(-65)'
            });

        svg.append("text")
            .attr({
                'text-anchor': 'middle',
                'transform': 'translate(' + margin.left / 2 + ',' + height / 2 + ')rotate(-90)',
                'dy': '-0.8em'
            })
            .text("Percent change since 1947");

        svg.append("text")
            .attr({
                'text-anchor': 'middle',
                'transform': 'translate(' + (width / 2) + ',' + (height + margin.bottom / 2) + ')',
                'dy': '1.5em'
            })
            .text("Year")

        //wages to histogram
        bars = svg.append('g').selectAll('rect')
            .data(data.wages)
            .enter()
            .append('rect')
            .attr({
                width: xScale.rangeBand() - barPadding,
                x: function(d, i) {
                    return xScale(data.years[i]);
                },
                height: function(d) {
                    return 0;
                },
                y: function(d) {
                    return height;
                },
                'data-legend': 'Worker wages'
            })
            .style({
                "fill": "blue"
            });
        //need to draw svg before adding event handler because svg is shit
        //productivity to line graph
        line = svg.append("path")
            .datum(data.productivity)
            .attr({
                'stroke': lineColor,
                'fill': 'none',
                'class': 'line',
                'stroke-width': '8',
                'd': lineGraphGen,
                'data-legend': 'Worker productivity'
            });
        //draw this on top of line graph on barTooltip

        var circle = svg.append("circle")
            .attr("class", "lineGraphCircle")
            .style("fill", "red")
            .style("stroke", "red")
            .attr("r", 8);

        bars.on('mouseover', function(d, i) {
                var currentYear = data.years[i],
                    currentProdData = data.productivity[i],
                    avgProdData = (currentProdData + data.productivity[i + 1]) / 2;
                barTooltip.style('opacity', 0.9);
                barTooltip.html(d + '%')
                    .style({
                        'left': (d3.event.pageX) + 'px',
                        'top': d3.event.pageY + 'px'
                    });
                circleTooltip.style('opacity', 0.9);
                circleTooltip.html(currentProdData + '%')
                    .style({
                        'left': (xScale(currentYear) - 90) + 'px',
                        'top': (yScale(currentProdData) - 30) + 'px'
                    })
                circle.style('display', 'initial')
                circle
                    .attr({
                        'cx': xScale(currentYear) + (xScale.rangeBand() / 2),
                        'cy': yScale(avgProdData)
                    })

                // circleInfo
                //     .attr({
                //         'dx': xScale(currentYear) - 90,
                //         'dy': yScale(currentProdData) - 30
                //     }).append('text')
                //     .style("fill", "white")
                //     .style("stroke-width", "1")
                //     .style("opacity", 0.8)
                //     .text(currentProdData + '%')
                //     .attr({
                //         'font-size': '1.8em'
                //     });
            })
            .on('mouseout', function(d) {
                barTooltip
                    .style('opacity', 0);
                circleTooltip
                    .style('opacity', 0);
                circle.style('display', 'none');
            });


        //call the legend
        svg.append('g')
            .classed('legend', true)
            .call(legend)
            .attr({
                'transform': 'translate(' + margin.left + ',0)',
                'stroke': 'black',
                'data-style-padding': 2
            });

    } //prepareChart

    function animateChart() {
        prepareChart();
        bars.transition()
            .attr({
                "height": function(d) {
                    return height - yScale(d);
                },
                "y": function(d) {
                    return yScale(d);
                }
            })
            .duration(barAnimationDuration)
            .delay(function(d, i) {
                return i * barAnimationDuration;
            });

        var totalLength = line.node().getTotalLength();

        line
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(animationDurationMax)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

    }

    function resizeChart() {
        prepareChart();
        bars.attr({
            "height": function(d) {
                return height - yScale(d);
            },
            "y": function(d) {
                return yScale(d);
            }
        });
    }

    var publicAPI = {
        animateChart: animateChart,
        resizeChart: resizeChart
    };

    return publicAPI;
}

function legend(g) {
    g.each(function() {
        var g = d3.select(this),
            items = {},
            svg = d3.select(g.property("nearestViewportElement")),
            legendPadding = g.attr("data-style-padding") || 5,
            legendBox = g.selectAll(".legend-box").data([true]),
            legendItems = g.selectAll(".legend-items").data([true])

        legendBox.enter().append("rect").classed("legend-box", true)
        legendItems.enter().append("g").classed("legend-items", true)

        svg.selectAll("[data-legend]").each(function() {
            var self = d3.select(this)
            items[self.attr("data-legend")] = {
                pos: self.attr("data-legend-pos") || this.getBBox().y,
                color: self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
            }
        })

        items = d3.entries(items).sort(function(a, b) {
            return a.value.pos - b.value.pos })


        legendItems.selectAll("text")
            .data(items, function(d) {
                return d.key })
            .call(function(d) { d.enter().append("text") })
            .call(function(d) { d.exit().remove() })
            .attr("y", function(d, i) {
                return i + "em" })
            .attr("x", "1em")
            .text(function(d) {
                return d.key })

        legendItems.selectAll("circle")
            .data(items, function(d) {
                return d.key })
            .call(function(d) { d.enter().append("circle") })
            .call(function(d) { d.exit().remove() })
            .attr("cy", function(d, i) {
                return i - 0.25 + "em" })
            .attr("cx", 0)
            .attr("r", "0.4em")
            .style("fill", function(d) {
                return d.value.color })

    })
    return g
}
window.onload = function() {

    d3.csv('https://dl.dropboxusercontent.com/u/4223104/wages-productivity.csv', function(error, results) {
        if (error) throw error;
        var years = results.map(function(x) {
            var date = x.Year;
            return date;
        });
        var productivity = results.map(function(x) {
            return parseFloat(x["Net productivity"].replace(/\%/, ''));
        });
        var wages = results.map(function(x) {
            return parseFloat(x["Hourly compensation"].replace(/\%/, ''));
        });
        //Organize data and pass
        var data = {
            years: years,
            productivity: productivity,
            wages: wages
        };
        var newChart = makeChart(data);
        newChart.animateChart();
        d3.select(window).on('resize', newChart.resizeChart);
    });

}
