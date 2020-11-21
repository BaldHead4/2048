<template>
    <div class="wrapper" v-show="loading">
        <div class="loading"/>
    </div>
</template>

<script lang="ts">
export default {
    name: "load",
    props: {
        loading: Boolean
    }
}
</script>

<style lang="scss" scoped>
@keyframes loading-rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

.wrapper {
  height: 100%;
  width: 100%;
  opacity: 0.8;
  background: #999999;
  display: flex;
  align-items: center;
  justify-content: center;

  .loading {
    flex: 0 0 50px;
    height: 50px;
    border: {
      top: #1b2632 5px solid;
      bottom: #1b2632 5px solid;
      left: #1b2632 5px solid;
      right: transparent 5px solid;
      radius: 25px;
    };
    animation: 1s loading-rotate infinite;
  }
}
</style>
