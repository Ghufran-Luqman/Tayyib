import type { Food } from "../foodfit/types";

const OFF_BASE = "https://world.openfoodfacts.org";

interface OFFNutriments {
  "energy-kcal_serving"?: number;
  "energy-kcal_100g"?: number;
  proteins_serving?: number;
  proteins_100g?: number;
  carbohydrates_serving?: number;
  carbohydrates_100g?: number;
  sugars_serving?: number;
  sugars_100g?: number;
  fat_serving?: number;
  fat_100g?: number;
  "saturated-fat_serving"?: number;
  "saturated-fat_100g"?: number;
  fiber_serving?: number;
  fiber_100g?: number;
  sodium_serving?: number;
  sodium_100g?: number;
  salt_serving?: number;
  salt_100g?: number;
}

interface OFFProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OFFNutriments;
  ingredients_text?: string;
  allergens_tags?: string[];
  additives_tags?: string[];
  nutriscore_grade?: string;
  nova_group?: number;
}

function pick(serving?: number, per100?: number): number | undefined {
  if (typeof serving === "number" && !isNaN(serving)) return serving;
  if (typeof per100 === "number" && !isNaN(per100)) return per100;
  return undefined;
}

function cleanTags(tags?: string[]): string[] {
  if (!tags) return [];
  return tags.map((t) => t.replace(/^[a-z]{2}:/, "").replace(/-/g, " "));
}

export function mapOFFToFood(product: OFFProduct, barcode?: string): Food {
  const n = product.nutriments ?? {};
  const sodiumG = pick(n.sodium_serving, n.sodium_100g);
  const sodiumMg = sodiumG !== undefined ? Math.round(sodiumG * 1000) : undefined;

  const hasNutrition =
    n["energy-kcal_serving"] !== undefined ||
    n["energy-kcal_100g"] !== undefined;
  const hasIngredients = Boolean(product.ingredients_text);

  let confidence: "high" | "medium" | "low" = "high";
  if (!hasNutrition || !hasIngredients) confidence = "medium";
  if (!hasNutrition && !hasIngredients) confidence = "low";

  return {
    id: `off-${barcode ?? product.code ?? Math.random().toString(36).slice(2)}`,
    source: "openfoodfacts",
    sourceId: product.code,
    barcode: barcode ?? product.code,
    name: product.product_name?.trim() || "Unnamed product",
    brand: product.brands?.split(",")[0]?.trim(),
    imageUrl: product.image_front_url || product.image_url,
    servingSize: product.serving_size,
    servingGrams: product.serving_quantity,
    nutrition: {
      calories: pick(n["energy-kcal_serving"], n["energy-kcal_100g"]),
      protein: pick(n.proteins_serving, n.proteins_100g),
      carbs: pick(n.carbohydrates_serving, n.carbohydrates_100g),
      sugar: pick(n.sugars_serving, n.sugars_100g),
      fat: pick(n.fat_serving, n.fat_100g),
      saturatedFat: pick(n["saturated-fat_serving"], n["saturated-fat_100g"]),
      fibre: pick(n.fiber_serving, n.fiber_100g),
      sodium: sodiumMg,
      salt: pick(n.salt_serving, n.salt_100g),
    },
    ingredients: product.ingredients_text,
    allergens: cleanTags(product.allergens_tags),
    additives: cleanTags(product.additives_tags),
    nutriscore: ["a", "b", "c", "d", "e"].includes(product.nutriscore_grade ?? "")
      ? (product.nutriscore_grade as Food["nutriscore"])
      : undefined,
    novaGroup: [1, 2, 3, 4].includes(product.nova_group ?? 0)
      ? (product.nova_group as Food["novaGroup"])
      : undefined,
    dataConfidence: confidence,
    createdAt: new Date().toISOString(),
  };
}

export async function getByBarcode(barcode: string): Promise<Food | null> {
  const url = `${OFF_BASE}/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenFoodFacts request failed (${res.status})`);
  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;
  return mapOFFToFood(json.product, barcode);
}

export async function searchProducts(query: string, limit = 20): Promise<Food[]> {
  if (!query.trim()) return [];
  const url = `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(
    query,
  )}&search_simple=1&action=process&json=1&page_size=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenFoodFacts search failed (${res.status})`);
  const json = await res.json();
  const products: OFFProduct[] = json.products ?? [];
  return products
    .filter((p) => p.product_name)
    .map((p) => mapOFFToFood(p, p.code));
}

export const openFoodFactsProvider = {
  id: "openfoodfacts" as const,
  label: "Open Food Facts",
  getByBarcode,
  searchProducts,
};
