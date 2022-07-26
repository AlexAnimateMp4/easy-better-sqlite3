const path = require(`path`);
const better_sqlite3 = require(`better-sqlite3`);
/**
* The easier and safer better-sqlite3 package.
* @param {Object} OPTIONS - The options of better-sqlite3.
* @param {String} OPTIONS.PATH - The database path.
* @param {Function} CALLBACK - The callback function.
* @returns {Object}
*/
module.exports = async (OPTIONS, CALLBACK) => await new Promise(async (resolve, reject) => {
    try {
        async function IS_STRING(VALUE, CALLBACK) {
            return await new Promise(async (resolve, reject) => {
                try {
                    return await resolve(typeof VALUE == `string` && await String(await VALUE).length > 0 ? true : false);
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            });
        };
        async function IS_JSON(VALUE, CALLBACK) {
            return await new Promise(async (resolve, reject) => {
                try {
                    if (typeof VALUE != `string`) VALUE = await JSON.stringify(await VALUE);
                    VALUE = await JSON.parse(await VALUE);
                    if (typeof VALUE == `object` && await VALUE != null && await Object.keys(await VALUE).length > 0) return await resolve(true);
                    else return await resolve(false);
                } catch (error) {
                    return await resolve(false);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            });
        };
        async function OBJECT_FILTER(DATA, CALLBACK) {
            return await new Promise(async (resolve, reject) => {
                try {
                    return await IS_JSON(await DATA, async OBJ => {
                        if (await OBJ.SUCCESS == true) {
                            if (await OBJ.VALUE == true && typeof DATA.VALUE == `object` && typeof DATA.FILTER == `function`) return await resolve(await Object.fromEntries(await Object.entries(await DATA.VALUE).filter(await DATA.FILTER)));
                            else return await resolve(undefined);
                        } else return await reject(await DATA.ERROR);
                    });
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else throw await error;
            });
        };
        let OPTS = await OPTIONS;
        if (await IS_JSON(await OPTS) == false) OPTS = Object({
            PATH: await OPTS
        });
        if (await IS_STRING(await OPTS.PATH) == false || await path.extname(await OPTS.PATH).length < 2) OPTS.PATH = `database.sqlite`;
        const DB = await new better_sqlite3(await path.resolve(await path.join(await OPTS.UNSAFE_PATH == true ? await __dirname : await process.cwd(), await OPTS.PATH)), await OBJECT_FILTER({
            VALUE: await OPTS,
            FILTER: ([key, value]) => key != `PATH`
        }));
        const EXPORT = {
            TABLE: {
                /**
                * Retrieves all tables from the database.
                * @param {Function} CALLBACK - The callback function.
                * @returns {Object}
                */
                ALL: async CALLBACK => await new Promise(async (resolve, reject) => {
                    try {
                        const all = await Object();
                        for await (const table of await DB.prepare(`SELECT name FROM sqlite_master`).all()) all[await table.name] = await EXPORT.TABLE.GET(await table.name);
                        return await resolve(await all);
                    } catch (error) {
                        return await reject(await error);
                    };
                }).then(async value => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: true,
                        VALUE: await value
                    });
                    else return await value;
                }).catch(async error => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: false,
                        ERROR: await error
                    });
                    else return await reject(await error);
                }),
                /**
                * Checks whether the given table exists or not.
                * @param {String} ID - The table id.
                * @param {Function} CALLBACK - The callback function.
                * @returns {Boolean}
                */
                HAS: async (ID, CALLBACK) => await new Promise(async (resolve, reject) => {
                    try {
                        if (await IS_STRING(await ID) == true) {
                            const table = await DB.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=(?)`).get(await ID);
                            if (await IS_JSON(await table) == true && await IS_STRING(await table.name) == true && await table.name == await ID && await isNaN(await Number(await DB.prepare(`SELECT VALUE FROM ${await table.name} WHERE ID = (?)`).get(`READ_ONLY`).VALUE)) == false) return await resolve(true);
                            else return await resolve(false);
                        } else return await resolve(false);
                    } catch (error) {
                        return await reject(await error);
                    };
                }).then(async value => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: true,
                        VALUE: await value
                    });
                    else return await value;
                }).catch(async error => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: false,
                        ERROR: await error
                    });
                    else return await reject(await error);
                }),
                /**
                * Indicates whether the table is read-only or not.
                * @param {String} ID - The table id.
                * @param {Function} CALLBACK - The callback function.
                * @returns {Boolean}
                */
                IS_READ_ONLY: async (ID, CALLBACK) => await new Promise(async (resolve, reject) => {
                    try {
                        return await EXPORT.TABLE.HAS(await ID, async HAS => {
                            if (await HAS.SUCCESS == true) {
                                if (await HAS.VALUE == true) return await resolve(await DB.prepare(`SELECT VALUE FROM ${await ID} WHERE ID = (?)`).get(`READ_ONLY`).VALUE == 1 ? true : false);
                                else return await resolve(false);
                            } else return await reject(await HAS.ERROR);
                        });
                    } catch (error) {
                        return await reject(await error);
                    };
                }).then(async value => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: true,
                        VALUE: await value
                    });
                    else return await value;
                }).catch(async error => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: false,
                        ERROR: await error
                    });
                    else return await reject(await error);
                }),
                /**
                * Retrieves values from the given table.
                * @param {String} ID - The table id.
                * @param {Function} CALLBACK - The callback function.
                * @returns {Object}
                */
                GET: async (ID, CALLBACK) => await new Promise(async (resolve, reject) => {
                    try {
                        return await EXPORT.ALL(await ID, async DATA => {
                            if (await DATA.SUCCESS == true) return await resolve(await DATA.VALUE);
                            else return await reject(await DATA.ERROR);
                        });
                    } catch (error) {
                        return await reject(await error);
                    };
                }).then(async value => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: true,
                        VALUE: await value
                    });
                    else return await value;
                }).catch(async error => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: false,
                        ERROR: await error
                    });
                    else return await reject(await error);
                }),
                /**
                * Create a table if it does not exist.
                * @param {Object} DATA
                * @param {String} DATA.ID - The table id.
                * @param {Boolean} DATA.READ_ONLY - Sets the table read-only or not.
                * @param {Function} CALLBACK - The callback function.
                * @returns {Boolean}
                */
                SET: async (DATA, CALLBACK) => await new Promise(async (resolve, reject) => {
                    try {
                        if (await IS_JSON(await DATA) == false) DATA = await Object({
                            ID: await DATA
                        });
                        return await EXPORT.TABLE.HAS(await DATA.ID, async HAS => {
                            if (await HAS.SUCCESS == true) {
                                if (await HAS.VALUE == true) return await resolve(true);
                                else if (await IS_STRING(await DATA.ID) == true) {
                                    await DB.prepare(`CREATE TABLE IF NOT EXISTS ${await DATA.ID} (ID TEXT, READ_ONLY INTEGER, VALUE TEXT)`).run();
                                    await DB.prepare(`INSERT INTO ${await DATA.ID} (ID,READ_ONLY,VALUE) VALUES (?,?,?)`).run(`READ_ONLY`, 1, await DATA.READ_ONLY == true ? 1 : 0);
                                    return await resolve(true);
                                } else return await resolve(false);
                            } else return await reject(await HAS.ERROR);
                        });
                    } catch (error) {
                        return await reject(await error);
                    };
                }).then(async value => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: true,
                        VALUE: await value
                    });
                    else return await value;
                }).catch(async error => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: false,
                        ERROR: await error
                    });
                    else return await reject(await error);
                }),
                /**
                * Delete a table.
                * @param {String} ID - The table id.
                * @param {Function} CALLBACK - The callback function.
                * @returns {Boolean}
                */
                DEL: async (ID, CALLBACK) => await new Promise(async (resolve, reject) => {
                    try {
                        return await EXPORT.TABLE.HAS(await ID, async DATA => {
                            if (await DATA.SUCCESS == true) {
                                if (await DATA.VALUE == true && await DB.prepare(`SELECT VALUE FROM ${await ID} WHERE ID = (?)`).get(`READ_ONLY`).VALUE == 0) {
                                    await DB.prepare(`DROP TABLE IF EXISTS ${await ID}`).run();
                                    return await resolve(true);
                                } else return await resolve(false);
                            } else return await reject(await DATA.ERROR);
                        });
                    } catch (error) {
                        return await reject(await error);
                    };
                }).then(async value => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: true,
                        VALUE: await value
                    });
                    else return await value;
                }).catch(async error => {
                    if (typeof CALLBACK == `function`) return await CALLBACK({
                        SUCCESS: false,
                        ERROR: await error
                    });
                    else return await reject(await error);
                })
            },
            /**
            * Retrieves values from the given table.
            * @param {String} TABLE - The table id.
            * @param {Function} CALLBACK - The callback function.
            * @returns {Object}
            */
            ALL: async (TABLE, CALLBACK) => await new Promise(async (resolve, reject) => {
                try {
                    return await EXPORT.TABLE.HAS(await TABLE, async DATA => {
                        if (await DATA.SUCCESS == true) {
                            const all = await Object();
                            if (await DATA.VALUE == true) {
                                for await (const row of await DB.prepare(`SELECT * FROM ${await TABLE} WHERE ID IS NOT NULL`).iterate()) {
                                    if (await row.ID != `READ_ONLY`) all[await row.ID] = await OBJECT_FILTER({
                                        VALUE: await row,
                                        FILTER: ([key, value]) => [`ID`, `READ_ONLY`].every(fil => key != fil) == true
                                    });
                                };
                                return await resolve(await all);
                            } else return await resolve(await all);
                        } else return await reject(await DATA.ERROR);
                    });
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            }),
            /**
            * Checks whether the given id exists or not.
            * @param {Object} DATA
            * @param {String} DATA.TABLE - The table id.
            * @param {String} DATA.ID - The id.
            * @param {Function} CALLBACK - The callback function.
            * @returns {Boolean}
            */
            HAS: async (DATA, CALLBACK) => await new Promise(async (resolve, reject) => {
                try {
                    if (await IS_JSON(await DATA) == true && await IS_STRING(await DATA.TABLE) == true && await IS_STRING(await DATA.ID) == true && await DATA.ID != `READ_ONLY`) return await EXPORT.TABLE.HAS(await DATA.TABLE, async HAS => {
                        if (await HAS.SUCCESS == true) {
                            if (await HAS.VALUE == true) {
                                const row = await DB.prepare(`SELECT * FROM ${await DATA.TABLE} WHERE ID = (?)`).get(await DATA.ID);
                                return await resolve(await IS_JSON(await row) == true && await IS_STRING(await row.ID) == true && await isNaN(await Number(await row.READ_ONLY)) == false && (await IS_STRING(await row.VALUE) == true || await isNaN(await Number(await row.VALUE)) == false || await Buffer.isBuffer(await row.VALUE) == true));
                            } else return await resolve(false);
                        } else return await reject(await HAS.ERROR);
                    });
                    else return await resolve(false);
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            }),
            /**
            * Indicates whether the id is read-only or not.
            * @param {Object} DATA
            * @param {String} DATA.TABLE - The table id.
            * @param {String} DATA.ID - The id.
            * @param {Function} CALLBACK - The callback function.
            * @returns {Boolean}
            */
            IS_READ_ONLY: async (DATA, CALLBACK) => await new Promise(async (resolve, reject) => {
                try {
                    if (await IS_JSON(await DATA) == true && await IS_STRING(await DATA.TABLE) == true && await IS_STRING(await DATA.ID) == true && await DATA.ID != `READ_ONLY`) return await EXPORT.HAS({
                        TABLE: await DATA.TABLE,
                        ID: await DATA.ID
                    }, async HAS => {
                        if (await HAS.SUCCESS == true) {
                            if (await HAS.VALUE == true) return await resolve(await DB.prepare(`SELECT READ_ONLY FROM ${await DATA.TABLE} WHERE ID = (?)`).get(await DATA.ID).READ_ONLY == 1 ? true : false);
                            else return await resolve(false);
                        } else return await reject(await HAS.ERROR);
                    });
                    else return await resolve(false);
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            }),
            /**
            * Retrieves the id of a given table.
            * @param {Object} DATA
            * @param {String} DATA.TABLE - The table id.
            * @param {String} DATA.ID - The id.
            * @param {Function} CALLBACK - The callback function.
            * @returns {any}
            */
            GET: async (DATA, CALLBACK) => await new Promise(async (resolve, reject) => {
                try {
                    if (await IS_JSON(await DATA) == true && await IS_STRING(await DATA.TABLE) == true && await IS_STRING(await DATA.ID) == true && await DATA.ID != `READ_ONLY`) return await EXPORT.HAS({
                        TABLE: await DATA.TABLE,
                        ID: await DATA.ID
                    }, async HAS => {
                        if (await HAS.SUCCESS == true) {
                            if (await HAS.VALUE == true) return await resolve(await DB.prepare(`SELECT VALUE FROM ${await DATA.TABLE} WHERE ID = (?)`).get(await DATA.ID).VALUE);
                            else return await resolve(undefined);
                        } else return await reject(await HAS.ERROR);
                    });
                    else return await resolve(undefined);
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            }),
            /**
            * Create or modify an id.
            * @param {Object} DATA
            * @param {String} DATA.TABLE - The table id.
            * @param {String} DATA.ID - The id.
            * @param {any} DATA.VALUE - The value of the id.
            * @param {Boolean} DATA.READ_ONLY - Sets the id as read-only or not.
            * @param {Function} CALLBACK - The callback function.
            * @returns {any}
            */
            SET: async (DATA, CALLBACK) => await new Promise(async (resolve, reject) => {
                try {
                    if (await IS_JSON(await DATA) == true && await IS_STRING(await DATA.TABLE) == true && await IS_STRING(await DATA.ID) == true && await DATA.ID != `READ_ONLY` && (await IS_STRING(await DATA.VALUE) == true || await isNaN(await Number(await DATA.VALUE)) == false || await Buffer.isBuffer(await DATA.VALUE) == true)) return await EXPORT.HAS({
                        TABLE: await DATA.TABLE,
                        ID: await DATA.ID
                    }, async HAS => {
                        if (await HAS.SUCCESS == true) {
                            if (await HAS.VALUE == true && await DB.prepare(`SELECT VALUE FROM ${await DATA.TABLE} WHERE ID = (?)`).get(`READ_ONLY`).VALUE == 0 && await DB.prepare(`SELECT READ_ONLY FROM ${await DATA.TABLE} WHERE ID = (?)`).get(await DATA.ID).READ_ONLY == 0) {
                                await DB.prepare(`UPDATE ${await DATA.TABLE} SET VALUE = (?) WHERE ID = (?)`).run(await DATA.VALUE, await DATA.ID);
                                return await resolve(await DB.prepare(`SELECT VALUE FROM ${await DATA.TABLE} WHERE ID = (?)`).get(await DATA.ID).VALUE);
                            } else if (await HAS.VALUE == false) {
                                if (typeof DATA.READ_ONLY != `boolean`) DATA.READ_ONLY = false;
                                await DB.prepare(`INSERT INTO ${await DATA.TABLE} (ID,READ_ONLY,VALUE) VALUES (?,?,?)`).run(await DATA.ID, await DATA.READ_ONLY == true ? 1 : 0, await DATA.VALUE);
                                return await resolve(await DB.prepare(`SELECT VALUE FROM ${await DATA.TABLE} WHERE ID = (?)`).get(await DATA.ID).VALUE);
                            } else return await resolve(undefined);
                        } else return await reject(await HAS.ERROR);
                    });
                    else return await resolve(undefined);
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            }),
            /**
            * Delete an id.
            * @param {Object} DATA
            * @param {String} DATA.TABLE - The table id.
            * @param {String} DATA.ID - The id.
            * @param {Function} CALLBACK - The callback function.
            * @returns {Boolean}
            */
            DEL: async (DATA, CALLBACK) => await new Promise(async (resolve, reject) => {
                try {
                    if (await IS_JSON(await DATA) == true && await IS_STRING(await DATA.TABLE) == true && await IS_STRING(await DATA.ID) == true && await DATA.ID != `READ_ONLY`) return await EXPORT.HAS({
                        TABLE: await DATA.TABLE,
                        ID: await DATA.ID
                    }, async HAS => {
                        if (await HAS.SUCCESS == true) {
                            if (await HAS.VALUE == true && await DB.prepare(`SELECT VALUE FROM ${await DATA.TABLE} WHERE ID = (?)`).get(`READ_ONLY`).VALUE == 0 && await DB.prepare(`SELECT READ_ONLY FROM ${await DATA.TABLE} WHERE ID = (?)`).get(await DATA.ID).READ_ONLY == 0) {
                                await DB.prepare(`DELETE FROM ${await DATA.TABLE} WHERE ID = (?)`).run(await DATA.ID);
                                return await resolve(true);
                            } else return await resolve(false);
                        } else return await reject(await HAS.ERROR);
                    });
                    else return await resolve(false);
                } catch (error) {
                    return await reject(await error);
                };
            }).then(async value => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: true,
                    VALUE: await value
                });
                else return await value;
            }).catch(async error => {
                if (typeof CALLBACK == `function`) return await CALLBACK({
                    SUCCESS: false,
                    ERROR: await error
                });
                else return await reject(await error);
            })
        };
        return await resolve(await EXPORT);
    } catch (error) {
        return await reject(await error);
    };
}).then(async value => {
    if (typeof OPTIONS == `function`) return await OPTIONS({
        SUCCESS: true,
        VALUE: await value
    });
    else if (typeof CALLBACK == `function`) return await CALLBACK({
        SUCCESS: true,
        VALUE: await value
    });
    else return await value;
}).catch(async error => {
    if (typeof OPTIONS == `function`) return await OPTIONS({
        SUCCESS: false,
        ERROR: await error
    });
    else if (typeof CALLBACK == `function`) return await CALLBACK({
        SUCCESS: false,
        ERROR: await error
    });
    else throw await error;
});