import { Component, OnInit } from '@angular/core';
import { SaleService } from '../../../../../shared/services/sale.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoadingFull } from '../../../../../shared/interfaces/loadingFull.interface';
import { catchError, finalize, map, throwError } from 'rxjs';
import { DialogMessageService } from '../../../../../shared/services/dialog-message.service';
import { Auth } from '../../../../../shared/interfaces/auth.interface';
import { StorageService } from '../../../../../shared/services/storage.service';
import { NgxMaskPipe } from 'ngx-mask';
import { NgxCurrencyDirective } from 'ngx-currency';
import { LoadingFullComponent } from '../../../../../shared/widget/loading-full/loading-full.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-sale-report-view',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule,
    NgxMaskPipe,
    NgxCurrencyDirective,
    LoadingFullComponent
  ],
  templateUrl: './sale-report-view.component.html',
  styleUrl: './sale-report-view.component.scss'
})
export class SaleReportViewComponent implements OnInit {
  public sale: any;
  public saleId: string;
  public auth: Auth;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  constructor(
    private saleService: SaleService,
    private activatedRoute: ActivatedRoute,
    private dialogMessageService: DialogMessageService,
    private router: Router,
    private storageService: StorageService
  ) {
    this.saleId = this.activatedRoute.snapshot.params['id'];
    this.auth = this.storageService.getAuth();
    this.load();
   }

  ngOnInit(): void {
    //this.load();
  }

  load() {
    this.saleService
        .show(this.saleId)
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
            this.sale = res;
          })
        )
        .subscribe();
  }

  getDateNow(): string {
    var data = new Date();
    var dia = String(data.getDate()).padStart(2, '0')
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var ano = data.getFullYear();

    return dia + '/' + mes + '/' + ano;
  }

  close(): void {
    this.router.navigate(['../sale']);
  }

  async downloadPDF() {
    this.loadingFull.active = true;
    this.loadingFull.message = 'Aguarde, gerando PDF...';

    let DATA: any = document.getElementById('order-report');

    // Configurações do PDF
    const pdfOptions = {
      margin: 0,
      filename: this.sale.people.name+'.pdf',
      image: { type: 'jpeg', quality: 1 }, // Alterado para JPEG
      html2canvas: {
        scale: 2,
        scrollX: 0,
        scrollY: 0
       }, // Aumentando a escala
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    await html2pdf()
      .set(pdfOptions)
      .from(DATA)
      .save();

    this.loadingFull.active = false;
  }
}
