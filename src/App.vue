<template>
  <router-view />
</template>

<script lang="ts">
import { ref, provide } from "vue";
export default {
  name: "App",
  setup() {
    const clientWidth = ref(document.body.clientWidth);
    window.onresize = function () {
      clientWidth.value = document.body.clientWidth;
    };

    provide("clientWidth", clientWidth);
  },
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  //background: #2488d8;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC,
    Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial,
    sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;

  * {
    box-sizing: content-box;
    user-select: none;
  }
}
</style>
