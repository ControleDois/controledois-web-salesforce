import { Component, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShoppingCart } from '../../../../shared/interfaces/shopping.cart.interface';
import { PeopleService } from '../../../../shared/services/people.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgxMaskPipe } from 'ngx-mask';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';

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
    private peopleService: PeopleService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.ShoppingCart = this.storageService.getList('SalesForce/ShoppingCart');
  }

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
    this.peopleService.index(this.fixedHeader.search?.value ? this.fixedHeader.search?.value : '',
      'name', 'name',  '1',
      '10', [
        { param: 'roles', value: '{2}' }
      ]).pipe(
        map(res => {
          this.people = res.data;
          //this.tableLength = res.meta.total;
        })
      ).subscribe();
  }

  setPeople(people: any): void {
    this.ShoppingCart.people = people;
    this.storageService.setList('SalesForce/ShoppingCart', this.ShoppingCart);
    this.router.navigate(['/shopping-cart']);
  }
}
