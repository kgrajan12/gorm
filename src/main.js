import arg from "arg";
import chalk from "chalk";
import inquirer from "inquirer";
import Listr from "listr";
import Mustache from 'mustache';
import fs from 'fs';
import { camel } from "./generateQuery";
import SQL from "./sql";
import execa from "execa";

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
        {
            '--default': Boolean,
            '--host': String,
            '--user': String,
            '--password': String,
            '--database': String,
            '-d': '--default',
            '-h': '--host',
            '-u': '--user',
            '-p': '--password',
            '-db': '--database'
        },
        {
            argv: rawArgs.slice(2)
        }
    );
    return {
        default: args["--default"] || false,
        host: args["--host"],
        user: args["--user"],
        password: args["--password"],
        database: args["--database"]
    };
}


async function promptForMissingOptions(options) {
    const config = {
        host: '127.0.0.1',
        user: 'root',
        password: ''
    };
    const questions = [];
    if(options.default) {
        return config;
    }
    if(!options.host) {
        questions.push({
            type: 'input',
            name: 'host',
            message: 'Please enter the sql server host:'
        });
    }
    if(!options.user) {
        questions.push({
            type: 'input',
            name: 'user',
            message: 'Please enter the sql server username:'
        });
    }
    if(!options.password) {
        questions.push({
            type: 'password',
            name: 'password',
            message: 'Please enter the sql server password:'
        });
    }
    const answers = await inquirer.prompt(questions);
    return {
        ...config,
        ...options,
        ...answers
    };
}

async function connectDatabase(options) {
    const sql = new SQL(options);
    const hasConnection = await sql.hasConnection;
    if(hasConnection) {
        return sql;
    } else {
        return Promise.reject(new Error(sql.err));
    }
}

async function selectDatabase(sql) {
    const dbs = await sql.query('show databases');
    const answers = await inquirer.prompt([
        {
            type: 'list',
            choices: dbs.map(record => record.Database),
            name: 'database',
            message: 'Please select the database name:'
        }
    ]);
    await sql.query(`use ${answers.database}`);
    return answers.database;
}

async function retrieveModalData(sql, options) {
    let promises, data = {};
    const key = `Tables_in_${options.database}`;
    const res = await sql.query('show tables');
    const tables = res.map((v) => v[key]);
    promises = tables.map(table => {
        return sql.query(`DESCRIBE ${table}`).then(doc => {
            const columns = doc.map((v) => v.Field);
            data[table] = columns;
        })
    });
    await Promise.all(promises);
    return data;
}

function generateCode(path, data) {
    function ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }

    ensureDir('db');
    ensureDir('db/model');
    if(fs.existsSync(path)) {
        fs.unlinkSync('db/' + path);
    }
    fs.writeFileSync('db/' + path, data);
    return;
}

function readTemplate(file) {
    return fs.readFileSync(__filename.slice(0, -11) + 'template/' + file + '.mustache', 'utf-8');
}

async function buildModal({ data, db }) {
    const cam = [], promises = [];
    const connTemplate = readTemplate('conn.json');
    const indexTemplate = readTemplate('index.js');
    const modelTemplate = readTemplate('model.js');
    const conn = Mustache.render(connTemplate, db);
    generateCode('conn.json', conn);
    Object.entries(data).forEach(([key, value]) => {
        const cls = camel(key);
        cam.push({
            class: cls,
            model: key
        });
        const field = value.map(name => ({ name }));
        const modelData = {
            class: cls,
            model: key,
            field
        };
        const model = Mustache.render(modelTemplate, modelData);
        generateCode(`model/${key}.js`, model);
    });
    const index = Mustache.render(indexTemplate, { cam });
    generateCode('index.js', index);
    return true;
}

async function create(options) {
    let sql, dbData;
    const task_set_1 = new Listr([
        {
            title: 'Connecting server',
            task: async () => {
                sql = await connectDatabase(options);
                return sql;
            }
        }
    ]);
    const task_set_2 = new Listr([
        {
            title: 'Retrieving modal data',
            task: async () => {
                dbData = await retrieveModalData(sql, options)
                return dbData;
            }
        },
        {
            title: 'Build models',
            task: () => buildModal({
                data: dbData,
                db: {
                    host: options.host,
                    user: options.user,
                    password: options.password,
                    database: options.database
                }
            })
        },
        {
            title: 'Install Packages',
            task: () => execa('npm', ['install', '@kgrajan12/orm'])
        }
    ]);

    await task_set_1.run();
    options.database = await selectDatabase(sql);
    await task_set_2.run();
    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    return await create(options).then((res) => {
        if(res) {
            process.exit(0);
        }
    }).catch(err => {
        console.error(chalk.red.bold('ERROR'), err);
        process.exit(1);
    });
}