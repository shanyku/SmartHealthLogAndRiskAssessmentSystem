const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function insertSeeds() {
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    console.log("正在寫入測試資料...");

    // 這裡幫你準備了符合題目 A 規範的 10 筆代表性測試資料（包含各種高、中、低風險的組合）
    const seedData = [
        // 睡眠足、步數多、心情好 -> 預期低風險
        { date: '2026-06-01', sleep: 8.0, steps: 10000, mood: 8 },
        { date: '2026-06-02', sleep: 7.5, steps: 8500, mood: 7 },
        
        // 睡眠普通、步數普通、心情普通 -> 預期中風險
        { date: '2026-06-03', sleep: 6.5, steps: 5000, mood: 5 },
        { date: '2026-06-04', sleep: 6.0, steps: 4000, mood: 6 },
        
        // 嚴重睡眠不足、步數極少、心情極差 -> 預期高風險
        { date: '2026-06-05', sleep: 4.5, steps: 1500, mood: 2 },
        { date: '2026-06-06', sleep: 5.0, steps: 2000, mood: 3 },

        // 其他混合狀況（用來測試決策樹邊界）
        { date: '2026-06-07', sleep: 5.5, steps: 7000, mood: 6 },
        { date: '2026-06-08', sleep: 7.0, steps: 2500, mood: 4 },
        { date: '2026-06-09', sleep: 4.0, steps: 8000, mood: 5 },
        { date: '2026-06-10', sleep: 8.5, steps: 1200, mood: 3 }
    ];

    // 使用迴圈將資料一筆筆寫入，注意 risk_level 目前先留空(NULL)，之後由你的決策樹計算
    for (const log of seedData) {
        await db.run(
            `INSERT INTO health_logs (log_date, sleep_hours, steps, mood_score, risk_level) 
             VALUES (?, ?, ?, ?, NULL)`,
            [log.date, log.sleep, log.steps, log.mood]
        );
    }

    console.log("🎉 10 筆測試資料已成功寫入 database.db！");
    await db.close();
}

insertSeeds().catch(err => console.error("發生錯誤：", err));