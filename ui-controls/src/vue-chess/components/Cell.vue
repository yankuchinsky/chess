<script lang="ts" setup>
defineProps({ color: String, id: Number });
</script>
<template>
  <div
    class="cell"
    :class="`cell-${color}`"
    :cell-id="id"
  >
    <div class="cell-number">
      {{ id }}
    </div>
  </div>
</template>
<style scoped>
.cell {
  width: 65px;
  height: 65px;
  position: relative;
}

.cell-black {
  background-color: rgb(0, 165, 255);
}

.cell-white {
  background-color: rgb(255, 255, 255);
}

.cell-number {
  position: absolute;
  font-size: 10px;
}
</style>
