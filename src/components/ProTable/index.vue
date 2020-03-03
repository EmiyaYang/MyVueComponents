<template>
  <a-spin :spinning="loading" @click="open = false">
    <section class="toolbar">
      <slot name="toolbar"></slot>

      <a-button
        v-if="ifHasExpanded && !accordion"
        class="toolbar__expand"
        @click="handleExpandAll"
      >
        {{ ifAllExpanded ? "全部收起" : "全部展开" }}
      </a-button>

      <section class="toolbar__select" v-if="columnOpts.length">
        <a-button @click.stop="open = !open">
          显示设置
          <a-icon type="down" />
        </a-button>

        <a-select
          :open="open"
          class="toolbar__select__raw"
          mode="multiple"
          placeholder="选择要显示的列"
          :dropdownRender="dropdownRender"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
        />
      </section>
    </section>

    <a-table
      :rowKey="rowKey"
      class="protable ant-table-notripped"
      :dataSource="computedDataSource"
      :columns="filteredColumns"
      :expandIcon="getExpandIcon"
      :expandedRowKeys="expandedRowKeys"
      :pagination="pagination"
      :rowClassName="getRowClassName"
      :childrenColumnName="childrenColumnName"
      @expandedRowsChange="handleExpandedRowsChange"
      @expand="handleExpand"
      @change="handleChange"
      v-on="$listeners"
      v-bind="$attrs"
    >
      <template
        v-for="{ renderer } in computedColumns"
        #[renderer]="value, row"
      >
        <slot :name="renderer" :value="value" :row="row">
          {{ value }}
        </slot>
      </template>

      <div
        slot="filterDropdown"
        slot-scope="{
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          column
        }"
        style="padding: 8px"
      >
        <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`搜索 ${column.title || column.dataIndex}`"
          :value="selectedKeys[0]"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm)"
          style="width: 188px; margin-bottom: 8px; display: block;"
        />
        <a-button
          type="primary"
          @click="() => handleSearch(selectedKeys, confirm)"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
          >搜索</a-button
        >
        <a-button
          @click="() => handleReset(clearFilters)"
          size="small"
          style="width: 90px"
          >重置</a-button
        >
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
      <template slot="_filter" slot-scope="text">
        <span v-if="searchText">
          <template
            v-for="(fragment, i) in text
              .toString()
              .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
          >
            <mark
              v-if="fragment.toLowerCase() === searchText.toLowerCase()"
              :key="i"
              class="highlight"
              >{{ fragment }}</mark
            >
            <template v-else>{{ fragment }}</template>
          </template>
        </span>
        <template v-else>{{ text }}</template>
      </template>

      <template v-if="ifHasExpanded" #expandedRowRender="value">
        <slot name="expandedRowRender" :value="value"></slot>
      </template>
    </a-table>

    <slot />
  </a-spin>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

export default {
  props: {
    // 规定 rowKey 的值必须为 String
    rowKey: {
      type: String,
      default: "key"
    },
    loading: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    dataSource: {
      data: Array,
      default: () => []
    },
    // 指定子节点列表的键名
    childrenKey: {
      type: String,
      default: "embedChildren"
    },
    childrenColumnName: {
      type: String,
      default: "children"
    },
    // 是否展开加载
    expandLoad: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: [Boolean, Object],
      default: true
    },
    rowClassName: {
      type: [Function, null],
      default: null
    },
    // 是否开启手风琴效果
    accordion: {
      type: Boolean,
      default: false
    },
    // 是否允许展开空节点
    allowExpandEmpty: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchText: "",
      searchInput: null,
      computedColumns: [],
      filteredColumns: [],
      // 展开项的 key 集合
      expandedRowKeys: [],
      allRowKeys: [],
      // 列控制选择项
      columnOpts: [],
      // 列控制已选项
      selectedColumns: [],
      // 是否显示列控制的下拉列表
      open: false,
      currentPage: 1,
      pageChangeFlag: false,
      filteredValue: {},
      // FIXME:
      filteredIndexmap: {}
    };
  },
  computed: {
    pageSize() {
      return this.pagination?.pageSize || 10;
    },
    computedPagination() {
      if (!this.pagination) return false;

      return this.pagination;
    },
    ifAllExpanded() {
      const a1 = [...this.expandedRowKeys].sort((a, b) => (a > b ? 1 : -1));

      const a2 = [...this.allRowKeys].sort((a, b) => (a > b ? 1 : -1));

      return isEqual(a1, a2);
    },
    ifHasExpanded() {
      return (
        this.$scopedSlots &&
        this.$scopedSlots.expandedRowRender &&
        this.allRowKeys.length > 0
      );
    },
    computedDataSource() {
      return JSON.parse(JSON.stringify(this.dataSource));
    }
  },
  watch: {
    columns: {
      immediate: true,
      handler(columns) {
        this.initColumns();

        // 列控制相关
        this.columnOpts = [];
        this.selectedColumns = [];

        columns.forEach(item => {
          const { title, dataIndex, selectable } = item;

          // 生成列控制选择框
          if (selectable) {
            this.columnOpts.push({ title, dataIndex });
            this.selectedColumns.push(dataIndex);
          }
        });

        this.selectedColumns = [...this.selectedColumns];
      }
    },
    selectedColumns: {
      immediate: true,
      deep: true,
      handler(selectedColumns) {
        this.filteredColumns = this.computedColumns.filter(
          ({ dataIndex, selectable }) =>
            !selectable || selectedColumns.includes(dataIndex)
        );
      }
    },
    dataSource: {
      immediate: true,
      handler() {
        this.init();
      }
    }
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.updateAllRowKeys();
        this.expandedRowKeys = [];
      });
    },
    handleExpand(expanded, row) {
      this.$emit("expand", expanded, row);
    },
    dropdownRender() {
      const options = this.columnOpts.map(item => ({
        label: item.title,
        value: item.dataIndex
      }));

      return (
        <section
          onClick:stop={e => {
            e.stopPropagation();
          }}
        >
          <a-checkbox-group
            class="protable__dropdown"
            options={options}
            vModel={this.selectedColumns}
          />
        </section>
      );
    },
    getRowClassName(record, index) {
      const rowKey = record[this.rowKey];

      const className =
        (this.rowClassName && this.rowClassName(record, index)) || "";

      return (
        (this.expandedRowKeys.includes(rowKey)
          ? "ant-row--open"
          : "ant-row--close") +
        " " +
        className
      );
    },
    updateAllRowKeys(dataSource = this.dataSource) {
      // FIXME: 无法正确处理默认排序，筛选的情形

      this.allRowKeys = dataSource
        .slice(
          (this.currentPage - 1) * this.pageSize,
          this.currentPage * this.pageSize
        )
        .filter(item => item[this.childrenKey]?.length > 0)
        .map(item => item[this.rowKey]);
    },
    getExpandIcon({ expanded, record, onExpand }) {
      // 表格内嵌
      if (
        (record[this.childrenKey]?.length && this.ifHasExpanded) ||
        this.allowExpandEmpty
      ) {
        return (
          <a-icon
            type={expanded ? "minus-square" : "plus-square"}
            {...{
              on: {
                click: onExpand.bind(this, record)
              }
            }}
          />
        );
      }

      // 树状展开
      if (record[this.childrenColumnName]) {
        if (this.expandLoad || record[this.childrenColumnName].length > 0) {
          return (
            <a-icon
              type={expanded ? "minus-square" : "plus-square"}
              {...{
                on: {
                  click: onExpand.bind(this, record)
                }
              }}
            />
          );
        }
      }

      return "";
    },
    // 分页、排序、筛选时触发
    handleChange({ current }, filters, sorter, { currentDataSource }) {
      // 翻页时如果展开项发生变化， 则后续会触发 handleExpandedRowsChange
      // 使得 expandedRowKeys 无法被清空，此处设置一个开关变量 pageChangeFlag
      if (this.currentPage !== current) {
        this.pageChangeFlag = true;
        this.currentPage = current;
      }
      this.expandedRowKeys = [];

      this.$nextTick(() => {
        this.updateAllRowKeys(currentDataSource);
      });

      // 处理限定过滤
      if (Object.keys(this.filteredValue).length) {
        Object.assign(this.filteredValue, filters);

        Object.keys(filters).forEach(key => {
          const index = this.filteredIndexmap[key];

          this.computedColumns[index].filteredValue = this.filteredValue[key];
        });
      }

      this.$emit("change", ...Array.from(arguments));
    },
    // 展开时更新 expandedRowKeys
    handleExpandedRowsChange(val) {
      // 翻页不触发展开事件
      if (this.pageChangeFlag) {
        this.pageChangeFlag = false;
        return;
      }

      this.expandedRowKeys = this.accordion ? [val[val.length - 1]] : val;
    },
    handleExpandAll() {
      this.expandedRowKeys = this.ifAllExpanded ? [] : this.allRowKeys;
    },
    initColumns() {
      const columns = cloneDeep(this.columns);

      this.computedColumns = columns.map((item, index) => {
        const { dataIndex } = item;

        if (item.scopedSlots && item.scopedSlots.customRender) {
          item.renderer = item.scopedSlots.customRender;
        }

        // TODO: 简化格式化方式
        if (item.formatter) {
          item.customRender = (text, record, index) => {
            return {
              children: item.formatter(text, record, index),
              attrs: {}
            };
          };
        }

        if (item.sort) {
          if (!item.sorter) {
            // 配置默认的排序方法
            item.sorter = (a, b) => {
              if (typeof a[dataIndex] === "number")
                return a[dataIndex] - b[dataIndex];

              return a[dataIndex] > b[dataIndex] ? 1 : -1;
            };
          }
        }

        // 有限项过滤
        if (item.filters) {
          // 提供默认的过滤方法
          if (!item.onFilter) {
            // const options = item.filters?.map(item => item.value) || [];

            this.filteredValue[item.dataIndex] = [];
            this.filteredIndexmap[item.dataIndex] = index;
            item.filteredValue = this.filteredValue[item.dataIndex];

            // eslint-disable-next-line no-unused-vars
            item.onFilter = (value, record) => {
              return record[item.dataIndex] == value;
            };
          }
        }

        // 关键词过滤
        if (item.filter) {
          item.scopedSlots = Object.assign({}, item.scopedSlots, {
            filterDropdown: "filterDropdown",
            filterIcon: "filterIcon",
            customRender: "_filter"
          });

          // 自动聚焦于搜索框
          item.onFilterDropdownVisibleChange = visible => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              }, 0);
            }
          };

          // 提供默认的过滤方法
          if (!item.onFilter) {
            item.onFilter = (value, record) =>
              record[item.dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase());
          }
        }

        return item;
      });
    },
    handleSearch(selectedKeys, confirm) {
      confirm();
      this.searchText = selectedKeys[0];
    },

    handleReset(clearFilters) {
      clearFilters();
      this.searchText = "";
    }
  }
};
</script>
