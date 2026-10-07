// Screen: Admin Master Data & Multi-Store Configuration
import { State } from '../state.js';
import { Icons } from '../icons.js';

let activeMasterTab = 'categories';

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
        <p class="screen-subtitle">Product categories, discount limits, sizes & stores</p>
      </div>
      <div style="font-size:24px;">⚙️</div>
    </div>

    <!-- Master Tabs -->
    <div style="display:flex; gap:6px; margin-bottom:14px; background:var(--surface-cream); padding:4px; border-radius:var(--radius-md); border:1px solid var(--surface-border); overflow-x:auto;">
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'categories' ? 'active' : ''}" data-tab="categories" style="flex:1; justify-content:center;">
        Categories
      </button>
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'sizes' ? 'active' : ''}" data-tab="sizes" style="flex:1; justify-content:center;">
        Sizes
      </button>
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'stores' ? 'active' : ''}" data-tab="stores" style="flex:1; justify-content:center;">
        Stores (${State.stores.length})
      </button>
      <button class="view-mode-btn m-tab-btn ${activeMasterTab === 'users' ? 'active' : ''}" data-tab="users" style="flex:1; justify-content:center;">
        Staff (${State.staffUsers.length})
      </button>
    </div>

    ${activeMasterTab === 'categories' ? `
      <!-- Categories Management -->
      <div class="artisanal-card">
        <div class="section-label">Add Product Category</div>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input type="text" id="new-cat-input" class="form-control" placeholder="e.g. Innerwear (Bras/Panties/Strips)" />
          <button id="btn-save-cat" class="btn-primary" style="height:40px; padding:0 14px; font-size:12px;">
            ${Icons.plus(16)} Add
          </button>
        </div>

        <div class="section-label" style="font-size:12px;">Registered Categories (${State.masterData.categories.length})</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${State.masterData.categories.map((c, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; background:var(--surface-cream); padding:8px 12px; border-radius:6px; font-size:12px;">
              <span>${idx + 1}. <strong>${c}</strong></span>
              <div style="display:flex; align-items:center; gap:6px;">
                <button class="icon-btn-ghost btn-edit-category" data-category="${c}" title="Rename category" aria-label="Rename category">${Icons.edit(14)}</button>
                <label style="display:flex; align-items:center; gap:5px; white-space:nowrap;">
                  Max discount
                  <input class="category-discount-limit form-control" type="number" min="0" max="100" data-category="${c}"
                    value="${State.masterData.maxDiscountRules[c] ?? 15}" style="width:64px; height:30px; padding:3px 5px;" /> %
                </label>
                <button class="icon-btn-ghost btn-delete-category" data-category="${c}" title="Delete category" style="color:var(--status-outstock);">${Icons.trash(14)}</button>
              </div>
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
            <span class="filter-pill" style="font-weight:600; display:flex; align-items:center; gap:4px;">
              ${s}
              <button class="icon-btn-ghost btn-edit-size" data-size="${s}" title="Rename size" aria-label="Rename size">${Icons.edit(14)}</button>
              <button class="icon-btn-ghost btn-delete-size" data-size="${s}" title="Delete size" style="width:20px; height:20px; color:var(--status-outstock);">${Icons.x(12)}</button>
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
                <div style="display:flex; gap:4px; align-items:center;">
                  <button class="icon-btn-ghost btn-edit-store" data-id="${st.id}" title="Edit store" aria-label="Edit store">${Icons.edit(14)}</button>
                  <button class="icon-btn-ghost btn-delete-store" data-id="${st.id}" title="Delete store" style="color:var(--status-outstock);">${Icons.trash(14)}</button>
                  <span class="status-pill instock" style="font-size:10px; font-family:var(--font-mono);">${st.code}</span>
                </div>
              </div>
              <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono); margin-top:4px;">
                GSTIN: ${st.gstin} • Tel: ${st.phone}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${activeMasterTab === 'users' ? `
      <div class="artisanal-card">
        <div class="section-label">Add Staff User</div>
        <form id="form-new-staff">
          <div class="form-group">
            <label class="form-label" for="staff-name">Full name</label>
            <input id="staff-name" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="staff-designation">Designation</label>
            <input id="staff-designation" class="form-control" placeholder="Sales associate" required />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div class="form-group">
              <label class="form-label" for="staff-role">Role</label>
              <select id="staff-role" class="form-control">
                <option value="salesman">Sales staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="staff-store">Store</label>
              <select id="staff-store" class="form-control">${State.stores.map(store => `<option value="${store.id}">${store.name}</option>`).join('')}</select>
            </div>
          </div>
          <button type="submit" class="btn-primary btn-full">${Icons.plus(16)} Add user (PIN set at first sign-in)</button>
        </form>
      </div>
      <div class="artisanal-card">
        <div class="section-label">Staff Accounts</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${State.staffUsers.map(user => `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px; background:var(--surface-cream); border-radius:8px;">
              <div>
                <strong>${user.name}</strong>
                <div style="font-size:10px; color:var(--text-muted);">${user.designation} • ${State.stores.find(store => store.id === user.storeId)?.name || 'Unassigned'} • ${user.role}</div>
                <small style="color:${user.pin ? 'var(--status-instock)' : 'var(--status-lowstock)'};">${user.pin ? 'PIN set' : 'PIN setup required at first sign-in'}</small>
              </div>
              <button class="icon-btn-ghost btn-delete-user" data-id="${user.id}" title="Delete user" style="color:var(--status-outstock);">${Icons.trash(14)}</button>
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
      runMasterMutation(container, () => State.addMasterDataItem('categories', val), `Added category '${val}'.`);
    }
  });
  container.querySelectorAll('.btn-delete-category').forEach(button => {
    button.addEventListener('click', () => runMasterMutation(container, () => State.deleteMasterDataItem('categories', button.dataset.category), `Deleted category '${button.dataset.category}'.`));
  });
  container.querySelectorAll('.btn-edit-category').forEach(button => {
    button.addEventListener('click', () => {
      const name = window.prompt('Category name', button.dataset.category);
      if (name !== null) runMasterMutation(container, () => State.renameMasterDataItem('categories', button.dataset.category, name), 'Category updated.');
    });
  });

  container.querySelectorAll('.category-discount-limit').forEach(input => {
    input.addEventListener('change', () => {
      const value = Number(input.value);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Discount limits must be between 0 and 100%.', type: 'alert' } }));
        renderMasterData(container);
        return;
      }
      State.setCategoryDiscountLimit(input.dataset.category, value);
    });
  });

  // Size Add
  container.querySelector('#btn-save-size')?.addEventListener('click', () => {
    const val = container.querySelector('#new-size-input')?.value.trim();
    if (val) {
      runMasterMutation(container, () => State.addMasterDataItem('sizes', val), `Added size '${val}'.`);
    }
  });
  container.querySelectorAll('.btn-delete-size').forEach(button => {
    button.addEventListener('click', () => runMasterMutation(container, () => State.deleteMasterDataItem('sizes', button.dataset.size), `Deleted size '${button.dataset.size}'.`));
  });
  container.querySelectorAll('.btn-edit-size').forEach(button => {
    button.addEventListener('click', () => {
      const size = window.prompt('Size label', button.dataset.size);
      if (size !== null) runMasterMutation(container, () => State.renameMasterDataItem('sizes', button.dataset.size, size), 'Size updated.');
    });
  });

  // Store Add
  container.querySelector('#form-new-store')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#st-name').value.trim();
    const code = container.querySelector('#st-code').value.trim().toUpperCase();
    const phone = container.querySelector('#st-phone').value.trim();
    const address = container.querySelector('#st-addr').value.trim();

    const gstin = `36AAACT9108K${State.stores.length + 1}Z${9 - State.stores.length}`;
    try {
      State.addStore({ name, code, phone, address, gstin });
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
      return;
    }
    renderMasterData(container);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `New Store '${name}' activated!`, type: 'success' } }));
  });
  container.querySelectorAll('.btn-edit-store').forEach(button => {
    button.addEventListener('click', () => openStoreEditor(container, button.dataset.id));
  });
  container.querySelectorAll('.btn-delete-store').forEach(button => {
    button.addEventListener('click', () => runMasterMutation(container, () => State.deleteStore(button.dataset.id), 'Store deleted.'));
  });

  container.querySelector('#form-new-staff')?.addEventListener('submit', event => {
    event.preventDefault();
    const user = State.addStaffUser({
      name: container.querySelector('#staff-name').value.trim(),
      designation: container.querySelector('#staff-designation').value.trim(),
      role: container.querySelector('#staff-role').value,
      storeId: container.querySelector('#staff-store').value
    });
    renderMasterData(container);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${user.name} added. They will set their PIN at first sign-in.`, type: 'success' } }));
  });
  container.querySelectorAll('.btn-delete-user').forEach(button => {
    button.addEventListener('click', () => runMasterMutation(container, () => State.deleteStaffUser(button.dataset.id), 'Staff user deleted.'));
  });
}

function runMasterMutation(container, mutation, successMessage) {
  try {
    mutation();
    renderMasterData(container);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: successMessage, type: 'success' } }));
  } catch (error) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
  }
}

function openStoreEditor(container, storeId) {
  const store = State.stores.find(item => item.id === storeId);
  if (!store) return;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Edit Store</h3>
        <button type="button" class="icon-btn-ghost modal-close-btn" aria-label="Close">${Icons.x(16)}</button>
      </div>
      <form id="form-edit-store">
        <div class="form-group">
          <label class="form-label" for="edit-store-name">Store name</label>
          <input id="edit-store-name" class="form-control" value="${escapeHtml(store.name)}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-store-code">Store code</label>
          <input id="edit-store-code" class="form-control" value="${escapeHtml(store.code)}" maxlength="4" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-store-phone">Phone</label>
          <input id="edit-store-phone" class="form-control" value="${escapeHtml(store.phone)}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-store-address">Address</label>
          <input id="edit-store-address" class="form-control" value="${escapeHtml(store.address)}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-store-gstin">GSTIN</label>
          <input id="edit-store-gstin" class="form-control" value="${escapeHtml(store.gstin)}" required />
        </div>
        <button type="submit" class="btn-primary btn-full">Save Store Changes</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close-btn')?.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  modal.querySelector('#form-edit-store')?.addEventListener('submit', event => {
    event.preventDefault();
    try {
      State.updateStore(storeId, {
        name: modal.querySelector('#edit-store-name').value,
        code: modal.querySelector('#edit-store-code').value,
        phone: modal.querySelector('#edit-store-phone').value,
        address: modal.querySelector('#edit-store-address').value,
        gstin: modal.querySelector('#edit-store-gstin').value
      });
      close();
      renderMasterData(container);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Store updated.', type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
    }
  });
}
