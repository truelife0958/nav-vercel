const db = require('./db');

setTimeout(() => {
  const dbInstance = db.getDb();
  try {
    const result = dbInstance.exec('SELECT * FROM cards WHERE menu_id = ? ORDER BY "order"', [1]);
    console.log('Test query result:', result);
    if (!result || result.length === 0) {
      console.log('No results found');
      return;
    }
    const rows = result[0].values.map(row => {
      const obj = {};
      result[0].columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
    console.log('Processed rows:', rows);

    // Test logo processing
    rows.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    console.log('Rows with display_logo:', rows);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}, 1000);