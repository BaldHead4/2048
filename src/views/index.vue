<template>
  <div class="wrapper">
    <board />
  </div>
</template>

<script lang="ts">
import { reactive, ref } from "vue";
import board from "../components/core/board.vue";
export default {
  components: { board },
  name: "index",
  setup() {},
};
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  background: #faf8ef;
}
</style>
