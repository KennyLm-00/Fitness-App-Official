import React, { useState, useRef, useEffect } from 'react';
import {
  IonContent, IonCol, IonCard, IonGrid, IonRow, IonPage, IonInput, IonChip, IonAvatar,
  IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent, IonLabel, IonIcon, IonToast, IonSelectOption, IonSelect
} from '@ionic/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage, auth } from '../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { trashOutline, sendOutline, imageOutline } from 'ionicons/icons';

const Tab2: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // New state for selected category

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('User:', user); // Log user details for debugging

      if (user) {
        if (!user.displayName) {
          try {
            await updateProfile(user, {
              displayName: user.email?.split('@')[0] || 'Username',
            });

            const updatedUser = auth.currentUser;
            setUser(updatedUser);
          } catch (error) {
            console.error('Error updating display name:', error);
          }
        } else {
          setUser(user);
        }
      } else {
        console.error('User not authenticated.');
      }
    });

    return () => unsubscribe();
  }, []);
  const handleInputChange = (event: CustomEvent) => {
    setInputValue(event.detail.value as string);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedImage = event.target.files[0];
      setImageFile(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  const handleCategoryChange = (event: CustomEvent) => {
    setSelectedCategory(event.detail.value);
  };
  const handlePost = async () => {
    try {
      if (!user || !inputValue.trim() || !selectedCategory) { // Check if a category is selected
        setPostStatus('Please sign in, enter text, and select a category');
        return;
      }
      let userImageUrl = user.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg';
      console.log('User Image URL:', userImageUrl);

      console.log('User Details:', {
        userId: user.uid,
        username: user.displayName || 'Username',
        userImageUrl: userImageUrl,
        caption: inputValue,
      });
      if (imageFile != null) {
        const storageRef = ref(storage, 'images/' + imageFile.name);
        const uploadTask = uploadBytes(storageRef, imageFile);
        await uploadTask;

        const imageUrl = await getDownloadURL(storageRef);

        const postsCollection = collection(firestore, 'posts');
        const postDoc = {
          userId: user.uid,
          username: user.displayName || 'Username',
          userImageUrl: userImageUrl,
          caption: inputValue,
          imageUrl: imageUrl,
          category: selectedCategory, // Include the selected category in the post
          timestamp: serverTimestamp(),
          likes: 0,
          likedBy: [],
          comments: [],
        };
        console.log('Post Details:', postDoc);

        await addDoc(postsCollection, postDoc);
      } else {
        const postsCollection = collection(firestore, 'posts');
        const postDoc = {
          userId: user.uid,
          username: user.displayName || 'Username',
          userImageUrl: userImageUrl, // Add this line to include userImageUrl
          caption: inputValue,
          imageUrl: null,
          category: selectedCategory, // Include the selected category in the post
          timestamp: serverTimestamp(),
          likes: 0,
          likedBy: [],
          comments: [],
        };
        console.log('Post Details:', postDoc);

        await addDoc(postsCollection, postDoc);
      }

      setInputValue('');
      setImageFile(null);
      setImagePreview(null);
      setSelectedCategory(''); // Reset the selected category
      setPostStatus('Post added successfully!');
    } catch (error) {
      console.error('Error adding post: ', error);
      setPostStatus('Error adding post. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonContent style={{ margin: 'auto' }} fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-sm="6" style={{ margin: 'auto' }}>
              <IonCol size="12" size-sm="12" style={{ marginTop: '50px' }}>
                <IonCardHeader>
                  <IonCardTitle className='ion-text-center'>Create Post</IonCardTitle>
                </IonCardHeader>
              </IonCol>
              <IonCol size="12" size-sm="3">
                <IonCard style={{ padding: '1rem' }}>
                  <IonCardSubtitle style={{ color: 'white' }}>
                    {/* User Chip */}
                    <IonChip>
                      <IonAvatar>
                        <img alt="Silhouette of a person's head" src={user?.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'} />
                      </IonAvatar>
                      <IonLabel>{user?.displayName || 'Username'}</IonLabel>
                    </IonChip>
                  </IonCardSubtitle>
                  <IonCardContent>
                    <IonInput
                      style={{ color: 'white', borderBottom: '1px solid lightgrey' }}
                      value={inputValue}
                      onIonChange={handleInputChange}
                      placeholder="What do you want to talk about?"
                    />
                    {imagePreview && (
                      <img src={imagePreview} alt="Selected" style={{ width: '100%', marginTop: '10px' }} />
                    )}
                  </IonCardContent>
                  <IonCardContent>
                    <IonIcon
                      icon={imageOutline}
                      style={{ color: 'white', fontSize: '30px' }}
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
                    <IonIcon onClick={handleDeleteImage} icon={trashOutline} style={{ color: 'white', fontSize: '30px', background: 'transparent' }}></IonIcon>
                    <IonIcon
                      icon={sendOutline}
                      style={{ background: 'transparent', color: 'white', fontSize: '30px', float: 'right' }}
                      onClick={handlePost}
                    ></IonIcon>
                    <IonSelect
                      value={selectedCategory}
                      placeholder="Select category"
                      onIonChange={handleCategoryChange}
                      style={{ color: 'white', borderBottom: '1px solid lightgrey' }}
                    >
                      <IonSelectOption value="bodybuilding">Bodybuilding</IonSelectOption>
                      <IonSelectOption value="calisthenics">Calisthenics</IonSelectOption>
                      <IonSelectOption value="crossfit">CrossFit</IonSelectOption>
                      <IonSelectOption value="powerlifting">Powerlifting</IonSelectOption>
                      {/* Add more categories as needed */}
                    </IonSelect>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonToast
          isOpen={!!postStatus}
          message={postStatus || ''}
          duration={3000}
          onDidDismiss={() => setPostStatus(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
