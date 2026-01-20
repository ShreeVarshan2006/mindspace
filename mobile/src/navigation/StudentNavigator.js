import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import StudentDashboard from '../screens/student/StudentDashboard';
import CounsellorListScreen from '../screens/student/CounsellorListScreen';
import BookAppointmentScreen from '../screens/student/BookAppointmentScreen';
import AppointmentsScreen from '../screens/student/AppointmentsScreen';
import JournalListScreen from '../screens/student/JournalListScreen';
import JournalEditorScreen from '../screens/student/JournalEditorScreen';
import MoodTrackerScreen from '../screens/student/MoodTrackerScreen';
import SessionHistoryScreen from '../screens/student/SessionHistoryScreen';
import QRCodeScreen from '../screens/student/QRCodeScreen';
import ProfileScreen from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MoodTracker"
      component={MoodTrackerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CounsellorList"
      component={CounsellorListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="BookAppointment"
      component={BookAppointmentScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="JournalList"
      component={JournalListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="JournalEditor"
      component={JournalEditorScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QRCode"
      component={QRCodeScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const StudentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'History':
              iconName = focused ? 'history' : 'history';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F5A962',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="History" component={SessionHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
