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
        <p>
          {{ warehousePosition[0].toFixed(4) }}, {{ warehousePosition[1].toFixed(4) }}
        </p>
      </div>
      <div v-if="markers.length > 0">
        <h3>Puntos de Entrega</h3>
        <ul class="marker-list">
          <li v-for="(marker, index) in markers" :key="index" class="marker-item">
            <div class="marker-details">
              <div class="marker-info">
                <div class="marker-title">Punto #{{ index + 1 }}</div>
                <div class="marker-address">{{ marker.address }}</div>
                <div class="marker-coordinates">
                  {{ marker.position[0].toFixed(4) }}, {{ marker.position[1].toFixed(4) }}
                </div>
              </div>
              <div class="packages-info">Paquetes: {{ marker.packages }}</div>
            </div>
            <button @click="removeMarker(index)" class="delete-btn">X</button>
          </li>
        </ul>
      </div>
      <p v-else>Haga clic en el mapa para añadir puntos de entrega</p>

      <!-- Formulario de coordenadas -->
      <div class="coordinates-form">
        <h3>Ingresa por coordenadas</h3>
        <form @submit.prevent="addMarkerByCoordinates" class="form-group">
          <div class="input-container">
            <div class="coordinate-inputs">
              <div class="input-wrapper">
                <label for="latitude">Latitud</label>
                <input id="latitude" type="number" v-model="newMarker.lat" step="any" required class="form-input" />
              </div>
              <div class="input-wrapper">
                <label for="longitude">Longitud</label>
                <input id="longitude" type="number" v-model="newMarker.lng" step="any" required class="form-input" />
              </div>
              <div class="input-wrapper package-input">
                <label for="packages">Paquetes</label>
                <input id="packages" type="number" v-model="newMarker.packages" min="1" required class="form-input" />
              </div>
            </div>
            <button type="submit" class="add-btn">Añadir Punto</button>
          </div>
          <div v-if="validationError" class="error-message">
            {{ validationError }}
          </div>
        </form>
      </div>

      <div class="coordinates-form">
        <h3>Ingresa por dirección</h3>
        <form @submit.prevent="addMarkerByAddress" class="form-group">
          <div class="input-container">
            <div class="address-input">
              <label for="address">Dirección</label>
              <input id="address" type="text" v-model="newMarker.address" required class="form-input" />
            </div>
            <div class="input-wrapper package-input">
              <label for="packages">Paquetes</label>
              <input id="packages" type="number" v-model="newMarker.packages" min="1" required class="form-input" />
            </div>
            <button type="submit" class="add-btn">Añadir Punto</button>
          </div>
          <div v-if="validationError" class="error-message">
            {{ validationError }}
          </div>
        </form>
      </div>

      <!-- Botones de optimización y guardado -->
      <div class="actions-container">
        <button v-if="markers.length > 1" @click="optimizeRoute" :disabled="isOptimized" class="optimize-btn">
          {{ isOptimizing ? 'Optimizando...' : 'Optimizar Ruta' }}
        </button>

        <button v-if="isOptimized" @click="showSaveRouteModal" class="save-btn">
          Guardar Ruta
        </button>
      </div>

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
      <!-- Modal para guardar ruta -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Guardar Ruta</h2>
            <button @click="closeModal" class="close-btn">&times;</button>
          </div>
          <div class="modal-content">
            <RouteForm @submit="handleSaveRoute" @cancel="closeModal" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MapView from "@/components/MapView.vue";
import { findOptimalRoute } from "@/utils/routeOptimization";
import { getLocation } from '@/services/routeService'
import RouteForm from '@/components/RouteForm.vue';
import { useRouteStore } from '@/stores/routeStore';

export default {
  name: "RutasView",
  components: {
    MapView, RouteForm
  },
  data() {
    return {
      markers: [],
      warehousePosition: [4.757786586246297, -74.04488664305592],
      newMarker: {
        lat: "",
        lng: "",
        address: "",
        packages: 1,
      },
      validationError: null,
      optimizedRoute: null,
      routeInfo: null,
      isOptimizing: false,
      isOptimized: false,
      showModal: false,
      isSaving: false
    };
  },
  setup() {
    const routeStore = useRouteStore(); // Inicializar el store
    return { routeStore };
  },
  methods: {

    async handleMarkerAdded(marker) {
      try {
        const locationData = await getLocation({
          latlng: { lat: marker.position[0], lng: marker.position[1] }
        });

        if (locationData.isValid) {
          this.markers.push({
            position: locationData.coordinates,
            address: locationData.address,
            packages: marker.packages || 1,
          });
        } else {
          this.validationError = locationData.error;
        }
      } catch (error) {
        console.error("Error al procesar ubicación:", error);
        this.validationError = "Error al procesar la ubicación";
      }
    },

    async addMarkerByCoordinates() {
      const lat = parseFloat(this.newMarker.lat);
      const lng = parseFloat(this.newMarker.lng);
      const packages = parseInt(this.newMarker.packages);

      if (!isNaN(lat) && !isNaN(lng) && packages >= 1) {
        try {
          const locationData = await getLocation({ lat, lng });

          if (locationData.isValid) {
            this.markers.push({
              position: locationData.coordinates,
              address: locationData.address,
              packages: packages,
            });

            // Limpiar el formulario
            this.newMarker.lat = "";
            this.newMarker.lng = "";
            this.newMarker.packages = 1;
            this.validationError = null;
          } else {
            this.validationError = locationData.error;
          }
        } catch (error) {
          console.error("Error al procesar coordenadas:", error);
          this.validationError = "Error al procesar las coordenadas";
        }
      }
    },

    async addMarkerByAddress() {
      const address = this.newMarker.address;
      const packages = parseInt(this.newMarker.packages);

      if (address && packages >= 1) {
        try {
          const locationData = await getLocation(address);

          if (locationData.isValid) {
            this.markers.push({
              position: locationData.coordinates,
              address: locationData.address,
              packages: packages,
            });

            // Limpiar el formulario
            this.newMarker.address = "";
            this.newMarker.packages = 1;
            this.validationError = null;
          } else {
            this.validationError = locationData.error;
          }
        } catch (error) {
          console.error("Error al procesar dirección:", error);
          this.validationError = "Error al procesar la dirección";
        }
      }
    },

    removeMarker(index) {
      this.markers.splice(index, 1);
    },

    async optimizeRoute() {
      try {
        this.isOptimizing = true;
        const optimizedRoute = findOptimalRoute(
          { position: this.warehousePosition },
          this.markers
        );
        const routeData = await this.$refs.mapView.drawOptimizedRoute(optimizedRoute);
        this.routeInfo = {
          duration: routeData.duration,
          distance: routeData.distance,
        };
        this.isOptimized = true;
      } catch (error) {
        console.error("Error al optimizar ruta:", error);
        this.validationError = "Error al optimizar la ruta";
      } finally {
        this.isOptimizing = false;
      }
    },

    showSaveRouteModal() {
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async handleSaveRoute(formData) {
      try {
        this.isSaving = true;

        // Preparar los datos de la ruta
        const routeData = {
          name: formData.name,
          driverId: formData.driverId,
          vehicleId: formData.vehicleId,
          date: formData.date,
          // Incluir información de duración y distancia
          duration: this.routeInfo?.duration,
          distance: this.routeInfo?.distance
        };

        // Guardar la ruta y sus puntos
        const result = await this.routeStore.saveRoute(routeData, this.markers);

        if (result.success) {
          // Mostrar mensaje de éxito
          alert('Ruta guardada correctamente');

          // Cerrar modal y limpiar estado
          this.closeModal();
          this.clearRoute();
        }
      } catch (error) {
        console.error('Error al guardar la ruta:', error);
        // Mostrar alerta de error
        alert('Error al guardar la ruta: ' + error.message);
      } finally {
        this.isSaving = false;
      }
    },

    clearRoute() {
      // Limpiar el estado después de guardar
      this.markers = [];
      this.routeInfo = null;
      this.isOptimized = false;
      this.optimizedRoute = null;
      if (this.$refs.mapView) {
        this.$refs.mapView.clearRoute();
      }
    },
  },
};
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
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
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

/*new */
.marker-details {
  flex: 1;
}

.marker-title {
  font-weight: bold;
  color: #2872a7;
  margin-bottom: 4px;
}

.marker-address {
  font-size: 0.9em;
  color: #333;
  margin-bottom: 2px;
}

.marker-coordinates {
  font-size: 0.8em;
  color: #666;
}

.marker-item {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 8px;
  padding: 12px;
}

.marker-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background-color: #218838;
}

/* Estilos del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-content {
  padding: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #6c757d;
}

.close-btn:hover {
  color: #343a40;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
