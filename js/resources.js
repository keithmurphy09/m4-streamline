// M4 Resources & Networking
// Adds "Resources" dropdown to main nav with coming soon pages
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.res-coming-soon{max-width:800px;margin:0 auto;text-align:center;padding:60px 20px}',
'.res-icon-wrap{width:80px;height:80px;border-radius:20px;background:#f0fdfa;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}',
'.dark .res-icon-wrap{background:rgba(13,148,136,0.15)}',
'.res-title{font-family:Outfit,sans-serif;font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px}',
'.dark .res-title{color:#fff}',
'.res-desc{font-size:16px;color:#64748b;line-height:1.7;margin:0 0 40px;max-width:500px;margin-left:auto;margin-right:auto}',
'.dark .res-desc{color:#9ca3af}',
'',
'.res-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:40px;text-align:left}',
'.res-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;transition:all 0.2s}',
'.res-card:hover{border-color:#99f6e4;box-shadow:0 4px 16px rgba(0,0,0,0.05);transform:translateY(-2px)}',
'.dark .res-card{background:#1f2937;border-color:#374151}',
'.dark .res-card:hover{border-color:#2dd4bf}',
'.res-card-title{font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px}',
'.dark .res-card-title{color:#e2e8f0}',
'.res-card-desc{font-size:13px;color:#64748b;line-height:1.5}',
'.dark .res-card-desc{color:#9ca3af}',
'.res-card-tag{display:inline-block;padding:3px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#0d9488;background:#f0fdfa;border-radius:20px;border:1px solid #ccfbf1;margin-bottom:12px}',
'.dark .res-card-tag{background:rgba(13,148,136,0.1);border-color:rgba(45,212,191,0.2);color:#2dd4bf}',
'',
'.res-advertise{background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:40px;color:#fff;text-align:center}',
'.res-advertise h3{font-family:Outfit,sans-serif;font-size:22px;font-weight:700;margin:0 0 8px}',
'.res-advertise p{font-size:14px;color:#94a3b8;margin:0 0 20px}',
'.res-advertise-btn{padding:12px 28px;font-size:14px;font-weight:700;color:#0f172a;background:#2dd4bf;border:none;border-radius:8px;cursor:pointer;font-family:inherit;transition:all 0.15s}',
'.res-advertise-btn:hover{background:#14b8a6;color:#fff}',
'',
'.res-notify-form{display:flex;gap:8px;max-width:400px;margin:0 auto}',
'.res-notify-input{flex:1;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;outline:none}',
'.dark .res-notify-input{background:#374151;color:#e2e8f0;border-color:#4b5563}',
'.res-notify-input:focus{border-color:#0d9488}',
'.res-notify-btn{padding:12px 20px;background:#0d9488;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}',
'.res-notify-btn:hover{background:#0f766e}'
].join('\n');
document.head.appendChild(css);

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============ TAB DATA ============
var RES_TABS = {
  ebooks: {
    title: 'Ebooks & Guides',
    icon: '<svg width="36" height="36" fill="none" stroke="#0d9488" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
    desc: 'Curated ebooks, business guides, and resources for trade professionals. From pricing strategies to business growth.',
    cards: [
      { tag: 'Coming Soon', title: 'Business Growth for Tradies', desc: 'Practical strategies for scaling your trade business from solo to team.' },
      { tag: 'Coming Soon', title: 'Pricing Your Work Right', desc: 'How to quote profitably without losing clients.' },
      { tag: 'Coming Soon', title: 'Cash Flow Mastery', desc: 'Managing money in and out for construction businesses.' }
    ]
  },
  podcasts: {
    title: 'Podcasts',
    icon: '<svg width="36" height="36" fill="none" stroke="#0d9488" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>',
    desc: 'Trade industry podcasts covering business tips, industry news, and interviews with successful builders and contractors.',
    cards: [
      { tag: 'Coming Soon', title: 'The Tradie Show', desc: 'Weekly episodes on running a successful trade business in Australia.' },
      { tag: 'Coming Soon', title: 'Build Better', desc: 'Interviews with top builders sharing what works and what doesn\'t.' },
      { tag: 'Coming Soon', title: 'Trade Talk', desc: 'Industry news, trends, and practical business advice.' }
    ]
  },
  training: {
    title: 'Training & Courses',
    icon: '<svg width="36" height="36" fill="none" stroke="#0d9488" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>',
    desc: 'Online courses and training programs to upskill your team and grow your business.',
    cards: [
      { tag: 'Coming Soon', title: 'M4 Platform Masterclass', desc: 'Get the most out of every M4 Streamline feature.' },
      { tag: 'Coming Soon', title: 'Quoting & Estimating', desc: 'Learn to create winning quotes that protect your margins.' },
      { tag: 'Coming Soon', title: 'Digital Marketing for Trades', desc: 'Get found online and win more work.' }
    ]
  },
  events: {
    title: 'Events & Expos',
    icon: '<svg width="36" height="36" fill="none" stroke="#0d9488" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>',
    desc: 'Trade expos, supplier open days, networking events, and industry meetups across Australia and New Zealand.',
    cards: [
      { tag: 'Coming Soon', title: 'Trade Expos Calendar', desc: 'Never miss an industry expo or supplier event near you.' },
      { tag: 'Coming Soon', title: 'M4 User Meetups', desc: 'Connect with other M4 users in your area.' },
      { tag: 'Coming Soon', title: 'Webinars & Workshops', desc: 'Free online sessions on business growth and M4 features.' }
    ]
  },
  networking: {
    title: 'Networking & Directory',
    icon: '<svg width="36" height="36" fill="none" stroke="#0d9488" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>',
    desc: 'Find and connect with other tradies. List your business, qualifications, and service areas. Get found by builders who need your trade.',
    cards: [
      { tag: 'Coming Soon', title: 'Tradie Directory', desc: 'Search by trade, location, and availability. Find the right subbie for any job.' },
      { tag: 'Coming Soon', title: 'List Your Business', desc: 'Showcase your qualifications, portfolio, and service area to other trades.' },
      { tag: 'Coming Soon', title: 'Job Board', desc: 'Post or find subcontracting opportunities in your area.' }
    ]
  }
};

// ============ RENDER RESOURCE PAGE ============
window.renderResourcePage = function(tab) {
  var data = RES_TABS[tab];
  if (!data) return '';

  var cardsH = '';
  for (var i = 0; i < data.cards.length; i++) {
    var c = data.cards[i];
    cardsH += '<div class="res-card">' +
      '<div class="res-card-tag">' + escH(c.tag) + '</div>' +
      '<div class="res-card-title">' + escH(c.title) + '</div>' +
      '<div class="res-card-desc">' + escH(c.desc) + '</div>' +
    '</div>';
  }

  return '<div class="res-coming-soon">' +
    '<div class="res-icon-wrap">' + data.icon + '</div>' +
    '<h1 class="res-title">' + escH(data.title) + '</h1>' +
    '<p class="res-desc">' + escH(data.desc) + '</p>' +

    '<div class="res-cards">' + cardsH + '</div>' +

    '<div style="margin-bottom:40px;">' +
      '<p style="font-size:14px;color:#64748b;margin-bottom:12px;" class="dark:text-gray-400">Get notified when this launches:</p>' +
      '<div class="res-notify-form">' +
        '<input type="email" class="res-notify-input" placeholder="Enter your email" id="res-notify-email" />' +
        '<button class="res-notify-btn" onclick="resNotifyMe()">Notify Me</button>' +
      '</div>' +
    '</div>' +

    '<div class="res-advertise">' +
      '<h3>Want your brand here?</h3>' +
      '<p>Reach thousands of trade professionals across Australia and New Zealand.</p>' +
      '<button class="res-advertise-btn" onclick="window.location.href=\'mailto:m4projectsanddesigns@gmail.com?subject=Advertising Enquiry - ' + escH(data.title) + '\'">Advertise With Us</button>' +
    '</div>' +
  '</div>';
};

window.resNotifyMe = function() {
  var email = document.getElementById('res-notify-email');
  if (!email || !email.value.includes('@')) {
    showNotification('Please enter a valid email', 'error');
    return;
  }
  showNotification('Thanks! We\'ll notify you when this launches.', 'success');
  email.value = '';
};

// ============ INJECT NAV DROPDOWN ============
function injectResourcesNav() {
  // Desktop nav - find the closing </nav> after Company dropdown
  var desktopNav = document.querySelector('nav.hidden.md\\:flex');
  if (!desktopNav) return;
  if (desktopNav.dataset.resAdded) return;
  desktopNav.dataset.resAdded = 'true';

  // Find last dropdown (Company)
  var dropdowns = desktopNav.querySelectorAll('.relative.group');
  if (dropdowns.length === 0) return;
  var lastDropdown = dropdowns[dropdowns.length - 1];

  var resTabs = Object.keys(RES_TABS);
  var isActive = resTabs.some(function(t) { return activeTab === 'res_' + t; });

  var resDropdown = document.createElement('div');
  resDropdown.className = 'relative group';
  resDropdown.innerHTML =
    '<button class="px-4 py-2 text-sm font-medium ' + (isActive ? 'text-teal-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700') + ' rounded transition-colors flex items-center gap-1">' +
      'Resources' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>' +
    '</button>' +
    '<div class="hidden group-hover:block absolute top-full left-0 pt-2 -mt-2 w-52 z-50">' +
      '<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">' +
        resTabs.map(function(key) {
          var d = RES_TABS[key];
          var act = activeTab === 'res_' + key;
          return '<button onclick="switchTab(\'res_' + key + '\')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ' + (act ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : '') + '">' + escH(d.title) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';

  lastDropdown.parentElement.insertBefore(resDropdown, lastDropdown.nextSibling);
}

// ============ INJECT MOBILE MENU ============
function injectResourcesMobile() {
  var mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenu) return;
  if (mobileMenu.dataset.resAdded) return;
  mobileMenu.dataset.resAdded = 'true';

  // Find the last section in mobile menu
  var menuContent = mobileMenu.querySelector('.p-6 > div') || mobileMenu.querySelector('.p-6');
  if (!menuContent) return;

  var resTabs = Object.keys(RES_TABS);
  var h = '<div class="pt-4 pb-2 px-4 text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Resources</div>';
  resTabs.forEach(function(key) {
    var d = RES_TABS[key];
    var act = activeTab === 'res_' + key;
    h += '<button onclick="switchTabMobile(\'res_' + key + '\')" class="w-full text-left px-4 py-3 text-base ' +
      (act ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700') +
      ' rounded-r">' + escH(d.title) + '</button>';
  });

  menuContent.insertAdjacentHTML('beforeend', h);
}

// ============ HOOK INTO renderApp ============
var _origRenderApp = window.renderApp;
if (_origRenderApp) {
  window.renderApp = function() {
    // Check if we're on a resources tab
    if (typeof activeTab === 'string' && activeTab.startsWith('res_')) {
      var resKey = activeTab.replace('res_', '');
      // We need to render the page content
      var contentArea = document.querySelector('.max-w-7xl.mx-auto.p-3.md\\:p-6');
      if (contentArea) {
        contentArea.innerHTML = renderResourcePage(resKey);
      }
    }
    _origRenderApp();
  };
}

// ============ HOOK INTO getTabContent ============
// Override the content rendering for resource tabs
var _origSwitchTab = window.switchTab;
window.switchTab = function(tab) {
  if (tab && tab.startsWith('res_')) {
    activeTab = tab;
    renderApp();
    return;
  }
  _origSwitchTab(tab);
};

// ============ OBSERVER ============
var _resTimer = null;
var _resObs = new MutationObserver(function() {
  if (_resTimer) clearTimeout(_resTimer);
  _resTimer = setTimeout(function() {
    if (!currentUser) return;
    injectResourcesNav();
    injectResourcesMobile();
  }, 200);
});
_resObs.observe(document.body, { childList: true, subtree: true });

console.log('Resources module loaded');

} catch(e) {
  console.error('Resources init error:', e);
}
})();
