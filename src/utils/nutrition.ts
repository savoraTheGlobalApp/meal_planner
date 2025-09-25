export type Nutrition = {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
};

// Approximate nutrition values PER 100g (cooked where applicable)
const FOOD_NUTRITION: Record<string, Nutrition> = {
  // Breakfast - Complete set
  'Aloo Paratha': { calories: 300, protein: 7, carbs: 45, fat: 10 },
  'Paneer Paratha': { calories: 320, protein: 12, carbs: 40, fat: 12 },
  'Gobhi Paratha': { calories: 280, protein: 6, carbs: 42, fat: 8 },
  Poha: { calories: 130, protein: 2.6, carbs: 24, fat: 2.2 },
  Daliya: { calories: 83, protein: 3.5, carbs: 18, fat: 0.2 },
  Upma: { calories: 130, protein: 3, carbs: 20, fat: 4 },
  'Masala Dosa': { calories: 180, protein: 4, carbs: 30, fat: 5 },
  'Idli Sambhar': { calories: 180, protein: 6, carbs: 32, fat: 2 },
  Idli: { calories: 146, protein: 5, carbs: 29, fat: 0.8 },
  'Veg Sandwich': { calories: 250, protein: 8, carbs: 30, fat: 9 },
  Cornflakes: { calories: 357, protein: 7.5, carbs: 84, fat: 0.4 },
  Vermicelli: { calories: 130, protein: 3, carbs: 25, fat: 1 },
  'Chilla/Cheela': { calories: 120, protein: 4, carbs: 18, fat: 2 },
  Chana: { calories: 129, protein: 8.9, carbs: 22.5, fat: 2.6 },
  Maggi: { calories: 380, protein: 8, carbs: 70, fat: 8 },
  Pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  Macroni: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  'Bread Omlette': { calories: 280, protein: 12, carbs: 25, fat: 12 },
  'Bread Pakoda': { calories: 320, protein: 8, carbs: 35, fat: 15 },
  Uttapam: { calories: 150, protein: 4, carbs: 28, fat: 2 },
  Oats: { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },

  // Dal - Complete set
  'Moong Dal': { calories: 105, protein: 7, carbs: 19, fat: 0.8 },
  'Masoor Dal': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  'Chana Dal': { calories: 129, protein: 8.9, carbs: 22.5, fat: 2.6 },
  'Toor (Arhar) Dal': { calories: 121, protein: 7.2, carbs: 20.6, fat: 1.7 },
  'Urad Dal': { calories: 116, protein: 8.3, carbs: 20, fat: 0.6 },
  Rajma: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5 },
  Chhole: { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  Lobia: { calories: 116, protein: 8.3, carbs: 20, fat: 0.6 },
  'Malka Masoor': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },

  // Vegetables - Complete set
  Potato: { calories: 87, protein: 2, carbs: 20, fat: 0.1 },
  Paneer: { calories: 265, protein: 18, carbs: 8, fat: 20 },
  Mushroom: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  Spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  Cauliflower: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  Broccoli: { calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  Cabbage: { calories: 25, protein: 1.3, carbs: 6, fat: 0.1 },
  Beans: { calories: 35, protein: 2, carbs: 7, fat: 0.2 },
  Peas: { calories: 81, protein: 5.4, carbs: 14, fat: 0.4 },
  Brinjal: { calories: 25, protein: 1, carbs: 6, fat: 0.3 },
  'Okra (Bhindi)': { calories: 33, protein: 1.9, carbs: 7, fat: 0.2 },
  Capsicum: { calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  'Bottle Gourd (Lauki)': { calories: 14, protein: 0.6, carbs: 3.4, fat: 0.1 },

  // Staple sides
  'Roti/Rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
};

export function lookupNutrition(item: string): Nutrition | null {
  // Try exact match first
  if (FOOD_NUTRITION[item]) return FOOD_NUTRITION[item];
  
  // Fallbacks by keywords for common variations
  const lowered = item.toLowerCase();
  
  // Dal variations
  if (lowered.includes('dal') || lowered.includes('rajma') || lowered.includes('chhole')) return FOOD_NUTRITION['Chana Dal'];
  if (lowered.includes('lobia')) return FOOD_NUTRITION['Lobia'];
  if (lowered.includes('malka')) return FOOD_NUTRITION['Malka Masoor'];
  
  // Paratha variations
  if (lowered.includes('paratha')) return FOOD_NUTRITION['Aloo Paratha'];
  
  // Staple sides
  if (lowered.includes('roti') || lowered.includes('rice')) return FOOD_NUTRITION['Roti/Rice'];
  
  // Vegetable variations
  if (lowered.includes('peas')) return FOOD_NUTRITION['Peas'];
  if (lowered.includes('broccoli')) return FOOD_NUTRITION['Broccoli'];
  if (lowered.includes('beans')) return FOOD_NUTRITION['Beans'];
  if (lowered.includes('capsicum')) return FOOD_NUTRITION['Capsicum'];
  if (lowered.includes('mushroom')) return FOOD_NUTRITION['Mushroom'];
  if (lowered.includes('lauki') || lowered.includes('bottle gourd')) return FOOD_NUTRITION['Bottle Gourd (Lauki)'];
  if (lowered.includes('spinach')) return FOOD_NUTRITION['Spinach'];
  if (lowered.includes('cauliflower') || lowered.includes('gobhi')) return FOOD_NUTRITION['Cauliflower'];
  if (lowered.includes('cabbage')) return FOOD_NUTRITION['Cabbage'];
  if (lowered.includes('brinjal') || lowered.includes('baingan')) return FOOD_NUTRITION['Brinjal'];
  if (lowered.includes('okra') || lowered.includes('bhindi')) return FOOD_NUTRITION['Okra (Bhindi)'];
  if (lowered.includes('potato') || lowered.includes('aloo')) return FOOD_NUTRITION['Potato'];
  if (lowered.includes('paneer')) return FOOD_NUTRITION['Paneer'];
  
  // Breakfast variations
  if (lowered.includes('cornflake')) return FOOD_NUTRITION['Cornflakes'];
  if (lowered.includes('vermicelli')) return FOOD_NUTRITION['Vermicelli'];
  if (lowered.includes('chilla') || lowered.includes('cheela')) return FOOD_NUTRITION['Chilla/Cheela'];
  if (lowered.includes('chana') && !lowered.includes('dal')) return FOOD_NUTRITION['Chana'];
  if (lowered.includes('maggi')) return FOOD_NUTRITION['Maggi'];
  if (lowered.includes('pasta')) return FOOD_NUTRITION['Pasta'];
  if (lowered.includes('macroni') || lowered.includes('macaroni')) return FOOD_NUTRITION['Macroni'];
  if (lowered.includes('bread') && lowered.includes('omlette')) return FOOD_NUTRITION['Bread Omlette'];
  if (lowered.includes('bread') && lowered.includes('pakoda')) return FOOD_NUTRITION['Bread Pakoda'];
  if (lowered.includes('uttapam')) return FOOD_NUTRITION['Uttapam'];
  if (lowered.includes('oats')) return FOOD_NUTRITION['Oats'];
  
  return null;
}

export function sumNutrition(items: string[]): Nutrition {
  return items.reduce<Nutrition>((acc, item) => {
    const n = lookupNutrition(item);
    if (!n) return acc;
    return {
      calories: acc.calories + n.calories,
      protein: acc.protein + n.protein,
      carbs: acc.carbs + n.carbs,
      fat: acc.fat + n.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

export function formatNutrition(n: Nutrition): string {
  return `${Math.round(n.calories)} kcal • Protein ${Math.round(n.protein)}g • Carbs ${Math.round(n.carbs)}g • Fat ${Math.round(n.fat)}g per 100g`;
}

// New helpers to surface unknown items without showing misleading zeros
export function sumNutritionWithUnknown(items: string[]): { total: Nutrition; unknown: string[] } {
  return items.reduce<{ total: Nutrition; unknown: string[] }>((acc, item) => {
    const n = lookupNutrition(item);
    if (!n) {
      acc.unknown.push(item);
      return acc;
    }
    acc.total = {
      calories: acc.total.calories + n.calories,
      protein: acc.total.protein + n.protein,
      carbs: acc.total.carbs + n.carbs,
      fat: acc.total.fat + n.fat,
    };
    return acc;
  }, { total: { calories: 0, protein: 0, carbs: 0, fat: 0 }, unknown: [] });
}

export function formatNutritionSummary(total: Nutrition, unknown: string[]): string {
  const base = formatNutrition(total);
  if (!unknown.length) return base;
  return base; // Return only the base nutrition info, we'll handle unknown items separately
}

export function hasUnknownItems(unknown: string[]): boolean {
  return unknown.length > 0;
}

export function getUnknownItemsText(unknown: string[]): string {
  if (!unknown.length) return '';
  return `Nutrition data not available for: ${unknown.join(', ')}`;
}


