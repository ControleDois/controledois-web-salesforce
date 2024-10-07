import { Component } from '@angular/core';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-helper',
  standalone: true,
  imports: [
    FixedHeaderComponent,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule],
  templateUrl: './helper.component.html',
  styleUrl: './helper.component.scss'
})
export class HelperComponent {
  public fixedHeader: FixedHeader = {
    title: 'Central de ajuda',
    routerBack: '',
    showBackButton: true
  };

  redirectToWhatsApp() {
    const phoneNumber = '556592867495';
    const message = 'Olá, gostaria de mais informações sobre o SalesForce'; // Mensagem predefinida
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  }
}
