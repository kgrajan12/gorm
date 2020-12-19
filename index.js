#!/usr/bin/env node

const readline = require("readline");
const build = require("./build");

const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const config = {};

r1.question(`Database host: `, (ans) => {
  config.host = ans;
  r1.question(`Database user: `, (ans) => {
    config.user = ans;
    r1.question(`Database password: `, (ans) => {
      config.password = ans;
      r1.question(`Database name: `, (ans) => {
        config.database = ans;
        build.gen(config);
        r1.close();
      });
    });
  });
});