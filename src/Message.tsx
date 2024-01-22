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
  IonCardSubtitle,
  IonFabButton,
  IonFab,
  IonInput,
  IonFabList,
  IonIcon
} from '@ionic/react';
import { auth, firestore } from './firebase/firebaseConfig';
import { getDocs, collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { RiMenu2Fill } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import { arrowUpCircle, addCircle, images, imageOutline, search } from 'ionicons/icons';

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
  const [recentChats, setRecentChats] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const userId = auth.currentUser?.uid;
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const usersData: User[] = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!recipientId) return;

    const unsubscribeMessages = onSnapshot(
      query(collection(firestore, 'messages'), orderBy('timestamp', 'asc')),
      (snapshot) => {
        const messagesData: Message[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));

        const filteredMessages = messagesData.filter(
          (message) =>
            (message.senderId === userId && message.recipientId === recipientId) ||
            (message.senderId === recipientId && message.recipientId === userId)
        );

        setMessages(filteredMessages);
      }
    );

    return () => {
      unsubscribeMessages();
    };
  }, [userId, recipientId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || recipientId.trim() === '') return;

    await addDoc(collection(firestore, 'messages'), {
      content: newMessage,
      senderId: userId!,
      recipientId,
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
  // Add this function
  // Add this function with TypeScript types
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes} ${period}`;
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <IonPage>
      <IonMenu contentId="main-content">
        <IonList>
          <IonCardHeader>
            <IonCardSubtitle style={{ textAlign: 'center',color:'white' }}>Recent Chats</IonCardSubtitle>
          </IonCardHeader>

          {/* Add search bar with icon */}
          <IonItem>
            <IonIcon icon={search} slot="start" style={{ marginRight: '8px' }} />
            <IonInput
              placeholder="Search users"
              value={searchTerm}
              onIonChange={(e) => setSearchTerm(e.detail.value!)}
            ></IonInput>
          </IonItem>

          {/* Display users in the menu if available */}
          {users.length > 0 ? (
            users
              .filter((user) =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
                <IonItem key={user.id} onClick={() => setRecipientId(user.id)}>
                  <IonAvatar slot="start">
                    <img src={user.photoURL || 'default_avatar_url'} alt="Avatar" />
                  </IonAvatar>
                  <IonText>{user.username}</IonText>
                </IonItem>
              ))
          ) : (
            <IonItem>No users available</IonItem>
          )}
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
      <IonContent id='main-content' fullscreen style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <IonCardSubtitle className='ion-text-center' style={{ color: 'white', paddingTop: "10px" }}>
          {recipientId && users.find((user) => user.id === recipientId)?.username}
        </IonCardSubtitle>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', zIndex: 1, maxHeight: 'calc(100% - 120px)' }}>
          {/* Display messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: userId === message.senderId ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
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
                  background: message.senderId === userId ? '#1F8AFF' : 'rgb(42 45 47)',
                  color:'white'
                }}
              >
                {message.content}
                <div style={{ fontSize: '0.8em', textAlign: 'left' }}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </IonLabel>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 60, width: '100%', padding: '10px', borderTop: '1px solid #ccc', display: 'flex', zIndex: 2 }}>
          <IonFab slot="fixed" vertical="bottom" horizontal="start"
            style={{ padding: '0', background: 'transparent' }}>
            <IonFabButton>
              <IonIcon icon={addCircle} style={{ background: 'transparent', fontSize: '2.3rem', color: '#ffb057' }}></IonIcon>
            </IonFabButton>
            <IonFabList side="top">
              <IonFabButton>
                <IonIcon icon={imageOutline} style={{ background: 'transparent', fontSize: '2.3rem', color: 'white' }}></IonIcon>
              </IonFabButton>
              <IonFabButton>
                <IonIcon icon={addCircle} style={{ background: 'transparent', fontSize: '2.3rem', color: 'white' }}></IonIcon>
              </IonFabButton>
              <IonFabButton>
                <IonIcon icon={addCircle} style={{ background: 'transparent', fontSize: '2.3rem', color: 'white' }}></IonIcon>
              </IonFabButton>
            </IonFabList>
          </IonFab>

          <textarea
            value={newMessage}
            placeholder="Type your message..."
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1, marginLeft: '45px', marginRight: '5px', color: 'white', background: 'darkslategray' }}
          />

          <button style={{ background: 'transparent', fontSize: '2.3rem', color: '#ffb057' }} onClick={sendMessage}>
            <IonIcon icon={arrowUpCircle} />
          </button>
        </div>


      </IonContent>


    </IonPage>

  );
};

export default Message;
