import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonCol,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonCard,
  IonGrid,
  IonRow,
  IonPage,
  IonText,
  IonChip,
  IonAvatar,
  IonLabel,
  IonIcon,
  IonToolbar,
  IonButtons,
  IonButton,
} from '@ionic/react';
import { barbellOutline, logOutOutline, heartOutline, heart, chatbubbleOutline } from 'ionicons/icons';
import { FaRegCommentDots } from "react-icons/fa6";
import { updateDoc, doc, arrayRemove, arrayUnion } from 'firebase/firestore';

import { useHistory } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebaseConfig';
import { getDocs, collection, query, where } from 'firebase/firestore';

const Calisthenics: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [CalisthenicsPosts, setCalisthenicsPosts] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchCalisthenicsPosts = async () => {
      const CalisthenicsCollection = collection(firestore, 'posts');
      const CalisthenicsQuery = query(CalisthenicsCollection, where('category', '==', 'calisthenics'));

      try {
        const querySnapshot = await getDocs(CalisthenicsQuery); // Use getDocs instead of get
        const CalisthenicsPostsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log('Calisthenics Posts Data:', CalisthenicsPostsData);
        setCalisthenicsPosts(CalisthenicsPostsData);
      } catch (error) {
        console.error('Error fetching Calisthenics posts:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        console.error('User not authenticated.');
        history.push('/');
      }
    });

    fetchCalisthenicsPosts();

    return () => unsubscribe();
  }, [history]);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await auth.signOut();
      history.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLike = async (postId: string, userId: string) => {
    try {
      const likedPostIndex = CalisthenicsPosts.findIndex((post) => post.id === postId);

      if (likedPostIndex !== -1) {
        const likedBy = CalisthenicsPosts[likedPostIndex].likedBy;
        const alreadyLiked = likedBy.includes(userId);

        const updatedLikedBy = alreadyLiked
          ? likedBy.filter((id: string) => id !== userId)
          : [...likedBy, userId];

        setCalisthenicsPosts((prevPosts) => {
          const updatedPosts = [...prevPosts];
          updatedPosts[likedPostIndex] = {
            ...updatedPosts[likedPostIndex],
            likes: updatedLikedBy.length,
            likedBy: updatedLikedBy,
          };
          return updatedPosts;
        });

        const postRef = doc(firestore, 'posts', postId);
        await updateDoc(postRef, {
          likes: updatedLikedBy.length,
          likedBy: updatedLikedBy,
        });
      } else {
        console.log('Post not found.');
      }
    } catch (error) {
      console.error('Could not like/unlike post: ', error);
    }
  };
  const handleComment = async () => {

  }
  return (
    <IonPage>
      <IonContent className='home' fullscreen>
        <IonToolbar>
          <IonButtons slot="start">
            {user && (
              <img
                className='profile-image'
                style={{ borderRadius: '50%', width: '40px', height: '40px', marginRight: '10px' }}
                src={user.photoURL}
                alt="User Profile Picture"
              />
            )}
          </IonButtons>
          <IonText>
            <IonLabel style={{ fontSize: '14px', color: 'white', fontWeight: 'bold' }}>{user?.displayName || 'Username'}</IonLabel>
          </IonText>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon style={{ color: 'white' }} icon={logOutOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonGrid>
          <IonRow>
            {CalisthenicsPosts.map((post) => (
              <IonCol key={post.id} size="12" size-sm="4">
                <IonCard>
                  <IonChip>
                    <IonAvatar style={{}}>
                      <img alt="Silhouette of a person's head" src={post.userImageUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'} />
                    </IonAvatar>
                    <IonLabel style={{ fontWeight: 'bold' }}>{post.username}</IonLabel>
                  </IonChip>
                  <IonText>
                    {post.timestamp && new Date(post.timestamp.toDate()).toLocaleString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                  </IonText>
                  <IonChip style={{ background: 'indianred' }}>
                    <IonIcon style={{ color: 'white' }} icon={barbellOutline} />
                    <IonLabel style={{ fontWeight: 'bold' }}>
                      {post.category}
                    </IonLabel>
                  </IonChip>
                  <IonCardContent style={{ color: 'white' }}>{post.caption}</IonCardContent>
                  {post && post.imageUrl && (
                    <>
                      <img style={{ borderRadius: '30px', padding: '1rem' }} src={post.imageUrl} alt="Post Image" />
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IonCol size="2" size-sm="4">
                        <IonCol size="2" size-sm="4">
                          <IonIcon
                            icon={post.likedBy.includes(user.displayName) ? heart : heartOutline}
                            style={{ fontSize: '24px', color: post.likedBy.includes(user.displayName) ? 'red' : 'white' }}
                            onClick={() => handleLike(post.id, user.displayName)}
                          />
                        </IonCol>
                      </IonCol>
                      <IonCol size="8" size-sm="4" style={{ color: 'white' }}>
                        <IonCardContent>{post.likes}</IonCardContent>
                      </IonCol>
                    </div>
                    <div>
                      <IonCol size="12" size-sm="4">
                        <IonIcon
                          icon={chatbubbleOutline}
                          style={{ fontSize: '24px', color: 'white', marginLeft: '10px' }}
                        // onClick={() => handleComment(post.id)}
                        />
                      </IonCol>
                    </div>
                  </div>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Calisthenics;