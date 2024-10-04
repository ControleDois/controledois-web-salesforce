import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importando CommonModule
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SkeletonLoaderComponent } from '../../../../shared/widget/skeleton-loader/skeleton-loader.component';
import { Chart, CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip } from 'chart.js';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, SkeletonLoaderComponent],  // Adicionando CommonModule aos imports
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @ViewChild("meuCanvas", { static: true }) elemento: ElementRef | any;

  public cashFlow: Array<any> = [];
  public isLoading = true;  // Flag de carregamentos

  constructor(private dashboardService: DashboardService) {
    Chart.register(CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip);
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.dashboardService.cashFlow().pipe(
      map(res => {
        this.cashFlow = res;
        this.showCharts();
        this.isLoading = false;  // Desativa o skeleton após o carregamento
      })
    ).subscribe();
  }

  showCharts() {
    new Chart(this.elemento.nativeElement, {
      type: 'bar',
      data: {
        labels: this.cashFlow.map(vBill => vBill.Day),
        datasets: [
          {
            label: 'Pagamentos',
            data: this.cashFlow.map(vBill => vBill.bill_payment * -1),
            borderColor: '#F43E61',
            backgroundColor: '#fb859c',
            borderWidth: 2,
            borderRadius: 2,
            borderSkipped: false,
          },
          {
            label: 'Recebimentos',
            data: this.cashFlow.map(vBill => vBill.bill_recebiment),
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
            display: true,
          },
          title: {
            display: true,
            text: 'Fluxo Orçamento e Vendas Últimos 5 meses'
          }
        },
      },
    });
  }
}
