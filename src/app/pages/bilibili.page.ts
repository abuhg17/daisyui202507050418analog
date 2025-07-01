// src/app/pages/bilibili.page.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

// 定義 Bilibili 影片資料的介面 ，根據你的 API 回應調整
interface BilibiliVideo {
  bvid?: string;
  aid?: number;
  title?: string;
  pic?: string; // 影片封面
  owner?: {
    mid: number;
    name: string;
    face: string; // 頻道頭像
  };
  stat?: {
    view?: number;
    danmaku?: number;
    like?: number;
    coin?: number;
    favorite?: number;
    share?: number;
  };
  pages?: {
    first_frame?: string;
  }[];
  error?: string; // 用於標記載入失敗的項目
}

@Component({
  selector: 'app-bilibili-page', // 這個 selector 在自動路由中不那麼重要，但保留也無妨
  standalone: true, // 標記為獨立組件
  imports: [CommonModule], // 引入 CommonModule
  template: `
    <div class="max-w-7xl mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6 text-center">Bilibili Page</h1>

      <div
        *ngIf="isLoading()"
        class="loading-container text-center text-lg font-medium mb-4"
      >
        載入中... ({{ loadedCount() }}/{{ totalCount() }})
      </div>

      <div *ngIf="!isLoading()" class="overflow-x-auto">
        <table
          class="table table-zebra table-compact w-full border border-gray-300"
        >
          <thead>
            <tr class="bg-gray-100 text-center">
              <th>#</th>
              <th>頻道頭像</th>
              <th>影片封面</th>
              <th>首幀圖</th>
              <th>觀看數</th>
              <th>彈幕數</th>
              <th>喜歡數</th>
              <th>硬幣數</th>
              <th>收藏數</th>
              <th>分享數</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let item of bilibilis(); let idx = index"
              [attr.key]="item.bvid || idx"
              class="text-center align-middle"
            >
              <td>{{ idx + 1 }}</td>
              <td>
                <a
                  *ngIf="item.owner"
                  [href]="
                    'https://space.bilibili.com/' +
                    item.owner.mid +
                    '/upload/video'
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    [src]="
                      '/api/bilibili/proxyimg?url=' +
                      encodeURIComponent(item.owner.face || '')
                    "
                    [alt]="item.owner.name || '無頭像'"
                    [title]="item.owner.name || '無頭像'"
                    class="mx-auto rounded-full"
                    width="80"
                    height="80"
                  />
                </a>
                <span *ngIf="!item.owner">無頭像</span>
              </td>
              <td>
                <a
                  *ngIf="item.bvid"
                  [href]="'https://www.bilibili.com/video/' + item.bvid"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    [src]="
                      '/api/bilibili/proxyimg?url=' +
                      encodeURIComponent(item.pic || '')
                    "
                    [alt]="item.title || '無影片封面'"
                    [title]="item.title || '無影片封面'"
                    class="mx-auto rounded"
                    width="150"
                    height="auto"
                  />
                </a>
                <span *ngIf="!item.bvid">無影片封面</span>
              </td>
              <td>
                <img
                  *ngIf="
                    item.pages && item.pages.length && item.pages[0].first_frame
                  "
                  [src]="
                    '/api/bilibili/proxyimg?url=' +
                    encodeURIComponent(item.pages[0].first_frame || '')
                  "
                  class="mx-auto rounded"
                  width="150"
                  height="auto"
                  alt="首幀圖"
                />
                <span
                  *ngIf="
                    !(
                      item.pages &&
                      item.pages.length &&
                      item.pages[0].first_frame
                    )
                  "
                  >無首幀圖</span
                >
              </td>
              <td class="text-right font-mono">
                {{ item.stat?.view?.toLocaleString() || '-' }}
              </td>
              <td class="text-right font-mono">
                {{ item.stat?.danmaku?.toLocaleString() || '-' }}
              </td>
              <td class="text-right font-mono">
                {{ item.stat?.like?.toLocaleString() || '-' }}
              </td>
              <td class="text-right font-mono">
                {{ item.stat?.coin?.toLocaleString() || '-' }}
              </td>
              <td class="text-right font-mono">
                {{ item.stat?.favorite?.toLocaleString() || '-' }}
              </td>
              <td class="text-right font-mono">
                {{ item.stat?.share?.toLocaleString() || '-' }}
              </td>
            </tr>
          </tbody>
        </table>

        <button
          (click)="clearCache()"
          class="btn btn-ghost mt-6 block mx-auto text-lg"
        >
          清除快取並重新載入
        </button>
      </div>
    </div>
  `,
  styles: `
    /* 你可以用 tailwind 風格，這裡只簡單調整 */
    .loading-container {
      min-height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
})
export default class BilibiliPage implements OnInit {
  // 注意這裡使用 default export
  constructor(private http: HttpClient) {}

  private arrs: string[] = [
    'BV1iZLJzuE6S',
    'BV1BELHzyEMi',
    'BV1Et4y1r7Eu',
    'BV1rSNvzeEPt',
    'BV1RkT2zREai',
    'BV1JtNXzkEFN',
    'BV1Dc2VYkEce',
    'BV1VpTpzHEcT',
    'BV1PpZ2YoEtU',
    'BV1WiNkz4EZM',
    'BV1a5E1zLE2u',
    'BV1WmCpYHE5C',
    'BV1M6NBeZEVu',
    'BV1XXNiznE4X',
    'BV1pSLgz9EnQ',
    'BV13j421o7mz',
    'BV1ZS4y1R7q9',
    'BV1Ur4y1r72B',
    'BV15y421B7FC',
    'BV1ytKHzNEDo',
    'BV1esKuzUEkG',
    'BV1qEVazqEv3',
    'BV1ogJhz1EbJ',
    'BV1i3MLzzEjY',
    'BV1PsT2zME58',
    'BV1dTRrYDEqJ',
    'BV11cdcY4EbG',
    'BV11TJ8zZEUR',
    'BV1yQfWYaEVo',
    'BV1ivM8zJEUg',
    'BV1y8KWzrEsx',
    'BV1YGMmzFEXv',
    'BV1uEyuYZEYW',
    'BV1ud4y1Q7Dd',
    'BV1R5N9zgE1t',
    'BV1QdfnYwEFc',
    'BV17tNXzkEDy',
    'BV1DFfWYTEz3',
    'BV1FqfnYLE1v',
    'BV1K2jnz8E8Q',
    'BV1cvfpYsEiJ',
    'BV12BNdzaEo1',
    'BV1Fv4y1g7Cc',
    'BV1AGfWYFEaY',
    'BV1qTTTzjE5T',
    'BV1qaTdzWELF',
    'BV1UeK8zAEgM',
    'BV1DaMyzmEgc',
    'BV1ACTezqEZ9',
    'BV1HsTyz8EBL',
    'BV1HBMmz3Ehp',
    'BV1dQKGzoEVA',
    'BV1aFK4zfEjT',
    'BV1o2KgzpEuv',
    'BV1mGK7zfEqT',
    'BV1egTzzeEu4',
    'BV1BBKJzSEaM',
    'BV1CUMHzBE3L',
    'BV11KK3zzEL1',
    'BV1c6KGzKEk2',
    'BV1YgM3z9EJ3',
    'BV1zEKuzXENd',
    'BV1eTKYzEE2g',
    'BV1JhMEzWEFQ',
    'BV1bqMczxEoG',
    'BV1jsMAzGE2a',
    'BV1AYNLzyErV',
    'BV16PMSzGETR',
    'BV1hrKVzWEsP',
    'BV1SAMtzYE3M',
    'BV18V4y1j7ja',
    'BV13W4y1U7NP',
    'BV1vFKbzqED1',
    'BV1mM4m167tL',
    'BV1MgEjzxEfv',
  ];

  bilibilis = signal<BilibiliVideo[]>([]);
  isLoading = signal(false);
  loadedCount = signal(0);
  totalCount = signal(this.arrs.length);

  private readonly CACHE_KEY = 'bilibili_cache_data';
  private readonly CACHE_TIME_KEY = 'bilibili_cache_time';
  private readonly CACHE_ARRS_KEY = 'bilibili_cache_arrs_key';
  private readonly CACHE_TTL = 1000 * 60 * 60 * 24; // 1 天

  private readonly FORCE_CLEAR_BEFORE_TW = new Date(
    '2025-06-27T21:33:00+08:00'
  ).getTime();

  ngOnInit(): void {
    this.loadData();
  }

  private arrsToKey(arr: string[]): string {
    return JSON.stringify(arr);
  }

  private getCache(): BilibiliVideo[] | null {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      const time = localStorage.getItem(this.CACHE_TIME_KEY);
      const arrsKey = localStorage.getItem(this.CACHE_ARRS_KEY);

      if (!raw || !time || !arrsKey) return null;
      if (arrsKey !== this.arrsToKey(this.arrs)) return null;

      const parsedTime = parseInt(time);
      if (isNaN(parsedTime)) return null;

      if (parsedTime < this.FORCE_CLEAR_BEFORE_TW) return null;

      if (Date.now() - parsedTime > this.CACHE_TTL) return null;

      return JSON.parse(raw);
    } catch (e) {
      console.error('讀取快取失敗:', e);
      return null;
    }
  }

  private setCache(data: BilibiliVideo[]): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(this.CACHE_TIME_KEY, Date.now().toString());
    localStorage.setItem(this.CACHE_ARRS_KEY, this.arrsToKey(this.arrs));
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.loadedCount.set(0);
    this.bilibilis.set([]);

    const cache = this.getCache();
    if (cache && Array.isArray(cache) && cache.length) {
      this.bilibilis.set(cache);
      this.loadedCount.set(cache.length);
      this.isLoading.set(false);
      return;
    }

    const newBilibilis: BilibiliVideo[] = [];
    for (let i = 0; i < this.arrs.length; i++) {
      const bvid = this.arrs[i];
      try {
        const res = await lastValueFrom(
          this.http.get<BilibiliVideo>(`/api/bilibili/${bvid}`)
        );
        newBilibilis.push(res);
      } catch (e: any) {
        console.error(`載入 BVID ${bvid} 失敗:`, e);
        newBilibilis.push({ bvid, error: '載入失敗' });
      }
      this.loadedCount.set(i + 1);
      this.bilibilis.set([...newBilibilis]);
      await new Promise((r) => setTimeout(r, 300));
    }

    this.setCache(newBilibilis);
    this.isLoading.set(false);
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.CACHE_TIME_KEY);
    localStorage.removeItem(this.CACHE_ARRS_KEY);
    this.bilibilis.set([]);
    this.loadedCount.set(0);
    this.isLoading.set(true);
    this.loadData();
  }

  encodeURIComponent(uri: string): string {
    return encodeURIComponent(uri);
  }
}
