  /*jshint esversion: 6 */

  //import index db module
  // var idb = require('idb');
  //import * as idb from 'idb';
  var indexedDB = window.indexedDB || 
        window.webkitIndexedDB ||
        window.mozIndexedDB;
  if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.IDBTransaction || 
    window.webkitIDBTransaction || window.msIDBTransaction || 
    {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
    
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
    window.msIDBKeyRange;
  }
  var myDb = {};
  var dbName = "myIndexDb";
  var ctObjStore = "cities";
  var dbVersion = 3;

  myDb.indexedDB = {};
  myDb.indexedDB.db = null;

  var openRequest = indexedDB.open(dbName, dbVersion);

  openRequest.onsuccess = function(e) {
    console.log ("success open our DB: " + dbName);

    myDb.indexedDB.db = e.target.result;
    var db = myDb.indexedDB.db;
    
    console.log("in old hack checking for DB inside setVersion: " + db.version);
    if (db.version != dbVersion) {
      var req = db.setVersion(dbVersion);
      req.onsuccess = function () {
        if(db.objectStoreNames.contains(ctObjStore)) {
          db.deleteObjectStore(ctObjStore);
        }
        var store = db.createObjectStore(ctObjStore, 
            {keyPath: "name"});
        var tran = e.target.transaction;
        tran.oncomplete = function(e) {
          console.log("== oncomplete transaction ==");
          myDb.indexedDB.getAllItems();
        };
      };
    }
    else {
        var store = db.createObjectStore(ctObjStore, 
            {keyPath: "name"});
        var tran = e.target.transaction;
        tran.oncomplete = function(e) {
          console.log("== oncomplete transaction ==");
          myDb.indexedDB.getAllItems();
        };
    }
  };
  
  openRequest.onupgradeneeded = function(e) {
    console.log ("Going to upgrade our DB");
    myDb.indexedDB.db = e.target.result;
    var db = myDb.indexedDB.db;
    if(db.objectStoreNames.contains(ctObjStore)) {
      db.deleteObjectStore(ctObjStore);
    }
    var store = db.createObjectStore(ctObjStore,
                {keyPath: "name"});

    var tran = e.target.transaction;
    tran.oncomplete = function(e){
      myDb.indexedDB.getAllItems();
    };
  };

  openRequest.onfailure = myDb.indexedDB.onerror;
  openRequest.onerror = function(e) {
    console.error("Err:", e);
  };

  myDb.indexedDB.getAllItems = function() {
    var entities = [];
    var db = myDb.indexedDB.db;
    var trans = db.transaction([ctObjStore], "readwrite");
    var store = trans.objectStore(ctObjStore);
    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor();
    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      if(!!result === false)
        return entities;
      entities.push(result.value);
      result.continue();
    };
    myDb.indexedDB.onerror = function(){
      return null;
    };
  };

  var initialWeatherForecast = {  
    key: 'newyork',  
    label: 'New York, NY',  
    currently: {  
      time: 1453489481,  
      summary: 'Clear',  
      icon: 'partly-cloudy-day',  
      temperature: 52.74,  
      apparentTemperature: 74.34,  
      precipProbability: 0.20,  
      humidity: 0.77,  
      windBearing: 125,  
      windSpeed: 1.52  
      },  
    daily: {  
      data: [  
        {icon: 'clear-day', temperatureMax: 55, temperatureMin: 34},  
        {icon: 'rain', temperatureMax: 55, temperatureMin: 34},  
        {icon: 'snow', temperatureMax: 55, temperatureMin: 34},  
        {icon: 'sleet', temperatureMax: 55, temperatureMin: 34},  
        {icon: 'fog', temperatureMax: 55, temperatureMin: 34},  
        {icon: 'wind', temperatureMax: 55, temperatureMin: 34},  
        {icon: 'partly-cloudy-day', temperatureMax: 55, temperatureMin: 34}  
      ]  
    }  
  };
