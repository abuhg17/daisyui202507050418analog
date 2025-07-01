import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, NgClass, NgIf],
  template: `
    <nav class="bg-base-100 shadow-sm p-3">
      <div class="flex items-center justify-between">
        <!-- 左側：漢堡按鈕 -->
        <button
          (click)="toggleMenu()"
          class="btn btn-ghost md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            *ngIf="!menuOpen()"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            *ngIf="menuOpen()"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 右側：標題群 -->
        <div class="flex flex-col flex-1 ml-4">
          <h1 class="text-xl font-bold">This is Nav.</h1>
          <h2>🔢Angular(Analog)</h2>
          <h2>🔢Tailwind CSS</h2>
        </div>
      </div>

      <!-- 導航選單 -->
      <div
        [ngClass]="{
          'flex flex-col md:flex-row md:space-x-4 mt-2': true,
          block: menuOpen(),
          hidden: !menuOpen(),
          'md:block': true
        }"
      >
        <a routerLink="/" class="btn btn-ghost text-xl">Home page</a>
        <a routerLink="/about" class="btn btn-ghost text-xl">About page</a>
        <a routerLink="/blog/202507050418" class="btn btn-ghost text-xl">
          Blog page 202507050418
        </a>
        <a routerLink="/countdown" class="btn btn-ghost text-xl">
          Countdown page
        </a>
        <a routerLink="/bilibili" class="btn btn-ghost text-xl">
          Bilibili page
        </a>
        <a routerLink="/firebasefood" class="btn btn-ghost text-xl">
          FirebaseFood page
        </a>
        <a routerLink="/youtube" class="btn btn-ghost text-xl">
          Youtube page
        </a>
      </div>
    </nav>
  `,
})
export default class NavComponent {
  // 使用 Angular 17+ 的 signal 來管理響應式狀態
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }
}
