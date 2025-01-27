import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { ChildrenOutletContexts } from '@angular/router';
import { slideInAnimationAdmin } from './admin.animations';
import { IndexedDbService } from '../../shared/services/indexed-db.service';
import { PeopleService } from '../../shared/services/people.service';
import { catchError, filter, finalize, interval, map, switchMap, throwError } from 'rxjs';
import { InternetService } from '../../shared/services/internet.service';
import { ProductService } from '../../shared/services/product.service';
import { SaleService } from '../../shared/services/sale.service';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FooterComponent, RouterModule],
  animations: [
    slideInAnimationAdmin
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private currentPagePeople = 1;
  private currentPageProduct = 1;
  private currentPageSale = 1;
  private pageSize = 100;
  private hasMorePagesPeople = true;
  private hasMorePagesProduct = true;
  private hasMorePagesSale = true;

  constructor(
    private contexts: ChildrenOutletContexts,
    private indexedDbService: IndexedDbService,
    private peopleService: PeopleService,
    private productService: ProductService,
    private saleService: SaleService,
    private internetService: InternetService,
    private storageService: StorageService
  ) {}

  getRouteAnimationData() {
    const route = this.contexts.getContext('primary')?.route;
    return route?.snapshot?.data?.['animate'];
  }

  ngOnInit(): void {
    this.currentPagePeople = this.storageService.getList('currentPagePeople') || 1;
    this.currentPageProduct = this.storageService.getList('currentPageProduct') || 1;
    this.currentPageSale = this.storageService.getList('currentPageSale') || 1;

    // Verifica se a tabela está vazia ao carregar a página
    this.indexedDbService.getAllData('people').then((data: any[]) => {
      if (!data || data.length === 0) {
        // Se estiver vazia, realiza a busca inicial
        this.updateClient();
      }
    });

    //Atualiza vendas
    // interval(30000)
    //   .pipe(
    //     switchMap(() => this.internetService.hasGoodConnection()),
    //     filter((isGoodConnection) => isGoodConnection)
    //   )
    //   .subscribe(() => this.syncSalesOff());

    //Atualiza dados
    interval(10000)
      .pipe(
        switchMap(() => this.internetService.hasGoodConnection()),
        filter((isGoodConnection) => isGoodConnection)
      )
      .subscribe(() => this.updateClient());
  }

  syncSalesOff(): void {
    const auth = this.storageService.getAuth();

    this.indexedDbService.getAllData('sales').then((res: any) => {
      const salesToSync = res.filter((sale: any) => sale.isOff === true);

      salesToSync.forEach((sale: any) => {
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
            finalize(() => ( console.log('Venda sincronizada.'))),
            catchError((error) => {
              return throwError(error);
            }),
            map((res) => {
              // Deleta o registro antigo
              this.indexedDbService.deleteData(saleSync.id, 'sales');
              sale.id = res.id;
              sale.code = res.code;
              sale.isOff = false;

              // Salva o novo registro
              this.indexedDbService.addData(sale, 'sales');
            })
          )
          .subscribe();
      });
    })
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

  updateClient(): void {
    if (!this.hasMorePagesPeople) {
      // Reinicia a busca desde o início se não houver mais páginas
      this.currentPagePeople = 1;
      this.storageService.setList('currentPagePeople', this.currentPagePeople);
      this.hasMorePagesPeople = true;
    }

    this.peopleService.index(
      '',
      'name',
      'name',
      String(this.currentPagePeople),
      String(this.pageSize),
      [{ param: 'roles', value: '{2}' }]
    ).subscribe(res => {
      if (res.data.length === 0) {
        // Se a API retornar 0 registros, considera que chegou ao fim
        this.hasMorePagesPeople = false;
        return;
      }

      // Atualiza os dados no IndexedDB
      this.indexedDbService.getAllData('people').then((existingData: any[]) => {
        const existingIds = new Set(existingData.map((person: any) => person.id));

        const newData = res.data.filter((person: any) => !existingIds.has(person.id));
        const updatedData = newData.map((person: any) => {
          const existingPerson = existingData.find((p: any) => p.id === person.id);
          return existingPerson ? { ...existingPerson, ...person } : person;
        });

        // //Verifica os clientes que não foram atualizados e deleta
        // existingData.forEach((person: any) => {
        //   if (!updatedData.find((p: any) => p.id === person.id)) {
        //     this.indexedDbService.deleteData(person.id, 'people');
        //   }
        // });

        this.indexedDbService.batchInsert(updatedData, 'people', updatedData.length);
      });

      // Avança para a próxima página
      this.currentPagePeople++;

      // Salva a página atual
      this.storageService.setList('currentPagePeople', this.currentPagePeople);

      // Busca produtos
      this.updateProduct();
    });
  }

  updateProduct(): void {
    if (!this.hasMorePagesProduct) {
      // Reinicia a busca desde o início se não houver mais páginas
      this.currentPageProduct = 1;
      this.storageService.setList('currentPageProduct', this.currentPageProduct);
      this.hasMorePagesProduct = true;
    }

    this.productService.index(
      '',
      'name',
      'name',
      this.currentPageProduct,
      this.pageSize,
    ).subscribe(res => {
      if (res.data.length === 0) {
        // Se a API retornar 0 registros, considera que chegou ao fim
        this.hasMorePagesProduct = false;
        return;
      }

      // Atualiza os dados no IndexedDB
      this.indexedDbService.getAllData('products').then((existingData: any[]) => {
        const existingIds = new Set(existingData.map((product: any) => product.id));

        const newData = res.data.filter((product: any) => !existingIds.has(product.id));
        const updatedData = newData.map((product: any) => {
          const existingProduct = existingData.find((p: any) => p.id === product.id);
          return existingProduct ? { ...existingProduct, ...product } : product;
        });

        //Verifica os produtos que não foram atualizados e deleta
        // existingData.forEach((product: any) => {
        //   if (!updatedData.find((p: any) => p.id === product.id)) {
        //     this.indexedDbService.deleteData(product.id, 'products');
        //   }
        // });

        this.indexedDbService.batchInsert(updatedData, 'products', updatedData.length);
      });

      // Avança para a próxima página
      this.currentPageProduct++;

      // Salva a página atual
      this.storageService.setList('currentPageProduct', this.currentPageProduct);

      //Busca vendas
      this.updateSales();
    });
  }

  updateSales(): void {
    if (!this.hasMorePagesSale) {
      // Reinicia a busca desde o início se não houver mais páginas
      this.currentPageSale = 1;
      this.storageService.setList('currentPageSale', this.currentPageSale);
      this.hasMorePagesSale = true;
    }

    this.saleService.index(
      '', null, '', '',
      String(this.currentPageSale),
      String(this.pageSize), true
    ).subscribe(res => {
      if (res.data.length === 0) {
        // Se a API retornar 0 registros, considera que chegou ao fim
        this.hasMorePagesSale = false;
        return;
      }

      // Atualiza os dados no IndexedDB
      this.indexedDbService.getAllData('sales').then((existingData: any[]) => {
        const existingIds = new Set(existingData.map((sale: any) => sale.id));

        const newData = res.data.filter((sale: any) => !existingIds.has(sale.id));
        const updatedData = newData.map((sale: any) => {
          const existingSale = existingData.find((p: any) => p.id === sale.id);

          if (existingSale?.isOff) {
            return existingSale;
          } else {
            return existingSale ? { ...existingSale, ...sale } : sale;
          }
        });

        this.indexedDbService.batchInsert(updatedData, 'sales', updatedData.length);
      });

      // Avança para a próxima página
      this.currentPageSale++;

      // Salva a página atual
      this.storageService.setList('currentPageSale', this.currentPageSale);
    });
  }
}
