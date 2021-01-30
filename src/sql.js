const mysql = require('mysql2/promise');
const { isValidElement, generateQuery } = require("./generateQuery");

class SQL {
  constructor({ host, user, password, database }) {
    this._config = { host, user, password, database };
    this._columns = [];
    this._table = "";
    this._connWaitTime = 3000;
    this.hasConnection = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (isValidElement(this.conn)) {
          clearInterval(interval);
          resolve(true);
        }
      }, 1);
      setTimeout(() => {
        if (!isValidElement(this.conn)) {
          clearInterval(interval);
          resolve(false);
        }
      }, this._connWaitTime);
    });

    mysql
      .createConnection({ host, user, password, database })
      .then((conn) => {
        this.conn = conn;
      })
      .catch((err) => {
        this.err = err;
      });
  }
  async safe(cb) {
    if (await this.hasConnection) return cb();
    return {
      message: "failed to connect DB",
    };
  }
  getData() {
    const data = {};
    this._columns.forEach((col) => {
      console.log(col);
      data[col] = this[col];
    });
    return data;
  }
  async connect() {
    return await this.safe(() => this.conn.connect());
  }
  async pause() {
    return await this.safe(() => this.conn.pause());
  }
  async end() {
    return await this.safe(() => this.conn.end());
  }
  async select({
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
  } = {}) {
    return await this.query(
      generateQuery("SELECT", {
        table: this._table,
        columns,
        where,
        like,
        orderBy,
        join,
        on,
        joinBy,
        whereBy,
        joinOperator,
        whereOperator,
        joinType,
      })
    );
  }
  async insert({ data }) {
    return await this.query(generateQuery("INSERT", { data, table: this._table }));
  }
  async update({ data, where, like }) {
    return await this.query(
      generateQuery("UPDATE", { data, table: this._table, where, like })
    );
  }
  async delete({ where, like }) {
    return await this.query(generateQuery("DELETE", { table: this._table, where, like }));
  }
  async query(query) {
    const resp = await this.safe(() => this.conn.query(query));
    return resp[0] || resp;
  }
}

module.exports = SQL;