import { qaPairs, type QaPair } from "@/lib/book-data";

export type { QaPair };

export function getAllQaPairs(): QaPair[] {
  return qaPairs;
}
