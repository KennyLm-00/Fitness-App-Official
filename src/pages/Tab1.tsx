import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { addDoc, collection, serverTimestamp, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';

interface Task {
  id: string;
  text: string;
}

const Tab1: React.FC = () => {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = collection(firestore, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksData = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    };

    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    try {
      if (taskText.trim() !== '') {
        const tasksCollection = collection(firestore, 'tasks');
        const taskDoc = {
          text: taskText,
          timestamp: serverTimestamp(),
        };
        await addDoc(tasksCollection, taskDoc);

        // Clear the input field after adding the task
        setTaskText('');

        // Fetch updated tasks
        const tasksSnapshot = await getDocs(tasksCollection);
        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <IonGrid>
          <IonRow justify-content-center align-items-center>
            <IonCol size="12" size-sm="8" size-md="6">
              {/* Form for adding tasks */}
              <form>
                <IonInput
                  placeholder="Enter task"
                  value={taskText}
                  onIonChange={(e) => setTaskText(e.detail.value!)}
                ></IonInput>
                <IonButton onClick={handleAddTask}>Add Task</IonButton>
              </form>

              {/* List to display tasks */}
              <IonList>
                {tasks.map((task) => (
                  <IonItem key={task.id}>
                    <IonLabel>{task.text}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;




