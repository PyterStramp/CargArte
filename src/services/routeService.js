import { MAPBOX_ACCESS_TOKEN } from '@/config/mapbox'

// Helper to merge step geometries into continuous leg geometry
function processLegGeometry(leg) {
  if (!leg.steps || !Array.isArray(leg.steps)) {
    console.error('No steps found in leg:', leg)
    return {
      type: 'LineString',
      coordinates: [],
    }
  }

  const coordinates = leg.steps.reduce((acc, step) => {
    if (step.geometry && step.geometry.coordinates) {
      // Para el primer paso, tomamos todas las coordenadas
      // Para los demás, omitimos la primera para evitar duplicados
      const coords =
        acc.length === 0 ? step.geometry.coordinates : step.geometry.coordinates.slice(1)
      return [...acc, ...coords]
    }
    return acc
  }, [])

  return {
    type: 'LineString',
    coordinates,
  }
}

export async function getRouteDirections(points) {
  // Formatear los puntos para la API de Mapbox
  const coordinates = points.map((point) => `${point[0]},${point[1]}`).join(';')

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
        new URLSearchParams({
          geometries: 'geojson',
          steps: 'true',
          overview: 'full',
          access_token: MAPBOX_ACCESS_TOKEN,
        }),
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.routes || !data.routes[0] || !data.routes[0].legs) {
      throw new Error('Invalid response format from Mapbox')
    }

    const route = data.routes[0]

    // Procesar cada segmento entre puntos
    const legs = route.legs.map((leg, index) => ({
      geometry: processLegGeometry(leg),
      distance: leg.distance,
      duration: leg.duration,
      index: index, // útil para colorear después
    }))

    return {
      legs,
      distance: route.distance,
      duration: route.duration,
    }
  } catch (error) {
    console.error('Route calculation failed:', error)
    throw error
  }
}
