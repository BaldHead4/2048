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
              <span v-for="item in plus" :key="item[1]">+{{ item[0] }}</span>
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
        @retry="reset()"
        @touchstart="touchstart"
        @touchmove="touchmove"
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
        <a-form-item label="昵称：">
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
import { inject, onMounted, reactive, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import board from "../components/core/board.vue";
import { UserOutlined } from "@ant-design/icons-vue";
import md5 from "js-md5";
import { block, position } from "../components/types";
export default {
  components: { board, UserOutlined },
  name: "index",
  setup() {
    const router = useRouter();
    const clientWidth: Ref<number> = inject("clientWidth");
    const socket: WebSocket = inject("socket");

    //方块id
    let id = localStorage.id ? parseInt(localStorage.id) : 0;

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
    const onlineInfo = reactive({
      id: localStorage.userId,
      username: "",
      difficulty: 1,
    });
    const modalVisible = ref(false);
    const confirmLoading = ref(false);

    //进入多人游戏
    function getOnline(): void {
      confirmLoading.value = true;
      socket.send(
        JSON.stringify({
          method: 0,
          ...onlineInfo,
        })
      );
    }

    //稀疏矩阵，用于存储所有方块
    const blocks = ref<block[]>([]);
    const currentScore = ref(0);
    const highestScore = ref([0, 0]);
    const plus = ref<[number, number][]>([]);

    //生成方块
    function createBlock(
      x: position,
      y: position,
      status: number,
      merged: boolean = false,
      visible: boolean = true
    ) {
      blocks.value.push({
        status,
        position: { x, y },
        merged,
        visible,
        removed: false,
        id: id++,
      });
      localStorage.id = id.toString();
      return blocks.value[blocks.value.length - 1];
    }

    // 合并方块
    function mergeBlock(b1: block, b2: block, times: number = 1) {
      if (b1 === b2) console.error("不正确的合并!");
      if (
        JSON.stringify(b1.position) !== JSON.stringify(b2.position) ||
        b1.status !== b2.status
      )
        return;
      let block = createBlock(
        b1.position.x,
        b1.position.y,
        b1.status * 2,
        true,
        false
      );
      b1.removed = true;
      b2.removed = true;

      setTimeout(() => {
        b1.visible = false;
        b2.visible = false;
        block.visible = true;
        currentScore.value += b1.status * times;
      }, 100);
    }

    let gc = setInterval(() => {
      blocks.value = blocks.value.filter(
        (value) => !(value.removed && !value.visible)
      );
    }, 1000);

    //自动生成新方块
    function generateBlock(
      position: [number, number] = [
        Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 4),
      ]
    ) {
      if (difficulty.value === 1)
        createBlock(<position>position[0], <position>position[1], 2);
      else
        createBlock(
          <position>position[0],
          <position>position[1],
          Math.pow(2, 1 + Math.floor(Math.random() * 5))
        );
    }

    // 玩家操作(1,2,3,4分别表示左,上,右,下)
    function move(move: 1 | 2 | 3 | 4) {
      let matrix: Array<Array<block | null>> = new Array(4);
      let merged: block[][] = [];
      for (let i = 0; i < 4; i++) matrix[i] = new Array(4).fill(null);
      for (const iterator of blocks.value) {
        if (!iterator.removed)
          matrix[iterator.position.y][iterator.position.x] = iterator;
      }
      let stuck = true;
      switch (move) {
        case 2:
          for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (matrix[i][j] === null) continue;
              while (
                matrix[i][j].position.y > 0 &&
                matrix[matrix[i][j].position.y - 1][j] === null
              )
                matrix[i][j].position.y--;
              if (
                matrix[i][j].position.y > 0 &&
                matrix[matrix[i][j].position.y - 1][j].status ===
                  matrix[i][j].status
              ) {
                matrix[i][j].position.y--;
                merged.push([matrix[i][j], matrix[matrix[i][j].position.y][j]]);
                matrix[matrix[i][j].position.y][j] = {
                  status: NaN,
                  position: {
                    x: j as position,
                    y: matrix[i][j].position.y as position,
                  },
                  visible: false,
                  removed: false,
                  merged: true,
                  id: NaN,
                };
              } else matrix[matrix[i][j].position.y][j] = matrix[i][j];
              if (matrix[i][j].position.y !== i) {
                stuck = false;
                matrix[i][j] = null;
              }
            }
          }
          break;
        case 4:
          for (let i = 2; i > -1; i--) {
            for (let j = 0; j < 4; j++) {
              if (matrix[i][j] === null) continue;
              while (
                matrix[i][j].position.y < 3 &&
                matrix[matrix[i][j].position.y + 1][j] === null
              )
                matrix[i][j].position.y++;
              if (
                matrix[i][j].position.y < 3 &&
                matrix[matrix[i][j].position.y + 1][j].status ===
                  matrix[i][j].status
              ) {
                matrix[i][j].position.y++;
                merged.push([matrix[i][j], matrix[matrix[i][j].position.y][j]]);
                matrix[matrix[i][j].position.y][j] = {
                  status: NaN,
                  position: {
                    x: j as position,
                    y: matrix[i][j].position.y as position,
                  },
                  merged: true,
                  removed: false,
                  visible: false,
                  id: NaN,
                };
              } else matrix[matrix[i][j].position.y][j] = matrix[i][j];
              if (matrix[i][j].position.y !== i) {
                stuck = false;
                matrix[i][j] = null;
              }
            }
          }
          break;
        case 1:
          for (let j = 1; j < 4; j++) {
            for (let i = 0; i < 4; i++) {
              if (matrix[i][j] === null) continue;
              while (
                matrix[i][j].position.x > 0 &&
                matrix[i][matrix[i][j].position.x - 1] === null
              )
                matrix[i][j].position.x--;
              if (
                matrix[i][j].position.x > 0 &&
                matrix[i][matrix[i][j].position.x - 1].status ===
                  matrix[i][j].status
              ) {
                matrix[i][j].position.x--;
                merged.push([matrix[i][j], matrix[i][matrix[i][j].position.x]]);
                matrix[i][matrix[i][j].position.x] = {
                  status: NaN,
                  position: {
                    x: matrix[i][j].position.x as position,
                    y: j as position,
                  },
                  visible: false,
                  removed: false,
                  merged: true,
                  id: NaN,
                };
              } else matrix[i][matrix[i][j].position.x] = matrix[i][j];
              if (matrix[i][j].position.x !== j) {
                stuck = false;
                matrix[i][j] = null;
              }
            }
          }
          break;
        case 3:
          for (let j = 2; j > -1; j--) {
            for (let i = 0; i < 4; i++) {
              if (matrix[i][j] === null) continue;
              while (
                matrix[i][j].position.x < 3 &&
                matrix[i][matrix[i][j].position.x + 1] === null
              )
                matrix[i][j].position.x++;
              if (
                matrix[i][j].position.x < 3 &&
                matrix[i][matrix[i][j].position.x + 1].status ===
                  matrix[i][j].status
              ) {
                matrix[i][j].position.x++;
                merged.push([matrix[i][j], matrix[i][matrix[i][j].position.x]]);
                matrix[i][matrix[i][j].position.x] = {
                  status: NaN,
                  position: {
                    x: matrix[i][j].position.x as position,
                    y: j as position,
                  },
                  merged: true,
                  removed: false,
                  visible: false,
                  id: NaN,
                };
              } else matrix[i][matrix[i][j].position.x] = matrix[i][j];
              if (matrix[i][j].position.x !== j) {
                stuck = false;
                matrix[i][j] = null;
              }
            }
          }
          break;
      }
      if (stuck) {
        return;
      }
      let blank: [number, number][] = [];
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (matrix[i][j] === null) blank.push([i, j]);
        }
      }
      let [y, x] = blank[Math.floor(Math.random() * blank.length)];
      generateBlock([x, y]);
      let add = 0;
      for (const iterator of merged) {
        mergeBlock(iterator[0], iterator[1], merged.length);
        add += iterator[0].status;
      }
      if (add > 0) {
        plus.value.push([add * merged.length, Math.random()]);
        setTimeout(() => {
          plus.value.pop();
        }, 500);
      }
    }

    function reset() {
      id = 0;
      blocks.value = [];
      currentScore.value = 0;
      gameover.value = false;

      generateBlock();
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
      generateBlock();
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
        if (e.keyCode > 36 && e.keyCode < 41)
          move((e.keyCode - 36) as 1 | 2 | 3 | 4);
      };
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
      if (locked) return;
      moveX = e.touches[0].clientX;
      moveY = e.touches[0].clientY;
      if (
        startX - moveX <= -10 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        move(3);
      } else if (
        startX - moveX >= 10 &&
        Math.abs(moveY - startY) < Math.abs(startX - moveX)
      ) {
        move(1);
      } else if (startY - moveY <= -10) {
        move(4);
      } else if (
        startY - moveY >= 10 &&
        Math.abs(moveY - startY) >= Math.abs(startX - moveX)
      ) {
        move(2);
      }
      locked = true;
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
      gameover,
    };
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
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

    span {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #776e65;
      opacity: 0;
      animation: {
        name: bubble;
        duration: 0.5s;
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
  min-height: 700px;
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
