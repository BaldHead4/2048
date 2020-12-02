<template>
  <div class="wrapper">
    <div class="gui" v-if="!error">
      <div class="left">
        <div class="scoreboard">
          <div class="title">计分板</div>
          <div class="list">
            <div
              :class="{ player: true, self: player.id === p1.id }"
              v-for="(player, index) in players"
              :key="player.id"
            >
              <span class="rank">{{ index }}.</span>
              <span class="username">{{ player.username }}</span>
              <span class="score">{{ player.score }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="head">
          <div class="title">2048</div>
          <div class="operation" v-show="time[0] >= 0 && gameStatus !== 1">
            {{ time[0] }}:{{ time[1] }}{{ time[2] }}
          </div>
        </div>
        <board
          :width="1000"
          :blocks="p1.status"
          :gameover="gameStatus === 1"
          buttonText="退出"
          @retry="$router.push('/')"
          @touchstart="touchstart"
          @touchmove="touchmove"
          @touchend="touchend"
        />
      </div>
      <div class="right">
        <board :width="1000" :blocks="p2.status" />
        <board :width="1000" class="mid" :blocks="p3.status" />
        <board :width="1000" :blocks="p4.status" />
      </div>
      <div class="usernames">
        <div class="p2">{{ p2.username }}</div>
        <div class="p3">{{ p3.username }}</div>
        <div class="p4">{{ p4.username }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  reactive,
  Ref,
  ref,
  toRef,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import board from "../components/core/board.vue";
import {
  block,
  playerIndex,
  player,
  position,
  playerMove,
  reconnectInfo,
} from "../components/types";
import {
  createBlock,
  generateBlock,
  mergeBlock,
  move,
} from "../components/core/block";
import { message } from "ant-design-vue";
export default {
  components: { board },
  name: "online",
  setup() {
    const router = useRouter();

    const socket: WebSocket = inject("socket");
    const onlineInfo: any = inject("onlineInfo");
    const playerMove: Ref<playerMove[]> = inject("playerMove");
    const reconnectInfoList: Ref<reconnectInfo[]> = inject("reconnectInfoList");

    const gameStatus: Ref<number> = inject("gameStatus");
    watch(gameStatus, (newVal, oldVal) => {
      if (newVal === 1) {
        reconnectInfoList.value = [];
        localStorage.online = -Infinity;
        message.success("游戏结束");
        clearInterval(heartbeat);
        clearInterval(timer);
      } else if (newVal === -1) message.warn("您已断线，正在重新连接");
      else if (oldVal === -1) {
        if (Number(new Date()) - Number(localStorage.online) < 300000)
          message.success("您已重新连接至在线游戏");
        else {
          message.info("游戏已结束");
          gameStatus.value = 1;
        }
      }
    });

    // TODO: 玩家互动(Level 5)

    const playerList: any[] = inject("playerList");

    const error = ref(false);

    //载入其他玩家的数据信息
    if (reconnectInfoList.value.length > 0) {
      reconnectInfoList.value.sort((a, b) =>
        a.gameMsg.id === localStorage.userId ? -1 : 0
      );
    } else if (playerList.length > 0)
      playerList.splice(
        playerList.findIndex((value) => value.id === localStorage.userId),
        1
      );
    else {
      error.value = true;
      router.push({ path: "/" });
      return {
        error,
      };
    }

    //当前玩家的信息 
    const p1 = reactive<player>({
      status:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[0].gameMsg.blocks
          : [],
      score:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[0].gameMsg.score
          : 0,
      id:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[0].gameMsg.id
          : onlineInfo.id,
      username:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[0].gameMsg.username
          : onlineInfo.username,
    });

    // 其余3名玩家的信息
    const p2 = reactive<player>({
      status:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[1].gameMsg.blocks
          : [],
      score:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[1].gameMsg.score
          : 0,
      id:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[1].gameMsg.id
          : playerList[0].id,
      username:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[1].gameMsg.username
          : playerList[0].username,
    });

    const p3 = reactive<player>({
      status:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[2].gameMsg.blocks
          : [],
      score:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[2].gameMsg.score
          : 0,
      id:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[2].gameMsg.id
          : playerList[1].id,
      username:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[2].gameMsg.username
          : playerList[1].username,
    });

    const p4 = reactive<player>({
      status:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[3].gameMsg.blocks
          : [],
      score:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[3].gameMsg.score
          : 0,
      id:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[3].gameMsg.id
          : playerList[2].id,
      username:
        reconnectInfoList.value.length > 0
          ? reconnectInfoList.value[3].gameMsg.username
          : playerList[2].username,
    });

    const id_playerMap = new Map<string, player>();
    id_playerMap.set(p1.id, p1);
    id_playerMap.set(p2.id, p2);
    id_playerMap.set(p3.id, p3);
    id_playerMap.set(p4.id, p4);

    const players = computed(() =>
      [p1, p2, p3, p4].sort((a, b) => b.score - a.score)
    );

    if (reconnectInfoList.value.length === 0) {
      socket.send(
        JSON.stringify(<playerMove>{
          method: 1,
          id: p1.id,
          score: 0,
          blocks: [],
          handled: false,
          mergedBlocks: [],
          generatedBlock: generateBlock(
            toRef(p1, "status"),
            onlineInfo.difficulty
          ),
        })
      );
    }

    watch(
      playerMove,
      () => {
        // 消息队列，用于处理并发消息
        while (playerMove.value.length > 0) {
          let top = playerMove.value[0];
          let target = id_playerMap.get(top.id);
          if (top.handled || target.id === p1.id) {
            playerMove.value.shift();
            continue;
          }
          target.status = top.blocks;

          target.score = top.score;
          for (const iterator of top.mergedBlocks) {
            mergeBlock(
              toRef(target, "status"),
              target.status.find((value) => value.id === iterator[0].id),
              target.status.find((value) => value.id === iterator[1].id),
              top.mergedBlocks.length,
              toRef(target, "score"),
              target.status.find((value) => value.id === iterator[2].id)
            );
          }
          if (top.generatedBlock)
            createBlock(
              toRef(target, "status"),
              top.generatedBlock.position.x,
              top.generatedBlock.position.y,
              top.generatedBlock.status
            );
          top.handled = true;
          playerMove.value.shift();
        }
      },
      { deep: true, immediate: true }
    );

    // 计时器
    const time = reactive([5, 0, 0]);
    let timing = () => {
      if (time[2] > 0) time[2]--;
      else if (time[1] > 0) {
        time[1]--;
        time[2] = 9;
      } else {
        time[0]--;
        time[1] = 5;
        time[2] = 9;
      }
    };

    // 重新连接时重置计时器
    for (
      let i = 0;
      i < (Number(new Date()) - Number(localStorage.online)) / 1000;
      i++
    ) {
      timing();
    }

    let timer = setInterval(timing, 1000);

    onMounted(() => {
      // 桌面端操作
      document.onkeydown = function (e) {
        if (e.keyCode > 36 && e.keyCode < 41) {
          e.preventDefault();
          if (gameStatus.value === 1) return;
          let next = move(
            toRef(p1, "status"),
            onlineInfo.difficulty,
            toRef(p1, "score"),
            (e.keyCode - 36) as 1 | 2 | 3 | 4
          );
          if (next !== null) {
            socket.send(
              JSON.stringify(<playerMove>{
                method: 1,
                id: p1.id,
                username: p1.username,
                score: p1.score,
                handled: false,
                blocks: next.blocks,
                mergedBlocks: next.mergedBlocks,
                generatedBlock: next.generatedBlock,
              })
            );
          }
        }
      };
    });


    // 隔10s发送一个心跳包，防止丢包
    let heartbeat = setInterval(() => {
      socket.send(
        JSON.stringify(<playerMove>{
          method: 1,
          id: p1.id,
          username: p1.username,
          score: p1.score,
          handled: false,
          blocks: p1.status,
          mergedBlocks: [],
          generatedBlock: null,
        })
      );
    }, 10000);

    //处理滑动事件（移动端专属）
    let locked = false;
    let [startX, startY] = [0, 0];
    let [moveX, moveY] = [0, 0];
    function touchstart(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }

    function touchmove(e) {
      e.preventDefault();
      if (locked || gameStatus.value === 1) return;
      moveX = e.touches[0].clientX;
      moveY = e.touches[0].clientY;
      let next = null;
      if (
        startX - moveX < 0 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          3
        );
      } else if (
        startX - moveX > 0 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          1
        );
      } else if (
        startY - moveY < 0 &&
        Math.abs(moveY - startY) >= Math.abs(startX - moveX)
      ) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          4
        );
      } else if (
        startY - moveY > 0 &&
        Math.abs(moveY - startY) >= Math.abs(startX - moveX)
      ) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          2
        );
      } else {
        return;
      }
      if (next !== null) {
        socket.send(
          JSON.stringify(<playerMove>{
            method: 1,
            id: p1.id,
            username: p1.username,
            score: p1.score,
            handled: false,
            blocks: next.blocks,
            mergedBlocks: next.mergedBlocks,
            generatedBlock: next.generatedBlock,
          })
        );
      }
      locked = true;
    }

    function touchend() {
      locked = false;
    }

    return {
      p1,
      p2,
      p3,
      p4,
      players,
      gameStatus,
      touchstart,
      touchmove,
      touchend,
      error,
      time,
    };
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  background: url("/amam.webp");
  position: relative;
  height: 100%;
  color: #776e65;

  .container {
    padding: 20px;
    background: rgba(250, 248, 239, 0.75);

    .head {
      margin: auto;
      display: block;
      position: relative;

      .title {
        color: #776e65;
        cursor: default;
        font-weight: 700;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }

      .operation {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);

        font: {
          weight: 700;
          size: 30px;
        }
      }
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

@media screen and (max-width: 999.9px) {
  .wrapper {
    display: flow-root;
    min-height: 700px;
    min-width: 320px;
    display: flex;
    justify-content: center;
    align-items: center;

    .gui {
      flex: 1;

      .container {
        margin: auto;
        width: 280px;
        .head {
          height: 60px;

          .title {
            line-height: 60px;
            font-size: 40px;
          }
        }
      }

      .left {
        margin-top: 20px;

        .scoreboard {
          background: rgb(187, 173, 160);
          border-radius: 5px;
          margin: auto;
          width: 250px;
          height: 150px;

          .title {
            font: {
              size: 20px;
              weight: 700;
            }
            border-bottom: 1px solid rgb(87, 69, 53);
          }

          .list {
            text-align: left;

            .player {
              padding: 0 10px;
              transition: all ease-in-out 0.2s;
              position: relative;
              border-radius: 3px;
              .rank {
                font: {
                  size: 18px;
                  weight: 700;
                }

                margin-right: 10px;
              }
              .username {
                font-size: 15px;
                position: absolute;
                left: 35px;
                bottom: 1px;
              }
              .score {
                color: #fff;
                font-size: 16px;
                position: absolute;
                right: 10px;
                bottom: 1px;
              }
            }

            .self {
              background: #cdc1b4;
            }
          }
        }
      }

      .right {
        height: 100px;

        .board {
          display: inline-block;
          transform: scale(0.3);
          margin: -90px;
        }
      }

      .usernames {
        width: 300px;
        margin: auto;
        display: flex;
        align-items: center;
        flex-direction: row;

        div {
          flex: 1;
        }
      }
    }
  }
}

@media screen and (min-width: 1000px) {
  .wrapper {
    min-height: 700px;
    .container {
      width: 500px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .head {
        height: 80px;

        .title {
          line-height: 66px;
          font-size: 74px;
        }
      }
    }

    .left {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-500px, -50%);

      .scoreboard {
        background: rgb(187, 173, 160);
        border-radius: 5px;
        width: 180px;
        height: 180px;

        .title {
          font: {
            size: 25px;
            weight: 700;
          }
          border-bottom: 1px solid rgb(87, 69, 53);
        }

        .list {
          text-align: left;

          .player {
            padding: 0 10px;
            transition: all ease-in-out 1s;
            position: relative;
            border-radius: 3px;
            .rank {
              font: {
                size: 22px;
                weight: 700;
              }
              margin-right: 10px;
            }
            .username {
              font-size: 17px;
              position: absolute;
              left: 35px;
              bottom: 3px;
            }
            .score {
              color: #fff;
              font-size: 17px;
              position: absolute;
              right: 10px;
              bottom: 3px;
            }
          }

          .self {
            background: #cdc1b4;
          }
        }
      }
    }

    .right {
      right: 50%;
      top: 50%;
      transform: translate(500px, -50%);
      position: absolute;

      div {
        transform: scale(0.3);
        margin: -175px;
      }

      .mid {
        margin: {
          top: -300px;
          bottom: -300px;
        }
      }
    }

    .p2 {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(425px, -108px) translate(-50%, -50%);

      font: {
        size: 20px;
      }
    }

    .p3 {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(425px, 92px) translate(-50%, -50%);

      font: {
        size: 20px;
      }
    }

    .p4 {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(425px, 292px) translate(-50%, -50%);

      font: {
        size: 20px;
      }
    }
  }
}
</style>
