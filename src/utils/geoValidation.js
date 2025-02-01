export function isPointInPolygon(point, polygon) {
  const [x, y] = point
  let inside = false

  // Para cada par de vértices en el polígono
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

export function validateCoordinates(lat, lng, boundaries) {
  const coordinates = boundaries.features[0].geometry.coordinates[0] // Primer anillo del polígono
  return isPointInPolygon([lng, lat], coordinates)
}
