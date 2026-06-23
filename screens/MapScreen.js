import React, { useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS } from '../constants/colors';
import { AppContext } from '../App';
import { cleanImageUrl } from '../utils/data';

const EAST_TN = {
  latitude: 35.9606,
  longitude: -83.9207,
  latitudeDelta: 1.3,
  longitudeDelta: 1.3,
};

const COUNTY_REGIONS = {
  'All':       EAST_TN,
  'Blount':    { latitude: 35.7007, longitude: -83.9707, latitudeDelta: 0.45, longitudeDelta: 0.45 },
  'Cocke':     { latitude: 35.9007, longitude: -83.1207, latitudeDelta: 0.45, longitudeDelta: 0.45 },
  'Hamblen':   { latitude: 36.2107, longitude: -83.2807, latitudeDelta: 0.25, longitudeDelta: 0.25 },
  'Jefferson': { latitude: 36.0507, longitude: -83.4607, latitudeDelta: 0.35, longitudeDelta: 0.35 },
  'Knox':      { latitude: 35.9907, longitude: -83.9307, latitudeDelta: 0.5,  longitudeDelta: 0.5  },
  'Sevier':    { latitude: 35.7907, longitude: -83.5207, latitudeDelta: 0.5,  longitudeDelta: 0.5  },
};

const Stars = ({ rating = 0 }) => (
  <View style={{ flexDirection: 'row' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Text key={i} style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB', fontSize: 14 }}>★</Text>
    ))}
  </View>
);

export default function MapScreen({ navigation }) {
  const { allRestaurants } = useContext(AppContext);
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const mapRef = useRef(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const mappable = allRestaurants.filter(
    (r) => r.lat && r.lng && (selectedCounty === 'All' || r.county?.includes(selectedCounty))
  );

  const handleCountySelect = (c) => {
    setSelectedCounty(c);
    dismissCard();
    mapRef.current?.animateToRegion(COUNTY_REGIONS[c] || EAST_TN, 600);
  };

  const showCard = (restaurant) => {
    setSelectedRestaurant(restaurant);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const dismissCard = () => {
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedRestaurant(null));
  };

  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const imageUri = selectedRestaurant ? cleanImageUrl(selectedRestaurant.featured_image) : null;

  return (
    <View style={styles.container}>
      {/* County filter chips */}
      <View style={styles.chipBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {Object.keys(COUNTY_REGIONS).map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, selectedCounty === c && styles.chipActive]}
              onPress={() => handleCountySelect(c)}
            >
              <Text style={[styles.chipText, selectedCounty === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.pinCount}>{mappable.length} restaurants</Text>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={EAST_TN}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        onPress={dismissCard}
      >
        {mappable.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.lat, longitude: r.lng }}
            pinColor={r.featured ? COLORS.orange : COLORS.green}
            onPress={(e) => {
              e.stopPropagation();
              showCard(r);
            }}
          />
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.orange }]} />
          <Text style={styles.legendText}>Featured</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.legendText}>Restaurant</Text>
        </View>
      </View>

      {/* Bottom card — slides up when marker tapped */}
      {selectedRestaurant && (
        <Animated.View style={[styles.card, { transform: [{ translateY: cardTranslate }] }]}>
          <TouchableOpacity style={styles.cardDismiss} onPress={dismissCard}>
            <View style={styles.cardHandle} />
          </TouchableOpacity>

          <View style={styles.cardContent}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
            ) : null}

            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={1}>{selectedRestaurant.name}</Text>

              <View style={styles.cardRow}>
                <View style={styles.cuisinePill}>
                  <Text style={styles.cuisineText}>{selectedRestaurant.cuisine}</Text>
                </View>
                {selectedRestaurant.price_range ? (
                  <Text style={styles.priceText}>{selectedRestaurant.price_range}</Text>
                ) : null}
              </View>

              <View style={styles.cardRow}>
                <Stars rating={selectedRestaurant.rating} />
                <Text style={styles.ratingText}>
                  {' '}{selectedRestaurant.rating?.toFixed(1)}
                  {selectedRestaurant.review_count ? ` (${selectedRestaurant.review_count.toLocaleString()})` : ''}
                </Text>
              </View>

              <Text style={styles.cardLocation} numberOfLines={1}>
                📍 {selectedRestaurant.city ? `${selectedRestaurant.city}, ` : ''}{selectedRestaurant.county}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => {
              dismissCard();
              navigation.navigate('Browse', {
                screen: 'Detail',
                params: { restaurant: selectedRestaurant },
              });
            }}
          >
            <Text style={styles.detailBtnText}>View Full Details →</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  chipBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  chipScroll: { paddingHorizontal: 14, gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  chipText: { fontSize: 13, color: COLORS.navy, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },
  pinCount: { textAlign: 'center', fontSize: 11, color: COLORS.gray, paddingTop: 4, paddingBottom: 2 },

  map: { flex: 1 },

  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: COLORS.navy, fontWeight: '500' },

  // Bottom card
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    paddingBottom: 24,
  },
  cardDismiss: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    flexShrink: 0,
  },
  cardBody: { flex: 1, justifyContent: 'center' },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
    flexWrap: 'wrap',
  },
  cuisinePill: {
    backgroundColor: '#e8f0e0',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  cuisineText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  priceText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  ratingText: { color: COLORS.gray, fontSize: 12 },
  cardLocation: { color: COLORS.gray, fontSize: 12 },

  detailBtn: {
    marginHorizontal: 16,
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  detailBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
