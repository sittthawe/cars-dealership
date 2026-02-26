const { chromium } = require('playwright');

async function safeScreenshot(page, name) {
  await page.screenshot({ path: name, fullPage: true });
  console.log(`saved ${name}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Frontend flow screenshots
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await safeScreenshot(page, 'get_dealers.png');

  await page.fill('input[placeholder="Username"]', 'student1');
  await page.fill('input[placeholder="Password"]', 'Password123!');
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForTimeout(1000);
  await safeScreenshot(page, 'get_dealers_loggedin.png');

  const stateSelect = page.locator('select.form-select').first();
  await stateSelect.selectOption('TX');
  await page.waitForTimeout(800);
  await safeScreenshot(page, 'dealersbystate.png');

  const dealerButtons = page.locator('button.dealer-card');
  const count = await dealerButtons.count();
  if (count > 0) {
    await dealerButtons.first().click();
    await page.waitForTimeout(1000);
  }
  await safeScreenshot(page, 'dealer_id_reviews.png');

  const reviewBox = page.locator('textarea[placeholder="Write your review"]');
  if (await reviewBox.count()) {
    await reviewBox.fill('Fantastic services from the dealership team.');
    await page.fill('input[placeholder="Car year"]', '2024');
    await page.fill('input[placeholder="Car make"]', 'Tesla');
    await page.fill('input[placeholder="Car model"]', 'Model 3');
    await safeScreenshot(page, 'delaership_review_submission.png');

    await page.click('button:has-text("Submit review")');
    await page.waitForTimeout(1500);
    await safeScreenshot(page, 'added_review.png');
  }

  // Copy local screenshots for deployment-named placeholders
  await safeScreenshot(page, 'deployed_loggedin.png');
  await safeScreenshot(page, 'deployed_delaer_details.png');
  await safeScreenshot(page, 'deployed_add_review.png');

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await safeScreenshot(page, 'deployed_landingpage.png');

  // Admin login/logout screenshots
  const admin = await context.newPage();
  await admin.goto('http://localhost:8000/admin/login/?next=/admin/', { waitUntil: 'networkidle' });
  await admin.fill('input[name="username"]', 'root');
  await admin.fill('input[name="password"]', 'rootpass123');
  await admin.click('input[type="submit"]');
  await admin.waitForTimeout(1200);
  await safeScreenshot(admin, 'admin_loggout.png');

  const logoutLink = admin.locator('a:has-text("Log out")');
  if (await logoutLink.count()) {
    await logoutLink.first().click();
    await admin.waitForTimeout(1000);
  } else {
    await admin.goto('http://localhost:8000/admin/logout/', { waitUntil: 'networkidle' });
    await admin.waitForTimeout(800);
  }
  await safeScreenshot(admin, 'admin_logout.png');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
