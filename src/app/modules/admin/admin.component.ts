import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { ChildrenOutletContexts } from '@angular/router';
import { slideInAnimationAdmin } from './admin.animations';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FooterComponent, RouterModule],
  animations: [
    slideInAnimationAdmin
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  constructor(private contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    const route = this.contexts.getContext('primary')?.route;
    return route?.snapshot?.data?.['animate'];
  }
}
