<template>
  <div id="app">
    <h1>HelloWorld</h1>

    <HelloWorld />

    <h1>ProTable</h1>
    <ProTable :columns="columns" :dataSource="dataSource" />

    <h1>ChartsPane</h1>
    <ChartsPane />
  </div>
</template>

<script>
import ProTable from "../lib/ProTable";
import HelloWorld from "../lib/HelloWorld";
import ChartsPane from "../lib/ChartsPane";

export default {
  name: "App",
  components: {
    HelloWorld,
    ProTable,
    ChartsPane
  },
  data() {
    return {
      columns: [
        {
          title: " ",
          customRender: (value, row, index) => <span>{index + 1}</span>
        },
        {
          title: "频道规模",
          dataIndex: "a"
        },
        {
          title: "同时在线人数",
          dataIndex: "b"
        },
        {
          title: "占比",
          dataIndex: "c"
        }
      ],
      dataSource: [
        {
          key: 1,
          a: 2,
          b: 36564,
          c: 4
        },
        {
          key: 2,
          a: 2,
          b: 3,
          c: 4
        },
        {
          key: 3,
          a: 2,
          b: 3,
          c: 4
        }
      ]
    };
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
