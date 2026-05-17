const { devices } = require('@playwright/test');
console.log(Object.keys(devices).filter(d => d.includes('iPhone')));
