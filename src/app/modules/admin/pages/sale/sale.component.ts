import { Component, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, tap, throwError } from 'rxjs';
import { SearchDateMonthComponent } from '../../../../shared/widget/search-date-month/search-date-month.component';
import { MatMenuModule } from '@angular/material/menu';
import { LoadingFull } from '../../../../shared/interfaces/loadingFull.interface';
import { StorageService } from '../../../../shared/services/storage.service';
import { ShoppingCart } from '../../../../shared/interfaces/shopping.cart.interface';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { IndexedDbService } from '../../../../shared/services/indexed-db.service';
import { SaleService } from '../../../../shared/services/sale.service';
import { DialogMessageService } from '../../../../shared/services/dialog-message.service';
import { LoadingFullComponent } from '../../../../shared/widget/loading-full/loading-full.component';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule,
    NgxMaskPipe,
    FixedHeaderComponent,
    SearchDateMonthComponent,
    MatMenuModule,
    NgxSkeletonLoaderModule,
    LoadingFullComponent
  ],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss'
})
export class SaleComponent implements OnInit {

  public sales: any = [];
  public vDateFilter = new Date();

  @Output() public fixedHeader: FixedHeader = {
    title: 'Vendas e Orçamentos',
    routerBack: '../shopping-cart',
    showBackButton: false,
    showSearchButton: true,
    search: new FormControl('')
  };

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public skeletonOn: boolean = false;
  public showDialogSync: boolean = false;
  public saleSelected: any = {};

  constructor(
    private router: Router,
    private indexedDbService: IndexedDbService,
    private storageService: StorageService,
    private saleService: SaleService,
    private dialogMessageService: DialogMessageService
  ) {}

  ngOnInit(): void {
    this.fixedHeader.search?.valueChanges
    .pipe(
      debounceTime(700),
      distinctUntilChanged(),
      filter((value) => {
        const searchText = (value || '').toString(); // Converte o valor para string
        if (searchText === '') {
          this.load(); // Se estiver vazio, carrega todos os registros
        }
        return searchText.trim() !== ''; // Verifica se não está vazio
      }),
      tap(() => (this.skeletonOn = true)), // Ativa o skeleton
      switchMap((searchText) => this.indexedDbService.filterSaleByText(searchText?.toString() || '', this.vDateFilter)) // Realiza a busca
    )
    .subscribe((res: any) => {
      this.sales = res;
      this.skeletonOn = false;
    });

    this.load();
  }

  load(): void {
    this.skeletonOn = true;
    this.indexedDbService.filterSaleByText('', this.vDateFilter).then((res: any) => {
      this.sales = res
        .map((sale: any) => ({
          ...sale,
          date_sale: new Date(sale.date_sale), // Garante que a data é um objeto Date
        }))
        .sort((a: any, b: any) => b.date_sale.getTime() - a.date_sale.getTime());

      this.skeletonOn = false;
    });
  }

  getStatus(status: number): string {
    switch (status) {
      case 0:
        return 'Em orçamento';
      case 1:
        return 'Orçamento aceito';
      case 2:
        return 'Orçamento recusado';
      case 3:
          return 'Venda';
      case 4:
          return 'Venda / Sincronizada'
      default:
        return 'Venda'
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#B98E00';
      case 1:
        return '#4ab858';
      case 2:
        return '#F43E61';
      case 3:
        return '#2687E9';
      case 4:
        return '#17426d';
      default:
        return '#2687E9'
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 0:
        return '#FFF4CE';
      case 1:
        return '#ddf1de';
      case 2:
        return '#FCD9E0';
      case 3:
        return '#DBE6FE';
      case 4:
        return '#d9ecff';
      default:
        return '#DBE6FE'
    }
  }

  editSale(sale: any): void {
    const shoppingCart: ShoppingCart = {
      id: sale.id || '',
      code: sale.code || '',
      people: sale.people || {},
      discount: sale.discount || 0,
      typeDiscount: sale.discount_type || 0,
      products: [],
      observation: sale.note || '',
      status: sale.status || 0,
      date_sale: sale.date_sale || new Date()
    };

    if (sale.products) {
      for (let i = 0; i < sale.products.length; i++) {
        shoppingCart.products.push({
          product_id: sale.products[i].product_id || '',
          description: sale.products[i].description || '',
          amount: sale.products[i].amount || 0,
          cost_value: sale.products[i].cost_value || 0,
          subtotal: sale.products[i].subtotal || 0,
          shop: (sale.products[i]?.product?.shop || sale.products[i]?.shop) || {}
        });
      }
    }

    this.storageService.setList('SalesForce/ShoppingCart', shoppingCart);
    this.router.navigate(['../shopping-cart']);
  }

  syncSale(sale: any): void {
    this.loadingFull.active = true;

    const auth = this.storageService.getAuth();
    const saleSync = {
      id: sale.id,
      peopleId: sale.people.id,
      userId: auth.user.people.id,
      categoryId: auth.company.config.sale_category_default_id,
      bankAccountId: auth.company.config.sale_bank_account_default_id,
      role: 1,
      status: sale.status,
      date_sale: sale.date_sale || new Date(),
      amount: sale.amount,
      discount_type: sale.discount_type,
      discount: sale.discount,
      net_total: sale.net_total,
      products: this.getSaleProducts(sale),
      note: sale.note
    };

    this.saleService
        .save(sale?.id.length !== 36 ? 'new' : sale.id, saleSync)
        .pipe(
          finalize(() => (this.loadingFull.active = false)),
          catchError((error) => {
            this.dialogMessageService.openDialog({
              icon: 'priority_high',
              iconColor: '#ff5959',
              title: 'Erro ao finalizar a venda',
              message: 'Ocorreu um erro ao finalizar a venda, tente novamente mais tarde.',
              message_next: 'Ocorreu um erro ao finalizar a venda, tente novamente mais tarde.',
            });
            return throwError(error);
          }),
          map((res) => {
            //deleto o registro antigo
            this.indexedDbService.deleteData(saleSync.id, 'sales');
            sale.id = res.id;
            sale.code = res.code;
            sale.isOff = false;

            //salvo o novo registro
            this.indexedDbService.addData(sale, 'sales');
            this.loadingFull.active = false;
            this.saleSelected = {};
            this.showDialogSync = false;
          })
        )
        .subscribe();
  }

  getSaleProducts(sale: any): any[] {
    return sale.products.map((product: any) => {
      return {
        product_id: product?.product_id,
        amount: product?.amount,
        cost_value: product?.cost_value,
        subtotal: product?.subtotal
      }
    });
  }

  saleEdit(sale: any): boolean {
    if (sale.isOff) {
      return false
    }else
    if (sale.status === '3' || sale.status === 3) {
      return false
    } else
    if (sale.status === 4 || sale.status === '4') {
      return false
    }else
    if (sale?.id.length !== 36) {
      return false
    }else
    {
      return true
    }
  }
}
