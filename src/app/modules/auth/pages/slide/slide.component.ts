import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-slide',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule],
  templateUrl: './slide.component.html',
  styleUrl: './slide.component.scss'
})
export class SlideComponent implements OnInit, OnDestroy {
  slides = [
    { image: 'assets/slide-01.gif', title: 'Praticidade', description: 'Fez uma venda? Registre na hora de onde estiver.' },
    { image: 'assets/slide-02.gif', title: 'Profissionalismo', description: 'Suas vendas e orçamentos em um modelo profissional.' },
    { image: 'assets/slide-03.gif', title: 'Segurança', description: 'Suas informações 100% seguras.' },
    { image: 'assets/slide-04.gif', title: 'Controle', description: 'Seus cliente itens e vendas organizado em um só lugar.' },
  ];

  currentSlideIndex = 0;
  slideInterval: any;

  ngOnInit() {
    this.startSlideShow();
  }

  startSlideShow() {
    this.slideInterval = setInterval(() => {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    }, 4000); // 4 seconds
  }

  setSlide(index: number) {
    this.currentSlideIndex = index;
    clearInterval(this.slideInterval); // Para o auto-play ao clicar
    this.startSlideShow(); // Reinicia o auto-play
  }

  onButtonClick() {
    console.log('Botão clicado!');
    // Aqui você pode implementar a função desejada
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
}
