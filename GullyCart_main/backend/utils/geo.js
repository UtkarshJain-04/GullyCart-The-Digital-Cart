function toCoordinate(value, fieldName) {
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate)) {
    throw new Error(`${fieldName} must be a number.`);
  }
  return coordinate;
}

function normalizePoint(point, inputOrder = 'latitude-longitude') {
  if (Array.isArray(point)) {
    if (point.length !== 2) throw new Error('Point coordinates must be an array of two numbers.');
    const first = toCoordinate(point[0], 'Point coordinate');
    const second = toCoordinate(point[1], 'Point coordinate');
    return {
      type: 'Point',
      coordinates: inputOrder === 'latitude-longitude' ? [second, first] : [first, second],
    };
  }

  if (!point || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
    throw new Error('Point must contain coordinates as an array of two numbers.');
  }

  const longitude = toCoordinate(point.coordinates[0], 'Longitude');
  const latitude = toCoordinate(point.coordinates[1], 'Latitude');
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    throw new Error('Point coordinates are outside valid longitude/latitude ranges.');
  }

  return { type: 'Point', coordinates: [longitude, latitude] };
}

module.exports = { normalizePoint };