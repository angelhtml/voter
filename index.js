const express = require('express')
const puppeteer = require('puppeteer');
const app = express()
const port = 3000






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/run', (req, res) => {
  automateWebsiteInteraction()
  res.send('start!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})















async function automateWebsiteInteraction() {
  const websiteUrl = 'https://iranopasmigirim.com/fa'; // Replace with your URL
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting automation...');
    
    for (let i = 1; i <= 10000; i++) {
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
        await delay(1000);
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
        timeout: 1000 
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

      // Step 2: Get number with Persian number handling
      const numberBefore = await getNumberFromPage(page);
      console.log(`📊 Number before click: ${numberBefore !== null ? numberBefore.toLocaleString() : 'NOT FOUND'}`);
      
      await delay(1000);
      
      // Click the button
      await page.click(selector);
      console.log(`   ✅ Successfully clicked with: ${selector}`);
      
      // Wait for action to complete
      await delay(1000);

      // Get number after click
        const numberAfter = await getNumberFromPage(page);
        console.log(`📊 Number after click: ${numberAfter !== null ? numberAfter.toLocaleString() : 'NOT FOUND'}`);

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








/**
 * Convert Persian/Arabic numbers to Western numbers
 */
function convertPersianToWestern(text) {
  if (!text) return null;
  
  // Persian/Arabic to Western number mapping
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let westernText = text;
  
  // Replace Persian numbers
  persianNumbers.forEach((persianNum, index) => {
    const regex = new RegExp(persianNum, 'g');
    westernText = westernText.replace(regex, index.toString());
  });
  
  // Replace Arabic numbers
  arabicNumbers.forEach((arabicNum, index) => {
    const regex = new RegExp(arabicNum, 'g');
    westernText = westernText.replace(regex, index.toString());
  });
  
  // Remove any non-digit characters except minus sign
  westernText = westernText.replace(/[^\d-]/g, '');
  
  return westernText;
}

/**
 * Extract number from the specific span element
 */
async function getNumberFromPage(page) {
  try {
    // More specific selector targeting the exact structure
    const selectors = [
      // Target the specific span with Persian numbers
      'span.text-3xl.font-bold.bg-gradient-to-r.from-pahlavi-blue.to-pahlavi-green.bg-clip-text.text-transparent',
      
      // Alternative selectors based on the parent structure
      '.flex.items-baseline.gap-2 span.text-3xl',
      '.text-center .flex.items-baseline span',
      '[class*="pahlavi-blue"][class*="pahlavi-green"]',
      '.bg-clip-text.text-transparent'
    ];
    
    for (const selector of selectors) {
      try {
        console.log(`   Trying selector: ${selector}`);
        
        await page.waitForSelector(selector, { timeout: 3000 });
        
        const numberText = await page.$eval(selector, el => el.textContent.trim());
        console.log(`   Raw text: "${numberText}"`);
        
        if (numberText) {
          // Convert Persian/Arabic numbers to Western
          const westernNumber = convertPersianToWestern(numberText);
          console.log(`   Converted to Western: "${westernNumber}"`);
          
          if (westernNumber) {
            const number = parseInt(westernNumber);
            if (!isNaN(number)) {
              console.log(`   ✅ Found number: ${number}`);
              return number;
            }
          }
        }
      } catch (error) {
        // Try next selector
        continue;
      }
    }
    
    // Fallback: search for any element containing Persian numbers
    console.log('   🔍 Performing Persian number search...');
    const persianNumber = await page.evaluate(() => {
      // Look for elements that might contain Persian numbers
      const numberElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const text = el.textContent.trim();
          // Check for Persian/Arabic numerals
          return /[۰-۹٠-٩]/.test(text) && /\d/.test(text.replace(/[^۰-۹٠-٩]/g, ''));
        })
        .map(el => ({
          text: el.textContent.trim(),
          tag: el.tagName,
          classes: el.className
        }));
      
      return numberElements.length > 0 ? numberElements[0].text : null;
    });
    
    if (persianNumber) {
      console.log(`   Found Persian number: "${persianNumber}"`);
      const westernNumber = convertPersianToWestern(persianNumber);
      const number = parseInt(westernNumber);
      if (!isNaN(number)) {
        console.log(`   ✅ Converted number: ${number}`);
        return number;
      }
    }
    
    console.log('   ❌ Could not find number');
    return null;
    
  } catch (error) {
    console.log('   ❌ Error getting number:', error.message);
    return null;
  }
}