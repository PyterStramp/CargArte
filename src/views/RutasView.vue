<template>
  <div class="rutas-container">
    <div class="map-section">
      <MapView @marker-added="handleMarkerAdded" :markers="markers" ref="mapView" />
    </div>
    <div class="controls-section">
      <h2>Panel de Control</h2>
      <div class="warehouse-info">
        <h3>Punto de Partida (Bodega)</h3>
        <p>{{ warehousePosition[0].toFixed(4) }}, {{ warehousePosition[1].toFixed(4) }}</p>
      </div>
      <div v-if="markers.length > 0">
        <h3>Puntos de Entrega</h3>
        <ul class="marker-list">
          <li v-for="(marker, index) in markers" :key="index" class="marker-item">
            <div class="marker-info">
              Punto #{{ index + 1 }}:
              {{ marker.position[0].toFixed(4) }},
              {{ marker.position[1].toFixed(4) }}
            </div>
            <button @click="removeMarker(index)" class="delete-btn">
              ×
            </button>
          </li>
        </ul>
      </div>
      <p v-else>
        Haga clic en el mapa para añadir puntos de entrega
      </p>
    </div>
  </div>
</template>

<script>
import MapView from '@/components/MapView.vue'

export default {
  name: 'RutasView',
  components: {
    MapView
  },
  data() {
    return {
      markers: [],
      warehousePosition: [4.757786586246297, -74.04488664305592]
    }
  },
  methods: {
    handleMarkerAdded(marker) {
      this.markers.push(marker)
    },
    removeMarker(index) {
      this.markers.splice(index, 1)
    }
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

.marker-list {
  list-style: none;
  padding: 0;
}

.marker-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.warehouse-info {
  background-color: #f8f7d7;
  border: 1px solid #f4f5c6;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 20px;
}

.warehouse-info h3 {
  color: #725c1c;
  margin-top: 0;
}

.marker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.marker-info {
  flex-grow: 1;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
}

.delete-btn:hover {
  background-color: #c82333;
}
</style>
