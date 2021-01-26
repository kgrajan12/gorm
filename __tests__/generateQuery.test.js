const {
  generateQuery,
  strJoin,
  isValidObject,
  isValidElement,
  camel,
} = require("../src/generateQuery");

it("should join array of string with array of separators", () => {
  const strings = ["a", "b", "c", "d", "e"];
  const separators = [",", "-"];
  const joinedStr = strJoin(strings, separators);
  expect(strJoin(strings)).toBe('a  AND  b  AND  c  AND  d  AND  e');
  expect(joinedStr).toBe("a , b - c , d - e");
  expect(strJoin(strings, 'test')).toBe('a test b test c test d test e');
  expect(strJoin(strings, null)).toBe('a  AND  b  AND  c  AND  d  AND  e');
});

it("should show it is valid element or not", () => {
  expect(isValidElement(null)).toBe(false);
  expect(isValidElement(undefined)).toBe(false);
  expect(isValidElement(NaN)).toBe(true);
  expect(isValidElement(true)).toBe(true);
  expect(isValidElement(false)).toBe(true);
  expect(isValidElement(0)).toBe(true);
  expect(isValidElement(1)).toBe(true);
  expect(isValidElement("")).toBe(true);
  expect(isValidElement("test")).toBe(true);
  expect(isValidElement({})).toBe(true);
  expect(isValidElement([])).toBe(true);
  expect(isValidElement({ test: "test" })).toBe(true);
  expect(isValidElement([0, 1])).toBe(true);
});

it("should show it is valid object or not", () => {
  expect(isValidObject(null)).toBe(false);
  expect(isValidObject(undefined)).toBe(false);
  expect(isValidObject(NaN)).toBe(false);
  expect(isValidObject(true)).toBe(false);
  expect(isValidObject(false)).toBe(false);
  expect(isValidObject(0)).toBe(false);
  expect(isValidObject(1)).toBe(false);
  expect(isValidObject("")).toBe(false);
  expect(isValidObject("test")).toBe(false);
  expect(isValidObject({})).toBe(true);
  expect(isValidObject([])).toBe(true);
  expect(isValidObject({ test: "test" })).toBe(true);
  expect(isValidObject([0, 1])).toBe(true);
});

it("should convert text to camel case and it can be used as variables", () => {
  expect(camel("")).toBe("");
  expect(camel("t")).toBe("T");
  expect(camel("test")).toBe("Test");
  expect(camel("test ongoing")).toBe("Test ongoing");
  expect(camel("test_ongoing")).toBe("TestOngoing");
  expect(camel("test_ongoing")).not.toBe("Test Ongoing");
  expect(camel("test_ongoing")).not.toBe("Test ongoing");
  expect(camel("test_ongoing")).not.toBe("test ongoing");
  expect(camel("test_ongoing")).not.toBe("test Ongoing");
  expect(camel("test_ongoing")).not.toBe("testongoing");
  expect(camel("test_ongoing")).not.toBe("Testongoing");
  expect(camel("test_ongoing")).not.toBe("testOngoing");
});

it("should generate select query", () => {
  const table = "test_table";
  const columns = ["column1", "column2"];
  const where = {
    column1: "good",
  };
  const like = {
    column1: "% world",
  };
  const orderBy = [
    {
      column: "column1",
      asc: true,
    },
    {
      column: "column2",
      asc: false,
    },
  ];
  const join = {
    _table: "table1",
  };
  const on = {
    "table.column1": "table1.column2",
  };
  const joinBy = ["OR"];
  const joinOperator = ["!=", "="];
  const whereBy = ["OR"];
  const whereOperator = ["=", "!="];
  const data = {
      column1: 'good',
      column2: 'morning'
  }

  expect(generateQuery("SELECT", { table })).toBe("SELECT * FROM test_table");
  expect(generateQuery("SELECT", { table, columns })).toBe(
    "SELECT column1, column2 FROM test_table"
  );
  expect(generateQuery("SELECT", { table, columns, where })).toBe(
    "SELECT column1, column2 FROM test_table WHERE column1='good'"
  );
  expect(
    generateQuery("SELECT", {
      table,
      columns,
      where: { column1: "hello", column2: "world" },
    })
  ).toBe(
    "SELECT column1, column2 FROM test_table WHERE column1='hello' AND column2='world'"
  );
  expect(generateQuery("SELECT", { table, columns, like })).toBe(
    "SELECT column1, column2 FROM test_table WHERE column1 LIKE '% world'"
  );
  expect(generateQuery("SELECT", { table, columns, where, like })).toBe(
    "SELECT column1, column2 FROM test_table WHERE column1='good' AND column1 LIKE '% world'"
  );
  expect(
    generateQuery("SELECT", { table, columns, where, like, orderBy })
  ).toBe(
    "SELECT column1, column2 FROM test_table WHERE column1='good' AND column1 LIKE '% world' ORDER BY column1 ASC, column2 DESC"
  );
  expect(generateQuery("SELECT", { table, columns, join })).toBe(
    "SELECT column1, column2 FROM test_table"
  );
  expect(generateQuery("SELECT", { table, columns, join, on })).toBe(
    "SELECT column1, column2 FROM test_table JOIN table1 ON (table.column1=table1.column2)"
  );
  expect(
    generateQuery("SELECT", {
      table,
      columns,
      join,
      on: { ...on, "table.column2": "table1.column2" },
    })
  ).toBe(
    "SELECT column1, column2 FROM test_table JOIN table1 ON (table.column1=table1.column2 AND table.column2=table1.column2)"
  );
  expect(
    generateQuery("SELECT", {
      table,
      columns,
      join,
      on: { ...on, "table.column2": "table1.column2" },
      joinBy,
    })
  ).toBe(
    "SELECT column1, column2 FROM test_table JOIN table1 ON (table.column1=table1.column2 OR table.column2=table1.column2)"
  );
  expect(
    generateQuery("SELECT", {
      table,
      columns,
      join,
      on: { ...on, "table.column2": "table1.column2" },
      joinBy,
      joinOperator,
    })
  ).toBe(
    "SELECT column1, column2 FROM test_table JOIN table1 ON (table.column1!=table1.column2 OR table.column2=table1.column2)"
  );
  expect(
    generateQuery("SELECT", {
      table,
      columns,
      join,
      on,
      joinType: "INNER JOIN",
    })
  ).toBe(
    "SELECT column1, column2 FROM test_table INNER JOIN table1 ON (table.column1=table1.column2)"
  );
  expect(
    generateQuery("SELECT", {
      table,
      columns,
      where: { ...where, column2: "morning" },
      whereBy,
    })
  ).toBe(
    "SELECT column1, column2 FROM test_table WHERE column1='good' OR column2='morning'"
  );
  expect(
    generateQuery("SELECT", {
      table,
      columns,
      where: { ...where, column2: "morning" },
      whereBy,
      whereOperator,
    })
  ).toBe(
    "SELECT column1, column2 FROM test_table WHERE column1='good' OR column2!='morning'"
  );
    expect(generateQuery("INSERT", { table, data })).toBe("INSERT INTO test_table (column1, column2) VALUES (good, morning)");
    expect(generateQuery("UPDATE", { table, data })).toBe("UPDATE test_table SET column1='good', column2='morning'");
    expect(generateQuery("UPDATE", { table, data, where })).toBe("UPDATE test_table SET column1='good', column2='morning' WHERE column1='good'");
    expect(generateQuery("UPDATE", { table, data, like })).toBe("UPDATE test_table SET column1='good', column2='morning' WHERE column1 LIKE '% world'");
    expect(generateQuery("DELETE", { table })).toBe("DELETE FROM test_table");
    expect(generateQuery("DELETE", { table, where })).toBe("DELETE FROM test_table WHERE column1='good'");
    expect(generateQuery("DELETE", { table, like })).toBe("DELETE FROM test_table WHERE column1 LIKE '% world'");
    expect(generateQuery("TEST")).toBe("TEST");
  //   expect(generateQuery("SELECT", { table, columns })).toBe("");
  //   expect(generateQuery("SELECT", { table, columns })).toBe("");
  //   expect(generateQuery("SELECT", { table, columns })).toBe("");
});
