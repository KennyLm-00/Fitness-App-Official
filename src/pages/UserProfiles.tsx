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
  IonModal,
  IonIcon,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebaseConfig';
import { getDocs, collection, doc, where, query, getDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import DetailedView from './DetailedView'; // Import DetailedView
import { barbell, imageOutline, arrowBack, trashOutline, checkmark, location, personAdd, logOutOutline, person, heart, heartOutline } from 'ionicons/icons';
const UserProfiles: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [friendRequestStatus, setFriendRequestStatus] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<{
    id: string;
    imageUrl?: string | undefined;
    likes: number;
    likedBy: string[];
    caption?: string;
    category?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfileAndPosts = async () => {
      try {
        if (username) {
          const usersCollection = collection(firestore, 'users');
          const usersQuery = query(usersCollection, where('username', '==', username));
          const userDocsSnapshot = await getDocs(usersQuery);

          if (!userDocsSnapshot.empty) {
            const userDoc = userDocsSnapshot.docs[0];
            const userProfile = userDoc.data();

            // Check if the userDoc has the uid field
            if (userDoc.id) {
              userProfile.uid = userDoc.id;
            } else {
              console.error('Error: uid not found in userDoc');
              return;
            }

            console.log('Fetched userProfile:', userProfile);
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

  useEffect(() => {
    // Check the friend request status when the component mounts
    const checkFriendRequestStatus = async () => {
      try {
        const currentUser = auth.currentUser;
  
        if (currentUser && userProfile && userProfile.username) {
          const usersCollection = collection(firestore, 'users');
          const usersQuery = query(usersCollection, where('username', '==', userProfile.username));
          const userDocsSnapshot = await getDocs(usersQuery);
  
          if (!userDocsSnapshot.empty) {
            const userDoc = userDocsSnapshot.docs[0];
            const userData = userDoc.data();
  
            if (userData.friendRequests && userData.friendRequests.includes(currentUser.displayName || currentUser.email)) {
              // Friend request sent
              setFriendRequestStatus('sent');
            } else if (userData.friends && userData.friends.includes(currentUser.displayName || currentUser.email)) {
              // Already friends
              setFriendRequestStatus('friends');
            }
          }
        }
      } catch (error) {
        console.error('Error checking friend request status:', error);
      }
    };
  
    checkFriendRequestStatus();
  }, [userProfile]);

  const handlePostClick = (post: {
    id: string;
    imageUrl?: string | undefined;
    likes: number;
    likedBy: string[];
    caption?: string;
    category?: string;
  }) => {
    setSelectedPost(post);
  };

  const closeDetailedView = () => {
    setSelectedPost(null);
  };
  const handleAddFriend = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error('Error: User not logged in.');
        return;
      }

      if (userProfile && userProfile.username && userProfile.uid) {
        // Check if the friend request has already been sent or they are already friends
        if (friendRequestStatus === 'sent') {
          console.log('Friend request already sent.');
        } else if (friendRequestStatus === 'friends') {
          console.log('Already friends.');
        } else {
          // Update the recipient's document to include the friend request
          const recipientUserDocRef = doc(firestore, 'users', userProfile.uid);
          await updateDoc(recipientUserDocRef, {
            friendRequests: arrayUnion(currentUser.displayName || currentUser.email),
          });

          console.log('Friend request sent successfully!');
        }
      } else {
        console.error('Error: userProfile, userProfile.username, or userProfile.uid is undefined.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };
  return (
    <IonPage>
      <IonContent className='user-profile' fullscreen>
        <IonHeader translucent={false}>
          <IonToolbar>
            <IonButtons slot="start">
              {userProfile && userProfile.photoURL && (
                <img
                  className='profile-image'
                  style={{ borderRadius: '50%', width: '45px', height: '50px', marginRight: '10px' }}
                  src={userProfile.photoURL}
                  alt="User Profile Picture"
                />
              )}
              <IonCardSubtitle style={{ fontSize: '12px', color: 'white', fontWeight: '600', margin: 'auto' }}>{username ? `${username}` : 'Loading user...'}</IonCardSubtitle>
            </IonButtons>
            <IonCardSubtitle style={{ fontSize: '12px', color: 'white', fontWeight: '600', margin: 'auto' }}>
              {userProfile ? userProfile.displayName : 'Loading user...'}
            </IonCardSubtitle>
            <IonButtons slot="end">
              {/* Add any additional buttons or links for user profile actions */}
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        {/* Display user posts */}
        <IonCol size="12" size-sm="6" style={{ margin: 'auto', padding: '0' }}>
          <IonGrid>
            <IonRow>
              <IonCol size="4">
                {/* Display user profile image */}
                {userProfile && userProfile.photoURL && (
                  <img src={userProfile.photoURL} alt="User Profile" style={{ width: '100%', marginTop: '10px', borderRadius: '50px' }} />
                )}
              </IonCol>
              <IonCol size="8" style={{ marginTop: '30px', }}>
                <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '0.8rem' }}>
                  <IonIcon icon={person} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                  &nbsp;
                  {username ? `${username}` : 'Loading user...'}
                </IonCardSubtitle>
                <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '0.8rem' }}>
                  <IonIcon icon={barbell} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                  &nbsp;
                  {userProfile && userProfile.liftCategory ? userProfile.liftCategory : 'Lift Category'}
                </IonCardSubtitle>
                <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '0.8rem' }}>
                  <IonIcon icon={location} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                  &nbsp;
                  Gyms
                </IonCardSubtitle>
                <IonCardSubtitle style={{ textAlign: 'left', fontSize: '0.8rem' }}>
                  {friendRequestStatus === 'sent' ? (
                    <span style={{ color: 'white', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', display: 'inline-block',width:'100%' }}>
                      Sent Request
                    </span>
                  ) : friendRequestStatus === 'friends' ? (
                    <span style={{ color: 'white', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', display: 'inline-block',width:'100%',textAlign:'center'}}>
                      Friends!
                    </span>
                  ) : (
                    <button style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', width: '100%', verticalAlign: 'middle' }}
                      onClick={handleAddFriend}>
                      + Add
                    </button>
                  )}
                </IonCardSubtitle>

              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCol>
        <IonCol size="12">
          <IonCard style={{ width: '94%' }}>
            {/* <IonCardHeader>
                  <IonCardTitle className='ion-text-center'>Profile Stats</IonCardTitle>
                </IonCardHeader> */}
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  {/* Posts */}
                  <IonCol size="6">
                    <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                      {userPosts.length}
                      <br />
                      Posts
                    </IonCardSubtitle>
                  </IonCol>

                  {/* Followers */}
             <IonCol size="6">
                    <IonCardSubtitle style={{ textAlign: 'center', color: 'white', borderLeft: '1px solid #ffb057' }}>
                      {userProfile && userProfile.friends ? userProfile.friends.length : 0}
                      <br />
                      Gym Pals
                    </IonCardSubtitle>
                  </IonCol>

                  {/* Following */}
                  {/* <IonCol size="4">
                    <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                      300
                      <br />
                      Workouts
                    </IonCardSubtitle>
                  </IonCol> */}
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </IonCol>
        <IonGrid>
          <IonCardHeader>
            <IonCardSubtitle className='ion-text-center' style={{ color: 'white' }}>Posts</IonCardSubtitle>
          </IonCardHeader>
          <IonRow>
            {userPosts.map((post) => (
              <IonCol key={post.id} size="6" size-sm="4" style={{ marginBottom: '10px' }}>
                <IonCard onClick={() => handlePostClick(post)} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={`Card ${post.id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* Detailed view */}
        {selectedPost && (
          <IonModal isOpen={true} onDidDismiss={closeDetailedView}>
            <DetailedView
              post={selectedPost}
              username={userProfile ? userProfile.displayName : ''}
              userImageUrl={userProfile ? userProfile.photoURL : ''}
              onClose={closeDetailedView}
              onLike={(postId) => {
                // Implement the logic to handle likes in the UserProfiles component
                console.log(`Liked post ${postId}`);
              }}
            />
          </IonModal>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UserProfiles;
