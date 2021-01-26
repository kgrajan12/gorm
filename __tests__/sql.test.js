const SQL = require('../src/sql');

it('should set config', async () => {
    const sql1 = new SQL({
        host:'teknikgg.co.in',
        user: 'remote',
        password:'pass',
        database:'qat'
    });
    const sql2 = new SQL({
        host:'test',
        user: 'test',
        password:'test',
        database:'test'
    });
    sql1._columns = ['col1', 'col2', 'col3'];
    sql2._columns = sql1._columns;
    sql1.col1 = 'test1';
    sql1.col2 = 'test2';
    sql2.col2 = 'test2';
    sql2.col3 = 'test3';
    // let data1, data2;
    const cb = {
        cb: () => console.log('test')
    };
    const spyCB = spyOn(cb, 'cb');
    // const spy_getData1 = spyOn(sql1, 'getData');
    // const spy_getData2 = spyOn(sql2, 'getData');
    sql1.safe(cb.cb);
    sql2.safe(cb.cb);
    // await sql1.safe(() => {
    //     data1 = sql1.getData();
    // });
    // const data1 = sql1.getData();
    // data2 = sql2.getData();
    expect(await sql1.hasConnection).toBeTruthy();
    expect(await sql2.hasConnection).toBeFalsy();
    expect(spyCB).toBeCalledTimes(1);
    // expect(spy_getData1).toBeCalledTimes(1);
    // expect(spy_getData2).toBeCalledTimes(1);
    // expect(data1).toEqual();
    // expect(data2).toEqual();
});