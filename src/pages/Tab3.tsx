import React, { useState, useRef, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonCol,
  IonCard,
  IonGrid,
  IonRow,
  IonPage,
  IonInput,
  IonCardTitle,
  IonCardHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonText,
  IonCardContent,
  IonIcon,
  IonAvatar,
  IonModal,
  IonCardSubtitle
} from '@ionic/react';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { getDocs, collection, updateDoc, doc, arrayRemove, arrayUnion, query, where } from 'firebase/firestore';
import { storage, auth, firestore } from '../firebase/firebaseConfig';
import { useHistory } from 'react-router-dom';
import { CiShare1 } from "react-icons/ci";
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { barbell, imageOutline, arrowBack, trashOutline, checkmark, location, personAdd, logOutOutline, person, heart, heartOutline } from 'ionicons/icons';
import DetailedView from './DetailedView'; // Import DetailedView

const Tab3: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(auth.currentUser?.photoURL || null);
  const [updatedImageUrl, setUpdatedImageUrl] = useState<string | null>(null); // New state to manage updated image URL
  const username = auth.currentUser?.displayName || ''; // Get the username
  const [posts, setPosts] = useState<{ id: string; imageUrl?: string; likedBy: string[]; likes: number }[]>([]);
  const history = useHistory();
  const [userImageUrl, setUserImageUrl] = useState<string>('');
  // const [selectedPost, setSelectedPost] = useState<{ id: string; imageUrl?: string | undefined } | null>(null);
  const [selectedPost, setSelectedPost] = useState<{
    id: string; imageUrl?: string |
    undefined; likes: number; likedBy: string[]
  } | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error('User not authenticated.');
          history.push('/');
        } else {
          const userId = user.uid;

          // Fetch posts for the current user from Firestore
          const userPostsCollection = collection(firestore, 'posts');
          const userPostsQuery = query(userPostsCollection, where('userId', '==', userId));
          const querySnapshot = await getDocs(userPostsQuery);

          const userPostsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            imageUrl: doc.data().imageUrl,
            likedBy: doc.data().likedBy,
            likes: doc.data().likes,
            caption: doc.data().caption, // Include caption property
            category: doc.data().category, // Include category property
            // Add other necessary fields from your Firestore document
          }));

          setPosts(userPostsData);
        }
      } catch (error) {
        console.error('Error retrieving user posts:', error);
      }
    };

    fetchUserPosts();
  }, [history]);
  const handlePostClick = (post: { id: string; imageUrl?: string | undefined; likes: number; likedBy: string[] }) => {
    setSelectedPost(post);
  };
  const closeDetailedView = () => {
    setSelectedPost(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedImage = event.target.files[0];
      setImageFile(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(auth.currentUser?.photoURL || null);
  };

  const handleUpdateProfilePicture = async () => {
    try {
      if (!auth.currentUser) {
        console.error('User not authenticated.');
        return;
      }

      const userId = auth.currentUser.uid;

      if (imageFile != null) {
        const storageRef = ref(storage, `profilePictures/${userId}`);
        await uploadBytes(storageRef, imageFile);

        const imageUrl = await getDownloadURL(storageRef);

        // Update the user profile picture in Firebase Authentication
        await updateProfile(auth.currentUser, { photoURL: imageUrl });

        // Update the user profile picture URL in Firestore
        const userDocRef = doc(firestore, 'users', userId);
        await updateDoc(userDocRef, { photoURL: imageUrl });

        // Optionally update your component state to reflect the new profile picture
        setImagePreview(imageUrl);
        setUpdatedImageUrl(imageUrl); // Set the updated image URL in the state

        console.log('Profile picture updated successfully:', imageUrl);
      }

      setImageFile(null);
    } catch (error: any) {
      console.error('Error updating profile picture:', error.message);
    }
  };
  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await auth.signOut(); // Sign out the user
      localStorage.removeItem('user');
      console.log('Redirecting to /Google...');
      history.replace('/'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  const [liked, setLiked] = useState(false);

  const handleLike = async (postId: string, userId: string) => {
    try {
      // Find the post in the state based on postId
      const likedPostIndex = posts.findIndex((post) => post.id === postId);

      if (likedPostIndex !== -1) {
        const likedBy = posts[likedPostIndex].likedBy;

        // Check if the user has already liked the post
        const alreadyLiked = likedBy.includes(userId);

        if (alreadyLiked) {
          // User has already liked the post, so remove the like
          const updatedLikedBy = likedBy.filter((id: string) => id !== userId);

          // Update the state and wait for it to complete
          setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            updatedPosts[likedPostIndex] = {
              ...updatedPosts[likedPostIndex],
              likes: updatedLikedBy.length,
              likedBy: updatedLikedBy,
            };
            return updatedPosts;
          });

          // Update the likes count and likedBy array in Firestore
          const postRef = doc(firestore, 'posts', postId);
          await updateDoc(postRef, {
            likes: updatedLikedBy.length,
            likedBy: updatedLikedBy,
          });
        } else {
          // User has not liked the post, so add the like
          const updatedLikedBy = [...likedBy, userId];

          // Update the state and wait for it to complete
          setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            updatedPosts[likedPostIndex] = {
              ...updatedPosts[likedPostIndex],
              likes: updatedLikedBy.length,
              likedBy: updatedLikedBy,
            };
            return updatedPosts;
          });

          // Update the likes count and likedBy array in Firestore
          const postRef = doc(firestore, 'posts', postId);
          await updateDoc(postRef, {
            likes: updatedLikedBy.length,
            likedBy: updatedLikedBy,
          });
        }
      } else {
        console.log('Post not found.');
      }
    } catch (error) {
      console.error('Could not like/unlike post: ', error);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader translucent={false}>
          <IonToolbar>
            <IonButtons slot="start">
              <img
                className='profile-image'
                style={{ borderRadius: '50%', width: '40px', height: '40px', marginRight: '10px' }}
                src={updatedImageUrl || auth.currentUser?.photoURL || ''}
                alt="User Profile Picture"
              />
            </IonButtons>
            <IonCardSubtitle style={{ fontSize: '12px', color: 'white', fontWeight: '600', margin: 'auto' }}>{username ? `${username}` : 'Loading user...'}</IonCardSubtitle>
            <IonButtons slot="end">
              <IonButton href="/" onClick={handleLogout}>
                <IonIcon style={{ color: 'white' }} icon={logOutOutline}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-sm="6" style={{ margin: 'auto', padding: '0' }}>
              <IonGrid>
                <IonRow>
                  <IonCol size="6">
                    {updatedImageUrl && (
                      <img src={updatedImageUrl} alt="Updated" style={{ width: '100%', marginTop: '10px', borderRadius: '50px' }} />
                    )}
                    {!updatedImageUrl && imagePreview && (
                      <img src={imagePreview} alt="Selected" style={{ width: '100%', marginTop: '10px', borderRadius: '50px' }} />
                    )}
                  </IonCol>
                  <IonCol size="6" style={{ marginTop: '30px', }}>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '1rem' }}>
                      <IonIcon icon={person} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                      &nbsp;
                      {username ? `${username}` : 'Loading user...'}
                    </IonCardSubtitle>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '1rem' }}>
                      <IonIcon icon={barbell} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                      &nbsp;
                      Lift Category
                    </IonCardSubtitle>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '1rem' }}>
                      <IonIcon icon={location} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                      &nbsp;
                      Idaho
                    </IonCardSubtitle>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '1rem' }}>
                      <IonIcon icon={personAdd} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                      &nbsp;
                      Add
                    </IonCardSubtitle>
                  </IonCol>
                </IonRow>
              </IonGrid>
              <IonCol size="12">
                &nbsp;&nbsp;&nbsp;&nbsp;
                <IonIcon
                  icon={imageOutline}
                  style={{ color: 'white', fontSize: '15px', background: 'steelblue', padding: '0.8rem', borderRadius: '50px' }}
                  onClick={() => fileInputRef.current?.click()}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                &nbsp;&nbsp;
                <IonIcon onClick={handleDeleteImage} icon={trashOutline} style={{ color: 'white', fontSize: '15px', background: 'steelblue', padding: '0.8rem', borderRadius: '50px' }} />
                &nbsp;&nbsp;
                <IonIcon icon={checkmark} style={{ color: 'white', fontSize: '15px', background: 'steelblue', padding: '0.8rem', borderRadius: '50px' }} onClick={handleUpdateProfilePicture} />
              </IonCol>
            </IonCol>
            <IonCol size="12">
              <IonCard>
                {/* <IonCardHeader>
                  <IonCardTitle className='ion-text-center'>Profile Stats</IonCardTitle>
                </IonCardHeader> */}
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      {/* Posts */}
                      <IonCol size="4">
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                          100
                          <br />
                          Posts
                        </IonCardSubtitle>
                      </IonCol>

                      {/* Followers */}
                      <IonCol size="4">
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white', borderLeft: '1px solid #ffb057', borderRight: '1px solid #ffb057' }}>
                          500
                          <br />
                          Friends
                        </IonCardSubtitle>
                      </IonCol>

                      {/* Following */}
                      <IonCol size="4">
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                          300
                          <br />
                          Workouts
                        </IonCardSubtitle>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12">
              <IonCardHeader>
                <IonCardSubtitle className='ion-text-center' style={{ color: 'white' }}>Posts</IonCardSubtitle>
              </IonCardHeader>
              <IonGrid style={{ padding: '0px' }}>
                <IonRow style={{ padding: '0px' }}>
                  {posts.map((post) => (
                    <IonCol key={post.id} size="6" size-md="4" style={{ padding: '1px' }}>
                      <IonCard onClick={() => handlePostClick(post)} style={{ borderRadius: '0px' }}>
                        {/* <IonCardHeader>
                          <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                            Post
                          </IonCardSubtitle>
                        </IonCardHeader> */}
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt={`Card ${post.id}`} style={{ width: '100%', borderRadius: '0px' }} />
                        )}
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
                <IonRow>
                  {/* Detailed view */}
                  {selectedPost && (
                    <IonModal isOpen={true} onDidDismiss={closeDetailedView}>
                      <DetailedView
                        post={selectedPost}
                        username={username}
                        userImageUrl={updatedImageUrl || auth.currentUser?.photoURL || ''}
                        onClose={closeDetailedView}
                        onLike={(postId) => handleLike(postId, username)}
                      />
                    </IonModal>
                  )}
                </IonRow>
              </IonGrid>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage >
  );
};

export default Tab3;
