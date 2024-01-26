// PostComments.tsx
import React, { useState } from 'react';
import { IonCardContent, IonText, IonIcon, IonAvatar } from '@ionic/react';
import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2';
import { send, close } from 'ionicons/icons';

interface Comment {
    text: string;
    timestamp: React.Key;
    user: string;
    userImageUrl?: string; // Include userImageUrl in the Comment interface
}

interface PostCommentsProps {
    comments: Comment[];
    onAddComment: (commentText: string) => void;
    onCloseComments: () => void;
}

const PostComments: React.FC<PostCommentsProps> = ({ comments, onAddComment, onCloseComments }) => {
    const [commentText, setCommentText] = useState('');

    return (
        <IonCardContent className="post-comments-overlay">
            {/* Close button */}
            <div className="close-button" onClick={onCloseComments}>
                <IonIcon icon={close} style={{ fontSize: '2rem' }} />
            </div>
            <div className="comments-container">
                {/* Display existing comments */}
                {comments.map((comment: Comment) => (
                    <div key={comment.timestamp} className="comment-item">
                        {/* User Avatar and Username */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <IonAvatar style={{ marginRight: '8px' }}>
                                <img
                                    alt="User avatar"
                                    src={comment.userImageUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'}
                                />
                            </IonAvatar>
                            <strong style={{ marginRight: '8px' }}>{comment.user}</strong>
                        </div>
                        {/* Comment Text */}
                        <IonText>{comment.text}</IonText>
                    </div>
                ))}
            </div>

            {/* Add Comment Section */}
            <div className="add-comment-section">
                <input
                    style={{ width: '90%', borderRadius: '10px', background: '#1b221f', color: 'white' }}
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <IonIcon
                    style={{
                        fontSize: '1rem',
                        padding: '0.7rem',
                        borderRadius: '50px',
                        background: 'blue',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                    }}
                    icon={send}
                    onClick={() => {
                        onAddComment(commentText);
                        setCommentText('');
                    }}
                />
            </div>
        </IonCardContent>
    );
};

export default PostComments;
