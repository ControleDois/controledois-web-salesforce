import { Component, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { SaleService } from '../../../../shared/services/sale.service';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss'
})
export class SaleComponent {

  constructor(
    private saleService: SaleService,
  ) {}


}
