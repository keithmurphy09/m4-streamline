// M4 Tradies Network Directory
// Replaces placeholder with live directory
// Additive only
(function(){
try {

var CATEGORIES = ['All','Builder','Plumber','Electrician','Carpenter','Painter','Roofer','Landscaper','Tiler','Concreter','Bricklayer','HVAC','Fencer','Plasterer','Flooring','Glazier','Locksmith','Pest Control','Demolition','Scaffolding','Other'];

var css = document.createElement('style');
css.textContent = [
'.nd-wrap{max-width:1200px;margin:0 auto}',
'.nd-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:24px}',
'.nd-title{font-size:24px;font-weight:800;color:#0f172a}.dark .nd-title{color:#fff}',
'.nd-sub{font-size:14px;color:#64748b;margin-top:4px}',
'.nd-list-btn{padding:12px 24px;font-size:14px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:10px;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(13,148,136,0.3)}.nd-list-btn:hover{background:#0f766e}',
'.nd-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}',
'.nd-filter{padding:6px 14px;font-size:12px;font-weight:600;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;border-radius:20px;cursor:pointer;font-family:inherit;transition:all 0.2s}.dark .nd-filter{background:#374151;border-color:#4b5563;color:#94a3b8}',
'.nd-filter:hover,.nd-filter-active{background:#0d9488;color:#fff;border-color:#0d9488}',
'.nd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}',
'.nd-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;transition:all 0.2s;display:flex;flex-direction:column}.dark .nd-card{background:#1f2937;border-color:#374151}',
'.nd-card:hover{border-color:#0d9488;box-shadow:0 4px 16px rgba(13,148,136,0.1)}',
'.nd-card-top{display:flex;gap:14px;align-items:flex-start;margin-bottom:12px}',
'.nd-card-logo{width:60px;height:60px;border-radius:10px;object-fit:contain;background:#f8fafc;border:1px solid #e2e8f0;flex-shrink:0}.dark .nd-card-logo{background:#374151;border-color:#4b5563}',
'.nd-card-logo-placeholder{width:60px;height:60px;border-radius:10px;background:linear-gradient(135deg,#0d9488,#14b8a6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;flex-shrink:0}',
'.nd-card-name{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:2px}.dark .nd-card-name{color:#fff}',
'.nd-card-cat{font-size:11px;font-weight:600;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px}',
'.nd-card-desc{font-size:13px;color:#64748b;line-height:1.5;margin-bottom:12px;flex:1}',
'.nd-card-info{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#475569;border-top:1px solid #f1f5f9;padding-top:12px}.dark .nd-card-info{border-color:#374151;color:#94a3b8}',
'.nd-card-info a{color:#0d9488;text-decoration:none}.nd-card-info a:hover{text-decoration:underline}',
'.nd-card-area{font-size:11px;color:#94a3b8;margin-top:4px}',
'.nd-empty{text-align:center;padding:60px 20px;color:#94a3b8}',
'.nd-empty h3{font-size:20px;margin-bottom:8px;color:#64748b}',
// Modal
'.nd-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px}',
'.nd-modal-box{background:#fff;border-radius:16px;padding:28px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto}.dark .nd-modal-box{background:#1f2937}',
'.nd-modal-title{font-size:20px;font-weight:800;margin-bottom:4px}.dark .nd-modal-title{color:#fff}',
'.nd-modal-sub{font-size:13px;color:#64748b;margin-bottom:20px;line-height:1.5}',
'.nd-field{margin-bottom:14px}',
'.nd-field label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px}.dark .nd-field label{color:#d1d5db}',
'.nd-field input,.nd-field select,.nd-field textarea{width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box}.dark .nd-field input,.dark .nd-field select,.dark .nd-field textarea{background:#374151;border-color:#4b5563;color:#fff}',
'.nd-field textarea{height:80px;resize:vertical}',
'.nd-price{background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:14px;margin-bottom:16px;text-align:center}.dark .nd-price{background:rgba(13,148,136,0.1);border-color:#0d9488}',
'.nd-price-amount{font-size:28px;font-weight:800;color:#0d9488}',
'.nd-price-period{font-size:13px;color:#64748b}',
'.nd-submit{width:100%;padding:12px;font-size:14px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:10px;cursor:pointer;font-family:inherit}.nd-submit:hover{background:#0f766e}',
'.nd-cancel{width:100%;padding:10px;font-size:13px;color:#64748b;background:none;border:none;cursor:pointer;font-family:inherit;margin-top:8px}',
// Badge
'.nd-badge{display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;background:#0d9488;color:#fff;border-radius:10px;margin-left:6px}',
'@media(max-width:768px){.nd-grid{grid-template-columns:1fr}.nd-header{flex-direction:column;align-items:flex-start}}'
].join('\n');
document.head.appendChild(css);

var _ndDone = false;

function isNetworkPage() {
  // Check if Networking & Directory tab is active
  var active = false;
  document.querySelectorAll('button').forEach(function(b) {
    if (b.textContent.trim() === 'Networking & Directory') {
      var cls = b.className || '';
      if (cls.indexOf('teal') !== -1 || cls.indexOf('active') !== -1 || cls.indexOf('font-bold') !== -1) active = true;
      // Also check if parent has active indicator
      if (b.style.fontWeight === 'bold' || b.style.color) active = true;
    }
  });
  return active;
}

async function renderDirectory(container) {
  if (!container) return;
  container.dataset.ndDone = '1';

  // Load listings
  var listings = [];
  try {
    var r = await supabaseClient.from('network_listings').select('*').eq('status', 'active').order('created_at', { ascending: false });
    listings = r.data || [];
  } catch(e) { console.error('Network load error:', e); }

  // Check if current user has a listing
  var hasListing = false;
  if (typeof currentUser !== 'undefined' && currentUser) {
    listings.forEach(function(l) {
      if (l.user_id === currentUser.id) hasListing = true;
    });
  }

  // Build page
  var h = '<div class="nd-wrap">';

  // Header
  h += '<div class="nd-header">';
  h += '<div><div class="nd-title">Tradies Network Directory</div><div class="nd-sub">Find trusted tradies or list your business to get found</div></div>';
  if (!hasListing) {
    h += '<button class="nd-list-btn" onclick="openListingForm()">List Your Business - $49/mo</button>';
  } else {
    h += '<button class="nd-list-btn" onclick="openListingForm(true)" style="background:#475569">Edit My Listing</button>';
  }
  h += '</div>';

  // Category filters
  h += '<div class="nd-filters">';
  CATEGORIES.forEach(function(cat) {
    h += '<button class="nd-filter' + (cat === 'All' ? ' nd-filter-active' : '') + '" onclick="filterListings(\'' + cat + '\',this)">' + cat + '</button>';
  });
  h += '</div>';

  // Listings grid
  if (listings.length > 0) {
    h += '<div class="nd-grid" id="nd-grid">';
    listings.forEach(function(l) {
      h += renderCard(l);
    });
    h += '</div>';
  } else {
    h += '<div class="nd-empty"><h3>Be the first to list!</h3><p>Get your business in front of tradies across the network.</p></div>';
  }

  h += '</div>';

  container.innerHTML = h;
}

function renderCard(l) {
  var logo = l.logo_url
    ? '<img class="nd-card-logo" src="' + l.logo_url + '" alt="' + l.business_name + '">'
    : '<div class="nd-card-logo-placeholder">' + l.business_name.charAt(0).toUpperCase() + '</div>';

  var h = '<div class="nd-card" data-cat="' + l.trade_category + '">';
  h += '<div class="nd-card-top">';
  h += logo;
  h += '<div><div class="nd-card-name">' + l.business_name + '</div><div class="nd-card-cat">' + l.trade_category + '</div></div>';
  h += '</div>';
  if (l.description) h += '<div class="nd-card-desc">' + l.description + '</div>';
  h += '<div class="nd-card-info">';
  if (l.phone) h += '<div><span style="color:#0d9488">Ph:</span> <a href="tel:' + l.phone + '">' + l.phone + '</a></div>';
  if (l.email) h += '<div><span style="color:#0d9488">Em:</span> <a href="mailto:' + l.email + '">' + l.email + '</a></div>';
  if (l.website) h += '<div><span style="color:#0d9488">Web:</span> <a href="' + (l.website.indexOf('http') === 0 ? l.website : 'https://' + l.website) + '" target="_blank">' + l.website + '</a></div>';
  h += '</div>';
  if (l.area_served) h += '<div class="nd-card-area">Area: ' + l.area_served + '</div>';
  h += '</div>';
  return h;
}

// Filter by category
window.filterListings = function(cat, btn) {
  // Update active filter button
  document.querySelectorAll('.nd-filter').forEach(function(f) { f.classList.remove('nd-filter-active'); });
  btn.classList.add('nd-filter-active');

  // Show/hide cards
  document.querySelectorAll('.nd-card').forEach(function(card) {
    if (cat === 'All') { card.style.display = ''; return; }
    card.style.display = card.getAttribute('data-cat') === cat ? '' : 'none';
  });
};

// Open listing form
window.openListingForm = async function(isEdit) {
  if (document.getElementById('nd-modal')) return;

  var existing = null;
  if (isEdit && currentUser) {
    try {
      var r = await supabaseClient.from('network_listings').select('*').eq('user_id', currentUser.id).limit(1);
      if (r.data && r.data.length > 0) existing = r.data[0];
    } catch(e) {}
  }

  var overlay = document.createElement('div');
  overlay.className = 'nd-modal';
  overlay.id = 'nd-modal';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var catOptions = '';
  CATEGORIES.forEach(function(c) {
    if (c === 'All') return;
    catOptions += '<option value="' + c + '"' + (existing && existing.trade_category === c ? ' selected' : '') + '>' + c + '</option>';
  });

  var h = '<div class="nd-modal-box">';
  h += '<div style="display:flex;justify-content:space-between"><div class="nd-modal-title">' + (isEdit ? 'Edit Your Listing' : 'List Your Business') + '</div><button onclick="document.getElementById(\'nd-modal\').remove()" style="background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer">&times;</button></div>';

  if (!isEdit) {
    h += '<div class="nd-modal-sub">Get your business seen by tradies across the network. Your listing appears in the directory for all users to find.</div>';
    h += '<div class="nd-price"><div class="nd-price-amount">$49<span style="font-size:16px;font-weight:400">/mo</span></div><div class="nd-price-period">Cancel anytime</div></div>';
  }

  h += '<div class="nd-field"><label>Business Name *</label><input id="nd-name" value="' + (existing ? existing.business_name : '') + '" placeholder="Your business name"></div>';
  h += '<div class="nd-field"><label>Trade Category *</label><select id="nd-cat">' + catOptions + '</select></div>';
  h += '<div class="nd-field"><label>Description</label><textarea id="nd-desc" placeholder="What do you do? What makes you different?">' + (existing ? existing.description || '' : '') + '</textarea></div>';
  h += '<div class="nd-field"><label>Phone</label><input id="nd-phone" value="' + (existing ? existing.phone || '' : '') + '" placeholder="04XX XXX XXX"></div>';
  h += '<div class="nd-field"><label>Email</label><input id="nd-email" type="email" value="' + (existing ? existing.email || '' : (currentUser ? currentUser.email : '')) + '" placeholder="you@business.com"></div>';
  h += '<div class="nd-field"><label>Website</label><input id="nd-web" value="' + (existing ? existing.website || '' : '') + '" placeholder="www.yourbusiness.com.au"></div>';
  h += '<div class="nd-field"><label>Logo</label>';
  if (existing && existing.logo_url) {
    h += '<div style="margin-bottom:8px"><img src="' + existing.logo_url + '" style="height:50px;width:auto;border-radius:6px;border:1px solid #e2e8f0"></div>';
  }
  h += '<input id="nd-logo-file" type="file" accept="image/*" style="font-size:12px"></div>';
  h += '<input id="nd-logo-existing" type="hidden" value="' + (existing ? existing.logo_url || '' : '') + '">';
  h += '<div class="nd-field"><label>Area Served</label><input id="nd-area" value="' + (existing ? existing.area_served || '' : '') + '" placeholder="e.g. Brisbane, Gold Coast, SE QLD"></div>';

  h += '<button class="nd-submit" onclick="saveListing(' + (existing ? '\'' + existing.id + '\'' : 'null') + ')">' + (isEdit ? 'Update Listing' : 'Submit & Subscribe - $49/mo') + '</button>';
  h += '<button class="nd-cancel" onclick="document.getElementById(\'nd-modal\').remove()">Cancel</button>';
  h += '</div>';

  overlay.innerHTML = h;
  document.body.appendChild(overlay);
};

// Save listing
window.saveListing = async function(existingId) {
  var name = document.getElementById('nd-name').value.trim();
  var cat = document.getElementById('nd-cat').value;
  var desc = document.getElementById('nd-desc').value.trim();
  var phone = document.getElementById('nd-phone').value.trim();
  var email = document.getElementById('nd-email').value.trim();
  var web = document.getElementById('nd-web').value.trim();
  var area = document.getElementById('nd-area').value.trim();

  if (!name) { showNotification('Business name is required', 'error'); return; }
  if (!cat) { showNotification('Select a trade category', 'error'); return; }

  // Handle logo upload
  var logoUrl = document.getElementById('nd-logo-existing').value || '';
  var fileInput = document.getElementById('nd-logo-file');
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    try {
      var file = fileInput.files[0];
      var ext = file.name.split('.').pop().toLowerCase();
      var fileName = currentUser.id + '_' + Date.now() + '.' + ext;
      var upload = await supabaseClient.storage.from('logos').upload(fileName, file, { upsert: true });
      if (upload.error) {
        showNotification('Logo upload failed: ' + upload.error.message, 'error');
        return;
      }
      var pubUrl = supabaseClient.storage.from('logos').getPublicUrl(fileName);
      logoUrl = pubUrl.data.publicUrl;
    } catch(e) {
      showNotification('Logo upload error: ' + e.message, 'error');
      return;
    }
  }

  var data = {
    business_name: name,
    trade_category: cat,
    description: desc,
    phone: phone,
    email: email,
    website: web,
    logo_url: logoUrl,
    area_served: area,
    updated_at: new Date().toISOString()
  };

  try {
    if (existingId) {
      // Update existing
      var r = await supabaseClient.from('network_listings').update(data).eq('id', existingId);
      if (r.error) { showNotification('Error: ' + r.error.message, 'error'); return; }
      showNotification('Listing updated!', 'success');
    } else {
      // New listing
      data.user_id = currentUser.id;
      data.status = 'active';
      data.subscription_status = 'pending';

      var r2 = await supabaseClient.from('network_listings').insert([data]);
      if (r2.error) { showNotification('Error: ' + r2.error.message, 'error'); return; }

      // TODO: Redirect to Stripe checkout for $49/mo
      // For now, notify admin to set up billing
      try {
        await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            to_email: 'm4projectsanddesigns@gmail.com',
            to_name: 'Admin',
            subject: 'New Network Listing: ' + name,
            html_content: '<p><strong>' + name + '</strong> (' + cat + ') has submitted a network listing.</p><p>Email: ' + email + '</p><p>Set up $49/mo billing in Stripe.</p>'
          })
        });
      } catch(e) {}

      showNotification('Listing submitted! We will be in touch to activate your listing.', 'success');
    }

    document.getElementById('nd-modal').remove();
    // Re-render directory
    var placeholder = document.querySelector('.nd-wrap') || document.querySelector('.res-coming-soon');
    if (placeholder) {
      delete placeholder.dataset.ndDone;
      renderDirectory(placeholder);
    }

  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

// Observer
var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(function() {
    if (!currentUser) return;
    var placeholder = document.querySelector('.res-coming-soon');
    if (placeholder && !placeholder.dataset.ndDone) {
      renderDirectory(placeholder);
    }
  }, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Network directory loaded');

} catch(e) {
  console.error('Network directory error:', e);
}
})();
