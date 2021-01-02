const SQL = require("../sql_old");
require("../node_modules/iconv-lite").encodingExists("foo");

// const sql = new SQL({
//     host: 't_host',
//     user: 't_user',
//     password: 't_password',
//     database: 't_database'
// });
const config = {
  host: "teknikgg.co.in",
  user: "remote",
  password: "pass",
  database: "qat",
};
const sql = new SQL(config);

afterAll(() => {
    sql.end().then(a => console.log(a)).catch(e => console.log(e));
});

it("should update db credentials to config", () => {
  expect(sql.dbConfig).toEqual(config);
});

it("should return initialized values to sql in column", () => {
    sql.tt = 'hello';
    sql.id = 't_id';
    sql.name = 't_name';
    sql.age = 't_age';
    sql.columns = ['id', 'name', 'age'];
    expect(sql.getData()).toEqual({
        id: 't_id',
        name: 't_name',
        age: 't_age'
    });
});