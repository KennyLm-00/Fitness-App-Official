import React, { useState, useEffect } from 'react';
import { IonCardContent, IonText, IonIcon, IonAvatar } from '@ionic/react';
import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2';
import { send, close } from 'ionicons/icons';
import { auth, firestore } from '../firebase/firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  DocumentData,
  addDoc,
} from 'firebase/firestore';

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  user: string;
  userImageUrl?: string;
}

interface PostCommentsProps {
    postId: string;
    comments: Comment[]; // Add this line
    onAddComment: (commentText: string) => void;
    onCloseComments: () => void;
  }
  

const PostComments: React.FC<PostCommentsProps> = ({
  postId,
  onAddComment,
  onCloseComments,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const commentsCollection = collection(
      firestore,
      'posts',
      postId,
      'comments'
    );
    const commentsQuery = query(commentsCollection, orderBy('timestamp'));

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const updatedComments: Comment[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          text: data.text || '',
          timestamp: data.timestamp
            ? new Date(data.timestamp.toMillis())
            : new Date(),
          user: data.user || '',
          userImageUrl:
            data.userImageUrl ||
            'https://ionicframework.com/docs/img/demos/avatar.svg',
        };
      });
      setComments(updatedComments);
    });

    return () => {
      unsubscribe();
    };
  }, [postId]);

  const handleAddComment = async () => {
    try {
      const user = auth.currentUser;

      if (user) {
        const comment = {
          text: commentText,
          timestamp: new Date(),
          user: user.displayName || user.email || '',
          userImageUrl: user.photoURL || '',
        };

        // Update Firestore
        const commentsCollection = collection(
          firestore,
          'posts',
          postId,
          'comments'
        );
        const docRef = await addDoc(commentsCollection, comment);

        // Clear the comment text after adding
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <IonCardContent className="post-comments-overlay">
      {/* Close button */}
      <div className="close-button" onClick={onCloseComments}>
        <IonIcon icon={close} style={{ fontSize: '2rem' }} />
      </div>
      <div className="comments-container">
        {/* Display existing comments */}
        {comments.map((comment: Comment) => (
          <div key={comment.id} className="comment-item">
            {/* User Avatar and Username */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <IonAvatar style={{ marginRight: '8px' }}>
                <img
                  alt="User avatar"
                  src={
                    comment.userImageUrl ||
                    'https://ionicframework.com/docs/img/demos/avatar.svg'
                  }
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
          style={{
            width: '90%',
            borderRadius: '10px',
            background: '#1b221f',
            color: 'white',
          }}
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
          onClick={handleAddComment}
        />
      </div>
    </IonCardContent>
  );
};

export default PostComments;
