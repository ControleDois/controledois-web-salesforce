import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogMessage } from '../../interfaces/dialog-message.interface';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-message-full',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dialog-message-full.component.html',
  styleUrls: ['./dialog-message-full.component.scss']
})
export class DialogMessageFullComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogMessage) {}

  showLink(website: string){
    window.open(website, '_blank');
  }
}
