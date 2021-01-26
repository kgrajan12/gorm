const isValidElement = (elm) => elm != undefined && elm != null;

const isValidObject = (obj) => isValidElement(obj) && typeof obj == "object";

const camel = (str) => {
  const cam = [];
  let is_ = false;
  str.split("").forEach((val, key) => {
    if (val != "_") {
      cam.push(key == 0 || is_ ? val.toUpperCase() : val);
      is_ = false;
    } else {
      is_ = true;
    }
  });
  return cam.join("");
};

const strJoin = (arr, separator = [" AND "]) => {
  var _separator = Array.isArray(separator)
    ? separator
    : typeof separator == "string"
    ? [separator]
    : [" AND "];
  var str = [];
  var key = 0;
  arr.forEach((v, k) => {
    if (k > 0) {
      var val = _separator[key];
      if (!isValidElement(val)) {
        key = 0;
        val = _separator[key];
      }
      str.push(` ${val} `);
      key++;
    }
    str.push(v);
  });
  return str.join("");
};

const generateQuery = (type, config) => {
  let table,
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
    data;
  if (config) {
    table = config.table;
    columns = config.columns;
    where = config.where;
    like = config.like;
    orderBy = config.orderBy;
    join = config.join;
    on = config.on;
    joinBy = config.joinBy || ["AND"];
    whereBy = config.whereBy || ["AND"];
    joinOperator = config.joinOperator || ["="];
    whereOperator = config.whereOperator || ["="];
    joinType = config.joinType || "JOIN";
    data = config.data;
  }
  let query = "";
  switch (type) {
    case "SELECT":
      const column = columns == undefined ? "*" : columns.join(", ");
      query = `SELECT ${column} FROM ${table}`;
      if (isValidObject(join) && isValidObject(on)) {
        const joinConditions = [];
        Object.keys(on).forEach((val, key) =>
          joinConditions.push(
            `${val}${joinOperator[key % joinOperator.length]}${on[val]}`
          )
        );
        query += ` ${joinType} ${join._table} ON (${strJoin(
          joinConditions,
          joinBy
        )})`;
      }
      if (isValidObject(where) || isValidObject(like)) {
        const whereString = [];
        if (isValidObject(where)) {
          Object.keys(where).forEach((val, key) =>
            whereString.push(
              `${val}${whereOperator[key % whereOperator.length]}'${
                where[val]
              }'`
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
      return query;
    case "INSERT":
      return `INSERT INTO ${table} (${Object.keys(data).join(
        ", "
      )}) VALUES (${Object.values(data).join(", ")})`;
    case "UPDATE":
      query = `UPDATE ${table} SET `;
      Object.entries(data).forEach(([key, value]) => {
        query += `${key}='${value}', `;
      });
      query = query.slice(0, -2);
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
      return query;
    case "DELETE":
      query = `DELETE FROM ${table}`;
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
      return query;
    default:
      return type;
  }
};

module.exports = {
  generateQuery,
  strJoin,
  isValidObject,
  isValidElement,
  camel,
};
