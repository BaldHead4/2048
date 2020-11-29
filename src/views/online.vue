<template>
  <div class="wrapper">
    <div class="gui">
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
        </div>
        <board
          :width="1000"
          :blocks="p1.status"
          :gameover="gameStatus === 1"
          buttonText="退出"
          @retry="$router.push('/')"
          @touchstart="touchstart()"
          @touchmove="touchmove()"
        />
      </div>
      <div class="right">
        <board :width="1000" :blocks="p2.status" />
        <board :width="1000" class="mid" :blocks="p3.status" />
        <board :width="1000" :blocks="p4.status" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
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
import { generateBlock, mergeBlock, move } from "../components/core/block";
import { message } from "ant-design-vue";
export default {
  components: { board },
  name: "online",
  setup() {
    const router = useRouter();
    if (!localStorage.online || localStorage.online === "false") {
      router.push("/");
    }

    const socket: WebSocket = inject("socket");
    const onlineInfo: any = inject("onlineInfo");
    const playerMove: Ref<playerMove[]> = inject("playerMove");
    const reconnectInfoList: Ref<reconnectInfo[]> = inject("reconnectInfoList");

    const gameStatus: Ref<number> = inject("gameStatus");
    watch(gameStatus, () => {
      if (gameStatus.value === 1) {
        localStorage.online = "false";
        message.success("游戏结束");
      }
    });

    // TODO: 应该使用一个时间戳，以此判断游戏是否仍在进行中

    //TODO: 玩家互动

    //TODO: 计时器

    // TODO: 玩家互动(Level 5)

    //游戏逻辑
    const playerList: any[] = inject("playerList");

    if (playerList.length > 0)
      playerList.splice(
        playerList.findIndex((value) => value.id === onlineInfo.id),
        1
      );
    else {
      // TODO: 重连
    }

    const p1 = reactive<player>({
      status: [],
      score: 0,
      id: onlineInfo.id,
      username: onlineInfo.username,
    });

    const p2 = reactive<player>({
      status: [],
      score: 0,
      id: playerList[0].id,
      username: playerList[0].username,
    });

    const p3 = reactive<player>({
      status: [],
      score: 0,
      id: playerList[1].id,
      username: playerList[1].username,
    });

    const p4 = reactive<player>({
      status: [],
      score: 0,
      id: playerList[2].id,
      username: playerList[2].username,
    });

    const id_playerMap = new Map<string, player>();
    id_playerMap.set(p1.id, p1);
    id_playerMap.set(p2.id, p2);
    id_playerMap.set(p3.id, p3);
    id_playerMap.set(p4.id, p4);

    const players = computed(() =>
      [
        {
          score: p1.score,
          id: p1.id,
          username: p1.username,
        },
        {
          score: p2.score,
          id: p2.id,
          username: p2.username,
        },
        {
          score: p3.score,
          id: p3.id,
          username: p3.username,
        },
        {
          score: p4.score,
          id: p4.id,
          username: p4.username,
        },
      ].sort((a, b) => b.score - a.score)
    );

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

    watch(
      playerMove,
      () => {
        if (playerMove.value.length < 1) return;
        let top = playerMove.value[playerMove.value.length - 1];
        if (top.handled) return;
        let target = id_playerMap.get(top.id);
        if (target === p1) return;
        target.status = top.blocks;
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
        generateBlock(toRef(target, "status"), onlineInfo.difficulty, [
          top.generatedBlock.position.x,
          top.generatedBlock.position.y,
        ]);
        top.handled = true;
        playerMove.value.shift();
      },
      { deep: true }
    );

    onMounted(() => {
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
                score: p1.score,
                handled: false,
                ...next,
              })
            );
          }
        }
      };
    });

    let gc = setInterval(() => {
      p1.status = p1.status.filter(
        (value) => !(!value.visible && value.removed)
      );
    }, 1000);

    onUnmounted(() => {
      clearInterval(gc);
    });

    //处理滑动事件（移动端专属）
    let locked = false;
    let [startX, startY] = [0, 0];
    let [moveX, moveY] = [0, 0];
    function touchstart(e) {
      locked = false;
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
        startX - moveX <= -10 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          3
        );
      } else if (
        startX - moveX >= 10 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          1
        );
      } else if (startY - moveY <= -10) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          4
        );
      } else if (
        startY - moveY >= 10 &&
        Math.abs(moveY - startY) >= Math.abs(startX - moveX)
      ) {
        next = move(
          toRef(p1, "status"),
          onlineInfo.difficulty,
          toRef(p1, "score"),
          2
        );
      }
      if (next !== null) {
        socket.send(
          JSON.stringify(<playerMove>{
            method: 1,
            id: p1.id,
            score: p1.score,
            handled: false,
            ...next,
          })
        );
      }
      locked = true;
    }

    //TODO:排名变化时的动画

    return {
      p1,
      p2,
      p3,
      p4,
      players,
      gameStatus,
      touchstart,
      touchmove,
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

      .quit {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
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
    min-height: 650px;
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
            transition: all ease-in-out 0.2s;
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
  }
}
</style>
