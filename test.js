const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
app.use(express.static(__dirname));

const wait = (ms) => new Promise(r => setTimeout(r, ms));

const server = app.listen(3000, async () => {
  console.log('Server started on http://localhost:3000');
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Capture console messages
    let hasErrors = false;
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
        if (!msg.text().includes('favicon.ico')) hasErrors = true;
      } else if (type === 'warning' || type === 'log') {
        console.log(`[BROWSER ${type.toUpperCase()}] ${msg.text()}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', err => {
      console.log(`[PAGE ERROR] ${err.toString()}`);
      hasErrors = true;
    });

    console.log('Navigating to http://localhost:3000/index.html...');
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
    
    console.log('Page loaded. Clicking "Sample Data" button...');
    await page.click('#btn-load-first-sample');
    await wait(2000); // wait for data loading

    console.log('Testing "Export to CSV" button...');
    await page.click('#btn-export-csv');
    await wait(1000);

    console.log('Testing "Drag & Drop" (checking if Sortable works)...');
    const hasSortable = await page.evaluate(() => {
      return typeof window.Sortable !== 'undefined' && document.getElementById('dashboard-active-content') !== null;
    });
    console.log(`Sortable available and target found: ${hasSortable}`);

    if (hasErrors) {
      console.log('Tests completed WITH ERRORS.');
    } else {
      console.log('Tests completed SUCCESSFULLY without JS errors.');
    }
    await browser.close();
  } catch (error) {
    console.error('Test script failed:', error);
  } finally {
    server.close();
    process.exit(0);
  }
});
