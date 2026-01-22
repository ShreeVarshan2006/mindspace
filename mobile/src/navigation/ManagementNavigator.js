import React from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../redux/slices/authSlice';

import ManagementDashboard from '../screens/management/ManagementDashboard';
import DepartmentAnalyticsScreen from '../screens/management/DepartmentAnalyticsScreen';
import YearAnalyticsScreen from '../screens/management/YearAnalyticsScreen';
import SeverityAnalyticsScreen from '../screens/management/SeverityAnalyticsScreen';
import ManagementProfileScreen from '../screens/management/ManagementProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Dashboard"
      component={ManagementDashboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DepartmentAnalytics"
      component={DepartmentAnalyticsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="YearAnalytics"
      component={YearAnalyticsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SeverityAnalytics"
      component={SeverityAnalyticsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ManagementNavigator = () => {
  const dispatch = useDispatch();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Logout':
              iconName = 'logout';
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

      <Tab.Screen
        name="Logout"
        component={ManagementDashboard}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: () => dispatch(logout())
                }
              ]
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default ManagementNavigator;
