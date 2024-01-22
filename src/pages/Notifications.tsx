import React from 'react';
import { IonPage, IonContent, IonIcon,IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel } from '@ionic/react';
import { arrowBack } from 'ionicons/icons'
import { useHistory } from 'react-router-dom';

const Notifications: React.FC = () => {
  const history = useHistory();

  const handleBackButtonClick = () => {
    history.goBack(); // Go back to the previous page
  };
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <button onClick={handleBackButtonClick} style={{ background: 'transparent', fontSize: '2.5rem' }}>
              <IonIcon slot="icon-only" icon={arrowBack} />
            </button>
            <IonTitle>Notifications</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {/* Render your notifications dynamically here */}
          <IonItem>
            <IonLabel>New message received</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Friend request accepted</IonLabel>
          </IonItem>
          {/* Add more items based on your notifications data */}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Notifications;
