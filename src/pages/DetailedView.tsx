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
    IonChip,
    IonLabel
} from '@ionic/react'; import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { CiShare1 } from "react-icons/ci";
import { heart, heartOutline, barbellOutline, arrowBack } from 'ionicons/icons';
import './DetailedView.css';

const DetailedView: React.FC<{
    post: {
        id: string;
        imageUrl?: string | undefined;
        likes: number;
        likedBy: string[];
        caption?: string; // Include caption property
        category?: string; // Include category property
    } | null;
    username: string;
    userImageUrl: string; // Add userImageUrl property
    onClose: () => void;
    onLike: (postId: string) => void;
}> = ({ post, username, userImageUrl, onClose, onLike }) => {
    if (!post) {
        return null;
    }

    const handleBackButtonClick = () => {
        onClose();
    };

    return (
        <IonPage>
            <IonContent style={{ margin: 'auto' }}>
                <IonHeader translucent={false}>
                    <IonToolbar>
                        <button onClick={handleBackButtonClick} style={{ background: 'transparent', fontSize: '2.5rem' }}>
                            <IonIcon slot="icon-only" icon={arrowBack} style={{color:'white'}} />
                        </button>
                    </IonToolbar>
                </IonHeader>
                <IonCard style={{ margin: 'auto' }}>
                    <IonChip>
                        <IonAvatar>
                            <img src={userImageUrl} alt="User Profile" />
                        </IonAvatar>
                        <IonLabel style={{ fontWeight: 'bold' }}>
                            {username}
                        </IonLabel>
                    </IonChip>
                    <IonChip style={{ background: '#ffb057' }}>
                        <IonIcon style={{ color: 'white' }} icon={barbellOutline} />
                        <IonLabel style={{ fontWeight: 'bold' }}>
                            {post.category}
                        </IonLabel>
                    </IonChip>
                    <IonCardContent style={{ color: 'white' }}>{post.caption}</IonCardContent>
                    <IonCardContent>
                        {post.imageUrl && <img src={post.imageUrl} alt={`Detailed View`} style={{ width: '100%', borderRadius: '8px' }} />}
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
