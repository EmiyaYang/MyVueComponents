<template>
  <a-modal
    ref="modal"
    v-bind="$attrs"
    v-on="$listeners"
    :visible="visible"
    :width="width"
    :wrap-class-name="wrapClassName"
    class="promodal"
    :class="{ 'promodal--fullscreen': fullscreen, [modalTag]: true }"
    :style="{ left, height }"
    :footer="null"
    :mask-closable="false"
    :destroyOnClose="destroyOnClose"
    @change="$emit('change', val)"
  >
    <section class="promodal-header">
      <section class="promodal-header__title">
        <slot name="title" />
      </section>

      <a-icon
        class="promodal-header__zoom"
        :type="fullscreen ? 'fullscreen-exit' : 'fullscreen'"
        @click="handleFullscreen"
      />

      <a-icon
        class="promodal-header__close"
        type="close"
        @click="$emit('change', false)"
      />
    </section>

    <a-spin
      class="promodal__result"
      :style="mainStyle"
      :spinning="loading"
      size="large"
      @mousedown.stop=""
    >
      <slot />
    </a-spin>
    <slot name="footer"></slot>
  </a-modal>
</template>

<script>
export default {
  name: "ProModal",
  model: {
    prop: "visible",
    event: "change"
  },
  props: {
    width: {
      type: [String, Number],
      default: "85%"
    },
    height: {
      type: [String, Number],
      default: "85%"
    },
    wrapClassName: {
      type: String,
      default: "promodal-wrapper"
    },
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    dragable: {
      type: Boolean,
      default: true
    },
    // 弹窗主体内容的样式
    mainStyle: {
      type: [String, Object],
      default: () => ({})
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fullscreen: false,
      /** UI control logic */
      el: null,
      preX: 0,
      preY: 0,
      initX: 0,
      initY: 0,
      hash: ""
    };
  },
  computed: {
    modalTag() {
      return `promodal-${this.hash}`;
    },
    left() {
      const width =
        typeof this.width === "number" ? `${this.width}px` : this.width;

      // REVIEW: 多了个冒号设置失败
      // return `calc(50% - ${width} / 2);`;
      return `calc(50% - ${width} / 2)`;
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.hash = Date.now().toString();

          this.$nextTick(this.onShow);
        } else {
          this.onHide();
        }
      }
    }
  },
  beforeDestroy() {
    this.el = null;
  },
  methods: {
    onShow() {
      this.preX = 0;
      this.preY = 0;
      this.fullscreen = false;

      const modal = document.querySelector(`.${this.modalTag}`);

      if (this.dragable) modal.onmousedown = this.handleMousedown;

      this.el = modal;

      this.$nextTick();

      this.initX = this.el.style.left;
      this.initY = this.el.style.top;
    },
    onHide() {
      if (this.el) {
        // 等待退出动画结束
        setTimeout(() => {
          this.el.style.left = this.initX;
          this.el.style.top = this.initY;
        }, 200);
      }
    },
    handleFullscreen() {
      this.fullscreen = !this.fullscreen;

      if (this.fullscreen) {
        this.preX = this.el.style.left;
        this.preY = this.el.style.top;

        this.el.style.left = 0;
        this.el.style.top = 0;
      } else {
        this.el.style.left = this.preX;
        this.el.style.top = this.preY;
      }

      // TODO: 兼容性处理
      this.$nextTick(() => {
        window.dispatchEvent(new Event("resize"));
      });
      this.$emit("fullscreen", this.fullscreen);
    },
    handleMousedown(e) {
      if (!this.dragable) return;

      const disX = e.clientX - this.el.offsetLeft;
      const disY = e.clientY - this.el.offsetTop;

      document.onmousemove = e => {
        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX;
        const t = e.clientY - disY;
        // 移动当前元素
        this.el.style.left = `${l}px`;
        this.el.style.top = `${t}px`;
      };
      document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }
  }
};
</script>

<style lang="less">
@modalWidth: 85%;
@modalHeight: 80%;
@modalHeaderHeight: 40px;

.promodal-wrapper {
  overflow: hidden;
}

.promodal {
  // height: @modalHeight;
  margin: unset;
  // width: @modalWidth !important;
  // left: calc(50% - @modalWidth / 2);

  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    height: 100% !important;
    width: 100% !important;
    padding: 0;

    .ant-modal-content {
      height: 100% !important;
      width: 100% !important;
    }
  }

  .ant-spin-container {
    height: 100%;
  }

  .ant-modal-content {
    width: 100%;
    height: 100%;
  }

  // 由于Antd组件的header无法定制, 故隐藏默认的 header
  .ant-modal-header,
  .ant-modal-close {
    display: none;
  }

  .ant-modal-body {
    height: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  &-header {
    cursor: pointer;
    height: @modalHeaderHeight;
    line-height: @modalHeaderHeight;
    font-size: 20px;
    padding: 10px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;

    background-color: @background-dark;
    color: white;

    display: flex;
    flex-wrap: nowrap;
    align-items: center;

    &__title {
      max-width: calc(100% - @modalHeaderHeight);
      overflow: hidden;
      font-size: 14px;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: bottom;

      flex-grow: 1;
      display: inline-block;
    }

    &__zoom,
    &__close {
      cursor: pointer;
    }

    &__zoom {
      margin-right: 0.5em;
    }
  }

  &__result {
    // height: calc(100% - @modalHeaderHeight);

    flex-grow: 1;

    width: 100%;
    // overflow: hidden;
    overflow: auto;
    // overflow-y: scroll;
    // overflow-x: hidden;
    padding: 0;
  }
}
</style>
