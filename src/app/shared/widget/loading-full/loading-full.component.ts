import {Component, Input, OnInit} from '@angular/core';
import { LoadingFull } from '../../interfaces/loadingFull.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-full',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-full.component.html',
  styleUrls: ['./loading-full.component.scss']
})
export class LoadingFullComponent {
  @Input() public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
}
