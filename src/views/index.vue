<template>
  <div :class="`wrapper  ${clientWidth >= 500 ? 'desktopLayout' : 'mobileLayout'}`">
    <div class="container">
      <div class="head">
        <div class="first">
          <div class="title">2048</div>
          <div class="scores">
            <div class="scoreboard currentScore">{{ currentScore }}</div>
            <div class="scoreboard highestScore">{{ highestScore }}</div>
          </div>
        </div>
        <div class="operations">
          <div class="checkbox">
            <input type="radio" id="simple" value="1" v-model="diffculty" />
            <label for="simple">正常</label>
            <input type="radio" id="hard" value="2" v-model="diffculty" />
            <label for="hard">困难</label>
          </div>
          <div class="btn reset">新游戏</div>
          <div class="btn online" @click="modalVisible = true">多人游戏</div>
        </div>
      </div>
      <board :blocks="blocks" :width="500" />
    </div>
    <a-modal
      title="信息确认"
      v-model:visible="modalVisible"
      :confirm-loading="confirmLoading"
      @ok="getOnline"
      @cancel="modalVisible = false"
      cancelText="取消"
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
import { inject, reactive, ref, watch } from "vue";
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
        for (let i = 0; i < 4; i++)
          localStorage[`player${i}`] = JSON.stringify({
            id: generateID(),
            username: Math.random().toFixed(5),
          });
        confirmLoading.value = false;
        router.push("/online");
      }, 1000);
    }

    //用户id
    function generateID(): string {
      return (
        md5(navigator.userAgent) + Number(new Date()) + md5(Math.random() + "")
      );
    }
    if (!localStorage.id) localStorage.id = generateID();
    onlineInfo.id = <string>localStorage.id;

    //游戏逻辑
    const blocks = ref<block[]>([]);
    const currentScore = ref(0);
    const highestScore = ref(0);
    function createBlock(x: position, y: position, status: number) {
      blocks.value.push({
        status,
        position: { x, y },
        merged: false,
        id: blocks.value.length,
      });
    }

    //缓存对局状态
    watch(
      blocks,
      () => {
        localStorage.blocks = JSON.stringify(blocks.value);
      },
      { deep: true }
    );

    //读取缓存数据
    if (localStorage.blocks) {
      blocks.value = <block[]>JSON.parse(localStorage.blocks);
    } else {
      createBlock(
        <position>Math.floor(Math.random() * 4),
        <position>Math.floor(Math.random() * 4),
        32
      );
    }
    if (localStorage.currentScore)
      currentScore.value = parseInt(localStorage.currentScore);
    if (localStorage.highestScore)
      highestScore.value = parseInt(localStorage.highestScore);

    //刷新最高分以及缓存
    watch(currentScore, () => {
      highestScore.value = Math.max(currentScore.value, highestScore.value);
      localStorage.currentScore = currentScore.value;
      localStorage.highestScore = highestScore.value;
    });

    const clientWidth = inject("clientWidth");

    return {
      currentScore,
      highestScore,
      blocks,
      diffculty,
      getOnline,
      modalVisible,
      confirmLoading,
      onlineInfo,
      clientWidth,
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
      .first {
        position: relative;

        .title {
          color: #776e65;
          cursor: pointer;
          font-weight: 700;
          margin: 0;
          position: absolute;
          left: 0;
        }

        .scores {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
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
    &::after {
      content: "当前分数";
    }
    margin-right: 5px;
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
