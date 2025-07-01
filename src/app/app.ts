import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import NavComponent from './components/nav.component'; // 修正後的導入方式

@Component({
  selector: 'app-root',
  standalone: true, // 確保 AppComponent 也是獨立組件
  imports: [RouterOutlet, NavComponent], // 導入 NavComponent
  template: `
    <app-nav></app-nav>
    <!-- 在這裡使用 NavComponent 的選擇器 -->
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
      }
    `,
  ],
})
export class AppComponent {}
