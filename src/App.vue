<template>
  <router-view />
</template>

<script lang="ts">
import { ref, provide, reactive } from "vue";
import md5 from "js-md5";
import { useRouter } from "vue-router";
import { player, playerMove, reconnectInfo } from "./components/types";

export default {
  name: "App",
  setup() {
    const router = useRouter();
    //用户id
    function generateID(): string {
      return (
        md5(navigator.userAgent) + Number(new Date()) + md5(Math.random() + "")
      );
    }

    if (!localStorage.userId) localStorage.userId = generateID();

    const clientWidth = ref(document.body.clientWidth);
    window.onresize = function () {
      clientWidth.value = document.body.clientWidth;
    };

    let socket = new WebSocket(
      `ws://47.96.68.168:8080/websocket/${localStorage.userId}`
    );

    const onlineInfo = reactive({
      id: localStorage.userId,
      username: localStorage.username ? localStorage.username : "",
      difficulty: localStorage.onlineDifficulty
        ? parseInt(localStorage.onlineDifficulty)
        : 1,
    });

    const playerList = reactive([]);
    const playerMove = ref<playerMove[]>([]);
    const reconnectInfoList = ref<reconnectInfo[]>([]);
    const gameStatus = ref(0);

    if (localStorage.online === undefined) localStorage.online = -Infinity;

    if (Number(new Date()) - Number(localStorage.online) < 300000) {
      socket.onopen = function () {
        gameStatus.value = 0;
        socket.send(
          JSON.stringify({
            method: 0,
            ...onlineInfo,
          })
        );
      };
    }

    socket.onclose = function (event) {
      gameStatus.value = -1;
      socket = new WebSocket(
        `ws://47.96.68.168:8080/websocket/${localStorage.userId}`
      );
      socket.onopen = function () {
        gameStatus.value = 0;
        if (Number(new Date()) - Number(localStorage.online) < 300000) {
          socket.send(
            JSON.stringify({
              method: 0,
              ...onlineInfo,
            })
          );
        }
      };
      socket.onmessage = receiveMsg;
    };

    socket.onmessage = receiveMsg;

    function receiveMsg(event) {
      let data = JSON.parse(event.data);
      switch (data.type) {
        case 0:
          gameStatus.value = 0;
          localStorage.online = Number(new Date());
          playerList.push(...data.playerList);
          router.push("/online");
          break;
        case 1:
          playerMove.value.push(data);
          break;
        case 2:
        case 8:
          gameStatus.value = 1;
          break;
        case 3:
          reconnectInfoList.value = data.playerList.map((value) => {
            value.gameMsg = JSON.parse(value.gameMsg);
            return value;
          });
          console.log(reconnectInfoList.value);
          router.push("/online");
          break;
      }
    }

    provide("clientWidth", clientWidth);
    provide("socket", socket);
    provide("playerList", playerList);
    provide("playerMove", playerMove);
    provide("gameStatus", gameStatus);
    provide("onlineInfo", onlineInfo);
    provide("reconnectInfoList", reconnectInfoList);
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
