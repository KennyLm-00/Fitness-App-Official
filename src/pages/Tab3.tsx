import React, { useState, useRef } from 'react';
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
  IonCardSubtitle
} from '@ionic/react';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore'; // Add this import
import { storage, auth, firestore } from '../firebase/firebaseConfig';
import { imageOutline, trashOutline } from 'ionicons/icons';
import { barbell, checkmark, location, personAdd } from 'ionicons/icons';

const Tab3: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(auth.currentUser?.photoURL || null);
  const [updatedImageUrl, setUpdatedImageUrl] = useState<string | null>(null); // New state to manage updated image URL
  const username = auth.currentUser?.displayName || ''; // Get the username

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

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader translucent={false}>
          <IonToolbar>
              <IonCardSubtitle className='ion-text-center' style={{ fontSize: '14px', color: 'white', fontWeight: '600', margin:'auto' }}>{username}</IonCardSubtitle>
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
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize:'1rem' }}>
                      <IonIcon icon={barbell} style={{ fontSize: '1.5rem', verticalAlign: 'middle' }} />
                      &nbsp;
                      Lift Category
                    </IonCardSubtitle>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize:'1rem' }}>
                      <IonIcon icon={location} style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
                      &nbsp;
                      Idaho
                    </IonCardSubtitle>
                    <IonCardSubtitle style={{ textAlign: 'left', color: 'white', fontSize:'1rem' }}>
                      <IonIcon icon={personAdd} style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
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
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                          500
                          <br />
                          Followers
                        </IonCardSubtitle>
                      </IonCol>

                      {/* Following */}
                      <IonCol size="4">
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                          300
                          <br />
                          Following
                        </IonCardSubtitle>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonRow style={{margin:'auto'}}>
              {/* Card 1 */}
              <IonCol size="6" size-md="4">
                <IonCard>
                  <IonCardHeader>
                    <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                      Post
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <img src="https://placekitten.com/200/300" alt="Card 1" style={{ width: '100%', borderRadius: '8px' }} />
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Card 2 */}
              <IonCol size="6" size-md="4">
                <IonCard>
                  <IonCardHeader>
                    <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                      Post
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <img src="https://placekitten.com/201/301" alt="Card 2" style={{ width: '100%', borderRadius: '8px' }} />
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Card 3 */}
              <IonCol size="6" size-md="4">
                <IonCard>
                  <IonCardHeader>
                    <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                    Post
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <img src="https://placekitten.com/202/302" alt="Card 3" style={{ width: '100%', borderRadius: '8px' }} />
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6" size-md="4">
                <IonCard>
                  <IonCardHeader>
                    <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                    Post
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <img src="https://placekitten.com/202/302" alt="Card 3" style={{ width: '100%', borderRadius: '8px' }} />
                  </IonCardContent>
                </IonCard>
              </IonCol>
              {/* Repeat for more cards */}
            </IonRow>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
