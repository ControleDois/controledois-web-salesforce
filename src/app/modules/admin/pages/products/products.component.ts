import { Component, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../../shared/services/product.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchSimpleComponent } from '../../../../shared/widget/search-simple/search-simple.component';
import { StorageService } from '../../../../shared/services/storage.service';
import { ShoppingCart } from '../../../../shared/interfaces/shopping.cart.interface';
import { DialogMessageService } from '../../../../shared/services/dialog-message.service';
import { NgxCurrencyDirective } from 'ngx-currency';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { IndexedDbService } from '../../../../shared/services/indexed-db.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule,
    SearchSimpleComponent,
    NgxCurrencyDirective,
    FixedHeaderComponent
  ],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  public products: any = [];
  public ShoppingCart: ShoppingCart;

  @Output() public fixedHeader: FixedHeader = {
    title: 'Lista de Produtos',
    routerBack: '../shopping-cart',
    showBackButton: true,
    showSearchButton: true,
    search: new FormControl('')
  };

  constructor(
    private indexedDbService: IndexedDbService,
    private storageService: StorageService,
    private dialogMessageService: DialogMessageService
  ) {
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  ngOnInit(): void {
    this.fixedHeader.search?.valueChanges
    .pipe(
      debounceTime(700),
      distinctUntilChanged(),
      filter((value) => {
        const searchText = (value || '').toString(); // Converte o valor para string
        return searchText.trim() !== ''; // Verifica se não está vazio
      }),
      switchMap((searchText) => this.indexedDbService.filterProductByText(searchText?.toString() || '')) // Realiza a busca
    )
    .subscribe((res: any) => {
      this.products = res;
    });
  }

  getAmount(product: any) {
    const findProduct = this.ShoppingCart?.products.find(x => x.product_id === product.id);

    if (findProduct) {
      return findProduct.amount;
    } else {
      return 0;
    }
  }

  addProduct(product: any) {
    const productCart = this.ShoppingCart?.products.find(x => x.product_id === product.id);

    if (productCart) {
      productCart.amount += product?.shop?.minimum_sales_quantity || 1;
      productCart.subtotal = productCart.amount * product?.shop?.sale_value || 0;
    } else {
      this.ShoppingCart.products.push({
        product_id: product.id,
        description: product.name,
        amount: product?.shop?.minimum_sales_quantity || 1,
        cost_value: product?.shop?.sale_value || 0,
        subtotal: product?.shop?.minimum_sales_quantity * product?.shop?.sale_value || 0,
        shop: product.shop
      });
    }

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  removeProduct(product: any) {
    const productCart = this.ShoppingCart?.products.find(x => x.product_id === product.id);

    if (productCart) {
      productCart.amount -= product?.shop?.minimum_sales_quantity || 1;
      productCart.subtotal = productCart.amount * product?.shop?.sale_value || 0;

      if (productCart.amount <= 0) {
        this.ShoppingCart.products = this.ShoppingCart.products.filter(x => x.product_id !== product.id);
      }
    }

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  changeAmount(product: any, event: Event) {
    console.log('changeAmount', product, event);
    const inputElement = event.target as HTMLInputElement;
    const amount = Number(inputElement.value);
    const productCart = this.ShoppingCart?.products.find(x => x.product_id === product.id);

    if (productCart) {
      if (amount % (product?.shop?.minimum_sales_quantity || 1) === 0) {
        productCart.amount = amount;
        productCart.subtotal = productCart.amount * product?.shop?.sale_value || 0;

        if (productCart.amount <= 0) {
          this.ShoppingCart.products = this.ShoppingCart.products.filter(x => x.product_id !== product.id);
        }
      } else {
        inputElement.value = productCart.amount.toString();
        this.dialogMessageService.openDialog({
          icon: 'priority_high',
          iconColor: '#ff5959',
          title: 'Quantidade Inválida',
          message: 'O Produto ' + product.name + ' não pode ser vendido em quantidades fracionadas.',
          message_next: 'A quantidade informada não é válida para este produto, a quantidade mínima de compra é de ' + (product?.shop?.minimum_sales_quantity || 1),
        });
      }
    } else {
      if (amount % (product?.shop?.minimum_sales_quantity || 1) === 0) {
        if (amount <= 0) {
          this.ShoppingCart.products = this.ShoppingCart.products.filter(x => x.product_id !== product.id);
        } else {
          this.ShoppingCart.products.push({
            product_id: product.id,
            description: product.name,
            amount: amount,
            cost_value: product?.shop?.sale_value || 0,
            subtotal: amount * product?.shop?.sale_value || 0,
            shop: product.shop
          });
        }
      } else {
        inputElement.value = '';
        this.dialogMessageService.openDialog({
          icon: 'priority_high',
          iconColor: '#ff5959',
          title: 'Quantidade Inválida',
          message: 'O Produto ' + product.name + ' não pode ser vendido em quantidades fracionadas.',
          message_next: 'A quantidade informada não é válida para este produto, a quantidade mínima de compra é de ' + (product?.shop?.minimum_sales_quantity || 1),
        });
      }
    }

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }
}
