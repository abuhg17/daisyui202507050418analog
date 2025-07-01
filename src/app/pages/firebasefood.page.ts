// src/app/pages/firebasefood.page.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; // 引入 CommonModule 以使用 *ngIf, *ngFor
import { HttpClient } from '@angular/common/http'; // 引入 HttpClient
import { lastValueFrom } from 'rxjs'; // 將 Observable 轉換為 Promise

// 定義食物資料的介面
interface FoodItem {
  id: string; // Firebase 通常會有一個唯一的 ID
  foodname: string;
  foodbrand: string;
  foodstore: string;
  foodprice: number;
  foodamount: number;
  fooddate: string; // 假設是 YYYY-MM-DD 或 YYYY/MM/DD 格式
  [key: string]: any; // 允許索引簽名 ，以便透過字串鍵存取屬性
}

// 定義 API 回應的介面
interface FirebaseFoodResponse {
  myvue3food: FoodItem[];
}

@Component({
  selector: 'app-firebasefood-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto p-4">
      <h1>FirebaseFood Page</h1>

      <p class="mb-2">
        目前排序：<strong>{{ sortKey() || '無' }}</strong>
        <span *ngIf="sortKey()">{{ sortAsc() ? '🔼 升冪' : '🔽 降冪' }}</span>
      </p>

      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th (click)="sort('foodname')" class="cursor-pointer select-none">
                foodname <span>{{ arrow('foodname') }}</span>
              </th>
              <th
                (click)="sort('foodbrand')"
                class="cursor-pointer select-none"
              >
                foodbrand <span>{{ arrow('foodbrand') }}</span>
              </th>
              <th
                (click)="sort('foodstore')"
                class="cursor-pointer select-none"
              >
                foodstore <span>{{ arrow('foodstore') }}</span>
              </th>
              <th
                (click)="sort('foodprice')"
                class="cursor-pointer select-none"
              >
                foodprice <span>{{ arrow('foodprice') }}</span>
              </th>
              <th
                (click)="sort('foodamount')"
                class="cursor-pointer select-none"
              >
                foodamount <span>{{ arrow('foodamount') }}</span>
              </th>
              <th (click)="sort('fooddate')" class="cursor-pointer select-none">
                fooddate <span>{{ arrow('fooddate') }}</span>
              </th>
              <th (click)="sort('id')" class="cursor-pointer select-none">
                id <span>{{ arrow('id') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let food of sortedFoods(); let idx = index"
              [attr.key]="food.id"
            >
              <td>{{ idx + 1 }}</td>
              <td>{{ food.foodname }}</td>
              <td>{{ food.foodbrand }}</td>
              <td>{{ food.foodstore }}</td>
              <td>{{ food.foodprice }}</td>
              <td>{{ food.foodamount }}</td>
              <td>{{ food.fooddate }}</td>
              <td>{{ food.id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    /* 你可以在這裡添加組件特有的樣式 */
  `,
})
export default class FirebaseFoodPage implements OnInit {
  constructor(private http: HttpClient) {}

  // 使用 Signal 管理響應式狀態
  foods = signal<FoodItem[]>([]);
  sortKey = signal<string>('');
  sortAsc = signal<boolean>(true);

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      // 使用 HttpClient 獲取資料
      const response = await lastValueFrom(
        this.http.get<FirebaseFoodResponse>('/api/firebasefood')
      );
      this.foods.set(response.myvue3food || []);
    } catch (error) {
      console.error('載入 FirebaseFood 資料失敗:', error);
      // 可以在這裡顯示錯誤訊息給用戶
    }
  }

  // 點擊排序欄位切換排序
  sort(key: string): void {
    if (this.sortKey() === key) {
      this.sortAsc.set(!this.sortAsc());
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  // 顯示箭頭
  arrow(key: string): string {
    if (this.sortKey() !== key) return '';
    return this.sortAsc() ? '🔼' : '🔽';
  }

  // 輔助解析日期 YYYY-MM-DD 或 YYYY/MM/DD
  private parseYMDDate(str: string): number {
    if (typeof str !== 'string') return 0;
    const normalized = str.replace(/\//g, '-');
    const parts = normalized.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d).getTime();
      }
    }
    return 0;
  }

  // 排序資料 computed (Angular 的 computed 函數)
  sortedFoods = computed(() => {
    const currentSortKey = this.sortKey();
    const currentSortAsc = this.sortAsc();
    const currentFoods = this.foods();

    if (!currentSortKey) return currentFoods;

    // 複製陣列以避免修改原始數據
    return [...currentFoods].sort((a, b) => {
      let v1 = a[currentSortKey];
      let v2 = b[currentSortKey];

      if (currentSortKey === 'fooddate') {
        const t1 = this.parseYMDDate(v1);
        const t2 = this.parseYMDDate(v2);
        return currentSortAsc ? t1 - t2 : t2 - t1;
      }

      const n1 = parseFloat(v1);
      const n2 = parseFloat(v2);
      if (!isNaN(n1) && !isNaN(n2)) {
        return currentSortAsc ? n1 - n2 : n2 - n1;
      }

      // 處理非數字和非日期的字串比較
      return currentSortAsc
        ? String(v1).localeCompare(String(v2))
        : String(v2).localeCompare(String(v1));
    });
  });
}
