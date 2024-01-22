import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonBackButton, IonTitle, IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonIcon } from '@ionic/react';
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { CiShare1 } from "react-icons/ci";
import { heart, heartOutline, arrowBack } from 'ionicons/icons';
import './Tab1.css';
import '../theme/variables.css';

/* Core CSS required for Ionic components to work properly */

/* Theme variables */
import '../theme/variables.css';
const DetailedView: React.FC<{
    post: { id: string; imageUrl?: string | undefined; likes: number; likedBy: string[] } | null;
    username: string; // Add username prop
    onClose: () => void;
    onLike: (postId: string) => void;
}> = ({ post, username, onClose, onLike }) => {
    if (!post) {
        return null;
    }

    const handleBackButtonClick = () => {
        // Handle back button click logic here
        onClose();
    };
    return (
        <IonPage>
            {/* <IonHeader translucent={false} style={{backgroundColor:'#1b221f'}}>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleBackButtonClick}>
                            <IonIcon slot="icon-only" icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Detailed View</IonTitle>
                </IonToolbar>
            </IonHeader> */}
            <IonContent style={{ margin: 'auto' }}>
                <button onClick={handleBackButtonClick} style={{background:'transparent',fontSize:'2.5rem'}}>
                    <IonIcon slot="icon-only" icon={arrowBack} />
                </button>
                <IonCard style={{ margin: 'auto'}}>

                    <IonCardHeader>
                        <IonCardSubtitle style={{ textAlign: 'center', color: 'white' }}>
                            Post title
                        </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {post.imageUrl && (
                            <img src={post.imageUrl} alt={`Detailed View`} style={{ width: '100%', borderRadius: '8px' }} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <IonIcon
                                    icon={post.likedBy.includes(username) ? heart : heartOutline}
                                    style={{ fontSize: '24px', color: post.likedBy.includes(username) ? 'red' : 'white' }}
                                    onClick={() => onLike(post.id)}
                                />
                                <span style={{ color: 'white', marginLeft: '5px' }}>{post.likes}</span>
                            </div>
                            <div>
                                <HiOutlineChatBubbleBottomCenterText style={{ fontSize: '24px', color: 'white', fontWeight: '100' }} />
                                <CiShare1 style={{ fontSize: '24px', color: 'white' }} />
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default DetailedView;

