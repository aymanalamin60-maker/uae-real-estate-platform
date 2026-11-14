const translations = {
  en: {
    title: 'Dashboard Overview',
    subtitle: 'UAE market performance and operations',
    newLead: 'New Lead',
    nav: {
      dashboard: 'Dashboard',
      properties: 'Properties',
      tenants: 'Tenants',
      contracts: 'Contracts',
      clients: 'Clients',
      commissions: 'Commissions',
      reports: 'Reports',
    },
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to manage the UAE property portfolio.',
    email: 'Email address',
    password: 'Password',
    signIn: 'Sign in',
    demo: 'Use demo account',
    demoCreds: 'Demo account: admin@uae-realestate.com / Admin123!',
    invalid: 'Invalid username or password.',
    stats: {
      listed: 'Properties Listed',
      occupied: 'Occupied Units',
      revenue: 'Monthly Revenue',
      commissions: 'Pending Commissions',
    },
    recent: 'Recent Properties',
    pipeline: 'Sales Pipeline',
    tableProperties: 'Properties',
    tableClients: 'Clients',
    tableContracts: 'Lease Contracts',
    tableCommissions: 'Commissions',
    status: 'Status',
    owner: 'Owner',
    clientType: 'Type',
    expiry: 'Expiry',
    amount: 'Amount',
    rent: 'Rent',
    city: 'City',
  },
  ar: {
    title: 'نظرة عامة على لوحة التحكم',
    subtitle: 'أداء السوق الإماراتي والعمليات التشغيلية',
    newLead: 'إعلان جديد',
    nav: {
      dashboard: 'لوحة التحكم',
      properties: 'العقارات',
      tenants: 'المستأجرون',
      contracts: 'العقود',
      clients: 'العملاء',
      commissions: 'العمولات',
      reports: 'التقارير',
    },
    loginTitle: 'مرحباً بعودتك',
    loginSubtitle: 'سجّل الدخول لإدارة محفظة العقارات في الإمارات.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    demo: 'استخدام الحساب التجريبي',
    demoCreds: 'الحساب التجريبي: admin@uae-realestate.com / Admin123!',
    invalid: 'بيانات الدخول غير صحيحة.',
    stats: {
      listed: 'العقارات المدرجة',
      occupied: 'الوحدات المشغولة',
      revenue: 'إيرادات الشهر',
      commissions: 'العمولات المعلقة',
    },
    recent: 'العقارات الأخيرة',
    pipeline: 'مسار المبيعات',
    tableProperties: 'العقارات',
    tableClients: 'العملاء',
    tableContracts: 'عقود الإيجار',
    tableCommissions: 'العمولات',
    status: 'الحالة',
    owner: 'المالك',
    clientType: 'النوع',
    expiry: 'تاريخ الانتهاء',
    amount: 'المبلغ',
    rent: 'الإيجار',
    city: 'المدينة',
  },
};

const state = {
  lang: 'en',
  authToken: localStorage.getItem('uaeAuthToken') || '',
  user: JSON.parse(localStorage.getItem('uaeUser') || 'null'),
  activeSection: 'dashboard',
  dashboard: null,
  properties: [],
  clients: [],
  contracts: [],
  commissions: [],
};

const appRoot = document.getElementById('app');

function t(key) {
  const val = key.split('.').reduce((obj, part) => obj && obj[part], translations[state.lang]);
  return val || key;
}

function setLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  render();
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.authToken) {
    headers.Authorization = `Bearer ${state.authToken}`;
  }

  const response = await fetch(path, { ...options, headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  return response.json();
}

async function loadDashboardData() {
  const [dashboardData, propertyData, clientData, contractData, commissionData] = await Promise.all([
    apiFetch('/api/dashboard'),
    apiFetch('/api/properties'),
    apiFetch('/api/clients'),
    apiFetch('/api/contracts'),
    apiFetch('/api/commissions'),
  ]);

  state.dashboard = dashboardData;
  state.properties = propertyData;
  state.clients = clientData;
  state.contracts = contractData;
  state.commissions = commissionData;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const notice = document.getElementById('loginNotice');

  try {
    const data = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    state.authToken = data.token;
    state.user = data.user;
    localStorage.setItem('uaeAuthToken', data.token);
    localStorage.setItem('uaeUser', JSON.stringify(data.user));
    notice.classList.remove('show');
    render();
  } catch (error) {
    notice.textContent = t('invalid');
    notice.classList.add('show');
  }
}

function renderLogin() {
  appRoot.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-hero">
          <div class="brand-badge">U</div>
          <div>
            <strong>UAE Real Estate</strong>
            <small>Property Management</small>
          </div>
        </div>
        <h2>${t('loginTitle')}</h2>
        <p>${t('loginSubtitle')}</p>

        <form id="loginForm">
          <div class="form-group">
            <label for="email">${t('email')}</label>
            <input id="email" type="email" value="admin@uae-realestate.com" required />
          </div>
          <div class="form-group">
            <label for="password">${t('password')}</label>
            <input id="password" type="password" value="Admin123!" required />
          </div>
          <div class="form-actions">
            <button class="primary-btn" type="submit">${t('signIn')}</button>
            <button type="button" class="secondary-btn" id="demoBtn">${t('demo')}</button>
          </div>
          <div class="notice" id="loginNotice"></div>
        </form>

        <p style="margin-top: 18px; font-size: 0.82rem; color: var(--muted);">${t('demoCreds')}</p>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('demoBtn').addEventListener('click', () => {
    document.getElementById('email').value = 'admin@uae-realestate.com';
    document.getElementById('password').value = 'Admin123!';
    handleLogin({ preventDefault: () => {} });
  });
}

function renderDashboard() {
  const stats = state.dashboard?.stats || [];
  const recent = state.dashboard?.recentProperties || [];
  const pipeline = state.dashboard?.salesPipeline || [];

  appRoot.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-badge">U</div>
          <div class="brand-text">
            <strong>UAE Real Estate</strong>
            <small>Platform</small>
          </div>
        </div>

        <nav class="nav">
          ${['dashboard', 'properties', 'tenants', 'contracts', 'clients', 'commissions', 'reports']
            .map((section) => `
              <button class="nav-item ${state.activeSection === section ? 'active' : ''}" data-section="${section}" dir="${state.lang === 'ar' ? 'rtl' : 'ltr'}">
                ${t(`nav.${section}`)}
              </button>
            `)
            .join('')}
        </nav>

        <div class="user-card">
          <strong>${state.user?.name || 'Manager'}</strong>
          <small>${state.user?.role || 'Operations'} · ${state.user?.company || 'UAE Property Group'}</small>
        </div>
      </aside>

      <main class="content">
        <header class="topbar">
          <div class="page-title">
            <h1>${t('title')}</h1>
            <p>${t('subtitle')}</p>
          </div>
          <div class="top-actions">
            <button class="lang-toggle" id="langToggle">${state.lang === 'en' ? 'العربية' : 'English'}</button>
            <button class="primary-btn">${t('newLead')}</button>
          </div>
        </header>

        <section class="grid stats-grid">
          ${stats
            .map(
              (stat) => `
                <div class="card stat-card">
                  <div class="stat-label">${t(`stats.${stat.key}`)}</div>
                  <div class="stat-value">${stat.value}</div>
                  <div class="stat-trend">${stat.trend}</div>
                </div>
              `
            )
            .join('')}
        </section>

        <section class="grid content-grid" style="margin-top: 22px;">
          <div class="card">
            <h3 style="margin-top:0;">${t('recent')}</h3>
            <ul class="list">
              ${recent
                .map(
                  (item) => `
                    <li class="list-item">
                      <div>
                        <strong>${item.name}</strong><br />
                        <small>${item.location}</small>
                      </div>
                      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                        <span class="badge ${item.status.toLowerCase().replace(/\s+/g, '')}">${item.status}</span>
                        <strong>${item.price}</strong>
                      </div>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>

          <div class="card">
            <h3 style="margin-top:0;">${t('pipeline')}</h3>
            <ul class="list">
              ${pipeline
                .map(
                  (item) => `
                    <li class="list-item">
                      <span>${item.label}</span>
                      <strong>${item.value}</strong>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        </section>

        <section class="card" style="margin-top: 20px;">
          <h3 style="margin-top:0;">${t('tableProperties')}</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>${t('tableProperties')}</th>
                  <th>${t('status')}</th>
                  <th>${t('owner')}</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${state.properties
                  .slice(0, 5)
                  .map(
                    (property) => `
                      <tr>
                        <td>${property.title}</td>
                        <td><span class="badge ${property.status.toLowerCase().replace(/\s+/g, '')}">${property.status}</span></td>
                        <td>${property.owner}</td>
                        <td>${property.price}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `;

  document.getElementById('langToggle').addEventListener('click', () => {
    setLanguage(state.lang === 'en' ? 'ar' : 'en');
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      state.activeSection = item.dataset.section;
      render();
    });
  });
}

async function bootstrap() {
  if (!state.authToken || !state.user) {
    renderLogin();
    return;
  }

  try {
    await loadDashboardData();
    renderDashboard();
  } catch (error) {
    console.error(error);
    localStorage.removeItem('uaeAuthToken');
    localStorage.removeItem('uaeUser');
    state.authToken = '';
    state.user = null;
    renderLogin();
  }
}

function render() {
  if (!state.authToken || !state.user) {
    renderLogin();
    return;
  }

  if (!state.dashboard) {
    bootstrap();
    return;
  }

  renderDashboard();
}

window.addEventListener('DOMContentLoaded', () => {
  setLanguage(state.lang);
  bootstrap();
});
