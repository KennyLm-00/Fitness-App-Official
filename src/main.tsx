import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  IonApp,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonCardHeader,
  IonCard,
  IonCheckbox
} from '@ionic/react';
import { auth, firestore } from './firebase/firebaseConfig'; // Import firestore
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './pages/Tab1.css';
import { doc, setDoc } from 'firebase/firestore';

/* Theme variables */
import './theme/variables.css';
import { updateProfile } from 'firebase/auth';

const container = document.getElementById('root');
const root = createRoot(container!);

const Main: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreateNewUser, setIsCreateNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const extractUsernameFromEmail = (email: string): string => {
    return email.split('@')[0];
  };
  const loginWithEmailAndPass = async () => {
    try {
      setLoading(true);
      setError(null);
    
      let userCredential;
    
      if (isCreateNewUser) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
        const username = extractUsernameFromEmail(email);
        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
    
        // Assume imageUrl is the URL of the user's profile picture
        const imageUrl = 'https://example.com/default-profile-picture.jpg';
    
        await setDoc(userDocRef, {
          username,
          email,
          photoURL: imageUrl, // Add the profile picture URL to the document
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
    
      // Check if the user is logged in
      const user = userCredential.user;
    
      if (user) {
        // Set the default avatar URL if the user doesn't have a profile picture
        const defaultAvatarUrl = 'https://api.adorable.io/avatars/50/default.png';
    
        // Set the user's profile picture to the default URL if it doesn't exist
        const photoURL = user.photoURL || defaultAvatarUrl;
    
        // Update the user's profile picture in Firebase Authentication
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL });
          console.log('User profile picture updated successfully:', photoURL);
        }
      }
    } catch (error) {
      const typedError = error as AuthError;
    
      if (typedError.code === 'auth/user-not-found') {
        setError('User does not exist. Please sign up first.');
      } else if (typedError.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Failed to login or create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
    
  };
  
  
  return (
    <React.StrictMode>
      <IonApp>
        {user ? (
          <App />
        ) : (
          <IonContent
            color="primary"
            className="ion-text-center ion-justify-content-center"
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              background: '#1e1d24'
            }}
          >
            <IonGrid style={{ background: '#1e1d24' }}>
              <IonRow style={{ background: '#1e1d24' }}>
                <IonCol style={{ background: '#1e1d24', borderColor:'transparent' }} size="12" size-sm="12">
                  <IonImg
                    src="/images/fitlogo.png" // Replace with the actual image URL
                    alt="Image Alt Text"
                    style={{ width: '100%', height: '300px' }}
                  />
                  <p style={{ fontSize: '18px', color: 'lightskyblue', textAlign: 'center', marginTop: '10px' }}>
                    Welcome to Find-Fit! Please login or create a new account to continue.
                  </p>
                  <IonCard style={{ background: '#1e1d24', boxShadow: 'none',borderColor:'transparent' }}>
                    <IonCardHeader />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ padding: '10px', marginBottom: '10px' }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ padding: '10px', marginBottom: '20px' }}
                    />
                    <br></br>
                    <IonCheckbox style={{paddingBottom:'1rem'}}
                      checked={isCreateNewUser}
                      onIonChange={(e) => setIsCreateNewUser(e.detail.checked)}
                    >

                      Create new user
                    </IonCheckbox>
                    <br></br>
                    <button
                      style={{
                        backgroundColor: '#4285F4',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                        fontSize: '15px'
                      }}
                      onClick={loginWithEmailAndPass}
                      disabled={loading}
                    >
                      {isCreateNewUser ? 'Create Account' : 'Login'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        )}
      </IonApp>
    </React.StrictMode>
  );
};

root.render(<Main />);

