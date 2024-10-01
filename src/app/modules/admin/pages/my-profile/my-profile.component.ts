import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../../../shared/services/storage.service';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { Auth } from '../../../../shared/interfaces/auth.interface';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule,
    FixedHeaderComponent,
    NgxMaskPipe
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent {
  public fixedHeader: FixedHeader = {
    title: 'Meus dados',
    routerBack: '',
    showBackButton: true
  };

  public auth: Auth;

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
    this.auth = this.storageService.getAuth();
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/auth/slide']);
  }
}
