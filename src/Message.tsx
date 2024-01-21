import React, { useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonPage,
  IonTitle,
  IonAvatar,
  IonLabel,
  IonTextarea,
  IonText,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonMenu,
  IonList,
  IonItem,
  IonMenuButton,
  IonRouterOutlet,
  IonMenuToggle,
  IonCardSubtitle
} from '@ionic/react';
import { auth, firestore } from './firebase/firebaseConfig';
import { getDocs, collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { RiMenu2Fill } from "react-icons/ri";
import { IoSend } from "react-icons/io5";

interface User {
  id: string;
  username: string;
  photoURL?: string; // Add this line to include the optional photoURL property
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
}

const Message: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [recentChats, setRecentChats] = useState<string[]>([]);

  const userId = auth.currentUser?.uid;
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(firestore, 'users'), (snapshot) => {
      const usersData: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username,
        photoURL: doc.data().photoURL
      } as User));
      setUsers(usersData);
    });

    const unsubscribeMessages = onSnapshot(
      query(collection(firestore, 'messages'), orderBy('timestamp', 'asc')),
      (snapshot) => {
        const messagesData: Message[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(messagesData.filter((message) => message.senderId === userId || message.recipientId === userId));
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeMessages();
    };
  }, [userId]);



  const sendMessage = async () => {
    if (newMessage.trim() === '' || recipientId.trim() === '') return;

    const recipient = users.find((user) => user.username.toLowerCase() === recipientId.toLowerCase());

    if (!recipient) {
      console.error('Recipient not found');
      return;
    }

    await addDoc(collection(firestore, 'messages'), {
      content: newMessage,
      senderId: userId!,
      recipientId: recipient.id,
      timestamp: new Date().toISOString(),
    });

    setNewMessage('');
  };
  const updateRecentChats = (recipient: string) => {
    // Add the recipient to the recent chats list
    setRecentChats((prevChats) => {
      const updatedChats = [...prevChats];
      if (!updatedChats.includes(recipient)) {
        updatedChats.push(recipient);
      }
      return updatedChats;
    });
  };

  return (
    <IonPage>
      <IonMenu contentId="main-content">
        <IonList>
          <IonCardHeader>
            <IonCardSubtitle style={{ textAlign: 'center' }}>Recent Chats</IonCardSubtitle>
          </IonCardHeader>
          {/* Display users in the menu */}
          {users.map((user) => (
            <IonItem key={user.id} onClick={() => setRecipientId(user.username)}>
              <IonAvatar slot="start">
                <img src={user.photoURL || 'default_avatar_url'} alt="Avatar" />
              </IonAvatar>
              <IonText>{user.username}</IonText>
            </IonItem>
          ))}

          {/* Other menu items */}
        </IonList>
      </IonMenu>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start" >
            <IonMenuToggle>
              <RiMenu2Fill style={{ fontSize: '24px', color: 'white', fontWeight: '100', marginLeft: '5px' }} />
            </IonMenuToggle>
            {/* <IonMenuButton style={{color:'white'}}/> */}
          </IonButtons>
          <IonTitle>Messages</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent id='main-content' fullscreen>
        <IonCard style={{ boxShadow: 'none', background: 'transparent' }}>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1rem', fontWeight: '500', textAlign: 'center' }}>
              {users.find((user) => user.username === recipientId)?.username}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Display messages */}
            {/* Display messages in reverse order (most recent at the bottom) */}
            {/* Display messages in reverse order (most recent at the bottom) */}
            {/* Display messages in natural order (most recent at the bottom) */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    flexDirection: userId === message.senderId ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',  // Align to the bottom
                    marginBottom: '10px'
                  }}
                >
                  <IonAvatar>
                    <img src={message.senderId ? users.find((user) => user.id === message.senderId)?.photoURL || 'default_avatar_url' : 'default_avatar_url'} alt="Avatar" />
                  </IonAvatar>

                  <IonLabel
                    style={{
                      marginLeft: userId === message.senderId ? '0' : '10px',
                      marginRight: userId === message.senderId ? '10px' : '0',
                      padding: '10px',
                      borderRadius: '10px',
                      background: message.senderId === userId ? 'lightblue' : 'lightgreen'
                    }}
                  >
                    {message.content}
                    <div style={{ fontSize: '0.8em', textAlign: 'right' }}>{message.timestamp}</div>
                  </IonLabel>
                </div>
              ))}
            </div>


            {/* Input for new message */}
            {/* <IonSelect
              placeholder="Select recipient"
              value={recipientId}
              onIonChange={(e) => setRecipientId(e.detail.value)}
              style={{ marginBottom: '10px', color: 'white', fontWeight: 'bold' }}
            >
              {users.map((user) => (
                <IonSelectOption key={user.id} value={user.username}>
                  {user.username}
                </IonSelectOption>
              ))}
            </IonSelect> */}
            <IonTextarea
              value={newMessage}
              placeholder="Type your message..."
              onIonChange={(e) => setNewMessage(e.detail.value!)}
              style={{ marginBottom: '10px', color: 'white' }}
            />
            <IonButton onClick={sendMessage}>
              Send 
              &nbsp;
            <IoSend />
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>

  );
};

export default Message;
