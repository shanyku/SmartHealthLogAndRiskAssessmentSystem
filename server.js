const express = require('express');
// 1. 引入 better-sqlite3 套件
const Database = require('better-sqlite3'); 

const app = express();

// 2. 連線或建立資料庫檔案 (會在 contact-app 資料夾下生成 contacts.db)
const db = new Database('contacts.db');

// 3. 建立 contacts 資料表
// 如果檔案裡還沒有這張表，就執行 SQL 指令建立它
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("🎉 SQLite 資料庫與 contacts 資料表準備就緒！");

// 這是你原本寫好的路由
app.get('/', (req, res) => {
  res.send('Hello World 🎉');
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});