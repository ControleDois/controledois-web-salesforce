import { ProductShop } from "./product.shop.interface";

export interface SaleProduct {
  product_id: string;
  description: string;
  amount: number;
  cost_value: number;
  subtotal: number;
  shop: ProductShop
}
