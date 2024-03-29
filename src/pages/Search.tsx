import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonText, IonHeader, IonToolbar } from '@ionic/react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { search } from 'ionicons/icons';

interface User {
    id: string;
    username: string;
    photoURL?: string;
}

const Search: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            const usersData: User[] = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
            setSearchResults(usersData);
        };

        fetchUsers();
    }, []);

    const handleSearch = async () => {
        try {
            const usersSnapshot = await getDocs(
                query(collection(firestore, 'users'), where('username', '>=', searchQuery.toLowerCase()))
            );

            const results = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as User[];

            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    return (
        <IonPage>
            <IonContent>
                <IonHeader translucent={false}>
                    <br></br>
                    <IonSearchbar
                        style={{ color: 'white', background: '#1b221f',paddingTop:'1.2rem' }}
                        value={searchQuery}
                        onIonChange={(e) => setSearchQuery(e.detail.value!)}
                        onIonClear={() => setSearchResults([])}
                        onIonCancel={() => setSearchResults([])}
                        placeholder="Search for users"
                        debounce={500}
                        animated
                        enterkeyhint="search"
                        onIonInput={(e) => {
                            setSearchQuery(e.detail.value!);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                </IonHeader>
                <IonList>
                    {searchResults.map((user) => (
                        <IonItem key={user.id} button>
                            <IonAvatar slot="start">
                                <img src={user.photoURL || 'default_avatar_url'} alt="Avatar" />
                            </IonAvatar>
                            <Link
                                style={{ color: 'white', textDecoration: 'none' }}
                                to={`/user/${user.username}`}>
                                <IonLabel>
                                    <IonText>{user.username}</IonText>
                                </IonLabel>
                            </Link>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default Search;
