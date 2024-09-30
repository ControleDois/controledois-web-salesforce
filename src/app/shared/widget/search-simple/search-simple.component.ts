import { CommonModule } from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-simple',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search-simple.component.html',
  styleUrls: ['./search-simple.component.scss']
})
export class SearchSimpleComponent implements OnInit {
  @Input()
  public search!: FormControl;

  constructor() { }

  ngOnInit(): void {
  }
}
