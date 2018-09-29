function buildMetadata(sample) {
  let defaultURL = "/metadata/" + sample;
  // @TODO: Complete the following function that builds the metadata panel
  d3.json(defaultURL).then(function(data) {
  // Use `d3.json` to fetch the metadata for a sample
    // -------------------------------------------------------------------
    // Use d3 to select the panel with id of `#sample-metadata`
    var metadata = d3.select('#sample-metadata');
    // Use `.html("") to clear any existing metadata
    metadata.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(data).forEach( row => {
      metadata.append('p').text(row[0] + ': ' + row[1])
    });
    // -------------------------------------------------------------------
    // BONUS: Build the Gauge Chart
    // Trig to calc meter point

    var wfreq = data.WFREQ;
    // Gauge value = 0-9; degree value = 0-180
    var level = parseFloat(wfreq) * 20;
    var degrees = 180 - level;
    var radius = 0.5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius *  Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{
      type: 'scatter',
      x: [0],
      y: [0],
      marker: {size: 10, color: '850000'},
      showlegend: false,
      name: 'Weekly Washing Frequency',
      text: level,
      hoverinfo: 'text+name'
    },
    {
      values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition: 'inside',
      marker: {
        colors: [
          "rgba(246, 111, 128, .5)",
          "rgba(247, 126, 134, .5)",
          "rgba(248, 138, 140, .5)",
          "rgba(249, 150, 145, .5)",
          "rgba(250, 170, 154, .5)",
          "rgba(251, 180, 158, .5)",
          "rgba(252, 194, 164, .5)",
          "rgba(253, 221, 175, .5)",
          "rgba(255, 246, 186, .5)",
          "rgba(255, 255, 255, 0)"
        ]
      },
      labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
      hoverinfo: "label",
      hole: .5,
      type: 'pie', 
      showlegend: false
    }];

    var layout = {
      shapes: [
        {
          type: "path",
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: "<b>Belly Button Washing Frequency</b> <br> Scrubs per week",
      height: 700,
      width: 700,
      xaxis: {zeroline:false, showticklabels:false,
        showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
        showgrid: false, range: [-1, 1]}
    };

    var gauge = document.getElementById("gauge");
    Plotly.newPlot(gauge, data, layout);

    });    
};

function buildCharts(sample) {
  let defaultURL = "/samples/" + sample;
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(defaultURL).then(function(data) {
    // -------------------------------------------------------------------
    // @TODO: Build a Bubble Chart using the sample data
    var bubble_result = [];
    for (i=0; i<data.sample_values.length; i++) {
      bubble_result.push({
        otu_ids: data.otu_ids[i],
        sample_values: data.sample_values[i],
        otu_labels: data.otu_labels[i]
      });
    };

    bubble_data = [{
      x: bubble_result.map(row => row.otu_ids),
      y: bubble_result.map(row => row.sample_values),
      mode: 'markers',
      marker: {
        size: bubble_result.map(row => row.sample_values),
        color: bubble_result.map(row => row.otu_ids)
      },
      text: bubble_result.map(row => row.otu_labels)
    }];

    var bubble_layout = {
      showlegend: false,
      xaxis: {
        title: "OTU ID"
      }
    }
    var bubble = document.getElementById("bubble");
    Plotly.newPlot(bubble, bubble_data, bubble_layout);
    // -------------------------------------------------------------------
    // @TODO: Build a Pie Chart
    var pie_result = [];
    for (i=0; i<data.sample_values.length; i++) {
      pie_result.push({
        otu_ids: data.otu_ids[i],
        sample_values: data.sample_values[i],
        otu_labels: data.otu_labels[i]
      });
    };
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    pie_result.sort(function(a,b) {
      return parseFloat(b.sample_values) - parseFloat(a.sample_values);
    });
    pie_result = pie_result.slice(0, 10);

    var pie_data = [{
      values: pie_result.map(row => row.sample_values),
      labels: pie_result.map(row => row.otu_ids),
      hovertext: pie_result.map(row => row.otu_labels),
      type: 'pie'
    }];
    var pie = document.getElementById("pie");
    Plotly.newPlot(pie, pie_data);
  });
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
