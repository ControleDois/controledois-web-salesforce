import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              width: '100%',
              opacity: 0,
              transform: 'translateX(20%)',
            }),
          ],
          { optional: true }
        ),

        group([
          query(
            ':leave',
            [
              animate(
                '400ms ease-in-out',
                style({ transform: 'translateX(-20%)', opacity: 0 })
              ),
            ],
            { optional: true }
          ),

          query(
            ':enter',
            [
              style({ transform: 'translateX(20%)', opacity: 0 }),
              animate(
                '400ms ease-in-out',
                style({ transform: 'translateX(0%)', opacity: 1 })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),
    ]),
  ],
})
export class AdminComponent {}
