<template>
  <div id="app">
    <h1>HelloWorld</h1>

    <HelloWorld />

    <h1>AntTable</h1>

    <a-table :columns="columns" :dataSource="dataSource" :expandIcon="null" />

    <h1>ProTable</h1>
    <ProTable
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource"
      :preExpand="handlePreExpand"
      :expandedRowKeys.sync="expandedRowKeys"
      expandLoad
    />

    <!-- @expand="handleExpand" -->

    <h1>ChartsPane</h1>
    <ChartsPane />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
// import ProTable from "../lib/ProTable";
// import ChartsPane from "../lib/ChartsPane";
import ProTable from "./components/ProTable/index";
import ChartsPane from "./components/ChartsPane";
import "./components/style.js";

export default {
  name: "App",
  components: {
    HelloWorld,
    ProTable,
    ChartsPane
  },
  data() {
    return {
      loading: false,
      expandedRowKeys: [],
      columns: [
        {
          title: "频道规模",
          dataIndex: "a",
          selectable: true
        },
        {
          title: "同时在线人数",
          dataIndex: "b",
          selectable: true
        },
        {
          title: "占比",
          dataIndex: "c",
          selectable: true
        }
      ],
      dataSource: [
        {
          key: 1,
          a: 2,
          b: 36564,
          c: 4,
          children: []
        },
        {
          key: 2,
          a: 2,
          b: 3,
          c: 4,
          children: []
        },
        {
          key: 3,
          a: 2,
          b: 3,
          c: 4
        }
      ]
    };
  },
  created() {
    setTimeout(() => {
      this.dataSource = [...this.dataSource];
    }, 5000);
  },
  methods: {
    async handlePreExpand(expanded, row, index, next) {
      // 当前未展开, 将要展开
      if (!expanded && !this.dataSource[index].$loaded) {
        this.loading = true;
        const children = await this.getNestRowData();
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.loading = false;
        this.dataSource[index].children = children;
        this.dataSource[index].$loaded = true;
        this.dataSource = [...this.dataSource];
      }

      setTimeout(next);
    },

    async getNestRowData() {
      return new Array(5).fill(Date.now()).map((item, index) => ({
        key: item + "-" + index,
        a: 2,
        b: 3,
        c: 4
      }));
    }
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
