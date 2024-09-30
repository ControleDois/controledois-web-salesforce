import { SaleProduct } from "./sale.product.interface";

export interface ShoppingCart {
  discount: number;
  typeDiscount: number;
  products: SaleProduct[];
  observation: string;
  people?: any;
}
