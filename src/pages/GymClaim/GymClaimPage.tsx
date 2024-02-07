import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { IonAlert, IonContent, IonButton, IonIcon, IonList, IonItem, IonPopover, IonToast } from '@ionic/react';
import haversine from 'haversine-distance';
import { getDocs, getDoc, collection, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebaseConfig';
import { caretDownOutline } from 'ionicons/icons';

const GymClaimPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [gyms, setGyms] = useState<{ id: string; lat: number; lng: number; name: string }[]>([]);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);
  const [claimedGyms, setClaimedGyms] = useState<string[]>([]);

  const gymsCollection = collection(firestore, 'gyms');

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const querySnapshot = await getDocs(gymsCollection);
        const gymsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          lat: doc.data().lat,
          lng: Number(doc.data().lng),
          name: doc.data().name,
        }));
        setGyms(gymsData);

        // console.log('gymsData:', gymsData);
      } catch (error) {
        console.error('Error fetching gyms:', error);
      }
    };

    const fetchClaimedGyms = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const gymsClaimed = userDoc.data()?.gymsClaimed || [];
            setClaimedGyms(gymsClaimed);
          }
        }
      } catch (error) {
        console.error('Error fetching claimed gyms:', error);
      }
    };

    fetchGyms();
    fetchClaimedGyms();
  }, []);

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
    return (
      !!userLocation &&
      !!selectedGym &&
      'lat' in selectedGym &&
      'lng' in selectedGym &&
      haversine(userLocation, { lat: selectedGym.lat, lng: selectedGym.lng }) <= 10
    );
  };

  const handleAddGym = async () => {
    console.log('Selected Gym:', selectedGym);

    if (canAddGym(selectedGym) && selectedGym.name) {
      try {
        const user = auth.currentUser;

        if (user) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            await updateDoc(userDocRef, { gymsClaimed: arrayUnion(selectedGym.name) });

            console.log(`Added ${selectedGym.name} to the profile`);
            setShowSuccessToast(true);
            setSelectedGym(null);
          } else {
            console.error('User document not found.');
            setShowErrorToast(true);
          }
        }
      } catch (error) {
        console.error('Error updating user document:', error);
        setShowErrorToast(true);
      }
    } else {
      console.error('Selected gym is outside the allowed radius or its name is undefined');
      setShowErrorToast(true);
    }
  };

  const mapContainerStyle = {
    height: '100vh',
    width: '100%',
  };

  const openPopover = (event: any) => {
    event.persist();
    setPopoverEvent(event);
    setShowPopover(true);
  };

  return (
    <IonContent>
      <div style={{ position: 'absolute', top: '50px', left: '10px', zIndex: 9999 }}>
        <IonButton onClick={(e) => openPopover(e)}>
          Claimed Gyms <IonIcon icon={caretDownOutline} />
        </IonButton>
      </div>

      {userLocation && (
        <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation} zoom={20}>
          <Marker position={userLocation} label="You" />

          {gyms.map((gym) => (
            <Marker
              key={gym.id}
              position={{ lat: gym.lat, lng: gym.lng }}
              label={gym.name}
              onClick={() => handleMarkerClick(gym)}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />
          ))}

          <Circle
            center={userLocation}
            radius={10}
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

      <IonButton expand="full" onClick={(e) => openPopover(e)}>
        See Claimed Gyms
      </IonButton>

      <IonPopover
        isOpen={showPopover}
        onDidDismiss={() => setShowPopover(false)}
        event={popoverEvent}
      >
        <IonContent>
          <IonList>
            {claimedGyms.map((gymName) => (
              <IonItem key={gymName}>
                {gymName}
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonPopover>
    </IonContent>
  );
};

export default GymClaimPage;
