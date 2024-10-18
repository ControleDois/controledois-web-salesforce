import { SaleProduct } from "./sale.product.interface";

export interface ShoppingCart {
  id?: string;
  code?: string;
  discount: number;
  typeDiscount: number;
  products: SaleProduct[];
  observation: string;
  people?: any;
  status?: number;
  date_sale?: Date;
}
