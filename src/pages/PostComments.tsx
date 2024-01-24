// PostComments.tsx
import React, { useState } from 'react';
import { IonCardContent, IonText, IonIcon } from '@ionic/react';
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { send,close} from 'ionicons/icons';

interface Comment {
  text: string;
  timestamp: React.Key;
  user: string;
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
          <IonIcon icon={close}/>
        </div>
  
        <div className="comments-container">
          {/* Display existing comments */}
          {comments.map((comment: Comment) => (
            <div key={comment.timestamp} className="comment-item">
              <strong>{comment.user}:</strong>
              <IonText>{comment.text}</IonText>
            </div>
          ))}
        </div>
  
        {/* Add Comment Section */}
        <div className="add-comment-section">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <IonIcon
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
