<template>
  <div
    v-show="block.visible"
    :class="`wrap ${clientWidth >= width ? 'desktop' : 'mobile'}`"
  >
    <div
      :class="`grid ${block.merged ? 'merged' : 'created'} status${
        block.status > 2048 ? 'Super' : block.status
      }`"
      :style="`
    left: ${
      clientWidth > width
        ? block.position.x * (106.25 + 15) + 15
        : block.position.x * (58 + 10) + 9
    }px;
    top: ${
      clientWidth > width
        ? block.position.y * (106.25 + 15) + 15
        : block.position.y * (58 + 10) + 10
    }px;
    `"
      :blockid="block.id"
    >
      {{ block.status ? block.status : "" }}
    </div>
  </div>
</template>

<script lang="ts">
import { inject, ref } from "vue";
export default {
  props: {
    block: Object,
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
$desktopGridSize: 106.25px;
$mobileGridSize: 58px;

.wrap {
  width: 0 !important;
  height: 0 !important;
  display: inline-block;
}

.grid {
  display: inline-block;
  position: absolute;
  transition: all 0.1s ease-in-out;
  text-align: center;
  font: {
    size: 45px;
    weight: 700;
  }
  color: #776e65;
  border-radius: 3px;
}

@keyframes merge {
  0% {
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    transform: scale(0);
  }
  50% {
    -webkit-transform: scale(1.2);
    -moz-transform: scale(1.2);
    transform: scale(1.2);
  }
  100% {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes create {
  0% {
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    transform: scale(0);
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    transform: scale(1);
    opacity: 1;
  }
}

.created {
  opacity: 0;
  animation: {
    name: create;
    duration: 0.2s;
    delay: 0.2s;
  }
  animation-fill-mode: forwards;
}

.merged {
  animation: {
    name: merge;
    duration: 0.2s;
  }
}

.status2 {
  background: #eee4da;
  box-shadow: 0 0 30px 10px transparent, inset 0 0 0 1px transparent;
}

.status4 {
  background: #ede0c8;
  box-shadow: 0 0 30px 10px transparent, inset 0 0 0 1px transparent;
}

.status8 {
  color: #f9f6f2;
  background: #f2b179;
}

.status16 {
  color: #f9f6f2;
  background: #f59563;
}

.status32 {
  color: #f9f6f2;
  background: #f67c5f;
}

.status64 {
  color: #f9f6f2;
  background: #f65e3b;
}

.status128 {
  color: #f9f6f2;
  background: #edcf72;
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.2381),
    inset 0 0 0 1px rgba(255, 255, 255, 0.14286);
  font-size: 45px;
}

.status256 {
  color: #f9f6f2;
  background: #edcc61;
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.31746),
    inset 0 0 0 1px rgba(255, 255, 255, 0.19048);
  font-size: 45px;
}

.status512 {
  color: #f9f6f2;
  background: #edc850;
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.39683),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2381);
  font-size: 45px;
}

.status1024 {
  color: #f9f6f2;
  background: #edc53f;
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.47619),
    inset 0 0 0 1px rgba(255, 255, 255, 0.28571);
  font-size: 35px;
}

.status2048 {
  color: #f9f6f2;
  background: #edc22e;
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.55556),
    inset 0 0 0 1px rgba(255, 255, 255, 0.33333);
  font-size: 35px;
}

.statusSuper {
  color: #f9f6f2;
  background: #3c3a32;
  font-size: 30px;
}

.desktop {
  .grid {
    width: $desktopGridSize;
    height: $desktopGridSize;
    line-height: $desktopGridSize;
  }
}

.mobile {
  .grid {
    width: $mobileGridSize;
    height: $mobileGridSize;
    line-height: $mobileGridSize;
    font-size: 35px;
  }

  .status128 {
    font-size: 25px;
  }

  .status256 {
    font-size: 25px;
  }

  .status512 {
    font-size: 25px;
  }

  .status1024 {
    font-size: 15px;
  }

  .status2048 {
    font-size: 15px;
  }

  .statusSuper {
    font-size: 10px;
  }
}
</style>