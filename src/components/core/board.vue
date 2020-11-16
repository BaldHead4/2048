<template>
  <div class="board">
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
    <grid v-for="block in blocks" :block="block" :key="block.id" />
  </div>
</template>

<script lang="ts">
import { ref, reactive } from "vue";
import grid from "./grid.vue";

interface block {
  position: {
    x: number;
    y: number;
  };
  merged: boolean;
  status: number;
  id: number;
}

export default {
  components: { grid },
  setup() {
    const blocks = ref<block[]>([]);
    function createBlock(x: number, y: number, status: number) {
      blocks.value.push({
        status,
        position: { x, y },
        merged: false,
        id: blocks.value.length,
      });
    }

    createBlock(
      //   Math.floor(Math.random() * 4),
      //   Math.floor(Math.random() * 4),
      1,
      3,
      32
    );

    setTimeout(() => {
      blocks.value = [
        {
          position: {
            x: 3,
            y: 3,
          },
          merged: false,
          status: 64,
          id: 0,
        },
      ];
    }, 1000);

    return {
      blocks,
    };
  },
};
</script>

<style lang="scss" scoped>
$boardSize: 500px;
$gridSize: 106.25px;
$gap: 15px;

.board {
  //   box-sizing: border-box;
  padding-top: $gap;
  background: #BBADA0;
  position: relative;
  margin: 0 auto;
  border-radius: 6px;
  width: $boardSize;
  height: $boardSize;

  > .row {
    margin-bottom: $gap;
    display: block;

    :first-child {
      margin-left: 0 !important;
    }

    .cell {
      background: rgba(238, 228, 218, 0.35);
      height: $gridSize;
      width: $gridSize;
      display: inline-block;
      margin-left: $gap;
      border-radius: 3px;
    }
  }
}
</style>