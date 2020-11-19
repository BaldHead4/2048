<template>
  <div class="wrapper">
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
          <div class="btn online">多人游戏</div>
        </div>
      </div>
      <board v-model:currentScore="currentScore" :highestScore="highestScore" />
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, watch } from "vue";
import board from "../components/core/board.vue";
export default {
  components: { board },
  name: "index",
  setup() {
    const currentScore = ref(0);
    const highestScore = ref(0);
    const diffculty = ref(1);

    if (
      localStorage.currentScore &&
      typeof localStorage.currentScore === "number"
    )
      currentScore.value = localStorage.currentScore;

    if (
      localStorage.highestScore &&
      typeof localStorage.highestScore === "number"
    )
      highestScore.value = localStorage.highestScore;

    watch(currentScore, () => {
      highestScore.value = Math.max(currentScore.value, highestScore.value);
      localStorage.currentScore = currentScore.value;
      localStorage.highestScore = highestScore.value;
    });

    watch(diffculty, () => {
      console.log(diffculty.value);
    });

    return {
      currentScore,
      highestScore,
      diffculty,
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

@media screen and (max-width: 500px) {
  .wrapper {
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
}

@media screen and (min-width: 501px) {
  .wrapper {
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
}
</style>
