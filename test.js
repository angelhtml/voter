const puppeteer = require('puppeteer');

async function automateWebsiteInteraction() {
  const websiteUrl = 'https://iranopasmigirim.com/fa'; // Replace with your URL
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting automation...');
    
    for (let i = 1; i <= 5; i++) {
      console.log(`\n=== Iteration ${i} ===`);
      
      // Step 1: Open website
      console.log('🌐 Opening website...');
      await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('body');
      await delay(2000);
      
      // Step 2: Click the button using correct selectors
      const buttonClicked = await clickButton(page, i);
      
      // Step 3: Clear cookies and storage
      console.log('🧹 Clearing cookies...');
      await clearCookies(page);
      
      // Wait before next iteration
      if (i < 5) {
        console.log('⏳ Waiting 3 seconds...');
        await delay(3000);
      }
    }
    
    console.log('\n✅ Automation completed!');
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
  } finally {
    await browser.close();
  }
}

async function clickButton(page, iteration) {
  const selectors = [
    // Most specific combinations first
    '.group.relative.bg-gradient-to-r.from-pahlavi-blue.to-pahlavi-green',
    '.px-12.py-5.rounded-full.bg-gradient-to-r',
    '.bg-gradient-to-r.from-pahlavi-blue',
    '.bg-gradient-to-r.to-pahlavi-green',
    '.group.relative.px-12.py-5',
    '.from-pahlavi-blue.to-pahlavi-green',
    '.px-12.py-5.rounded-full',
    '.bg-gradient-to-r.text-white',
    '.from-pahlavi-blue',
    '.to-pahlavi-green',
    '.bg-gradient-to-r',
    '.px-12.py-5',
    '.rounded-full',
    '[class*="pahlavi"]',
    'button.bg-gradient-to-r',
    'button:not([disabled])'
  ];

  for (const selector of selectors) {
    try {
      console.log(`   Trying: ${selector}`);
      
      // Wait for button to be visible
      await page.waitForSelector(selector, { 
        visible: true, 
        timeout: 5000 
      });
      
      // Check if button is clickable
      const isClickable = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element && 
               !element.disabled && 
               element.offsetParent !== null &&
               element.style.display !== 'none' &&
               element.style.visibility !== 'hidden';
      }, selector);
      
      if (!isClickable) {
        console.log(`   ⚠️  Button found but not clickable`);
        continue;
      }
      
      // Scroll to button
      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) element.scrollIntoView({ block: 'center' });
      }, selector);
      
      await delay(1000);
      
      // Click the button
      await page.click(selector);
      console.log(`   ✅ Successfully clicked with: ${selector}`);
      
      // Wait for action to complete
      await delay(3000);
      return true;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${selector}`);
      continue;
    }
  }
  
  console.log('❌ No button could be clicked');
  return false;
}

async function clearCookies(page) {
  try {
    const cookies = await page.cookies();
    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    console.log('   ✅ Cookies cleared');
  } catch (error) {
    console.log('   ⚠️  Error clearing cookies:', error.message);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the automation
automateWebsiteInteraction().catch(console.error);