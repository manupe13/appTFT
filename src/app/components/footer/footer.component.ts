import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  isFooterVisible = false;

  constructor() { }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;

    const body = document.body;
    const html = document.documentElement;
    const pageHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    if (scrollPosition + windowHeight >= pageHeight) {
      if (!this.isFooterVisible) {
        const footer = document.getElementById('footer');
        footer?.classList.remove('footer-hide');
        footer?.classList.add('footer-show');
        this.isFooterVisible = true;
      }
    } else {
      if (this.isFooterVisible) {
        const footer = document.getElementById('footer');
        footer?.classList.add('footer-hide');
        footer?.classList.remove('footer-show');
        this.isFooterVisible = false;
      }
    }
  }

}
