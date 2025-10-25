const express = require('express');
const { getDb } = require('./db');

// 创建一个测试用的Express app
const app = express();
app.use(express.json());

// 测试路由
app.get('/test-cards/:menuId', async (req, res) => {
  const db = getDb();

  try {
    console.log('Getting DB instance...');
    setTimeout(() => {
      const dbInstance = db.getDb();
      console.log('DB instance obtained:', dbInstance);

      const { subMenuId } = req.query;
      let query, params;

      if (subMenuId) {
        query = 'SELECT * FROM cards WHERE sub_menu_id = ? ORDER BY "order"';
        params = [subMenuId];
      } else {
        query = 'SELECT * FROM cards WHERE menu_id = ? AND sub_menu_id IS NULL ORDER BY "order"';
        params = [req.params.menuId];
      }

      console.log('Executing query:', query);
      console.log('With params:', params);

      const result = dbInstance.exec(query, params);
      console.log('Raw result:', result);

      if (!result || result.length === 0) {
        console.log('No results, returning empty array');
        return res.json([]);
      }

      const rows = result[0].values.map(row => {
        const obj = {};
        result[0].columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });

      console.log('Processed rows:', rows);

      rows.forEach(card => {
        if (!card.custom_logo_path) {
          card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
        } else {
          card.display_logo = '/uploads/' + card.custom_logo_path;
        }
      });

      console.log('Final rows with display_logo:', rows);
      res.json(rows);
    }, 1000);

  } catch (error) {
    console.error('Error in card processing:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 启动测试服务器
const testServer = app.listen(3001, () => {
  console.log('Test server running on port 3001');
});

// 测试端点
setTimeout(() => {
  const http = require('http');
  const req = http.request('http://localhost:3001/test-cards/1', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Test response:', data);
      testServer.close();
    });
  });
  req.end();
}, 2000);