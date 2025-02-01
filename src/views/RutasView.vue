<template>
  <div class="rutas-container">
    <div class="map-section">
      <MapView />
    </div>
    <div class="controls-section">
      <h2>Panel de Control</h2>
      <p>Próximamente: Gestión de marcadores</p>
    </div>
  </div>
</template>

<script>
import MapView from '@/components/MapView.vue'

export default {
  name: 'RutasView',
  components: {
    MapView
  }
}
</script>

<style scoped>
.rutas-container {
  display: flex;
  height: calc(100vh - 100px);
  gap: 20px;
  padding: 20px;
}

.map-section {
  flex: 2;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls-section {
  flex: 1;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
