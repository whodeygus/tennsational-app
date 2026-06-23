const DATA_URL =
  'https://raw.githubusercontent.com/whodeygus/tennsational/main/src/data/allRestaurants.json';

export const fetchRestaurants = async () => {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('Failed to fetch restaurant data');
  const json = await res.json();
  return json.restaurants || json;
};

export const applyFilters = (restaurants, { search = '', county = 'All Counties', cuisine = 'All Cuisines' }) => {
  let result = restaurants;

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.cuisine?.toLowerCase().includes(q) ||
        r.county?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }

  if (county !== 'All Counties') {
    result = result.filter((r) => r.county === county);
  }

  if (cuisine !== 'All Cuisines') {
    result = result.filter((r) => r.cuisine === cuisine);
  }

  return result;
};

export const getUniqueCounties = (restaurants) => [
  'All Counties',
  ...[...new Set(restaurants.map((r) => r.county).filter(Boolean))].sort(),
];

export const getUniqueCuisines = (restaurants) => [
  'All Cuisines',
  ...[...new Set(restaurants.map((r) => r.cuisine).filter(Boolean))].sort(),
];

export const formatPhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10)
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  if (cleaned.length === 11 && cleaned[0] === '1')
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  return phone;
};

export const cleanImageUrl = (url) => {
  if (!url || url === '' || url.includes('streetviewpixels')) return null;
  return url;
};
