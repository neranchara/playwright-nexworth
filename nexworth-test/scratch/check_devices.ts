import { devices } from '@playwright/test';
console.log(Object.keys(devices).filter(d => d.includes('iPhone')));
