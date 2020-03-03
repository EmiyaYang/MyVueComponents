import echarts from "echarts";
import ECharts from "vue-echarts";

export default {
  props: {
    sharedAttrs: {
      default: () => ({}),
      type: Object
    },
    grid: {
      default: () => ({ md: 2, gutter: 10 }),
      type: Object
    },
    cardGrid: {
      default: null,
      type: Object
    },
    initOptionsGroup: {
      default: () => [],
      type: Array
    },
    extraInfos: {
      default: () => [],
      type: Array
    },
    // 是否开启图表联动
    connected: {
      default: false,
      type: Boolean
    },
    // 图表高度 px
    chartHeight: {
      default: "200px",
      type: String
    }
  },
  data() {
    return {
      hash: Date.now()
    };
  },
  computed: {
    groupId() {
      return `group-${this.hash}`;
    }
  },
  watch: {
    connected: {
      immediate: false,
      handler(connected) {
        this.toggleChartsConnection(connected);
      }
    }
  },
  created() {
    if (this.connected) {
      this.$nextTick(this.toggleChartsConnection);
    }
  },
  methods: {
    // 开启或关闭图表联动
    toggleChartsConnection(flag = true) {
      flag ? echarts.connect(this.groupId) : echarts.disconnect(this.groupId);
    },
    getChartRef(index) {
      return `chart-${index}`;
    },
    mergeOptions(options) {
      this.$refs.chart.mergeOptions(options);
    },
    /**
     * 对所有 vue-echart 实例传入选项进行 merge
     * 当 optionGroup 长度与 initOptionsGroup 不对齐时会对 initOptionsGroup 进行改变,
     * 在绑定时需要 .sync 进行修饰
     *
     * @param {*} optionsGroup
     */
    async massMergeOption(optionsGroup) {
      const offset = optionsGroup.length - this.initOptionsGroup.length;

      const notify = () => {
        optionsGroup.forEach((options, index) => {
          this.$refs[this.getChartRef(index)].mergeOptions(options);
        });
      };

      if (!offset) {
        notify();
        return;
      }

      const EVENT = "update:initOptionsGroup";

      if (offset > 0) {
        // 新增
        this.$emit(EVENT, [
          ...this.initOptionsGroup,
          ...new Array(offset).fill().map(Object)
        ]);
      } else {
        // 缩减
        this.$emit(
          EVENT,
          this.initOptionsGroup.slice(0, this.initOptionsGroup + offset)
        );
      }

      // $emit -> $on -> 渲染新增 chart -> notify
      this.$on(EVENT, this.$nextTick(notify));
    }
  },
  render() {
    this.hash = Date.now();

    let BODY_TAG = "section";
    const bodyAttrs = {};
    let BODY_ITEM_TAG = "section";
    let bodyItemAttrs = {};

    if (this.cardGrid) {
      const { gutter, left, center, right } = this.cardGrid;

      BODY_TAG = "a-row";
      bodyAttrs.gutter = gutter || 0;
      BODY_ITEM_TAG = "a-col";
      bodyItemAttrs = {
        left: left || {},
        center: center || {},
        right: right || {}
      };
    }

    return (
      <a-list
        class={{
          "charts-pane": true,
          "charts-pane--bordered": this.initOptionsGroup.length && this.bordered
        }}
        {...{
          attrs: {
            key: this.hash,
            "data-source": this.initOptionsGroup,
            grid: this.grid
          },
          scopedSlots: {
            renderItem: (item, index) => {
              const extra = this.extraInfos[index];

              return (
                <a-list-item class="charts-pane-item">
                  <a-card>
                    <template slot="title">
                      {this.$scopedSlots.title?.({
                        options: item,
                        index,
                        extra
                      })}
                    </template>

                    <BODY_TAG
                      class="charts-pane-item-body"
                      {...{ attrs: bodyAttrs }}
                    >
                      <BODY_ITEM_TAG
                        class="charts-pane-item-body__left"
                        {...{ attrs: bodyItemAttrs.left }}
                      >
                        {this.$scopedSlots.left?.({
                          options: item,
                          index,
                          extra
                        })}
                      </BODY_ITEM_TAG>

                      <BODY_ITEM_TAG
                        class="charts-pane-item-body__center"
                        {...{ attrs: bodyItemAttrs.center }}
                      >
                        <ECharts
                          style={{ height: this.chartHeight }}
                          ref={this.getChartRef(index)}
                          group={this.groupId}
                          class="charts-pane__list-item"
                          {...{
                            attrs: {
                              ...this.sharedAttrs,
                              key: this.hash + index,
                              options: item
                            },
                            nativeOn: {
                              mousemove: e =>
                                this.handleHover && this.handleHover(e, index)
                            }
                          }}
                        />
                      </BODY_ITEM_TAG>

                      <BODY_ITEM_TAG
                        class="charts-pane-item-body__right"
                        {...{ attrs: bodyItemAttrs.right }}
                      >
                        {this.$scopedSlots.right?.({
                          options: item,
                          index,
                          extra
                        })}
                      </BODY_ITEM_TAG>
                    </BODY_TAG>
                  </a-card>
                </a-list-item>
              );
            }
          }
        }}
      ></a-list>
    );
  }
};
