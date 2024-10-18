import { Component, ElementRef, Input, ViewChild, viewChild } from '@angular/core';
import { FixedHeader } from '../../interfaces/fixed.header.interface';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-fixed-header',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './fixed-header.component.html',
  styleUrl: './fixed-header.component.scss'
})
export class FixedHeaderComponent {
  public showSearch = false;

  @Input() public fixedHeader: FixedHeader = {
    title: 'Titulo',
    routerBack: '',
    showBackButton: true,
    showSearchButton: true,
    search: new FormControl('')
  }

  @ViewChild('search') search!: ElementRef;

  setFocus() {
    setTimeout(() => {
      this.search.nativeElement.focus();
    }, 5);
  }

  closeSearch() {
    this.fixedHeader.search.setValue('');
    this.showSearch = false;
  }
}
