  /*jshint esversion: 6 */
  /*
module.exports = class MyIndexedDb {

    setIndexedDb() {
        var idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var idbKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        const dbPromsie = idb.open('my-db', 1, upgradeDB => {
            upgradeDB.createObjectStore('cities');
        });

        var keyValStore = {
            get(key) {
                return dbPromise.then(db => {
                return db.transaction('cities')
                    .objectStore('cities').get(key);
                });
            },
            set(key, val) {
                return dbPromise.then(db => {
                const tx = db.transaction('cities', 'readwrite');
                tx.objectStore('cities').put(val, key);
                return tx.complete;
                });
            },
            delete(key) {
                return dbPromise.then(db => {
                const tx = db.transaction('cities', 'readwrite');
                tx.objectStore('cities').delete(key);
                return tx.complete;
                });
            },
            getAll(){
                return dbPromise.then(db => {
                    return db.transaction('cities')
                        .objectStore('cities').getAll();
                    });
            }
            // ,
            // add(dataRow) {
            //     return dbPromsie.then(db => {
            //         return db.transaction('cities', 'readwrite').objectStore('cities').add(dataRow).complete;

            //     });
            // }
        };
        return keyValStore;
    }
};
*/