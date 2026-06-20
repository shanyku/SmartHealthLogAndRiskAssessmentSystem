const express = require('express');
const sqlite3 = require('@vscode/sqlite3');
const { open } = require('sqlite');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // 讓後端可以解析前端傳來的 JSON 資料

let db;

// 連結資料庫的非同步函式
async function connectDB() {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });
    console.log("後端伺服器已成功連結 SQLite 資料庫！");
}
connectDB();

// 【API 1】取得所有健康日誌 (GET /health-logs)
app.get('/health-logs', async (req, res) => {
    try {
        // 從資料庫撈出所有日誌，依日期從新到舊排序
        const logs = await db.all('SELECT * FROM health_logs ORDER BY log_date DESC');
        
        // 將資料用 JSON 格式回傳給請求者
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '伺服器內部錯誤，無法讀取資料' });
    }
});

// 【決策樹函式】依據題目規則計算風險等級
function calculateRisk(sleep, steps, mood) {
    if (sleep < 6) {
        // 左分支：睡眠不足
        if (steps < 4000) {
            return 'High';
        } else {
            return mood < 5 ? 'High' : 'Medium';
        }
    } else {
        // 右分支：睡眠充足
        if (steps >= 7000 && mood >= 6) {
            return 'Low';
        } else {
            return 'Medium';
        }
    }
}

// 【API 2】新增健康日誌並自動評估風險 (POST /health-logs)
app.post('/health-logs', async (req, res) => {
    try {
        const { log_date, sleep_hours, steps, mood_score } = req.body;

        // 欄位檢查驗證
        if (!log_date || sleep_hours === undefined || steps === undefined || mood_score === undefined) {
            return res.status(400).json({ error: '所有欄位皆為必填！' });
        }

        // 1. 運用決策樹核心邏輯計算風險
        const risk_level = calculateRisk(Number(sleep_hours), Number(steps), Number(mood_score));

        // 2. 將包含風險等級的完整資料寫入資料庫
        const result = await db.run(
            `INSERT INTO health_logs (log_date, sleep_hours, steps, mood_score, risk_level) 
             VALUES (?, ?, ?, ?, ?)`,
            [log_date, sleep_hours, steps, mood_score, risk_level]
        );

        // 3. 回傳成功訊息與計算結果給前端
        res.status(201).json({
            message: '健康日誌新增成功！',
            log_id: result.lastID,
            evaluated_risk: risk_level
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '伺服器內部錯誤，無法儲存資料' });
    }
});

// 設定伺服器監聽的 Port（通訊埠）
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 智慧健康系統後端已在 Port ${PORT} 成功啟動！`);
});