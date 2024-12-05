import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { interval, map } from 'rxjs';
import { LoadingFull } from '../../../../shared/interfaces/loadingFull.interface';
import { LoadingFullComponent } from '../../../../shared/widget/loading-full/loading-full.component';
import { ProductService } from '../../../../shared/services/product.service';
import { SaleService } from '../../../../shared/services/sale.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
  styleUrl: './my-profile.component.scss',
  animations: [
    trigger('numberAnimation', [
      transition(':increment', [
        style({ transform: 'scale(1)', opacity: 0.5 }),
        animate('300ms ease-out', style({ transform: 'scale(1.2)', opacity: 1 })),
        animate('200ms ease-in', style({ transform: 'scale(1)' })),
      ]),
      transition(':decrement', [
        style({ transform: 'scale(1)', opacity: 0.5 }),
        animate('300ms ease-out', style({ transform: 'scale(0.8)', opacity: 1 })),
        animate('200ms ease-in', style({ transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class MyProfileComponent implements OnInit {
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
  }

  ngOnInit(): void {
    this.updateCash();

    interval(10000)
      .subscribe(() => {
        this.updateCash();
      });
  }

  updateCash(): void {
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
    this.indexedDbService.clearData('people');
    this.indexedDbService.clearData('products');
    this.indexedDbService.clearData('sales');
    this.router.navigate(['/auth/slide']);
  }

  getFisrtName(): string {
    const nameOrEmail = this.storageService.getAuth().user.people.name;

    // Verifica se é um e-mail (contém '@')
    if (nameOrEmail.includes('@')) {
      return nameOrEmail.split('@')[0]; // Retorna a parte antes do '@'
    }

    // Caso contrário, retorna o primeiro nome
    return nameOrEmail.split(' ')[0] + ' ' + nameOrEmail.split(' ')[1];
  }
}
