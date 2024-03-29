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
import { heart, heartOutline, barbellOutline, arrowBack, ellipsisHorizontal } from 'ionicons/icons';
import PostComments from './PostComments'; // Make sure to import PostComments from the correct path

const DetailedView: React.FC<{
    post: {
        id: string;
        imageUrl?: string | undefined;
        likes: number;
        likedBy: string[];
        caption?: string;
        category?: string;
        comments?: any[]; // Add comments property
    } | null;
    username: string;
    userImageUrl: string;
    onClose: () => void;
    onLike: (postId: string) => void;
}> = ({ post, username, userImageUrl, onClose, onLike }) => {
    const [showComments, setShowComments] = useState(false);

    const handleBackButtonClick = () => {
        onClose();
        window.location.reload(); // Refresh the page
    };
    const handleLikeClick = () => {
        onLike(post?.id || '');
    };

    const handleToggleCommentsClick = () => {
        setShowComments(!showComments);
    };
    return (
        <IonPage>
            <IonContent style={{ margin: 'auto' }}>
                <IonHeader translucent={false}>
                    <IonToolbar className="ion-toolbar-custom" style={{ boxShadow: 'none', borderBottomRightRadius: '0', borderBottomLeftRadius: '0' }}>
                        <button onClick={handleBackButtonClick} style={{ background: 'transparent', fontSize: '2rem' }}>
                            <IonIcon slot="icon-only" icon={arrowBack} style={{ color: 'white' }} />
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
                            {post?.category ?? ''}
                        </IonLabel>
                    </IonChip>
                    <IonCardContent style={{ color: 'white' }}>{post?.caption ?? ''}</IonCardContent>
                    <IonCardContent>
                        {post?.imageUrl && <img src={post.imageUrl} alt={`Detailed View`} style={{ width: '100%', borderRadius: '8px' }} />}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <IonIcon
                                    icon={(post?.likedBy.includes(username) ?? false) ? heart : heartOutline}
                                    style={{ fontSize: '24px', color: (post?.likedBy.includes(username) ?? false) ? 'red' : 'white' }}
                                    onClick={() => onLike(post?.id || '')}
                                />
                                <span style={{ color: 'white', marginLeft: '5px' }}>{post?.likes ?? 0}</span>
                            </div>
                            <div>
                                <HiOutlineChatBubbleBottomCenterText
                                    style={{ fontSize: '24px', color: 'white', fontWeight: '100', cursor: 'pointer' }}
                                    onClick={handleToggleCommentsClick}
                                />
                                <CiShare1 style={{ fontSize: '24px', color: 'white' }} />
                            </div>
                        </div>

                        {/* Display comments if showComments is true */}
                        {showComments && (
                            <PostComments
                                postId={post?.id || ''}
                                comments={post?.comments || []}
                                onAddComment={(commentText: string) => {/* Implement this if needed */ }}
                                onCloseComments={handleToggleCommentsClick}
                            />
                        )}
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default DetailedView;
