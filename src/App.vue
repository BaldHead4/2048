<template>
  <router-view />
</template>

<script lang="ts">
import { ref, provide } from "vue";
import md5 from "js-md5";
export default {
  name: "App",
  setup() {
    //用户id
    function generateID(): string {
      return (
        md5(navigator.userAgent) + Number(new Date()) + md5(Math.random() + "")
      );
    }

    if (!localStorage.userId) localStorage.userId = generateID();

    const clientWidth = ref(document.body.clientWidth);

    const socket = new WebSocket(
      `ws://47.96.68.168:8080/websocket/${localStorage.userId}`
    );

    socket.onmessage = function (event) {
      console.log(event);
    };

    window.onresize = function () {
      clientWidth.value = document.body.clientWidth;
    };

    provide("clientWidth", clientWidth);
    provide("socket", socket);
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
