<template>
  <div
    :class="`status${block.status > 2048 ? 'Super' : block.status}`"
    :style="`
    left: ${block.position.x}px;
    top: ${block.position.y}px;
    `"
  >
    {{ block.status ? block.status : "" }}
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
export default {
  props: {
    block: Object,
  },
  setup(props) {},
};
</script>

<style lang="scss" scoped>
$blockSize: 106.25px;

div {
  display: inline-block;
  position: absolute;
  width: $blockSize;
  height: $blockSize;
  transition: all 0.3s ease-in-out;
  text-align: center;
  line-height: $blockSize;
  font: {
    size: 45px;
    weight: 700;
  }
  color: #776e65;
  border-radius: 3px;
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

@media screen and (max-width: 520px) {
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