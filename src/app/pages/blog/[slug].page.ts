import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-slug-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Blog Page</h1>
    <h2>post:{{ slug }}</h2>
  `,
  styles: [
    `
      /* 您可以在這裡添加組件特有的樣式 */
      h1 {
        color: #333;
        font-family: Arial, sans-serif;
      }
      h2 {
        color: #666;
        font-family: Arial, sans-serif;
      }
    `,
  ],
})
export default class BlogSlugPageComponent implements OnInit {
  slug: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug');
    });
  }
}
