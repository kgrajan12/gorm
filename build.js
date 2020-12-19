const {
  mkdirSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  unlinkSync,
} = require("fs");
const { getModel, getIndex } = require("./helper");
const SQL = require("./sql");

const model = {
  columns: {},
};

const build = (config) => {
  const sql = new SQL(config);

  const key = `Tables_in_${sql.dbConfig.database}`;

  sql.query("show tables").then((doc) => {
    const tables = doc.map((v) => v[key]);
    model.tables = tables;
    const promises = [];
    tables.forEach((table) => {
      promises.push(
        new Promise((res, rej) =>
          sql.query(`DESCRIBE ${table}`).then((doc) => {
            const columns = doc.map((v) => v.Field);
            model.columns[table] = columns;
            res(columns);
          })
        )
      );
    });
    Promise.all(promises).then(() => {
      sql.conn.end();
      if (existsSync("db")) {
        unlinkSync("db");
      }
      mkdirSync("db");
      writeFileSync("db/index.js", getIndex(model.tables));
      // writeFileSync("db/model.json", JSON.stringify(model));
      copyFileSync(__dirname + "/sql.js", "db/sql.js");
      writeFileSync("db/conn.json", JSON.stringify(sql.dbConfig));
      mkdirSync("db/model");
      model.tables.forEach((table) => {
        writeFileSync(
          `db/model/${table}.js`,
          getModel(table, model.columns[table])
        );
      });
    });
  });
};

exports.gen = build;
