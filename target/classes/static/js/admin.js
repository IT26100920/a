/* ===== Admin dashboard =====
   One generic CRUD engine (table + modal form) is driven by the SECTIONS list below.
   Each section is owned by one team member (see the "owner" field), which keeps the
   front-end split the same as the back-end split. */


/* Monochrome line icons for the sidebar. Emoji were inconsistent across
   machines (each OS draws its own set), so the icons are inline SVG. */
const NAV_ICONS = {
  overview: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  sales: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  customers: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-2.2-4.4"/></svg>',
  admins: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg>',
  movies: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
  theatres: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/></svg>',
  screens: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/></svg>',
  shows: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  bookings: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 0 2-2V6h14v1a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2v1H5v-1a2 2 0 0 0-2-2Z"/><path d="M12 8v1M12 12v1M12 16v1"/></svg>',
  payments: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M6.5 14.5h3"/></svg>',
  files: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7a2 2 0 0 1 2-2h3.6l1.8 2H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M4 11h16"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="12" width="3" height="5" rx="1"/><rect x="12" y="8" width="3" height="9" rx="1"/><rect x="17" y="5" width="3" height="12" rx="1"/></svg>',
  promos: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12.5 12.5 20.5a2 2 0 0 1-2.8 0L3.5 14.3V3.5h10.8l6.2 6.2a2 2 0 0 1 0 2.8Z"/><circle cx="8" cy="8" r="1.4"/></svg>'
};

const SECTIONS = [
  {
    key: 'overview', title: 'Dashboard', icon: '📊', owner: '',
    ownerText: 'Key numbers across movies, bookings and customers'
  },
  {
    key: 'sales', title: 'Sales', icon: '📈', owner: '',
    ownerText: 'Revenue, tickets sold, occupancy and top movies for any date range'
  },
  {
    key: 'analytics', title: 'Analytics', icon: '', owner: '',
    ownerText: 'Revenue per film and per screen, occupancy by time slot, the booking funnel and the no-show rate'
  },
  {
    key: 'customers', title: 'Customers', icon: '👥', owner: 'M1',
    ownerText: 'Customer accounts. One page at a time, searchable and removable.',
    listEndpoint: '/api/admin/customers', endpoint: '/api/admin/customers', singular: 'customer',
    pagedEndpoint: '/api/admin/customers/page',
    search: true, canCreate: false, canEdit: false, canDelete: true,
    columns: [
      { k: 'fullName', l: 'Name' }, { k: 'email', l: 'Email' }, { k: 'phone', l: 'Phone' },
      { k: 'createdAt', l: 'Joined', f: v => fmtDate(v) }
    ]
  },
  {
    key: 'admins', title: 'Admins', icon: '🛡️', owner: 'M1',
    ownerText: 'Staff accounts and their permission levels',
    listEndpoint: '/api/admin/admins', endpoint: '/api/admin/admins', singular: 'admin',
    canCreate: true, canEdit: true, canDelete: true,
    editFields: ['permissionLevel'],
    columns: [
      { k: 'fullName', l: 'Name' }, { k: 'email', l: 'Email' },
      { k: 'permissionLevel', l: 'Permission', f: v => `<span class="badge ${v === 'SUPER_ADMIN' ? 'badge-imax' : 'badge-muted'}">${esc(v)}</span>` },
      { k: 'createdAt', l: 'Created', f: v => fmtDate(v) }
    ],
    fields: [
      { name: 'fullName', label: 'Full name', required: true, maxlength: 100 },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password (min 8)', type: 'password', required: true },
      { name: 'permissionLevel', label: 'Permission level', type: 'select', required: true,
        options: [['STAFF', 'STAFF — day to day management'],
                  ['SUPER_ADMIN', 'SUPER_ADMIN — everything, including admins']], default: 'STAFF' }
    ]
  },
  {
    key: 'movies', title: 'Movies', icon: '🎬', owner: 'M2',
    ownerText: 'Films on the catalogue, with format, cast and media',
    listEndpoint: '/api/movies', endpoint: '/api/admin/movies', singular: 'movie',
    canCreate: true, canEdit: true, canDelete: true,
    columns: [
      { k: 'title', l: 'Title' }, { k: 'genre', l: 'Genre' },
      { k: 'format', l: 'Format', f: v => formatBadge(v) },
      { k: 'durationMinutes', l: 'Minutes' }, { k: 'rating', l: 'Rating' },
      { k: 'surcharge', l: 'Surcharge', f: v => money(v) }
    ],
    fields: [
      { name: 'title', label: 'Title', required: true, maxlength: 150 },
      { name: 'genre', label: 'Genre', required: true, maxlength: 60 },
      { name: 'language', label: 'Language', required: true, maxlength: 40 },
      { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number', required: true, min: 30, max: 400 },
      { name: 'rating', label: 'Rating (U, PG, PG-13…)', maxlength: 10 },
      { name: 'format', label: 'Format', type: 'select', required: true, lockOnEdit: true,
        lockedHint: 'Fixed once the movie is created. Create a new movie to change its format.',
        options: [['STANDARD', 'Standard 2D'], ['IMAX', 'IMAX (+LKR 300)'], ['THREE_D', '3D (+LKR 200)']] },
      { name: 'releaseDate', label: 'Release date', type: 'date' },
      { name: 'director', label: 'Director', maxlength: 150 },
      { name: 'producers', label: 'Producers (comma-separated)', maxlength: 300 },
      { name: 'writers', label: 'Writers (comma-separated)', maxlength: 300 },
      { name: 'castMembers', label: 'Cast (comma-separated)', maxlength: 500 },
      { name: 'trailerUrl', label: 'Trailer link (YouTube, optional)', maxlength: 500, full: true },
      { name: 'stillUrls', label: 'Scene image URLs (comma-separated, optional)', maxlength: 2000, full: true,
        get: r => (r.stills || []).join(', ') },
      { name: 'posterUrl', label: 'Poster image URL (optional)', maxlength: 500, full: true },
      { name: 'description', label: 'Description', type: 'textarea', maxlength: 1000, full: true }
    ]
  },
  {
    key: 'theatres', title: 'Theatres', icon: '🏛️', owner: 'M3',
    ownerText: 'Cinema locations across the cities we serve',
    listEndpoint: '/api/theatres', endpoint: '/api/admin/theatres', singular: 'theatre',
    canCreate: true, canEdit: true, canDelete: true,
    columns: [
      { k: 'name', l: 'Name' }, { k: 'city', l: 'City' }, { k: 'address', l: 'Address' }, { k: 'phone', l: 'Phone' }
    ],
    fields: [
      { name: 'name', label: 'Theatre name', required: true, maxlength: 100 },
      { name: 'city', label: 'City', required: true, maxlength: 60 },
      { name: 'address', label: 'Address', maxlength: 200, full: true },
      { name: 'phone', label: 'Phone', maxlength: 20 }
    ],
    rowAction: { label: 'Screens & seats', run: r => openScreenManager(r) }
  },
  {
    key: 'screens', title: 'Screens', icon: '🖥️', owner: 'M3',
    ownerText: 'Auditoriums in each theatre: standard, premium recliner or VIP',
    listEndpoint: '/api/screens', endpoint: '/api/admin/screens', singular: 'screen',
    canCreate: true, canEdit: true, canDelete: true,
    columns: [
      { k: 'name', l: 'Screen' }, { k: 'theatreName', l: 'Theatre' },
      { k: 'category', l: 'Category' }, { k: 'rowCount', l: 'Rows' }, { k: 'seatsPerRow', l: 'Seats/row' },
      { k: 'seatRange', l: 'Seat numbers', f: (v, r) => seatRange(r) },
      { k: 'totalSeats', l: 'Total' }, { k: 'priceMultiplier', l: '× price' }
    ],
    fields: [
      { name: 'name', label: 'Screen name', required: true, maxlength: 60 },
      { name: 'theatreId', label: 'Theatre', type: 'select', required: true, numeric: true,
        optionsFrom: '/api/theatres', labelFn: t => t.name, valueFn: t => t.id },
      { name: 'screenType', label: 'Screen type', type: 'select', required: true, lockOnEdit: true,
        lockedHint: 'Fixed once the screen is created. Create a new screen to change its type.',
        options: [['STANDARD', 'Standard 2D (×1.00)'], ['PREMIUM', 'Premium recliner (×1.30)'], ['VIP', 'VIP lounge (×1.80)']] },
      { name: 'rowCount', label: 'Rows (1–26)', type: 'number', required: true, min: 1, max: 26 },
      { name: 'seatsPerRow', label: 'Seats per row (1–30)', type: 'number', required: true, min: 1, max: 30 }
    ],
    formExtra: () => `<div class="field full">
        <label>Seat numbers for this screen</label>
        <div id="seatPreview" class="seat-preview-box"></div>
        <span class="hint">Each screen keeps its own seat numbers. These are the exact codes customers will pick when booking this screen.</span>
      </div>`,
    onFormReady: form => {
      const update = () => renderSeatPreview(form);
      ['rowCount', 'seatsPerRow'].forEach(n => {
        const el = form.querySelector(`[name="${n}"]`);
        if (el) el.addEventListener('input', update);
      });
      update();
    }
  },
  {
    key: 'shows', title: 'Showtimes', icon: '🗓️', owner: 'M4',
    ownerText: 'Scheduled screenings. Overlapping times are blocked automatically.',
    listEndpoint: '/api/admin/shows', endpoint: '/api/admin/shows', singular: 'showtime',
    canCreate: true, canEdit: true, canDelete: true,
    columns: [
      { k: 'movieTitle', l: 'Movie' }, { k: 'theatreName', l: 'Theatre' }, { k: 'screenName', l: 'Screen' },
      { k: 'startTime', l: 'Starts', f: v => fmtDateTime(v) },
      { k: 'basePrice', l: 'Base', f: v => money(v) },
      { k: 'seatPrice', l: 'Seat price', f: v => money(v) },
      { k: 'pricingStrategy', l: 'Rule' }
    ],
    fields: [
      { name: 'movieId', label: 'Movie', type: 'select', required: true, numeric: true,
        optionsFrom: '/api/movies', labelFn: m => m.title, valueFn: m => m.id },
      { name: 'screenId', label: 'Screen', type: 'select', required: true, numeric: true,
        optionsFrom: '/api/screens', labelFn: s => `${s.theatreName} · ${s.name}`, valueFn: s => s.id },
      { name: 'startTime', label: 'Start time', type: 'datetime-local', required: true,
        get: r => r.startTime },
      { name: 'basePrice', label: 'Base price (LKR)', type: 'number', required: true, min: 1 }
    ]
  },
  {
    key: 'bookings', title: 'Bookings', icon: '🎟️', owner: 'M5',
    ownerText: 'All reservations, one page at a time. Only cancelled bookings can be removed.',
    listEndpoint: '/api/admin/bookings', endpoint: '/api/admin/bookings', singular: 'booking',
    pagedEndpoint: '/api/admin/bookings/page',
    canCreate: false, canEdit: false, canDelete: true,
    canDeleteRow: r => r.status === 'CANCELLED',
    columns: [
      { k: 'reference', l: 'Reference' }, { k: 'customerName', l: 'Customer' }, { k: 'movieTitle', l: 'Movie' },
      { k: 'showTime', l: 'Show time', f: v => fmtDateTime(v) },
      { k: 'seatCodes', l: 'Seats', f: v => v.join(', ') },
      { k: 'totalAmount', l: 'Total', f: v => money(v) },
      { k: 'discountAmount', l: 'Discount', f: (v, r) => Number(v) > 0 ? `${esc(r.promoCode)} − ${money(v)}` : '—' },
      { k: 'checkedInAt', l: 'At the door', f: v => v ? fmtDateTime(v) : '—' },
      { k: 'status', l: 'Status', f: v => statusBadge(v) }
    ]
  },
  {
    key: 'promos', title: 'Promo codes', icon: '', owner: '',
    ownerText: 'Discount codes: a percentage or a flat amount, with a minimum spend, a validity window and a use limit',
    listEndpoint: '/api/admin/promos', endpoint: '/api/admin/promos', singular: 'promo code',
    canCreate: true, canEdit: true, canDelete: true,
    columns: [
      { k: 'code', l: 'Code' },
      { k: 'type', l: 'Type' },
      { k: 'value', l: 'Off', f: (v, r) => r.type === 'PERCENT' ? `${Number(v)}%` : money(v) },
      { k: 'minSpend', l: 'Min spend', f: v => money(v) },
      { k: 'validFrom', l: 'From', f: v => fmtDate(v) },
      { k: 'validUntil', l: 'Until', f: v => fmtDate(v) },
      { k: 'usedCount', l: 'Used', f: (v, r) => `${v}${r.maxUses ? ' / ' + r.maxUses : ''}` },
      { k: 'active', l: 'Active', f: v => `<span class="badge ${v ? 'badge-imax' : 'badge-muted'}">${v ? 'live' : 'inactive'}</span>` }
    ],
    fields: [
      { name: 'code', label: 'Code', required: true, maxlength: 30 },
      { name: 'type', label: 'Type', type: 'select', required: true,
        options: [['PERCENT', 'PERCENT — a percentage off'], ['FLAT', 'FLAT — an amount off']], default: 'PERCENT' },
      { name: 'value', label: 'Value (percent or LKR)', type: 'number', required: true, step: '0.01' },
      { name: 'minSpend', label: 'Minimum spend (LKR)', type: 'number', step: '0.01', default: 0 },
      { name: 'validFrom', label: 'Valid from', type: 'date', required: true },
      { name: 'validUntil', label: 'Valid until', type: 'date', required: true },
      { name: 'maxUses', label: 'Maximum uses (blank = unlimited)', type: 'number' },
      { name: 'description', label: 'Description', maxlength: 160 }
    ]
  },
  {
    key: 'payments', title: 'Payments', icon: '💳', owner: 'M6',
    ownerText: 'Payments and refunds. Record a manual refund, or remove refunded payments.',
    listEndpoint: '/api/admin/payments', endpoint: '/api/admin/payments', singular: 'payment',
    canCreate: false, canEdit: true, canDelete: true,
    canEditRow: r => r.status !== 'REFUNDED',
    canDeleteRow: r => r.status === 'REFUNDED',
    editFields: ['status'],
    columns: [
      { k: 'transactionRef', l: 'Transaction' }, { k: 'bookingReference', l: 'Booking' },
      { k: 'customerName', l: 'Customer' }, { k: 'method', l: 'Method' },
      { k: 'amount', l: 'Amount', f: v => money(v) },
      { k: 'refundedAmount', l: 'Refunded', f: v => money(v) },
      { k: 'status', l: 'Status', f: v => statusBadge(v) },
      { k: 'paidAt', l: 'Paid at', f: v => fmtDateTime(v) }
    ],
    fields: [
      { name: 'status', label: 'Status', type: 'select', required: true,
        options: [['REFUNDED', 'Record manual full refund']], get: () => 'REFUNDED',
        hint: 'Automatic refunds happen when a booking is cancelled. Use this for manual refunds only.' }
    ]
  },
  {
    key: 'files', title: 'Files & Reports', icon: '📁', owner: 'M6',
    ownerText: 'Copy the MySQL import tables into the live tables and export the sales report'
  },
  {
    key: 'reports', title: 'Sales reports', icon: '📄', owner: '',
    ownerText: 'Download a sales summary for a selected date range'
  }
];

const state = { section: null, rows: [], fileLog: '' };

const $ = id => document.getElementById(id);

/* ---------- boot ---------- */
(async function boot() {
  const me = await requireRole('ADMIN', 'admin-login.html');
  if (!me) return;
  // Only SUPER_ADMIN accounts manage other admins; STAFF accounts do not see that section.
  // Y1S2 demo scope: show the core CRUD and booking modules only.
  const coreSections = new Set(['overview', 'customers', 'admins', 'movies', 'theatres', 'screens', 'shows', 'bookings', 'payments', 'reports']);
  visibleSections = SECTIONS.filter(s => coreSections.has(s.key)
    && (s.key !== 'admins' || me.permissionLevel === 'SUPER_ADMIN'));
  $('sideNav').innerHTML = visibleSections.map(s => `
    <button class="side-link" data-key="${s.key}">
      <span>${NAV_ICONS[s.key] || s.icon}</span><span>${esc(s.title)}</span>
    </button>`).join('');
  document.querySelectorAll('.side-link').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.key; }));
  $('logoutBtn').addEventListener('click', async () => {
    try { await API.post('/api/auth/logout', {}); } catch (e) { /* ignore */ }
    window.location.href = 'admin-login.html';
  });
  $('modalClose').addEventListener('click', closeModal);
  $('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  window.addEventListener('hashchange', () => showSection(location.hash.slice(1)));
  showSection(location.hash.slice(1));
})();

let visibleSections = SECTIONS;

function showSection(key) {
  const section = visibleSections.find(s => s.key === key) || visibleSections[0];
  state.section = section;
  document.querySelectorAll('.side-link').forEach(b => b.classList.toggle('active', b.dataset.key === section.key));
  $('sectionTitle').textContent = section.title;
  const body = $('sectionBody');
  body.innerHTML = '<div class="loader">Loading…</div>';
  const run = section.key === 'overview' ? renderOverview(body)
    : section.key === 'analytics' ? renderAnalytics(body)
    : section.key === 'sales' ? renderSales(body)
    : section.key === 'files' ? renderFiles(body)
    : section.key === 'reports' ? renderSalesReports(body)
    : section.pagedEndpoint ? renderPagedCrud(body, section)
    : renderCrud(body, section);
  run.catch(err => { body.innerHTML = `<div class="card error-text">${esc(err.message)}</div>`; });
}

/* ---------- overview (summary cards) ---------- */
async function renderOverview(body) {
  const [movies, shows, bookings, customers] = await Promise.all([
    API.get('/api/movies'), API.get('/api/admin/shows'), API.get('/api/admin/bookings'),
    API.get('/api/admin/customers')
  ]);
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const stat = (num, label, hint, icon) => `<div class="card kpi">
      <span class="kpi-icon">${icon}</span>
      <span class="num">${num}</span>
      <span class="lbl">${label}</span>
      <span class="kpi-hint">${hint}</span>
    </div>`;
  body.innerHTML = `
    <div class="grid kpi-grid">
      ${stat(movies.length, 'Movies', 'in the catalogue', NAV_ICONS.movies)}
      ${stat(shows.length, 'Showtimes', 'scheduled ahead', NAV_ICONS.shows)}
      ${stat(confirmed, 'Confirmed bookings', 'seats paid for', NAV_ICONS.bookings)}
      ${stat(customers.length, 'Customers', 'registered accounts', NAV_ICONS.customers)}
    </div>
    <div class="section-head"><div><h2>Recent bookings</h2><p>Latest 8 reservations across all theatres.</p></div></div>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Table, scrolls sideways"><table class="table">
      <thead><tr><th>Reference</th><th>Customer</th><th>Movie</th><th>Show time</th><th>Seats</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${bookings.slice(0, 8).map(b => `<tr>
        <td>${esc(b.reference)}</td><td>${esc(b.customerName)}</td><td>${esc(b.movieTitle)}</td>
        <td>${fmtDateTime(b.showTime)}</td><td>${b.seatCodes.map(esc).join(', ')}</td>
        <td>${money(b.totalAmount)}</td><td>${statusBadge(b.status)}</td></tr>`).join('') ||
        '<tr><td colspan="7" class="empty">No bookings yet.</td></tr>'}</tbody></table></div>`;
}

/* ---------- generic CRUD table ---------- */
async function renderCrud(body, s) {
  state.rows = await API.get(s.listEndpoint);
  body.innerHTML = `
    <div class="toolbar">
      <div class="row">
        ${s.search ? '<input id="searchBox" placeholder="Search by name or email…" style="width:280px">' : ''}
        <span class="muted" id="rowCount">${state.rows.length} record(s)</span>
      </div>
      ${s.canCreate ? `<button class="btn btn-primary" id="newBtn">+ New ${esc(s.singular)}</button>` : ''}
    </div>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Table, scrolls sideways"><table class="table">
      <thead><tr>${s.columns.map(c => `<th>${esc(c.l)}</th>`).join('')}<th></th></tr></thead>
      <tbody id="tbody"></tbody>
    </table></div>`;
  drawRows(s, state.rows);
  if (s.canCreate) $('newBtn').addEventListener('click', () => openForm(s, null));
  if (s.search) {
    let timer;
    $('searchBox').addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = encodeURIComponent(e.target.value.trim());
        state.rows = await API.get(s.listEndpoint + '?q=' + q);
        drawRows(s, state.rows);
        $('rowCount').textContent = state.rows.length + ' record(s)';
      }, 250);
    });
  }
}

/* Seat numbering helpers: rows run A, B, C… and each row is numbered 1…N. */
const rowLetter = n => String.fromCharCode(64 + Math.min(Math.max(Number(n) || 1, 1), 26));
const seatRange = r => (r && r.rowCount && r.seatsPerRow)
  ? `${rowLetter(1)}1 – ${rowLetter(r.rowCount)}${r.seatsPerRow}` : '—';

/** Draws the live seat-number grid inside the screen form. */
function renderSeatPreview(form) {
  const box = form.querySelector('#seatPreview');
  if (!box) return;
  const rows = Number((form.querySelector('[name="rowCount"]') || {}).value || 0);
  const cols = Number((form.querySelector('[name="seatsPerRow"]') || {}).value || 0);
  if (!rows || !cols) {
    box.innerHTML = '<p class="hint" style="margin:0">Enter the row count and seats per row to see the seat numbers.</p>';
    return;
  }
  let html = '';
  for (let r = 0; r < rows; r++) {
    const letter = String.fromCharCode(65 + r);
    html += `<div class="seat-row"><span class="row-label">${letter}</span>`;
    for (let c = 1; c <= cols; c++) html += `<span class="seat">${letter}${c}</span>`;
    html += '</div>';
  }
  box.innerHTML = `<div class="seat-preview">${html}</div>
    <p class="hint" style="margin:.55rem 0 0"><strong>${rows * cols} seats</strong> · seat numbers ${rowLetter(1)}1 to ${rowLetter(rows)}${cols}</p>`;
}

/**
 * Manage the screens (and their seat numbers) of one theatre without leaving the theatre row.
 * Every screen keeps its own layout, so seats are numbered separately per screen.
 */
async function openScreenManager(theatre) {
  const s = SECTIONS.find(x => x.key === 'screens');
  let list = [];
  try {
    list = await API.get(`/api/screens?theatreId=${theatre.id}`);
  } catch (err) {
    toast(err.message, 'err');
    return;
  }
  const form = $('modalForm');
  $('modalTitle').textContent = `Screens & seats · ${theatre.name}`;
  $('modal').querySelector('.modal').classList.add('wide');
  const body = list.length ? list.map(sc => `<tr>
      <td>${esc(sc.name)}</td>
      <td>${esc(sc.category)}</td>
      <td>${sc.rowCount} × ${sc.seatsPerRow}</td>
      <td>${seatRange(sc)}</td>
      <td>${sc.totalSeats}</td>
      <td class="actions">
        <button type="button" class="btn btn-ghost btn-sm" data-sc-edit="${sc.id}">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" data-sc-del="${sc.id}">Delete</button>
      </td></tr>`).join('')
    : '<tr><td colspan="6" class="empty">No screens yet. Add a screen to give this theatre seat numbers.</td></tr>';

  form.innerHTML = `
    <p class="hint">Each screen below has its own seat layout. Rows run A, B, C… and every row is numbered 1…N.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Table, scrolls sideways"><table class="table">
      <thead><tr><th>Screen</th><th>Category</th><th>Layout</th><th>Seat numbers</th><th>Total</th><th></th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>
    <div class="modal-foot">
      <button type="button" class="btn btn-ghost" id="scClose">Close</button>
      <button type="button" class="btn btn-primary" id="scAdd">+ Add screen</button>
    </div>`;
  form.onsubmit = e => e.preventDefault();
  $('scClose').addEventListener('click', closeModal);
  $('scAdd').addEventListener('click', () => openForm(s, null, { theatreId: theatre.id }));
  form.querySelectorAll('[data-sc-edit]').forEach(b => b.addEventListener('click',
    () => openForm(s, list.find(x => String(x.id) === b.dataset.scEdit))));
  form.querySelectorAll('[data-sc-del]').forEach(b => b.addEventListener('click',
    () => removeRow(s, list.find(x => String(x.id) === b.dataset.scDel))));
  $('modal').classList.add('open');
}

function drawRows(s, rows) {
  const tbody = $('tbody');
  const span = s.columns.length + 1;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="${span}" class="empty">No records found.</td></tr>`; return; }
  tbody.innerHTML = rows.map(r => {
    const canEdit = s.canEdit && (!s.canEditRow || s.canEditRow(r));
    const canDelete = s.canDelete && (!s.canDeleteRow || s.canDeleteRow(r));
    return `<tr>
      ${s.columns.map(c => `<td>${c.f ? c.f(r[c.k], r) : esc(r[c.k] ?? '')}</td>`).join('')}
      <td class="actions">
        ${s.rowAction ? `<button class="btn btn-ghost btn-sm" data-rowact="${r.id}">${esc(s.rowAction.label)}</button>` : ''}
        ${canEdit ? `<button class="btn btn-ghost btn-sm" data-edit="${r.id}">Edit</button>` : ''}
        ${canDelete ? `<button class="btn btn-danger btn-sm" data-del="${r.id}">Delete</button>` : ''}
      </td></tr>`;
  }).join('');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click',
    () => openForm(s, rows.find(x => String(x.id) === b.dataset.edit))));
  tbody.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click',
    () => removeRow(s, rows.find(x => String(x.id) === b.dataset.del))));
  tbody.querySelectorAll('[data-rowact]').forEach(b => b.addEventListener('click',
    () => s.rowAction.run(rows.find(x => String(x.id) === b.dataset.rowact))));
}

/* ---------- create / update form ---------- */
async function openForm(s, row, preset) {
  const fields = row && s.editFields ? s.fields.filter(f => s.editFields.includes(f.name)) : s.fields;
  for (const f of fields) {
    if (f.optionsFrom) {
      const list = await API.get(f.optionsFrom);
      f.loaded = list.map(item => [f.valueFn(item), f.labelFn(item)]);
    }
  }
  const form = $('modalForm');
  $('modalTitle').textContent = (row ? 'Edit ' : 'New ') + s.singular;
  form.innerHTML = `
    <div class="form-grid">${fields.map(f => fieldHtml(f, row, preset)).join('')}${s.formExtra ? s.formExtra(row) : ''}</div>
    <div class="error-text" id="formError"></div>
    <div class="modal-foot">
      <button type="button" class="btn btn-ghost" id="formCancel">Cancel</button>
      <button type="submit" class="btn btn-primary" id="formSubmit">${row ? 'Save changes' : 'Create'}</button>
    </div>`;
  $('formCancel').addEventListener('click', closeModal);
  if (s.onFormReady) s.onFormReady(form, row);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const errorBox = $('formError');
    errorBox.textContent = '';
    const body = {};
    for (const f of fields) {
      const el = form.querySelector(`[name="${f.name}"]`);
      let v = el.value;
      if (f.type === 'number') v = v === '' ? null : Number(v);
      else if (f.type === 'datetime-local') v = v ? v + ':00' : null;
      else v = v.trim() === '' ? null : v.trim();
      if (f.numeric && v !== null) v = Number(v);
      if (f.required && (v === null || v === '')) { errorBox.textContent = `${f.label} is required`; return; }
      body[f.name] = v;
    }
    const url = row ? `${s.endpoint}/${row.id}` : s.endpoint;
    $('formSubmit').disabled = true;
    try {
      if (row) await API.put(url, body); else await API.post(url, body);
      closeModal();
      toast(row ? 'Changes saved' : 'Created successfully');
      showSection(s.key);
    } catch (err) {
      errorBox.textContent = err.message;
    } finally {
      $('formSubmit').disabled = false;
    }
  };
  $('modal').classList.add('open');
}

function fieldHtml(f, row, preset) {
  const raw = row ? (f.get ? f.get(row) : row[f.name])
    : (preset && preset[f.name] !== undefined ? preset[f.name] : (f.default ?? ''));
  let val = raw === null || raw === undefined ? '' : raw;
  if (f.type === 'datetime-local' && val) val = String(val).slice(0, 16);
  const req = f.required ? 'required' : '';
  const span = f.full ? ' full' : '';
  const locked = !!(row && f.lockOnEdit);
  const dis = locked ? 'disabled' : '';
  const hint = locked ? (f.lockedHint || 'This field cannot be changed after creation.') : f.hint;
  let input;
  if (f.type === 'select') {
    const options = f.loaded || f.options || [];
    const hasValue = options.some(([v]) => String(v) === String(val));
    input = `<select name="${f.name}" ${req} ${dis}>
      ${!hasValue ? '<option value="" disabled selected>Choose…</option>' : ''}
      ${options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}
    </select>`;
  } else if (f.type === 'textarea') {
    input = `<textarea name="${f.name}" ${f.maxlength ? `maxlength="${f.maxlength}"` : ''}>${esc(val)}</textarea>`;
  } else {
    input = `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(val)}" ${req} ${dis}
      ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''}
      ${f.maxlength ? `maxlength="${f.maxlength}"` : ''} ${f.type === 'number' ? 'step="any"' : ''}>`;
  }
  return `<div class="field${span}"><label>${esc(f.label)}${f.required ? ' *' : ''}</label>${input}
          ${hint ? `<span class="hint">${esc(hint)}</span>` : ''}</div>`;
}

function closeModal() {
  $('modal').classList.remove('open');
  $('modal').querySelector('.modal').classList.remove('wide');
}

/* ---------- delete ---------- */
async function removeRow(s, row) {
  if (!row) return;
  const label = row.title || row.name || row.fullName || row.reference || row.transactionRef || ('#' + row.id);
  if (!confirm(`Delete ${s.singular} "${label}"? This cannot be undone.`)) return;
  try {
    await API.del(`${s.endpoint}/${row.id}`);
    toast('Deleted');
    showSection(s.key);
  } catch (err) {
    toast(err.message, 'err');
  }
}

/* ---------- simple date-filtered sales exports ---------- */
function renderSalesReports(body) {
  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 29);
  body.innerHTML = `
    <section class="card" style="max-width:760px">
      <h2>Sales reports</h2>
      <p>Choose a period, then download a report. Excel includes charts; CSV is plain table data.</p>
      <div class="sales-export-range" style="margin:1.25rem 0">
        <label for="reportFrom">From <input type="date" id="reportFrom" value="${dayKey(fromDate)}"></label>
        <label for="reportTo">To <input type="date" id="reportTo" value="${dayKey(today)}"></label>
      </div>
      <p class="hint" id="reportRangeHint" aria-live="polite">Reports can cover up to 366 days.</p>
      <div class="btn-row">
        <a class="btn btn-primary" id="salesPdf" href="#">Download PDF</a>
        <a class="btn btn-ghost" id="salesXlsx" href="#">Download Excel</a>
        <a class="btn btn-ghost" id="salesCsv" href="#">Download CSV</a>
      </div>
    </section>`;

  const links = [$('salesPdf'), $('salesXlsx'), $('salesCsv')];
  const updateLinks = () => {
    const from = $('reportFrom').value;
    const to = $('reportTo').value;
    const hint = $('reportRangeHint');
    const span = from && to
      ? (Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000
      : NaN;
    const valid = Number.isFinite(span) && from <= to && span < 366;
    links.forEach(link => {
      link.href = '#';
      link.setAttribute('aria-disabled', 'true');
      link.classList.add('disabled');
    });
    if (!valid) {
      hint.textContent = !from || !to ? 'Select both dates.'
        : from > to ? 'The start date must be on or before the end date.'
        : 'Choose a date range of no more than 366 days.';
      hint.classList.add('error-text');
      return;
    }
    hint.textContent = 'Reports can cover up to 366 days.';
    hint.classList.remove('error-text');
    const range = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const urls = ['/api/admin/reports/sales.pdf', '/api/admin/reports/sales.xlsx', '/api/admin/reports/sales.csv'];
    links.forEach((link, i) => {
      link.href = urls[i] + range;
      link.removeAttribute('aria-disabled');
      link.classList.remove('disabled');
    });
  };
  $('reportFrom').addEventListener('change', updateLinks);
  $('reportTo').addEventListener('change', updateLinks);
  updateLinks();
}

/* ---------- files: MySQL import tables -> live tables, plus the sales report ---------- */
async function renderFiles(body) {
  const reportTo = new Date();
  const reportFrom = new Date(Date.now() - 364 * 86400000);
  body.innerHTML = `
    <div class="grid file-grid">
      <div class="card">
        <span class="badge badge-ok">MYSQL</span>
        <h3 class="mt-1">Import movies</h3>
        <p>Copies rows from the MySQL table <code>import_movies</code> into <code>movies</code>. Titles that already exist are skipped. Nothing is read from disk.</p>
        <p class="muted small" id="stagedMovies">Rows waiting in import_movies: …</p>
        <button class="btn btn-primary" data-run="import-movies">Import movies</button>
      </div>
      <div class="card">
        <span class="badge badge-ok">MYSQL</span>
        <h3 class="mt-1">Import users</h3>
        <p>Copies rows from the MySQL table <code>import_users</code> into <code>users</code>. Passwords arrive as BCrypt hashes and stay hashed.</p>
        <p class="muted small" id="stagedUsers">Rows waiting in import_users: …</p>
        <button class="btn btn-primary" data-run="import-users">Import users</button>
      </div>
      <div class="card">
        <span class="badge badge-ok">MYSQL</span>
        <h3 class="mt-1">Import showtimes</h3>
        <p>Copies rows from the MySQL table <code>import_showtimes</code> into <code>showtimes</code>, matching movie, theatre and screen by name.</p>
        <p class="muted small" id="stagedShowtimes">Rows waiting in import_showtimes: …</p>
        <button class="btn btn-primary" data-run="import-showtimes">Import showtimes</button>
      </div>
      <div class="card">
        <span class="badge badge-warn">WRITE</span>
        <h3 class="mt-1">Sales report</h3>
        <p>Choose a date range. PDF includes a designed report and charts; Excel includes editable data with real embedded charts. CSV is plain tabular data for importing into other tools.</p>
        <div class="sales-export-range" id="salesExportRange">
          <label>From <input type="date" id="reportFrom" value="${dayKey(reportFrom)}"></label>
          <label>To <input type="date" id="reportTo" value="${dayKey(reportTo)}"></label>
        </div>
        <div class="btn-row">
          <a class="btn btn-primary" id="salesPdf" href="#">PDF report</a>
          <a class="btn btn-primary" id="salesXlsx" href="#">Excel + charts</a>
          <a class="btn btn-ghost" id="salesCsv" href="#">CSV data</a>
        </div>
      </div>
    </div>
    <div class="section-head"><h2>Last result</h2></div>
    <pre class="card out" id="fileOut">${esc(state.fileLog || 'Nothing run yet.')}</pre>`;

  const updateReportLinks = () => {
    const from = $('reportFrom').value, to = $('reportTo').value;
    const links = [$('salesPdf'), $('salesXlsx'), $('salesCsv')];
    const disableLinks = () => links.forEach(link => {
      link.href = '#';
      link.setAttribute('aria-disabled', 'true');
      link.classList.add('disabled');
    });
    if (!from || !to || from > to) {
      disableLinks();
      toast('Choose a valid report date range (From must not be after To).', 'err');
      return;
    }
    const daySpan = (Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000;
    if (daySpan >= 366) {
      disableLinks();
      toast('Reports support a maximum range of 366 days.', 'err');
      return;
    }
    const range = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    links.forEach(link => {
      link.removeAttribute('aria-disabled');
      link.classList.remove('disabled');
    });
    $('salesPdf').href = '/api/admin/reports/sales.pdf' + range;
    $('salesXlsx').href = '/api/admin/reports/sales.xlsx' + range;
    $('salesCsv').href = '/api/admin/reports/sales.csv' + range;
  };
  $('reportFrom').addEventListener('change', updateReportLinks);
  $('reportTo').addEventListener('change', updateReportLinks);
  updateReportLinks();

  // live row counts, straight from MySQL, so it is obvious where the data lives
  const showStatus = (st) => {
    const put = (id, text) => { const el = $(id); if (el) el.textContent = text; };
    put('stagedMovies', `import_movies: ${st.stagedMovies} row(s) → movies table: ${st.liveMovies}`);
    put('stagedUsers', `import_users: ${st.stagedUsers} row(s) → users table: ${st.liveUsers}`);
    put('stagedShowtimes', `import_showtimes: ${st.stagedShowtimes} row(s) → showtimes table: ${st.liveShowtimes}`);
  };
  const loadStatus = async () => {
    try {
      showStatus(await API.get('/api/admin/files/status'));
    } catch (err) {
      $('stagedMovies').textContent = 'Could not read the import tables: ' + err.message;
    }
  };
  loadStatus();

  body.querySelectorAll('[data-run]').forEach(btn => btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      const result = await API.post('/api/admin/files/' + btn.dataset.run, {});
      state.fileLog = JSON.stringify(result, null, 2);
      toast(`Imported ${result.imported}, skipped ${result.skipped}`);
    } catch (err) {
      state.fileLog = 'Error: ' + err.message;
      toast(err.message, 'err');
    } finally {
      btn.disabled = false;
      $('fileOut').textContent = state.fileLog;
      loadStatus();
    }
  }));
}

/* ---------- sales dashboard (charts + KPI cards) ---------- */
const SALES_METHODS = { CARD: 'Card', WALLET: 'Mobile wallet', CASH_COUNTER: 'Cinema counter', PAYHERE: 'PayHere gateway' };
const SALES_COLORS = ['#7c3aed', '#ec4899', '#22d3ee', '#22c55e', '#f59e0b'];

async function renderSales(body) {
  const isCurrent = () => body.isConnected && state.section?.key === 'sales';
  const today = new Date();
  const weekAgo = new Date(Date.now() - 13 * 86400000);
  body.innerHTML = `
    <div class="toolbar sales-toolbar">
      <form class="row sales-range" id="salesRange">
        <label class="muted">From <input type="date" id="rFrom" value="${dayKey(weekAgo)}"></label>
        <label class="muted">To <input type="date" id="rTo" value="${dayKey(today)}"></label>
        <button class="btn btn-primary btn-sm" type="submit">Apply</button>
        <button class="btn btn-ghost btn-sm" type="button" data-days="7">Last 7 days</button>
        <button class="btn btn-ghost btn-sm" type="button" data-days="30">Last 30 days</button>
      </form>
      <a class="btn btn-ghost btn-sm" id="csvLink" href="#">Download CSV</a>
    </div>
    <div id="salesBody"><div class="loader">Loading sales…</div></div>`;

  const load = async () => {
    // Keep references to this tab's nodes. A response can arrive after another tab has replaced them.
    const fromInput = $('rFrom'), toInput = $('rTo');
    const csvLink = $('csvLink'), salesBody = $('salesBody');
    if (!isCurrent() || !fromInput || !toInput || !csvLink || !salesBody) return;
    const from = fromInput.value, to = toInput.value;
    csvLink.href = `/api/admin/reports/sales.csv?from=${from}&to=${to}`;
    salesBody.innerHTML = '<div class="loader">Loading sales…</div>';
    try {
      const r = await API.get(`/api/admin/reports/sales?from=${from}&to=${to}`);
      if (!isCurrent() || !salesBody.isConnected) return;
      drawSales(salesBody, r);
    } catch (err) {
      if (!isCurrent() || !salesBody.isConnected) return;
      salesBody.innerHTML = `<div class="card error-text">${esc(err.message)}</div>`;
    }
  };
  $('salesRange').addEventListener('submit', e => { e.preventDefault(); load(); });
  body.querySelectorAll('[data-days]').forEach(btn => btn.addEventListener('click', () => {
    const days = Number(btn.dataset.days);
    $('rTo').value = dayKey(new Date());
    $('rFrom').value = dayKey(new Date(Date.now() - (days - 1) * 86400000));
    load();
  }));
  load();
}

function drawSales(box, r) {
  const t = r.totals;
  const short = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const kpi = (value, label, cls = '') => `<div class="card stat ${cls}"><span class="num gradient-text">${value}</span><span class="lbl">${label}</span></div>`;
  const daily = r.daily.map(d => ({ label: short(d.date), value: d.net, title: `${short(d.date)}: ${money(d.net)} · ${d.tickets} tickets` }));
  const tickets = r.daily.map(d => ({ label: short(d.date), value: d.tickets, title: `${short(d.date)}: ${d.tickets} tickets` }));
  const methods = r.byMethod.map((m, i) => ({
    label: SALES_METHODS[m.method] || m.method, value: m.amount, color: SALES_COLORS[i % SALES_COLORS.length],
    detail: `${m.count} payment${m.count === 1 ? '' : 's'}`
  }));
  const movies = r.byMovie.map(m => ({ label: m.title, value: m.net, sub: `${m.tickets} ticket${m.tickets === 1 ? '' : 's'}` }));
  const noSales = t.payments === 0;

  box.innerHTML = `
    <p class="muted">Period: ${fmtDate(r.from)} to ${fmtDate(r.to)}. Money is in LKR and includes convenience fees. Cancelled bookings are not counted in money, ticket or chart figures.</p>
    <div class="grid kpi-grid">
      ${kpi(money(t.net), 'Net takings (after refunds)')}
      ${kpi(money(t.gross), 'Gross charged')}
      ${kpi(money(t.refunds), 'Refunds')}
      ${kpi(t.tickets, 'Tickets sold')}
      ${kpi(t.confirmedBookings, 'Confirmed bookings')}
      ${kpi(t.cancelledBookings, 'Cancelled bookings')}
      ${kpi(t.occupancyPercent.toFixed(1) + '%', 'Seat occupancy')}
      ${kpi(money(t.fees), 'Convenience fees')}
    </div>
    ${noSales ? '<div class="card mt-2"><p class="muted" style="margin:0">No payments were taken in this period. Try a wider range.</p></div>' : ''}
    <div class="chart-grid mt-2">
      <section class="card chart-card wide">
        <h3>Daily net takings</h3>
        ${Charts.bars(daily, { color: '#7c3aed', ariaLabel: 'Daily net takings bar chart' })}
      </section>
      <section class="card chart-card">
        <h3>Tickets per day</h3>
        ${Charts.line(tickets, { width: 480, height: 230, color: '#22d3ee', ariaLabel: 'Tickets per day line chart' })}
      </section>
      <section class="card chart-card">
        <h3>Payment methods</h3>
        ${Charts.donut(methods, { ariaLabel: 'Payment methods donut chart', centreLabel: 'LKR' })}
      </section>
      <section class="card chart-card wide">
        <h3>Top movies by net takings</h3>
        ${Charts.hbars(movies, { format: v => money(v), colors: SALES_COLORS })}
      </section>
    </div>`;
}

/* ---------- analytics (tier 1 upgrade) ----------
   One call to /api/admin/analytics fills the whole page: the headline figures with their change against
   the previous period, the money over time, the booking funnel, and where the money comes from.
   The chosen window is remembered in localStorage so the page opens on the range you last looked at. */
const ANALYTICS_DAYS_KEY = 'cinemax-analytics-days';

/** "Last 7 days" / "Last 30 days" - used in the subtitle and the comparison captions. */
function periodName(days) {
  return days === 365 ? 'the last 12 months' : `the last ${days} days`;
}

/** Human name for a payment method enum: CASH_COUNTER -> "Cash at counter". */
const ANALYTICS_METHOD_NAMES = {
  CARD: 'Card', WALLET: 'Wallet', CASH_COUNTER: 'Cash at counter', PAYHERE: 'PayHere gateway'
};

/**
 * A headline figure with the change against the previous period.
 *
 * The change is stated in words as well as in percent, because the sign alone is ambiguous on a page
 * where "up" is good for revenue but bad for cancellations. A null change means there is no earlier
 * figure to compare with, and says so instead of showing a meaningless "+100%".
 */
function tableFoot(list) {
  const value = list.reduce((t, x) => t + (Number(x.value) || 0), 0);
  const count = list.reduce((t, x) => t + (Number(x.count) || 0), 0);
  return `<tfoot><tr>`
       + `<td class="pos"></td>`
       + `<td class="name">Total</td>`
       + `<td class="right">${Number(count).toLocaleString('en-LK')}</td>`
       + `<td class="right share-cell"><span class="share">`
       + `<span class="share-bar"><i style="width:100%"></i></span>`
       + `<span class="share-num">100%</span></span></td>`
       + `<td class="right strong">${moneyTable(value)}</td></tr></tfoot>`;
}

function shareCell(list, row) {
  const total = list.reduce((t, x) => t + (Number(x.value) || 0), 0);
  const max = list.reduce((m, x) => Math.max(m, Number(x.value) || 0), 0);
  const p = total > 0 ? (Number(row.value) || 0) / total * 100 : 0;
  /* The bar is scaled against the leader, not against 100%: every row here is a
     slice of the same total, so a percentage-of-total bar would leave all of them
     looking like identical stubs. The number still states the true share. */
  const bar = max > 0 ? (Number(row.value) || 0) / max * 100 : 0;
  const width = bar > 0 && bar < 4 ? 4 : bar;
  const text = p >= 10 ? Math.round(p) : p.toFixed(1);
  return `<span class="share" title="${text}% of the net revenue in this list">`
       + `<span class="share-bar"><i style="width:${width}%"></i></span>`
       + `<span class="share-num">${text}%</span></span>`;
}

function statCard({ label, display, full, change, hint, goodWhenUp = true, compared = true }) {
  // When there was nothing in the earlier period there is no percentage to show. Saying so on every
  // card would be noise, so the caption below the figure carries it instead.
  let delta = '';
  if (compared && change !== null && change !== undefined) {
    const up = change > 0;
    const flat = Math.abs(change) < 0.05;
    const tone = flat ? 'flat' : (up === goodWhenUp ? 'good' : 'bad');
    const arrow = flat ? '→' : (up ? '↑' : '↓');
    delta = `<span class="delta ${tone}"><span aria-hidden="true">${arrow}</span>${
      flat ? 'no change' : `${Math.abs(change).toFixed(1)}%`}</span>`;
  }
  return `<div class="stat-card">
      <span class="stat-label">${esc(label)}</span>
      <span class="stat-value" title="${esc(full || display)}">${esc(display)}</span>
      <div class="stat-foot">${delta}<span class="stat-hint">${esc(hint)}</span></div>
    </div>`;
}

/** Full money for the tooltip, compact money for the card so a large figure never wraps. */
/** Tables read better in whole rupees: the cents are noise in a ranked list and they
    cost the title column about 16px of width it actually needs. */
function moneyTable(value) {
  return 'LKR ' + Math.round(Number(value) || 0).toLocaleString('en-LK');
}

function moneyCompact(value) {
  const n = Number(value || 0);
  if (Math.abs(n) >= 1e6) return 'LKR ' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e5) return 'LKR ' + (n / 1e3).toFixed(1) + 'K';
  return money(n);
}

async function renderAnalytics(body) {
  const isCurrent = () => body.isConnected && state.section?.key === 'analytics';
  const days = Number(localStorage.getItem(ANALYTICS_DAYS_KEY) || 7);
  body.innerHTML = `
    <div class="toolbar">
      <div class="row">
        <label class="muted" for="analyticsDays">Reporting period</label>
        <select id="analyticsDays" style="width:180px">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
        </select>
      </div>
      <div class="row"><span class="muted" id="analyticsStamp"></span></div>
    </div>
    <div id="analyticsBody"><div class="loader">Loading analytics…</div></div>`;

  const select = $('analyticsDays');
  select.value = String([7, 30, 90, 365].includes(days) ? days : 7);
  select.addEventListener('change', () => {
    localStorage.setItem(ANALYTICS_DAYS_KEY, select.value);
    loadAnalytics();
  });
  loadAnalytics();

  async function loadAnalytics() {
    const box = $('analyticsBody');
    if (!isCurrent() || !box) return;
    box.innerHTML = '<div class="loader">Loading analytics…</div>';
    let a;
    try {
      a = await API.get('/api/admin/analytics?days=' + select.value);
    } catch (err) {
      if (isCurrent() && box.isConnected) {
        box.innerHTML = `<div class="card error-text">${esc(err.message)}</div>`;
      }
      return;
    }
    // The previous tab may have been replaced while the request was in flight.
    if (!isCurrent() || !box.isConnected) return;

    const s = a.summary;
    const vs = `vs. previous ${a.days === 365 ? '12 months' : a.days + ' days'}`;
    const int = n => Number(n).toLocaleString('en-LK');
    const pct = v => Number(v).toFixed(1) + '%';

    const day = a.revenueByDay.map(p => ({
      label: String(p.label).slice(5), value: Number(p.value), title: `${p.label}: ${money(p.value)}`
    }));
    const hour = a.occupancyByHour.map(p => ({
      label: p.label, value: Number(p.value), title: `${p.label} — ${int(p.value)} seat(s)`
    }));
    const methods = a.paymentMethods.map((p, i) => ({
      label: (ANALYTICS_METHOD_NAMES[p.label] || p.label.replace(/_/g, ' ').toLowerCase()),
      value: Number(p.value),
      detail: money(p.value),
      color: SALES_COLORS[i % SALES_COLORS.length]
    }));

    // The funnel is a conversion story: each step keeps the share of the step before it.
    const held = a.funnel.seatHolds || 0;
    const share = (n) => held ? Math.round((Number(n) / held) * 100) : 0;
    const step = (value, label, sub) => `<div class="funnel-step">
        <strong>${esc(value)}</strong><span>${esc(label)}</span>
        ${sub ? `<small class="muted">${esc(sub)}</small>` : ''}</div>`;

    // Business reading of the numbers: short, factual sentences, no exclamation marks.
    const notes = [];
    if (methods.length) {
      const top = methods.reduce((m, x) => (x.value > m.value ? x : m), methods[0]);
      const total = methods.reduce((t, x) => t + x.value, 0);
      notes.push(`${top.label} is the most used method at ${Math.round(top.value / total * 100)}% of payments.`);
    }
    if (a.revenueByMovie.length) {
      const top = a.revenueByMovie[0];
      notes.push(`${top.label} is the best performing title, taking ${money(top.value)}.`);
    }
    if (typeof s.occupancy.changePercent === 'number') {
      const dir = s.occupancy.changePercent >= 0 ? 'higher' : 'lower';
      notes.push(`Seat occupancy is ${Math.abs(s.occupancy.changePercent).toFixed(1)}% ${dir} than `
        + `${vs.replace('vs. ', '')}, at ${pct(s.occupancy.value)}.`);
    } else if (s.occupancy.value > 0) {
      notes.push(`Seat occupancy is ${pct(s.occupancy.value)}; there is no earlier period to compare it with.`);
    }
    if (hour.length) {
      const peak = hour.reduce((m, x) => (x.value > m.value ? x : m), hour[0]);
      notes.push(`${peak.label} is the best selling start time, with ${int(peak.value)} seats sold.`);
    }
    if (a.funnel.cancelled) {
      notes.push(`${int(a.funnel.cancelled)} booking(s) were cancelled in this period `
        + `(${held ? Math.round(a.funnel.cancelled / held * 100) : 0}% of everything created).`);
    }

    box.innerHTML = `
      <div class="report-head">
        <div>
          <h2 class="report-title">Performance report</h2>
          <p class="analytics-sub">${esc(periodName(a.days))}, compared with the period of the same length
             before it.</p>
        </div>
        <div class="report-meta">
          <span><b>Period</b>${esc(periodName(a.days))}</span>
          <span><b>Generated</b>${esc(new Date().toLocaleString('en-GB',
            { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</span>
        </div>
      </div>

      <div class="stat-row">
        ${statCard({ label: 'Net revenue', display: moneyCompact(s.revenue.value), full: money(s.revenue.value),
          change: s.revenue.changePercent, hint: vs })}
        ${statCard({ label: 'Tickets sold', display: int(s.tickets.value),
          change: s.tickets.changePercent, hint: vs })}
        ${statCard({ label: 'Confirmed bookings', display: int(s.bookings.value),
          change: s.bookings.changePercent, hint: vs })}
        ${statCard({ label: 'Average booking value', display: moneyCompact(s.averageBookingValue.value),
          full: money(s.averageBookingValue.value), change: s.averageBookingValue.changePercent, hint: vs })}
      </div>

      <div class="stat-row">
        ${statCard({ label: 'Seat occupancy', display: pct(s.occupancy.value),
          change: s.occupancy.changePercent, hint: `${int(s.seatsSold)} of ${int(s.seatsOnSale)} seats` })}
        ${statCard({ label: 'Attendance rate', display: pct(s.attendance.value),
          change: s.attendance.changePercent, hint: vs })}
        ${statCard({ label: 'New customers', display: int(s.newCustomers.value),
          change: s.newCustomers.changePercent, hint: vs })}
        ${statCard({ label: 'No-shows', display: int(a.noShows), change: null, compared: false,
          hint: 'paid, never scanned in' })}
      </div>

      <section class="card analytics-panel">
        <div class="panel-head">
          <h2>Booking funnel</h2>
          <p class="muted">From a seat being held to a ticket being scanned at the door.</p>
        </div>
        <div class="funnel">
          ${step(int(a.funnel.seatHolds), 'Seat holds', 'created')}
          ${step(int(a.funnel.paidBookings), 'Paid', share(a.funnel.paidBookings) + '% of holds')}
          ${step(int(a.funnel.checkedIn), 'Scanned in', share(a.funnel.checkedIn) + '% of holds')}
          ${step(int(a.funnel.cancelled), 'Cancelled', share(a.funnel.cancelled) + '% of holds')}
          ${step(pct(a.funnel.conversionPercent), 'Hold → paid conversion', 'the rate that matters')}
        </div>
      </section>

      <section class="card analytics-panel">
        <div class="panel-head">
          <h2>Net revenue by day</h2>
          <p class="muted">Seat money taken each day; booking and convenience fees are excluded.</p>
        </div>
        ${day.length ? Charts.line(day, { color: '#f84464', height: 250, ariaLabel: 'Net revenue per day' })
          : '<p class="muted">No payments were taken in this period.</p>'}
      </section>

      <div class="analytics-split">
        <section class="card analytics-panel">
          <div class="panel-head">
            <h2>Revenue by film</h2>
            <p class="muted">Net seat money and bookings per title.</p>
          </div>
          ${a.revenueByMovie.length
            ? `<div class="table-scroll"><table class="analytics-table">
                 <thead><tr><th class="pos">#</th><th>Film</th>
                   <th class="right">Bookings</th><th class="right">Share</th>
                   <th class="right">Net revenue</th></tr></thead>
                 <tbody>${a.revenueByMovie.map((m, i, arr) => `<tr>
                     <td class="pos"><span class="rank">${i + 1}</span></td>
                     <td class="name" title="${esc(m.label)}">${esc(m.label)}</td>
                     <td class="right">${int(m.count)}</td>
                     <td class="right share-cell">${shareCell(arr, m)}</td>
                     <td class="right strong">${moneyTable(m.value)}</td></tr>`).join('')}</tbody>${tableFoot(a.revenueByMovie)}
               </table></div>`
            : '<p class="muted">No sales in this period.</p>'}
        </section>

        <section class="card analytics-panel">
          <div class="panel-head">
            <h2>Revenue by screen</h2>
            <p class="muted">Which auditorium is earning its seats.</p>
          </div>
          ${a.revenueByScreen.length
            ? `<div class="table-scroll"><table class="analytics-table">
                 <thead><tr><th class="pos">#</th><th>Screen</th>
                   <th class="right">Bookings</th><th class="right">Share</th>
                   <th class="right">Net revenue</th></tr></thead>
                 <tbody>${a.revenueByScreen.map((m, i, arr) => `<tr>
                     <td class="pos"><span class="rank">${i + 1}</span></td>
                     <td class="name" title="${esc(m.label)}">${esc(m.label)}</td>
                     <td class="right">${int(m.count)}</td>
                     <td class="right share-cell">${shareCell(arr, m)}</td>
                     <td class="right strong">${moneyTable(m.value)}</td></tr>`).join('')}</tbody>${tableFoot(a.revenueByScreen)}
               </table></div>`
            : '<p class="muted">No sales in this period.</p>'}
        </section>
      </div>

      <div class="analytics-split">
        <section class="card analytics-panel">
          <div class="panel-head">
            <h2>Seats sold by showtime</h2>
            <p class="muted">Which start times fill up, across every screen.</p>
          </div>
          ${hour.length
            ? `<div class="hbars">${Charts.hbars(
                hour.map(h => ({ label: h.label, value: h.value,
                  sub: `${Math.round(h.value / hour.reduce((t, x) => t + x.value, 0) * 100)}% of seats sold` })),
                { format: v => int(v) + ' seats', colors: ['#8b7cf6'] })}</div>`
            : '<p class="muted">Nothing has been booked yet.</p>'}
        </section>

        <section class="card analytics-panel">
          <div class="panel-head">
            <h2>Payment methods</h2>
            <p class="muted">Share of payments by channel, gross amount taken (fees included).</p>
          </div>
          ${methods.length ? Charts.donut(methods, { ariaLabel: 'Payment method split', centreLabel: 'payments' })
            : '<p class="muted">No payments were taken in this period.</p>'}
        </section>
      </div>

      ${notes.length ? `<section class="card analytics-panel">
        <div class="panel-head">
          <h2>What this period shows</h2>
          <p class="muted">Readings of the figures above, for the same reporting period.</p>
        </div>
        <ul class="insight-list">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      </section>` : ''}

      <p class="muted analytics-footnote">
        Figures are counted from the live tables on every load, so they are correct straight after a
        booking, a refund or a scan. Money is counted on the day it was taken, and payments on cancelled
        bookings are excluded, matching the sales report. The two tables show whole rupees; the cards
        and the tooltips carry the exact amount.
      </p>`;

    const plural = (n, one, many) => `${int(n)} ${Number(n) === 1 ? one : many}`;
    const stamp = $('analyticsStamp');
    if (stamp && isCurrent()) {
      stamp.textContent = `${plural(s.bookings.value, 'confirmed booking', 'confirmed bookings')} · `
        + `${plural(s.refunds, 'refund', 'refunds')} in this period`;
    }
  }
}

/* ---------- paged CRUD table (bookings, customers) ----------
   Same table as renderCrud, but it asks the server for one page at a time, so a table with thousands of
   rows opens immediately and the pager shows where you are. */
async function renderPagedCrud(body, s) {
  const size = 20;
  let page = 0;
  body.innerHTML = `
    <div class="toolbar">
      <div class="row">
        <span class="muted" id="rowCount">Loading…</span>
      </div>
      ${s.canCreate ? `<button class="btn btn-primary" id="newBtn">+ New ${esc(s.singular)}</button>` : ''}
    </div>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Table, scrolls sideways"><table class="table">
      <thead><tr>${s.columns.map(c => `<th>${esc(c.l)}</th>`).join('')}<th></th></tr></thead>
      <tbody id="tbody"></tbody>
    </table></div>
    <div class="pager" id="pager"></div>`;
  if (s.canCreate) $('newBtn').addEventListener('click', () => openForm(s, null));

  async function load() {
    const data = await API.get(`${s.pagedEndpoint}?page=${page}&size=${size}`);
    state.rows = data.content;
    drawRows(s, data.content);
    $('rowCount').textContent =
      `${data.totalElements.toLocaleString()} record(s) · page ${page + 1} of ${Math.max(1, data.totalPages)}`;
    $('pager').innerHTML = pagerHtml(page, data.totalPages);
    $('pager').querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => {
      page = Number(b.dataset.page);
      load().catch(err => toast(err.message, 'err'));
    }));
  }

  load().catch(err => {
    body.innerHTML = `<div class="card error-text">${esc(err.message)}</div>`;
  });
}

/** Previous / next with numbered buttons around the current page. */
function pagerHtml(page, totalPages) {
  if (totalPages <= 1) return '';
  const pages = new Set([0, totalPages - 1, page - 1, page, page + 1]);
  const shown = [...pages].filter(p => p >= 0 && p < totalPages).sort((a, b) => a - b);
  return `<button class="btn btn-ghost btn-sm" data-page="${Math.max(0, page - 1)}" ${page === 0 ? 'disabled' : ''}>← Previous</button>
    ${shown.map(p => `<button class="btn ${p === page ? 'btn-primary' : 'btn-ghost'} btn-sm"
        data-page="${p}">${p + 1}</button>`).join('')}
    <button class="btn btn-ghost btn-sm" data-page="${Math.min(totalPages - 1, page + 1)}"
        ${page >= totalPages - 1 ? 'disabled' : ''}>Next →</button>`;
}
