import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../../../shared/services/storage.service';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { Auth } from '../../../../shared/interfaces/auth.interface';
import { NgxMaskPipe } from 'ngx-mask';
import { IndexedDbService } from '../../../../shared/services/indexed-db.service';
import { PeopleService } from '../../../../shared/services/people.service';
import { map } from 'rxjs';
import { LoadingFull } from '../../../../shared/interfaces/loadingFull.interface';
import { LoadingFullComponent } from '../../../../shared/widget/loading-full/loading-full.component';
import { ProductService } from '../../../../shared/services/product.service';
import { SaleService } from '../../../../shared/services/sale.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule,
    FixedHeaderComponent,
    NgxMaskPipe,
    LoadingFullComponent
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent {
  public fixedHeader: FixedHeader = {
    title: 'Meus dados',
    routerBack: '',
    showBackButton: true
  };

  public clientCount: number = 0;
  public productCount: number = 0;
  public salesCount: number = 0;

  public auth: Auth;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  constructor(
    private storageService: StorageService,
    private router: Router,
    private peopleService: PeopleService,
    private productService: ProductService,
    private saleService: SaleService,
    private indexedDbService: IndexedDbService
  ) {
    this.auth = this.storageService.getAuth();
    this.indexedDbService.getCountStore('people').then((count) => {
      this.clientCount = count;
    });
    this.indexedDbService.getCountStore('products').then((count) => {
      this.productCount = count;
    });
    this.indexedDbService.getCountStore('sales').then((count) => {
      this.salesCount = count;
    });
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/auth/slide']);
  }

  updateCache(): void {
    this.updateClient();
  }

  updateClient(): void {
    this.loadingFull.active  = true;
    this.loadingFull.message = 'Buscando clientes...'

    this.indexedDbService.clearData('people');

    //Atualiza dados de clientes
    this.peopleService.index(this.fixedHeader.search?.value ? this.fixedHeader.search?.value : '',
      'name', 'name',  '1',
      '10000', [
        { param: 'roles', value: '{2}' }
      ]).pipe(
        map(res => {
          this.loadingFull.message = 'Inserindo clientes...';
          this.indexedDbService.batchInsert(res.data, 'people', res.data.length).then(() => {
            this.loadingFull.active  = false;
            this.updateProduct();
          });
        })
      ).subscribe();
  }

  updateProduct(): void {
    this.loadingFull.active  = true;
    this.loadingFull.message = 'Buscando produtos...'

    this.indexedDbService.clearData('products');

    //Atualiza dados de produtos
    this.productService.index(this.fixedHeader.search?.value ? this.fixedHeader.search?.value : '',
      'name',
      'name',
      1,
      10000).pipe(
      map(res => {
        this.loadingFull.message = 'Inserindo produtos...';
        this.indexedDbService.batchInsert(res.data, 'products', res.data.length).then(() => {
          this.loadingFull.active  = false;
          this.updateSales();
        });
      })
    ).subscribe();
  }

  updateSales(): void {
    this.loadingFull.active  = true;
    this.loadingFull.message = 'Buscando vendas & orçamentos...'

    this.indexedDbService.clearData('sales');

    this.saleService.index(this.fixedHeader.search?.value ? this.fixedHeader.search?.value : '', null, '', '', '', '', true).pipe(
      map(res => {
        this.loadingFull.message = 'Inserindo vendas & orçamentos...';
        this.indexedDbService.batchInsert(res, 'sales', res.length).then(() => {
          this.loadingFull.active  = false;
        });
      })
    ).subscribe();
  }
}
