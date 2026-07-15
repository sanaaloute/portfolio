async (page) => {
  const projects = 
[{"slug":"ai-web-builder","title":"AI Web Builder","summary":"AI-powered platform that generates full-stack websites from natural language prompts using multi-agent orchestration.","body":"<p>AI Web Builder turns plain-language descriptions into production-ready full-stack websites. A LangGraph/LangChain-based agentic workflow coordinates 20+ specialized agents — planner, designer, debugger, executor, reviewer — to automate the entire website generation pipeline.</p><ul><li>User prompts trigger agent orchestration, dynamically routing tasks to the most appropriate agents based on intent detection.</li><li>Visual component editing lets users select UI elements in-browser and modify them via natural language commands.</li><li>Multi-export capabilities: Supabase persistence, GitHub push, Coolify deployment, plus ZIP downloads for code portability.</li><li>AI-driven debugging: users can request automated error fixes directly through the interface.</li></ul><p>Live at <a href=\"https://www.ai-web-builder.com\" target=\"_blank\" rel=\"noreferrer\">www.ai-web-builder.com</a>.</p>","period":"2025 – Present","location":null,"stack":["LangGraph","LangChain","Python","Supabase","React","Next.js","Coolify"],"cover_url":null,"demo_url":null,"images":[],"featured":true,"position":0,"id":1,"created_at":"2026-07-15T03:59:46.638032Z","updated_at":"2026-07-15T03:59:46.638038Z"},{"slug":"brvm-realtimestock-ai-agent","title":"BRVM RealTimeStock AI Agent","summary":"AI-driven Telegram bot (@BrvmBot) for monitoring and analyzing BRVM stock market portfolios with multi-agent intelligence.","body":"<p>A LangGraph-based agentic system featuring one master agent orchestrating 6 specialized subagents for distinct financial analysis tasks on the BRVM (West African stock exchange).</p><ul><li>Stock price plotting across custom date ranges.</li><li>P&amp;L calculations per stock and across entire portfolios.</li><li>Multi-stock price comparisons for informed investment decisions.</li><li>Chroma vector database for efficient static data storage; SQLite for structured portfolio data.</li><li>Natural-language CRUD over stock information, deployed as the Telegram bot @BrvmBot.</li></ul>","period":"2025","location":null,"stack":["LangGraph","LangChain","Python","ChromaDB","SQLite","Telegram Bot API"],"cover_url":null,"demo_url":null,"images":[],"featured":true,"position":1,"id":2,"created_at":"2026-07-15T03:59:46.638039Z","updated_at":"2026-07-15T03:59:46.638040Z"},{"slug":"barkosem","title":"Barkosem","summary":"Cross-platform e-commerce marketplace connecting Chinese suppliers with African B2B buyers.","body":"<p>Barkosem is a full-stack marketplace ecosystem for cross-border bulk trade between Chinese suppliers and African B2B buyers.</p><ul><li>Cross-platform mobile apps built with Flutter (Android/iOS).</li><li>Vendor management panel, admin console, landing page, and customer-facing web interface (Next.js).</li><li>Microservices architecture with a NestJS API Gateway orchestrating backend services.</li><li>Supabase as the primary database for real-time data synchronization across platforms.</li></ul><p>Live at <a href=\"https://www.barkosem.com\" target=\"_blank\" rel=\"noreferrer\">www.barkosem.com</a>.</p>","period":"2024 – Present","location":null,"stack":["Next.js","Flutter","NestJS","Supabase","REST APIs","Microservices"],"cover_url":null,"demo_url":null,"images":[],"featured":true,"position":2,"id":3,"created_at":"2026-07-15T03:59:46.638041Z","updated_at":"2026-07-15T03:59:46.638042Z"}];
  const experiences = 
[{"slug":"senior-ai-fullstack-engineer-shenzhen-depei-open-source-data-technology-co-ltd","company":"Shenzhen Depei Open Source Data Technology Co., Ltd","role":"Senior AI Fullstack Engineer","location":"Shenzhen, China","start_date":"2026-01-01","end_date":null,"description":"Architecting an AI code generation platform that produces production-ready websites from natural language prompts.","highlights":["Architected an AI code generation platform using LangGraph and Pydantic to produce production-ready websites from natural language prompts.","Designed end-to-end system architecture spanning frontend, backend, and AI pipelines for scalability and reliability.","Built frontend with Next.js/React and backend with Supabase (auth, database, real-time features).","Implemented interactive AI editing allowing users to modify generated UI components via natural language.","Enabled one-click GitHub push, Supabase integration, and Vercel deployment from the platform.","Established CI/CD pipelines for automated testing and seamless multi-environment deployments.","Led technical decisions on AI orchestration and platform scalability, aligning engineering with product strategy.","Built daacoo, an e-commerce website selling AI conversation devices (www.daacoo.com, www.lovecode.com, www.dpqq.com, www.gitcc.com)."],"stack":["LangGraph","Pydantic","Python","Next.js","React","Supabase","TypeScript","Vercel","CI/CD"],"logo_url":null,"position":0,"id":1,"created_at":"2026-07-15T03:59:46.624228Z","updated_at":"2026-07-15T03:59:46.624234Z"},{"slug":"ai-ml-engineer-algento-bei-jing-ao-jin-tuo-wang-luo-ke-ji-you-xian-gong-si","company":"Algento (北京奥金拓网络科技有限公司)","role":"AI/ML Engineer","location":"Beijing, China","start_date":"2024-06-01","end_date":"2025-12-31","description":"Built and deployed enterprise LLM systems: RAG chatbots, safety guardrails, multimodal pipelines, and predictive models.","highlights":["Built RAG-powered employee service chatbots using LLMs, improving response relevance and user satisfaction.","Deployed LLM guardrails reducing safety violations (violence, sexual content, hate speech) by 80%.","Developed a FastAPI-based voice-to-text chatbot with audio transcription, reducing user input time and increasing engagement by 20%.","Created agentic image generation/editing pipelines (Qwen-Image, Nano Banana, Kolors) for ad banner production, reducing manual design time by 90%.","Built a nationality prediction model with 98% accuracy, improving recommendation system performance by 60%."],"stack":["Python","LLMs","RAG","FastAPI","Qwen-Image","Kolors","Whisper","Docker"],"logo_url":null,"position":1,"id":2,"created_at":"2026-07-15T03:59:46.624236Z","updated_at":"2026-07-15T03:59:46.624236Z"},{"slug":"algorithm-engineer-internship-sfem-bei-jing-gang-liu-dian-ci-ji-zhu-you-xian-gong-si","company":"SFEM (北京钢流电磁技术有限公司)","role":"Algorithm Engineer (Internship)","location":"Beijing, China","start_date":"2024-01-01","end_date":"2024-06-30","description":"Developed time-series forecasting models for renewable energy infrastructure.","highlights":["Developed a time series forecasting model for wind turbine power prediction with 80% forecast precision.","Led data collection, preprocessing, and feature engineering to optimize model accuracy.","Conducted model validation and performance evaluation to ensure production reliability."],"stack":["Python","PyTorch","Scikit-learn","Pandas","NumPy"],"logo_url":null,"position":2,"id":3,"created_at":"2026-07-15T03:59:46.624237Z","updated_at":"2026-07-15T03:59:46.624238Z"},{"slug":"algorithm-engineer-internship-vmware","company":"VMware","role":"Algorithm Engineer (Internship)","location":"Beijing, China","start_date":"2023-10-01","end_date":"2024-01-31","description":"Designed intelligent UX automation within graduate R&D initiatives.","highlights":["Designed and developed page recognition algorithms for end-to-end user experiences.","Collaborated with cross-functional design teams throughout the full development lifecycle.","Contributed to company-wide graduate program initiatives and technical projects."],"stack":["Python","TensorFlow","OpenCV","Scikit-learn"],"logo_url":null,"position":3,"id":4,"created_at":"2026-07-15T03:59:46.624239Z","updated_at":"2026-07-15T03:59:46.624240Z"}];
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
    if (p.endsWith('/api/projects') && method === 'GET') return route.fulfill(fulfill(JSON.stringify(projects)));
    if (p.endsWith('/api/experiences') && method === 'GET') return route.fulfill(fulfill(JSON.stringify(experiences)));
    if (p.endsWith('/api/upload/images')) return route.fulfill(fulfill('[]'));
    return route.fulfill(fulfill('[]'));
  });

  const results = {};

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
}
