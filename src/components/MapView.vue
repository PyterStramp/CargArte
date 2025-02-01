<!--MapView-->
<template>
  <div class="map-container">
    <l-map ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="true" @click="handleMapClick">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
        name="OpenStreetMap"></l-tile-layer>

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
      <!-- Límites de Bogotá -->
      <l-geo-json :geojson="boundaries" :options="geoJsonOptions" />
    </l-map>


  </div>
</template>

<script>

import { LGeoJson, LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import bogotaBoundariesData from '@/assets/bogota-boundaries.json'

export default {
  name: 'MapView',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LIcon,
    LGeoJson
  },
  props: {
    markers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      zoom: 16,
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
      }
    }
  },
  methods: {
    handleMapClick(event) {
      const { lat, lng } = event.latlng
      this.$emit('marker-added', {
        position: [lat, lng]
      })
    }
  }
}
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}
</style>
