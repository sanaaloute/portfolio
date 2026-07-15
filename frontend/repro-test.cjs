module.exports = async (page) => {
  const fs = require('fs');
  const projects = fs.readFileSync('/tmp/projects.json', 'utf8');
  const experiences = fs.readFileSync('/tmp/experiences.json', 'utf8');

  const consoleMsgs = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleMsgs.push(`[console.error] ${m.text().slice(0, 800)}`);
  });
  page.on('pageerror', (e) => consoleMsgs.push(`[PAGEERROR] ${e.message} :: ${(e.stack || '').slice(0, 1200)}`));

  const fulfill = (body, status = 200) => ({ status, contentType: 'application/json', body });

  await page.route('**/api/**', (route) => {
    const p = route.request().url().split('?')[0];
    const method = route.request().method();
    if (p.endsWith('/api/auth/me')) return route.fulfill(fulfill(JSON.stringify({ sub: 'admin' })));
    if (p.endsWith('/api/profile')) return route.fulfill(fulfill(JSON.stringify({
      id: 1, name: 'Aloute Sana', headline: 'Dev', tagline: 'tag', bio: '<p>bio</p>',
      avatar_url: null, resume_url: null, phone: null, location: 'Paris', email: 'a@b.c',
      github: null, linkedin: null, twitter: null, hero_stats: [], focus_areas: [], socials: []
    })));
    if (p.endsWith('/api/projects') && method === 'GET') return route.fulfill(fulfill(projects));
    if (p.endsWith('/api/experiences') && method === 'GET') return route.fulfill(fulfill(experiences));
    if (p.endsWith('/api/upload/images')) return route.fulfill(fulfill('[]'));
    return route.fulfill(fulfill('[]'));
  });

  const results = {};

  // --- Projects: click Edit on first project ---
  await page.goto('http://localhost:4180/admin/projects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  let editBtn = page.locator('button:has-text("Edit")').first();
  results.projectsEditCount = await editBtn.count();
  if (results.projectsEditCount > 0) {
    await editBtn.click();
    await page.waitForTimeout(3000);
    const txt = await page.locator('body').innerText().catch(() => '<<unreadable>>');
    results.projectsBodyLen = txt.length;
    results.projectsQuill = await page.locator('.ql-container').count();
    results.projectsSnippet = txt.slice(0, 150);
  }

  // --- Experience: click Edit on first experience ---
  await page.goto('http://localhost:4180/admin/experience', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  editBtn = page.locator('button:has-text("Edit")').first();
  results.expEditCount = await editBtn.count();
  if (results.expEditCount > 0) {
    await editBtn.click();
    await page.waitForTimeout(3000);
    const txt = await page.locator('body').innerText().catch(() => '<<unreadable>>');
    results.expBodyLen = txt.length;
    results.expQuill = await page.locator('.ql-container').count();
    results.expSnippet = txt.slice(0, 150);
  }

  results.consoleMsgs = consoleMsgs;
  return results;
};
