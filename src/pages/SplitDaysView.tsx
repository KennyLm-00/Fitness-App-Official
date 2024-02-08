import React, { useEffect, useState } from 'react';
import { IonPage, IonToolbar, IonContent, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonIcon, IonCardContent, IonGrid, IonRow, IonCol, IonCardSubtitle } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { getDocs, collection, where, query } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { arrowBack, createOutline, trashOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const SplitDaysView: React.FC = () => {
    const { username } = useParams<{ username?: string }>();
    const [splitDays, setSplitDays] = useState<any[]>([]);
    const history = useHistory();

    useEffect(() => {
        const fetchUserSplitDays = async () => {
            try {
                console.log('Fetching user split days for:', username);

                if (username) {
                    const usersCollection = collection(firestore, 'users');
                    const usersQuery = query(usersCollection, where('username', '==', username));
                    const userDocsSnapshot = await getDocs(usersQuery);

                    if (!userDocsSnapshot.empty) {
                        const userDoc = userDocsSnapshot.docs[0];
                        const userData = userDoc.data();

                        console.log('User Data:', userData);

                        // Assuming splitDays is an array field in the user document
                        const splitDaysData = userData.splitDays || [];

                        console.log('Split Days Data:', splitDaysData);

                        setSplitDays(splitDaysData);
                    } else {
                        console.error('User not found.');
                    }
                } else {
                    console.error('Username is undefined.');
                }
            } catch (error) {
                console.error('Error fetching user split days:', error);
            }
        };

        fetchUserSplitDays();
    }, [username]);
//style = {{boxShadow:'none'}}
    return (
        <IonPage>
            <IonContent>
                <IonToolbar className="ion-toolbar-custom" style={{ boxShadow: 'none', borderBottomRightRadius: '0', borderBottomLeftRadius: '0' }}>
                    <button slot="start" onClick={() => history.goBack()} style={{ padding: '0.4rem', background: 'transparent' }}>
                        <IonIcon icon={arrowBack} style={{ fontSize: '2rem' }} />
                    </button>
                    <IonTitle style={{textAlign:'center'}}>{username} Splits!</IonTitle>
                </IonToolbar>
                <IonGrid>
        <IonRow>
            {splitDays.map((splitDay) => (
                <IonCol key={splitDay.day} size="12" size-sm="12" style={{ marginBottom: '10px' }}>
                    <IonCard>
                        <IonCardContent>
                            <IonRow className="ion-align-items-center">
                                <IonCol size="4">
                                    <IonCardSubtitle style={{color:'white', fontSize:'1rem'}}>{splitDay.day}:</IonCardSubtitle>
                                </IonCol>
                                <IonCol size="8" style = {{color:'white'}}>
                                    {Array.isArray(splitDay.muscle) ? (
                                        splitDay.muscle.map((muscle: string, index: number) => (
                                            <IonRow key={index} className="ion-align-items-center">
                                                <IonCol size="6" size-md="4">
                                                    {muscle}
                                                </IonCol>
                                            </IonRow>
                                        ))
                                    ) : (
                                        <IonRow className="ion-align-items-center">
                                            <IonCol size="6" size-md="6">
                                                {splitDay.muscle}
                                            </IonCol>
                                        </IonRow>
                                    )}
                                </IonCol>
                            </IonRow>
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            ))}
        </IonRow>

                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default SplitDaysView;
