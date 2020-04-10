import "./index.less";

// eslint-disable-next-line no-unused-vars
import {
  refreshByDeconstruct,
  isPrimitive,
  getKeyLen,
  renameKeyInObj
} from "./util";

export default {
  name: "JsonEditor",
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: {
      type: [Object, Array, String, Boolean, Number],
      default: ""
    },
    jsonKey: {
      type: [String, Number],
      default: null
    },
    // 初始折叠状态
    defaultCollapsed: {
      type: Boolean,
      default: false
    },
    // 判断是否为最后一个键
    isLast: {
      type: Boolean,
      default: true
    },
    // 起始行号
    startLineNo: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      collapsed: this.defaultCollapsed,
      labelEditing: false,
      valueEditable: false,
      valueEditing: false,
      tmpLabel: "",
      tmpValue: ""
    };
  },
  computed: {
    // 获取六种类型
    type() {
      if (Array.isArray(this.value)) return "array";

      if (this.value === null) return "null";

      return typeof this.value;
    },
    isPrimitive() {
      return isPrimitive(this.value);
    },
    isArray() {
      return this.type === "array";
    },
    isEmpty() {
      if (this.isPrimitive) return true;

      return Object.keys(this.value).length === 0;
    },
    parens() {
      if (this.isPrimitive) return [];

      if (this.isArray) return ["[", "]"];

      return ["{", "}"];
    }
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },

    renderLabel() {
      if (this.labelEditing) {
        return (
          <a-textarea
            ref="LabelEditor"
            class={["json-item-label", "json-item-label--editable"]}
            vModel={this.tmpLabel}
            autoSize={{ minRows: 1, maxRows: 5 }}
            onBlur={() => {
              this.labelEditing = false;

              this.tmpLabel != this.jsonKey &&
                this.$emit("update:jsonKey", this.tmpLabel);
            }}
          />
        );
      }

      let expandIcon = "";

      if (!this.isEmpty) {
        expandIcon = this.collapsed ? (
          <a-icon
            class="json-item-label__icon"
            type="caret-right"
            onClick={this.toggleCollapsed}
          />
        ) : (
          <a-icon
            class="json-item-label__icon"
            type="caret-down"
            onClick={this.toggleCollapsed}
          />
        );
      }

      let jsonKey = this.jsonKey;

      // 数组子项不展示 jsonKey
      this.$parent.isArray && (jsonKey = null);

      return (
        <span class="json-item-label">
          <span style="display: flex; align-items: center;">
            {expandIcon}
            {jsonKey != undefined ? (
              <span>
                <span
                  class="json-item-label__str"
                  onClick={() => {
                    this.labelEditing = true;
                    this.tmpLabel = this.jsonKey;

                    this.$nextTick(() => {
                      this.$refs.LabelEditor.$el.focus();
                      // this.$refs.LabelEditor.$el.children[0].focus();
                    });
                  }}
                >
                  {jsonKey}
                </span>
                <span class="json-item-label__colon">:</span>
              </span>
            ) : (
              <span style="width: 1px; display: inline-block;">&nbsp;</span>
            )}

            {!this.isEmpty && !this.isPrimitive ? (
              <span class="json-item-label__paren">{this.parens[0]}</span>
            ) : null}

            <span class="json-item-label__no"> {this.startLineNo} </span>
          </span>
        </span>
      );
    },

    renderValue() {
      if (this.valueEditing) {
        return (
          <a-textarea
            ref="ValueEditor"
            class={["json-item-value", "json-item-value--editable"]}
            vModel={this.tmpValue}
            autoSize={{ minRows: 1, maxRows: 5 }}
            onBlur={() => {
              this.valueEditing = false;

              // https://www.quora.com/How-can-I-parse-unquoted-JSON-with-JavaScript
              // const data = eval('(' + this.tmpValue + ')');

              try {
                const data = JSON.parse(this.tmpValue);

                if (JSON.stringify(data) === JSON.stringify(this.value)) {
                  return;
                }

                this.$emit("change", data);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn(e);
                // TODO: 更好的错误提示
              }
            }}
          />
        );
      }

      const classes = [
        "json-item-value",
        `json-item-value--${this.type}`,
        `json-item-value--${this.collapsed ? "collapsed" : "open"}`,
        this.isPrimitive || this.isEmpty || this.collapsed
          ? "json-item-value--inline"
          : "json-item-value--block"
      ];

      // 处理原始值
      if (this.isPrimitive) {
        const data =
          typeof this.value === "string"
            ? `"${this.value}"`
            : this.value?.toString() || this.type;

        return <span class={classes}>{data}</span>;
      }

      // 处理空索引值
      if (this.isEmpty)
        return <span class={classes}>{this.parens.join("")}</span>;

      const arr = Object.keys(this.value);

      let pre = 1;

      return (
        <section class={classes}>
          {this.collapsed ? (
            <a-icon
              class="json-item-value__ellipsis"
              type="small-dash"
              onClick={this.toggleCollapsed}
            />
          ) : (
            arr.map((key, index) => {
              const subData = this.value[key];

              const startLineNo = this.startLineNo + index + pre;

              // primitive 返回 0
              pre += getKeyLen(subData);

              return (
                <JsonEditor
                  value={subData}
                  key={key}
                  jsonKey={key}
                  isLast={index === arr.length - 1}
                  startLineNo={startLineNo}
                  {...{
                    on: {
                      change: value => {
                        this.value[key] = value;

                        this.$emit("change", refreshByDeconstruct(this.value));
                      },
                      // 仅处理对象
                      "update:jsonKey": newKey => {
                        this.$emit(
                          "change",
                          renameKeyInObj(this.value, key, newKey)
                        );
                      }
                    }
                  }}
                />
              );
            })
          )}
        </section>
      );
    },

    renderLastLine() {
      return (
        <section
          class={[
            "json-item-last",
            this.isEmpty || this.isPrimitive || this.collapsed
              ? "json-item-last--inline"
              : ""
          ]}
        >
          {/* {!this.isEmpty && !this.isPrimitive ? (
            <span class="json-item-last__no">
              {this.startLineNo + getKeyLen(this.value) + 1}
            </span>
          ) : null} */}

          <span class="json-item-last__paren">
            {!this.isEmpty && !this.isPrimitive ? this.parens[1] : null}
          </span>

          {this.isLast ? null : <span>,</span>}
          <a-icon
            class="json-item-last__icon"
            type="edit"
            hidden={!this.valueEditable}
            onClick={() => {
              this.valueEditing = true;

              this.tmpValue = JSON.stringify(this.value, null, 4);

              this.$nextTick(() => {
                this.$refs.ValueEditor.$el.focus();
              });
            }}
          />
        </section>
      );
    }
  },
  render() {
    const listeners = {
      mouseenter: e => {
        e.stopPropagation();
        this.valueEditable = true;
      },
      mouseleave: e => {
        e.stopPropagation();
        this.valueEditable = false;
      }
    };

    return (
      <section
        class={[
          this.jsonKey ? "" : "json-editor-container",
          "json-item",
          this.valueEditing ? "json-item--value-editing" : "",
          this.isEmpty || this.isPrimitive || this.collapsed
            ? "json-item--inline"
            : "json-item--block"
        ]}
        {...{ on: listeners }}
      >
        {this.renderLabel()}
        {this.renderValue()}
        {this.renderLastLine()}
      </section>
    );
  }
};
