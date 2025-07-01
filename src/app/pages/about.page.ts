import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: ` <h1>This is About Page</h1> `,
  styles: [
    `
      /* 您可以在這裡添加組件特有的樣式 */
      h1 {
        color: #333;
        font-family: Arial, sans-serif;
      }
    `,
  ],
})
export default class AboutComponent {}
