<template>
  <div :class="`board ${clientWidth >= width ? 'desktop' : 'mobile'}`">
    <div v-if="gameover" class="gameover">
      <p>游戏结束!</p>
      <div class="lower">
        <a class="btn retry" @click="retry">再次尝试</a>
      </div>
    </div>
    <div class="row">
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
    </div>
    <div class="row">
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
    </div>
    <div class="row">
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
    </div>
    <div class="row">
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
      <div class="cell" />
    </div>
    <grid
      v-for="block in blocks"
      :block="block"
      :key="block.id"
      :width="width"
    />
  </div>
</template>

<script lang="ts">
import { ref, Ref, reactive, watch, inject } from "vue";
import grid from "./grid.vue";

export default {
  components: { grid },
  props: {
    blocks: Object,
    width: Number,
    gameover: Boolean,
  },
  setup(props, ctx) {
    const clientWidth = inject("clientWidth");

    function retry() {
      ctx.emit("retry");
    }

    return {
      clientWidth,
      retry,
    };
  },
};
</script>

<style lang="scss" scoped>
$desktopBoardSize: 500px;
$mobileBoardSize: 280px;
$desktopGridSize: 106.25px;
$mobileGridSize: 58px;
$desktopGap: 15px;
$mobileGap: 10px;

.board {
  box-sizing: border-box !important;
  background: #bbada0;
  position: relative;
  margin: 0 auto;
  border-radius: 6px;

  > .row {
    display: block;

    :first-child {
      margin-left: 0 !important;
    }

    .cell {
      background: rgba(238, 228, 218, 0.35);
      display: inline-block;
      border-radius: 3px;
    }
  }

  .gameover {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(238, 228, 218, 0.5);
    z-index: 100;
    text-align: center;
    animation-fill-mode: both;
  }
}

.mobile {
  padding-top: $mobileGap;
  width: $mobileBoardSize;
  height: $mobileBoardSize;

  > .row {
    margin-bottom: $mobileGap;
    height: $mobileGridSize;

    .cell {
      height: $mobileGridSize;
      width: $mobileGridSize;
      margin-left: $mobileGap;
    }
  }

  .gameover {
    p {
      font-size: 30px;
      height: 30px;
      line-height: 30px;
      margin-top: 90px;
    }
  }
}

.desktop {
  padding-top: $desktopGap;
  width: $desktopBoardSize;
  height: $desktopBoardSize;

  > .row {
    margin-bottom: $desktopGap;
    height: $desktopGridSize;

    .cell {
      height: $desktopGridSize;
      width: $desktopGridSize;
      margin-left: $desktopGap;
    }
  }

  .gameover {
    p {
      font-size: 60px;
      font-weight: 700;
      height: 60px;
      line-height: 60px;
      margin-top: 200px;
    }
  }
}

.btn {
  background: #8f7a66;
  border-radius: 3px;
  padding: 0 20px;
  text-decoration: none;
  color: #f9f6f2;
  height: 40px;
  line-height: 42px;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  transition: all ease-in-out 0.2s;

  &:hover {
    background: #574535;
  }
}
</style>