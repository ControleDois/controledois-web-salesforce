import { animate, query, style, transition, trigger } from "@angular/animations";

export const slideInAnimationAdmin =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter', [
        style({ opacity: 0 }), // Começa invisível
        animate('200ms ease-in', style({ opacity: 1 })) // Transição suave
      ], { optional: true }),
      query(':leave', [
        animate('100ms ease-out', style({ opacity: 0 })) // Suave fade-out ao sair
      ], { optional: true })
    ])
  ]);
