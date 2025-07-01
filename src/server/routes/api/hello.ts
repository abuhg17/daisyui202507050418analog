import { defineEventHandler } from 'h3';

export default defineEventHandler((event) => {
  // 在 Analog.js 中，h3 框架會自動處理 Content-Type 為 application/json
  // 當您返回一個 JavaScript 物件時，它會自動序列化為 JSON 並設置正確的 Content-Type
  // 因此，通常不需要手動設置 setHeader(event, "Content-Type", "application/json; charset=utf-8");

  return {
    message: 'Hello World.',
    message2: 'こんにちは、世界。',
    message3: '世界，你好!',
  };
});
