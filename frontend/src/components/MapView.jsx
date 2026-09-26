import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, ShieldAlert, Activity, Battery, Radio, Gauge } from 'lucide-react';

// Custom Leaflet HTML Pin Creator for Vehicles
const createCustomVehicleIcon = (status, regNumber) => {
  let colorClass = 'bg-emerald-500 border-emerald-300 glow-green'; // MOVING
  if (status === 'ALCOHOL_ALERT' || status === 'SOS_ALERT') {
    colorClass = 'bg-red-500 border-red-300 glow-red animate-bounce';
  } else if (status === 'IDLE') {
    colorClass = 'bg-amber-500 border-amber-300 glow-yellow';
  } else if (status === 'OFFLINE') {
    colorClass = 'bg-slate-500 border-slate-400';
  } else if (status === 'STOPPED') {
    colorClass = 'bg-blue-500 border-blue-300';
  }

  const customHtml = `
    <div class="relative group cursor-pointer flex flex-col items-center">
      <div class="w-8 h-8 rounded-full ${colorClass} border-2 flex items-center justify-center text-slate-950 font-bold shadow-2xl text-[10px] transform transition-transform hover:scale-125">
        🚗
      </div>
      <div class="mt-1 bg-slate-900/90 text-cyan-300 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border border-slate-700 shadow-md">
        ${regNumber}
      </div>
    </div>
  `;

  return L.divIcon({
    html: customHtml,
    className: 'custom-leaflet-pin',
    iconSize: [40, 50],
    iconAnchor: [20, 25]
  });
};

// Map Recenter Helper Component
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export const MapView = ({ vehicles = [], geofences = [], selectedVehicle, onSelectVehicle }) => {
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]);

  useEffect(() => {
    if (selectedVehicle && selectedVehicle.location) {
      setMapCenter([selectedVehicle.location.latitude, selectedVehicle.location.longitude]);
    }
  }, [selectedVehicle]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px]"
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={mapCenter} />

        {/* Display Registered Geofence Circles */}
        {geofences.map(gf => (
          <Circle
            key={gf.id}
            center={[gf.center_lat, gf.center_lng]}
            radius={gf.radius || 1000}
            pathOptions={{ color: '#06b6d4', fillColor: '#0891b2', fillOpacity: 0.15, weight: 2, dashArray: '6, 6' }}
          >
            <Popup>
              <div className="p-1 text-slate-900 font-sans">
                <div className="font-bold text-xs text-cyan-800">📍 Geofence Zone</div>
                <div className="font-semibold text-sm">{gf.name}</div>
                <div className="text-[11px] text-slate-600">Radius: {gf.radius}m</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Display All Live Vehicles */}
        {vehicles.map(v => {
          const loc = v.location || { latitude: 11.0168, longitude: 76.9558, speed: 0, ignition: 'OFF' };
          const isAlert = v.status === 'ALCOHOL_ALERT' || v.status === 'SOS_ALERT';

          return (
            <Marker
              key={v.id}
              position={[loc.latitude, loc.longitude]}
              icon={createCustomVehicleIcon(v.status, v.registration_number)}
              eventHandlers={{
                click: () => onSelectVehicle && onSelectVehicle(v)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 text-slate-900 font-sans w-56">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                    <span className="font-extrabold text-sm text-cyan-900">{v.registration_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                      isAlert ? 'bg-red-600' : v.status === 'MOVING' ? 'bg-emerald-600' : 'bg-slate-600'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Driver:</span>
                      <span className="font-bold">{v.driver?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Vehicle:</span>
                      <span>{v.brand} {v.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Speed:</span>
                      <span className="font-mono font-bold text-cyan-700">{loc.speed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Ignition:</span>
                      <span className={loc.ignition === 'ON' ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                        {loc.ignition}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Alcohol Sensor:</span>
                      <span className={`font-bold ${v.sensor?.last_reading > 0.08 ? 'text-red-600 font-black' : 'text-emerald-600'}`}>
                        {v.sensor?.status === 'ALCOHOL_DETECTED' ? '🚨 ALCOHOL DETECTED' : 'SAFE (0.00)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">GPS / Network:</span>
                      <span className="text-emerald-600 font-semibold">CONNECTED</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
