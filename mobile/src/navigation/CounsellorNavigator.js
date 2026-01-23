import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

import CounsellorDashboard from '../screens/counsellor/CounsellorDashboard';
import AvailabilityScreen from '../screens/counsellor/AvailabilityScreen';
import CounsellorAppointmentsScreen from '../screens/counsellor/CounsellorAppointmentsScreen';
import QRScannerScreen from '../screens/counsellor/QRScannerScreen';
import SessionDetailsScreen from '../screens/counsellor/SessionDetailsScreen';
import StudentHistoryScreen from '../screens/counsellor/StudentHistoryScreen';
import SessionHistoryScreen from '../screens/counsellor/SessionHistoryScreen';
import CounsellorProfileScreen from '../screens/counsellor/CounsellorProfileScreen';
import DailyAffirmationsScreen from '../screens/counsellor/DailyAffirmationsScreen';
import PendingAppointmentsScreen from '../screens/counsellor/PendingAppointmentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Dashboard"
      component={CounsellorDashboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MyAppointments"
      component={CounsellorAppointmentsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PendingAppointments"
      component={PendingAppointmentsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QRScanner"
      component={QRScannerScreen}
      options={{ title: 'Scan QR Code' }}
    />
    <Stack.Screen
      name="SessionDetails"
      component={SessionDetailsScreen}
      options={{ title: 'Session Details' }}
    />
    <Stack.Screen
      name="StudentHistory"
      component={StudentHistoryScreen}
      options={{ title: 'Student History' }}
    />
  </Stack.Navigator>
);

const CounsellorNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Availability':
              iconName = focused ? 'calendar-clock' : 'calendar-clock';
              break;
            case 'Affirmation':
              iconName = focused ? 'lightbulb' : 'lightbulb-outline';
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
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Availability" component={AvailabilityScreen} />
      <Tab.Screen name="Affirmation" component={DailyAffirmationsScreen} />
      <Tab.Screen name="History" component={SessionHistoryScreen} />
      <Tab.Screen name="Profile" component={CounsellorProfileScreen} />
    </Tab.Navigator>
  );
};

export default CounsellorNavigator;
