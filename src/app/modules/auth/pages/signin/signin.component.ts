import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../../../shared/services/storage.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { DialogMessageService } from '../../../../shared/services/dialog-message.service';
import { LoadingFull } from '../../../../shared/interfaces/loadingFull.interface';
import { catchError, finalize, map, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { LoadingFullComponent } from '../../../../shared/widget/loading-full/loading-full.component';
import { DialogMessageFullComponent } from '../../../../shared/widget/dialog-message-full/dialog-message-full.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule,
    MatButtonModule, MatDividerModule, RouterModule,
    ReactiveFormsModule, LoadingFullComponent, DialogMessageFullComponent],
  templateUrl: './signin.component.html',
  styleUrl: '../../auth.component.scss'
})
export class SigninComponent {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private dialogMessageService: DialogMessageService,
  ) {
  }

  login(): void {
    if (this.myForm.valid) {
      this.loadingFull.active = true;
      this.authService.login(this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.dialogMessageService.openDialog({
            icon: 'priority_high',
            iconColor: '#ff5959',
            title: 'Login inválido',
            message: 'Usuário ou senha inválidos',
            message_next: 'Verifique se seu email está correto, caso esteja correto, verifique se sua senha está correta. Caso não lembre sua senha, clique em "Esqueci minha senha"',
          });
          return throwError(error);
        }),
        map((auth) => {
          console.log(auth);
          this.storageService.setAuth(auth);
          this.router.navigate(['/dashboard']);
        })
      ).subscribe();
    }
  }
}
