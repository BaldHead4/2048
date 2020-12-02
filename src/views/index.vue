<template>
  <div
    :class="`wrapper  ${clientWidth >= 500 ? 'desktopLayout' : 'mobileLayout'}`"
  >
    <div class="container">
      <div class="head">
        <div :class="`${scoreOverflowed ? 'overflow first' : 'first'}`">
          <div class="title">2048</div>
          <div class="scores">
            <div class="scoreboard currentScore">
              {{ currentScore }}
              <span class="plus" v-for="item in plus" :key="item[2]"
                >+{{ item[0]
                }}<span :class="`time${item[1]} times`" v-show="item[1] > 1"
                  >x{{ item[1] }}
                </span></span
              >
            </div>
            <div class="scoreboard highestScore">
              {{ highestScore[difficulty - 1] }}
            </div>
          </div>
        </div>
        <div class="operations">
          <div class="checkbox">
            <input type="radio" id="simple" :value="1" v-model="difficulty" />
            <label for="simple">正常</label>
            <input type="radio" id="hard" :value="2" v-model="difficulty" />
            <label for="hard">困难</label>
          </div>
          <div class="btn reset" @click="reset">新游戏</div>
          <div class="btn online" @click="modalVisible = true">多人游戏</div>
        </div>
      </div>
      <board
        :blocks="blocks"
        :width="500"
        :gameover="gameover"
        buttonText="再次尝试"
        @retry="reset()"
        @touchstart="touchstart"
        @touchmove="touchmove"
        @touchend="touchend"
      />
    </div>
    <a-modal
      title="信息确认"
      v-model:visible="modalVisible"
      :confirm-loading="confirmLoading"
      @ok="getOnline"
      @cancel="modalVisible = false"
      :cancelButtonProps="{ disabled: confirmLoading }"
      :maskClosable="false"
      cancelText="取消"
      :closable="false"
      okText="确定"
    >
      <a-form :model="onlineInfo">
        <a-form-item label="昵称：" v-bind="validateInfos.username">
          <a-input
            v-model:value="onlineInfo.username"
            placeholder="请输入您的昵称"
          >
            <template #prefix><user-outlined type="user" /></template>
          </a-input>
        </a-form-item>
        <a-form-item label="难度：">
          <a-radio-group
            v-model:value="onlineInfo.difficulty"
            button-style="solid"
          >
            <a-radio-button :value="1"> 正常 </a-radio-button>
            <a-radio-button :value="2"> 困难 </a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { inject, onMounted, onUnmounted, reactive, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import board from "../components/core/board.vue";
import { UserOutlined } from "@ant-design/icons-vue";
import md5 from "js-md5";
import { block, player, position, reconnectInfo } from "../components/types";
import { generateBlock, mergeBlock, move } from "../components/core/block";
import { useForm } from "@ant-design-vue/use";
import { message } from "ant-design-vue";

export default {
  components: { board, UserOutlined },
  name: "index",
  setup() {
    const clientWidth: Ref<number> = inject("clientWidth");
    const socket: WebSocket = inject("socket");
    const playerList: player[] = inject("playerList");
    const onlineInfo: any = inject("onlineInfo");
    const reconnectInfoList: Ref<reconnectInfo[]> = inject("reconnectInfoList");

    //方块id
    let id = ref(localStorage.id ? parseInt(localStorage.id) : 0);

    const gameover = ref(false);

    //根据难度改变游戏逻辑
    const difficulty = ref(
      localStorage.difficulty ? parseInt(localStorage.difficulty) : 1
    );
    watch(difficulty, () => {
      localStorage.difficulty = difficulty.value.toString();
      reset();
    });

    //对话框
    async function validateUsername(rule, value: string, vallback) {
      if (value === "") return Promise.reject("请输入昵称");
      else if (!value.match(/^[A-Za-z0-9_\u4e00-\u9fa5]{1,6}$/g))
        return Promise.reject("1到6位（汉字，字母，数字，下划线）");
      return Promise.resolve();
    }
    const modalVisible = ref(false);
    const confirmLoading = ref(false);
    const { validate, validateInfos } = useForm(
      onlineInfo,
      reactive({
        username: [{ validator: validateUsername, trigger: "change" }],
      })
    );

    //进入多人游戏
    function getOnline(): void {
      validate()
        .then(() => {
          message.info("正在寻找其他玩家，请您耐心等待");
          confirmLoading.value = true;
          localStorage.username = onlineInfo.username;
          localStorage.onlineDifficulty = onlineInfo.difficulty;
          socket.send(
            JSON.stringify({
              method: 0,
              ...onlineInfo,
            })
          );
        })
        .catch((e) => {});
    }

    //稀疏矩阵，用于存储所有方块
    const blocks = ref<block[]>([]);
    const currentScore = ref(0);
    const highestScore = ref([0, 0]);
    const plus = ref<[number, number, number][]>([]);

    function reset() {
      id.value = 0;
      blocks.value = [];
      currentScore.value = 0;
      gameover.value = false;

      generateBlock(blocks, difficulty.value);
    }

    //缓存游戏状态
    watch(blocks, () => {
      if (blocks.value.filter((value) => !value.removed).length === 16)
        gameover.value = gameEnd();
      localStorage.blocks = JSON.stringify(blocks.value);
    });

    //判断游戏是否结束
    function gameEnd() {
      let matrix: Array<Array<block | null>> = new Array(4);
      for (let i = 0; i < 4; i++) matrix[i] = new Array(4).fill(null);
      for (const iterator of blocks.value) {
        if (!iterator.removed)
          matrix[iterator.position.y][iterator.position.x] = iterator;
      }
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (i < 3 && matrix[i][j].status === matrix[i + 1][j].status)
            return false;
          if (j < 3 && matrix[i][j].status === matrix[i][j + 1].status)
            return false;
        }
      }
      return true;
    }

    //读取缓存数据
    if (localStorage.blocks && localStorage.blocks.length > 2) {
      blocks.value = <block[]>JSON.parse(localStorage.blocks);
    } else {
      generateBlock(blocks, difficulty.value);
    }
    if (localStorage.currentScore)
      currentScore.value = parseInt(localStorage.currentScore);
    if (localStorage.highestScore)
      highestScore.value = JSON.parse(localStorage.highestScore);

    //判断分数长度是否过高影响页面布局
    const scoreOverflowed = ref(false);
    scoreOverflowed.value = overflow();
    function overflow() {
      let len = (currentScore.value.toString() + highestScore.value.toString())
        .length;
      if (len > 5 && clientWidth.value < 500) return true;
      if (len > 14) return true;
      return false;
    }

    watch(clientWidth, () => {
      scoreOverflowed.value = overflow();
    });

    //刷新最高分以及缓存
    watch(currentScore, () => {
      scoreOverflowed.value = overflow();
      highestScore.value[difficulty.value - 1] = Math.max(
        currentScore.value,
        highestScore.value[difficulty.value - 1]
      );
      localStorage.currentScore = currentScore.value;
      localStorage.highestScore = JSON.stringify(highestScore.value);
    });

    onMounted(() => {
      document.onkeydown = function (e) {
        if (e.keyCode > 36 && e.keyCode < 41) {
          e.preventDefault();
          move(
            blocks,
            difficulty.value,
            currentScore,
            (e.keyCode - 36) as 1 | 2 | 3 | 4,
            plus
          );
        }
      };
    });

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
      if (locked) return;
      moveX = e.touches[0].clientX;
      moveY = e.touches[0].clientY;
      if (
        startX - moveX < -0 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        move(blocks, difficulty.value, currentScore, 3, plus);
      } else if (
        startX - moveX > 0 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        move(blocks, difficulty.value, currentScore, 1, plus);
      } else if (
        startY - moveY < -0 &&
        Math.abs(moveY - startY) >= Math.abs(startX - moveX)
      ) {
        move(blocks, difficulty.value, currentScore, 4, plus);
      } else if (
        startY - moveY > 0 &&
        Math.abs(moveY - startY) >= Math.abs(startX - moveX)
      ) {
        move(blocks, difficulty.value, currentScore, 2, plus);
      } else {
        return;
      }
      locked = true;
    }

    function touchend() {
      locked = false;
    }

    return {
      currentScore,
      highestScore,
      blocks,
      difficulty,
      getOnline,
      modalVisible,
      confirmLoading,
      onlineInfo,
      clientWidth,
      plus,
      move,
      reset,
      scoreOverflowed,
      touchstart,
      touchmove,
      touchend,
      gameover,
      validateInfos,
    };
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  background: url("/amam.webp");
  height: 100%;
  color: #776e65;

  .container {
    padding: 20px;
    background: rgba(250, 248, 239, 0.75);

    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .head {
      margin: auto;
      display: block;
      text-align: left;
      .first {
        position: relative;

        .title {
          color: #776e65;
          cursor: pointer;
          font-weight: 700;
          margin: 0;
          left: 0;
        }

        .scores {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      .overflow {
        text-align: center;
        height: auto !important;
        .title {
          position: static;
        }

        .scores {
          position: static;
          transform: none;

          top: 0;
        }
      }

      .operations {
        position: relative;

        div {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .reset {
          left: 0;
        }

        .online {
          right: 0;
        }

        .checkbox {
          input {
            margin: 0 5px;
          }

          label {
            margin: 0 5px;
          }
        }
      }
    }
  }
}

@keyframes bubble {
  0% {
    opacity: 0.8;
    top: 50%;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    top: -25px;
  }
}

.scores {
  .scoreboard {
    position: relative;
    display: inline-block;
    background: #bbada0;
    padding: 15px 25px;
    font-size: 25px;
    height: 25px;
    line-height: 47px;
    font-weight: 700;
    border-radius: 3px;
    color: #fff;
    text-align: center;
  }

  .currentScore {
    position: relative;
    &::after {
      content: "当前分数";
    }
    margin-right: 5px;

    .plus {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #776e65;
      opacity: 0;
      animation: {
        name: bubble;
        duration: 0.5s;
      }

      .times {
        margin-left: 5px;

        font-size: 15px;
      }

      .time3 {
        color: #0b3779;
      }

      .time4 {
        color: #edcf72;
      }

      .time5,
      .time6.time7 {
        color: #720749;
      }

      .time8 {
        color: red;
      }
    }
  }

  .highestScore {
    &::after {
      content: "历史最高";
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

.mobileLayout {
  min-height: 490px;
  .container {
    width: 280px;
    .head {
      margin-top: 10px;
      .first {
        height: 60px;

        .title {
          line-height: 60px;
          font-size: 40px;
        }

        .scores {
          .scoreboard {
            &::after {
              position: absolute;
              width: 100%;
              top: 10px;
              left: 0;
              text-transform: uppercase;
              font-size: 13px;
              line-height: 13px;
              text-align: center;
              color: #eee4da;
            }
          }
        }
      }

      // .overflow {
      //   height: 200px;
      // }

      .operations {
        height: 100px;
        .btn {
          top: 10px;
          transform: translateY(0);
        }
        .checkbox {
          line-height: 40px;
          top: 55px;
          left: 50%;
          height: 40px;
          transform: translateX(-50%);
        }
      }
    }
  }
}

.desktopLayout {
  min-height: 800px;
  .container {
    width: 500px;
    .head {
      margin-top: 20px;
      .first {
        height: 66px;

        .title {
          line-height: 66px;
          font-size: 74px;
        }

        .scores {
          .scoreboard {
            &::after {
              position: absolute;
              width: 100%;
              top: 10px;
              left: 0;
              text-transform: uppercase;
              font-size: 13px;
              line-height: 13px;
              text-align: center;
              color: #eee4da;
            }
          }
        }
      }

      .operations {
        height: 80px;
        .checkbox {
          line-height: 80px;

          left: 50%;
          top: 0;
          transform: translate(-50%, 0);
        }
      }
    }
  }
}
</style>
