import { MAPBOX_ACCESS_TOKEN } from '@/config/mapbox'

export async function getRouteDirections(points) {
  // Formatear los puntos para la API de Mapbox
  const coordinates = points.map((point) => `${point.position[1]},${point.position[0]}`).join(';')
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('No hay token')
  }
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`,
  )

  if (!response.ok) {
    throw new Error('Error al obtener la ruta')
  }

  const data = await response.json()
  return {
    geometry: data.routes[0].geometry,
    duration: Math.round(data.routes[0].duration / 60), // en minutos
    distance: (data.routes[0].distance / 1000).toFixed(2), // en kilómetros
  }
}
