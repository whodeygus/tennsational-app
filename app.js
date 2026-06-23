import React, { useState, useEffect, createContext } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchRestaurants } from './utils/data';
import { COLORS } from './constants/colors';
import BrowseScreen from './screens/BrowseScreen';
import MapScreen from './screens/MapScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import DetailScreen from './screens/DetailScreen';

const FAVORITES_KEY = '@tennsational_favorites';

export const AppContext = createContext({
  allRestaurants: [],
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
});

const Tab = createBottomTabNavigator();
const BrowseStack = createStackNavigator();
const FavStack = createStackNavigator();

const NAV_HEADER = {
  headerStyle: { backgroundColor: COLORS.navy },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontFamily: 'Georgia', fontWeight: '700' },
};

function BrowseStackNav() {
  return (
    <BrowseStack.Navigator screenOptions={NAV_HEADER}>
      <BrowseStack.Screen name="BrowseList" component={BrowseScreen} options={{ headerShown: false }} />
      <BrowseStack.Screen name="Detail" component={DetailScreen} options={{ title: '' }} />
    </BrowseStack.Navigator>
  );
}

function FavStackNav() {
  return (
    <FavStack.Navigator screenOptions={NAV_HEADER}>
      <FavStack.Screen name="FavList" component={FavoritesScreen} options={{ headerShown: false }} />
      <FavStack.Screen name="FavDetail" component={DetailScreen} options={{ title: '' }} />
    </FavStack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopColor: COLORS.orange,
          borderTopWidth: 2,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        ...NAV_HEADER,
      }}
    >
      <Tab.Screen
        name="Browse"
        component={BrowseStackNav}
        options={{
          headerShown: false,
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🍽️</Text>,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Map View',
          tabBarLabel: 'Map',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavStackNav}
        options={{
          headerShown: false,
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>❤️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function SplashScreen({ onDone }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(onDone);
      }, 1800);
    });
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity }]}>
      <Image
        source={{ uri: 'https://tennsational.com/TENNsational_logo.png' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.splashTagline}>Explore. Taste. Discover.</Text>
      <Text style={styles.splashSub}>EAST TENNESSEE'S DINING GUIDE</Text>
    </Animated.View>
  );
}

function AppInner() {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [error, setError] = useState(null);

  // Load restaurants and saved favorites on startup
  useEffect(() => {
    const init = async () => {
      try {
        // Load restaurant data and saved favorites in parallel
        const [data, savedFavs] = await Promise.all([
          fetchRestaurants(),
          AsyncStorage.getItem(FAVORITES_KEY),
        ]);

        setAllRestaurants(data);

        if (savedFavs) {
          setFavorites(JSON.parse(savedFavs));
        }
      } catch (err) {
        setError('Could not load restaurant data. Check your connection.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Save favorites to storage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (restaurant) => {
    setFavorites((prev) => {
      const exists = prev.find((r) => r.id === restaurant.id);
      return exists
        ? prev.filter((r) => r.id !== restaurant.id)
        : [...prev, restaurant];
    });
  };

  const isFavorite = (id) => favorites.some((r) => r.id === id);

  if (!splashDone || loading) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (error) {
    return (
      <View style={styles.splash}>
        <Image
          source={{ uri: 'https://tennsational.com/TENNsational_logo.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={{ color: '#ff6b6b', marginTop: 30, textAlign: 'center', paddingHorizontal: 30 }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ allRestaurants, favorites, toggleFavorite, isFavorite }}>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 340,
    height: 170,
    marginBottom: 16,
    marginLeft: -10,
  },
  splashTagline: {
    color: COLORS.orange,
    fontSize: 16,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  splashSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
