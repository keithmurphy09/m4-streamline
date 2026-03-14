// M4 Streamline Landing Page Redesign
// Replaces #landing div content with professional design
// Additive only - preserves hideLanding() functionality
(function(){
try {

var el = document.getElementById('landing');
if (!el) return;

// ============ CSS ============
var css = document.createElement('style');
css.textContent = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=Outfit:wght@400;500;600;700;800&display=swap');

#landing{font-family:'DM Sans',sans-serif!important;background:#fff!important;color:#1a202c!important;overflow-x:hidden!important}
#landing::before{display:none!important}
#landing *{box-sizing:border-box}

/* NAV */
.lp2-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;transition:all 0.3s}
.lp2-nav.scrolled{background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);box-shadow:0 1px 3px rgba(0,0,0,0.08)}
.lp2-nav-logo{display:flex;align-items:center;gap:10px;font-family:'Outfit',sans-serif;font-weight:700;font-size:22px;color:#0f172a;text-decoration:none}
.lp2-nav-logo img{height:36px}
.lp2-nav-logo span{color:#0d9488}
.lp2-nav-links{display:flex;gap:32px;align-items:center}
.lp2-nav-links a{text-decoration:none;color:#475569;font-size:15px;font-weight:500;transition:color 0.2s}
.lp2-nav-links a:hover{color:#0d9488}
.lp2-nav-right{display:flex;gap:12px;align-items:center}
.lp2-btn-signin{padding:10px 20px;font-size:14px;font-weight:600;color:#0f172a;background:none;border:none;cursor:pointer;transition:color 0.2s}
.lp2-btn-signin:hover{color:#0d9488}
.lp2-btn-cta{padding:10px 24px;font-size:14px;font-weight:600;color:#fff;background:#0d9488;border:none;border-radius:8px;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(13,148,136,0.3)}
.lp2-btn-cta:hover{background:#0f766e;transform:translateY(-1px);box-shadow:0 4px 16px rgba(13,148,136,0.4)}

/* HERO */
.lp2-hero{padding:140px 40px 80px;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.lp2-hero-content h1{font-family:'Outfit',sans-serif;font-size:56px;line-height:1.1;font-weight:800;color:#0f172a;margin:0 0 24px}
.lp2-hero-content h1 span{color:#0d9488}
.lp2-hero-content p{font-size:19px;line-height:1.7;color:#64748b;margin:0 0 32px;max-width:480px}
.lp2-hero-btns{display:flex;gap:16px;flex-wrap:wrap}
.lp2-btn-primary{padding:16px 32px;font-size:16px;font-weight:700;color:#fff;background:#0d9488;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(13,148,136,0.35);font-family:'DM Sans',sans-serif}
.lp2-btn-primary:hover{background:#0f766e;transform:translateY(-2px);box-shadow:0 8px 25px rgba(13,148,136,0.4)}
.lp2-btn-secondary{padding:16px 32px;font-size:16px;font-weight:600;color:#0f172a;background:#fff;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif}
.lp2-btn-secondary:hover{border-color:#0d9488;color:#0d9488}
.lp2-hero-note{font-size:13px;color:#94a3b8;margin-top:16px}
.lp2-hero-visual{position:relative}
.lp2-hero-img{width:100%;border-radius:16px;box-shadow:0 25px 60px rgba(0,0,0,0.12);border:1px solid #e2e8f0}
.lp2-hero-float{position:absolute;background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 8px 30px rgba(0,0,0,0.1);font-size:14px;font-weight:600;border:1px solid #f1f5f9;animation:lp2Float 3s ease-in-out infinite}
.lp2-hero-float-1{top:-20px;right:-20px;color:#0d9488}
.lp2-hero-float-2{bottom:40px;left:-30px;color:#0f172a}
@keyframes lp2Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* STATS BAR */
.lp2-stats{background:#0f172a;padding:60px 40px}
.lp2-stats-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:40px;text-align:center}
.lp2-stat-num{font-family:'Outfit',sans-serif;font-size:42px;font-weight:800;color:#2dd4bf}
.lp2-stat-label{font-size:14px;color:#94a3b8;margin-top:6px}

/* SECTION STYLES */
.lp2-section{padding:100px 40px}
.lp2-section-dark{background:#f8fafc}
.lp2-section-inner{max-width:1100px;margin:0 auto}
.lp2-section-tag{display:inline-block;padding:6px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0d9488;background:#f0fdfa;border-radius:20px;border:1px solid #ccfbf1;margin-bottom:16px}
.lp2-section-h2{font-family:'Outfit',sans-serif;font-size:42px;font-weight:800;color:#0f172a;line-height:1.15;margin:0 0 16px}
.lp2-section-p{font-size:18px;color:#64748b;line-height:1.6;margin:0 0 48px;max-width:600px}
.lp2-section-center{text-align:center}
.lp2-section-center .lp2-section-p{margin-left:auto;margin-right:auto}

/* FEATURE TABS */
.lp2-tabs{display:flex;gap:4px;background:#f1f5f9;padding:4px;border-radius:12px;margin-bottom:48px;overflow-x:auto;width:fit-content}
.lp2-tab{padding:12px 24px;font-size:14px;font-weight:600;color:#64748b;background:none;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;white-space:nowrap;font-family:'DM Sans',sans-serif}
.lp2-tab.active{background:#fff;color:#0f172a;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.lp2-tab-content{display:none;animation:lp2FadeIn 0.3s ease}
.lp2-tab-content.active{display:block}
@keyframes lp2FadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.lp2-tab-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.lp2-tab-text h3{font-family:'Outfit',sans-serif;font-size:28px;font-weight:700;color:#0f172a;margin:0 0 16px}
.lp2-tab-text p{font-size:16px;color:#64748b;line-height:1.7;margin:0 0 24px}
.lp2-tab-features{list-style:none;padding:0;margin:0}
.lp2-tab-features li{padding:10px 0;font-size:15px;color:#334155;display:flex;align-items:center;gap:12px}
.lp2-tab-features li::before{content:'';width:24px;height:24px;border-radius:50%;background:#f0fdfa;flex-shrink:0;display:flex;align-items:center;justify-content:center;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%230d9488' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center}
.lp2-tab-img{width:100%;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.08);border:1px solid #e2e8f0}

/* FEATURE CARDS */
.lp2-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.lp2-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:40px;transition:all 0.3s;position:relative;overflow:hidden}
.lp2-card:hover{border-color:#99f6e4;box-shadow:0 12px 40px rgba(13,148,136,0.08);transform:translateY(-4px)}
.lp2-card-tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0d9488;margin-bottom:12px}
.lp2-card h3{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px}
.lp2-card p{font-size:15px;color:#64748b;line-height:1.6;margin:0}
.lp2-card-icon{width:48px;height:48px;border-radius:12px;background:#f0fdfa;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.lp2-card-icon svg{color:#0d9488}

/* AI FEATURE HIGHLIGHT */
.lp2-ai-section{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:100px 40px;color:#fff;position:relative;overflow:hidden}
.lp2-ai-section::before{content:'';position:absolute;top:-50%;right:-20%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(45,212,191,0.15),transparent 70%)}
.lp2-ai-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.lp2-ai-grid h2{font-family:'Outfit',sans-serif;font-size:42px;font-weight:800;line-height:1.15;margin:0 0 20px}
.lp2-ai-grid h2 span{color:#2dd4bf}
.lp2-ai-grid p{font-size:18px;color:#94a3b8;line-height:1.7;margin:0 0 32px}
.lp2-ai-features{list-style:none;padding:0;margin:0}
.lp2-ai-features li{padding:12px 0;font-size:15px;color:#cbd5e1;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,0.06)}
.lp2-ai-features li svg{color:#2dd4bf;flex-shrink:0}
.lp2-ai-mockup{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;backdrop-filter:blur(10px)}
.lp2-ai-mockup-hd{display:flex;gap:6px;margin-bottom:20px}
.lp2-ai-mockup-hd span{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.15)}
.lp2-ai-scan{background:rgba(45,212,191,0.1);border:1px dashed rgba(45,212,191,0.3);border-radius:12px;padding:24px;text-align:center}
.lp2-ai-scan-icon{font-size:40px;margin-bottom:12px}
.lp2-ai-scan p{color:#94a3b8;font-size:14px;margin:0}
.lp2-ai-result{margin-top:16px;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px}
.lp2-ai-result-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px}
.lp2-ai-result-row span:first-child{color:#94a3b8}
.lp2-ai-result-row span:last-child{color:#2dd4bf;font-weight:600}

/* PRICING */
.lp2-pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto}
.lp2-price-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:40px 32px;text-align:center;transition:all 0.3s}
.lp2-price-card.featured{border-color:#0d9488;box-shadow:0 12px 40px rgba(13,148,136,0.12);transform:scale(1.04);position:relative}
.lp2-price-card.featured::before{content:'MOST POPULAR';position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#0d9488;color:#fff;font-size:11px;font-weight:700;padding:4px 16px;border-radius:20px;letter-spacing:0.05em}
.lp2-price-card h3{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px}
.lp2-price-card .price{font-family:'Outfit',sans-serif;font-size:48px;font-weight:800;color:#0f172a;margin:20px 0 4px}
.lp2-price-card .price span{font-size:16px;font-weight:500;color:#94a3b8}
.lp2-price-card .price-note{font-size:13px;color:#94a3b8;margin-bottom:24px}
.lp2-price-card ul{list-style:none;padding:0;margin:0 0 32px;text-align:left}
.lp2-price-card ul li{padding:8px 0;font-size:14px;color:#475569;display:flex;align-items:center;gap:10px}
.lp2-price-card ul li svg{color:#0d9488;flex-shrink:0}
.lp2-price-btn{width:100%;padding:14px;font-size:15px;font-weight:700;border-radius:10px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;border:2px solid #e2e8f0;background:#fff;color:#0f172a}
.lp2-price-btn:hover{border-color:#0d9488;color:#0d9488}
.lp2-price-btn.primary{background:#0d9488;color:#fff;border-color:#0d9488}
.lp2-price-btn.primary:hover{background:#0f766e}

/* FAQ */
.lp2-faq{max-width:700px;margin:0 auto}
.lp2-faq-item{border-bottom:1px solid #e2e8f0}
.lp2-faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;padding:20px 0;font-size:16px;font-weight:600;color:#0f172a;background:none;border:none;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif}
.lp2-faq-q svg{transition:transform 0.2s;flex-shrink:0;color:#94a3b8}
.lp2-faq-q.open svg{transform:rotate(45deg);color:#0d9488}
.lp2-faq-a{max-height:0;overflow:hidden;transition:max-height 0.3s ease;font-size:15px;color:#64748b;line-height:1.7}
.lp2-faq-a.open{max-height:300px;padding-bottom:20px}

/* FOOTER CTA */
.lp2-footer-cta{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:100px 40px;text-align:center;color:#fff}
.lp2-footer-cta h2{font-family:'Outfit',sans-serif;font-size:42px;font-weight:800;margin:0 0 16px}
.lp2-footer-cta p{font-size:18px;color:#94a3b8;margin:0 0 40px;max-width:500px;margin-left:auto;margin-right:auto}

/* FOOTER */
.lp2-footer{background:#0f172a;padding:48px 40px 32px;border-top:1px solid rgba(255,255,255,0.06)}
.lp2-footer-inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
.lp2-footer-left{display:flex;align-items:center;gap:10px;font-family:'Outfit',sans-serif;font-weight:700;font-size:18px;color:#fff}
.lp2-footer-left span{color:#2dd4bf}
.lp2-footer-copy{font-size:13px;color:#64748b}
.lp2-footer-links{display:flex;gap:24px}
.lp2-footer-links a{color:#94a3b8;font-size:14px;text-decoration:none;transition:color 0.2s}
.lp2-footer-links a:hover{color:#2dd4bf}

/* MOBILE */
@media(max-width:900px){
  .lp2-nav{padding:12px 20px}
  .lp2-nav-links{display:none}
  .lp2-hero{grid-template-columns:1fr;padding:120px 20px 60px;gap:40px;text-align:center}
  .lp2-hero-content h1{font-size:36px}
  .lp2-hero-content p{margin-left:auto;margin-right:auto}
  .lp2-hero-btns{justify-content:center}
  .lp2-hero-float{display:none}
  .lp2-stats-inner{grid-template-columns:repeat(2,1fr);gap:24px}
  .lp2-stat-num{font-size:32px}
  .lp2-section{padding:60px 20px}
  .lp2-section-h2{font-size:30px}
  .lp2-tab-grid{grid-template-columns:1fr;gap:32px}
  .lp2-cards{grid-template-columns:1fr}
  .lp2-ai-grid{grid-template-columns:1fr;gap:40px}
  .lp2-ai-section{padding:60px 20px}
  .lp2-pricing-grid{grid-template-columns:1fr;max-width:400px}
  .lp2-price-card.featured{transform:none}
  .lp2-footer-cta{padding:60px 20px}
  .lp2-footer-cta h2{font-size:30px}
  .lp2-footer-inner{flex-direction:column;text-align:center}
}
`;
document.head.appendChild(css);

// ============ CHECK MARK SVG ============
var chk = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

// ============ BUILD HTML ============
el.innerHTML = `
<!-- NAV -->
<nav class="lp2-nav" id="lp2-nav">
  <a href="#" class="lp2-nav-logo">
    <span>M4</span> Streamline
  </a>
  <div class="lp2-nav-links">
    <a href="#lp2-features">Features</a>
    <a href="#lp2-ai">AI Tools</a>
    <a href="#lp2-pricing">Pricing</a>
    <a href="#lp2-faq">FAQ</a>
    <a href="mailto:m4projectsanddesigns@gmail.com">Contact</a>
  </div>
  <div class="lp2-nav-right">
    <button onclick="hideLanding()" class="lp2-btn-signin">Sign In</button>
    <button onclick="hideLanding()" class="lp2-btn-cta">Start Free Trial</button>
  </div>
</nav>

<!-- HERO -->
<section class="lp2-hero">
  <div class="lp2-hero-content">
    <div class="lp2-section-tag" style="margin-bottom:24px">Built for Australian & NZ Tradies</div>
    <h1>Run your trade business with <span>total confidence</span></h1>
    <p>Quotes, scheduling, invoicing, expense tracking and AI-powered receipt scanning &mdash; everything you need in one clean platform. No spreadsheets. No guesswork.</p>
    <div class="lp2-hero-btns">
      <button onclick="hideLanding()" class="lp2-btn-primary">Start Your Free 14-Day Trial &rarr;</button>
      <button onclick="document.getElementById('lp2-features').scrollIntoView({behavior:'smooth'})" class="lp2-btn-secondary">See How It Works</button>
    </div>
    <p class="lp2-hero-note">No credit card required &middot; Setup in 2 minutes &middot; Cancel anytime</p>
  </div>
  <div class="lp2-hero-visual">
    <div style="background:linear-gradient(135deg,#f0fdfa,#e0f2fe);border-radius:16px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;box-shadow:0 25px 60px rgba(0,0,0,0.1);position:relative;overflow:hidden">
      <div style="text-align:center;padding:40px">
        <div style="font-family:Outfit,sans-serif;font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px">M4 Streamline Dashboard</div>
        <div style="font-size:14px;color:#64748b">Quotes &middot; Schedule &middot; Invoices &middot; Analytics</div>
      </div>
    </div>
    <div class="lp2-hero-float lp2-hero-float-1">
      <div style="display:flex;align-items:center;gap:8px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83"/></svg>
        AI Receipt Scanning
      </div>
    </div>
    <div class="lp2-hero-float lp2-hero-float-2">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="color:#10b981;font-size:18px">$</span>
        Track Every Dollar
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<div class="lp2-stats">
  <div class="lp2-stats-inner">
    <div><div class="lp2-stat-num">158+</div><div class="lp2-stat-label">Features built</div></div>
    <div><div class="lp2-stat-num">$0</div><div class="lp2-stat-label">Setup cost</div></div>
    <div><div class="lp2-stat-num">2 min</div><div class="lp2-stat-label">To get started</div></div>
    <div><div class="lp2-stat-num">24/7</div><div class="lp2-stat-label">Access anywhere</div></div>
  </div>
</div>

<!-- FEATURES WITH TABS -->
<section class="lp2-section lp2-section-dark" id="lp2-features">
  <div class="lp2-section-inner lp2-section-center">
    <div class="lp2-section-tag">The Platform</div>
    <h2 class="lp2-section-h2">Total control. Complete clarity.<br>One platform to manage it all.</h2>
    <p class="lp2-section-p">From first quote to final payment, M4 Streamline handles every step of your trade business.</p>

    <div class="lp2-tabs" id="lp2-tabs">
      <button class="lp2-tab active" onclick="lp2SwitchTab('scheduling',this)">Scheduling</button>
      <button class="lp2-tab" onclick="lp2SwitchTab('quoting',this)">Quoting</button>
      <button class="lp2-tab" onclick="lp2SwitchTab('invoicing',this)">Invoicing</button>
      <button class="lp2-tab" onclick="lp2SwitchTab('expenses',this)">Expenses</button>
      <button class="lp2-tab" onclick="lp2SwitchTab('analytics',this)">Analytics</button>
      <button class="lp2-tab" onclick="lp2SwitchTab('team',this)">Team</button>
    </div>
  </div>

  <div class="lp2-section-inner">
    <div class="lp2-tab-content active" data-tab="scheduling">
      <div class="lp2-tab-grid">
        <div class="lp2-tab-text">
          <h3>Schedule every trade with confidence</h3>
          <p>Calendar, list, and Gantt chart views. Assign multiple trades to a job, set dependencies, and see your entire month at a glance.</p>
          <ul class="lp2-tab-features">
            <li>Calendar view with color-coded worker bars</li>
            <li>Gantt chart with task dependencies</li>
            <li>Assign different trades to different dates</li>
            <li>Daily logs and site photos per job</li>
            <li>Recurring job scheduling</li>
          </ul>
        </div>
        <div style="background:#f0fdfa;border-radius:12px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0"><div style="color:#0d9488;font-family:Outfit,sans-serif;font-weight:700;font-size:20px">Calendar &middot; List &middot; Gantt</div></div>
      </div>
    </div>

    <div class="lp2-tab-content" data-tab="quoting">
      <div class="lp2-tab-grid">
        <div class="lp2-tab-text">
          <h3>Professional quotes in minutes</h3>
          <p>Line-item quoting with deposits, PDF generation, email and SMS delivery. Track won, lost, and pending quotes with full pipeline visibility.</p>
          <ul class="lp2-tab-features">
            <li>Line items with quantities and rates</li>
            <li>Deposit tracking with auto-deduction</li>
            <li>Email and SMS quotes to clients</li>
            <li>Convert to invoice in one click</li>
            <li>Salesperson assignment and tracking</li>
          </ul>
        </div>
        <div style="background:#eff6ff;border-radius:12px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0"><div style="color:#1e40af;font-family:Outfit,sans-serif;font-weight:700;font-size:20px">Quote &rarr; Invoice &rarr; Paid</div></div>
      </div>
    </div>

    <div class="lp2-tab-content" data-tab="invoicing">
      <div class="lp2-tab-grid">
        <div class="lp2-tab-text">
          <h3>Get paid faster, every time</h3>
          <p>Generate invoices, send via email or SMS, accept online payments via Stripe. Progressive invoicing and recurring billing built in.</p>
          <ul class="lp2-tab-features">
            <li>Online payments via Stripe</li>
            <li>Progressive and recurring invoicing</li>
            <li>Overdue tracking and reminders</li>
            <li>Client portal for self-service payments</li>
            <li>PDF generation and email/SMS delivery</li>
          </ul>
        </div>
        <div style="background:#f0fdf4;border-radius:12px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0"><div style="color:#16a34a;font-family:Outfit,sans-serif;font-weight:700;font-size:20px">Invoice &middot; Pay &middot; Done</div></div>
      </div>
    </div>

    <div class="lp2-tab-content" data-tab="expenses">
      <div class="lp2-tab-grid">
        <div class="lp2-tab-text">
          <h3>Track every dollar going out</h3>
          <p>Log expenses by category and job. Upload receipt photos and let AI automatically extract the date, amount, and description.</p>
          <ul class="lp2-tab-features">
            <li>AI-powered receipt scanning</li>
            <li>Link expenses to jobs and quotes</li>
            <li>Category breakdown and filtering</li>
            <li>Team member expense tracking</li>
            <li>Receipt photo storage and preview</li>
          </ul>
        </div>
        <div style="background:#fef2f2;border-radius:12px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0"><div style="color:#dc2626;font-family:Outfit,sans-serif;font-weight:700;font-size:20px">Scan &middot; Track &middot; Save</div></div>
      </div>
    </div>

    <div class="lp2-tab-content" data-tab="analytics">
      <div class="lp2-tab-grid">
        <div class="lp2-tab-text">
          <h3>Know your numbers at a glance</h3>
          <p>Revenue trends, expense breakdowns, profit margins, and custom reports. See how your business is actually performing.</p>
          <ul class="lp2-tab-features">
            <li>Revenue vs expenses dashboard</li>
            <li>Job profitability tracking</li>
            <li>Custom report builder</li>
            <li>Cash flow forecasting</li>
            <li>Budget tracking and alerts</li>
          </ul>
        </div>
        <div style="background:#faf5ff;border-radius:12px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0"><div style="color:#7c3aed;font-family:Outfit,sans-serif;font-weight:700;font-size:20px">Insights &middot; Reports &middot; Growth</div></div>
      </div>
    </div>

    <div class="lp2-tab-content" data-tab="team">
      <div class="lp2-tab-grid">
        <div class="lp2-tab-text">
          <h3>Your team, fully connected</h3>
          <p>Add team members with role-based permissions. Each worker sees only what they need. Track performance and assign tasks.</p>
          <ul class="lp2-tab-features">
            <li>Role-based access control</li>
            <li>Worker scheduling and color coding</li>
            <li>Salesperson performance tracking</li>
            <li>Team member login portals</li>
            <li>Client portal for customer access</li>
          </ul>
        </div>
        <div style="background:#fff7ed;border-radius:12px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0"><div style="color:#ea580c;font-family:Outfit,sans-serif;font-weight:700;font-size:20px">Assign &middot; Track &middot; Manage</div></div>
      </div>
    </div>
  </div>
</section>

<!-- WHY M4 CARDS -->
<section class="lp2-section">
  <div class="lp2-section-inner lp2-section-center">
    <div class="lp2-section-tag">Why M4 Streamline</div>
    <h2 class="lp2-section-h2">Built different, on purpose</h2>
    <p class="lp2-section-p">We are not a bloated enterprise tool with features you will never use. M4 is laser-focused on what tradies actually need.</p>
  </div>
  <div class="lp2-section-inner">
    <div class="lp2-cards">
      <div class="lp2-card">
        <div class="lp2-card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
        <div class="lp2-card-tag">Speed</div>
        <h3>2 minute setup</h3>
        <p>Sign up, add your business details, and start quoting. No onboarding calls, no training sessions, no waiting around.</p>
      </div>
      <div class="lp2-card">
        <div class="lp2-card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="lp2-card-tag">Simplicity</div>
        <h3>No bloat, no confusion</h3>
        <p>Every feature earns its place. Clean interface, fast performance, and nothing that gets in your way.</p>
      </div>
      <div class="lp2-card">
        <div class="lp2-card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
        <div class="lp2-card-tag">Pricing</div>
        <h3>Fraction of the cost</h3>
        <p>Buildertrend starts at $499/month. M4 gives you the same core features starting at $79/month. No locked contracts.</p>
      </div>
      <div class="lp2-card">
        <div class="lp2-card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/></svg></div>
        <div class="lp2-card-tag">Access</div>
        <h3>Works everywhere</h3>
        <p>Browser-based. Works on your phone, tablet, or computer. No app to install, no updates to manage. Always the latest version.</p>
      </div>
    </div>
  </div>
</section>

<!-- AI SECTION -->
<section class="lp2-ai-section" id="lp2-ai">
  <div class="lp2-ai-grid">
    <div>
      <div class="lp2-section-tag" style="background:rgba(45,212,191,0.1);border-color:rgba(45,212,191,0.2);color:#2dd4bf">AI Powered</div>
      <h2>Snap a receipt.<br><span>We handle the rest.</span></h2>
      <p>Take a photo of any receipt and our AI reads the date, amount, and merchant automatically. Just pick the job and category &mdash; done.</p>
      <ul class="lp2-ai-features">
        <li>${chk} Reads handwritten and printed receipts</li>
        <li>${chk} Extracts date, amount, and description</li>
        <li>${chk} Attaches photo to the expense record</li>
        <li>${chk} Works on any phone camera</li>
      </ul>
    </div>
    <div class="lp2-ai-mockup">
      <div class="lp2-ai-mockup-hd"><span></span><span></span><span></span></div>
      <div class="lp2-ai-scan">
        <div class="lp2-ai-scan-icon">&#128247;</div>
        <p>Receipt uploaded &middot; Scanning with AI...</p>
      </div>
      <div class="lp2-ai-result">
        <div class="lp2-ai-result-row"><span>Date</span><span>14 Mar 2026</span></div>
        <div class="lp2-ai-result-row"><span>Amount</span><span>$247.50</span></div>
        <div class="lp2-ai-result-row"><span>Merchant</span><span>Bunnings Warehouse</span></div>
        <div class="lp2-ai-result-row" style="border:none"><span>Category</span><span>Materials</span></div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="lp2-section lp2-section-dark" id="lp2-pricing">
  <div class="lp2-section-inner lp2-section-center">
    <div class="lp2-section-tag">Pricing</div>
    <h2 class="lp2-section-h2">Simple, honest pricing</h2>
    <p class="lp2-section-p">Start free. Upgrade when you are ready. No surprises, no lock-in contracts.</p>
  </div>
  <div class="lp2-pricing-grid">
    <div class="lp2-price-card">
      <h3>Trial</h3>
      <div class="price">Free <span>/ 14 days</span></div>
      <div class="price-note">No credit card required</div>
      <ul>
        <li>${chk} All features included</li>
        <li>${chk} Unlimited quotes and invoices</li>
        <li>${chk} AI receipt scanning</li>
        <li>${chk} Calendar and Gantt views</li>
      </ul>
      <button onclick="hideLanding()" class="lp2-price-btn">Start Free Trial</button>
    </div>
    <div class="lp2-price-card featured">
      <h3>Solo Trader</h3>
      <div class="price">$79 <span>/mo</span></div>
      <div class="price-note">Everything a sole trader needs</div>
      <ul>
        <li>${chk} Everything in Trial</li>
        <li>${chk} Unlimited clients and jobs</li>
        <li>${chk} Client portal</li>
        <li>${chk} Stripe payments</li>
        <li>${chk} PDF quotes and invoices</li>
        <li>${chk} Email and SMS automation</li>
      </ul>
      <button onclick="hideLanding()" class="lp2-price-btn primary">Get Started</button>
    </div>
    <div class="lp2-price-card">
      <h3>Business</h3>
      <div class="price">$149 <span>/mo</span></div>
      <div class="price-note">For growing teams</div>
      <ul>
        <li>${chk} Everything in Solo</li>
        <li>${chk} Unlimited team members</li>
        <li>${chk} Role-based permissions</li>
        <li>${chk} Team performance analytics</li>
        <li>${chk} Advanced reporting</li>
        <li>${chk} Priority support</li>
      </ul>
      <button onclick="hideLanding()" class="lp2-price-btn">Get Started</button>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="lp2-section" id="lp2-faq">
  <div class="lp2-section-inner lp2-section-center">
    <div class="lp2-section-tag">FAQ</div>
    <h2 class="lp2-section-h2">Got questions?</h2>
    <p class="lp2-section-p">Here are the ones we get asked most.</p>
  </div>
  <div class="lp2-faq">
    <div class="lp2-faq-item"><button class="lp2-faq-q" onclick="lp2ToggleFaq(this)">Is there really a free trial?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg></button><div class="lp2-faq-a">Yes, 14 days completely free with all features. No credit card required to start. You only pay if you decide to continue after the trial.</div></div>
    <div class="lp2-faq-item"><button class="lp2-faq-q" onclick="lp2ToggleFaq(this)">How is this different from Buildertrend?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg></button><div class="lp2-faq-a">M4 Streamline gives you the same core features (scheduling, quoting, invoicing, expenses, team management) at a fraction of the cost. Buildertrend starts at $499/month and requires annual contracts. We start at $79/month with no lock-in. We are built specifically for Australian and NZ tradies.</div></div>
    <div class="lp2-faq-item"><button class="lp2-faq-q" onclick="lp2ToggleFaq(this)">Can my team members access it?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg></button><div class="lp2-faq-a">Yes. On the Business plan, you can add unlimited team members with role-based permissions. Each person gets their own login and sees only what you allow them to access.</div></div>
    <div class="lp2-faq-item"><button class="lp2-faq-q" onclick="lp2ToggleFaq(this)">Can clients see their quotes and invoices?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg></button><div class="lp2-faq-a">Yes. M4 includes a client portal where customers can view quotes, accept or decline them, view invoices, and make payments online via Stripe.</div></div>
    <div class="lp2-faq-item"><button class="lp2-faq-q" onclick="lp2ToggleFaq(this)">What about the AI receipt scanning?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg></button><div class="lp2-faq-a">Just take a photo of any receipt. Our AI reads the date, amount, and merchant name automatically and pre-fills the expense form. You just pick the job and category. It is included on all plans at no extra cost.</div></div>
    <div class="lp2-faq-item"><button class="lp2-faq-q" onclick="lp2ToggleFaq(this)">Do I need to install anything?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg></button><div class="lp2-faq-a">No. M4 Streamline runs entirely in your web browser. It works on your phone, tablet, or computer. Nothing to install, nothing to update.</div></div>
    <div class="lp2-faq-item"><button class="lp2-faq-q" onclick="lp2ToggleFaq(this)">Can I cancel anytime?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg></button><div class="lp2-faq-a">Yes. No contracts, no cancellation fees. You can cancel your subscription at any time and your account stays active until the end of your billing period.</div></div>
  </div>
</section>

<!-- FOOTER CTA -->
<section class="lp2-footer-cta">
  <h2>Ready to streamline your business?</h2>
  <p>Join tradies across Australia and New Zealand who are saving time, getting paid faster, and knowing their numbers.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <button onclick="hideLanding()" class="lp2-btn-primary">Start Your Free 14-Day Trial &rarr;</button>
    <a href="mailto:m4projectsanddesigns@gmail.com" class="lp2-btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center;color:#fff;border-color:rgba(255,255,255,0.2)">Talk to Us</a>
  </div>
  <p class="lp2-hero-note" style="margin-top:20px;color:#64748b">No credit card required &middot; Setup in 2 minutes &middot; Cancel anytime</p>
</section>

<!-- FOOTER -->
<footer class="lp2-footer">
  <div class="lp2-footer-inner">
    <div class="lp2-footer-left"><span>M4</span> Streamline</div>
    <div class="lp2-footer-links">
      <a href="#lp2-features">Features</a>
      <a href="#lp2-pricing">Pricing</a>
      <a href="#lp2-faq">FAQ</a>
      <a href="mailto:m4projectsanddesigns@gmail.com">Contact</a>
      <a href="privacy-policy.html">Privacy</a>
      <a href="terms-of-service.html">Terms</a>
    </div>
    <div class="lp2-footer-copy">&copy; 2026 M4 Streamline. All rights reserved.</div>
  </div>
</footer>
`;

// ============ TAB SWITCHING ============
window.lp2SwitchTab = function(name, btn) {
  var tabs = document.querySelectorAll('.lp2-tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  btn.classList.add('active');
  var contents = document.querySelectorAll('.lp2-tab-content');
  for (var j = 0; j < contents.length; j++) {
    contents[j].classList.remove('active');
    if (contents[j].getAttribute('data-tab') === name) contents[j].classList.add('active');
  }
};

// ============ FAQ TOGGLE ============
window.lp2ToggleFaq = function(btn) {
  var isOpen = btn.classList.contains('open');
  // Close all
  var qs = document.querySelectorAll('.lp2-faq-q');
  var as = document.querySelectorAll('.lp2-faq-a');
  for (var i = 0; i < qs.length; i++) { qs[i].classList.remove('open'); }
  for (var j = 0; j < as.length; j++) { as[j].classList.remove('open'); }
  // Open clicked
  if (!isOpen) {
    btn.classList.add('open');
    var answer = btn.nextElementSibling;
    if (answer) answer.classList.add('open');
  }
};

// ============ NAV SCROLL EFFECT ============
window.addEventListener('scroll', function() {
  var nav = document.getElementById('lp2-nav');
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

console.log('Landing page v2 loaded');

} catch(e) {
  console.error('Landing page init error:', e);
}
})();
