const margin = {top: 20, right: 120, bottom: 50, left: 50},
    svgWidth = 800,
    svgHeight = 500,
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

const type = {
    MAILE: 1,
    FEMAILE: 2
}

var parseTime = d3.timeParse("%Y");
var formatValue = d3.format(",");
var floatFormatValue = d3.format(".3n");

const chart = d3.select('#chart')
    .attr("width", svgWidth)
    .attr("height", svgHeight)

const innerChart = chart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x,y values
var xScale = d3.scaleLinear().range([0,width]);
var yScale = d3.scaleLinear().range([height, 0]);    

// x,y axis
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);


// line chart related
var valueline = d3.line()
    .x(function(d){ return xScale(d.date);})
    .y(function(d){ return yScale(d.value);})
    .curve(d3.curveLinear);


// Adds the svg canvas
var g = innerChart
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    

$("#nav_page2_id").click(function() {
    innerChart.selectAll("g").remove();
    innerChart.selectAll("text").remove();
    hide('#page1_id');
    show('#page2_id');    
    drawAnnotation2("USA", false, 1);
    drawAnnotation2("USA", false, 2);
})

$("#nav_page3_id").click(function() {
    innerChart.selectAll("g").remove();
    innerChart.selectAll("text").remove();
    hide('#page2_id');
    loadCountries(addCountriesList);
    show('#page3_id');
    draw("IND", true, 1);
    draw("IND", true, 2);
})

$("#beginning").click(function() {
    innerChart.selectAll("g").remove();
    innerChart.selectAll("text").remove();
    hide("#page3_id");
    hide("#country");
    show("#page1_id");
    drawAnnotation("WLD", false, 1);
    drawAnnotation("WLD", false, 2);
})

$("input[name='type']").click(function() {
    draw('WLD', $('input:radio[name=type]:checked').val());
})


function load(){
    d3.json("https://api.worldbank.org/v2/country/all/indicator/SL.EMP.WORK.ZS?format=json&per_page=60&date=2000:2019").then(function(d){
        console.log(d);
    });
}

function loadCountries(callback){
    if (typeof callback !== "function") throw new Error("Wrong callback in loadCountries");

    d3.json("https://api.worldbank.org/v2/country?format=json&per_page=400").then(callback);
}

function loadFemaleEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.FE.ZS?format=json&per_page=60&date=2000:2019")
        .then(callback);
}
function loadMaleEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.MA.ZS?format=json&per_page=60&date=2000:2019")
        .then(callback);
}

/**
 * 
 * @param {*} countryCode 3-digit country code
 * @param {*} type "male", "female", "total" (male+female)
 * @param {*} callback callback function 
 */
function loadEmploymentByCountryCode(countryCode, type, callback){
    if (type == "male"){
        loadMaleEmploymentByCountryCode(countryCode, callback);
    }
    else {
        loadFemaleEmploymentByCountryCode(countryCode, callback);
    }
}

/**
 * callback function
 * @param {*} countryCode 3-digit country code to query, "WLD" is for the world.
 * @param {*} countrylabel true of false for drawing line tooltip 
 * @param {*} type type constant, 0: total, 1: male, 2: female
 */
function draw(countryCode, countrylabel, type) {
    if (type == 1){
        loadEmploymentByCountryCode(countryCode, "male", drawChart(countryCode, countrylabel, "CornflowerBlue"));
    }
    else {
        loadEmploymentByCountryCode(countryCode, "female", drawChart(countryCode, countrylabel, "pink"));
    }
}

function drawAnnotation(countryCode, countrylabel, type) {

    if (type == 1){
        loadEmploymentByCountryCode(countryCode, "male", drawChartAnnotationWorld(countryCode, countrylabel, "CornflowerBlue"));
    }
    else {
        loadEmploymentByCountryCode(countryCode, "female", drawChartAnnotationWorld(countryCode, countrylabel, "pink"));
    }
}

function drawAnnotation2(countryCode, countrylabel, type) {

    if (type == 1){
        loadEmploymentByCountryCode(countryCode, "male", drawChartAnnotationUSA(countryCode, countrylabel, "CornflowerBlue"));
    }
    else {
        loadEmploymentByCountryCode(countryCode, "female", drawChartAnnotationUSA(countryCode, countrylabel, "pink"));
    }
}

function drawChart(countryCode, countrylabel, color){

    return function(data){

        xScale.domain(d3.extent(data[1], function(d) { return d.date; }));
        yScale.domain([0, 100]);

        innerChart
            .append('g')
            .attr('transform', "translate(0," + height + ")")
            .call(xAxis);

        innerChart
            .append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("year");
     
        innerChart
            .append('g')
            .call(yAxis)
            .attr("y", 6);

        innerChart
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("percentage (%)");

        /* Initialize tooltip for datapoint */
        tip = d3.tip().attr('class', 'd3-tip').offset([-5, 5]).html(function(d) {
            return "<strong style='color:" + color + "'>" + countryCode + " " + floatFormatValue(d.value)  + "</strong>"; 
        });   

        var path = innerChart.append("g").append("path")
        .attr("width", width).attr("height",height)
        .datum(data[1].map( (d, i) => {
            return {
                date : d.date,
                value : d.value
            };
        }
        ))
        .attr("class", "line")
        .attr("d", valueline)
        .style("stroke", color);        

        // datapoint tooltip
        innerChart.append("g").selectAll(".dot")
            .attr("width", width).attr("height",height)
            .data(data[1])
            .enter()
            .append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return xScale(d.date) })
            .attr("cy", function(d) { return yScale(d.value) })
            .attr("r", 3)
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        if (countrylabel == true){
            innerChart.selectAll().data(data[1]).enter().append("g").append("text")
            .attr("transform", "translate(" + (width - 20) + "," + yScale(data[1][data[1].length - 1].value) + ")")
            .attr("dy", ".15em")
            .attr("text-anchor", "start")
            .style("fill", color)
            .text(countryCode);
        }
    }
}

function drawChartAnnotationWorld(countryCode, countrylabel, color){

    return function(data){

        xScale.domain(d3.extent(data[1], function(d) { return d.date; }));
        yScale.domain([0, 100]);

        innerChart
            .append('g')
            .attr('transform', "translate(0," + height + ")")
            .call(xAxis);

        innerChart
            .append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("year");
        
        innerChart
            .append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                ((height/2) - 48) + ")")
            .style('fill', 'indigo')
            .text("There's 8% increase from 2000 to 2018");
        
        innerChart
            .append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                ((height/2) - 28) + ")")
            .style('fill', 'indigo')
            .text("but only a ~1% difference between the genders");
        
        innerChart
            .append('g')
            .call(yAxis)
            .attr("y", 6);

        innerChart
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("percentage (%)");

        /* Initialize tooltip for datapoint */
        tip = d3.tip().attr('class', 'd3-tip').offset([-5, 5]).html(function(d) {
            return "<strong style='color:" + color + "'>" + countryCode + " " + floatFormatValue(d.value)  + "</strong>"; 
        });   

        var path = innerChart.append("g").append("path")
        .attr("width", width).attr("height",height)
        .datum(data[1].map( (d, i) => {
            return {
                date : d.date,
                value : d.value
            };
        }
        ))
        .attr("class", "line")
        .attr("d", valueline)
        .style("stroke", color);        

        // datapoint tooltip
        innerChart.append("g").selectAll(".dot")
            .attr("width", width).attr("height",height)
            .data(data[1])
            .enter()
            .append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return xScale(d.date) })
            .attr("cy", function(d) { return yScale(d.value) })
            .attr("r", 3)
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        if (countrylabel == true){
            innerChart.selectAll().data(data[1]).enter().append("g").append("text")
            .attr("transform", "translate(" + (width - 20) + "," + yScale(data[1][data[1].length - 1].value) + ")")
            .attr("dy", ".15em")
            .attr("text-anchor", "start")
            .style("fill", color)
            .text(countryCode);
        }
    }
}

function drawChartAnnotationUSA(countryCode, countrylabel, color){

    return function(data){

        xScale.domain(d3.extent(data[1], function(d) { return d.date; }));
        yScale.domain([0, 100]);

        innerChart
            .append('g')
            .attr('transform', "translate(0," + height + ")")
            .call(xAxis);

        innerChart
            .append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("year");
        
        innerChart
            .append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                ((height/2) - 145) + ")")
            .style('fill', 'indigo')
            .text("The % difference in employment from 2000 to");
        
        innerChart
            .append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                ((height/2) - 125) + ")")
            .style('fill', 'indigo')
            .text(" 2018 is only about 1-2% across both genders");

        innerChart
            .append('g')
            .call(yAxis)
            .attr("y", 6);

        innerChart
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("percentage (%)");

        /* Initialize tooltip for datapoint */
        tip = d3.tip().attr('class', 'd3-tip').offset([-5, 5]).html(function(d) {
            return "<strong style='color:" + color + "'>" + countryCode + " " + floatFormatValue(d.value)  + "</strong>"; 
        });   

        var path = innerChart.append("g").append("path")
        .attr("width", width).attr("height",height)
        .datum(data[1].map( (d, i) => {
            return {
                date : d.date,
                value : d.value
            };
        }
        ))
        .attr("class", "line")
        .attr("d", valueline)
        .style("stroke", color);        

        // datapoint tooltip
        innerChart.append("g").selectAll(".dot")
            .attr("width", width).attr("height",height)
            .data(data[1])
            .enter()
            .append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return xScale(d.date) })
            .attr("cy", function(d) { return yScale(d.value) })
            .attr("r", 3)
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        if (countrylabel == true){
            innerChart.selectAll().data(data[1]).enter().append("g").append("text")
            .attr("transform", "translate(" + (width - 20) + "," + yScale(data[1][data[1].length - 1].value) + ")")
            .attr("dy", ".15em")
            .attr("text-anchor", "start")
            .style("fill", color)
            .text(countryCode);
        }
    }
}

// callback function
function addCountriesList(data, i){

    d3.select("body")
        .select("#country_select_container")
        .append("select")
        .attr("id", "country")
        .selectAll("options")
        .data(data[1])
        .enter()
        .append("option")
        .attr("value", function(d){ return d.id; })
        .text(function (d, i){return d.name;});

    d3.select("body").select("#country_select_container").select("select").on("change", function(){
        draw(
            d3.select(this).property('value'), 
            true,
            d3.select('input[name=type]:checked').node().value
        );
    });
}

// utility functions
function show(step){
    $(step).show();
}

function hide(step){
    $(step).hide();
}
