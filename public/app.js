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
    propertyFormTitle: 'Property Management',
    propertyFormSubtitle: 'Add or update property listings for sales and leasing.',
    propertyTitle: 'Property title',
    propertyType: 'Type',
    propertyLocation: 'Location',
    propertyBedrooms: 'Bedrooms',
    propertyBathrooms: 'Bathrooms',
    propertyPrice: 'Price',
    propertyStatus: 'Status',
    propertyOwner: 'Owner',
    saveProperty: 'Save property',
    clearForm: 'Clear',
    edit: 'Edit',
    delete: 'Delete',
    noProperties: 'No properties found.',
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
    propertyFormTitle: 'إدارة العقارات',
    propertyFormSubtitle: 'أضف أو حدّث عقارات البيع والتأجير.',
    propertyTitle: 'عنوان العقار',
    propertyType: 'النوع',
    propertyLocation: 'الموقع',
    propertyBedrooms: 'غرف النوم',
    propertyBathrooms: 'الحمامات',
    propertyPrice: 'السعر',
    propertyStatus: 'الحالة',
    propertyOwner: 'المالك',
    saveProperty: 'حفظ العقار',
    clearForm: 'مسح',
    edit: 'تعديل',
    delete: 'حذف',
    noProperties: 'لا توجد عقارات',
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
  editingPropertyId: null,
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

  if (response.status === 204) return null;
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
    await loadDashboardData();
    state.activeSection = 'dashboard';
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

  return `
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
            ${(state.properties || [])
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
  `;
}

function renderPropertySection() {
  const editing = state.editingPropertyId !== null;
  const selected = state.properties.find((item) => item.id === state.editingPropertyId) || null;

  return `
    <div class="card form-card">
      <div class="section-heading">
        <div>
          <h3>${t('propertyFormTitle')}</h3>
          <p>${t('propertyFormSubtitle')}</p>
        </div>
      </div>

      <form id="propertyForm">
        <div class="form-grid">
          <div class="form-group compact">
            <label>${t('propertyTitle')}</label>
            <input name="title" value="${selected ? selected.title : ''}" required />
          </div>
          <div class="form-group compact">
            <label>${t('propertyType')}</label>
            <input name="type" value="${selected ? selected.type : ''}" required />
          </div>
          <div class="form-group compact">
            <label>${t('propertyLocation')}</label>
            <input name="location" value="${selected ? selected.location : ''}" required />
          </div>
          <div class="form-group compact">
            <label>${t('propertyBedrooms')}</label>
            <input name="bedrooms" type="number" min="0" value="${selected ? selected.bedrooms : 0}" />
          </div>
          <div class="form-group compact">
            <label>${t('propertyBathrooms')}</label>
            <input name="bathrooms" type="number" min="0" value="${selected ? selected.bathrooms : 0}" />
          </div>
          <div class="form-group compact">
            <label>${t('propertyPrice')}</label>
            <input name="price" value="${selected ? selected.price : ''}" required />
          </div>
          <div class="form-group compact">
            <label>${t('propertyStatus')}</label>
            <select name="status">
              ${['Available', 'Rented', 'Booked', 'Under Renovation']
                .map((option) => `<option value="${option}" ${selected && selected.status === option ? 'selected' : ''}>${option}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-group compact">
            <label>${t('propertyOwner')}</label>
            <input name="owner" value="${selected ? selected.owner : 'Private Owner'}" />
          </div>
        </div>

        <div class="form-actions right-actions">
          <button type="button" class="secondary-btn" id="clearPropertyForm">${t('clearForm')}</button>
          <button type="submit" class="primary-btn">${t('saveProperty')}</button>
        </div>
      </form>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h3 style="margin-top:0;">${t('tableProperties')}</h3>
      <div class="property-grid">
        ${state.properties.length ? state.properties
          .map(
            (property) => `
              <article class="property-card">
                <div class="property-header">
                  <div>
                    <h4>${property.title}</h4>
                    <small>${property.location}</small>
                  </div>
                  <span class="badge ${property.status.toLowerCase().replace(/\s+/g, '')}">${property.status}</span>
                </div>
                <div class="property-meta">
                  <span>${property.type}</span>
                  <span>${property.bedrooms} bd</span>
                  <span>${property.bathrooms} ba</span>
                </div>
                <div class="property-footer">
                  <strong>${property.price}</strong>
                  <div class="card-actions">
                    <button class="secondary-btn small" data-action="edit" data-id="${property.id}">${t('edit')}</button>
                    <button class="secondary-btn small danger" data-action="delete" data-id="${property.id}">${t('delete')}</button>
                  </div>
                </div>
              </article>
            `
          )
          .join('') : `<div class="empty-state">${t('noProperties')}</div>`}
      </div>
    </div>
  `;
}

async function handlePropertySubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    if (state.editingPropertyId !== null) {
      await apiFetch(`/api/properties/${state.editingPropertyId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    state.editingPropertyId = null;
    await loadDashboardData();
    render();
  } catch (error) {
    console.error(error);
  }
}

async function handlePropertyAction(target) {
  const { action, id } = target.dataset;
  const propertyId = Number(id);

  if (action === 'delete') {
    await apiFetch(`/api/properties/${propertyId}`, { method: 'DELETE' });
    await loadDashboardData();
    state.editingPropertyId = null;
    render();
    return;
  }

  if (action === 'edit') {
    state.editingPropertyId = propertyId;
    render();
  }
}

function renderShell() {
  const content = state.activeSection === 'dashboard' ? renderDashboard() : state.activeSection === 'properties' ? renderPropertySection() : `<div class="card"><h3>Coming soon</h3></div>`;

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
            <h1>${state.activeSection === 'dashboard' ? t('title') : t('propertyFormTitle')}</h1>
            <p>${state.activeSection === 'dashboard' ? t('subtitle') : t('propertyFormSubtitle')}</p>
          </div>
          <div class="top-actions">
            <button class="lang-toggle" id="langToggle">${state.lang === 'en' ? 'العربية' : 'English'}</button>
            <button class="primary-btn">${t('newLead')}</button>
          </div>
        </header>

        ${content}
      </main>
    </div>
  `;

  document.getElementById('langToggle').addEventListener('click', () => {
    setLanguage(state.lang === 'en' ? 'ar' : 'en');
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      state.activeSection = item.dataset.section;
      state.editingPropertyId = null;
      render();
    });
  });

  if (state.activeSection === 'properties') {
    const propertyForm = document.getElementById('propertyForm');
    if (propertyForm) {
      propertyForm.addEventListener('submit', handlePropertySubmit);
    }

    const clearBtn = document.getElementById('clearPropertyForm');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.editingPropertyId = null;
        render();
      });
    }

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', (event) => handlePropertyAction(event.currentTarget));
    });
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

  renderShell();
}

async function bootstrap() {
  if (!state.authToken || !state.user) {
    renderLogin();
    return;
  }

  try {
    await loadDashboardData();
    render();
  } catch (error) {
    console.error(error);
    localStorage.removeItem('uaeAuthToken');
    localStorage.removeItem('uaeUser');
    state.authToken = '';
    state.user = null;
    renderLogin();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setLanguage(state.lang);
  bootstrap();
});
