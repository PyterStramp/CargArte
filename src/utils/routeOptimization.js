// utils/routeOptimization.js
export function calculateDistance(point1, point2) {
  // Fórmula de Haversine
  const R = 6371
  const [lat1, lon1] = point1
  const [lat2, lon2] = point2

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180
}

function createClusters(points, maxDistance) {
  const clusters = []
  const unassigned = [...points]

  while (unassigned.length > 0) {
    const cluster = []
    const point = unassigned.pop()
    cluster.push(point)

    // Encontrar puntos cercanos
    for (let i = unassigned.length - 1; i >= 0; i--) {
      if (calculateDistance(point.position, unassigned[i].position) <= maxDistance) {
        cluster.push(unassigned[i])
        unassigned.splice(i, 1)
      }
    }

    clusters.push(cluster)
  }

  return clusters
}

function getClusterCenter(cluster) {
  const sum = cluster.reduce(
    (acc, point) => {
      return [acc[0] + point.position[0], acc[1] + point.position[1]]
    },
    [0, 0],
  )

  return [sum[0] / cluster.length, sum[1] / cluster.length]
}

function optimizeClusterRoute(startPoint, cluster) {
  // Optimizar ruta dentro del cluster usando cercanía
  let currentPoint = startPoint
  const route = []
  const unvisited = [...cluster]

  while (unvisited.length > 0) {
    const nearest = findNearestPoint(currentPoint, unvisited)
    route.push(nearest)
    unvisited.splice(unvisited.indexOf(nearest), 1)
    currentPoint = nearest
  }

  return route
}

function findNearestPoint(from, points) {
  return points.reduce((nearest, current) => {
    const currentDistance = calculateDistance(from.position, current.position)
    const nearestDistance = calculateDistance(from.position, nearest.position)
    return currentDistance < nearestDistance ? current : nearest
  })
}

export function findOptimalRoute(warehouse, deliveryPoints) {
  // 1. Agrupar puntos cercanos primero
  const clusters = createClusters(deliveryPoints, 0.5) // 0.5 km como radio de agrupación

  // 2. Optimizar la ruta considerando grupos y paquetes
  const route = []
  let currentPosition = warehouse

  while (clusters.length > 0) {
    // Calcular costo para cada cluster
    const costs = clusters.map((cluster) => {
      // Promedio de coordenadas del cluster
      const clusterCenter = getClusterCenter(cluster)

      // Distancia al centro del cluster
      const distance = calculateDistance(currentPosition.position, clusterCenter)

      // Total de paquetes en el cluster
      const totalPackages = cluster.reduce((sum, point) => sum + point.packages, 0)

      // Fórmula de costo:
      // Menor distancia = mejor (multiplicador negativo)
      // Más paquetes = mejor (multiplicador negativo)
      return {
        cluster,
        cost: distance * 0.7 - totalPackages * 0.3, // 70% distancia, 30% paquetes
      }
    })

    // Seleccionar el mejor cluster
    const bestCluster = costs.reduce((best, current) =>
      current.cost < best.cost ? current : best,
    ).cluster

    // Optimizar ruta dentro del cluster
    const clusterRoute = optimizeClusterRoute(currentPosition, bestCluster)
    route.push(...clusterRoute)

    // Actualizar posición actual
    currentPosition = route[route.length - 1]

    // Remover cluster procesado
    clusters.splice(clusters.indexOf(bestCluster), 1)
  }

  return route
}
