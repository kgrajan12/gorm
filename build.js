const { exec } = require("child_process");
const {
  mkdirSync,
  writeFileSync,
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

  const key = `Tables_in_${sql._config.database}`;

  sql.query("show tables").then((doc) => {
    const tables = doc[0].map((v) => v[key]);
    model.tables = tables;
    const promises = [];
    tables.forEach((table) => {
      promises.push(
        new Promise((res, rej) =>
          sql.query(`DESCRIBE ${table}`).then((doc) => {
            const columns = doc[0].map((v) => v.Field);
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
      writeFileSync("db/conn.json", JSON.stringify(sql._config));
      mkdirSync("db/model");
      model.tables.forEach((table) => {
        writeFileSync(
          `db/model/${table}.js`,
          getModel(table, model.columns[table])
        );
      });
      exec('npm install --save @kgrajan12/orm');
    });
  });
};

exports.gen = build;
