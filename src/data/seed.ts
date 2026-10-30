import type { Kitchen, MenuCategory, Recipe, SeedCustomer } from '../types'

export const kitchensSeed: Kitchen[] = [
  {
    id: 'k-tiffin',
    slug: 'tiffin-and-co',
    name: 'Tiffin & Co.',
    cuisine: 'Indian',
    tags: ['North Indian', 'Biryani', 'Home kitchen'],
    blurb:
      'Dinner from a home kitchen on Chapel Road. The biryani is cooked in one batch at six and usually goes by nine.',
    area: 'Bandra West',
    address: '14 Chapel Road, Bandra West, Mumbai 400050',
    deliveryMinutes: 38,
    deliveryFee: 29,
    openTime: '17:00',
    closeTime: '23:00',
    dishIds: [],
    heroDishId: 'r11',
  },
  {
    id: 'k-dosa',
    slug: 'dosa-junction',
    name: 'Dosa Junction',
    cuisine: 'South Indian',
    tags: ['Dosa', 'Breakfast', 'Filter coffee'],
    blurb:
      'Ghee dosas from a third-generation kitchen near King’s Circle. Open for breakfast and lunch only.',
    area: 'Matunga East',
    address: '3 Bhandarkar Road, Matunga East, Mumbai 400019',
    deliveryMinutes: 32,
    deliveryFee: 19,
    openTime: '07:00',
    closeTime: '15:00',
    dishIds: [],
    heroDishId: 'r28',
  },
  {
    id: 'k-oven',
    slug: 'oven-and-ember',
    name: 'Oven & Ember',
    cuisine: 'Italian',
    tags: ['Pizza', 'Pasta', 'Wood-fired'],
    blurb:
      'Wood-fired pizza and pasta from the old mill district. The Margherita is the one the regulars order twice.',
    area: 'Lower Parel',
    address: 'Unit 2, Todi Mills, Lower Parel, Mumbai 400013',
    deliveryMinutes: 41,
    deliveryFee: 39,
    openTime: '12:00',
    closeTime: '23:30',
    dishIds: [],
    heroDishId: 'r45',
  },
  {
    id: 'k-wok',
    slug: 'the-wok-room',
    name: 'The Wok Room',
    cuisine: 'Asian',
    tags: ['Wok', 'Ramen', 'Rice bowls'],
    blurb:
      'One wok and high heat. Bowls leave the pass in under four minutes, so the rice still steams when it lands.',
    area: 'Andheri East',
    address: '7 Marol Industrial Estate, Andheri East, Mumbai 400059',
    deliveryMinutes: 35,
    deliveryFee: 29,
    openTime: '17:00',
    closeTime: '23:00',
    dishIds: [],
    heroDishId: 'r16',
  },
  {
    id: 'k-casa',
    slug: 'casa-verde',
    name: 'Casa Verde',
    cuisine: 'Mediterranean',
    tags: ['Mezze', 'Greek', 'Salads'],
    blurb:
      'Mezze and slow-baked plates from a courtyard kitchen off Colaba Causeway. The moussaka is made in the morning.',
    area: 'Colaba',
    address: '22 Sassoon Road, Colaba, Mumbai 400005',
    deliveryMinutes: 44,
    deliveryFee: 49,
    openTime: '17:00',
    closeTime: '23:00',
    dishIds: [],
    heroDishId: 'r19',
  },
  {
    id: 'k-grill',
    slug: 'bombay-grill',
    name: 'Bombay Grill',
    cuisine: 'Grills',
    tags: ['Kebabs', 'Charcoal', 'Street food'],
    blurb:
      'Charcoal kebabs from a stall that became a kitchen. Everything is grilled to order, so the last order is at 22:45.',
    area: 'Dadar West',
    address: '5 Ranade Road, Dadar West, Mumbai 400028',
    deliveryMinutes: 36,
    deliveryFee: 29,
    openTime: '17:00',
    closeTime: '23:30',
    dishIds: [],
    heroDishId: 'r24',
  },
  {
    id: 'k-sugar',
    slug: 'sugar-and-spoon',
    name: 'Sugar & Spoon',
    cuisine: 'Desserts',
    tags: ['Desserts', 'Smoothies', 'Cold drinks'],
    blurb:
      'Small-batch desserts and cold drinks, packed in glass. Tiramisu is assembled at four and rests until service.',
    area: 'Juhu',
    address: '9 Gulmohar Cross Road, Juhu, Mumbai 400049',
    deliveryMinutes: 28,
    deliveryFee: 19,
    openTime: '10:00',
    closeTime: '23:30',
    dishIds: [],
    heroDishId: 'r23',
  },
]

export const kitchenByRecipeId: Record<number, string> = {
  5: 'k-grill',
  11: 'k-tiffin',
  12: 'k-tiffin',
  13: 'k-tiffin',
  14: 'k-tiffin',
  15: 'k-tiffin',
  20: 'k-tiffin',
  22: 'k-dosa',
  28: 'k-dosa',
  29: 'k-dosa',
  1: 'k-oven',
  4: 'k-oven',
  7: 'k-oven',
  9: 'k-oven',
  10: 'k-oven',
  23: 'k-oven',
  41: 'k-oven',
  45: 'k-oven',
  46: 'k-oven',
  2: 'k-wok',
  8: 'k-wok',
  16: 'k-wok',
  18: 'k-wok',
  21: 'k-wok',
  32: 'k-wok',
  34: 'k-wok',
  37: 'k-wok',
  42: 'k-wok',
  44: 'k-wok',
  48: 'k-wok',
  6: 'k-casa',
  17: 'k-casa',
  19: 'k-casa',
  33: 'k-casa',
  38: 'k-casa',
  39: 'k-casa',
  49: 'k-casa',
  24: 'k-grill',
  26: 'k-grill',
  31: 'k-grill',
  36: 'k-grill',
  43: 'k-grill',
  47: 'k-grill',
  3: 'k-sugar',
  25: 'k-sugar',
  35: 'k-sugar',
  50: 'k-sugar',
}

// Prices are set per dish, in rupees, the way a menu would print them.
export const priceByRecipeId: Record<number, number> = {
  1: 449, 2: 349, 3: 199, 4: 499, 5: 429, 6: 379, 7: 279, 8: 479, 9: 329, 10: 549,
  11: 429, 12: 399, 13: 369, 14: 349, 15: 329, 16: 449, 17: 379, 18: 429, 19: 449,
  20: 469, 21: 399, 22: 149, 23: 279, 24: 399, 25: 229, 26: 199, 27: 329, 28: 249,
  29: 299, 30: 349, 31: 249, 32: 329, 33: 349, 34: 249, 35: 179, 36: 459, 37: 499,
  38: 349, 39: 319, 40: 299, 41: 269, 42: 429, 43: 219, 44: 449, 45: 399, 46: 419,
  47: 439, 48: 329, 49: 309, 50: 229,
}

export const vegetarianIds = new Set([
  2, 3, 6, 7, 9, 15, 17, 22, 23, 25, 26, 28, 29, 31, 32, 33, 34, 35, 38, 39, 41, 43,
  45, 46, 48, 49, 50,
])

export const categoryForRecipe = (recipe: Recipe): MenuCategory => {
  const tags = recipe.tags.map((tag) => tag.toLowerCase())
  const meals = recipe.mealType.map((meal) => meal.toLowerCase())
  if (tags.includes('cocktail')) return 'Drinks'
  if (meals.includes('dessert') || tags.includes('dessert')) return 'Desserts'
  if (
    meals.includes('beverage') ||
    tags.includes('smoothie') ||
    tags.includes('lassi') ||
    tags.includes('mojito')
  )
    return 'Drinks'
  if (meals.includes('breakfast') && !meals.includes('dinner')) return 'Breakfast'
  if (
    meals.includes('appetizer') ||
    meals.includes('snack') ||
    meals.includes('snacks') ||
    meals.includes('side dish') ||
    tags.includes('bruschetta') ||
    tags.includes('spring rolls') ||
    tags.includes('elote') ||
    tags.includes('salsa') ||
    tags.includes('kebabs')
  )
    return 'Snacks'
  return 'Mains'
}

export const buildDescription = (recipe: Recipe, category: MenuCategory) => {
  const skip = /salt|serve|garnish|for serving|to taste/i
  const items = recipe.ingredients
    .filter((item) => !skip.test(item))
    .slice(0, 3)
    .map((item) => item.split(',')[0].trim().toLowerCase())
  if (!items.length) return `A ${recipe.cuisine.toLowerCase()} ${category.toLowerCase()} cooked to order.`
  if (items.length === 1) return `Made with ${items[0]}, cooked to order.`
  if (items.length === 2) return `Made with ${items[0]} and ${items[1]}, cooked to order.`
  return `Made with ${items[0]}, ${items[1]} and ${items[2]}, cooked to order.`
}

export const soldOutSeed: Record<number, { at: string; compare: string }> = {
  11: { at: '19:12', compare: '19:58' },
  14: { at: '20:24', compare: '20:06' },
  23: { at: '21:05', compare: '21:20' },
}

export const customersSeed: SeedCustomer[] = [
  {
    name: 'Aarav Mehta',
    phone: '+91 98200 41192',
    address: 'Flat 7B, Sea Breeze, Carter Road, Bandra West, Mumbai 400050',
    area: 'Bandra West',
  },
  {
    name: 'Riya Kulkarni',
    phone: '+91 98330 77214',
    address: 'Flat 402, Ashoka Towers, S.V. Road, Khar West, Mumbai 400052',
    area: 'Khar West',
  },
  {
    name: 'Farah Shaikh',
    phone: '+91 98211 66380',
    address: 'House 12, Lane 4, Santacruz West, Mumbai 400054',
    area: 'Santacruz West',
  },
  {
    name: 'Nikhil Rao',
    phone: '+91 99301 21876',
    address: 'Flat 1104, One BKC, G Block, Bandra Kurla Complex, Mumbai 400051',
    area: 'BKC',
  },
  {
    name: 'Ananya Iyer',
    phone: '+91 98922 45510',
    address: 'Flat 9A, Raheja Atlantis, Worli, Mumbai 400018',
    area: 'Worli',
  },
  {
    name: 'Zoya Khan',
    phone: '+91 98203 88941',
    address: 'Flat 304, Crossroads, Tardeo Road, Mumbai 400034',
    area: 'Tardeo',
  },
  {
    name: 'Dev Sharma',
    phone: '+91 99870 32418',
    address: 'Flat 5C, Lodha Bellissimo, Mahalaxmi, Mumbai 400011',
    area: 'Mahalaxmi',
  },
  {
    name: 'Meera Nair',
    phone: '+91 98207 55162',
    address: 'Flat 12, Narayan Apartments, Ranade Road, Dadar West, Mumbai 400028',
    area: 'Dadar West',
  },
  {
    name: 'Kabir Joshi',
    phone: '+91 90045 78231',
    address: 'Flat 601, Kalpataru Pinnacle, Powai, Mumbai 400076',
    area: 'Powai',
  },
  {
    name: 'Sana Qureshi',
    phone: '+91 98201 43908',
    address: 'House 8, Bohra Compound, Byculla, Mumbai 400027',
    area: 'Byculla',
  },
  {
    name: 'Rohan Patil',
    phone: '+91 98672 19054',
    address: 'Flat 203, Gokuldham, Goregaon East, Mumbai 400063',
    area: 'Goregaon East',
  },
  {
    name: 'Ishita Sen',
    phone: '+91 98308 62147',
    address: 'Flat 701, Kalpataru Avana, Parel, Mumbai 400012',
    area: 'Parel',
  },
  {
    name: 'Aditya Bhatt',
    phone: '+91 93214 50876',
    address: 'Flat 3A, Sun Mill Compound, Lower Parel, Mumbai 400013',
    area: 'Lower Parel',
  },
  {
    name: 'Neha Deshpande',
    phone: '+91 98673 44120',
    address: 'Flat 504, Kanakia Spaces, Andheri East, Mumbai 400069',
    area: 'Andheri East',
  },
  {
    name: 'Imran Sayed',
    phone: '+91 98208 71463',
    address: 'House 21, Colaba Causeway, Colaba, Mumbai 400005',
    area: 'Colaba',
  },
  {
    name: 'Tara Menon',
    phone: '+91 98924 18705',
    address: 'Flat 801, Trade Tower, Juhu Tara Road, Juhu, Mumbai 400049',
    area: 'Juhu',
  },
  {
    name: 'Vihaan Gupta',
    phone: '+91 98202 93641',
    address: 'Flat 6B, Matunga, Mumbai 400019',
    area: 'Matunga East',
  },
  {
    name: 'Diya Chavan',
    phone: '+91 98331 52708',
    address: 'House 9, Waroda Road, Bandra West, Mumbai 400050',
    area: 'Bandra West',
  },
]

export const ridersSeed = [
  { name: 'Suresh Pawar', phone: '+91 98330 14027' },
  { name: 'Imran Qureshi', phone: '+91 98210 77531' },
  { name: 'Ganesh Salvi', phone: '+91 99302 64108' },
  { name: 'Rakesh Yadav', phone: '+91 98678 32514' },
  { name: 'Pravin More', phone: '+91 90044 28716' },
]

export const faviconDish = '/food/11.webp'
