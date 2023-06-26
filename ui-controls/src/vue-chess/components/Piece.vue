<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { usePiecesStore } from '@/stores/pieces';

  const piecesStore = usePiecesStore();

  const props = defineProps({ data: Object });
  const piece = ref(null);

  onMounted(() => {

    piecesStore.setRefToCell(props.data.id, piece);
    // const a = piece.value;
  });
</script>

<template>
  <div class="piece" ref="piece">
    <div class="icon-wrapper">
      <img class="piece-icon" :src="`src/assets/${data.type}.png`" :piece-id="data.id"/>
    </div>
  </div>
</template>

<style scoped>
.piece {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.icon-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.piece-icon {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>