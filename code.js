/////////////////////////////////////////////////////////////  Chart Related  /////////////////////////////////////////////////////////////
const width = 700;
const height = 700;

var xScale = d3.scaleLinear().range([0,width]);
var yScale = d3.scaleLinear().range([height, 0]);  
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

const chart = d3.select('#chart')
    .attr("width", 800)
    .attr("height", 800)

const dataChart = chart.append("g").attr("transform", "translate(" + 50 + "," + 50 + ")");

var g = dataChart
    .attr("width", 800)
    .attr("height", 800)
    .append("g")
    .attr("transform", "translate(" + 50 + "," + 50 + ")");


////////////////////////////////////////////////////////////////  Functions  ////////////////////////////////////////////////////////////////

// Get country data from API
function getAllCountries(callback){
    d3.json("https://api.worldbank.org/v2/country?format=json&per_page=400").then(callback);
}

// Wage and salaried workers, female/male (% of female/male  employment)
function getMalesByCountry(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.MA.ZS?format=json&per_page=60&date=2000:2019")
        .then(callback);
}
function getFemalesByCountry(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.FE.ZS?format=json&per_page=60&date=2000:2019")
        .then(callback);
}

function getByCountry(countryCode, type, callback){
    if (type == "m") {
        getMalesByCountry(countryCode, callback);
    }
    else {
        getFemalesByCountry(countryCode, callback);
    }
}

function draw(countryCode, countrylabel, type) {
    if (type == 1){
        getByCountry(countryCode, "m", drawChart(countryCode, countrylabel, "blue"));
    }
    else {
        getByCountry(countryCode, "f", drawChart(countryCode, countrylabel, "red"));
    }
}

function drawChart(countryCode, countrylabel, color) {
    return function(data){

        xScale.domain(d3.extent(data[1], function(d) { return d.date; }));
        yScale.domain([0, 100]);

        // Add the X Axis
        dataChart
            .append('g')
            .attr('transform', "translate(0," + height + ")")
            .call(xAxis);

        dataChart
            .append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + 50 + 20) + ")")
            .style("text-anchor", "middle")
            .text("year");

        // Add the Y Axis
        dataChart
            .append('g')
            .call(yAxis)
            .attr("y", 6);

        dataChart
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 50)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("percentage");

        // Tooltip
        tip = d3.tip().attr('class', 'd3-tip').offset([-5, 5]).html(function(d) {
            return "<strong style='color:" + color + "'>" + countryCode + " " + floatFormatValue(d.value)  + "</strong>"; 
        });   

        var path = innerChart.append("g").append("path")
        .attr("width", width).attr("height", height)
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
