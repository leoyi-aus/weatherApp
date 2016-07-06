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
          app.initialLoad();
        };
      };
    }
    else {
        console.log("== oncomplete transaction ==");
        app.initialLoad();
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
      app.initialLoad();
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
  
  //ADD ITEM TO TABLE
  myDb.indexedDB.addItem = function(city) {
    var db = myDb.indexedDB.db;
    var trans = db.transaction([ctObjStore], "readwrite");
    var store = trans.objectStore(ctObjStore);
    var data = {
      "name": city.name,
      "label": city.label
    };
    var request = store.put(data);
    request.onsuccess = function(e) {
     console.error("Success Adding an item: ", e);
    };
    request.onerror = function(e) {
      console.error("Error Adding an item: ", e);
    };
  };

  //DELETE ITEM FROM TABLE
  myDb.indexedDB.deleteItem = function(id) {
    var db = myDb.indexedDB.db;
    var trans = db.transaction([ctObjStore], "readwrite");
    var store = trans.objectStore(ctObjStore);
    var request = store.delete(id);
    request.onsuccess = function(e) {
      console.error("Success deleteing: ", e);
    };
    request.onerror = function(e) {
      console.error("Error deleteing: ", e);
    };
  };

  //GET ITEM FROM TABLE
  myDb.indexedDB.getItem = function(name){
    var db = myDb.indexedDB.db;
    var trans = db.transaction([ctObjStore], "readwrite");
    var store = trans.objectStore(ctObjStore);

    var request = store.get(name);
     request.onsuccess = function(e){
      return e.result;
     };

     request.onerror = function(e){
       console.error("Error getting item: ", e);
     };
  };
  
  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
  
  app.initialLoad = function(){
    app.selectedCities =  myDb.indexedDB.getAllItems();
    if (app.selectedCities) {
      app.selectedCities = JSON.parse(app.selectedCities);
      app.selectedCities.forEach(function(city) {
        app.getForecast(city.name, city.label);
      });
    } else {
      app.updateForecastCard(initialWeatherForecast);
      app.selectedCities = [
        {name: initialWeatherForecast.key, label: initialWeatherForecast.label}
      ];
      app.saveSelectedCities();
    }
  }; 
  
  // Save list of cities to localStorage, see note below about localStorage.
  app.saveSelectedCities = function() {
    var selectedCities = app.selectedCities;
    
    selectedCities.forEach(function(city) {
        if (!myDb.indexedDB.getItem(city['name'])) {
        myDb.indexedDB.addItem(city);
      }
      });   
    // IMPORTANT: See notes about use of localStorage.
    // --- REMOVED 
    //localStorage.selectedCities = selectedCities;
  };
  
  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {
    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }
    card.querySelector('.description').textContent = data.currently.summary;
    card.querySelector('.date').textContent =
      new Date(data.currently.time * 1000);
    card.querySelector('.current .icon').classList.add(data.currently.icon);
    card.querySelector('.current .temperature .value').textContent =
      Math.round(data.currently.temperature);
    card.querySelector('.current .feels-like .value').textContent =
      Math.round(data.currently.apparentTemperature);
    card.querySelector('.current .precip').textContent =
      Math.round(data.currently.precipProbability * 100) + '%';
    card.querySelector('.current .humidity').textContent =
      Math.round(data.currently.humidity * 100) + '%';
    card.querySelector('.current .wind .value').textContent =
      Math.round(data.currently.windSpeed);
    card.querySelector('.current .wind .direction').textContent =
      data.currently.windBearing;
    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.daily.data[i];
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i + today) % 7];
        nextDay.querySelector('.icon').classList.add(daily.icon);
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(daily.temperatureMax);
        nextDay.querySelector('.temp-low .value').textContent =
          Math.round(daily.temperatureMin);
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };
  
  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
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
