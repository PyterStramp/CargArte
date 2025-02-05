// routeService.js

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

import { validateCoordinates } from '@/utils/geoValidation'
import bogotaBoundariesData from '@/assets/bogota-boundaries.json'
//netamente para crear
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const createRoute = async (routeData) => {
  try {
    // Crear la ruta principal
    const routeResponse = await axios.post(`${API_BASE_URL}/api/routes`, {
      name: routeData.name,
      driver_id: routeData.driverId,
      vehicle_id: routeData.vehicleId,
      date: routeData.date,
      status: 'Pending'
    });

    if (!routeResponse.data.success) {
      throw new Error('Error al crear la ruta');
    }

    const routeId = routeResponse.data.data.id;

    // Crear los puntos de entrega
    const deliveryPointsPromises = routeData.deliveryPoints.map(point =>
      axios.post(`${API_BASE_URL}/api/routes/${routeId}/delivery-points`, {
        latitude: point.position[0],
        longitude: point.position[1],
        address: point.address,
        packages_count: point.packages
      })
    );

    await Promise.all(deliveryPointsPromises);

    return {
      success: true,
      routeId
    };
  } catch (error) {
    console.error('Error al guardar la ruta:', error);
    throw error;
  }
};

// Función unificada para obtener ubicación
export async function getLocation(input) {
  // El input puede ser:
  // - Un objeto {lat, lng} para coordenadas directas
  // - Un string para dirección
  // - Un objeto {latlng} para clic en el mapa

  try {
    let coordinates

    if (typeof input === 'string') {
      // Caso: Dirección
      coordinates = await geocodeAddress(input)
    } else if (input.lat && input.lng) {
      // Caso: Coordenadas directas
      coordinates = [input.lat, input.lng]
    } else if (input.latlng) {
      // Caso: Clic en el mapa
      coordinates = [input.latlng.lat, input.latlng.lng]
    } else {
      throw new Error('Formato de entrada no válido')
    }

    // Validar que las coordenadas estén dentro de Bogotá
    if (!validateCoordinates(coordinates[0], coordinates[1], bogotaBoundariesData)) {
      throw new Error(
        '¡Ah, parece que tus coordenadas están más perdidas que un sordo en un tiroteo! 🗺️😅\n\n CargArte tiene sus fronteras bien trazadas dentro de Bogotá. ¡Pasear por fuera de la ciudad tendrá que esperar un poco más! 🌆🚫\n\n ¿Algún otro espacio de Bogotá en mente para tu pedido? 📍',
      )
    }

    // Obtener la dirección formateada para mostrar
    const address = await reverseGeocode(coordinates[0], coordinates[1])

    return {
      coordinates,
      address,
      isValid: true,
    }
  } catch (error) {
    console.error('Error al procesar ubicación:', error)
    return {
      isValid: false,
      error: error.message,
    }
  }
}

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

//obtener ruta como tal
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

// Geocodificar dirección a coordenadas
async function geocodeAddress(address) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address + ', Bogotá, Colombia',
    )}.json?` + new URLSearchParams({ access_token: MAPBOX_ACCESS_TOKEN }),
  )

  const data = await response.json()
  if (!data.features || data.features.length === 0) {
    throw new Error('No se pudo encontrar la dirección')
  }

  const [lng, lat] = data.features[0].center
  return [lat, lng]
}

// Geocodificación inversa para obtener dirección
async function reverseGeocode(lat, lng) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
      new URLSearchParams({ access_token: MAPBOX_ACCESS_TOKEN }),
  )

  const data = await response.json()
  if (!data.features || data.features.length === 0) {
    return 'Dirección no encontrada'
  }

  return data.features[0].place_name
}

// Mantén las funciones existentes
