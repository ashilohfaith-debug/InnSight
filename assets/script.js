// ===== INNSIGHT PROTOTYPE DATA ENGINE =====
const LISTINGS_DB = {
  "lisbon-loft": {
    id: "lisbon-loft",
    name: "Downtown Designer Loft",
    address: "Rua da Madalena 142, Lisbon, Portugal",
    coords: [38.7123, -9.1368],
    baseRate: 156.00,
    cleaningFee: 45.00,
    taxRates: [
      { name: "Portugal IVA Tourist Tax", rate: 0.06 },
      { name: "Lisbon Municipal Stay Fee", rate: 0.02 }
    ],
    availabilityGrid: 0xFF0F00, // Binary representation: 111111110000111100000000 (hours occupied, clean, occupied)
    unverifiedAmenities: [],
    groundTruthSummary: {
      wifiSpeedMbps: 185,
      noiseLevelDb: 42,
      walkability: 96,
      summary: "High-speed fiber verified by multiple guest tests. street noise minimized via modern acoustic double glazing, though local historic tram line operates adjacent."
    },
    reviews: [
      "Incredibly fast wifi, got 190mbps down. The street noise is practically non-existent thanks to double glazing. Very walkable to Chiado cafes.",
      "Beautiful place! Wi-Fi was rock solid for Zoom calls. Very clean, though you can occasionally hear the tram rattle by if the windows are open."
    ],
    claimedAmenities: ["Dedicated Workspace", "Kitchen", "Air Conditioning", "Wi-Fi Router"],
    s3Photos: [],
    gpsAddress: [38.7123, -9.1368]
  },
  "alpine": {
    id: "alpine",
    name: "Alpine Wood Cabin",
    address: "Scheidgasse 18, Interlaken, Switzerland",
    coords: [46.6863, 7.8632],
    baseRate: 198.00,
    cleaningFee: 60.00,
    taxRates: [
      { name: "Swiss VAT Tourist Levy", rate: 0.038 },
      { name: "Interlaken Resort Infrastructure Fee", rate: 0.015 }
    ],
    availabilityGrid: 0xFF0F00,
    unverifiedAmenities: [],
    groundTruthSummary: {
      wifiSpeedMbps: 82,
      noiseLevelDb: 31,
      walkability: 74,
      summary: "Calm alpine atmosphere. Wi-Fi operates via solid VDSL connection, occasionally dropping speed during snowstorms. Town center is a moderate walk."
    },
    reviews: [
      "Extremely quiet, literally only heard birds. Wi-Fi was about 80 Mbps, good enough for work. Beautiful path to the main train station.",
      "Lovely cabin in Interlaken! Very quiet sleep. Wi-Fi speed fluctuates a bit but mostly reliable. Worth the walk into town."
    ],
    claimedAmenities: ["Fireplace", "Hot Tub", "Dedicated Workspace", "Wi-Fi Router"],
    s3Photos: [],
    gpsAddress: [46.6863, 7.8632]
  },
  "rice-terrace": {
    id: "rice-terrace",
    name: "Rice Terrace Retreat",
    address: "Jalan Raya Tegallalang, Ubud, Bali",
    coords: [-8.5069, 115.2625],
    baseRate: 112.00,
    cleaningFee: 30.00,
    taxRates: [
      { name: "Indonesia PB1 Hotel Tax", rate: 0.10 },
      { name: "Gianyar Tourism Development Fee", rate: 0.01 }
    ],
    availabilityGrid: 0xFF0F00,
    unverifiedAmenities: [],
    groundTruthSummary: {
      wifiSpeedMbps: 120,
      noiseLevelDb: 38,
      walkability: 60,
      summary: "Surrounded by nature sounds. High-speed fiber line with dedicated back-up battery. High dependency on taxi or scooter rentals to reach Ubud center."
    },
    reviews: [
      "Stunning rice terrace view. WiFi is blazing fast for Bali, around 120 Mbps. Lots of insect sounds at night, but very peaceful. You need a scooter.",
      "The dedicated fiber line is fantastic for remote work here! Very quiet, though you will hear geckos. Not walkable to town, hire a driver."
    ],
    claimedAmenities: ["Swimming Pool", "Open Air Lounge", "Dedicated Workspace", "Wi-Fi Router"],
    s3Photos: [],
    gpsAddress: [-8.5069, 115.2625]
  },
  "cliffside": {
    id: "cliffside",
    name: "Cliffside Villa Santorini",
    address: "Oia Caldera Path 12, Santorini, Greece",
    coords: [36.4618, 25.3753],
    baseRate: 284.00,
    cleaningFee: 80.00,
    taxRates: [
      { name: "Greece Luxury VAT", rate: 0.13 },
      { name: "Climate Resilience Green Fee", rate: 0.04 }
    ],
    availabilityGrid: 0xFF0F00,
    unverifiedAmenities: [],
    groundTruthSummary: {
      wifiSpeedMbps: 95,
      noiseLevelDb: 45,
      walkability: 92,
      summary: "Caldera cliff walkway. Street noise matches pedestrian traffic during day. Outstanding walking accessibility to sunset lookouts and local bistros."
    },
    reviews: [
      "Views are breathtaking. Wi-Fi was fine at 90mbps. You hear some tourists walking past the roof during sunset hours, but very quiet otherwise.",
      "A cave villa dream! Extremely walkable to everything in Oia. Wi-Fi worked great. A bit noisy outside during the afternoon but peaceful at night."
    ],
    claimedAmenities: ["Cave Pool", "Sunset Terrace", "Dedicated Workspace", "Wi-Fi Router"],
    s3Photos: [],
    gpsAddress: [36.4618, 25.3753]
  }
};

// Global Interactive States
let currentSelectedListing = null;
let leafletMap = null;
let mapMarkers = {};
let activeView = 'landing';
let activeUser = null; // Profile Auth state
let mapBoundingBoxCircle = null;

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  initLandingCounters();
  initVerifyTabs();
  initGlobalAuth();
  initHeroLogoTilt();
  initSocialFeedStore();

  // Check redirection state from post.html back to social feed
  const redirectTab = localStorage.getItem('redirectTab');
  if (redirectTab) {
    localStorage.removeItem('redirectTab');
    switchView(redirectTab);
  }
  
  // Default load listings table on Admin page
  renderAdminListings();
});

// ===== HERO NODES DYNAMIC INTERACTION =====
function initHeroLogoTilt() {
  const hero = document.querySelector('.hero');
  const nodes = document.querySelectorAll('.hero-vector-overlay circle');
  if (!hero || nodes.length === 0) return;
  
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Iterate and attract nodes based on proximity
    nodes.forEach(node => {
      const cx = parseFloat(node.getAttribute('cx'));
      const cy = parseFloat(node.getAttribute('cy'));
      
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 200) {
        const pull = (200 - dist) / 12;
        const pullX = (dx / dist) * pull;
        const pullY = (dy / dist) * pull;
        node.style.transform = `translate(${pullX}px, ${pullY}px)`;
        node.setAttribute('opacity', '1');
      } else {
        node.style.transform = 'translate(0px, 0px)';
        node.setAttribute('opacity', '0.7');
      }
    });
  });
  
  hero.addEventListener('mouseleave', () => {
    nodes.forEach(node => {
      node.style.transform = 'translate(0px, 0px)';
      node.setAttribute('opacity', '0.7');
    });
  });
}

// ===== STICKY NAV SHADOW =====
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ===== DYNAMIC VIEW SWITCHING =====
function switchView(viewName) {
  activeView = viewName;
  
  // Update nav tab active button state
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeTabBtn = document.getElementById(`tab-${viewName}`);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  // Toggle visible containers
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`view-${viewName}`).classList.add('active');

  // Handle specialized views
  if (viewName === 'guest') {
    initLeafletMap();
  } else if (viewName === 'social') {
    renderSocialFeed();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== REVEAL ON SCROLL =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), i * 60 % 240);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== LANDING SCREEN COUNTERS =====
function initLandingCounters() {
  const counters = document.querySelectorAll('.metric .big');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.value);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = target * eased;
          el.textContent = (target % 1 === 0 ? Math.round(current) : current.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterObserver.observe(el));
}

// ===== FEATURE LAYER VERIFICATION TABS =====
function initVerifyTabs() {
  const vtabs = document.querySelectorAll('.vtab');
  const vpanels = document.querySelectorAll('.verify-panel');
  vtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      vtabs.forEach(t => t.classList.remove('active'));
      vpanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
}

// ===== MAP ENGINE (LEAFLET + MOCK MAPBOX GL STYLE) =====
function initLeafletMap() {
  if (leafletMap) {
    // Redraw and recalculate sizing
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 100);
    return;
  }

  // Create leaflet map targeting Lisbon center as start
  leafletMap = L.map('map', {
    center: [38.7123, -9.1368],
    zoom: 13,
    zoomControl: true,
    scrollWheelZoom: true
  });

  // Load a sleek Mapbox-looking dark/light hybrid tile theme (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(leafletMap);

  // Bind spatial index search tracker (simulating PostGIS R-Tree queries on drag)
  leafletMap.on('moveend', () => {
    const center = leafletMap.getCenter();
    const bounds = leafletMap.getBounds();
    
    // Draw/update PostGIS bounding box visualizer circle
    if (mapBoundingBoxCircle) {
      mapBoundingBoxCircle.setLatLng(center);
    } else {
      mapBoundingBoxCircle = L.circle(center, {
        color: 'var(--accent)',
        fillColor: 'var(--sky)',
        fillOpacity: 0.08,
        radius: 1200,
        dashArray: '5, 8'
      }).addTo(leafletMap);
    }

    // Simulate database spatial query
    document.getElementById('spatial-stats').innerHTML = `
      <strong>PostGIS spatial coordinate scan:</strong><br>
      Query box center: <code>POINT(${center.lat.toFixed(5)} ${center.lng.toFixed(5)})</code><br>
      R-Tree index matched: <strong>${Math.floor(Math.random() * 2) + 2} properties</strong> in frame.
    `;
  });

  // Render markers for all Listings in DB
  Object.keys(LISTINGS_DB).forEach(key => {
    const property = LISTINGS_DB[key];
    
    // Calculate upfront rate for 1 night as marker label
    const taxSum = property.taxRates.reduce((sum, tax) => sum + (property.baseRate + property.cleaningFee) * tax.rate, 0);
    const finalPrice = Math.round(property.baseRate + property.cleaningFee + taxSum);

    // Create price-tag div icon
    const priceIcon = L.divIcon({
      className: 'price-marker',
      html: `<div style="background:var(--navy); color:#fff; font-weight:800; font-size:12px; padding:6px 10px; border-radius:999px; border:2px solid #fff; box-shadow:var(--shadow-sm); white-space:nowrap;">$${finalPrice} total</div>`,
      iconSize: [80, 30],
      iconAnchor: [40, 15]
    });

    const marker = L.marker(property.coords, { icon: priceIcon }).addTo(leafletMap);
    
    // Connect click events
    marker.on('click', () => {
      selectListing(property.id);
    });

    mapMarkers[property.id] = marker;
  });

  // Initial trigger
  leafletMap.fire('moveend');
}

// Select stay from map or search list
function selectListing(id) {
  const property = LISTINGS_DB[id];
  if (!property) return;
  currentSelectedListing = property;

  // Zoom map to item
  leafletMap.setView(property.coords, 14);

  // Render listing panel details inside drawer
  const drawer = document.getElementById('guest-detail-drawer');
  
  // Calculate default price breakdown (3 nights, 2 guests)
  const defaultNights = 3;
  const baseRate = property.baseRate;
  const baseTotal = baseRate * defaultNights;
  const cleaning = property.cleaningFee;
  const subtotal = baseTotal + cleaning;
  
  let taxRows = '';
  let taxSum = 0;
  property.taxRates.forEach(tax => {
    const taxVal = subtotal * tax.rate;
    taxSum += taxVal;
    taxRows += `<li class="calc-row"><span>${tax.name} (${(tax.rate * 100).toFixed(0)}%)</span> <span>$${taxVal.toFixed(2)}</span></li>`;
  });
  
  const finalTotal = subtotal + taxSum;

  // Render unverified flag warning
  let verificationWarning = '';
  if (property.unverifiedAmenities && property.unverifiedAmenities.length > 0) {
    verificationWarning = `
      <div class="flag-row" style="background:#FBE3E1; border-color:#C1121F; color:#780000; margin-bottom:14px;">
        <strong>AI Audit Warning:</strong> Amenities [${property.unverifiedAmenities.join(', ')}] could not be verified by CLIP vision models.
      </div>
    `;
  } else {
    verificationWarning = `
      <div class="ai-verified-pill" style="align-self:stretch; justify-content:center; margin-bottom:14px; background:rgba(47,158,85,0.1); color:#2F9E55; border-color:rgba(47,158,85,0.3)">
        AI Truth-Audited — GPS Coordinates &amp; Amenities Verified
      </div>
    `;
  }

  drawer.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="position:relative; border-radius:14px; overflow:hidden; height:180px;">
        <img src="${property.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'}" alt="${property.name}" style="width:100%; height:100%; object-fit:cover;">
      </div>
      
      <div>
        <h3 style="font-family:'Fraunces',serif; font-size:22px; color:var(--navy);">${property.name}</h3>
        <div style="font-size:12.5px; color:rgba(27,18,8,0.5); margin-top:2px;">${property.address}</div>
      </div>

      ${verificationWarning}

      <!-- Upfront pricing card -->
      <div class="calc-card">
        <h4 style="font-family:'Fraunces',serif; margin-bottom:10px;">Deterministic Upfront Pricing</h4>
        <div class="form-field" style="margin-bottom:12px;">
          <label>Nights of stay</label>
          <input type="number" id="booking-nights" value="${defaultNights}" min="1" max="30" style="padding:6px 12px;" onchange="recalculateDrawerPrices()">
        </div>
        
        <div class="calc-row"><span>Base rate ($${baseRate.toFixed(2)} &times; <span id="span-calc-nights">${defaultNights}</span> nights)</span> <span id="span-base-total">$${baseTotal.toFixed(2)}</span></div>
        <div class="calc-row"><span>Cleaning fee</span> <span>$${cleaning.toFixed(2)}</span></div>
        <ul class="tax-breakdown" id="ul-taxes">
          ${taxRows}
        </ul>
        <div class="calc-row total"><span>Legally Binding Cost</span> <span id="span-final-total">$${finalTotal.toFixed(2)}</span></div>
      </div>

      <!-- Fractional late checkout grid -->
      <div class="bitmap-container">
        <div class="bitmap-header">
          <div class="bitmap-title">Hourly Booking bitmap (24h)</div>
          <span style="font-size:10.5px; background:rgba(255,255,255,0.15); padding:2px 6px; border-radius:4px;">Today</span>
        </div>
        
        <div class="bitmap-grid" id="avail-bitmap-grid">
          <!-- Populated by helper -->
        </div>

        <div class="bitmap-legend">
          <div class="legend-item"><span class="legend-dot" style="background:var(--accent)"></span><span>Booked</span></div>
          <div class="legend-item"><span class="legend-dot" style="background:var(--sky)"></span><span>Cleaning buffer</span></div>
          <div class="legend-item"><span class="legend-dot" style="background:#2F9E55"></span><span>Available</span></div>
        </div>

        <div style="border-top:1px solid rgba(255,255,255,0.1); margin-top:14px; padding-top:14px;">
          <label style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:8px;">Late Checkout Extension Request</label>
          <div style="display:flex; gap:8px;">
            <select id="extend-hours-select" style="flex:1; padding:6px 10px; border-radius:8px; border:none; outline:none; font-size:13px; color:var(--ink);">
              <option value="1">Extend +1 Hour late checkout (12:00)</option>
              <option value="2" selected>Extend +2 Hours late checkout (13:00)</option>
              <option value="3">Extend +3 Hours late checkout (14:00) [Simulate Conflict]</option>
            </select>
            <button class="btn btn-accent btn-sm" style="border-radius:8px;" onclick="triggerCheckoutExtension()">Extend</button>
          </div>
        </div>
      </div>

      <!-- Realtime Pipeline Log Console -->
      <div>
        <h5 style="margin:0 0 6px 0; font-size:11.5px; text-transform:uppercase; letter-spacing:0.05em; color:var(--navy);">Kafka / API Pipeline Stream</h5>
        <div class="console-box" id="pipeline-console">
          <div class="console-line sys">[sys] Pipeline idle. Awaiting late checkout request input...</div>
        </div>
      </div>
    </div>
  `;

  // Draw initial bitmap blocks
  renderBitmapBlocks(property.availabilityGrid);
}

// Redraw availability timeline blocks based on 24-bit binary mask
function renderBitmapBlocks(mask, extendedMask = 0) {
  const container = document.getElementById('avail-bitmap-grid');
  if (!container) return;
  
  container.innerHTML = '';
  // Loop 24 hours
  for (let h = 0; h < 24; h++) {
    const isOccupied = (mask & (1 << (23 - h))) === 0; // 0 in bitmap = occupied/blocked
    const isExtended = (extendedMask & (1 << (23 - h))) !== 0;
    
    let blockClass = 'available';
    let blockDesc = 'Available';
    let timeLabel = `${h.toString().padStart(2, '0')}:00`;

    if (isExtended) {
      blockClass = 'extended';
      blockDesc = 'Extended Checkout Slot';
    } else if (isOccupied) {
      blockClass = 'occupied';
      blockDesc = 'Occupied by guest';
    } else if (h >= 11 && h < 15) {
      blockClass = 'cleaning';
      blockDesc = 'Cleaning Window Buffer';
    }

    const block = document.createElement('div');
    block.className = `bitmap-block ${blockClass}`;
    block.setAttribute('data-time', `${timeLabel} (${blockDesc})`);
    container.appendChild(block);
  }
}

// Live calculation on night changes
function recalculateDrawerPrices() {
  const property = currentSelectedListing;
  if (!property) return;
  
  const nights = parseInt(document.getElementById('booking-nights').value) || 1;
  const baseRate = property.baseRate;
  const baseTotal = baseRate * nights;
  const cleaning = property.cleaningFee;
  const subtotal = baseTotal + cleaning;
  
  document.getElementById('span-calc-nights').innerText = nights;
  document.getElementById('span-base-total').innerText = `$${baseTotal.toFixed(2)}`;
  
  let taxRows = '';
  let taxSum = 0;
  property.taxRates.forEach(tax => {
    const taxVal = subtotal * tax.rate;
    taxSum += taxVal;
    taxRows += `<li class="calc-row"><span>${tax.name} (${(tax.rate * 100).toFixed(0)}%)</span> <span>$${taxVal.toFixed(2)}</span></li>`;
  });
  
  document.getElementById('ul-taxes').innerHTML = taxRows;
  document.getElementById('span-final-total').innerText = `$${(subtotal + taxSum).toFixed(2)}`;
}

// Quick select utility from Featured Stays cards
function quickSelectListing(alias) {
  let mappedId = "lisbon-loft";
  if (alias === 'cliffside') mappedId = 'cliffside';
  if (alias === 'alpine') mappedId = 'alpine';
  if (alias === 'rice-terrace') mappedId = 'rice-terrace';

  switchView('guest');
  setTimeout(() => {
    selectListing(mappedId);
  }, 300);
}

// ===== FRACTIONAL BOOKING: EXTENSION ENGINE (MODULE B) =====
function triggerCheckoutExtension() {
  const property = currentSelectedListing;
  if (!property) return;

  const hours = parseInt(document.getElementById('extend-hours-select').value);
  const consoleEl = document.getElementById('pipeline-console');
  consoleEl.innerHTML = ''; // Reset log

  const printLog = (text, type = 'sys') => {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  };

  printLog(`Init checkout extension query: ${hours} hour(s) late checkout requested`, 'info');
  
  // Create requested bitmask (e.g. late checkout starts at 11am check-out time)
  // hour 11 = bit index 12 (from left), hour 12 = bit index 11
  let requestedMask = 0;
  for (let i = 0; i < hours; i++) {
    requestedMask |= (1 << (23 - (11 + i)));
  }

  // Simulate bitwise check
  setTimeout(() => {
    // 3 hours triggers mock conflict (e.g. cleaning window starts at 13:00 and cannot be altered)
    if (hours === 3) {
      printLog(`Bitwise check: (Requested Mask 0x01C000 & Blocked Mask 0x00E000) != 0`, 'warn');
      printLog(`Conflict found: late checkout overlaps cleaners block starting 13:00`, 'error');
      printLog(`Transaction aborted. Checkout extension auto-denied by scheduling constraints.`, 'error');
      return;
    }

    printLog(`Bitwise check: (Requested Mask 0x${requestedMask.toString(16).toUpperCase()} & Blocked Mask) == 0. Status: CLEAR`, 'success');
    
    // Process Stripe Transaction
    setTimeout(() => {
      printLog(`Stripe API: Pre-authorizing transactional extension fee ($45.00)... Verified.`, 'info');
      
      // Kafka Publish
      setTimeout(() => {
        printLog(`Kafka Bus: checkout.extended published to queue (listing: ${property.id})`, 'sys');
        
        // Seam Smart lock update
        setTimeout(() => {
          printLog(`Seam API: POST /v1/access_codes/update -> Recalculating PIN access codes... Window successfully extended to ${11 + hours}:00`, 'success');
          
          // Channex Webhook sync
          setTimeout(() => {
            printLog(`Channex API: Synced calendar blocks across channels (Airbnb, Vrbo, Booking.com) to prevent calendar drift.`, 'success');
            printLog(`Late checkout extension completely verified and sync active!`, 'success');
            
            // Redraw blocks showing extended slots
            renderBitmapBlocks(property.availabilityGrid, requestedMask);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  }, 600);
}

// ===== ASYNCHRONOUS AI AUDIT WORKER (MODULE C) =====
function simulateHostUpload(auditType) {
  switchView('host');
  
  const panel = document.getElementById('host-audit-panel');
  panel.innerHTML = `
    <h3 style="font-family:'Fraunces',serif; color:var(--navy); margin-bottom:12px;">Asynchronous Celery Audit Log</h3>
    <div style="background:var(--bg-soft); padding:10px 14px; border-radius:8px; font-size:12.5px; margin-bottom:14px;">
      Job ID: <code id="celery-job-id">job-pending...</code> | Status: <strong id="celery-job-status" style="color:var(--accent);">accepted (HTTP 202)</strong>
    </div>
    <div class="console-box" id="celery-console" style="height:220px; margin-top:0;"></div>
    
    <div id="clip-results-box" style="display:none; flex-direction:column; gap:12px; border-top:1px solid var(--line); padding-top:16px;">
      <h4 style="font-family:'Fraunces',serif; margin:0;">Zero-Shot Computer Vision Tagging (CLIP)</h4>
      <div class="audit-score-gauge">
        <span style="font-size:13.5px; font-weight:700;">Workspace Cosine Similarity</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="audit-score-bar-outer"><div class="audit-score-bar-inner" id="clip-bar"></div></div>
          <strong id="clip-score-val">0.00</strong>
        </div>
      </div>
      <div id="audit-db-status" style="margin-top:4px;"></div>
    </div>
  `;

  const consoleEl = document.getElementById('celery-console');
  const printLog = (text, type = 'sys') => {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[Celery Worker] ${text}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  };

  const jobId = "job-" + Math.random().toString(36).substr(2, 9);
  document.getElementById('celery-job-id').innerText = jobId;

  printLog(`HTTP 202 accepted - Upload successfully processed asynchronously.`, 'success');
  printLog(`Enqueuing file verification tasks to RabbitMQ bus...`, 'sys');

  setTimeout(() => {
    document.getElementById('celery-job-status').innerText = 'processing';
    document.getElementById('celery-job-status').style.color = '#ffd54f';
    
    printLog(`Task picked up by Celery worker pool: ${jobId}`, 'info');
    printLog(`Running Image Metadata Audit (ExifTool parser)...`, 'sys');

    setTimeout(() => {
      let gpsMatch = false;
      let clipScore = 0;
      let clipText = '';
      let auditResultHtml = '';

      if (auditType === 'workspace') {
        gpsMatch = true;
        clipScore = 0.92;
        printLog(`ExifTool: Camera model: iPhone 15 Pro, Timestamp: 2026-06-24 14:30:15`, 'info');
        printLog(`ExifTool GPS: POINT(38.7123 -9.1368) matches Lisbon listing PostGIS geometry bounds (diff: 0m).`, 'success');
        printLog(`Running Zero-Shot Vision Tagging (CLIP encoder)...`, 'sys');
        
        setTimeout(() => {
          printLog(`CLIP: Encoding image vector against labels: "dedicated desk workspace"`, 'sys');
          printLog(`CLIP: Math cosine similarity: (v . u) / (||v|| ||u||) = 0.92`, 'info');
          printLog(`Audit successfully verified listing claims. DB update completed.`, 'success');
          
          document.getElementById('celery-job-status').innerText = 'success';
          document.getElementById('celery-job-status').style.color = '#2F9E55';
          document.getElementById('clip-results-box').style.display = 'flex';
          document.getElementById('clip-bar').style.width = '92%';
          document.getElementById('clip-bar').style.background = '#2F9E55';
          document.getElementById('clip-score-val').innerText = '0.92';
          document.getElementById('audit-db-status').innerHTML = `
            <div style="background:rgba(47,158,85,0.1); color:#2F9E55; padding:8px 12px; border-radius:8px; font-size:12.5px; font-weight:700;">
              Listing Verified: Photo GPS coordinates and claimed Workspace verified.
            </div>
          `;
          
          // Clear any warnings in DB
          LISTINGS_DB['lisbon-loft'].unverifiedAmenities = [];
        }, 1200);

      } else if (auditType === 'bedroom') {
        gpsMatch = true;
        clipScore = 0.64;
        printLog(`ExifTool: Camera model: iPhone 15 Pro, Timestamp: 2026-06-24 14:30:15`, 'info');
        printLog(`ExifTool GPS: POINT(38.7123 -9.1368) matches Lisbon listing PostGIS geometry bounds (diff: 0m).`, 'success');
        printLog(`Running Zero-Shot Vision Tagging (CLIP encoder)...`, 'sys');
        
        setTimeout(() => {
          printLog(`CLIP: Encoding image vector against labels: "dedicated desk workspace"`, 'sys');
          printLog(`CLIP: Math cosine similarity: 0.64`, 'warn');
          printLog(`CLIP: Score 0.64 is below threshold 0.85. Amenity check failed!`, 'error');
          printLog(`Celery: Flagging listing unverified_amenities = ['Dedicated Workspace']`, 'error');
          
          document.getElementById('celery-job-status').innerText = 'flagged';
          document.getElementById('celery-job-status').style.color = 'var(--accent)';
          document.getElementById('clip-results-box').style.display = 'flex';
          document.getElementById('clip-bar').style.width = '64%';
          document.getElementById('clip-bar').style.background = 'var(--accent)';
          document.getElementById('clip-score-val').innerText = '0.64';
          document.getElementById('audit-db-status').innerHTML = `
            <div style="background:rgba(224,86,91,0.1); color:var(--accent-dark); padding:8px 12px; border-radius:8px; font-size:12.5px; font-weight:700;">
              Flagged: Workspace amenity claimed by host could not be verified in photo.
            </div>
          `;
          
          // Add flag warning in DB
          LISTINGS_DB['lisbon-loft'].unverifiedAmenities = ['Dedicated Workspace'];
        }, 1200);

      } else if (auditType === 'stock') {
        gpsMatch = false;
        clipScore = 0.35;
        printLog(`ExifTool: Camera model: DSLR Web Export, Timestamp: 2024-03-12 11:20:00`, 'warn');
        printLog(`ExifTool GPS: POINT(21.3069 -157.8583) [Hawaii] does not match Lisbon coordinates POINT(38.7123 -9.1368)`, 'error');
        printLog(`Error: Photo taken 12,000km away from physical address. Recycled stock photo flagged!`, 'error');
        printLog(`Running Zero-Shot Vision Tagging (CLIP encoder)...`, 'sys');
        
        setTimeout(() => {
          printLog(`CLIP: Cosine similarity: 0.35`, 'error');
          printLog(`Celery: Listing coordinates mismatch audit. Flagging property status.`, 'error');
          
          document.getElementById('celery-job-status').innerText = 'flagged';
          document.getElementById('celery-job-status').style.color = 'var(--accent)';
          document.getElementById('clip-results-box').style.display = 'flex';
          document.getElementById('clip-bar').style.width = '35%';
          document.getElementById('clip-bar').style.background = 'var(--accent)';
          document.getElementById('clip-score-val').innerText = '0.35';
          document.getElementById('audit-db-status').innerHTML = `
            <div style="background:rgba(224,86,91,0.1); color:var(--accent-dark); padding:8px 12px; border-radius:8px; font-size:12.5px; font-weight:700;">
              Flagged: Recycled stock image or metadata spoofing detected. GPS coordinates mismatch.
            </div>
          `;
          
          LISTINGS_DB['lisbon-loft'].unverifiedAmenities = ['Property Coordinates Check'];
        }, 1200);
      }
    }, 1200);
  }, 1000);
}

// Media upload drag zone helper
function handleMockFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // Treat as custom workspace simulation
    simulateHostUpload('workspace');
  }
}

// ===== ADMIN PANEL REVIEW MINER (MODULE D) =====
function renderAdminListings() {
  const tbody = document.getElementById('admin-listings-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  Object.keys(LISTINGS_DB).forEach(key => {
    const property = LISTINGS_DB[key];
    
    let statusText = `<span style="color:#2F9E55; font-weight:700;">Verified</span>`;
    if (property.unverifiedAmenities && property.unverifiedAmenities.length > 0) {
      statusText = `<span style="color:var(--accent); font-weight:700;">Flagged</span>`;
    }

    let summaryText = '';
    if (property.groundTruthSummary.wifiSpeedMbps) {
      summaryText = `
        <div style="font-size:11px; line-height:1.3; color:rgba(27,18,8,0.75);">
          Wi-Fi: ${property.groundTruthSummary.wifiSpeedMbps} Mbps &middot; Noise: ${property.groundTruthSummary.noiseLevelDb} dB &middot; Walk Score: ${property.groundTruthSummary.walkability}
        </div>
      `;
    } else {
      summaryText = `<span style="color:rgba(27,18,8,0.4); font-size:12px;">Unsynthesized reviews</span>`;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${property.name}</strong></td>
      <td style="font-size:12px; color:rgba(27,18,8,0.6);">${property.address.split(',')[0]}</td>
      <td>${statusText}</td>
      <td>
        <button class="btn btn-navy btn-sm" style="padding:4px 10px; font-size:11px;" onclick="triggerGeminiSynthesis('${property.id}')">Scrape &amp; Synthesize</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function triggerGeminiSynthesis(id) {
  const property = LISTINGS_DB[id];
  if (!property) return;
  switchView('admin');

  const panel = document.getElementById('admin-synthesis-panel');
  panel.innerHTML = `
    <h3 style="font-family:'Fraunces',serif; color:var(--navy); margin-bottom:12px;">Gemini LLM Reviews Synthesis</h3>
    <div style="background:var(--bg-soft); padding:10px 14px; border-radius:8px; font-size:12.5px; margin-bottom:14px;">
      Running SerpApi scrape &amp; Gemini AI pipeline filters...
    </div>
    <div class="console-box" id="synthesis-console" style="height:180px; margin-top:0; font-size:11.5px;"></div>
    
    <div id="synthesis-output-box" style="display:none; flex-direction:column; gap:12px; border-top:1px solid var(--line); padding-top:16px;">
      <h4 style="font-family:'Fraunces',serif; margin:0;">Synthesized ground_truth_summary Object</h4>
      <pre id="synthesis-json" style="background:#f1f3f5; padding:12px; border-radius:8px; font-size:11.5px; color:#37474f; overflow-x:auto; margin:0; border:1px solid var(--line);"></pre>
      <div style="background:rgba(47,158,85,0.1); color:#2F9E55; padding:8px 12px; border-radius:8px; font-size:12.5px; font-weight:700; margin-top:4px;">
        JSON written to listings database row.
      </div>
    </div>
  `;

  const consoleEl = document.getElementById('synthesis-console');
  const printLog = (text, type = 'sys') => {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[Pipeline] ${text}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  };

  printLog(`Invoking SerpApi Google Maps reviews crawler for listing: ${property.name}`, 'info');
  printLog(`Fetching review comments array...`, 'sys');

  setTimeout(() => {
    printLog(`SerpApi: Scraped ${property.reviews.length} raw review texts successfully.`, 'success');
    printLog(`Passing raw texts to Google Gemini API (model: gemini-1.5-pro)...`, 'info');
    printLog(`LLM Prompt: "Strip emotional bias/hyperbole. Return WiFi, Decibels, and Walkability."`, 'sys');

    setTimeout(() => {
      printLog(`Gemini: Filtering comments. Extracting structural metrics.`, 'sys');
      
      setTimeout(() => {
        printLog(`Gemini: Synthesis successful! JSON payload returned.`, 'success');
        
        document.getElementById('synthesis-output-box').style.display = 'flex';
        document.getElementById('synthesis-json').textContent = JSON.stringify(property.groundTruthSummary, null, 2);
        
        // Refresh admin listings table
        renderAdminListings();
      }, 1000);
    }, 1000);
  }, 1000);
}

// ===== GLOBAL AUTH PROFILE MANAGER =====
function initGlobalAuth() {
  // Pre-load default state
  updateNavbarAuth();
}

function openAuthModal(roleHint = 'guest') {
  const modal = document.getElementById('authModal');
  const roleSelect = document.getElementById('auth-role-select');
  roleSelect.value = roleHint;
  
  if (roleHint === 'guest') {
    document.getElementById('auth-username-input').value = 'Alex Rivera';
  } else if (roleHint === 'host') {
    document.getElementById('auth-username-input').value = 'Clara Dupont';
  } else if (roleHint === 'admin') {
    document.getElementById('auth-username-input').value = 'Admin Root';
  }

  modal.classList.add('open');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open');
}

function performAuthRedirect() {
  const role = document.getElementById('auth-role-select').value;
  const username = document.getElementById('auth-username-input').value || 'User';
  
  activeUser = {
    name: username,
    role: role
  };

  closeAuthModal();
  updateNavbarAuth();

  // Redirect page view based on logged in role
  if (role === 'guest') {
    switchView('guest');
  } else if (role === 'host') {
    switchView('host');
  } else if (role === 'admin') {
    switchView('admin');
  } else if (role === 'developer') {
    switchView('arch');
  }
}

function performAuthSignOut() {
  activeUser = null;
  updateNavbarAuth();
  switchView('landing');
}

function updateNavbarAuth() {
  const container = document.getElementById('nav-auth-container');
  if (!activeUser) {
    container.innerHTML = `<button class="btn btn-navy btn-sm" onclick="openAuthModal()">Sign In</button>`;
  } else {
    // Generate role text and color styling
    let roleBadgeColor = 'var(--sky)';
    if (activeUser.role === 'host') roleBadgeColor = 'var(--accent)';
    if (activeUser.role === 'admin') roleBadgeColor = '#9B5DE5';
    if (activeUser.role === 'developer') roleBadgeColor = '#2F9E55';

    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="profile-badge" onclick="openAuthModal('${activeUser.role}')">
          <div class="avatar" style="background:${roleBadgeColor};">${activeUser.name.charAt(0)}</div>
          <div class="user-info">
            <span class="name">${activeUser.name}</span>
            <span class="role">${activeUser.role.toUpperCase()}</span>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" style="padding:6px 12px; border-radius:999px;" onclick="performAuthSignOut()">Sign Out</button>
      </div>
    `;
  }
}

// ===== GEMINI CONCIERGE CHAT WIDGET =====
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');

if (chatToggle && chatWindow) {
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
  });
}

function toggleChatWindow(openState) {
  if (openState) chatWindow.classList.add('open');
  else chatWindow.classList.remove('open');
}

function sendChatMessage() {
  const inputEl = document.getElementById('chatInput');
  const query = inputEl.value.trim();
  if (!query) return;

  inputEl.value = '';
  
  // Render user bubble
  appendChatBubble(query, 'user');
  
  // Show typing indicator
  const indicator = showChatTypingIndicator();

  // Process query client-side, accessing simulated Gemini LLM context
  setTimeout(() => {
    indicator.remove();
    
    let answer = `I'm here to help you plan your trip. Ask me about the Lisbob Loft's wifi speeds, Santoriri walkability, or general decibel ranges!`;
    const qLower = query.toLowerCase();

    // Contextual lookup matches
    if (qLower.includes('lisbon') || qLower.includes('loft') || qLower.includes('portugal')) {
      const p = LISTINGS_DB['lisbon-loft'];
      answer = `Based on Google Maps review text synthesized by Gemini, the **Lisbon Designer Loft** features a verified **185 Mbps fiber Wi-Fi** connection (highly stable). The street noise registers at a quiet **42 dB** due to double glazing. Neighboring businesses scraped from SerpApi include the *Madalena Cafe* just 50m away, and the *Baixa-Chiado Metro* is a quick 200m walk.`;
    } 
    else if (qLower.includes('swiss') || qLower.includes('cabin') || qLower.includes('interlaken') || qLower.includes('switzerland')) {
      const p = LISTINGS_DB['alpine'];
      answer = `Our synthesized review summary indicates that the **Alpine Wood Cabin** in Interlaken is extremely peaceful, recording only **31 dB** (nature sounds only). Wi-Fi operates via a standard VDSL connection at **82 Mbps**, which is stable but can fluctuate slightly during heavy winter snowstorms. The town center is walkable (74/100 score), and hikers will love that paths start directly from the doorstep.`;
    }
    else if (qLower.includes('bali') || qLower.includes('ubud') || qLower.includes('rice')) {
      const p = LISTINGS_DB['rice-terrace'];
      answer = `For the **Rice Terrace Retreat** in Ubud, Gemini review scraping extracts a verified **120 Mbps dedicated fiber line** equipped with a battery backup (very reliable for remote work). The local noise level is a low **38 dB** (mostly insect calls). Note that it has a walkability score of **60/100** because it requires a scooter or driver to reach central Ubud.`;
    }
    else if (qLower.includes('greece') || qLower.includes('santorini') || qLower.includes('cliffside')) {
      const p = LISTINGS_DB['cliffside'];
      answer = `For the **Santorini Cliffside Villa**, Google reviews indicate a walkability score of **92/100** with immediate access to sunset points and restaurants. The noise level sits around **45 dB** due to daytime foot traffic, and the Wi-Fi averages a solid **95 Mbps**.`;
    }
    else if (qLower.includes('wifi') || qLower.includes('speed') || qLower.includes('internet')) {
      answer = `Our listings feature AI-verified Wi-Fi speeds: **185 Mbps** at the Lisbon Loft, **120 Mbps** at the Bali Rice Terrace, **95 Mbps** in Santorini, and **82 Mbps** in Interlaken. All connections are fully audited and backed by actual guest speedtests.`;
    }
    else if (qLower.includes('decibel') || qLower.includes('noise') || qLower.includes('quiet') || qLower.includes('loud')) {
      answer = `We mine reviews to track exact decibel levels: the quietest is **31 dB** (Alpine Cabin, Switzerland), followed by **38 dB** (Ubud, Bali), **42 dB** (Lisbon Loft), and **45 dB** (Santorini Villa). All properties are certified quiet.`;
    }

    // Stream letters to look like live AI typing
    appendChatBubbleStreaming(answer, 'ai');
  }, 1000);
}

function appendChatBubble(text, sender) {
  const body = document.getElementById('chatBody');
  const row = document.createElement('div');
  row.className = `chat-row ${sender === 'user' ? 'user' : ''}`;
  
  const bubble = document.createElement('div');
  bubble.className = `bubble ${sender}`;
  bubble.innerText = text;
  
  row.appendChild(bubble);
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}

function showChatTypingIndicator() {
  const body = document.getElementById('chatBody');
  const row = document.createElement('div');
  row.className = 'chat-row';
  
  const bubble = document.createElement('div');
  bubble.className = 'bubble ai';
  bubble.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  row.appendChild(bubble);
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
  return row;
}

function appendChatBubbleStreaming(text, sender) {
  const body = document.getElementById('chatBody');
  const row = document.createElement('div');
  row.className = `chat-row`;
  
  const bubble = document.createElement('div');
  bubble.className = `bubble ${sender}`;
  bubble.style.background = 'rgba(102,155,188,0.15)';
  bubble.style.color = 'var(--ink)';
  bubble.style.border = '1px solid rgba(102,155,188,0.3)';
  
  row.appendChild(bubble);
  body.appendChild(row);
  
  let i = 0;
  function typeChar() {
    if (i < text.length) {
      bubble.textContent += text.charAt(i);
      i++;
      body.scrollTop = body.scrollHeight;
      setTimeout(typeChar, 10);
    }
  }
  typeChar();
}

// ===== TRAVEL FEED & SOCIAL FACILITY (MOCK DATABASE & LOGIC) =====
const MOCK_SOCIAL_POSTS = [
  {
    id: "post-1",
    title: "Unbelievable remote work stay in Lisbon!",
    author: "Alex Rivera",
    avatar: "A",
    location: "Lisbon, Portugal",
    content: "Just finished a 2-week workation at the Downtown Designer Loft. The 185 Mbps Wi-Fi was flawless. I sat out on the terrace every afternoon. Highly recommend the Madalena Cafe just down the street! Walking accessibility in Lisbon is amazing, though the street tram is slightly noisy if you open the front balcony.",
    image: "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=700&q=80",
    likes: 24,
    comments: [
      {
        author: "Clara Dupont",
        avatar: "C",
        content: "So glad you enjoyed the terrace! We just had the double-glazed windows serviced to keep the tram noise even lower.",
        date: "2026-06-25"
      },
      {
        author: "Marc Wood",
        avatar: "M",
        content: "Adding this to my wishlist for next spring. Is the desk comfortable for 8+ hours?",
        date: "2026-06-26"
      }
    ],
    date: "2026-06-24"
  },
  {
    id: "post-2",
    title: "A serene alpine escape in Interlaken",
    author: "Sophia Martinez",
    avatar: "S",
    location: "Interlaken, Switzerland",
    content: "Waking up to the Swiss Alps view was majestic. It is incredibly quiet here — literally only bird sounds. The walk to the Harder Kulm funicular is beautiful and highly recommended for hikers.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=700&q=80",
    likes: 18,
    comments: [
      {
        author: "Hans Keller",
        avatar: "H",
        content: "Glad you liked the quiet! The hiking path next to the door is my personal favorite.",
        date: "2026-06-25"
      }
    ],
    date: "2026-06-23"
  },
  {
    id: "post-3",
    title: "Santorini cliffside — worth every cent",
    author: "James Okafor",
    avatar: "J",
    location: "Santorini, Greece",
    content: "Stayed at the Cliffside Villa for 5 nights and it absolutely delivered. The cave pool is surreal at sunset. Wi-Fi clocked at 92 Mbps consistently, solid enough for video calls. The caldera walkway is literally steps from the front door — no scooter needed for the main attractions. Afternoons get a bit busy with tourist foot traffic but evenings are completely peaceful.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=700&q=80",
    likes: 41,
    comments: [
      {
        author: "Priya Nair",
        avatar: "P",
        content: "The cave pool photo you posted sold me immediately. Booking this for our anniversary trip.",
        date: "2026-06-20"
      },
      {
        author: "David Chen",
        avatar: "D",
        content: "Did you find the workspace usable for full days? I need to keep working during the trip.",
        date: "2026-06-21"
      },
      {
        author: "James Okafor",
        avatar: "J",
        content: "Completely usable — the terrace desk gets good shade in the morning. Used it from 7am to noon every day.",
        date: "2026-06-21"
      }
    ],
    date: "2026-06-19"
  },
  {
    id: "post-4",
    title: "Working remotely from Ubud — honest review",
    author: "Nina Vasquez",
    avatar: "N",
    location: "Ubud, Bali",
    content: "The Rice Terrace Retreat has the fastest internet I've tested in Bali — 118 Mbps on a dedicated fiber line with a backup battery. The surrounding nature sounds are calming but insects are loud at night, just a heads up. You absolutely need a scooter or driver to get anywhere. The open-air lounge is perfect for morning calls with the right time zone. Would return without hesitation.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80",
    likes: 33,
    comments: [
      {
        author: "Lena Hoffmann",
        avatar: "L",
        content: "The insect noise was my concern too! Did you find earplugs helped or was it actually fine?",
        date: "2026-06-17"
      },
      {
        author: "Nina Vasquez",
        avatar: "N",
        content: "Honestly fine after the first night — you adjust quickly. The white noise fan they provide helps.",
        date: "2026-06-17"
      }
    ],
    date: "2026-06-16"
  },
  {
    id: "post-5",
    title: "One week in Lisbon — productivity at an all-time high",
    author: "Tom Eriksson",
    avatar: "T",
    location: "Lisbon, Portugal",
    content: "I was skeptical about the workspace claim but the Lisbon loft genuinely delivers. Dedicated desk by the window, ergonomic chair, and gigabit fiber. Noise level was measured at around 40–44 dB during the day — well within acceptable range. The Chiado neighborhood has no shortage of good coffee. This is now my go-to base for European workations.",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=700&q=80",
    likes: 29,
    comments: [
      {
        author: "Alex Rivera",
        avatar: "A",
        content: "Completely agree — Chiado has the best cafe density in any city I've worked from. Glad you loved it.",
        date: "2026-06-14"
      }
    ],
    date: "2026-06-13"
  },
  {
    id: "post-6",
    title: "Swiss Alps in winter — cabin life is something else",
    author: "Yuki Tanaka",
    avatar: "Y",
    location: "Interlaken, Switzerland",
    content: "The Alpine Wood Cabin in January is a completely different experience from summer. Fireplace crackling every evening, snow on the mountain, and near-total silence outside. Wi-Fi dipped to around 55 Mbps during a snowstorm but recovered within hours. The hot tub under the stars is the highlight. Highly recommend pairing this stay with the Jungfraujoch day trip.",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80",
    likes: 52,
    comments: [
      {
        author: "Sophia Martinez",
        avatar: "S",
        content: "I did summer — now I need to come back for winter after seeing this. The hot tub looks incredible.",
        date: "2026-06-10"
      },
      {
        author: "Ravi Patel",
        avatar: "R",
        content: "How was the road access in snow? Worried about getting stranded.",
        date: "2026-06-11"
      },
      {
        author: "Yuki Tanaka",
        avatar: "Y",
        content: "The main road is well gritted. We had a 4WD rental and never had any issues. Host also gives good advice on timing.",
        date: "2026-06-11"
      }
    ],
    date: "2026-06-09"
  },
  {
    id: "post-7",
    title: "Bali as a long-term base — month one down",
    author: "Carlos Mendes",
    avatar: "C",
    location: "Ubud, Bali",
    content: "Finishing my first month at the Rice Terrace Retreat and it has been everything I hoped. The pool is a genuine stress reliever after long work sessions. Internet held at 110–120 Mbps throughout. A private driver for the month cost less than a week of taxis back home. The only adjustment is the heat — the open-air lounge is best used before 10am or after 5pm.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=80",
    likes: 47,
    comments: [
      {
        author: "Nina Vasquez",
        avatar: "N",
        content: "Month-long stays here make so much sense. The rate per night drops and you get into a real routine.",
        date: "2026-06-06"
      }
    ],
    date: "2026-06-05"
  },
  {
    id: "post-8",
    title: "Honest thoughts on the Santorini villa after a week",
    author: "Amara Osei",
    avatar: "A",
    location: "Santorini, Greece",
    content: "Beautiful property, no question. The AI verification badge is accurate — every amenity listed was exactly as described. The sunset terrace is genuinely one of the best views I have ever seen. Worth noting: the Oia caldera steps are steep with luggage, so plan arrivals accordingly. Wi-Fi was stable at 88–96 Mbps. For the price, this is exceptional value compared to hotel alternatives in the area.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=700&q=80",
    likes: 38,
    comments: [
      {
        author: "James Okafor",
        avatar: "J",
        content: "The luggage point is real — I wish I had packed lighter. Great tip to include.",
        date: "2026-06-03"
      },
      {
        author: "Mei Lin",
        avatar: "M",
        content: "The AI verification matching perfectly is a big deal for me. I've been burned by misleading listings before.",
        date: "2026-06-03"
      }
    ],
    date: "2026-06-02"
  }
];

let activeSocialTag = 'all';

function initSocialFeedStore() {
  // Reset store if the data is outdated (fewer posts than the current defaults)
  const stored = JSON.parse(localStorage.getItem('innsight_posts'));
  if (!stored || stored.length < MOCK_SOCIAL_POSTS.length) {
    localStorage.setItem('innsight_posts', JSON.stringify(MOCK_SOCIAL_POSTS));
  }
  renderSocialFeed();
  renderLandingPosts();
}

function getPostsFromStore() {
  return JSON.parse(localStorage.getItem('innsight_posts')) || MOCK_SOCIAL_POSTS;
}

function savePostsToStore(posts) {
  localStorage.setItem('innsight_posts', JSON.stringify(posts));
}

// Render feed list cards
function renderSocialFeed() {
  const grid = document.getElementById('social-feed-grid');
  if (!grid) return;

  const posts = getPostsFromStore();
  grid.innerHTML = '';

  const searchVal = (document.getElementById('social-search-input')?.value || '').toLowerCase();

  posts.forEach(post => {
    // Check text search filter
    const matchesSearch = 
      post.title.toLowerCase().includes(searchVal) || 
      post.content.toLowerCase().includes(searchVal) || 
      post.location.toLowerCase().includes(searchVal) || 
      post.author.toLowerCase().includes(searchVal);

    // Check category tag filter
    let matchesTag = true;
    if (activeSocialTag !== 'all') {
      matchesTag = post.location.toLowerCase().includes(activeSocialTag.toLowerCase());
    }

    if (matchesSearch && matchesTag) {
      const card = document.createElement('div');
      card.className = 'social-card reveal in';
      card.onclick = () => openPostDetail(post.id);

      const imageHtml = post.image 
        ? `<div class="img-wrap"><img src="${post.image}" alt="${post.title}"></div>` 
        : '<div class="img-wrap" style="height:160px; background:#EDEFF2; display:flex; align-items:center; justify-content:center; color:#8da4c4; font-size:12px;">No Photo</div>';

      card.innerHTML = `
        ${imageHtml}
        <div class="card-content">
          <div class="card-meta">
            <span class="avatar">${post.avatar || post.author.charAt(0)}</span>
            <span class="author">${post.author}</span>
            <span class="date">${post.date}</span>
          </div>
          <h4>${post.title}</h4>
          <p>${post.content}</p>
          <div class="card-footer">
            <span>${post.location}</span>
            <span>${post.comments.length} comments</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    }
  });
}

function filterSocialFeed() {
  renderSocialFeed();
}

function filterSocialTag(tag) {
  activeSocialTag = tag;
  document.querySelectorAll('#view-social .btn-ghost').forEach(btn => {
    btn.classList.remove('active-filter');
  });

  const btnId = `filter-${tag === 'all' ? 'all' : tag.toLowerCase()}`;
  document.getElementById(btnId)?.classList.add('active-filter');

  renderSocialFeed();
}

// Open/Close Create Post Modal
function openCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  if (modal) {
    // Autofill author name if signed in
    if (activeUser) {
      document.getElementById('post-author-input').value = activeUser.name;
    } else {
      document.getElementById('post-author-input').value = 'Alex Rivera';
    }
    modal.classList.add('open');
  }
}

function closeCreatePostModal() {
  document.getElementById('createPostModal')?.classList.remove('open');
}

function handlePostPropertySelectChange() {
  const select = document.getElementById('post-property-select');
  const locationContainer = document.getElementById('post-location-container');
  if (select.value === 'other') {
    locationContainer.style.display = 'flex';
    document.getElementById('post-location-input').required = true;
  } else {
    locationContainer.style.display = 'none';
    document.getElementById('post-location-input').required = false;
  }
}

// Handle Form Submission
function handleCreatePost(event) {
  event.preventDefault();
  
  const title = document.getElementById('post-title-input').value.trim();
  const propertyKey = document.getElementById('post-property-select').value;
  const author = document.getElementById('post-author-input').value.trim();
  const content = document.getElementById('post-content-input').value.trim();
  const image = document.getElementById('post-image-input').value.trim();
  
  let location = '';
  if (propertyKey === 'other') {
    location = document.getElementById('post-location-input').value.trim();
  } else {
    const propDetails = LISTINGS_DB[propertyKey];
    location = propDetails ? propDetails.address.split(',')[1].trim() + ", " + propDetails.address.split(',')[2].trim() : 'Unknown';
  }

  const posts = getPostsFromStore();
  const newPost = {
    id: "post-" + Date.now(),
    title: title,
    author: author,
    avatar: author.charAt(0).toUpperCase(),
    location: location,
    content: content,
    image: image || null,
    likes: 0,
    comments: [],
    date: new Date().toISOString().split('T')[0]
  };

  posts.unshift(newPost);
  savePostsToStore(posts);

  // Clear inputs and close
  document.getElementById('create-post-form').reset();
  closeCreatePostModal();
  
  // Re-render feed and landing page preview
  renderSocialFeed();
  renderLandingPosts();
}

// Render dynamic 3 recent posts on the main landing page, linking directly to post.html
function renderLandingPosts() {
  const container = document.getElementById('landing-posts-grid');
  if (!container) return;

  const posts = getPostsFromStore();
  container.innerHTML = '';

  // Capture the 3 most recent posts
  const previewPosts = posts.slice(0, 3);

  previewPosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'social-card reveal in';
    card.onclick = () => openPostDetail(post.id);

    const imageHtml = post.image 
      ? `<div class="img-wrap"><img src="${post.image}" alt="${post.title}"></div>` 
      : '<div class="img-wrap" style="height:160px; background:#EDEFF2; display:flex; align-items:center; justify-content:center; color:#8da4c4; font-size:12px;">No Photo</div>';

    card.innerHTML = `
      ${imageHtml}
      <div class="card-content">
        <div class="card-meta">
          <span class="avatar">${post.avatar || post.author.charAt(0)}</span>
          <span class="author">${post.author}</span>
          <span class="date">${post.date}</span>
        </div>
        <h4>${post.title}</h4>
        <p>${post.content}</p>
        <div class="card-footer">
          <span>${post.location}</span>
          <span>${post.comments.length} comments</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}