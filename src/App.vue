<template>
  <div id="app">
    <HelloWorld />
    <ProTable />
  </div>
</template>

<script>
import ProTable from "../lib/ProTable";
import HelloWorld from "../lib/HelloWorld";

export default {
  name: "App",
  components: {
    HelloWorld,
    ProTable
  }
};
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
