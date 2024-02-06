import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { IonAlert, IonContent, IonToast } from '@ionic/react';
import haversine from 'haversine-distance';

const GymClaimPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const blueGymLocation = {
    lat: 46.3765504 + 0.00003,
    lng: -116.9948672 + 0.00003,
  };
  const blueGymLocation2 = {
    lat: 46.3765504 + 0.00010,
    lng: -116.9948672 + 0.00003,
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location', error);
      }
    );
  }, []);

  const handleMarkerClick = (gym: any) => {
    setSelectedGym(gym);
    setShowAlert(true);
  };

  const canAddGym = (selectedGym: any) => {
    if (!userLocation || !selectedGym) {
      return false;
    }

    const distance = haversine(userLocation, {
      latitude: selectedGym.lat,
      longitude: selectedGym.lng,
    });

    return distance <= 10; // Set your desired radius in meters
  };

  const handleAddGym = () => {
    if (canAddGym(selectedGym)) {
      console.log(`Added ${selectedGym?.name || 'Gym'} to the profile`);
      setShowSuccessToast(true);
      setSelectedGym(null);
    } else {
      console.error('Selected gym is outside the allowed radius');
      setShowErrorToast(true);
    }
  };

  const mapContainerStyle = {
    height: '100vh',
    width: '100%',
  };

  return (
    <IonContent>
      {userLocation && (
        <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation} zoom={20}>
          <Marker position={userLocation} label="You" />

          {/* Blue gym markers */}
          <Marker
            position={blueGymLocation}
            label="Gym (Blue)"
            onClick={() => handleMarkerClick({ lat: blueGymLocation.lat, lng: blueGymLocation.lng })}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
          <Marker
            position={blueGymLocation2}
            label="Gym (Yellow)"
            onClick={() => handleMarkerClick({ lat: blueGymLocation2.lat, lng: blueGymLocation2.lng })}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />

          {/* Circle around user location */}
          <Circle
            center={userLocation}
            radius={10} // Set your desired radius in meters
            options={{
              strokeColor: '#ff0000',
              fillColor: '#ff0000',
              fillOpacity: 0.2,
              strokeOpacity: 0.8,
            }}
          />
        </GoogleMap>
      )}

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={`Add ${selectedGym?.name || 'Gym'} to your profile?`}
        message={`Do you want to add ${selectedGym?.name || 'Gym'} to your profile?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setSelectedGym(null);
            },
          },
          {
            text: 'Add',
            handler: handleAddGym,
          },
        ]}
      />

      <IonToast
        isOpen={showSuccessToast}
        onDidDismiss={() => setShowSuccessToast(false)}
        message="Nice! Added to profile!"
        duration={3000}
        position="bottom"
        color="success"
      />

      <IonToast
        isOpen={showErrorToast}
        onDidDismiss={() => setShowErrorToast(false)}
        message="Gym is outside the allowed radius"
        duration={3000}
        position="bottom"
        color="warning"
      />
    </IonContent>
  );
};

export default GymClaimPage;
