import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../../shared/services/storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(
    private storageService: StorageService,
  ) {}

  getGreeting(): string {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return 'Bom dia';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  }

  getFisrtName(): string {
    const nameOrEmail = this.storageService.getAuth().user.people.name;

    // Verifica se é um e-mail (contém '@')
    if (nameOrEmail.includes('@')) {
      return nameOrEmail.split('@')[0]; // Retorna a parte antes do '@'
    }

    // Caso contrário, retorna o primeiro nome
    return nameOrEmail.split(' ')[0];
  }
}
