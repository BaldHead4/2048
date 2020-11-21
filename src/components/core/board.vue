<template>
  <div :class="`board ${clientWidth >= width ? 'desktop' : 'mobile'}`">
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
  },
  setup() {
    const clientWidth = inject("clientWidth");

    return {
      clientWidth,
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
}
</style>