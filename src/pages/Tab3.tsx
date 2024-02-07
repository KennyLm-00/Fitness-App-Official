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
  IonCardSubtitle,
  IonAlert
} from '@ionic/react';
import { IonList, IonItem } from '@ionic/react';

import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { getDocs, getDoc, addDoc, deleteDoc, collection, updateDoc, doc, arrayRemove, arrayUnion, query, where } from 'firebase/firestore';
import { storage, auth, firestore } from '../firebase/firebaseConfig';
import { useHistory } from 'react-router-dom';
import { CiShare1 } from "react-icons/ci";
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { barbell, imageOutline, arrowBack, trashOutline, checkmark, location, personAdd, logOutOutline, person, heart, heartOutline, ellipsisHorizontal, accessibility } from 'ionicons/icons';
import DetailedView from './DetailedView'; // Import DetailedView
import { FaPencilAlt } from "react-icons/fa";

const Tab3: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(auth.currentUser?.photoURL || null);
  const [updatedImageUrl, setUpdatedImageUrl] = useState<string | null>(null); // New state to manage updated image URL
  const [userName, setUserName] = useState<string>('');
  const [posts, setPosts] = useState<{ id: string; imageUrl?: string; likedBy: string[]; likes: number }[]>([]);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const history = useHistory();
  const [userImageUrl, setUserImageUrl] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<{
    id: string; imageUrl?: string |
    undefined; likes: number; likedBy: string[]
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const liftCategories = ['PowerLifting', 'BodyBuilding', 'Calisthenics',
    'CrossFit'];
  const [showCategoryAlert, setShowCategoryAlert] = useState(false);
  const [postsCount, setPostsCount] = useState<number>(0); // New state to store posts count
  const [gymPalsCount, setGymPalsCount] = useState<number>(0); // New state to store gym pals count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error('User not authenticated.');
          history.push('/');
          return;
        }

        const userId = user.uid;

        // Fetch user data including the lift category
        const userDocRef = doc(firestore, 'users', userId);
        const userDocSnapshot = await getDoc(userDocRef);
        const userDocData = userDocSnapshot.data();

        if (userDocData) {
          setUserName(userDocData.username); // Move this line here
          // console.log('User Document Data:', userDocData);
          setUserImageUrl(userDocData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg');
          setSelectedCategory(userDocData.liftCategory || null);
          // Fetch posts for the current user from Firestore
          const userPostsCollection = collection(firestore, 'posts');
          const userPostsQuery = query(userPostsCollection, where('userId', '==', userId));
          const querySnapshot = await getDocs(userPostsQuery);

          const userPostsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            imageUrl: doc.data().imageUrl,
            likedBy: doc.data().likedBy,
            likes: doc.data().likes,
            caption: doc.data().caption,
            category: doc.data().category,
          }));

          setPostsCount(userPostsData.length); // Set posts count
          setPosts(userPostsData);
          const gymPalsQuery = query(collection(firestore, 'users'), where('friends', 'array-contains', userDocData.username));
          const gymPalsSnapshot = await getDocs(gymPalsQuery);
          const gymPalsData = gymPalsSnapshot.docs.map((doc) => doc.data());

          // console.log('Gym Pals Query:', gymPalsQuery);
          // console.log('Gym Pals Snapshot:', gymPalsSnapshot);
          // console.log('Gym Pals Data:', gymPalsData);

          setGymPalsCount(gymPalsSnapshot.size); // Set gym pals count

          // console.log('Gym Pals Count:', gymPalsSnapshot.size);
        }
      } catch (error) {
        console.error('Error retrieving user information and posts:', error);
      }
    };

    fetchData();
  }, [userName, history]);



  const handlePostClick = (post: { id: string; imageUrl?: string | undefined; likes: number; likedBy: string[] }) => {
    setSelectedPost(post);
  };

  const closeDetailedView = () => {
    setSelectedPost(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedImage = event.target.files[0];
      setImageFile(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };
  const handleDeletePost = (postId: string) => {
    setDeletePostId(postId);
  };
  const handlePostDelete = async (postId: string | null) => {
    try {
      if (postId === null) {
        console.log('No post selected for deletion.');
        return;
      }

      // Assuming "posts" is your Firestore collection
      const postRef = doc(firestore, 'posts', postId);

      // Delete the post from Firestore
      await deleteDoc(postRef);

      // After successful deletion, you might want to update the state
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));

      console.log(`Post with ID ${postId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  const handleDeleteImage = async () => {
    try {
      if (!auth.currentUser) {
        console.error('User not authenticated.');
        return;
      }

      const userId = auth.currentUser.uid;

      // Clear the image file and preview
      setImageFile(null);
      setImagePreview(null);
      setUpdatedImageUrl(null);

      // Update the user profile picture in Firebase Authentication and Firestore to null
      await updateProfile(auth.currentUser, { photoURL: null });

      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { photoURL: null });

      // Update the userImageUrl state with the default Ionic person image
      setUserImageUrl('https://ionicframework.com/docs/img/demos/avatar.svg');
      setUpdatedImageUrl('https://ionicframework.com/docs/img/demos/avatar.svg'); // Set the updated image URL in the state

      console.log('Profile picture removed successfully.');
    } catch (error: any) {
      console.error('Error removing profile picture:', error.message);
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
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryAlert(false);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user && selectedCategory) {
      const userDocRef = doc(firestore, 'users', user.uid);
      // Update the 'liftCategory' field in the user's document
      updateDoc(userDocRef, { liftCategory: selectedCategory })
      // .then(() => console.log('Lift category updated successfully'))
      // .catch((error) => console.error('Error updating lift category:', error));
    }
  }, [selectedCategory]);
  const handleSplitsClick = () => {
    // Navigate to the "Splits" tab
    history.push('/splits');
  };
  const handleGymsClick = () => {
    // Navigate to the GymClaimPage
    history.push('/gymclaim');
    window.location.reload();

  };
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader translucent={false}>
          <IonToolbar>
            <IonButtons slot="start">
              {userImageUrl && (
                <img
                  className='profile-image'
                  style={{ borderRadius: '50%', width: '45px', height: '50px', marginRight: '10px' }}
                  src={userImageUrl}
                  alt="User Profile Picture"
                />
              )}
            </IonButtons>
            <IonCardSubtitle style={{ fontSize: '12px', color: 'white', fontWeight: '600', margin: 'auto' }}>
              {userName ? `${userName}` : 'Loading user...'}
            </IonCardSubtitle>

            <IonButtons slot="end">
              <IonIcon onClick={handleLogout} style={{ color: "white", fontSize: '1.5rem' }} icon={logOutOutline} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-sm="6" style={{ margin: 'auto', padding: '0' }}>
              <IonGrid>
                <IonRow>
                  <IonCol size="4">
                    {updatedImageUrl && (
                      <img src={updatedImageUrl} alt="Updated" style={{ width: '100%', marginTop: '10px', borderRadius: '50px' }} />
                    )}
                    {!updatedImageUrl && imagePreview && (
                      <img src={imagePreview} alt="Selected" style={{ width: '100%', marginTop: '10px', borderRadius: '50px' }} />
                    )}
                  </IonCol>
                  <IonCol size="8" style={{ marginTop: '30px', }}>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '0.8rem' }}>
                      <IonIcon icon={person} style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }} />
                      &nbsp;
                      {userName ? `${userName}` : 'Loading user...'}
                    </IonCardSubtitle>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize: '0.8rem' }}>
                      <IonIcon
                        icon={barbell}
                        style={{ color: 'white', fontSize: '15px', background: 'rgb(255, 176, 87)', padding: '0.8rem', borderRadius: '50px', verticalAlign: 'middle' }}
                      />
                      &nbsp;
                      {selectedCategory ? (
                        <span>
                          {selectedCategory}
                          &nbsp;
                          <FaPencilAlt
                            onClick={() => setShowCategoryAlert(true)}
                            style={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                          />
                        </span>
                      ) : (
                        <IonButton onClick={() => setShowCategoryAlert(true)} fill="clear" style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Choose Category
                        </IonButton>
                      )}
                    </IonCardSubtitle>
                    <IonCardSubtitle
                      style={{ textAlign: 'left', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}
                      onClick={handleGymsClick} // Add this onClick handler
                    >
                      <IonIcon
                        icon={location}
                        style={{
                          color: 'white',
                          fontSize: '15px',
                          background: 'rgb(255, 176, 87)',
                          padding: '0.8rem',
                          borderRadius: '50px',
                          verticalAlign: 'middle',
                        }}
                      />
                      &nbsp;
                      Your gyms
                    </IonCardSubtitle>
                    <IonCardSubtitle
                      style={{ textAlign: 'left', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      <IonIcon
                        icon={accessibility}
                        style={{
                          color: 'white',
                          fontSize: '15px',
                          background: 'rgb(255, 176, 87)',
                          padding: '0.8rem',
                          borderRadius: '50px',
                          verticalAlign: 'middle',
                        }}
                      />
                      &nbsp;
                      Splits
                      &nbsp;
                      <FaPencilAlt
                        onClick={handleSplitsClick}
                        style={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                      />
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
                      <IonCol size="6">
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                          {postsCount}
                          <br />
                          Workouts
                        </IonCardSubtitle>
                      </IonCol>

                      {/* Gym Pals */}
                      <IonCol size="6">
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white', borderLeft: '1px solid #ffb057' }}>
                          {gymPalsCount}
                          <br />
                          Gym Pals
                        </IonCardSubtitle>
                      </IonCol>
                      {/* <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                          {postsCount >= 10 ? (
                            <>
                              <img src="/images/badge1.jpg" alt="Rookie Badge" style={{ width: '50px', marginBottom: '8px' }} />                              <br />
                              
                            </>
                          ) : postsCount >= 5 ? (
                            <>
                              <img src="/images/badge1.jpg" alt="Rookie Badge" style={{ width: '50px', marginBottom: '8px' }} />                              <br />
                              
                            </>
                          ) : postsCount >= 1 ? (
                            <>
                              <img src="/images/badge1.jpg" alt="Rookie Badge" style={{ width: '40px'}} />
                              <br />
                              
                            </>
                          ) : (
                            <>No Badge</>
                          )}
                        </IonCardSubtitle> */}
                      {/* Workouts */}

                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12">
              <IonCardHeader>
                <IonCardSubtitle className='ion-text-center' style={{ color: 'white' }}>Workouts</IonCardSubtitle>
              </IonCardHeader>
              <IonGrid style={{ padding: '0px' }}>
                <IonRow style={{ padding: '0px' }}>
                  {posts.map((post) => (
                    <IonCol key={post.id} size="6" size-md="4" style={{ padding: '1px' }}>
                      <IonIcon
                        style={{ float: 'right', fontSize: '1.5rem', color: 'white' }}
                        icon={ellipsisHorizontal}
                        onClick={() => handleDeletePost(post.id)}
                      />
                      <IonAlert
                        isOpen={deletePostId !== null}
                        header="Delete Post"
                        message="Are you sure you want to delete this post?"
                        buttons={[
                          {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                              setDeletePostId(null);
                            },
                          },
                          {
                            text: 'Delete',
                            handler: () => {
                              // Call a function to handle the actual post deletion
                              handlePostDelete(deletePostId);
                              setDeletePostId(null);
                            },
                          },
                        ]}
                      />
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
                  {/* Detailed view */}
                  {selectedPost && (
                    <IonModal isOpen={true} onDidDismiss={closeDetailedView}>
                      <DetailedView
                        post={selectedPost}
                        username={userName}
                        userImageUrl={updatedImageUrl || auth.currentUser?.photoURL || ''}
                        onClose={closeDetailedView}
                        onLike={(postId) => handleLike(postId, userName)}
                      />
                    </IonModal>
                  )}

                </IonRow>
                <IonAlert isOpen={showCategoryAlert} onDidDismiss={() => setShowCategoryAlert(false)}>
                  <IonContent>
                    <IonList>
                      {liftCategories.map((category) => (
                        <IonItem key={category} onClick={() => handleCategorySelect(category)}>
                          {category}
                        </IonItem>
                      ))}
                    </IonList>
                  </IonContent>
                </IonAlert>
                <IonAlert
                  isOpen={showCategoryAlert}
                  onDidDismiss={() => setShowCategoryAlert(false)}
                  header="Choose Lift Category"
                  inputs={liftCategories.map((category) => ({
                    name: category,
                    type: 'radio',
                    label: category,
                    value: category,
                  }))}
                  buttons={[
                    {
                      text: 'Cancel',
                      role: 'cancel',
                    },
                    {
                      text: 'OK',
                      handler: (selectedCategory) => handleCategorySelect(selectedCategory),
                    },
                  ]}
                />
              </IonGrid>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage >
  );
};

export default Tab3;
