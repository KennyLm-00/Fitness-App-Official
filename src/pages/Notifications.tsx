import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebaseConfig';
import { getDoc, doc, updateDoc, arrayUnion, collection, query, getDocs, where, arrayRemove } from 'firebase/firestore';

const Notifications: React.FC = () => {
  const history = useHistory();
  const [friendRequests, setFriendRequests] = useState<string[]>([]);

  const fetchFriendRequests = async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setFriendRequests(userData.friendRequests || []);
        }
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const handleBackButtonClick = () => {
    history.goBack(); // Go back to the previous page
  };

  const updateFriendRequestsInFirestore = async (updatedFriendRequests: string[]) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          friendRequests: updatedFriendRequests,
        });
      }
    } catch (error) {
      console.error('Error updating friend requests in Firestore:', error);
    }
  };
  const handleAcceptFriendRequest = async (username: string) => {
    try {
      const currentUser = auth.currentUser;
  
      if (currentUser) {
        const currentUserDocRef = doc(firestore, 'users', currentUser.uid);
  
        // Fetch sender's user document based on username
        const senderUserQuery = query(collection(firestore, 'users'), where('username', '==', username));
        const senderUserQuerySnapshot = await getDocs(senderUserQuery);
  
        if (!senderUserQuerySnapshot.empty) {
          const senderUserDocRef = senderUserQuerySnapshot.docs[0].ref;
  
          // Update the current user's document to add the new friend using a transaction
          await updateDoc(currentUserDocRef, {
            friends: arrayUnion(username),
            friendRequests: arrayRemove(username),
          });
  
          // Update the sender's document to add the new friend
          await updateDoc(senderUserDocRef, {
            friends: arrayUnion(currentUser.displayName || currentUser.email),
          });
  
          // Fetch the updated friend requests after the changes
          fetchFriendRequests();
          console.log('Friend request accepted successfully!');
        } else {
          console.error('Sender not found. Username:', username);
          console.log('Sender query snapshot:', senderUserQuerySnapshot.docs);
        }
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  

  const handleRejectFriendRequest = async (username: string) => {
    try {
      const updatedFriendRequests = friendRequests.filter((request) => request !== username);
      setFriendRequests(updatedFriendRequests);

      // Remove the friend request from the friendRequests array using a transaction
      await updateFriendRequestsInFirestore(updatedFriendRequests);

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
