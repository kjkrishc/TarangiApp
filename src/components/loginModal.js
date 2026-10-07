// Component: User Role & Salesman Login Modal
import { State } from '../state.js';
import { Icons } from '../icons.js';

export function openLoginModal() {
  const existing = document.getElementById('modal-login');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-login';

  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">Switch Active User & Role</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">
        Choose user profile to switch interface between Store Admin and Floor Salesmen.
      </p>

      <div style="display:flex; flex-direction:column; gap:10px;">
        ${State.staffUsers.map(u => {
          const isCurrent = State.currentUser.id === u.id;
          const storeName = State.stores.find(s => s.id === u.storeId)?.name || 'All Stores';

          return `
            <div class="artisanal-card interactive-tap select-user-opt ${isCurrent ? 'accent-rose' : ''}" data-id="${u.id}" style="padding:12px; margin-bottom:0;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:38px; height:38px; border-radius:50%; background:${u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-secondary)'}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">
                    ${u.name.charAt(0)}
                  </div>
                  <div>
                    <div style="font-weight:700; font-size:13px; color:var(--text-main);">${u.name}</div>
                    <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
                      ${u.designation} • ${storeName}
                    </div>
                  </div>
                </div>

                <div style="text-align:right;">
                  <span class="status-pill ${u.role === 'admin' ? 'lowstock' : 'instock'}" style="font-size:10px;">
                    ${u.role.toUpperCase()}
                  </span>
                  ${isCurrent ? '<div style="font-size:10px; color:var(--color-primary); font-weight:700; margin-top:3px;">Active</div>' : ''}
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

  modal.querySelectorAll('.select-user-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      State.setCurrentUser(id);
      closeModal();
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Logged in as ${State.currentUser.name} (${State.currentUser.role.toUpperCase()})`, type: 'success' }
      }));
    });
  });
}
