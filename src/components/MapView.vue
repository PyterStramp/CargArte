<template>
  <div class="map-container">
    <l-map ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="true">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
        name="OpenStreetMap"></l-tile-layer>
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'

export default {
  name: 'MapView',
  components: {
    LMap,
    LTileLayer
  },
  data() {
    return {
      zoom: 13,
      center: [4.757786586246297, -74.04488664305592],
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
