<template>
  <b-container class="house-price">
    <b-row align-v="center">
      <b-col>
        <svg class="house-price-line-chart" />
      </b-col>
      <b-col cols="4">
        <b-form-select v-model="selectedState" :options="stateOptions" class="mb-3" >
          <template slot="first">
            <!-- this slot appears above the options from 'options' prop -->
            <option :value="null" disabled>-- Please select a state --</option>
          </template>
        </b-form-select>
      </b-col>
    </b-row>
    <b-row align-v="center">
      <b-col>
        <div id="tooltip">
          <h4>{{ tooltipTitle }}</h4>
          Price ${{ tooltipStateHousePrice }}
        </div>
        <div id="map"></div>
      </b-col>
      <b-col cols="1">
        <div id="map-legend"></div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'house-price',

  data() {
    return {
      svgWidth: 600,
      svgHeight: 400,
      margin: {
        top: 40,
        right: 80,
        bottom: 80,
        left: 90,
      },
      avgData: [],
      stateData: [],
      selectedState: null,
      stateOptions: [],
      statesMapData: [],
      tooltipTitle: '',
      tooltipStateHousePrice: '',
      clickedMonth: '2010-01',
    };
  },

  computed: {
    width() {
      return this.svgWidth - this.margin.left - this.margin.right;
    },
    height() {
      return this.svgHeight - this.margin.top - this.margin.bottom;
    }
  },

  mounted() {
    this.getStates();
    this.getAverageHousePriceData();
    this.drawChoroplethMap();
  },

  watch: {
    avgData() {
      this.drawPriceTime();
    },
    stateData() {
      this.drawPriceTime();
    },
    selectedState() {
      this.getStateHousePriceData();
    }
  },

  methods: {
    getAverageHousePriceData() {
      const that = this;
      const defaultUrl = `http://127.0.0.1:5000/house_price_with_time`;
      d3.json(defaultUrl).then((response) => {
        that.avgData = [];
        for (let i = 0, len = response.time.length; i < len; i++) {
          that.avgData.push({
            date: new Date(response.time[i]),
            value: response.house_price[i]
          });
        }
      });
    },
    getStateHousePriceData() {
      const that = this;
      if (that.selectedState) {
        const defaultUrl = `http://127.0.0.1:5000/house_price_with_time/` + that.selectedState;
        d3.json(defaultUrl).then((response) => {
          that.stateData = [];
          for (let i = 0, len = response.time.length; i < len; i++) {
            that.stateData.push({
              date: new Date(response.time[i]),
              value: response.house_price[i]
            });
          }
        });
      }
    },
    getStates() {
      const that = this;
      const defaultUrl = `http://127.0.0.1:5000/state_name`;
      const states = [];
      d3.json(defaultUrl).then((response) => {
        response.forEach(element => {
          states.push({
            value: element,
            text: element
          });
        });
        that.stateOptions = states;
      });
    },
    drawPriceTime() {
      const that = this;
      let svg = d3.select("svg");
      svg.selectAll("*").remove();

      /**
       * Basic svg set up 
       */
      const x = d3.scaleTime().rangeRound([0, that.width]);
      const y = d3.scaleLinear().rangeRound([that.height, 0]);
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));
      svg = d3.select("svg")
        .attr("width", that.svgWidth)
        .attr("height", that.svgHeight)
        .append("g")
        .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");
      const house_prices = [{
          name: 'Average',
          values: that.avgData,
      }];
      if (that.selectedState) {
        house_prices.push({
            name: that.selectedState,
            values: that.stateData,
        });
      }
      color.domain(house_prices.map(d => d.name));
      const format = d3.format(".2f");
      x.domain(d3.extent(
        that.avgData.map(d => d.date).concat(that.stateData.map(d => d.date))
      ));
      y.domain( d3.extent(
        that.avgData.map(d => format(d.value)).concat(that.stateData.map(d => format(d.value)))
      ));

      /**
       * Lengend
       */
      const legend = svg.selectAll("g")
        .data(house_prices)
        .enter()
        .append("g")
        .attr("class", "legend");
      legend.append("rect")
        .attr("x", 40)
        .attr("y", (d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => color(d.name));
      legend.append("text")
        .attr("x", 55)
        .attr("y", (d, i) => (i * 20) + 11)
        .text(d => d.name);

      /**
       * Axis
       */
      svg.append("g")
        .attr("transform", "translate(0," + that.height + ")")
        .call(d3.axisBottom(x).ticks(d3.timeYear.every(2)));
      svg.append("text")
        .attr("transform", "translate(" + (that.width / 2) + "," + (that.height + that.margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Time");
      svg.append("text")
        .attr("")
      svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format("~s")).ticks(5));
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - that.margin.left)
        .attr("x", 0 - (that.height / 2))
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .text("Price ($)");

      /**
       * Draw line
       */
      const house_price = svg.selectAll(".house-price")
        .data(house_prices)
        .enter().append("g")
        .attr("class", "house-price");
      house_price.append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", d => color(d.name));

      /**
       * Black vertical line to follow mouse
       */
      const mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");
      mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");
      const lines = document.getElementsByClassName('line');
      const mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(house_prices)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");
      mousePerLine.append("circle")
        .attr("r", 6)
        .style("stroke", d => color(d.name))
        .style("fill", "none")
        .style("stroke-width", "2px")
        .style("opacity", "0");
      mousePerLine.append("text")
        .attr("transform", "translate(10,3)");
      // append a rect to catch mouse movements on canvas
      mouseG.append("svg:rect")
        // can't catch mouse events on a g element
        .attr("width", that.width)
        .attr("height", that.height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        // on mouse out hide line, circles and text
        .on("mouseout", () => {
          d3.select(".mouse-line")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "0");
        })
        // on mouse in show line, circles and text
        .on("mouseover", () => {
          d3.select(".mouse-line")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "1");
        })
        // mouse moving over canvas
        .on("mousemove", function() {
          let mouse = d3.mouse(this);
          d3.select(".mouse-line")
            .attr("d", () => {
              let d = "M" + mouse[0] + "," + that.height;
              d += " " + mouse[0] + "," + 0;
              return d;
            });
          d3.selectAll(".mouse-per-line")
            .attr("transform", function(d, i) {
              const xDate = x.invert(mouse[0]),
                    bisect = d3.bisector(d => d.date).right,
                    idx = bisect(d.values, xDate);
              that.clickedMonth = xDate.getFullYear() + '-' + ('0' + (xDate.getMonth() + 1)).slice(-2);
              let beginning = 0,
                  end = lines[i].getTotalLength(),
                  target = null,
                  pos = null;
              while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = lines[i].getPointAtLength(target);
                if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
                }
                if (pos.x > mouse[0]) end = target;
                else if (pos.x < mouse[0]) beginning = target;
                else break; // position found
              }
              d3.select(this).select('text')
                .text(y.invert(pos.y).toFixed(2));
              return "translate(" + mouse[0] + "," + pos.y + ")";
            });
        })
        // mouse click on canvas 
        .on("click", () => {
          this.drawChoroplethMap();
        });
    },
    drawChoroplethMap() {
      const that = this;
      //Width and height of map
      const width = 600;
      const height = 400;
      const lowColor = '#ffffcc'
      const highColor = '#800026'

      // D3 Projection
      const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale([800]);

      // Define path generator
      const path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection

      // Create SVG element and append map to the SVG
      d3.select("#map")
        .selectAll("*")
        .remove();
      const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Load in states data
      const defaultUrl = `http://127.0.0.1:5000/house_price_with_time/map/` + that.clickedMonth;
      d3.json(defaultUrl).then((data) => {
        that.statesMapData = data;
        const dataArray = data.value;
        // const minVal = d3.min(dataArray.filter(d => d).map(d => parseFloat(d)));
        // const maxVal = d3.max(dataArray.filter(d => d).map(d => parseFloat(d)));
        const minVal = 100000;
        const maxVal = 650000;
        const ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor]);

        // Load GeoJSON data and merge with states data
        d3.json("src/assets/us-states.json").then((json) => {
          // Loop through each state data value in the .csv file
          for (let i = 0; i < data.state.length; i++) {
            // Grab State Name
            const dataState = data.state[i];
            // Grab data value 
            const dataValue = data.value[i];
            // Find the corresponding state inside the GeoJSON
            for (let j = 0; j < json.features.length; j++) {
              const jsonState = json.features[j].properties.name;
              if (dataState == jsonState) {
                // Copy the data value into the JSON
                json.features[j].properties.value = dataValue;
                break;
              }
            }
          }

          // Bind the data to the SVG and create one path per GeoJSON feature
          svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("id", d => d.properties.name)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", d => ramp(d.properties.value))
            .on("mouseover", function(d) {
              that.tooltipTitle = d.properties.name;
              that.tooltipStateHousePrice = d.properties.value;
              let mouse = d3.mouse(this);
              d3.select("#tooltip")
                .style("opacity", .9);
              d3.select("#tooltip")
                .style("left", (mouse[0] + "px"))
                .style("top", (mouse[1] + "px"));
            })
            .on("mouseout", function(d) {
              that.tooltipTitle = '';
              that.tooltipStateHousePrice = '';
              d3.select("#tooltip")
                .style("opacity", 0);
            });

          // Add title
          svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .text(that.clickedMonth);
        });

        /**
         * Map legend
         */
        const w = 100, h = 300;
        const scale = 0.3;
        const y = d3.scaleLinear()
          .range([h, 0])
          .domain([minVal, maxVal]);
        d3.select("#map-legend")
          .selectAll("*")
          .remove();
        const key = d3.select("#map-legend")
          .append("svg")
          .attr("width", w)
          .attr("height", h)
          .attr("class", "legend");
        const legend = key.append("defs")
          .append("svg:linearGradient")
          .attr("id", "gradient")
          .attr("x1", "100%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "100%")
          .attr("spreadMethod", "pad");
        legend.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", highColor)
          .attr("stop-opacity", 1);
        legend.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", lowColor)
          .attr("stop-opacity", 1);
        key.append("rect")
          .attr("width", w * scale)
          .attr("height", h)
          .style("fill", "url(#gradient)")
          .attr("transform", "translate(0,10)");
        key.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + (w * scale + 1) + ",10)")
          .call(d3.axisRight(y).tickFormat(d3.format("~s")));
      });
    },
  }
};
</script>

<style>
.house-price {
  font-size: 15px;
}

.house-price g {
  font-size: 15px;
}

.house-price-line-chart .line {
  fill: none;
  stroke: steelblue;
  stroke-width: 1.5px;
}

/* Legend Font Style */
#map {
	background-color: #ffffff;
}

#map .state{
  fill: none;
  stroke: #a9a9a9;
  stroke-width: 1;
}

#map .state:hover{
  fill-opacity:0.5;
}

#tooltip {
  position: absolute;           
  text-align: center;         
  margin: 10px;              
  pointer-events: none;
  background: rgba(0,0,0,0.9);
  border: 1px solid grey;
  border-radius: 5px;
  font-size: 14px;
  width: auto;
  padding: 4px;
  color: white;
  opacity: 0;
}

#tooltip h4 {
  margin: 0;
  font-size: 15px;
}
</style>