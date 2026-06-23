import React, { useState, useMemo, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { applyFilters, getUniqueCounties, getUniqueCuisines } from '../utils/data';
import { AppContext } from '../App';
import RestaurantCard from '../components/RestaurantCard';

const LOGO_URI = 'https://tennsational.com/TENNsational_logo.png';

export default function BrowseScreen({ navigation }) {
  const { allRestaurants } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('All Counties');
  const [cuisine, setCuisine] = useState('All Cuisines');
  const [countyModal, setCountyModal] = useState(false);
  const [cuisineModal, setCuisineModal] = useState(false);

  const counties = useMemo(() => getUniqueCounties(allRestaurants), [allRestaurants]);
  const cuisines = useMemo(() => getUniqueCuisines(allRestaurants), [allRestaurants]);

  const filtered = useMemo(
    () => applyFilters(allRestaurants, { search, county, cuisine }),
    [allRestaurants, search, county, cuisine]
  );

  const displayList = useMemo(() => [
    ...filtered.filter((r) => r.featured),
    ...filtered.filter((r) => !r.featured),
  ], [filtered]);

  const hasFilters = search || county !== 'All Counties' || cuisine !== 'All Cuisines';

  const clearAll = () => {
    setSearch('');
    setCounty('All Counties');
    setCuisine('All Cuisines');
  };

  const PickerModal = ({ visible, options, selected, onSelect, onClose, title }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: COLORS.orange, fontSize: 15, fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, selected === item && styles.modalItemActive]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[styles.modalItemText, selected === item && styles.modalItemTextActive]}>
                  {item}
                </Text>
                {selected === item && <Text style={{ color: COLORS.white }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Header */}
      <View style={styles.header}>
        {/* Logo row — left aligned */}
        <View style={styles.logoRow}>
          <Image
            source={{ uri: LOGO_URI }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerSub}>EAST TENNESSEE'S DINING GUIDE</Text>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisine, city..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, paddingHorizontal: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, county !== 'All Counties' && styles.filterChipActive]}
            onPress={() => setCountyModal(true)}
          >
            <Text style={[styles.filterChipText, county !== 'All Counties' && styles.filterChipTextActive]}>
              📍 {county === 'All Counties' ? 'County' : county.replace(' County', '')} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, cuisine !== 'All Cuisines' && styles.filterChipActive]}
            onPress={() => setCuisineModal(true)}
          >
            <Text style={[styles.filterChipText, cuisine !== 'All Cuisines' && styles.filterChipTextActive]}>
              🍴 {cuisine === 'All Cuisines' ? 'Cuisine' : cuisine} ▾
            </Text>
          </TouchableOpacity>

          {['Blount', 'Cocke', 'Hamblen', 'Jefferson', 'Knox', 'Sevier'].map((c) => {
            const full = `${c} County`;
            const active = county === full;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setCounty(active ? 'All Counties' : full)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}

          {hasFilters && (
            <TouchableOpacity style={styles.clearChip} onPress={clearAll}>
              <Text style={styles.clearChipText}>Clear ✕</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Result count */}
      <Text style={styles.countText}>
        {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}
        {filtered.filter((r) => r.featured).length > 0
          ? ` · ${filtered.filter((r) => r.featured).length} featured`
          : ''}
      </Text>

      {/* Restaurant list */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('Detail', { restaurant: item })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
              <Text style={styles.clearBtnText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <PickerModal
        visible={countyModal}
        options={counties}
        selected={county}
        onSelect={setCounty}
        onClose={() => setCountyModal(false)}
        title="Select County"
      />
      <PickerModal
        visible={cuisineModal}
        options={cuisines}
        selected={cuisine}
        onSelect={setCuisine}
        onClose={() => setCuisineModal(false)}
        title="Select Cuisine"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },

  // Header
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 14,
  },
  logoRow: {
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  logoImage: {
  width: 200,
  height: 64,
  marginLeft: -60,
},
  headerSub: {
    color: COLORS.orange,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    height: 42,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    height: '100%',
  },

  // Filters
  filterBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
  },
  filterScroll: { paddingHorizontal: 14, gap: 8 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  filterChipText: { color: COLORS.navy, fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.white },
  clearChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff0e8',
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  clearChipText: { color: COLORS.orange, fontSize: 13, fontWeight: '600' },

  // Count
  countText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.gray,
    backgroundColor: COLORS.cream,
  },

  // List
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, fontFamily: 'Georgia', marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.gray, marginBottom: 20 },
  clearBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.navy },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalItemActive: { backgroundColor: COLORS.green },
  modalItemText: { fontSize: 15, color: COLORS.navy },
  modalItemTextActive: { color: COLORS.white, fontWeight: '600' },
});
