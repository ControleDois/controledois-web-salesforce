import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { Chart, CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip} from 'chart.js'
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { map } from 'rxjs';
import { NgxCurrencyDirective } from 'ngx-currency';
import { NgxMaskPipe } from 'ngx-mask';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterModule,
    NgxCurrencyDirective,
    NgxMaskPipe,
    CommonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild("meuCanvas", { static: true }) elemento: ElementRef | any;

  public appSalesFlow: any;
  public appSalesCount: any;

  constructor(
    private dashboardService: DashboardService
  ) {
    Chart.register(CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip);
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.dashboardService.appSalesCount().pipe(
      map(res => {
        this.appSalesCount = res;
      })
    ).subscribe();

    this.dashboardService.appSalesFlow().pipe(
      map(res => {
        this.appSalesFlow = res;
        this.showCharts();
      })
    ).subscribe();
  }

  getMesEAno(): string {
    const dataAtual = new Date();

    // Array com os nomes dos meses
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const mes = meses[dataAtual.getMonth()];
    const ano = dataAtual.getFullYear();

    return `${mes} de ${ano}`;
  }


  showCharts() {
    new Chart(this.elemento.nativeElement, {
      type: 'bar',
      data: {
        labels: this.appSalesFlow?.months.slice().reverse().map((item: any) => item),
        datasets: [
          {
            label: 'Vendas',
            data: this.appSalesFlow?.data.slice().reverse().map((item: any) => {
              return [item.sale_value, item.sale_count];
            }),
            borderColor: '#4AB858',
            backgroundColor: '#97fda4',
            borderWidth: 2,
            borderRadius: 2,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          title: {
            display: true,
            text: 'Fluxo de Vendas Últimos 5 meses'
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number);
              }
            }
          }
        }
      },
    });
  }
}
