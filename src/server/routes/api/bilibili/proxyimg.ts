// src/server/routes/proxy.ts
import { defineEventHandler, getQuery } from 'h3'; // 確保引入 getQuery
import axios from 'axios';

export default defineEventHandler(async (event) => {
  const url = getQuery(event).url; // 從查詢參數中獲取目標 URL
  if (!url) {
    // 如果沒有提供 url 參數，返回錯誤
    event.node.res.statusCode = 400; // Bad Request
    return {
      error:
        '請提供 url 參數，例如: /api/proxy?url=https://example.com/image.jpg',
    };
  }

  try {
    // 使用 axios 代理請求
    const response = await axios.get(url, {
      responseType: 'stream', // 以流的形式獲取回應
      headers: {
        // 模擬 Referer ，這對於某些網站的防盜鏈很重要
        Referer: 'https://www.bilibili.com/',
        // 可以根據需要添加 User-Agent 等其他頭部
        // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64 ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      },
    });

    // 將代理回應的 Content-Type 和 Cache-Control 頭部設定到當前回應中
    event.node.res.setHeader('Content-Type', response.headers['content-type']);
    event.node.res.setHeader('Cache-Control', 'public, max-age=86400'); // 緩存一天

    // 將代理獲取到的資料流直接傳遞給客戶端
    return response.data;
  } catch (err: any) {
    // 捕獲錯誤並處理
    event.node.res.statusCode = 500; // 內部伺服器錯誤
    console.error('圖片代理失敗:', err.message); // 記錄錯誤到伺服器控制台
    return { error: '圖片代理失敗', message: err.message };
  }
});
