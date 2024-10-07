import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(
    private router: Router,
  ) {}

  activeFooterRouter(): boolean {
    switch (this.router.url) {
      case '/dashboard': return true;
      case '/sale': return true;
      case '/shopping-cart': return true;
      case '/charts': return true;
      case '/reports': return true;
      default: return false;
    }
  }
}
