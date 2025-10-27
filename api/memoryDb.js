/**
 * 内存数据库模拟器
 * 仅用于开发和未配置 Postgres 时的降级方案
 * ⚠️ 数据在服务器重启后会丢失
 */

const db = {
  menus: [],
  sub_menus: [],
  cards: [],
  users: [],
  ads: [],
  friends: [],
  _autoIncrement: {
    menus: 1,
    sub_menus: 1,
    cards: 1,
    users: 1,
    ads: 1,
    friends: 1
  }
};

// 模拟 Vercel Postgres 的 sql 标签函数
function sql(strings, ...values) {
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? `$${i + 1}` : '');
  }, '');
  
  return executeQuery(query, values);
}

// 为原始查询添加 query 方法
sql.query = function(query, params) {
  return executeQuery(query, params);
};

function executeQuery(query, params = []) {
  const upperQuery = query.toUpperCase().trim();
  
  try {
    // CREATE TABLE
    if (upperQuery.startsWith('CREATE TABLE')) {
      return Promise.resolve({ rows: [], rowCount: 0 });
    }
    
    // INSERT
    if (upperQuery.startsWith('INSERT INTO')) {
      return handleInsert(query, params);
    }
    
    // SELECT
    if (upperQuery.startsWith('SELECT')) {
      return handleSelect(query, params);
    }
    
    // UPDATE
    if (upperQuery.startsWith('UPDATE')) {
      return handleUpdate(query, params);
    }
    
    // DELETE
    if (upperQuery.startsWith('DELETE')) {
      return handleDelete(query, params);
    }
    
    return Promise.resolve({ rows: [], rowCount: 0 });
  } catch (error) {
    console.error('Memory DB Error:', error);
    return Promise.reject(error);
  }
}

function handleInsert(query, params) {
  const match = query.match(/INSERT INTO (\w+)/i);
  if (!match) return Promise.resolve({ rows: [], rowCount: 0 });
  
  const table = match[1];
  const id = db._autoIncrement[table]++;
  
  const values = [...params];
  const record = { id, ...parseValues(query, values) };
  
  db[table].push(record);
  
  const returning = query.match(/RETURNING (.*)/i);
  if (returning) {
    const fields = returning[1].split(',').map(f => f.trim());
    if (fields[0] === '*') {
      return Promise.resolve({ rows: [record], rowCount: 1 });
    } else {
      const result = {};
      fields.forEach(field => {
        result[field] = record[field];
      });
      return Promise.resolve({ rows: [result], rowCount: 1 });
    }
  }
  
  return Promise.resolve({ rows: [{ id }], rowCount: 1 });
}

function handleSelect(query, params) {
  const tableMatch = query.match(/FROM (\w+)/i);
  if (!tableMatch) return Promise.resolve({ rows: [], rowCount: 0 });
  
  const table = tableMatch[1];
  let results = [...(db[table] || [])];
  
  // WHERE clause
  const whereMatch = query.match(/WHERE (.+?)(?:ORDER BY|LIMIT|$)/i);
  if (whereMatch) {
    results = results.filter(row => evaluateWhere(whereMatch[1], row, params));
  }
  
  // ORDER BY
  const orderMatch = query.match(/ORDER BY (.+?)(?:LIMIT|$)/i);
  if (orderMatch) {
    const [field, direction = 'ASC'] = orderMatch[1].trim().split(/\s+/);
    results.sort((a, b) => {
      const aVal = a[field.replace(/"/g, '')];
      const bVal = b[field.replace(/"/g, '')];
      return direction.toUpperCase() === 'DESC' 
        ? (bVal > aVal ? 1 : -1)
        : (aVal > bVal ? 1 : -1);
    });
  }
  
  // LIMIT and OFFSET
  const limitMatch = query.match(/LIMIT (\d+)/i);
  const offsetMatch = query.match(/OFFSET (\d+)/i);
  if (limitMatch) {
    const limit = parseInt(limitMatch[1]);
    const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;
    results = results.slice(offset, offset + limit);
  }
  
  return Promise.resolve({ rows: results, rowCount: results.length });
}

function handleUpdate(query, params) {
  const tableMatch = query.match(/UPDATE (\w+)/i);
  if (!tableMatch) return Promise.resolve({ rows: [], rowCount: 0 });
  
  const table = tableMatch[1];
  const whereMatch = query.match(/WHERE (.+)$/i);
  
  let updated = 0;
  db[table] = db[table].map(row => {
    if (!whereMatch || evaluateWhere(whereMatch[1], row, params)) {
      updated++;
      return { ...row, ...parseUpdateValues(query, params) };
    }
    return row;
  });
  
  return Promise.resolve({ rows: [], rowCount: updated });
}

function handleDelete(query, params) {
  const tableMatch = query.match(/FROM (\w+)/i);
  if (!tableMatch) return Promise.resolve({ rows: [], rowCount: 0 });
  
  const table = tableMatch[1];
  const whereMatch = query.match(/WHERE (.+)$/i);
  
  const initialLength = db[table].length;
  db[table] = db[table].filter(row => {
    if (!whereMatch) return false;
    return !evaluateWhere(whereMatch[1], row, params);
  });
  
  const deleted = initialLength - db[table].length;
  return Promise.resolve({ rows: [], rowCount: deleted });
}

function parseValues(query, params) {
  // 简化实现：假设参数顺序对应 VALUES 中的顺序
  const columnMatch = query.match(/\(([^)]+)\)/);
  if (!columnMatch) return {};
  
  const columns = columnMatch[1].split(',').map(c => c.trim().replace(/"/g, ''));
  const result = {};
  
  columns.forEach((col, i) => {
    if (i < params.length) {
      result[col] = params[i];
    }
  });
  
  return result;
}

function parseUpdateValues(query, params) {
  const setMatch = query.match(/SET (.+?) WHERE/i);
  if (!setMatch) return {};
  
  const result = {};
  let paramIndex = 0;
  
  setMatch[1].split(',').forEach(assignment => {
    const [field] = assignment.trim().split('=');
    const cleanField = field.trim().replace(/"/g, '');
    result[cleanField] = params[paramIndex++];
  });
  
  return result;
}

function evaluateWhere(whereClause, row, params) {
  // 老王改进版：用严格比较，别tm用==这个憨批操作符！
  const conditions = whereClause.split(/\s+AND\s+|\s+OR\s+/i);
  const operators = whereClause.match(/\s+(AND|OR)\s+/gi) || [];

  let result = true;
  let paramIndex = 0;

  conditions.forEach((condition, i) => {
    const match = condition.match(/(\w+)\s*=\s*\$(\d+)/);
    if (match) {
      const field = match[1];
      const value = params[paramIndex++];

      // 艹！用===严格比较，不能让'1'等于1这种SB情况出现！
      const condResult = row[field] === value;

      if (i === 0) {
        result = condResult;
      } else {
        const op = operators[i - 1].trim().toUpperCase();
        result = op === 'AND' ? (result && condResult) : (result || condResult);
      }
    }
  });

  return result;
}

module.exports = { sql };