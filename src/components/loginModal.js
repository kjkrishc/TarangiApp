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

      <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">Sign in as a staff member or sign out of this register.</p>

      <form id="form-switch-user">
        <div class="form-group">
          <label class="form-label" for="switch-user-select">Staff member</label>
          <select id="switch-user-select" class="form-control">
            ${State.staffUsers.map(user => `<option value="${user.id}">${user.name} • ${user.designation}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="switch-user-pin">PIN</label>
          <input id="switch-user-pin" class="form-control" type="password" inputmode="numeric" required />
        </div>
        <p id="switch-user-error" role="alert" style="display:none; color:var(--status-outstock); font-size:12px; margin-bottom:10px;"></p>
        <button type="submit" class="btn-primary btn-full">Sign in</button>
        <button type="button" id="btn-logout" class="btn-secondary btn-full" style="margin-top:8px;">Sign out</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelector('#form-switch-user')?.addEventListener('submit', event => {
    event.preventDefault();
    const id = modal.querySelector('#switch-user-select').value;
    const pin = modal.querySelector('#switch-user-pin').value;
    if (!State.login(id, pin)) {
      const error = modal.querySelector('#switch-user-error');
      error.textContent = 'The PIN is incorrect. Please try again.';
      error.style.display = 'block';
      modal.querySelector('#switch-user-pin').value = '';
      return;
    }
    closeModal();
  });

  modal.querySelector('#btn-logout')?.addEventListener('click', () => {
    State.logout();
    closeModal();
  });
}
