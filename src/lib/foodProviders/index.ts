import type { Food } from "../foodfit/types";
import { openFoodFactsProvider } from "./openFoodFacts";

export interface FoodProvider {
  id: string;
  label: string;
  getByBarcode?: (barcode: string) => Promise<Food | null>;
  searchProducts?: (q: string, limit?: number) => Promise<Food[]>;
}

export const providers: FoodProvider[] = [openFoodFactsProvider];

export { openFoodFactsProvider };
