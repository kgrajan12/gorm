const cam = str => {
    const cam = [];
    let is_ = false;
    str.split('').forEach((val, key) => {
        if(val != '_') {
            cam.push(key == 0 || is_ ? val.toUpperCase() : val);
            is_ = false;
        } else {
            is_ = true;
        }
    });
    return cam.join('');
}

// const getConn = (config) => `const SQL = require('./sql');

// module.exports = new SQL({
//     ${Object.keys(config).map(v => `${v}: '${config[v]}'`).join(',\n\t')}
// });`;

const getModel = (table, columns) => `const SQL = require('@kgrajan12/orm');

class ${cam(table)} extends SQL {
    constructor(props) {
        super(require('../conn.json'));
        if(props != undefined) {
            ${columns.map(col => `this.${col} = props.${col};`).join('\n\t\t\t')}
        }
        
        this._columns = ${JSON.stringify(columns)}
        this._table = '${table}';
    }
}

module.exports = ${cam(table)};`;

const getIndex = (tables) => `module.exports = {
    ${tables.map(table => `${cam(table)}: require('./model/${table}')`).join(',\n\t')}
};`;

module.exports = {
    // getConn,
    getModel,
    getIndex
};