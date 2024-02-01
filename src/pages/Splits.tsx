import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonModal,
} from '@ionic/react';
import { addDoc, doc, setDoc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebaseConfig';
import { arrowBack, createOutline, trashOutline} from 'ionicons/icons';

import Day1Image from '../images/body.jpg'; // Replace with the actual path to your image

const Splits: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedMuscle, setSelectedMuscle] = useState<string>('');
    const [splitDays, setSplitDays] = useState<any[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    console.error('User not authenticated.');
                    return;
                }

                const userId = user.uid;

                const userDocRef = doc(firestore, 'users', userId);
                const userDocSnapshot = await getDoc(userDocRef);

                if (userDocSnapshot.exists()) {
                    const userDocData = userDocSnapshot.data();
                    if (userDocData) {
                        setSplitDays(userDocData.splitDays || []);
                    }
                }
            } catch (error) {
                console.error('Error retrieving user split days:', error);
            }
        };

        fetchData();
    }, [history]);

    const handleAddSplitDay = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                console.error('User not authenticated.');
                return;
            }

            const userId = user.uid;

            const userDocRef = doc(firestore, 'users', userId);

            // Check if the user has already added splits for the selected day
            const existingDayIndex = splitDays.findIndex((split) => split.day === selectedDay);

            if (existingDayIndex !== -1) {
                // If splits already exist for the selected day, update the existing split
                const updatedSplitDays = [...splitDays];
                updatedSplitDays[existingDayIndex] = { day: selectedDay, muscle: selectedMuscle };
                
                await updateDoc(userDocRef, {
                    splitDays: updatedSplitDays,
                });

                setSplitDays(updatedSplitDays);
            } else {
                // If no splits exist for the selected day, add a new split
                await updateDoc(userDocRef, {
                    splitDays: arrayUnion({ day: selectedDay, muscle: selectedMuscle }),
                });

                setSplitDays((prevSplitDays) => [...prevSplitDays, { day: selectedDay, muscle: selectedMuscle }]);
            }

            // Clear the selectedDay and selectedMuscle
            setSelectedDay('');
            setSelectedMuscle('');
            setEditIndex(null);
        } catch (error) {
            console.error('Error adding/updating split day:', error);
        }
    };

    const handleEditSplit = (index: number) => {
        setEditIndex(index);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditIndex(null);
        setSelectedDay('');
        setSelectedMuscle('');
    };
    const handleDeleteSplit = async (index: number) => {
        try {
            const user = auth.currentUser;

            if (!user) {
                console.error('User not authenticated.');
                return;
            }

            const userId = user.uid;

            const userDocRef = doc(firestore, 'users', userId);

            // Remove the selected split day from the array
            const updatedSplitDays = splitDays.filter((_, i) => i !== index);

            // Update the user's document in Firestore without the deleted split day
            await updateDoc(userDocRef, {
                splitDays: updatedSplitDays,
            });

            // Update the local state
            setSplitDays(updatedSplitDays);
        } catch (error) {
            console.error('Error deleting split day:', error);
        }
    };
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="ion-toolbar-custom" style={{ boxShadow: 'none', borderBottomRightRadius: '0', borderBottomLeftRadius: '0' }}>
                    <button slot="start" onClick={() => history.goBack()} style={{ padding: '0.4rem', background: 'transparent' }}>
                        <IonIcon icon={arrowBack} style={{ fontSize: '2rem' }} />
                    </button>
                    <IonTitle>Splits</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12">
                            <IonCard>
                                <IonCardContent>
                                    <IonGrid>
                                        <IonRow>
                                            <IonCol size="12">
                                                <IonSelect
                                                    placeholder="Select day"
                                                    value={selectedDay}
                                                    onIonChange={(e) => setSelectedDay(e.detail.value)}
                                                >
                                                    <IonSelectOption value="Day 1">Day 1</IonSelectOption>
                                                    <IonSelectOption value="Day 2">Day 2</IonSelectOption>
                                                    <IonSelectOption value="Day 3">Day 3</IonSelectOption>
                                                    <IonSelectOption value="Day 4">Day 4</IonSelectOption>
                                                    <IonSelectOption value="Day 5">Day 5</IonSelectOption>
                                                    <IonSelectOption value="Day 6">Day 6</IonSelectOption>
                                                    <IonSelectOption value="Day 7">Day 7</IonSelectOption>
                                                    {/* Add options for day 3 to day 7 as needed */}
                                                </IonSelect>
                                            </IonCol>
                                        </IonRow>
                                        <IonRow>
                                            <IonCol size="12">
                                                <IonSelect
                                                    multiple={true}
                                                    placeholder="Select muscle"
                                                    value={selectedMuscle}
                                                    onIonChange={(e) => setSelectedMuscle(e.detail.value)}
                                                >
                                                    <IonSelectOption value="Chest  ">Chest</IonSelectOption>
                                                    <IonSelectOption value="Legs  ">Legs</IonSelectOption>
                                                    <IonSelectOption value="Shoulder  ">Shoulder</IonSelectOption>
                                                    <IonSelectOption value="Biceps  ">Biceps</IonSelectOption>
                                                    <IonSelectOption value="Triceps  ">Triceps</IonSelectOption>
                                                    <IonSelectOption value="Rest  ">Rest</IonSelectOption>
                                                    <IonSelectOption value="Repeat  ">Repeat</IonSelectOption>
                                                    {/* Add options for other muscle groups as needed */}
                                                </IonSelect>
                                            </IonCol>
                                        </IonRow>
                                        <IonRow>
                                            <IonCol size="12">
                                                <IonButton onClick={handleAddSplitDay}>Add</IonButton>
                                            </IonCol>
                                        </IonRow>
                                        <IonRow>
                                            <IonCol size="12">
                                                <IonTitle>Your Split Days</IonTitle>
                                            </IonCol>
                                            <br></br>
                                            <br></br>
                                           
                                        <IonCol size="12">
                                            {splitDays.map((split, index) => (
                                                <IonCard key={index} style={{ boxShadow: 'none', color: 'white' }}>
                                                    <IonCardContent>
                                                        <IonRow>
                                                            {/* <IonCol size="2">
                                                                <img src={Day1Image} alt={`Day ${index + 1}`} style={{ width: '100%' }} />
                                                            </IonCol> */}
                                                            <IonCol size="8">
                                                                {split.day}: {split.muscle}{' '}
                                                            </IonCol>
                                                            <IonCol size="2">
                                                                <IonIcon
                                                                    icon={createOutline}
                                                                    style={{ cursor: 'pointer', color: 'white' }}
                                                                    onClick={() => handleEditSplit(index)}
                                                                />
                                                            </IonCol>
                                                            <IonCol size="2">
                                                                <IonIcon
                                                                    icon={trashOutline}
                                                                    style={{ cursor: 'pointer', color: 'white' }}
                                                                    onClick={() => handleDeleteSplit(index)}
                                                                />
                                                            </IonCol>
                                                        </IonRow>
                                                    </IonCardContent>
                                                </IonCard>
                                            ))}
                                        </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Modal for editing splits */}
                <IonModal isOpen={isModalOpen} onDidDismiss={handleModalClose}>
                    <IonContent>
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <IonCard>
                                        <IonCardContent>
                                            <IonGrid>
                                                <IonRow>
                                                    <IonCol size="12">
                                                        <IonSelect
                                                            placeholder="Select day"
                                                            value={selectedDay}
                                                            onIonChange={(e) => setSelectedDay(e.detail.value)}
                                                        >
                                                            <IonSelectOption value="Day 1">Day 1</IonSelectOption>
                                                            <IonSelectOption value="Day 2">Day 2</IonSelectOption>
                                                            <IonSelectOption value="Day 3">Day 3</IonSelectOption>
                                                            <IonSelectOption value="Day 4">Day 4</IonSelectOption>
                                                            <IonSelectOption value="Day 5">Day 5</IonSelectOption>
                                                            <IonSelectOption value="Day 6">Day 6</IonSelectOption>
                                                            <IonSelectOption value="Day 7">Day 7</IonSelectOption>
                                                            {/* Add options for day 3 to day 7 as needed */}
                                                        </IonSelect>
                                                    </IonCol>
                                                </IonRow>
                                                <IonRow>
                                                    <IonCol size="12">
                                                        <IonSelect
                                                            multiple={true}
                                                            placeholder="Select muscle"
                                                            value={selectedMuscle}
                                                            onIonChange={(e) => setSelectedMuscle(e.detail.value)}
                                                        >
                                                            <IonSelectOption value="Chest  ">Chest</IonSelectOption>
                                                            <IonSelectOption value="Legs  ">Legs</IonSelectOption>
                                                            <IonSelectOption value="Shoulder  ">Shoulder</IonSelectOption>
                                                            <IonSelectOption value="Biceps  ">Biceps</IonSelectOption>
                                                            <IonSelectOption value="Triceps  ">Triceps</IonSelectOption>
                                                            <IonSelectOption value="Rest  ">Rest</IonSelectOption>
                                                            <IonSelectOption value="Repeat  ">Repeat</IonSelectOption>
                                                            {/* Add options for other muscle groups as needed */}
                                                        </IonSelect>
                                                    </IonCol>
                                                </IonRow>
                                                <IonRow>
                                                    <IonCol size="12">
                                                        <IonButton onClick={handleAddSplitDay}>Save</IonButton>
                                                    </IonCol>
                                                </IonRow>
                                            </IonGrid>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Splits;
