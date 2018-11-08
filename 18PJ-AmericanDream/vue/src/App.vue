<template>
  <div id="app">
    <b-navbar toggleable="md" type="light" variant="light" :sticky="true">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand href="#">American Dream</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item href="#" @click="showHousePrice">House Price</b-nav-item>
          <b-nav-item href="#" @click="showMonthlyPayment">Monthly Payment</b-nav-item>
          <b-nav-item href="#" @click="showOes">Occupation Employment Statistics</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    
    <b-container>
      <b-row>
        <HousePrice v-if="housePriceDisplay" />
        <MonthlyPayment v-if="monthlyPaymentDisplay" />
        <Oes v-if="oesDisplay" />
      </b-row>
    </b-container>
  </div>
</template>

<script>
import HousePrice from './components/HousePrice.vue';
import MonthlyPayment from './components/MonthlyPayment.vue';
import Oes from './components/OccupationEmploymentStatistics.vue';

export default {
  name: 'app',

  components: {
    HousePrice,
    MonthlyPayment,
    Oes,
  },

  data() {
    return {
      housePriceDisplay: true,
      monthlyPaymentDisplay: false,
      oesDisplay: false,
    };
  },

  methods: {
    showHousePrice() {
      this.housePriceDisplay = true;
      this.monthlyPaymentDisplay = false;
      this.oesDisplay = false;
    },
    showMonthlyPayment() {
      this.housePriceDisplay = false;
      this.monthlyPaymentDisplay = true;
      this.oesDisplay = false;
    },
    showOes() {
      this.housePriceDisplay = false;
      this.monthlyPaymentDisplay = false;
      this.oesDisplay = true;
    },
  },
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#house-price-section {
  margin-top: 32px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
