// src/app/pages/youtube.page.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // 引入 CommonModule 以使用 *ngIf, *ngFor
import { HttpClient } from '@angular/common/http'; // 引入 HttpClient
import { lastValueFrom } from 'rxjs'; // 將 Observable 轉換為 Promise

// 定義 YouTube 影片和頻道資料的介面
interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Thumbnails {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
}

interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
  defaultAudioLanguage?: string;
}

interface VideoStatistics {
  viewCount: string;
  likeCount?: string; // 有些影片可能沒有 likeCount
  dislikeCount?: string; // YouTube API v3 已經移除 dislikeCount
  favoriteCount: string;
  commentCount?: string;
}

interface VideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: VideoSnippet;
  statistics: VideoStatistics;
}

interface ChannelSnippet {
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  defaultLanguage?: string;
  localized: {
    title: string;
    description: string;
  };
  country?: string;
}

interface ChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

interface ChannelItem {
  kind: string;
  etag: string;
  id: string;
  snippet: ChannelSnippet;
  statistics: ChannelStatistics;
}

interface YoutubeData {
  items: VideoItem;
  channel: ChannelItem | null;
}

@Component({
  selector: 'app-youtube-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6 text-center">Youtube Page</h1>

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
            <tr class="bg-gray-100">
              <th class="text-center">#</th>
              <th class="text-center">頻道縮圖</th>
              <th class="text-center">影片縮圖</th>
              <th class="text-center">觀看數</th>
              <th class="text-center">喜歡數</th>
              <th class="text-center">發布日期</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let item of youtubes(); let index = index"
              [attr.key]="item.items.id"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-center">
                <a
                  *ngIf="item.channel"
                  [href]="'https://www.youtube.com/channel/' + item.channel.id"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    [src]="item.channel.snippet.thumbnails.medium.url"
                    [alt]="item.channel.snippet.title"
                    class="mx-auto rounded"
                    width="100"
                  />
                </a>
                <span *ngIf="!item.channel">無頻道縮圖</span>
              </td>
              <td class="text-center">
                <a
                  [href]="'https://www.youtube.com/watch?v=' + item.items.id"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    [src]="item.items.snippet.thumbnails.medium.url"
                    [alt]="item.items.snippet.title"
                    class="mx-auto rounded"
                    width="150"
                  />
                </a>
              </td>
              <td class="text-right font-mono">
                {{ Number(item.items.statistics.viewCount).toLocaleString() }}
              </td>
              <td class="text-right font-mono">
                {{
                  item.items.statistics.likeCount
                    ? Number(item.items.statistics.likeCount).toLocaleString()
                    : '無'
                }}
              </td>
              <td class="text-center">
                {{ item.items.snippet.publishedAt.substr(0, 10) }}
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
    .loading-container {
      min-height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
})
export default class YoutubePage implements OnInit {
  constructor(private http: HttpClient) {}
  Number = Number;
  private arrs: string[] = [
    'hIjIt3yU8aA',
    'zy1sDJcwLw8',
    'nmq3I-8Izus',
    '04t_L8Okvbg',
    'XUa9d7E081A',
    '9eGkn0jhS8A',
    'BV1uoMCzkE5Y',
    's94P7jmEspQ',
    'WS3sGVgkOZk',
    'KqKVBSHtCJU',
    '0XNx3sKknsE',
    'u1rZFCNfR2I',
    'hnl-44mXdKI',
    'wA9kWUP65jo',
    '_ckik6l8LGE',
    'uVjKn92u35A',
    'Hv8K31xVlGI',
    'iiriaDJuoXA',
    '1UwmdF9MPSs',
    'tXAr4L0Txhc',
    'cTsgN88eFao',
    'dOjrpAxIpOc',
    'SKx1sDSdlDc',
    'Q_b2q2psDAE',
    'WH297WZaU7M',
    'Ro8QCl_TwAQ',
    'e1AWBS-RS-I',
    'wW0fZhdjrGM',
    'bBA95gwfcXA',
    '7PfL5w6selY',
    'k6pHuMP6ObU',
    '7jPFzlxj3qQ',
    'LGpQs_dOxYw',
    'Ftw4vkl_V0s',
    'h7LtLEgcHYc',
    'qLZ4P1x3jPA',
    'L0VvGDA2pOc',
    'OnnI9rLy7R4',
    'ASdEPhr7zVg',
    '8UYEwfodabA',
    'nmq3I-8Izus',
    '2egSi1HBrxg',
    'uKBI1Ea8VO0',
    'Z-h6O_2IYRo',
    'gNypi17ruog',
    'Yt9-vuUy1gM',
    'Hp7GR9TSd4w',
    'jtRU5ZhFdyc',
    '54NMP1D9mZk',
    '7LDeFRHnjAA',
    'mVW8uH2k7So',
    'oYFva7DxBdo',
    'oPyp6fDcpdc',
    'vGRE-aBmIPg',
    'wFtZE0eL6ts',
    'bTue_88ef6o',
    'E15_2rMaWVM',
    'sLllWRwLQrg',
    'VzR3mI6X84E',
    'B3Bt0DC5svw',
    '7bXgLbEOoFg',
    'FaNxTh50UH8',
    'Td8YEuqyRxw',
    'u2SI5wgNmxg',
    'Y8BDihOv7Go',
    '1vLoO_DonRE',
    'XK0KBZKvts4',
    'gIRB3y_8hRc',
    'fkp8CqZrkW4',
    'F9YJ2YB3a3E',
    'Ihi1mhMYLR0',
    'IQ8ZjEFW6Cw',
    'w3-CT_aiZxQ',
    'AAwiJKy1Xzw',
    '-4ADGW7TE0Q',
  ];

  youtubes = signal<YoutubeData[]>([]);
  isLoading = signal(false);
  loadedCount = signal(0);
  totalCount = signal(this.arrs.length);
  private readonly MAX_BATCH_SIZE = 50;

  private readonly CACHE_KEY = 'youtube-videos';
  private readonly CACHE_TIMESTAMP_KEY = 'youtube-videos-timestamp';
  private readonly CACHE_EXPIRATION_MS = 1000 * 60 * 60 * 12; // 12 小時

  ngOnInit(): void {
    this.loadData();
  }

  private getCache(): YoutubeData[] | null {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      const time = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      if (!raw || !time) return null;

      const cacheTime = parseInt(time);
      const FORCE_CLEAR_BEFORE = new Date(
        '2025-06-27T21:33:00+08:00'
      ).getTime();

      if (cacheTime < FORCE_CLEAR_BEFORE) {
        localStorage.removeItem(this.CACHE_KEY);
        localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
        return null;
      }

      if (Date.now() - cacheTime > this.CACHE_EXPIRATION_MS) return null;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      if (parsed.length < this.totalCount() * 0.5) return null;

      return parsed;
    } catch (e) {
      console.error('讀取快取失敗:', e);
      return null;
    }
  }

  private setCache(data: YoutubeData[]): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
  }

  // API 請求，帶重試
  private async fetchWithRetry<T>(
    url: string,
    maxRetries = 3,
    delayMs = 500
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await lastValueFrom(this.http.get<T>(url));
        if (!res) throw new Error('無資料'); // 檢查是否返回空值
        return res;
      } catch (e: any) {
        console.warn(`第${attempt}次請求失敗: ${url}`, e);
        if (attempt === maxRetries) throw e;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw new Error('達到最大重試次數'); // 應該不會執行到這裡
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.youtubes.set([]);
    this.loadedCount.set(0);

    const cached = this.getCache();
    if (cached && cached.length) {
      this.youtubes.set(cached);
      this.loadedCount.set(cached.length);
      this.isLoading.set(false);
      return;
    }

    const newYoutubes: YoutubeData[] = [];
    for (
      let start = 0;
      start < this.arrs.length;
      start += this.MAX_BATCH_SIZE
    ) {
      const batch = this.arrs.slice(start, start + this.MAX_BATCH_SIZE);

      try {
        // 獲取影片資料
        const videoData: { items: VideoItem[] } = await this.fetchWithRetry(
          `/api/youtube/videos/${batch.join(',')}`
        );

        if (!videoData.items || !videoData.items.length) {
          console.warn(
            `批次無影片資料: ${start} ~ ${start + batch.length - 1}`
          );
          continue;
        }

        // 提取頻道 ID
        const channelIds = [
          ...new Set(videoData.items.map((v) => v.snippet.channelId)),
        ];

        // 獲取頻道資料
        const channelData: { items: ChannelItem[] } = await this.fetchWithRetry(
          `/api/youtube/channel/${channelIds.join(',')}`
        );

        const channelMap = new Map<string, ChannelItem>();
        channelData.items?.forEach((c) => {
          channelMap.set(c.id, c);
        });

        videoData.items.forEach((videoItem) => {
          newYoutubes.push({
            items: videoItem,
            channel: channelMap.get(videoItem.snippet.channelId) || null,
          });
        });

        this.youtubes.set([...newYoutubes]); // 更新 Signal
        this.loadedCount.set(newYoutubes.length);

        // 每批結束時，先更新快取
        this.setCache(newYoutubes);
      } catch (error) {
        console.error(
          `批次讀取失敗: ${start} ~ ${start + batch.length - 1}`,
          error
        );
      }

      // 稍微延遲避免 API 速率限制
      await new Promise((r) => setTimeout(r, 500));
    }

    this.isLoading.set(false);
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
    this.youtubes.set([]);
    this.loadedCount.set(0);
    this.isLoading.set(true);
    this.loadData();
  }
}
