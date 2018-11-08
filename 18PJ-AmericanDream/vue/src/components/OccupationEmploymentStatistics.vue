<template>
  <b-container>
    <b-row>
      <b-col>
        <div id="oes"></div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "occupation-employment-statistics",

  data() {
    return {
      width: 860,
      height: 1010,
      margin: {
        bottom: 0,
        top: 40,
        left: 210,
        right: 0,
      },
      columnHeight: 1000, // height of columns
      columnWidth: 30, // width of columns
      columnMarginWidth: 150, // margin between two columns
      barMargin: 1, // margin between two bars
      barMinHeight: 10, // min height of each bars (including margin-top and margin-bottom)
      labelBegin: [-200, 40], // label begin
      labelEnd: [-50, 370], // label end
      labelPercent: [-10, 405], // percent label
      labelExtra: [-10, 440], // extra label
      header: ['State', 'Occupation'],
      colors: [
        "#FF99CC", "#66CCCC", "#FFCC33", "#6666CC", "#99CC33", "#99CCFF", "#999999", "#CC6699", "#0099CC", "#FF9900",
        "#FF99CC", "#66CCCC", "#FFCC33", "#6666CC", "#99CC33", "#99CCFF", "#999999", "#CC6699", "#0099CC", "#FF9900",
        "#FF99CC", "#66CCCC", "#FFCC33", "#6666CC", "#99CC33", "#99CCFF", "#999999", "#CC6699", "#0099CC", "#FF9900"
      ],
      oesData: [],
    };
  },

  mounted() {
    this.getOccAndWorkhourData();
  },

  watch: {
    oesData() {
      this.drawOes();
    },
  },

  methods: {
    getOccAndWorkhourData() {
      const that = this;
      const defaultUrl = `http://127.0.0.1:5000/occ_and_workhour`;
      d3.json(defaultUrl).then((response) => {
        that.oesData = response;
      });
    },
    drawOes() {
      const id = 'oesColumn';
      const processData = this.formatOesData();
      // d3.select("#oes").selectAll("*").remove();
      const svg = d3.select("#oes")
        .append("svg")
        .attr("width", this.width)
        .attr("height", (this.height + this.margin.bottom + this.margin.top))
        .append("g")
        .attr("id", id)
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      const viprocessData = this.visualize(processData, true);
      // draw left column
      this.drawPart(viprocessData, id, 0);
      // draw right column
      this.drawPart(viprocessData, id, 1);
      // draw lines between two columns
      this.drawEdges(viprocessData, id);
      // draw header title
      this.drawHeader(id);

      [0, 1].forEach(p => {
        d3.select("#" + id)
          .select(".part" + p)
          .select(".mainbars")
          .selectAll(".mainbar")
          .on("mouseover", (d, i) => this.selectSegment(processData, id, p, i))
          .on("mouseout", (d, i) => this.deSelectSegment(processData, id, p, i));
      });
    },
    drawPart(data, id, p) {
      d3.select("#" + id)
        .append("g")
        .attr("class", "part" + p)
        .attr("transform", "translate(" + (p * (this.columnMarginWidth + this.columnWidth)) + ",0)");
      d3.select("#" + id)
        .select(".part" + p)
        .append("g")
        .attr("class", "subbars");
      d3.select("#" + id)
        .select(".part" + p)
        .append("g")
        .attr("class", "mainbars");
      
      const mainbar = d3.select("#" + id)
        .select(".part" + p)
        .select(".mainbars")
        .selectAll(".mainbar")
        .data(data.mainBars[p])
        .enter()
        .append("g")
        .attr("class", "mainbar");
      mainbar.append("rect")
        .attr("class", "mainrect")
        .attr("x", 0)
        .attr("y", d => d.middle - d.height / 2)
        .attr("width", this.columnWidth)
        .attr("height", d => d.height)
        .style("shape-rendering", "auto")
        .style("fill-opacity", 0)
        .style("stroke-width", 0.5)
        .style("stroke", "black")
        .style("stroke-opacity", 0);
      mainbar.append("text")
        .attr("class", "barlabel")
        .attr("x", this.labelBegin[p])
        .attr("y", d => d.middle + 5)
        .text((d, i) => data.keys[p][i])
        .attr("text-anchor", "start");
      mainbar.append("text")
        .attr("class", "barvalue")
        .attr("x", this.labelEnd[p])
        .attr("y", d => d.middle + 5)
        .text((d, i) => d.value)
        .attr("text-anchor", "end");
      mainbar.append("text")
        .attr("class", "barpercent")
        .attr("x", this.labelPercent[p])
        .attr("y", d => d.middle + 5)
        .text((d, i) => "(" + Math.round(100 * d.percent) + "%)")
        .attr("text-anchor", "end")
        .style("fill", "grey");
      if (p === 1) {
        mainbar.append("text")
          .attr("class", "barextravalue")
          .attr("x", this.labelExtra[p])
          .attr("y", d => d.middle + 5)
          .text(d => d.extraMean)
          .attr("text-anchor", "end");
      }
      d3.select("#" + id)
        .select(".part" + p)
        .select(".subbars")
        .selectAll(".subbars")
        .data(data.subBars[p])
        .enter()
        .append("rect")
        .attr("class", "subbar")
        .attr("x", 0)
        .attr("y", d => d.y)
        .attr("width", this.columnWidth)
        .attr("height", d => d.h)
        .style("fill", d => this.colors[d.key2]);
    },
    drawEdges(data, id) {
      d3.select("#" + id)
        .append("g")
        .attr("class", "edges")
        .attr("transform", "translate(" + this.columnWidth + ",0)");
      d3.select("#" + id)
        .select(".edges")
        .selectAll(".edge")
        .data(data.edges)
        .enter()
        .append("polygon")
        .attr("class", "edge")
        .attr("points", this.edgePolygon)
        .style("fill", d => this.colors[d.key2])
        .style("opacity", 0.5)
        .each(function(d) {
          this._current = d;
        });
    },
    drawHeader(id) {
      [0, 1].forEach(d => {
        const h = d3.select("#" + id)
          .select(".part" + d)
          .append("g")
          .attr("class", "header");
        h.append("text")
          .text(this.header[d])
          .attr("x", (this.labelBegin[d] - 5))
          .attr("y", -5)
          .style("fill", "grey");
        h.append("text")
          .text("Count")
          .attr("x", (this.labelEnd[d] - 10))
          .attr("y", -5)
          .style("fill", "grey");
        if (d === 1) {
          h.append("text")
            .text("Work hours")
            .attr("x", (this.labelPercent[d] - 5))
            .attr("y", -5)
            .style("fill", "grey");
        }
        h.append("line")
          .attr("x1", this.labelBegin[d] - 10)
          .attr("y1", -2)
          .attr("x2", this.labelExtra[d] + 15)
          .attr("y2", -2)
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("shape-rendering", "crispEdges");
      });
    },
    selectSegment(data, id, m, s) {
      const newData = {
        keys: [],
        data: [],
      };
      newData.keys = data.keys.map(d => d);
      newData.data[m] = data.data[m].map(d => d);
      newData.data[1-m] = data.data[1-m].map(v => v.map((d, i) => (s === i ? d : 0)));
      newData.data[2] = data.data[2].map(v => v.map((d, i) => (s === i ? d : 0)));
      this.transition(this.visualize(newData, false), id);
      const selectedBar = d3.select("#" + id)
        .select(".part" + m)
        .select(".mainbars")
        .selectAll(".mainbar")
        .filter((d, i) => (i === s));
      selectedBar.select(".mainrect")
        .style("stroke-opacity", 1);
      selectedBar.select(".barlabel")
        .style("font-weight", "bold");
      selectedBar.select(".barvalue")
        .style("font-weight", "bold");
      selectedBar.select(".barpercent")
        .style("font-weight", "bold");
      selectedBar.select(".barextravalue")
        .style("font-weight", "bold");
    },
    deSelectSegment(data, id, m, s) {
      this.transition(this.visualize(data, true), id);
      const selectedBar = d3.select("#" + id)
        .select(".part" + m)
        .select(".mainbars")
        .selectAll(".mainbar")
        .filter((d, i) => i === s);
      selectedBar.select(".mainrect")
        .style("stroke-opacity", 0);
      selectedBar.select(".barlabel")
        .style("font-weight", "normal");
      selectedBar.select(".barvalue")
        .style("font-weight", "normal");
      selectedBar.select(".barpercent")
        .style("font-weight", "normal");
      selectedBar.select(".barextravalue")
        .style("font-weight", "normal");
    },
    /**
     * Support functions
     */
    formatOesData() {
      const processData = {};
      // Keys: sort by the first letter
      processData.keys = [
        // left column
        d3.set(this.oesData.map(d => d.state)).values().sort((a, b) => a < b ? -1 : a > b ? 1 : 0),
        // right column
        d3.set(this.oesData.map(d => d.occupation)).values().sort((a, b) => a < b ? -1 : a > b ? 1 : 0),
        // extra column
        d3.set(this.oesData.map(d => d.occupation)).values().sort((a, b) => a < b ? -1 : a > b ? 1 : 0),
      ];

      // Data matrix: create a matrix to store data
      processData.data = [
        processData.keys[0].map(d => processData.keys[1].map(v => 0)),
        processData.keys[1].map(d => processData.keys[0].map(v => 0)),
        processData.keys[2].map(d => processData.keys[0].map(v => 0)),
      ];

      // Data: input data according to p value
      this.oesData.forEach(d => {
        processData.data[0][processData.keys[0].indexOf(d.state)][processData.keys[1].indexOf(d.occupation)] = d['total_employment'];
        processData.data[1][processData.keys[1].indexOf(d.occupation)][processData.keys[0].indexOf(d.state)] = d['total_employment'];
        processData.data[2][processData.keys[2].indexOf(d.occupation)][processData.keys[0].indexOf(d.state)] = d['mean_work_hour'];
      })

      return processData;
    },
    visualize(data, all) {
      const that = this;
      const vis = {};
      // a(number), s(top), e(bottom), b(margin between bars), m(min height of each bars)
      vis.mainBars = [
        // left column
        this.calculatePosition(data.data[0].map(d => d3.sum(d)), [], all, 0, this.columnHeight, this.barMargin, this.barMinHeight),
        // right column
        this.calculatePosition(data.data[1].map(d => d3.sum(d)), data.data[2].map(d => d), all, 0, this.columnHeight, this.barMargin, this.barMinHeight),
      ];
      // matrix to store subBars
      vis.subBars = [[], []];
      vis.mainBars.slice(0,2).forEach((pos, p) => {
        pos.forEach((bar, i) => {
          this.calculatePosition(data.data[p][i], [], all, bar.y, bar.y + bar.h, 0, 0).forEach((sBar, j) => {
            sBar.key1 = (p === 0 ? i : j);
            sBar.key2 = (p === 0 ? j : i);
            vis.subBars[p].push(sBar);
          });
        });
      });
      vis.subBars.forEach((sBar) => {
        sBar.sort((a, b) => (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1 : 0));
      });
      // edges
      vis.edges = vis.subBars[0].map((p, i) => {
        return {
          key1: p.key1,
          key2: p.key2,
          y1: p.y,
          y2: vis.subBars[1][i].y,
          h1: p.h,
          h2: vis.subBars[1][i].h,
        };
      });
      vis.keys = data.keys;

      return vis;
    },
    // a(number), ae(extra number), s(top), e(bottom), b(margin between bars), m(min height of each bars)
    calculatePosition(a, ae, all, s, e, b, m) {
      const total = d3.sum(a);
			let sum = 0, neededHeight = 0, leftoverHeight = e - s - 2 * b * a.length;
			const ret = [];
			
			a.forEach((d, i) => {
        const v = {};
        v.percent = (total === 0 ? 0 : d / total); 
        v.value = d;
        v.height = Math.max(v.percent * (e - s - 2 * b * a.length), m);
        (v.height === m ? leftoverHeight -= m : neededHeight += v.height);
        v.extraMean = ae.length ? (all ? d3.format("d")(d3.mean(ae[i])) : d3.sum(ae[i])) : null;
        ret.push(v);
      });
			
			const scaleFact = leftoverHeight / Math.max(neededHeight, 1);
			ret.forEach((d) => { 
					d.percent = scaleFact * d.percent; 
					d.height = (d.height === m ? m : d.height * scaleFact);
					d.middle = sum + b + d.height / 2;
					d.y = s + d.middle - d.percent * (e - s - 2 * b * a.length) / 2;
					d.h = d.percent * (e - s - 2 * b * a.length);
					d.percent = (total === 0 ? 0 : d.value / total);
					sum += 2 * b + d.height;
      });

			return ret;
    },
    edgePolygon(d) {
      return [0, d.y1, this.columnMarginWidth, d.y2, this.columnMarginWidth, d.y2 + d.h2, 0, d.y1 + d.h1].join(" ");
    },
    transition(data, id) {
      this.transitionPart(data, id, 0);
      this.transitionPart(data, id, 1);
      this.transitionEdges(data, id);
    },
    transitionPart(data, id, p) {
      const mainbar = d3.select("#" + id)
        .select(".part" + p)
        .select(".mainbars")
        .selectAll(".mainbar")
        .data(data.mainBars[p]);
      mainbar.select(".mainrect")
        .transition()
        .duration(500)
        .attr("y", d => d.middle - d.height / 2)
        .attr("height", d => d.height);
      mainbar.select(".barlabel")
        .transition()
        .duration(500)
        .attr("y", d => d.middle + 5);
      mainbar.select(".barvalue")
        .transition()
        .duration(500)
        .attr("y", d => d.middle + 5)
        .text((d, i) => d.value);
      mainbar.select(".barpercent")
        .transition()
        .duration(500)
        .attr("y", d => d.middle + 5)
        .text((d, i) => "(" + Math.round(100 * d.percent) + "%)");
      if (p === 1) {
        mainbar.select(".barextravalue")
          .transition()
          .duration(500)
          .attr("y", d => d.middle + 5)
          .text(d => d.extraMean);
      }
      d3.select("#" + id)
        .select(".part" + p)
        .select(".subbars")
        .selectAll(".subbar")
        .data(data.subBars[p])
        .transition()
        .duration(500)
        .attr("y", d => d.y)
        .attr("height", d => d.h);
    },
    transitionEdges(data, id) {
      const that = this;
      // d3.select("#" + id)
      //   .append("g")
      //   .attr("class", "edges")
      //   .attr("transform", "translate(" + this.columnWidth + ",0)");
      d3.select("#" + id)
        .select(".edges")
        .selectAll(".edge")
        .data(data.edges)
        .transition()
        .duration(500)
        .attrTween("points", function(a) {
          const i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
            return that.edgePolygon(i(t));
          };
        })
        .style("opacity", d => (d.h1 === 0 || d.h2 === 0 ? 0 : 0.5));
    },
  },
};
</script>

<style>
svg text {
  font-size: 12px;
}

rect {
  shape-rendering: crispEdges;
}
</style>
