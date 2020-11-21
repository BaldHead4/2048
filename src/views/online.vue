<template>
  <div class="wrapper">
    <div class="gui">
      <div class="left">
        <div class="scoreboard">
          <div class="title">计分板</div>
          <div class="list">
            <div
              :class="{ player: true, self: index === 0 }"
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
          <div class="btn quit" @click="$router.push('/')">离开游戏</div>
        </div>
        <board :width="1000" :players="players[0].status" />
      </div>
      <div class="right">
        <board :width="1000" :blocks="players[1].status" />
        <board :width="1000" class="mid" :blocks="players[2].status" />
        <board :width="1000" :blocks="players[3].status" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { inject, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import board from "../components/core/board.vue";
import { block, playerIndex, players, position } from "../components/types";
export default {
  components: { board },
  name: "index",
  setup() {
    const router = useRouter();

    //TODO:根据难度改变游戏逻辑
    const diffculty = ref(1);
    watch(diffculty, () => {
      console.log(diffculty.value);
    });

    //对话框
    const onlineInfo = reactive({
      id: "",
      username: "",
      difficulty: 1,
    });
    const modalVisible = ref(false);
    const confirmLoading = ref(false);

    //进入多人游戏
    function getOnline(): void {
      confirmLoading.value = true;
      setTimeout(() => {
        confirmLoading.value = false;
        router.push("/online");
      }, 1000);
    }

    //游戏逻辑
    const players = reactive<players[]>(new Array(4));
    function createBlock(
      index: playerIndex,
      x: position,
      y: position,
      status: number
    ) {
      players[index].status.push({
        status,
        position: { x, y },
        merged: false,
        id: players.length,
      });
    }

    //初始化玩家信息
    for (let i = 0; i < 4; i++) {
      let info = JSON.parse(localStorage[`player${i}`]);
      players[i] = {
        status: [],
        username: info.username,
        id: info.id,
        score: 0,
      };
    }


    //TODO:排名变化时的动画

    return {
      players,
      diffculty,
      getOnline,
      modalVisible,
      confirmLoading,
      onlineInfo,
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
