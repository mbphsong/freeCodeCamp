function orbitalPeriod(arr) {
  var GM = 398600.4418;
  var earthRadius = 6367.4447;
  var orbArr = [];
  var calcPeriod = function(radius,GM) {
    return 2 * Math.PI * Math.pow(Math.pow(radius,3) / GM,0.5);
  };

  for (var i=0; i<arr.length; i++) {
    var satellite = arr[i];
    var orbPer = Math.round(calcPeriod(satellite.avgAlt + earthRadius,GM),0);
    orbArr.push({
        name: satellite.name,
        orbitalPeriod: orbPer,
    });
  }
  return orbArr;

}

console.log(orbitalPeriod([{name : "sputnik", avgAlt : 35873.5553}]));
console.log(orbitalPeriod([{name: "iss", avgAlt: 413.6}, {name: "hubble", avgAlt: 556.7}, {name: "moon", avgAlt: 378632.553}]));