import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useLocationStore } from '../stores/locationStore'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet marker icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

export function LiveMap({ vendorId }) {
  const vendorLocation = useLocationStore((state) => state.vendorLocation);

  if (!vendorLocation) {
    return <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>Waiting for vendor location...</div>;
  }

  const position = [vendorLocation.latitude, vendorLocation.longitude];

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Vendor is here!
          </Popup>
        </Marker>
        <MapRecenter position={position} />
      </MapContainer>
    </div>
  );
}
