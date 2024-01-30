import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebaseConfig';
import { getDocs, collection, doc, where, query, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const Notifications: React.FC = () => {
  const history = useHistory();
  const [friendRequests, setFriendRequests] = useState<string[]>([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Fetch the current user's document
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            // Assuming you stored friend requests as usernames in the `friendRequests` array
            setFriendRequests(userData.friendRequests || []);
          }
        }
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchFriendRequests();
  }, []);

  const handleBackButtonClick = () => {
    history.goBack(); // Go back to the previous page
  };

  const handleAcceptFriendRequest = async (username: string) => {
    try {
      // Update the current user's document to add the new friend using a transaction
      const currentUser = auth.currentUser;
      if (currentUser) {
        const currentUserDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(currentUserDocRef, {
          friends: arrayUnion(username),
        });
  
        // Remove the friend request from the friendRequests array
        setFriendRequests((prevRequests) => prevRequests.filter((request) => request !== username));
  
        console.log('Friend request accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  
  const handleRejectFriendRequest = async (username: string) => {
    try {
      // Remove the friend request from the friendRequests array using a transaction
      setFriendRequests((prevRequests) => prevRequests.filter((request) => request !== username));
      console.log('Friend request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };
  

  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar className="ion-toolbar-custom" style={{ boxShadow: 'none', borderBottomRightRadius: '0', borderBottomLeftRadius: '0' }}>
            <button onClick={handleBackButtonClick} style={{ background: 'transparent', fontSize: '2.0rem' }}>
              <IonIcon slot="icon-only" icon={arrowBack} />
            </button>
            <IonTitle>Notifications</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {/* Render friend requests dynamically */}
          {friendRequests.map((requestUsername) => (
            <IonItem key={requestUsername}>
              <IonLabel>{`${requestUsername} sent you a friend request`}</IonLabel>
              <IonButton onClick={() => handleAcceptFriendRequest(requestUsername)}>Accept</IonButton>
              <IonButton onClick={() => handleRejectFriendRequest(requestUsername)}>Reject</IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Notifications;
