<template>
  <div id="app">
    <HelloWorld />
    <ProTable />
  </div>
</template>

<script>
import ProTable from "../dist/ProTable";
import HelloWorld from "../dist/HelloWorld";

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
