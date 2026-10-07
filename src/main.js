// Main Application Shell & Orchestration (Multi-Store & Role-Based Suite)
import './style.css';
import { State } from './state.js';
import { Icons } from './icons.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderInventory } from './screens/inventory.js';
import { renderPos } from './screens/pos.js';
import { renderReports } from './screens/reports.js';
import { renderAttendance } from './screens/attendance.js';
import { renderMasterData } from './screens/masterData.js';
import { renderExpenses } from './screens/expenses.js';
import { openBarcodeScannerModal } from './components/scannerModal.js';
import { openReceiptModal } from './components/receiptModal.js';
import { openLoginModal } from './components/loginModal.js';

let isDeviceFrameMode = true;

function initApp() {
  const appContainer = document.getElementById('app');

  appContainer.innerHTML = `
    <div class="app-viewport-shell ${isDeviceFrameMode ? '' : 'mode-full'}" id="viewport-shell">
      
      <!-- Top Development & Preview Toolbar -->
      <header class="viewport-toolbar">
        <div class="brand-tag">
          <span>TARANGI</span>
          <span class="badge">Kurti Retail Suite</span>
        </div>

        <div class="view-mode-toggle">
          <button id="toggle-view-device" class="view-mode-btn ${isDeviceFrameMode ? 'active' : ''}">
            ${Icons.devicePhone(14)} Mobile Frame
          </button>
          <button id="toggle-view-full" class="view-mode-btn ${!isDeviceFrameMode ? 'active' : ''}">
            Responsive Full
          </button>
        </div>
      </header>

      <!-- Mobile Device Mockup Frame -->
      <main class="device-frame" id="device-frame">
        
        <!-- Hardware Simulated Notch & Status Bar -->
        <div class="mobile-status-bar">
          <span id="mobile-clock">03:45</span>
          <div class="mobile-notch">
            <div class="notch-speaker"></div>
            <div class="notch-camera"></div>
          </div>
          <div style="display:flex; align-items:center; gap:4px; font-size:10px;">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        <!-- Sticky App Header with Multi-Store & Role Selectors -->
        <header class="app-header">
          <div class="header-top">
            <div class="brand-identity">
              <span class="brand-title">TARANGI</span>
              <span class="brand-subtitle">• తారంగి</span>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <button id="header-scan-trigger" class="icon-btn-ghost" title="Live Camera Barcode Scanner" style="width:32px; height:32px;">
                ${Icons.camera(16)}
              </button>
            </div>
          </div>

          <!-- Store Selector & User Role Badges Strip -->
          <div class="header-meta-strip">
            <!-- Multi-Store Dropdown / Switcher -->
            <div class="store-selector-badge" id="btn-switch-store" title="Switch Store Location">
              <span style="color:var(--color-primary);">${Icons.store(14)}</span>
              <span id="header-store-label">Jubilee Hills</span>
              <span style="font-size:9px; color:var(--text-muted);">▼</span>
            </div>

            <!-- Active User & Role Switcher Badge -->
            <div class="user-role-badge" id="btn-switch-user" title="Switch User Role">
              <span style="color:var(--color-primary);">${Icons.user(14)}</span>
              <span id="header-user-label">Admin</span>
              <span style="font-size:9px; color:var(--color-primary);">⚙️</span>
            </div>
          </div>
        </header>

        <!-- Dynamic Screen Content Scroll Container -->
        <section class="screen-scroll-container" id="screen-container">
          <!-- Active Screen Content Injected Here -->
        </section>

        <!-- Role-Differentiated Bottom App Bar Navigation -->
        <nav class="bottom-nav-bar" id="bottom-nav">
          <!-- Populated dynamically based on Admin vs Salesman -->
        </nav>

      </main>

      <!-- Floating Toast Notifications Layer -->
      <aside class="toast-container" id="toast-layer" aria-live="polite"></aside>
    </div>
  `;

  // Real-time Mobile Status Clock
  const updateClock = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const clockEl = document.getElementById('mobile-clock');
    if (clockEl) clockEl.textContent = `${hours}:${mins}`;
  };
  updateClock();
  setInterval(updateClock, 30000);

  // Setup View Mode Toggles
  const shell = document.getElementById('viewport-shell');
  const btnDevice = document.getElementById('toggle-view-device');
  const btnFull = document.getElementById('toggle-view-full');

  btnDevice.addEventListener('click', () => {
    isDeviceFrameMode = true;
    shell.classList.remove('mode-full');
    btnDevice.classList.add('active');
    btnFull.classList.remove('active');
  });

  btnFull.addEventListener('click', () => {
    isDeviceFrameMode = false;
    shell.classList.add('mode-full');
    btnFull.classList.add('active');
    btnDevice.classList.remove('active');
  });

  // Header Actions
  document.getElementById('header-scan-trigger').addEventListener('click', () => {
    openBarcodeScannerModal();
  });

  document.getElementById('btn-switch-store').addEventListener('click', () => {
    openStoreSelectModal();
  });

  document.getElementById('btn-switch-user').addEventListener('click', () => {
    openLoginModal();
  });

  // Global Event Listeners
  window.addEventListener('open-barcode-scanner', () => {
    openBarcodeScannerModal();
  });

  window.addEventListener('show-receipt-modal', (e) => {
    if (e.detail?.bill) {
      openReceiptModal(e.detail.bill);
    }
  });

  window.addEventListener('show-toast', (e) => {
    showToast(e.detail?.message || 'Notification', e.detail?.type || 'info');
  });

  // Subscribe to state updates
  State.subscribe(() => {
    updateHeaderLabels();
    renderNavItems();
    renderCurrentScreen();
  });

  // Initial render
  updateHeaderLabels();
  renderNavItems();
  renderCurrentScreen();
}

function updateHeaderLabels() {
  const storeLabel = document.getElementById('header-store-label');
  const userLabel = document.getElementById('header-user-label');
  const curStore = State.getCurrentStore();

  if (storeLabel) {
    storeLabel.textContent = curStore ? curStore.code : 'JBL';
  }

  if (userLabel) {
    const roleUpper = State.currentUser?.role === 'admin' ? 'Admin' : 'Sales';
    userLabel.textContent = `${State.currentUser?.name.split(' ')[0]} (${roleUpper})`;
  }
}

function renderNavItems() {
  const navContainer = document.getElementById('bottom-nav');
  if (!navContainer) return;

  const isAdmin = State.isAdmin();
  const cartTotal = State.cart.reduce((s, i) => s + i.quantity, 0);

  if (isAdmin) {
    // Admin Navigation: Dashboard, Inventory, POS, Reports, Master Setup
    navContainer.innerHTML = `
      <button class="nav-tab-item ${State.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
        ${Icons.dashboard(20)}
        <span class="nav-tab-label">Dashboard</span>
      </button>

      <button class="nav-tab-item ${State.activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory">
        ${Icons.inventory(20)}
        <span class="nav-tab-label">Inventory</span>
      </button>

      <!-- Center POS Quick Billing -->
      <div class="nav-tab-item" style="flex:0.8;">
        <div class="nav-fab-center" id="nav-center-pos" title="Open POS Billing">
          ${Icons.pos(22)}
        </div>
        <span class="nav-tab-label" style="margin-top:2px; font-weight:700; color:var(--color-primary);">POS</span>
        <div id="cart-badge-counter" class="cart-badge-dot" style="display:${cartTotal > 0 ? 'flex' : 'none'};">
          ${cartTotal}
        </div>
      </div>

      <button class="nav-tab-item ${State.activeTab === 'reports' ? 'active' : ''}" data-tab="reports">
        ${Icons.reports(20)}
        <span class="nav-tab-label">Reports</span>
      </button>

      <button class="nav-tab-item ${State.activeTab === 'master' ? 'active' : ''}" data-tab="master">
        ${Icons.masterData(20)}
        <span class="nav-tab-label">Master</span>
      </button>
    `;
  } else {
    // Salesman Navigation: POS (Primary), Stock Lookup, Attendance, Expenses
    navContainer.innerHTML = `
      <button class="nav-tab-item ${State.activeTab === 'pos' ? 'active' : ''}" data-tab="pos">
        ${Icons.pos(20)}
        <span class="nav-tab-label">Billing</span>
        <div id="cart-badge-counter" class="cart-badge-dot" style="display:${cartTotal > 0 ? 'flex' : 'none'}; top:6px; right:12px;">
          ${cartTotal}
        </div>
      </button>

      <button class="nav-tab-item ${State.activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory">
        ${Icons.inventory(20)}
        <span class="nav-tab-label">Stock</span>
      </button>

      <button class="nav-tab-item ${State.activeTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
        ${Icons.attendance(20)}
        <span class="nav-tab-label">Attendance</span>
      </button>

      <button class="nav-tab-item ${State.activeTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
        ${Icons.expenses(20)}
        <span class="nav-tab-label">Floor Cash</span>
      </button>
    `;
  }

  // Bind tab item clicks
  navContainer.querySelectorAll('.nav-tab-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.dataset.tab;
      State.setActiveTab(targetTab);
    });
  });

  const centerPos = document.getElementById('nav-center-pos');
  if (centerPos) {
    centerPos.addEventListener('click', () => State.setActiveTab('pos'));
  }
}

function renderCurrentScreen() {
  const container = document.getElementById('screen-container');
  if (!container) return;

  switch (State.activeTab) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'inventory':
      renderInventory(container);
      break;
    case 'pos':
      renderPos(container);
      break;
    case 'reports':
      renderReports(container);
      break;
    case 'attendance':
      renderAttendance(container);
      break;
    case 'master':
      renderMasterData(container);
      break;
    case 'expenses':
      renderExpenses(container);
      break;
    default:
      if (State.isAdmin()) {
        renderDashboard(container);
      } else {
        renderPos(container);
      }
  }
}

function openStoreSelectModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Select Active Store Location</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
        Brand: <strong>TARANGI</strong> • Switch between independent boutique outlets.
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        ${State.stores.map(st => {
          const isSelected = State.currentStoreId === st.id;
          return `
            <div class="artisanal-card interactive-tap select-store-opt ${isSelected ? 'accent-rose' : ''}" data-id="${st.id}" style="padding:12px; margin-bottom:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:13px; color:var(--text-main);">${st.name}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${st.address}</div>
                </div>
                <div style="text-align:right;">
                  <span class="status-pill instock" style="font-size:10px; font-family:var(--font-mono);">${st.code}</span>
                  ${isSelected ? '<div style="font-size:10px; color:var(--color-primary); font-weight:700; margin-top:3px;">Selected</div>' : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelectorAll('.select-store-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      State.setCurrentStore(id);
      closeModal();
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Active store changed to ${State.getCurrentStore().name}!`, type: 'success' }
      }));
    });
  });
}

function showToast(message, type = 'info') {
  const layer = document.getElementById('toast-layer');
  if (!layer) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  let iconHtml = Icons.check(16);
  if (type === 'alert') iconHtml = Icons.alert(16);

  toast.innerHTML = `
    <span style="color:${type === 'alert' ? '#f87171' : '#34d399'};">${iconHtml}</span>
    <span>${message}</span>
  `;

  layer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

// Start Application
window.addEventListener('DOMContentLoaded', initApp);
