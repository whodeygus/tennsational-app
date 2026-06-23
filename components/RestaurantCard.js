import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { cleanImageUrl } from '../utils/data';
import { AppContext } from '../App';

const PLACEHOLDER = { uri: 'https://tennsational.com/tennsational_logo_hero.png' };

const Stars = ({ rating = 0 }) => (
  <View style={{ flexDirection: 'row' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Text key={i} style={{ color: i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB', fontSize: 13 }}>
        ★
      </Text>
    ))}
  </View>
);

export default function RestaurantCard({ restaurant, onPress }) {
  const { isFavorite } = useContext(AppContext);
  const fav = isFavorite(restaurant.id);
  const imageUri = cleanImageUrl(restaurant.featured_image);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image
          source={imageUri ? { uri: imageUri } : PLACEHOLDER}
          style={styles.image}
          resizeMode="cover"
        />
        {restaurant.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        {fav && (
          <View style={styles.favDot}>
            <Text style={{ fontSize: 12 }}>❤️</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* Name + price */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          {restaurant.price_range ? (
            <Text style={styles.price}>{restaurant.price_range}</Text>
          ) : null}
        </View>

        {/* Cuisine + location */}
        <View style={styles.metaRow}>
          <View style={styles.cuisinePill}>
            <Text style={styles.cuisineText} numberOfLines={1}>
              {restaurant.cuisine}
            </Text>
          </View>
          <Text style={styles.location} numberOfLines={1}>
            📍 {restaurant.city ? `${restaurant.city}, ` : ''}{restaurant.county?.replace(' County', '')}
          </Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Stars rating={restaurant.rating} />
          <Text style={styles.ratingText}>
            {' '}{restaurant.rating?.toFixed(1)}
            {restaurant.review_count ? ` (${restaurant.review_count.toLocaleString()})` : ''}
          </Text>
        </View>

        {/* Description snippet */}
        {restaurant.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 175, backgroundColor: COLORS.lightGray },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.orange,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  featuredText: { color: COLORS.white, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  favDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 4,
  },
  body: { padding: 13 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.navy, fontFamily: 'Georgia', flex: 1, marginRight: 8 },
  price: { fontSize: 15, fontWeight: '700', color: '#16a34a', flexShrink: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7, gap: 8, flexWrap: 'wrap' },
  cuisinePill: {
    backgroundColor: '#e8f0e0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    maxWidth: 140,
  },
  cuisineText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  location: { color: COLORS.grayLight, fontSize: 12, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  ratingText: { color: COLORS.gray, fontSize: 12 },
  description: { color: '#555', fontSize: 13, lineHeight: 19 },
});
