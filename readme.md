# gorm

This is a ORM and specially made for Mysql database.

## install CLI
install this orm cli first to initiate the setup
```sh
npm install -g @kgrajan12/orm
```

## initiate Models
After installing the gorm globally then then you can run a single command to initiate all the models of the database in current folder
```sh
gorm
```
**Note: Please confirm that you don't have any folder like `/db`**

### Folder structure
    - /current_folder
    |   - /db
        |   - /model
        |   |   - / <list of models>.js
        |   - /conn.json
        |   - /index.js
        |   - /sql.js

Now it is asking for database credentials.
Ater giving the database credentials it generate model codes for you in `/db/model`

#### Example code
From the root folder of project
```javascript
const { Village } = require('./db'); // Village is your table model

const village = new Village();

// select query
village.select({
    where: {
        region_id: 144,
        pin: 627111
    }
}).then((documents) => {
    <!--Do somthing with documents response-->
}).catch((error) => {
    console.log(error);
});
```

## Probs
### Select query props
| props | type | usage |
|-------|------|-------|
| table | `string` | Here you can set different table name to Model mostly it is not used. |
| columns | `array` | Here you can pass the list of columns to get that alone like `select pin, region_id from village` |
| where | `object` | Here you can set the condition to select query. |
| like | `object` | Here you can pass the pattern to select rows. |
| orderBy | `array` of `object` | Ex: `[{ column: 'pin', asc: true }]` you can pass like more objects to order column when select |
| join | `object of Model` | Here you can pass other object of Model. So that you can join two tables. |
| on | `object` | This is same like `where` prop but the only different is use of this prop. this is used to join tables with condition `{ "village.id": "people.village_id" }` that means join when id of village equals village_id of people. |
| joinBy | `array` | Here you can manage the operator between condition variables in `on` prop and it is iterativly used. ex: `['AND', 'OR']` first condition checked with `AND`, second condition is checked with `OR` and the next condition will use `AND` again |
| whereBy | `array` | same like `joinBy` but the only different is used to manage where conditions |
| joinOperator | `array` | same like `joinBy` itreation. but it is used to manage operators. ex: **village.id`=`people.village_id** you can pass here `=`, `<>`, `<=`, `>=` |
| whereOperator | `array` | same like joinOperator, To manage where operators |
| joinType | `string` | you can pass here the type of join `INNER JOIN`, `OUTTER JOIN` like that |
### Insert query props
| props | type | usage |
|-------|------|-------|
| data | `object` | ex: `{name: 'Teknik GG', village: 'Radhapuram'}` to insert `name` and `village` feilds. |
| table | `string` | Here you can set different table name to Model mostly it is not used. |
### Update query props
| props | type | usage |
|-------|------|-------|
| data | `object` | ex: `{name: 'Teknik GG', village: 'Radhapuram'}` to insert `name` and `village` feilds. |
| table | `string` | Here you can set different table name to Model mostly it is not used. |
| where | `object` | Here you can set the condition to select query. |
| like | `object` | Here you can pass the pattern to select rows. |
### Delete query props
| props | type | usage |
|-------|------|-------|
| table | `string` | Here you can set different table name to Model mostly it is not used. |
| where | `object` | Here you can set the condition to select query. |
| like | `object` | Here you can pass the pattern to select rows. |
