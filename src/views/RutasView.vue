<!--RutasView-->
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
            <div class="packages-info">
              Paquetes: {{ marker.packages }}
            </div>
            <button @click="removeMarker(index)" class="delete-btn">
              X
            </button>
          </li>
        </ul>
      </div>
      <p v-else>
        Haga clic en el mapa para añadir puntos de entrega
      </p>

      <!-- Formulario de coordenadas -->
      <div class="coordinates-form">
        <h3>Ingresa por coordenadas</h3>
        <form @submit.prevent="addMarkerByCoordinates" class="form-group">
          <div class="input-container">
            <div class="coordinate-inputs">
              <div class="input-wrapper">
                <label for="latitude">Latitud</label>
                <input id="latitude" type="number" v-model="newMarker.lat" step="any" required class="form-input">
              </div>
              <div class="input-wrapper">
                <label for="longitude">Longitud</label>
                <input id="longitude" type="number" v-model="newMarker.lng" step="any" required class="form-input">
              </div>
              <div class="input-wrapper package-input">
                <label for="packages">Paquetes</label>
                <input id="packages" type="number" v-model="newMarker.packages" min="1" required class="form-input">
              </div>
            </div>
            <button type="submit" class="add-btn">Añadir Punto</button>
          </div>
          <div v-if="validationError" class="error-message">
            {{ validationError }}
          </div>
        </form>
      </div>

      <button v-if="markers.length > 1" @click="optimizeRoute" class="optimize-btn">
        Optimizar Ruta
      </button>

      <!-- Información de la ruta -->
      <div v-if="routeInfo" class="route-info">
        <div class="info-item">
          <span class="info-label">Tiempo estimado:</span>
          <span class="info-value">{{ routeInfo.duration }} minutos</span>
        </div>
        <div class="info-item">
          <span class="info-label">Distancia total:</span>
          <span class="info-value">{{ routeInfo.distance }} km</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MapView from '@/components/MapView.vue'
import { validateCoordinates } from '@/utils/geoValidation'
import bogotaBoundariesData from '@/assets/bogota-boundaries.json'
import { findOptimalRoute } from '@/utils/routeOptimization'

export default {
  name: 'RutasView',
  components: {
    MapView
  },
  data() {
    return {
      markers: [],
      warehousePosition: [4.757786586246297, -74.04488664305592],
      newMarker: {
        lat: '',
        lng: '',
        packages: 1
      },
      validationError: null,
      optimizedRoute: null,
      routeInfo: null
    }
  },
  methods: {
    validateLocation(lat, lng) {
      if (!validateCoordinates(lat, lng, bogotaBoundariesData)) {
        this.validationError = "¡Ah, parece que tus coordenadas están más perdidas que un sordo en un tiroteo! 🗺️😅\n\n CargArte tiene sus fronteras bien trazadas dentro de Bogotá. ¡Pasear por fuera de la ciudad tendrá que esperar un poco más! 🌆🚫\n\n ¿Algún otro espacio de Bogotá en mente para tu pedido? 📍"
        return false;
      }
      this.validationError = null;
      return true;
    },
    handleMarkerAdded(marker) {
      const [lat, lng] = marker.position;
      if (this.validateLocation(lat, lng)) {
        this.markers.push(marker);
      }
    },
    removeMarker(index) {
      this.markers.splice(index, 1)
    },
    addMarkerByCoordinates() {
      const lat = parseFloat(this.newMarker.lat)
      const lng = parseFloat(this.newMarker.lng)
      const packages = parseInt(this.newMarker.packages)

      if (!isNaN(lat) && !isNaN(lng) && packages >= 1) {
        if (this.validateLocation(lat, lng)) {
          this.markers.push({
            position: [lat, lng],
            packages: packages
          })

          // Limpiar el formulario
          this.newMarker.lat = ''
          this.newMarker.lng = ''
          this.newMarker.packages = 1
        }
      }
    },
    async optimizeRoute() {
      try {
        // Obtener ruta optimizada
        const optimizedRoute = findOptimalRoute(
          { position: this.warehousePosition },
          this.markers
        );
        // Dibujar ruta en el mapa usando Mapbox
        const routeData = await this.$refs.mapView.drawOptimizedRoute(optimizedRoute);
        this.routeInfo = {
          duration: routeData.duration,
          distance: routeData.distance
        };
      } catch (error) {
        console.error('Error al optimizar ruta:', error);
      }

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
  /*Scroll */
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  /* Opcional: para hacer el scroll más suave */
  scroll-behavior: smooth;
  /* Opcional: para ocultar el scroll en algunos navegadores */
  scrollbar-width: thin;
}

/* (Webkit browsers) */
.controls-section::-webkit-scrollbar {
  width: 8px;
}

.controls-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.controls-section::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.controls-section::-webkit-scrollbar-thumb:hover {
  background: #555;
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

/*formulario */
.coordinates-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group {
  display: flex;
  gap: 10px;
}

.form-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, .25);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coordinate-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.input-wrapper {
  flex: 1;
  min-width: 140px;
  /* Evita que los inputs se hagan demasiado pequeños */
}

.package-input {
  flex: 0 1 100px;
  /* El input de paquetes puede ser más pequeño */
}

label {
  display: block;
  margin-bottom: 4px;
  color: #495057;
  font-size: 0.9rem;
}

.form-input {
  width: 93%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.add-btn {
  width: 100%;
  background-color: #2872a7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #213788;
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  .coordinate-inputs {
    flex-direction: column;
  }

  .input-wrapper {
    width: 100%;
  }

  .package-input {
    width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .input-wrapper {
    min-width: 120px;
  }
}

/*error message */

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  background-color: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

/*Paquetes */

.packages-info {
  font-size: 0.9em;
  color: #666;
  margin-top: 2px;
}

.packages-input {
  width: 100px;
}

/*optimizacion */

.optimize-btn {
  background-color: #28a72a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.optimize-btn:hover {
  background-color: #588821;
}

/*mapbox */

.route-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-item {
  margin-bottom: 8px;
}

.info-label {
  font-weight: bold;
  color: #495057;
}

.info-value {
  margin-left: 8px;
  color: #2872a7;
}
</style>
