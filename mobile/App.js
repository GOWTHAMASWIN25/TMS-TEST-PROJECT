import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import storage from './src/storage';
import { StatusBar } from 'expo-status-bar';
import { Button, ErrorBanner } from './src/components/UI';
import { authApi, complaintApi, getErrorMessage, setAuthToken } from './src/api';
import { colors, shadows } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RaiseTicketScreen from './src/screens/RaiseTicketScreen';
import TicketsScreen from './src/screens/TicketsScreen';
import AdminScreen from './src/screens/AdminScreen';

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs({ user, onLogout, onRefresh, refreshKey, stats, recent, overviewError }) {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>⌂</Text>,
        }}
      >
        {(props) => <HomeScreen {...props} user={user} stats={stats} recent={recent} onRefresh={onRefresh} onNavigate={(screen) => props.navigation.navigate(screen)} overviewError={overviewError} />}
      </Tabs.Screen>
      <Tabs.Screen
        name="Tickets"
        options={{
          tabBarLabel: 'Tickets',
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📋</Text>,
        }}
      >
        {(props) => <TicketsScreen {...props} user={user} refreshKey={refreshKey} />}
      </Tabs.Screen>
      <Tabs.Screen
        name="Raise"
        options={{
          tabBarLabel: 'Raise',
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>➕</Text>,
        }}
      >
        {(props) => <RaiseTicketScreen {...props} user={user} onSubmitted={() => { onRefresh(); props.navigation.navigate('Tickets'); }} />}
      </Tabs.Screen>
      <Tabs.Screen
        name="Account"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>👤</Text>,
        }}
      >
        {() => <AccountScreen user={user} onLogout={onLogout} />}
      </Tabs.Screen>
      {user?.role === 'SuperAdmin' && (
        <Tabs.Screen
          name="Admin"
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>⚙️</Text>,
          }}
        >
          {() => <AdminScreen user={user} />}
        </Tabs.Screen>
      )}
    </Tabs.Navigator>
  );
}

function AccountScreen({ user, onLogout }) {
  return (
    <SafeAreaView style={styles.account} edges={['top']}>
      <View style={styles.profileCard}>
        <View style={styles.accountAvatar}>
          <Text style={styles.accountAvatarText}>
            {(user?.username || user?.name || 'G').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.accountName}>{user?.username || user?.name || 'TMS User'}</Text>
        <Text style={styles.accountEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>{user?.role || 'User'}</Text>
        </View>
      </View>
      <Pressable style={styles.logout} onPress={onLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Sign Out of Session</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState('');
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [recent, setRecent] = useState([]);
  const [overviewError, setOverviewError] = useState('');

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      setBooting(true);
      setBootError('');
      try {
        const token = await storage.getItem('goexpo-token');
        if (token) {
          setAuthToken(token);
          try {
            const response = await authApi.profile();
            if (active) setUser(response.data);
          } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
              await storage.deleteItem('goexpo-token');
              setAuthToken(null);
            } else if (active) {
              setBootError(getErrorMessage(error, 'Could not restore your session.'));
            }
          }
        }
      } catch (error) {
        if (active) setBootError(getErrorMessage(error, 'Could not access secure session storage.'));
      } finally {
        if (active) setBooting(false);
      }
    };
    restoreSession();
    return () => { active = false; };
  }, [restoreAttempt]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setOverviewError('');
    Promise.all([complaintApi.stats(), complaintApi.list()])
      .then(([statsResponse, listResponse]) => {
        if (!active) return;
        setStats(statsResponse.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
        setRecent(Array.isArray(listResponse.data) ? listResponse.data : []);
      })
      .catch((error) => {
        if (active) setOverviewError(getErrorMessage(error, 'Could not refresh the overview.'));
      });
    return () => { active = false; };
  }, [user, refreshKey]);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const { token, user: userData } = response.data;
      if (!token || !userData) throw new Error('The server returned an invalid sign-in response.');
      await storage.setItem('goexpo-token', token);
      setAuthToken(token);
      setUser(userData);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Sign in failed. Please try again.'));
    }
  };

  const logout = async () => {
    try {
      await storage.deleteItem('goexpo-token');
      setAuthToken(null);
      setUser(null);
      setBootError('');
      setStats({ total: 0, pending: 0, assigned: 0, closed: 0 });
      setRecent([]);
    } catch (error) {
      Alert.alert('Could not sign out', getErrorMessage(error, 'Could not clear the saved session.'));
    }
  };

  if (booting) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (bootError && !user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.recovery} edges={['top', 'bottom']}>
          <StatusBar style="dark" />
          <View style={styles.recoveryMark}><Text style={styles.recoveryMarkText}>G</Text></View>
          <Text style={styles.recoveryTitle}>Can’t connect yet</Text>
          <Text style={styles.recoveryCopy}>{bootError}</Text>
          <Button title="Try again" onPress={() => setRestoreAttempt((attempt) => attempt + 1)} style={styles.recoveryButton} />
          <Button title="Clear saved session" secondary onPress={logout} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="App">
              {() => <HomeTabs user={user} onLogout={logout} onRefresh={() => setRefreshKey((value) => value + 1)} refreshKey={refreshKey} stats={stats} recent={recent} overviewError={overviewError} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="SignIn">
              {() => <LoginScreen onLogin={login} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  tabBar: {
    height: Platform.OS === 'ios' ? 84 : 70,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    backgroundColor: '#FFFFFF',
    ...shadows.md,
  },
  tabLabel: { fontWeight: '700', fontSize: 11, marginTop: 2 },
  tabIcon: { fontSize: 20 },
  account: { flex: 1, backgroundColor: colors.background, padding: 22, paddingTop: 40 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 26,
    alignItems: 'center',
    ...shadows.sm,
  },
  accountAvatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: { color: colors.primary, fontSize: 32, fontWeight: '900' },
  accountName: { color: colors.ink, fontSize: 22, fontWeight: '900', marginTop: 16, letterSpacing: -0.4 },
  accountEmail: { color: colors.muted, fontSize: 13, marginTop: 4, fontWeight: '500' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 16,
    gap: 6,
  },
  roleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  roleText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  logout: {
    marginTop: 24,
    minHeight: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: colors.dangerLight,
    borderRadius: 16,
    gap: 8,
  },
  logoutIcon: { fontSize: 16 },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  recovery: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 26 },
  recoveryMark: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  recoveryMarkText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  recoveryTitle: { color: colors.ink, fontSize: 28, fontWeight: '900' },
  recoveryCopy: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  recoveryButton: { marginBottom: 11 },
});
