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
  IonInput,
  IonIcon,
  IonNote
} from '@ionic/react';
import { logOutOutline, heartOutline, heart, barbellOutline, notificationsOutline, send } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebaseConfig';
import { FaRegCommentDots } from "react-icons/fa6";
import { CiShare1 } from "react-icons/ci";
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { FaBell } from "react-icons/fa";
import { GoHeart } from "react-icons/go";
import { notifications } from 'ionicons/icons'
import { getDocs, collection, updateDoc, doc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import '@ionic/react/css/ionic-swiper.css';
import 'swiper/css/navigation';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import calImage from '../images/cal.jpg';
import powerImage from '../images/power.jpg';
import oceanImage from '../images/body.jpg'; // Assuming you have an image named 'ocean.jpg'
import crossImage from '../images/cross.jpg';
const Tab1: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userImageUrl, setUserImageUrl] = useState<string>('');
  const [posts, setPosts] = useState<any[]>([]); // Update the type as needed
  const [commentText, setCommentText] = useState<string>(''); // Add this line to declare state for comment text
  const [showComments, setShowComments] = useState(false);

  const history = useHistory();

  interface Comment {
    text: string;
    timestamp: Date;
    user: string;
    // ...other comment-related fields
  }

  const data = [
    {
      title: "Bodybuilding",
      image: calImage,
    },
    {
      title: "Powerlifting",
      image: powerImage,
    },
    {
      title: "Calisthenics",
      image: oceanImage,
    },
    {
      title: "CrossFit",
      image: crossImage,
    }
  ];
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error('User not authenticated.');
          history.push('/');
        } else {
          const emailParts = user.email?.split('@') || [];
          const userNameFromEmail = emailParts[0] || user.email || '';

          setUserName(userNameFromEmail);

          // Set a default image URL if user.photoURL is null
          const defaultImageUrl = 'https://ionicframework.com/docs/img/demos/avatar.svg';
          setUserImageUrl(user.photoURL || defaultImageUrl);

          // Fetch posts from Firestore
          const postsCollection = collection(firestore, 'posts');
          const querySnapshot = await getDocs(postsCollection);

          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPosts(postsData);
        }
      } catch (error) {
        console.error('Error retrieving user information:', error);
      }
    };

    fetchPosts();
  }, []);
  const handleAddComment = async (postId: string, commentText: string) => {
    try {
      const user = auth.currentUser;

      if (user) {
        const comment = {
          text: commentText,
          timestamp: new Date(),
          user: user.displayName || user.email || '',
          // ...other comment-related fields
        };

        // Update the state
        setPosts((prevPosts) => {
          return prevPosts.map((prevPost) => {
            if (prevPost.id === postId) {
              return {
                ...prevPost,
                comments: [...(prevPost.comments || []), comment],
              };
            }
            return prevPost;
          });
        });

        // Update Firestore
        const postRef = doc(firestore, 'posts', postId);
        await updateDoc(postRef, {
          comments: arrayUnion(comment),
        });

        // Clear the comment text after adding
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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

  const iconColor = liked ? 'white' : 'red';

  return (
    <IonPage>
      <IonContent className='home' fullscreen>
        <IonHeader translucent={false}>
          <IonToolbar>
            <IonButtons slot="start">
              {userImageUrl && (
                <img
                  className='profile-image'
                  style={{ borderRadius: '50%', width: '40px', height: '40px', marginRight: '10px' }}
                  src={userImageUrl}
                  alt="User Profile Picture"
                />
              )}
            </IonButtons>
            <IonCardSubtitle style={{ fontSize: '12px', color: 'white', fontWeight: '600', margin: 'auto' }}>
              {userName ? `${userName}` : 'Loading user...'}
            </IonCardSubtitle>
            <IonButtons slot="end">
              {/* Use IonRouterLink for clean navigation */}
              <IonRouterLink routerLink="/notifications" routerDirection="forward" style={{ textDecoration: 'none', color: 'white' }}>
                <IonIcon icon={notificationsOutline} style={{ fontSize: '27px', marginRight: '5px' }} />
              </IonRouterLink>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <div className='container' style={{ maxWidth: '1200px', margin: 'auto' }}>
          <IonGrid>
            <IonCardTitle style={{ fontSize: '1rem', padding: '0.8rem', color: 'white' }}>Categories</IonCardTitle>
            <Swiper
              style={{ background: 'transparent', borderColor: 'transparent' }}
              spaceBetween={1}
              slidesPerView={1.8}
              modules={[Pagination, Scrollbar, A11y, Autoplay]}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              autoplay={{ delay: 2000 }}
            >
              {data.map((card, index) => {
                const categoryPath = `/${card.title.toLowerCase()}`; // Assuming category pages are named after the category

                return (
                  <SwiperSlide key={`slide_${index}`}>
                    <IonCard className="homecard3" routerLink={categoryPath} style={{ background: 'transparent', borderColor: 'transparent', boxShadow: 'none', position: 'relative' }}>
                      <IonCardContent className='homecard3_label' style={{ position: 'absolute', top: '0', left: '0', padding: '1rem', color: 'white' }}>
                        <IonIcon icon={barbellOutline} style={{ fontSize: '1.5rem' }}></IonIcon>
                      </IonCardContent>
                      <img style={{ background: 'transparent', borderColor: 'none', borderRadius: '35px', height: '300px' }} src={card.image} alt="card" className="image" />
                      <IonCardContent className='homecard3_label' style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
                        <button style={{ background: '#012d65', padding: '1rem', borderRadius: '15px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }} className='buttonhome'>
                          {card.title}
                        </button>
                      </IonCardContent>
                    </IonCard>
                  </SwiperSlide>


                )
              })}
            </Swiper>
            <IonRow>

              {posts.map((post) => (
                <IonCol key={post.id} size="12" size-sm="4">
                  <IonCard style={{}}>
                    {/* Render your post data dynamically here */}
                    <IonChip>
                      <IonAvatar>
                        <img alt="Silhouette of a person's head" src={post.userImageUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'} />
                      </IonAvatar>
                      <IonLabel style={{ fontWeight: 'bold' }}>{post.username}</IonLabel>
                    </IonChip>
                    {/* <br></br> */}
                    <IonText style={{ padding: '1rem', color: 'lightgrey', float: 'right' }}>
                      {post.timestamp && new Date(post.timestamp.toDate()).toLocaleString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </IonText>
                    <IonChip style={{ background: '#ffb057' }}>
                      <IonIcon style={{ color: 'white' }} icon={barbellOutline} />
                      <IonLabel style={{ fontWeight: 'bold' }}>
                        {post.category}
                      </IonLabel>
                    </IonChip>
                    <IonCardContent style={{ color: 'white' }}>{post.caption}</IonCardContent>
                    {post && post.imageUrl && (
                      <>
                        <img style={{ borderRadius: '0px', background: 'transparent' }} src={post.imageUrl} alt="Post Image" />
                        {/* Uncomment the line below if you want to display the caption */}
                        {/* <p>{post.caption}</p> */}
                      </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IonCol size="2" size-sm="4" style={{ zIndex: '100' }}>
                          <IonIcon
                            icon={post.likedBy.includes(userName) ? heart : heartOutline}
                            style={{ fontSize: '24px', color: post.likedBy.includes(userName) ? 'red' : 'white' }}
                            onClick={() => handleLike(post.id, userName)}
                          />
                        </IonCol>
                        <IonCol size="8" size-sm="4" style={{ color: 'white' }}>
                          <IonCardContent>{post.likes}</IonCardContent>
                        </IonCol>
                      </div>
                      <div>
                        {/* Icon to toggle comments visibility */}
                        
                        <IonCol size="12" size-sm="4" style={{ zIndex: '100' }}>
                          <HiOutlineChatBubbleBottomCenterText
                            style={{ fontSize: '24px', color: 'white', fontWeight: '100', cursor: 'pointer' }}
                            onClick={() => setShowComments(!showComments)}
                          />
                        </IonCol>
                        {/* Likes count */}
                        <IonCol size="12" size-sm="4">
                          <CiShare1 style={{ fontSize: '24px', color: 'white' }} />
                        </IonCol>
                      </div>
                    </div>

                    {/* Display comments only if showComments is true */}
                    {showComments && (
                      <IonCardContent style={{paddingTop:'0px'}}>
                        {/* ... other post details */}
                        {/* Display existing comments */}
                        {post.comments?.map((comment: any) => (
                          <div key={comment.timestamp} style={{ padding:'.5rem'}}>
                            <strong style={{width:'90%',borderRadius:'10px',color:'white'}}>{comment.user}:</strong>
                            <IonText style={{color:'white'}}> {comment.text} </IonText>
                          </div>
                        ))}

                        {/* Add Comment Section */}
                        <div>
                          <input
                          style={{width:'90%',borderRadius:'10px',color:'white'}}
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                          <IonIcon icon = {send} style={{color:'white',float:'right',fontSize:'1.5rem'}} onClick={() => handleAddComment(post.id, commentText)} />
                        </div>
                      </IonCardContent>
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

export default Tab1;





