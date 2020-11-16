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
$desktopBoardSize: 500px;
$mobileBoardSize: 280px;
$desktopGridSize: 106.25px;
$mobileGridSize: 58px;
$desktopGap: 15px;
$mobileGap: 10px;

.board {
  background: #BBADA0;
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

@media screen and (max-width: 500px) {
  .board {
    padding-top: $mobileGap;
    width: $mobileBoardSize;
    height: $mobileBoardSize;

    > .row {
      margin-bottom: $mobileGap;

      .cell {
        height: $mobileGridSize;
        width: $mobileGridSize;
        margin-left: $mobileGap;
      }
    }
  }
}

@media screen and (min-width: 501px) {
  .board {
    padding-top: $desktopGap;
    width: $desktopBoardSize;
    height: $desktopBoardSize;

    > .row {
      margin-bottom: $desktopGap;

      .cell {
        height: $desktopGridSize;
        width: $desktopGridSize;
        margin-left: $desktopGap;
      }
    }
  }
}
</style>