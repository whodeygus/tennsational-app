import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { AppContext } from '../App';
import RestaurantCard from '../components/RestaurantCard';

export default function FavoritesScreen({ navigation }) {
  const { favorites } = useContext(AppContext);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSub}>
          {favorites.length > 0
            ? `${favorites.length} saved restaurant${favorites.length !== 1 ? 's' : ''}`
            : 'YOUR SAVED SPOTS'}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            While browsing or viewing a restaurant, tap the heart to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => navigation.navigate('FavDetail', { restaurant: item })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  headerSub: {
    color: COLORS.orange,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 18 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
    fontFamily: 'Georgia',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 280,
  },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
});
