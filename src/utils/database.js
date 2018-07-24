const Sqlite = require("nativescript-sqlite");

let Singleton = (function () {
  let instance;

  function createInstance() {

    let db_promise = new Sqlite("corpotur.db", function (err, db) {
      if (err) {

        console.error("We failed to open database", err);

      } else {

        //db.execSQL('DROP TABLE codes')
        db.execSQL("CREATE TABLE IF NOT EXISTS codes (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, added_at TEXT, validated BOOLEAN) ", function () { })

      }
    });

    return db_promise;

  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

export default Singleton;