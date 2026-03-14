// 最简化的测试
const CryptoJS = require('crypto-js');

const APPID = 'e25b0af8';
const API_KEY = 'e983ca33eaa8d2f299061c4f53d0393d';
const API_SECRET = '551a9da13f670aa45c08d704';

function getWebSocketUrl() {
  const url = 'wss://spark-api.xf-yun.com/v3.5/chat';
  const host = 'spark-api.xf-yun.com';
  const path = '/v3.5/chat';
  const date = new Date().toUTCString();

  const tmp = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signature = CryptoJS.HmacSHA256(tmp, API_SECRET);
  const signatureBase64 = CryptoJS.enc.Base64.stringify(signature);

  const authorizationOrigin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureBase64}"`;
  const authorization = btoa(authorizationOrigin);

  return `${url}?authorization=${authorization}&date=${date}&host=${host}`;
}

console.log('生成的URL:', getWebSocketUrl());
