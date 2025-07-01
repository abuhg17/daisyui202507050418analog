// src/server/routes/channels.[channelIds].ts
import { defineEventHandler } from 'h3'; // 確保引入 defineEventHandler
import axios from 'axios';

export default defineEventHandler(async (event) => {
  // 從動態路由參數中獲取 channelIds
  // 例如，如果 URL 是 /api/channels/UC_x5XG1OV2P6wMqysgfFadg,UC_y5XG1OV2P6wMqysgfFadg
  // channelIdsParam 將是 "UC_x5XG1OV2P6wMqysgfFadg,UC_y5XG1OV2P6wMqysgfFadg"
  const channelIdsParam = event.context.params?.channelIds;

  // 注意：將你的實際 YouTube Data API Key 放在這裡，或者更好的做法是從環境變數中讀取
  const apikey = 'AIzaSyAUD7ipwX-VAIIgbtw4V6sHKOTfyWoPdMo'; // <-- 請替換為你的實際 API Key

  if (!channelIdsParam) {
    event.node.res.statusCode = 400;
    return { error: '請提供 channelIds 參數（可用逗號分隔多個）' };
  }

  const channelIds = channelIdsParam
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  if (channelIds.length === 0 || channelIds.length > 50) {
    event.node.res.statusCode = 400;
    return { error: '頻道 ID 數量需介於 1 到 50 之間' };
  }

  try {
    const res = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'snippet,statistics', // 請求頻道的基本資訊和統計數據
          id: channelIds.join(','), // 將多個頻道 ID 用逗號連接
          key: apikey, // 你的 YouTube Data API Key
        },
      }
    );

    const items = res.data?.items || [];

    if (items.length === 0) {
      event.node.res.statusCode = 404; // Not Found
      return { error: '找不到任何頻道資料' };
    }

    return {
      count: items.length,
      items,
    };
  } catch (error: any) {
    // 捕獲錯誤
    event.node.res.statusCode = error.response?.status || 500; // 使用 YouTube API 返回的狀態碼，否則為 500
    console.error('無法取得頻道資料:', error.message); // 記錄錯誤到伺服器控制台
    return {
      error: '無法取得頻道資料',
      message: error.message,
      status: error.response?.status || null,
      response: error.response?.data || null, // 返回 YouTube API 的錯誤回應
    };
  }
});
