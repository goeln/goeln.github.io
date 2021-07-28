const width = 700;
const height = 700;

var xScale = d3.scaleLinear().range([0,width]);
var yScale = d3.scaleLinear().range([height, 0]);  
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

// Functions

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
