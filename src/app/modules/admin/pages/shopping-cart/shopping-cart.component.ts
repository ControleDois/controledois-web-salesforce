import { Component, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { SearchSimpleComponent } from '../../../../shared/widget/search-simple/search-simple.component';
import { FormControl, FormsModule } from '@angular/forms';
import { ShoppingCart } from '../../../../shared/interfaces/shopping.cart.interface';
import { StorageService } from '../../../../shared/services/storage.service';
import { DialogMessageService } from '../../../../shared/services/dialog-message.service';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';
import { NgxMaskPipe } from 'ngx-mask';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { SaleService } from '../../../../shared/services/sale.service';
import { LoadingFull } from '../../../../shared/interfaces/loadingFull.interface';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFullComponent } from '../../../../shared/widget/loading-full/loading-full.component';
import { IndexedDbService } from '../../../../shared/services/indexed-db.service';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    SearchSimpleComponent,
    NgxCurrencyDirective,
    NgxMaskPipe,
    FixedHeaderComponent,
    LoadingFullComponent
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss'
})
export class ShoppingCartComponent {
  public fixedHeader: FixedHeader = {
    title: 'Meu Carrinho',
    routerBack: '',
    showBackButton: false
  };

  public ShoppingCart: ShoppingCart;
  public optionsMaskNormal = { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: false, inputMode: NgxCurrencyInputMode.Natural };
  public optionsMaskPercent = { prefix: '% ', allowNegative: false, inputMode: NgxCurrencyInputMode.Natural };

  @Output() search = new FormControl('');

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public statusList = [
    { name: '⦿ Em orçamento', type: 0 },
    { name: '⦿ Venda', type: 3 },
  ];

  public showDialogSync: boolean = false;
  public productSelected: any = {};

  constructor(
    private storageService: StorageService,
    private dialogMessageService: DialogMessageService,
    private saleService: SaleService,
    private indexedDbService: IndexedDbService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');

    if (this.ShoppingCart === null) {
      this.ShoppingCart = {
        id: '',
        discount: 0,
        typeDiscount: 0,
        products: [],
        observation: '',
        status: 0
      };

      this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    }
  }

  getAmount(product: any) {
    const findProduct = this.ShoppingCart?.products.find(x => x.product_id === product.product_id);

    if (findProduct) {
      return findProduct.amount;
    } else {
      return 0;
    }
  }

  addProduct(product: any) {
    const productCart = this.ShoppingCart?.products.find(x => x.product_id === product.product_id);

    if (productCart) {
      productCart.amount += product?.shop?.minimum_sales_quantity || 1;
      productCart.subtotal = productCart.amount * product.cost_value;
    } else {
      this.ShoppingCart.products.push({
        product_id: product.id,
        description: product.name,
        amount: product?.shop?.minimum_sales_quantity || 1,
        cost_value: product.cost_value,
        subtotal: product.cost_value * (product?.shop?.minimum_sales_quantity || 1),
        shop: product.shop
      });
    }

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  removeProduct(product: any) {
    const productCart = this.ShoppingCart?.products.find(x => x.product_id === product.product_id);

    if (productCart) {
      productCart.amount -= product?.shop?.minimum_sales_quantity || 1;
      productCart.subtotal = productCart.amount * productCart.cost_value || 0;

      if (productCart.amount <= 0) {
        productCart.amount += product?.shop?.minimum_sales_quantity || 1;
        this.productSelected = product;
        this.showDialogSync = true;
      }
    }

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  deleteProduct(): void {
    this.showDialogSync = false;
    this.ShoppingCart.products = this.ShoppingCart.products.filter(x => x.product_id !== this.productSelected.product_id);

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  changeAmount(product: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const amount = Number(inputElement.value);
    const productCart = this.ShoppingCart?.products.find(x => x.product_id === product.product_id);

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
    }

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  getTotal() {
    const totais = this.ShoppingCart.products.reduce((acc, product) => acc + (product.amount * product?.shop?.sale_value), 0);
    return totais;
  }

  getTotalDiscount() {
    if (this.ShoppingCart.typeDiscount === 0) {
      return this.getTotal() - this.ShoppingCart.discount;
    } else {
      return this.getTotalPercentDiscount();
    }
  }

  getTotalPercentDiscount() {
    return this.getTotal() - (this.getTotal() * (this.ShoppingCart.discount / 100));
  }

  setObs(obs: any) {
    this.ShoppingCart.observation = (obs.target as HTMLTextAreaElement).value;

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  removePeople(): void {
    this.ShoppingCart.people = null;
    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  getSaleProducts(): any[] {
    return this.ShoppingCart.products.map(product => {
      return {
        product_id: product.product_id,
        amount: product.amount,
        cost_value: product.cost_value,
        subtotal: product.subtotal,
        shop: product?.shop
      }
    });
  }

  finalizeOrder() {
    //this.loadingFull.active  = true;
    const auth = this.storageService.getAuth();

    const sale = {
      id: this.ShoppingCart?.id || 'new',
      code: this.ShoppingCart?.code || '',
      peopleId: this.ShoppingCart.people.id,
      userId: auth.user.people.id,
      categoryId: auth.company.config.sale_category_default_id,
      bankAccountId: auth.company.config.sale_bank_account_default_id,
      role: 1,
      people: this.ShoppingCart.people,
      status: this.ShoppingCart.status,
      date_sale: this.ShoppingCart.date_sale || (new Date().toISOString()),
      amount: this.getTotal(),
      discount_type: this.ShoppingCart.typeDiscount,
      discount: this.ShoppingCart.discount,
      net_total: this.getTotalDiscount(),
      products: this.getSaleProducts(),
      note: this.ShoppingCart.observation,
      isOff: true
    }

    if (sale.id !== 'new') {
      this.indexedDbService.updateData(sale, 'sales');
    } else {
      sale.id = this.gerateNewId();
      this.indexedDbService.addData(sale, 'sales');
    }

    this.ShoppingCart = {
      discount: 0,
      typeDiscount: 0,
      products: [],
      observation: '',
      status: 0
    };

    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');

    this.router.navigate(['sale-report-view/' + sale.id]);
  }

  saveShoppingCart() {
    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

  gerateNewId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
