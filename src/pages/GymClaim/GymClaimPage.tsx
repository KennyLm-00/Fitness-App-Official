// Install dependencies:
// npm install @react-google-maps/api
// npm install @types/googlemaps --save-dev

import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapContainer: React.FC = () => {
  const [map, setMap] = useState(null as google.maps.Map | null);
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    // Fetch user's location (you can use any method to get the user's location)
    navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting user location:', error);
      }
    );
  }, []);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyDNaMIlTmrnzOONweTwzTKgkkycbCA5qUc"
      libraries={['places']}
    >
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100vh',
        }}
        center={userLocation}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {map && <Marker position={userLocation} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapContainer;