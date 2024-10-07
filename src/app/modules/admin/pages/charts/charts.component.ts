import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip, PolarAreaController, RadialLinearScale, ArcElement} from 'chart.js'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    FixedHeaderComponent,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss'
})
export class ChartsComponent implements OnInit {
  @ViewChild("meuCanvas", { static: true }) elemento: ElementRef | any;

  public fixedHeader: FixedHeader = {
    title: 'Gráficos',
    showBackButton: false,
    showSearchButton: false,
  };

  constructor() {
    Chart.register(
      CategoryScale,
      BarController,
      PolarAreaController,
      BarElement,
      PointElement,
      LinearScale,
      Title,
      Legend,
      Tooltip,
      RadialLinearScale,
      ArcElement
    );
  }

  ngOnInit() {
    this.showCharts();
  }

  showCharts() {
    new Chart(this.elemento.nativeElement, {
      type: 'polarArea',
      data: {
        labels: ['01/01', '02/01', '03/01', '04/01', '05/01', '06/01', '07/01'],
        datasets: [
          {
            label: 'Pagamentos',
            data: [100, 200, 300, 400, 500, 600, 700],
            borderColor: '#F43E61',
            backgroundColor: '#fb859c',
            borderWidth: 2,
            borderRadius: 2,
          },
          {
            label: 'Recebimentos',
            data: [200, 300, 400, 500, 600, 700, 800],
            borderColor: '#4AB858',
            backgroundColor: '#97fda4',
            borderWidth: 2,
            borderRadius: 2,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Fluxo de Caixa Diário'
          }
        },
      },
    });
  }
}
