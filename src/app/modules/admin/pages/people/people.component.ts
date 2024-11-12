import { Component, importProvidersFrom, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShoppingCart } from '../../../../shared/interfaces/shopping.cart.interface';
import { StorageService } from '../../../../shared/services/storage.service';
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, from, map, of, switchMap, tap } from 'rxjs';
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
  styleUrl: './people.component.scss'
})
export class PeopleComponent implements OnInit {
  public peopleDB: any = [];
  public people: any = [];
  public ShoppingCart: ShoppingCart;
  public skeletonOn: boolean = false;

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
        const searchText = (value || '').toString();
        return searchText.trim() !== ''; // Verifica se não está vazio
      }),
      tap(() => this.skeletonOn = true), // Ativa o skeleton
      switchMap((searchText) =>
        from(this.indexedDbService.filterPeopleByText(searchText?.toString() || '')).pipe(
          catchError((error) => {
            console.error(error); // Loga qualquer erro
            return of([]); // Retorna uma lista vazia em caso de erro
          }),
          finalize(() => this.skeletonOn = false) // Desativa o skeleton quando a operação termina
        )
      )
    )
    .subscribe((res: any) => {
      this.people = res;
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
