// Level 2: Multiple Search Categoried ========================================
// - Complete all of level 1 criteria
// - Using multiple `input` tages and/or select dropdowns, write JavaScript code
//   so the user can to set multiple filters and search for UFO sightings using
//   the following criteria based on the table columns:
//   1 date/time 2 city 3 state 4 country 5 shape
// ----------------------------------------------------------------------------

// declare prototype and function
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function getDataList(parent, children, parentCode) {
    var dataList = [];
    tableData.forEach((data) => {
        if (parentCode && parentCode !== 'all' && data[parent] !== parentCode) {
            return;
        }
        var childrenData = data[children];
        var array_contains_data = (dataList.indexOf(childrenData) > -1);
        if (array_contains_data) {
            return;
        }
        dataList.push(childrenData);
    });
    return dataList;
}


// ----------------------------------------------------------------------------
// Step 1: Webpage initial look
// ----------------------------------------------------------------------------
// from data.js
var tableData = data;
// find table body to append rows
var tbody = d3.select('tbody');

// interate through each info in the order of:
// datetime, city, state, country, shape, duration, comments
tableData.forEach( sighting => {
    var row = tbody.append('tr');
    row.append("td").text(sighting.datetime);
    row.append("td").text(sighting.city);
    row.append("td").text(sighting.state);
    row.append("td").text(sighting.country);
    row.append("td").text(sighting.shape);
    row.append("td").text(sighting.durationMinutes);
    row.append("td").text(sighting.comments);
});


// at the very beginning, put all options in the dropdown menu for state, city, and shape
getDataList(null,'state',null).forEach( state => { d3.select('#state').append("option").text(state.toUpperCase()).attr('value', state) } );
getDataList(null,'city',null).forEach( city => { d3.select('#city').append("option").text(city.capitalizeFirstLetter()).attr('value', city) } );
getDataList(null,'shape',null).forEach( shape => { d3.select('#shape').append("option").text(shape).attr('value', shape) } );

// ----------------------------------------------------------------------------
// Step 2: responsive selection in the dropdown menu
// - When one selects country, the dropdown menus of state and city only show 
//   those in the country. Similarly, when select state, the dropdown menu of 
//   city only shows those in the selected state
// - In the state dropdown menu, use 'uppercase' to express states; while in 
//   the city dropdown menu, use 'capitalizeFirstLetter' to express cities
// - When one selects dropdown menu, only dropdown menus in the Location section
//   will respond. 
// ----------------------------------------------------------------------------

d3.select('#country')
    .on('change', function () {
        d3.event.preventDefault();
        var countryCode = d3.select('#country').property('value');
        d3.selectAll('#state > option').remove();
        d3.selectAll('#city > option').remove();
        d3.select('#state').append("option").text('--').attr('value', 'all');
        d3.select('#city').append("option").text('--').attr('value', 'all');
        getDataList('country','state',countryCode).forEach( state => { d3.select('#state').append("option").text(state.toUpperCase()).attr('value', state) } );
        getDataList('country','city',countryCode).forEach( city => { d3.select('#city').append("option").text(city.capitalizeFirstLetter()).attr('value', city) } );
    });

d3.select('#state')
    .on('change', function () {
        d3.event.preventDefault();
        var stateCode = d3.select('#state').property('value');
        d3.selectAll('#city > option').remove();
        d3.select('#city').append("option").text('--').attr('value','all');
        getDataList('state','city',stateCode).forEach( city => { d3.select('#city').append("option").text(city.capitalizeFirstLetter()).attr('value', city) } );
});


// ----------------------------------------------------------------------------
// Step 3: search through different criteria to find rows that match user input 
// ----------------------------------------------------------------------------

var submitbtn = d3.select("#filter-btn");

submitbtn.on("click", function() {
    // prevent the page from refreshing
    d3.event.preventDefault();

    // select the input element and get the value
    var filter_criteria = {
        datetime: d3.select('#datetime').property('value'),
        country: d3.select('#country').property('value'),
        state: d3.select('#state').property('value'),
        city: d3.select('#city').property('value'),
        shape: d3.select('#shape').property('value')
    };
    console.log(filter_criteria);
    // apply filter to data
    event = tableData.filter(function(item) {
        for (var key in filter_criteria) {
            if (filter_criteria[key] && item[key] !== filter_criteria[key] && filter_criteria[key] !== "all") {
                return false
            }
        }
        return true;
    });

    // clean previous table
    d3.selectAll('tbody > tr').remove();

    // append event on the specific datetime to the table
    event.forEach( event => {
        row2 = tbody.append('tr');
        row2.append("td").text(event.datetime);
        row2.append("td").text(event.city);
        row2.append("td").text(event.state);
        row2.append("td").text(event.country);
        row2.append("td").text(event.shape);
        row2.append("td").text(event.durationMinutes);
        row2.append("td").text(event.comments);
    });
});
