import { CommonModule } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { NgxMaskPipe } from 'ngx-mask';
import { FixedHeaderComponent } from '../../../../shared/widget/fixed-header/fixed-header.component';
import { FormControl } from '@angular/forms';
import { FixedHeader } from '../../../../shared/interfaces/fixed.header.interface';
import { CompanyService } from '../../../../shared/services/company.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, throwError } from 'rxjs';
import { StorageService } from '../../../../shared/services/storage.service';
import { LoadingFull } from '../../../../shared/interfaces/loadingFull.interface';
import { DialogMessageService } from '../../../../shared/services/dialog-message.service';

@Component({
  selector: 'app-my-companies',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    CommonModule,
    NgxMaskPipe,
    FixedHeaderComponent,
    RouterModule
  ],
  templateUrl: './my-companies.component.html',
})
export class MyCompaniesComponent implements OnInit {
  public companies: any = [];

  @Output() public fixedHeader: FixedHeader = {
    title: 'Minhas Empresas',
    routerBack: '../my-profile',
    showBackButton: true,
    showSearchButton: true,
    search: new FormControl('')
  };

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  constructor(
    private companyService: CompanyService,
    private storageService: StorageService,
    private dialogMessageService: DialogMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fixedHeader.search?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.load();
        })
      )
      .subscribe();

    this.load();
  }

  load(): void {
    this.companyService.index(this.fixedHeader.search?.value ? this.fixedHeader.search?.value : '').pipe(
      map(res => {
        this.companies = res.data;
      })
    ).subscribe();
  }

  selectCompany(id: string): void {
    this.loadingFull.active = true;
    this.companyService.select(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.dialogMessageService.openDialog({
          icon: 'priority_high',
          iconColor: '#ff5959',
          title: 'Empresa inválida',
          message: 'Empresa não encontrada',
          message_next: 'Verifique se a empresa selecionada está correta',
        });
        return throwError(error);
      }),
      map((res) => {
        const auth = this.storageService.getAuth();
        auth.company = res;
        this.storageService.setAuth(auth);
        this.router.navigate(['/my-profile']);
      })
    ).subscribe();
  }
}
