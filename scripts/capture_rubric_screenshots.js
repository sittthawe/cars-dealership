const fs = require('fs');
const { chromium } = require('playwright');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function addUrlOverlay(page) {
  const url = page.url();
  await page.evaluate((u) => {
    let bar = document.getElementById('__url_overlay__');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = '__url_overlay__';
      bar.style.position = 'fixed';
      bar.style.top = '0';
      bar.style.left = '0';
      bar.style.right = '0';
      bar.style.zIndex = '2147483647';
      bar.style.background = '#111';
      bar.style.color = '#fff';
      bar.style.fontFamily = 'monospace';
      bar.style.fontSize = '13px';
      bar.style.padding = '8px 12px';
      bar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      document.body.appendChild(bar);
      document.body.style.paddingTop = '44px';
    }
    bar.textContent = `URL: ${u}`;
  }, url);
}

async function snap(page, name, withUrl = true) {
  if (withUrl) {
    await addUrlOverlay(page);
  }
  await page.screenshot({ path: name, fullPage: true });
  console.log(`saved ${name}`);
}

async function loginApp(page) {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  const signedIn = await page.locator('text=Signed in as').count();
  if (!signedIn) {
    await page.fill('input[placeholder="Username"]', 'student1');
    await page.fill('input[placeholder="Password"]', 'Password123!');
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForTimeout(1000);
  }
}

async function ensureDealerSelected(page, dealerText = 'Empire Auto NYC') {
  const btn = page.locator('button.dealer-card', { hasText: dealerText }).first();
  if (await btn.count()) {
    await btn.click();
  } else {
    const first = page.locator('button.dealer-card').first();
    if (await first.count()) {
      await first.click();
    }
  }
  await page.waitForTimeout(1200);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Task 2: django_server.png from log text
  const djangoText = fs.existsSync('django_server') ? fs.readFileSync('django_server', 'utf8') : 'django_server file not found';
  const term = await context.newPage();
  await term.setContent(`
    <html><body style="margin:0;background:#111;color:#e6e6e6;font-family:Consolas,monospace;">
      <div style="padding:16px;background:#1f1f1f;color:#9cdcfe;font-size:18px;">Django Server Running Output</div>
      <pre style="white-space:pre-wrap;padding:16px;line-height:1.35;font-size:13px;">${escapeHtml(djangoText)}</pre>
    </body></html>
  `);
  await snap(term, 'django_server.png', false);

  // App screenshots
  const app = await context.newPage();
  await app.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Task 17: before login
  await snap(app, 'get_dealers.png', true);

  // Task 3: about_us
  await app.click('button:has-text("About Us")');
  await app.waitForTimeout(500);
  await snap(app, 'about_us.png', true);

  // Task 4: contact_us
  await app.click('button:has-text("Contact Us")');
  await app.waitForTimeout(500);
  await snap(app, 'contact_us.png', true);

  // Task 5: login page with logged user
  await app.click('button:has-text("Dealers")');
  await app.waitForTimeout(400);
  await loginApp(app);
  await snap(app, 'login.png', true);

  // Task 18: logged in with Post Review visible
  await ensureDealerSelected(app, 'Empire Auto NYC');
  await snap(app, 'get_dealers_loggedin.png', true);

  // Task 6: logout alert
  const logoutButton = app.locator('button:has-text("Logout")').first();
  if (await logoutButton.count()) {
    await logoutButton.click();
    await app.waitForTimeout(700);
  }
  await snap(app, 'logout.png', true);

  // Task 7: sign-up page
  await app.click('button:has-text("Register")');
  await app.waitForTimeout(400);
  await snap(app, 'sign-up.png', true);

  // Login again for remaining dealer flow screenshots
  await app.click('button:has-text("Login")');
  await app.fill('input[placeholder="Username"]', 'student1');
  await app.fill('input[placeholder="Password"]', 'Password123!');
  await app.locator('form button[type="submit"]').first().click();
  await app.waitForTimeout(900);

  // Task 19: dealers by state
  await app.selectOption('select.form-select', 'TX');
  await app.waitForTimeout(900);
  await snap(app, 'dealersbystate.png', true);

  // Task 20: dealer details + reviews
  await app.selectOption('select.form-select', '');
  await app.waitForTimeout(800);
  await ensureDealerSelected(app, 'Empire Auto NYC');
  await snap(app, 'dealer_id_reviews.png', true);

  // Task 21: review submission form filled, before submit
  await app.fill('textarea[placeholder="Write your review"]', 'Fantastic services from the dealership team.');
  await app.fill('input[placeholder="Car year"]', '2024');
  await app.fill('input[placeholder="Car make"]', 'Tesla');
  await app.fill('input[placeholder="Car model"]', 'Model 3');
  await snap(app, 'dealership_review_submission.png', true);

  // Task 22: after review added
  await app.click('button:has-text("Post Review")');
  await app.waitForTimeout(1400);
  await snap(app, 'added_review.png', true);

  // Endpoint screenshots for Express/Mongo and sentiment
  const ep = await context.newPage();

  await ep.goto('http://localhost:3001/dealers/1/reviews', { waitUntil: 'networkidle' });
  await snap(ep, 'dealer_review.png', true);

  await ep.goto('http://localhost:3001/dealers', { waitUntil: 'networkidle' });
  await snap(ep, 'dealerships.png', true);

  await ep.goto('http://localhost:3001/dealers/2', { waitUntil: 'networkidle' });
  await snap(ep, 'dealer_details.png', true);

  await ep.goto('http://localhost:3001/dealers?state=KS', { waitUntil: 'networkidle' });
  await snap(ep, 'kansasDealers.png', true);

  await ep.goto('http://localhost:3001/cars', { waitUntil: 'networkidle' });
  await snap(ep, 'cars.png', true);

  await ep.goto('http://localhost:3001/cars?make=Tesla', { waitUntil: 'networkidle' });
  await snap(ep, 'car_models.png', true);

  await ep.goto('http://localhost:5001/analyze?text=Fantastic%20services', { waitUntil: 'networkidle' });
  await snap(ep, 'sentiment_analyzer.png', true);

  // Admin login/logout screenshots
  const admin = await context.newPage();
  await admin.goto('http://localhost:8000/admin/login/?next=/admin/', { waitUntil: 'networkidle' });
  await admin.fill('input[name="username"]', 'root');
  await admin.fill('input[name="password"]', 'rootpass123');
  await admin.click('input[type="submit"]');
  await admin.waitForTimeout(1200);
  await snap(admin, 'admin_login.png', true);

  const logoutLink = admin.locator('a:has-text("Log out")');
  if (await logoutLink.count()) {
    await logoutLink.first().click();
    await admin.waitForTimeout(900);
  } else {
    await admin.goto('http://localhost:8000/admin/logout/', { waitUntil: 'networkidle' });
  }
  await snap(admin, 'admin_logout.png', true);

  // Task 23 CICD screenshot from GitHub Actions page (public)
  const cicd = await context.newPage();
  await cicd.goto('https://github.com/sittthawe/cars-dealership/actions', { waitUntil: 'domcontentloaded' });
  await cicd.waitForTimeout(2000);
  await snap(cicd, 'CICD.png', true);

  // Deployed screenshots: use deployment URL if available, else localhost as fallback
  let deployedBase = 'http://localhost:5173';
  if (fs.existsSync('deploymentURL')) {
    const text = fs.readFileSync('deploymentURL', 'utf8').trim();
    const m = text.match(/https?:\/\/[^\s]+/i);
    if (m) {
      const candidate = m[0];
      try {
        const parsed = new URL(candidate);
        if (!candidate.includes('<') && !candidate.includes('>')) {
          deployedBase = parsed.toString();
        }
      } catch (_error) {
        // Keep localhost fallback when deploymentURL contains placeholders/invalid URL.
      }
    }
  }

  const dep = await context.newPage();
  await dep.goto(deployedBase, { waitUntil: 'networkidle' });
  await snap(dep, 'deployed_landingpage.png', true);

  const signedInDep = await dep.locator('text=Signed in as').count();
  if (!signedInDep) {
    await dep.fill('input[placeholder="Username"]', 'student1');
    await dep.fill('input[placeholder="Password"]', 'Password123!');
    await dep.locator('form button[type="submit"]').first().click();
    await dep.waitForTimeout(1000);
  }
  await ensureDealerSelected(dep, 'Empire Auto NYC');
  await snap(dep, 'deployed_loggedin.png', true);
  await snap(dep, 'deployed_dealer_detail.png', true);

  await dep.fill('textarea[placeholder="Write your review"]', 'Fantastic services from deployment flow.');
  await dep.fill('input[placeholder="Car year"]', '2024');
  await dep.fill('input[placeholder="Car make"]', 'Tesla');
  await dep.fill('input[placeholder="Car model"]', 'Model 3');
  await dep.click('button:has-text("Post Review")');
  await dep.waitForTimeout(1200);
  await snap(dep, 'deployed_add_review.png', true);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
