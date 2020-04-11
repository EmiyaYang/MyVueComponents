# @emiya/vue-components

[![NPM Version](https://img.shields.io/npm/v/@emiya/vue-component.svg)](https://www.npmjs.com/package/@emiya/vue-component)

## 适用性说明

本组件库没有用 webpack 进行打包, 仅适用于具备相应构建能力的 vue 栈项目, 且需要导入了 `ant-design-vue` 作为前置依赖.

## import

```bash
npm i @emiya/vue-component

or

yarn add @emiya/vue-components
```

```js
// 按需导入
import ProTable from "@emiya/vue-component/lib/ProTable";
import "@emiya/vue-component/lib/ProTable/style/index.css";

// 如需进行样式变量覆盖则请相应 less 文件
import "@emiya/vue-component/lib/ProTable/style/index.less";

// 导入全部组件
import { ProTable } from "@emiya/vue-component";

// 导入全部 less
import "@emiya/vue-component/style";

// 导入全部 css
import "@emiya/vue-component/style/css.js";
```

## 组件概览

**二次开发组件**

1. ProTable: 集成复杂功能的更强大的表格
2. ProModal: 支持拖拽, 全屏, 更好的交互性
3. ChartsPane: 群组式创建与管理图表

**新的组件**

1. JsonEditor: 提供友好的 json 数据展示与编辑能力
