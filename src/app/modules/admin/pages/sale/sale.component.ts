import { Component, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { SaleService } from '../../../../shared/services/sale.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, throwError } from 'rxjs';
import { SearchDateMonthComponent } from '../../../../shared/widget/search-date-month/search-date-month.component';
import {MatMenuModule} from '@angular/material/menu';
import { LoadingFull } from '../../../../shared/interfaces/loadingFull.interface';
import { DialogMessageService } from '../../../../shared/services/dialog-message.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { ShoppingCart } from '../../../../shared/interfaces/shopping.cart.interface';

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
    MatMenuModule
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

  constructor(
    private saleService: SaleService,
    private router: Router,
    private datePipe: DatePipe,
    private dialogMessageService: DialogMessageService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.fixedHeader.search?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.load();
        })
      )
      .subscribe();

    this.load();
  }

  load(): void {
    console.log(this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'));
    this.saleService.index(this.fixedHeader.search?.value ? this.fixedHeader.search?.value : '',
      this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'), 'date_sale', 'date_sale',
      '1',
      '10').pipe(
      map(res => {
        this.sales = res.data;
        console.log(this.sales);
      })
    ).subscribe();
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
      default:
        return '#DBE6FE'
    }
  }

  editSale(id: string): void {
    this.saleService
        .show(id)
        .pipe(
          finalize(() => (this.loadingFull.active = false)),
          catchError((error) => {
            this.dialogMessageService.openDialog({
              icon: 'priority_high',
              iconColor: '#ff5959',
              title: 'Pedido não encontrado',
              message: 'O pedido não foi encontrado, por favor, tente novamente.',
              message_next: 'O pedido pode ter sido excluído ou não existe mais.',
            });
            this.router.navigate(['../sale']);
            return throwError(error);
          }),
          map((res) => {
            const shoppingCart: ShoppingCart = {
              id: res.id || '',
              people: res.people || {},
              discount: res.discount || 0,
              typeDiscount: res.discount_type || 0,
              products: [],
              observation: res.note || '',
              status: res.status || 0,
              date_sale: res.date_sale || new Date()
            };

            if (res.products) {
              for (let i = 0; i < res.products.length; i++) {
                shoppingCart.products.push({
                  product_id: res.products[i].product_id || '',
                  description: res.products[i].description || '',
                  amount: res.products[i].amount || 0,
                  cost_value: res.products[i].cost_value || 0,
                  subtotal: res.products[i].subtotal || 0,
                  shop: res.products[i].product.shop || {}
                });
              }
            }

            this.storageService.setList('SalesForce/ShoppingCart', shoppingCart);
            this.router.navigate(['../shopping-cart']);
          })
        )
        .subscribe();
  }
}
