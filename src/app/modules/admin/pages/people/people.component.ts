import { Component, importProvidersFrom, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShoppingCart } from '../../../../shared/interfaces/shopping.cart.interface';
import { StorageService } from '../../../../shared/services/storage.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import { NgxMaskPipe } from 'ngx-mask';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { IndexedDbService } from '../../../../shared/services/indexed-db.service';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule,
    NgxMaskPipe,
    FixedHeaderComponent,
  ],
  templateUrl: './people.component.html',
})
export class PeopleComponent implements OnInit {
  public peopleDB: any = [];
  public people: any = [];
  public ShoppingCart: ShoppingCart;

  @Output() public fixedHeader: FixedHeader = {
    title: 'Lista de Clientes',
    routerBack: '../shopping-cart',
    showBackButton: true,
    showSearchButton: true,
    search: new FormControl('')
  };

  constructor(
    private storageService: StorageService,
    private router: Router,
    private indexedDbService: IndexedDbService
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
      switchMap((searchText) => this.indexedDbService.filterPeopleByText(searchText?.toString() || '')) // Realiza a busca
    )
    .subscribe((res: any) => {
      this.people = res; // Atualiza a lista com os resultados filtrados
    });
  }

  load(): void {
    this.indexedDbService.filterPeopleByText(this.fixedHeader.search?.value).then((res) => {
      this.people = res;
    });
  }

  setPeople(people: any): void {
    this.ShoppingCart.people = people;
    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.router.navigate(['/shopping-cart']);
  }
}
