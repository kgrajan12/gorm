const mysql = require("mysql");

const sqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};
const isValidElement = (elm) => elm != undefined && elm != null;
const isValidObject = (obj) => isValidElement(obj) && typeof obj == "object";
const strJoin = (arr, separator) => {
  var str = [];
  var key = 0;
  arr.forEach((v, k) => {
    if (k > 0) {
      var val = separator[key];
      if (val == undefined) {
        key = 0;
        val = separator[key];
      }
      str.push(` ${val} `);
      key++;
    }
    str.push(v);
  });
  return str.join("");
};

class SQL {
  constructor(config) {
    if (isValidElement(config)) {
      this.updateDBConfig(config);
    } else {
      this.updateDBConfig(sqlConfig);
    }
    this.table = "";
    this.columns = [];
  }
  getData() {
    const data = {};
    this.columns.forEach((col) => {
      data[col] = this[col];
    });
  }
  updateDBConfig({ host, user, password, database }) {
    this.dbConfig = { ...this.dbConfig, ...{ host, user, password, database } };
    this.conn = mysql.createConnection(this.dbConfig);
  }
  connect() {
    console.log(this.conn.state);
    if (this.conn.state != "authenticated") this.conn.connect();
  }
  getTable(table) {
    return isValidElement(table) ? table : this.table;
  }
  pause() {
    this.conn.pause();
  }
  resume() {
    this.conn.resume();
  }
  end() {
    // this.conn.end();
  }
  select(
    {
      table,
      columns,
      where,
      like,
      orderBy,
      join,
      on,
      joinBy = ["AND"],
      whereBy = ["AND"],
      joinOperator = ["="],
      whereOperator = ["="],
      joinType = "JOIN",
    },
    end = true
  ) {
    this.connect();
    const column = columns == undefined ? "*" : columns.join(", ");
    let query = `SELECT ${column} FROM ${this.getTable(table)}`;
    if (isValidObject(join) && isValidObject(on)) {
      const joinConditions = [];
      if (isValidObject(on)) {
        Object.keys(on).forEach((val, key) =>
          joinConditions.push(
            `${val}${joinOperator[key % joinOperator.length]}${on[val]}`
          )
        );
      }
      query += ` ${joinType} ${join.table} ON (${strJoin(
        joinConditions,
        joinBy
      )})`;
    }
    if (isValidObject(where) || isValidObject(like)) {
      const whereString = [];
      if (isValidObject(where)) {
        Object.keys(where).forEach((val, key) =>
          whereString.push(
            `${val}${whereOperator[key % whereOperator.length]}'${where[val]}'`
          )
        );
      }
      if (isValidObject(like)) {
        Object.keys(like).forEach((val) =>
          whereString.push(`${val} LIKE '${like[val]}'`)
        );
      }
      query += ` WHERE ${strJoin(whereString, whereBy)}`;
    }
    if (isValidObject(orderBy)) {
      query +=
        " ORDER BY " +
        orderBy
          .map((val) => `${val.column} ${val.asc ? "ASC" : "DESC"}`)
          .join(", ");
    }
    return new Promise((resolve, reject) => {
      this.conn.query(query, (e, r) => {
        if (end) this.end();
        if (e == null) {
          resolve(r);
        } else {
          reject(e);
        }
      });
    });
  }
  insert({ data, table }, end = true) {
    this.connect();
    return new Promise((resolve, reject) => {
      this.conn.query(
        `INSERT INTO ${this.getTable(table)} SET ?`,
        isValidElement(data) ? data : this.getData(),
        (e, r) => {
          if (end) this.end();
          if (e == null) {
            resolve(r);
          } else {
            reject(e);
          }
        }
      );
    });
  }
  update({ data, table, where, like }, end = true) {
    this.connect();
    let query = `UPDATE ${this.getTable(table)} SET ?`;
    if (where != undefined || like != undefined) {
      const whereString = [];
      if (where != undefined) {
        Object.keys(where).forEach((val) =>
          whereString.push(`${val}='${where[val]}'`)
        );
      }
      if (like != undefined) {
        Object.keys(like).forEach((val) =>
          whereString.push(`${val} LIKE '${like[val]}'`)
        );
      }
      query += ` WHERE ${whereString.join(" AND ")}`;
    }
    return new Promise((resolve, reject) => {
      this.conn.query(query, data, (e, r) => {
        if (end) this.end();
        if (e == null) {
          resolve(r);
        } else {
          reject(e);
        }
      });
    });
  }
  delete({ table, where, like }, end = true) {
    this.connect();
    let query = `DELETE FROM ${this.getTable(table)}`;
    if (where != undefined || like != undefined) {
      const whereString = [];
      if (where != undefined) {
        Object.keys(where).forEach((val) =>
          whereString.push(`${val}='${where[val]}'`)
        );
      }
      if (like != undefined) {
        Object.keys(like).forEach((val) =>
          whereString.push(`${val} LIKE '${like[val]}'`)
        );
      }
      query += ` WHERE ${whereString.join(" AND ")}`;
    }
    return new Promise((resolve, reject) => {
      this.conn.query(query, (e, r) => {
        if (end) this.end();
        if (e == null) {
          resolve(r);
        } else {
          reject(e);
        }
      });
    });
  }
  query(query, end = true) {
    return new Promise((resolve, reject) => {
      this.conn.query(query, (e, r) => {
        if (end) this.end();
        if (e == null) {
          resolve(r);
        } else {
          reject(e);
        }
      });
    });
  }
}

module.exports = SQL;
