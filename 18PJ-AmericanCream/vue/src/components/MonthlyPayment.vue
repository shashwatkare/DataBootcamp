<template>
  <b-container>
    <b-row align-v="center">
      <div id="trace-high"></div>
      <div id="trace-low"></div>
    </b-row>
  </b-container>
</template>

<script>
import * as d3 from "d3";
import Plotly from "plotly.js";

export default {
  name: "monthly-payment",

  data() {
    return {
      monthlyPaymentData: []
    };
  },

  mounted() {
    this.getMonthlyPaymentData();
  },

  watch: {
    monthlyPaymentData() {
      this.drawMonthlyPayment();
    }
  },

  methods: {
    getMonthlyPaymentData() {
      const that = this;
      const defaultUrl = `http://127.0.0.1:5000/monthly_payment_high_and_low_groups`;
      d3.json(defaultUrl).then(response => {
        that.monthlyPaymentData = response;
      });
    },
    drawMonthlyPayment() {
      const trace_high = [
        {
          x: this.monthlyPaymentData.high10.map(d => d.state),
          y: this.monthlyPaymentData.high10.map(d => d.avgmonthlypay),
          name: "Top 10",
          error_y: {
            type: "data",
            symmetric: false,
            array: this.monthlyPaymentData.high10.map(d => d.highbound),
            arrayminus: this.monthlyPaymentData.high10.map(d => d.lowbound)
          },
          type: "bar",
          marker: {
            color: "#C0334D"
          }
        }
      ];
      const layout_high = {
        title: "Top 10 of Monthly Payment",
        autosize: false,
        width: 550,
        height: 400,
        xaxis: {
          title: "States",
          titlefont: {
            family: "Arial, sans-serif",
            size: 18
          },
          tickangle: 20,
          tickfont: {
            family: "Arial, sans-serif",
            size: 15
          }
        },
        yaxis: {
          title: "Monthly Payment (US dollar)",
          titlefont: {
            family: "Arial, sans-serif",
            size: 18
          },
          tickangle: "auto",
          tickfont: {
            family: "Arial, sans-serif",
            size: 14
          }
        }
      };

      Plotly.newPlot("trace-high", trace_high, layout_high);
      const trace_low = [
        {
          x: this.monthlyPaymentData.low10.map(d => d.state),
          y: this.monthlyPaymentData.low10.map(d => d.avgmonthlypay),
          name: "Bottom 10",
          error_y: {
            type: "data",
            symmetric: false,
            array: this.monthlyPaymentData.low10.map(d => d.highbound),
            arrayminus: this.monthlyPaymentData.low10.map(d => d.lowbound)
          },
          type: "bar",
          marker: {
            color: "#0444BF"
          }
        }
      ];

      const layout_low = {
        title: "Bottom 10 of Monthly Payment",
        autosize: false,
        width: 550,
        height: 400,
        xaxis: {
          title: "States",
          titlefont: {
            family: "Arial, sans-serif",
            size: 18
          },
          tickangle: 20,
          tickfont: {
            family: "Arial, sans-serif",
            size: 14
          }
        },
        yaxis: {
          title: "Monthly Payment (US dollar)",
          titlefont: {
            family: "Arial, sans-serif",
            size: 18
          },
          tickangle: "auto",
          tickfont: {
            family: "Arial, sans-serif",
            size: 15
          }
        }
      };
      Plotly.newPlot("trace-low", trace_low, layout_low);
    }
  }
};
</script>
