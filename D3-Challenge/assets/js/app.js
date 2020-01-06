

// @TODO: YOUR CODE HERE!
const svgWidth = 1100;
const svgHeight = 800;

const margin = {
  top: 20,
  right: 40,
  bottom: 150,
  left: 60
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;
//Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// Append an SVG group
  const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
let chosenXAxis = "poverty";

// function used for updating x-scale const upon click on axis label
function xScale(Data, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chosenXAxis])*0.8, 
        d3.max(Data, d => d[chosenXAxis]*1.2) 
      ])
      .range([0, width]);
  
    return xLinearScale;
  }
  
// function used for updating xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
    
    return circlesGroup;
  }
  
function renderText(textGroup, newXScale, chosenXAxis){
   
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))

    return textGroup;
}
  
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    let xlabel  = "";
    if (chosenXAxis === "poverty") {
        xlabel = "% in Poverty:"
        ylabel = "% Lacking Healthcare";
    }

    if (chosenXAxis === "income") {
        xlabel = "Household Income (Median)"
        ylabel = "% Lacking Healthcare"
    }
    else {
        xlabel = "Age (Median)"
        ylabel = "% Lacking Healthcare";
    }

    // ToopTIP function to show data box on mouse over 
//     const toolTip = d3.tip()
//         .attr("class", "tooltip")
//         .offset([80, -60])
//         .html(function(d) {
//             return (`${d.abbr}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${[d.healthcare]}`);
//         });

//     circlesGroup.call(toolTip);

//     circlesGroup.on("mouseover", function(data) {
//         toolTip.show(data, this);
//     })

//     // .on("mouseout", function(data) {
//     //     toolTip.hide(data, this);
//     // });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    const Data = await d3.csv("assets/data/data.csv");

    // parse data
    Data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    console.log(Data)

    ////////////////////////////////////////////////////////////////////

    // xLinearScale function above csv import
    let xLinearScale = xScale(Data, chosenXAxis);

    // Create y scale function
    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(Data, d => d.healthcare)*1.2])
        .range([height, 0]);

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
  

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(Data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", "0.5");



   //append and style state abbr to circles
    var textGroup = chartGroup.selectAll(".stateText")
        .data(Data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.healthcare))
        .text(d => d.abbr)
        .attr("class", "stateText")
        .style("font-size", "15px")
        .style("text-anchor", "middle")
        .style('fill', 'white');


    

    // Create group for  2 x- axis labels
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let PovertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        // .classed("xLabel")
        .text("In Poverty (%)");

    let AgeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        // .classed("xlabel")
        .text("Age (Median)");
    
    let IncomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        // .classed("xlabel")
        .text("Household Income (Median)");

    

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(Data, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis);
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                PovertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                
            }
            if (chosenXAxis === 'age') {
                PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                AgeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                
            }
            
            else if (chosenXAxis === 'income') {
                PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                IncomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                
    }
        }
    });
})()
