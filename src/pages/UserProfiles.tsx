import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonCol,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonCard,
  IonGrid,
  IonRow,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonImg,
  IonCardSubtitle,
  IonText,
  IonRouterLink,
  IonChip,
  IonAvatar,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebaseConfig';
import { getDocs, collection, doc, where, query, getDoc } from 'firebase/firestore';

const UserProfiles: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchUserProfileAndPosts = async () => {
        try {
          if (username) {
            // Fetch user profile
            const usersCollection = collection(firestore, 'users');
            const usersQuery = query(usersCollection, where('username', '==', username));
            const userDocsSnapshot = await getDocs(usersQuery);
      
            if (!userDocsSnapshot.empty) {
              const userDoc = userDocsSnapshot.docs[0];
              const userProfile = userDoc.data();
      
              // Fetch user posts using username
              const userPostsCollection = collection(firestore, 'posts');
              const userPostsQuery = query(userPostsCollection, where('username', '==', userProfile.username));
              const userPostsSnapshot = await getDocs(userPostsQuery);
      
              const postsData = userPostsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
      
              setUserProfile(userProfile);
              setUserPosts(postsData);
            } else {
              console.error('User not found.');
            }
          } else {
            console.error('Username is undefined.');
          }
        } catch (error) {
          console.error('Error fetching user profile and posts:', error);
        }
      };
      
    fetchUserProfileAndPosts();
  }, [username]);
  

  return (
    <IonPage>
      <IonContent className='user-profile' fullscreen>
        <IonHeader translucent={false}>
          <IonToolbar>
            <IonButtons slot="start">
              {userProfile && userProfile.photoURL && (
                <img
                  className='profile-image'
                  style={{ borderRadius: '50%', width: '40px', height: '40px', marginRight: '10px' }}
                  src={userProfile.photoURL}
                  alt="User Profile Picture"
                />
              )}
            </IonButtons>
            <IonCardSubtitle style={{ fontSize: '12px', color: 'white', fontWeight: '600', margin: 'auto' }}>
              {userProfile ? userProfile.displayName : 'Loading user...'}
            </IonCardSubtitle>
            <IonButtons slot="end">
              {/* Add any additional buttons or links for user profile actions */}
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <div className='container' style={{ maxWidth: '1200px', margin: 'auto' }}>
          {/* Display user profile information */}
          {userProfile && (
            <div>
              <h2>{userProfile.displayName}</h2>
              {/* Add other user profile details as needed */}
            </div>
          )}

          {/* Display user posts */}
          <IonGrid>
            <IonCardTitle style={{ fontSize: '1rem', padding: '0.8rem', color: 'white' }}>User Posts</IonCardTitle>
            <IonRow>
              {userPosts.map((post) => (
                <IonCol key={post.id} size="12" size-sm="4">
                  <IonCard>
                    <IonCardContent style={{ color: 'white' }}>{post.caption}</IonCardContent>
                    {post && post.imageUrl && (
                      <>
                        <img style={{ borderRadius: '0px', background: 'transparent' }} src={post.imageUrl} alt="Post Image" />
                      </>
                    )}
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UserProfiles;
