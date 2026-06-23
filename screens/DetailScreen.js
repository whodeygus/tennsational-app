import React, { useContext, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { cleanImageUrl, formatPhone } from '../utils/data';
import { AppContext } from '../App';

const PLACEHOLDER = { uri: 'https://tennsational.com/tennsational_logo_hero.png' };

const Stars = ({ rating = 0, size = 18 }) => (
  <View style={{ flexDirection: 'row' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Text key={i} style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB', fontSize: size }}>
        ★
      </Text>
    ))}
  </View>
);

const ActionButton = ({ icon, label, onPress, active }) => (
  <TouchableOpacity style={[styles.actionBtn, active && styles.actionBtnActive]} onPress={onPress}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={[styles.actionLabel, active && { color: COLORS.orange }]}>{label}</Text>
  </TouchableOpacity>
);

const InfoRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, onPress && { color: COLORS.orange }]} numberOfLines={onPress ? 1 : 4}>
        {value}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function DetailScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const { isFavorite, toggleFavorite } = useContext(AppContext);
  const fav = isFavorite(restaurant.id);
  const imageUri = cleanImageUrl(restaurant.featured_image);

  // Favorite button in header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: restaurant.name,
      headerRight: () => (
        <TouchableOpacity onPress={() => toggleFavorite(restaurant)} style={{ marginRight: 4 }}>
          <Text style={{ fontSize: 22, paddingHorizontal: 4 }}>{fav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, fav, restaurant]);

  const handleCall = () => {
    if (!restaurant.phone) return;
    Linking.openURL(`tel:${restaurant.phone.replace(/\D/g, '')}`).catch(() =>
      Alert.alert('Error', 'Could not open the phone app.')
    );
  };

  const handleWebsite = () => {
    if (!restaurant.website) return;
    const url = restaurant.website.startsWith('http')
      ? restaurant.website
      : `https://${restaurant.website}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open the website.'));
  };

  const handleDirections = () => {
    const lat = restaurant.lat;
    const lng = restaurant.lng;
    if (lat && lng) {
      Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
    } else if (restaurant.address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`);
    } else {
      Alert.alert('No address', 'No address available for this restaurant.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero image */}
      <Image
        source={imageUri ? { uri: imageUri } : PLACEHOLDER}
        style={styles.hero}
        resizeMode="cover"
      />

      {/* Main info */}
      <View style={styles.section}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
          {restaurant.price_range ? (
            <Text style={styles.price}>{restaurant.price_range}</Text>
          ) : null}
        </View>

        {/* Cuisine + featured badge */}
        <View style={styles.badgeRow}>
          {restaurant.cuisine ? (
            <View style={styles.cuisineBadge}>
              <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
            </View>
          ) : null}
          {restaurant.featured ? (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐ Featured</Text>
            </View>
          ) : null}
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Stars rating={restaurant.rating} />
          <Text style={styles.ratingText}>
            {' '}{restaurant.rating?.toFixed(1)}
            {restaurant.review_count ? ` · ${restaurant.review_count.toLocaleString()} reviews` : ''}
          </Text>
        </View>

        {/* Location */}
        <Text style={styles.location}>
          📍 {restaurant.city ? `${restaurant.city}, ` : ''}{restaurant.county}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsWrap}>
        <ActionButton icon="🗺️" label="Directions" onPress={handleDirections} />
        {restaurant.phone ? (
          <ActionButton icon="📞" label="Call" onPress={handleCall} />
        ) : null}
        {restaurant.website ? (
          <ActionButton icon="🌐" label="Website" onPress={handleWebsite} />
        ) : null}
        <ActionButton
          icon={fav ? '❤️' : '🤍'}
          label={fav ? 'Saved' : 'Save'}
          onPress={() => toggleFavorite(restaurant)}
          active={fav}
        />
      </View>

      <View style={styles.divider} />

      {/* Description */}
      {restaurant.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{restaurant.description}</Text>
        </View>
      ) : null}

      {/* Info rows */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        {restaurant.address ? (
          <InfoRow icon="📍" label="Address" value={restaurant.address} onPress={handleDirections} />
        ) : null}
        {restaurant.hours ? (
          <InfoRow icon="🕐" label="Hours" value={restaurant.hours} />
        ) : null}
        {restaurant.phone ? (
          <InfoRow icon="📞" label="Phone" value={formatPhone(restaurant.phone)} onPress={handleCall} />
        ) : null}
        {restaurant.website ? (
          <InfoRow icon="🌐" label="Website" value={restaurant.website} onPress={handleWebsite} />
        ) : null}
      </View>

      {/* Amenities */}
      {restaurant.amenities && restaurant.amenities.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesWrap}>
            {restaurant.amenities.map((a, i) => (
              <View key={i} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: { width: '100%', height: 270, backgroundColor: COLORS.lightGray },

  section: { paddingHorizontal: 18, paddingVertical: 16 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.navy, fontFamily: 'Georgia', flex: 1, marginRight: 10, lineHeight: 28 },
  price: { fontSize: 18, fontWeight: '700', color: '#16a34a', flexShrink: 0 },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  cuisineBadge: { backgroundColor: '#e8f0e0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  cuisineText: { color: COLORS.green, fontSize: 13, fontWeight: '600' },
  featuredBadge: { backgroundColor: '#fff3cd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  featuredText: { color: '#856404', fontSize: 13, fontWeight: '600' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { color: COLORS.gray, fontSize: 14 },
  location: { color: COLORS.gray, fontSize: 14 },

  actionsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cream,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  actionBtnActive: { backgroundColor: '#fff0e8' },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 12, color: COLORS.navy, fontWeight: '600' },

  divider: { height: 8, backgroundColor: COLORS.cream },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, fontFamily: 'Georgia', marginBottom: 12 },
  description: { color: '#444', fontSize: 14, lineHeight: 22 },

  infoRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  infoIcon: { fontSize: 17, marginRight: 12, marginTop: 1 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.grayLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 14, color: COLORS.navy, lineHeight: 20 },

  amenitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityText: { fontSize: 12, color: COLORS.navy },
});
