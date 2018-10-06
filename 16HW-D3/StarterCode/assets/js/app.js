// @TODO: YOUR CODE HERE!
var svgWidth = 800;
var svgHeight = 550;

var margin = {
    top: 40,
    right: 40,
    bottom: 120,
    left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create an SVG wrapper, append an SVG group that will hold the chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("border", "1px solid black");

// append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(xData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(xData, d => d[chosenXAxis]) * 0.8,
                 d3.max(xData, d => d[chosenXAxis]) * 1.2      
        ])
        .range([0, width]);

    return xLinearScale
};

// function used for updating y-scale var upon click on axis label
function yScale(yData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(yData, d => d[chosenYAxis]) * 0.8,
                 d3.max(yData, d => d[chosenYAxis]) * 1.2      
        ])
        .range([height, 0]);

    return yLinearScale
};

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXSacle, xAxis) {
    var bottomAxis = d3.axisBottom(newXSacle);

    xAxis.transition()
         .duration(1000)
         .call(bottomAxis);
    
    return xAxis;
};

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYSacle, yAxis) {
    var leftAxis = d3.axisLeft(newYSacle);

    yAxis.transition()
         .duration(1000)
         .call(leftAxis);
    
    return yAxis;
};


// function used for updating circles group with a transition to 
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
};

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
             .duration(1000)
             .attr("x", d => newXScale(d[chosenXAxis]))
             .attr("y", d => newYScale(d[chosenYAxis]));
    return textGroup;
};




// function used for updating circles group with new tooltip
function updateToolTip( chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age:";
    }
    else {
        var xlabel = "Income:"
    }

    if (chosenYAxis === "obesity") {
        var ylabel = "Obesity:";
    }
    else if (chosenYAxis === "smoke") {
        var ylabel = "Smoke:";
    }
    else {
        var ylabel = "Healthcare:"
    }
    
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]} `);
        });
  
    svg.call(toolTip);

    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d);
        d3.select(this)
          .attr("stroke", "black");

    }).on("mouseleave", function(d) {
        toolTip.hide(d)
        d3.select(this)
          .attr("stroke", "white")
    });

    return circlesGroup
  };


d3.csv("./assets/data/data.csv", function(err, newsData) {
    if (err) throw err;
    // console.log(newsData)

    // parse data
    newsData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });
    
    // xLinearScale function above csv import
    var xLinearScale = xScale(newsData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(newsData, chosenYAxis);

    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var textGroup = chartGroup.append("text")
        .selectAll("tspan")
        .data(newsData)
        .enter()
        .append("tspan")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("class", "state_abbr")
        .text(data => data.abbr)
    

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(newsData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "pink")
        .attr("opacity", "0.4")
        .attr("stroke-width", "1")
        .attr("stroke", "white")
    

    // create group for 3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");
    
    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // create group for 3 y- axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)"); 

    var obeseLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 40 - (margin.left))
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");
    
    var smokeLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 60 - (margin.left))
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)")
    
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 80 - (margin.left))
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)")
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup)

    // x xais labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            console.log(value);
            if (value !== chosenXAxis) {
                // replace chosenXAxis with value
                chosenXAxis = value;
                // function here found above csv import
                // update x scale for new data
                xLinearScale = xScale(newsData, chosenXAxis);
                yLinearScale = yScale(newsData, chosenYAxis);

                // update x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);

                // update circle with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // change classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // var circlesGroup = yupdateToolTip(chosenYAxis, circlesGroup)
    // y xais labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replace chosenXAxis with value
                chosenYAxis = value;
                // function here found above csv import
                // update x scale for new data
                xLinearScale = xScale(newsData, chosenXAxis);
                yLinearScale = yScale(newsData, chosenYAxis);

                // update x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);

                // update circle with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // change classes to change bold text
                if (chosenYAxis === "obesity") {
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});

