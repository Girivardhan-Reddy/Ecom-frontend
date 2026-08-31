const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

const normalizeAddress = (data) => {
  if (!data) return null;
  const address = data.address || {};
  return {
    title: address.suburb || address.neighbourhood || address.village || address.town || address.city || 'Current location',
    subtitle: data.display_name || '',
    address: data.display_name || '',
    city: address.city || address.town || address.county || '',
  };
};

export const reverseGeocodeOpenStreetMap = async (lat, lng) => {
  const response = await fetch(`${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`);
  if (!response.ok) throw new Error('Location lookup failed.');
  return normalizeAddress(await response.json());
};

export const geocodeOpenStreetMap = async (query) => {
  const response = await fetch(`${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Address lookup failed.');
  const data = await response.json();
  return data[0] ? { ...normalizeAddress(data[0]), lat:Number(data[0].lat), lng:Number(data[0].lon) } : null;
};

export const openStreetMapLocationUrl = ({ lat, lng, zoom = 17 }) => `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lng)}#map=${zoom}/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}`;
export const openStreetMapDirectionsUrl = ({ origin, destination }) => `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(origin)}%3B${encodeURIComponent(destination)}`;
export const openStreetMapEmbedUrl = ({ lat, lng, delta = 0.012 }) => `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(lng-delta)}%2C${encodeURIComponent(lat-delta)}%2C${encodeURIComponent(lng+delta)}%2C${encodeURIComponent(lat+delta)}&layer=mapnik&marker=${encodeURIComponent(lat)}%2C${encodeURIComponent(lng)}`;
