<!--MapView-->
<template>
  <div class="map-container">
    <l-map ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="false" @click="handleMapClick">
      <l-tile-layer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" layer-type="base"
        name="CartoDB"></l-tile-layer>

      <!-- Marcador de la bodega -->
      <l-marker :lat-lng="warehousePosition">
        <l-icon :icon-url="warehouseIcon" :icon-size="[35, 40]" />
        <l-popup>
          <strong>Bodega (Punto de partida)</strong><br>
          Lat: {{ warehousePosition[0] }}<br>
          Lng: {{ warehousePosition[1] }}
        </l-popup>
      </l-marker>

      <!-- Marcadores de puntos de entrega -->
      <l-marker v-for="(marker, index) in markers" :key="index" :lat-lng="marker.position">
        <l-icon :icon-url="deliveryIcon" :icon-size="[30, 35]" />
        <l-popup>
          Punto de entrega #{{ index + 1 }}<br>
          Lat: {{ marker.position[0].toFixed(4) }}<br>
          Lng: {{ marker.position[1].toFixed(4) }}
        </l-popup>
      </l-marker>

      <!-- Marcador temporal con popup para ingresar paquetes -->
      <l-marker v-if="tempMarker" :lat-lng="tempMarker.position">
        <l-icon :icon-url="deliveryIcon" :icon-size="[30, 35]" />
        <l-popup :opened="true" @close="cancelTempMarker">
          <div class="package-input">
            <p>Número de paquetes:</p>
            <div class="input-controls">
              <input type="number" v-model="tempMarker.packages" min="1" class="package-number">
              <button @click="confirmMarker" class="confirm-btn">✓</button>
              <button @click="cancelTempMarker" class="cancel-btn">×</button>
            </div>
          </div>
        </l-popup>
      </l-marker>

      <!-- Rutas con diferentes colores -->
      <l-geo-json v-for="(segment, index) in routeSegments" :key="`segment-${index}`" :geojson="{
        type: 'Feature',
        geometry: segment.geometry,
        properties: {}
      }" :options-style="segment.options.style" />

      <!-- Límites de Bogotá -->
      <l-geo-json :geojson="boundaries" :options="geoJsonOptions" />
    </l-map>
  </div>
</template>

<script>

import { LGeoJson, LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import bogotaBoundariesData from '@/assets/bogota-boundaries.json'
import { getRouteDirections } from '@/services/routeService';

export default {
  name: 'MapView',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LIcon,
    LGeoJson,
  },
  props: {
    markers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      zoom: 14,
      center: [4.757786586246297, -74.04488664305592],
      warehousePosition: [4.757786586246297, -74.04488664305592],
      warehouseIcon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      deliveryIcon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      boundaries: bogotaBoundariesData,
      geoJsonOptions: {
        style: {
          fillColor: '#3388ff',
          weight: 2,
          opacity: 1,
          color: '#3388ff',
          fillOpacity: 0.1
        }
      },
      tempMarker: null,
      routeLines: null,
      routeGeometry: null,
      routeSegments: null,
      routeColors: [
        '#2872a7',  // azul
        '#28a745',  // verde
        '#dc3545',  // rojo
        '#ffc107',  // amarillo
        '#6610f2',  // morado
        '#fd7e14',  // naranja
        '#20c997',  // verde claro
        '#6f42c1',  // púrpura
        '#e83e8c',  // rosado
        '#fdc500',  // amarillo dorado
        '#343a40',  // gris oscuro
        '#17a2b8',  // azul claro
        '#ff851b',  // naranja oscuro
        '#2f8fd1',  // azul cielo
        '#3ddc84',  // verde neón
        '#ba12a2'   // fucsia
      ],

    }
  },
  methods: {
    handleMapClick(event) {
      const { lat, lng } = event.latlng
      this.tempMarker = {
        position: [lat, lng],
        packages: 1
      }
    },
    confirmMarker() {
      if (this.tempMarker && this.tempMarker.packages >= 1) {
        this.$emit('marker-added', {
          position: this.tempMarker.position,
          packages: parseInt(this.tempMarker.packages)
        })
        this.tempMarker = null
      }
    },
    cancelTempMarker() {
      this.tempMarker = null
    },
    getRouteColor(index) {
      return this.routeColors[index % this.routeColors.length];
    },
    async drawOptimizedRoute(points) {
      try {
        const allStops = [
          [this.warehousePosition[1], this.warehousePosition[0]],
          ...points.map(p => [p.position[1], p.position[0]])
        ];

        const routeData = await getRouteDirections(allStops);

        this.routeSegments = routeData.legs.map((leg, index) => ({
          type: 'Feature',
          geometry: leg.geometry,
          properties: {},
          options: {
            style: {
              color: this.getRouteColor(index),
              weight: 5,
              opacity: 0.7
            }
          }
        }));

        return {
          duration: Math.round(routeData.duration / 60),
          distance: (routeData.distance / 1000).toFixed(2)
        };
      } catch (error) {
        console.error('Route drawing failed:', error);
        return { duration: 0, distance: 0 };
      }
    }
  }
}
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}

.package-input {
  padding: 10px;
  text-align: center;
}

.input-controls {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
}

.package-number {
  width: 60px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.confirm-btn,
.cancel-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  background-color: #28a745;
  color: white;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}
</style>
