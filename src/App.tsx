import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, logoGoogle, square, triangle, homeOutline, person, barbellOutline, settings, addOutline, addCircleOutline, settingsOutline,add, chatbubble } from 'ionicons/icons';
// import Google from './pages/Google';
import { FaHome, FaPlusCircle, FaCog } from 'react-icons/fa';
import { GoHomeFill } from "react-icons/go";
import { CiSearch } from "react-icons/ci";
import { IoAddCircle } from "react-icons/io5";

import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Search from './pages/Search';
import Splits from './pages/Splits';
import SplitDaysView from './pages/SplitDaysView'; // Import the new component

import UserProfiles from './pages/UserProfiles';
import { RiSearch2Fill } from "react-icons/ri";

import Notifications from './pages/Notifications';
import Powerlifting from './category/powerlifting';
import Bodybuilding from './category/bodybuilding';
import Crossfit from './category/crossfit';
import Calisthenics from './category/calisthenics';
// import BodyBuilding from './pages/Tab3';
// import Calis from './pages/Tab3';

import Message from './Message';
import './pages/Tab1.css';

import firebase from './firebase/firebaseConfig'; // Adjust the path accordingly

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import GymClaimPage from './pages/GymClaim/GymClaimPage';
const iconSize = 25; // Set the desired size
const customActiveColor = '#ff0000';
const customInactiveColor = 'red'; // Change this to your desired inactive color

document.documentElement.style.setProperty('--color-selected', customActiveColor);
document.documentElement.style.setProperty('--color-inactive', customInactiveColor)

document.documentElement.style.setProperty('--color-selected', customActiveColor);

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>

          <Route path="/user/:username" component={UserProfiles} />
          <Route path="/split-days/:username" component={SplitDaysView} exact />

          <Route exact path="/gymclaim">
            <GymClaimPage />
          </Route>
          <Route exact path="/tab1">
            <Tab1 />
          </Route>
          <Route path="/search">
            <Search />
          </Route>
          <Route exact path="/tab2">
            <Tab2 />
          </Route>
          <Route path="/tab3">
            <Tab3 />
          </Route>
          <Route path="/powerlifting">
            <Powerlifting />
          </Route>
          <Route path="/bodybuilding">
            <Bodybuilding />
          </Route>
          <Route path="/crossfit">
            <Crossfit />
          </Route>
          <Route path="/calisthenics">
            <Calisthenics />
          </Route>
          <Route path="/Message">
            <Message />
          </Route>
          <Route path="/notifications">
            <Notifications />
          </Route>  
          <Route path="/splits">
            <Splits />
          </Route>
          <Route exact path="/">
            <Redirect to="/tab1" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/tab1">
            <GoHomeFill size={iconSize} />
            {/* <span>Home</span> */}
          </IonTabButton>
          <IonTabButton tab="search" href="/search">
            <RiSearch2Fill size={iconSize} />
            {/* <span>Home</span> */}
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2">
            <IoAddCircle size={45} />
            {/* <span>Create</span> */}
          </IonTabButton>
          <IonTabButton tab="Message" href="/Message">
            <IonIcon icon={chatbubble} style={{ fontSize: '1.5rem' }}></IonIcon>
            {/* <span>Settings</span> */}
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            {/* <FaCog size={iconSize} /> */}
            <IonIcon icon={person} style={{ fontSize: '1.5rem' }}></IonIcon>
            {/* <span>Settings</span> */}
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp >
);

export default App;

//hello