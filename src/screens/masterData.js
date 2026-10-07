// Screen: Admin Master Data & Multi-Store Configuration
import { State } from '../state.js';
import { Icons } from '../icons.js';

let activeMasterTab = 'categories'; // 'categories' | 'fabrics' | 'sizes' | 'stores'

export function renderMasterData(container) {
  if (!State.isAdmin()) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px;">
        <p style="font-family:var(--font-serif); font-size:16px; color:var(--status-outstock);">Restricted Access</p>
        <p style="font-size:12px; color:var(--text-muted); margin-top:6px;">Master Data management requires Admin authorization.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <h1 class="screen-title">Master Data & Store Setup</h1>
        <p class="screen-subtitle">Categories, Fabrics, Sizes & Multi-Store Locations</p>
      </div>
      <div style="font-size:24px;">⚙️</div>
    </div>

    <!-- Master Tabs -->
    <div style="display:flex; gap:6px; margin-bottom:14px; background:var(--surface-cream); padding:4px; border-radius:var(--radius-md); border:1px solid var(--surface-border); overflow-x:auto;">
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'categories' ? 'active' : ''}" data-tab="categories" style="flex:1; justify-content:center;">
        Categories
      </button>
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'fabrics' ? 'active' : ''}" data-tab="fabrics" style="flex:1; justify-content:center;">
        Fabrics
      </button>
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'sizes' ? 'active' : ''}" data-tab="sizes" style="flex:1; justify-content:center;">
        Sizes
      </button>
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'stores' ? 'active' : ''}" data-tab="stores" style="flex:1; justify-content:center;">
        Stores (${State.stores.length})
      </button>
    </div>

    ${activeMasterTab === 'categories' ? `
      <!-- Categories Management -->
      <div class="artisanal-card">
        <div class="section-label">Add Garment Category</div>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input type="text" id="new-cat-input" class="form-control" placeholder="e.g. Flared Anarkali Suits" />
          <button id="btn-save-cat" class="btn-primary" style="height:40px; padding:0 14px; font-size:12px;">
            ${Icons.plus(16)} Add
          </button>
        </div>

        <div class="section-label" style="font-size:12px;">Registered Categories (${State.masterData.categories.length})</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${State.masterData.categories.map((c, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-cream); padding:8px 12px; border-radius:6px; font-size:12px;">
              <span>${idx + 1}. <strong>${c}</strong></span>
              <span class="status-pill instock" style="font-size:9px;">Active</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${activeMasterTab === 'fabrics' ? `
      <!-- Fabrics Management -->
      <div class="artisanal-card">
        <div class="section-label">Add Textile Fabric</div>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input type="text" id="new-fab-input" class="form-control" placeholder="e.g. Modal Silk Jacquard" />
          <button id="btn-save-fab" class="btn-primary" style="height:40px; padding:0 14px; font-size:12px;">
            ${Icons.plus(16)} Add
          </button>
        </div>

        <div class="section-label" style="font-size:12px;">Registered Fabrics (${State.masterData.fabrics.length})</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${State.masterData.fabrics.map((f, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-cream); padding:8px 12px; border-radius:6px; font-size:12px;">
              <span>${idx + 1}. <strong>${f}</strong></span>
              <span class="status-pill instock" style="font-size:9px;">Available</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${activeMasterTab === 'sizes' ? `
      <!-- Sizes Management -->
      <div class="artisanal-card">
        <div class="section-label">Add Garment Size</div>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input type="text" id="new-size-input" class="form-control" placeholder="e.g. 4XL (48)" />
          <button id="btn-save-size" class="btn-primary" style="height:40px; padding:0 14px; font-size:12px;">
            ${Icons.plus(16)} Add
          </button>
        </div>

        <div class="section-label" style="font-size:12px;">Size Range Matrix</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${State.masterData.sizes.map(s => `
            <span class="filter-pill" style="font-weight:600;">
              ${s}
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${activeMasterTab === 'stores' ? `
      <!-- Multi-Store Locations Management -->
      <div class="artisanal-card">
        <div class="section-label">Add Store Location (Brand: Tarangi)</div>
        <form id="form-new-store" style="margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label">Store Name</label>
            <input type="text" id="st-name" class="form-control" placeholder="e.g. Gachibowli High Street" required />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="form-group">
              <label class="form-label">Store Code</label>
              <input type="text" id="st-code" class="form-control" placeholder="GCB" maxlength="4" style="text-transform:uppercase;" required />
            </div>

            <div class="form-group">
              <label class="form-label">Store Phone</label>
              <input type="text" id="st-phone" class="form-control" placeholder="+91 40 2300 1122" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Store Address & GSTIN</label>
            <input type="text" id="st-addr" class="form-control" placeholder="Shop 14, Main Road, Gachibowli, Hyderabad" required />
          </div>

          <button type="submit" class="btn-primary btn-full">
            ${Icons.store(16)} Register Store Outlet
          </button>
        </form>

        <div class="section-label">Active Store Outlets (${State.stores.length})</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${State.stores.map(st => `
            <div style="background:var(--surface-cream); border:1px solid var(--surface-border); border-radius:8px; padding:10px 12px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-weight:700; font-size:13px; color:var(--text-main);">${st.name}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${st.address}</div>
                </div>
                <span class="status-pill instock" style="font-size:10px; font-family:var(--font-mono);">${st.code}</span>
              </div>
              <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono); margin-top:4px;">
                GSTIN: ${st.gstin} • Tel: ${st.phone}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  // Bind Events
  container.querySelectorAll('.m-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeMasterTab = e.currentTarget.dataset.tab;
      renderMasterData(container);
    });
  });

  // Category Add
  container.querySelector('#btn-save-cat')?.addEventListener('click', () => {
    const val = container.querySelector('#new-cat-input')?.value.trim();
    if (val) {
      State.addMasterDataItem('categories', val);
      renderMasterData(container);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Added category '${val}'`, type: 'success' } }));
    }
  });

  // Fabric Add
  container.querySelector('#btn-save-fab')?.addEventListener('click', () => {
    const val = container.querySelector('#new-fab-input')?.value.trim();
    if (val) {
      State.addMasterDataItem('fabrics', val);
      renderMasterData(container);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Added fabric '${val}'`, type: 'success' } }));
    }
  });

  // Size Add
  container.querySelector('#btn-save-size')?.addEventListener('click', () => {
    const val = container.querySelector('#new-size-input')?.value.trim();
    if (val) {
      State.addMasterDataItem('sizes', val);
      renderMasterData(container);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Added size '${val}'`, type: 'success' } }));
    }
  });

  // Store Add
  container.querySelector('#form-new-store')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#st-name').value.trim();
    const code = container.querySelector('#st-code').value.trim().toUpperCase();
    const phone = container.querySelector('#st-phone').value.trim();
    const address = container.querySelector('#st-addr').value.trim();

    State.stores.push({
      id: 'ST-' + (State.stores.length + 1).toString().padStart(2, '0'),
      name,
      code,
      phone,
      address,
      gstin: `36AAACT9108K${State.stores.length + 1}Z${9 - State.stores.length}`
    });
    State.notify();
    renderMasterData(container);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `New Store '${name}' activated!`, type: 'success' } }));
  });
}
