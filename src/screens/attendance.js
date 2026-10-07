// Screen: Salesman Attendance Tracking & Staff Roster
import { State } from '../state.js';
import { Icons } from '../icons.js';

export function renderAttendance(container) {
  const isAdmin = State.isAdmin();
  const currentUser = State.currentUser;
  const currentStore = State.getCurrentStore();
  const today = new Date().toISOString().split('T')[0];

  // Current user's attendance today
  const myRecord = State.attendance.find(a => a.userId === currentUser.id && a.date === today);

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <span class="status-pill instock" style="font-size:10px;">
            ${currentStore.name}
          </span>
          <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
            ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
          </span>
        </div>
        <h1 class="screen-title">${isAdmin ? 'Staff Attendance Roster' : 'My Shift Attendance'}</h1>
        <p class="screen-subtitle">Floor Check-in, Working Hours & Roster Management</p>
      </div>
      <div style="font-size:24px;">⏱️</div>
    </div>

    <!-- Personal Check-in/out Card for Salesman (or Admin) -->
    <div class="artisanal-card accent-rose" style="padding:16px; margin-bottom:14px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div>
          <div style="font-weight:700; font-size:14px; color:var(--text-main);">${currentUser.name}</div>
          <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
            ${currentUser.designation} • ${currentStore.code}
          </div>
        </div>
        <span class="status-pill ${myRecord?.status === 'Checked In' ? 'instock' : (myRecord?.status === 'Checked Out' ? 'lowstock' : 'outstock')}">
          ${myRecord ? myRecord.status : 'Not Marked'}
        </span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:var(--surface-cream); padding:10px; border-radius:8px; margin-bottom:14px; text-align:center;">
        <div>
          <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Punch-In Time</div>
          <div style="font-family:var(--font-mono); font-weight:700; font-size:14px; color:var(--color-primary); margin-top:2px;">
            ${myRecord?.checkInTime || '--:--'}
          </div>
        </div>
        <div>
          <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Punch-Out Time</div>
          <div style="font-family:var(--font-mono); font-weight:700; font-size:14px; color:var(--text-secondary); margin-top:2px;">
            ${myRecord?.checkOutTime || '--:--'}
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div style="display:flex; gap:8px;">
        ${!myRecord || myRecord.status === 'Checked Out' ? `
          <button id="btn-punch-in" class="btn-primary btn-full" style="height:44px;">
            ${Icons.userCheck(16)} Punch In (Start Floor Shift)
          </button>
        ` : `
          <button id="btn-punch-out" class="btn-secondary btn-full" style="height:44px; color:var(--status-outstock); border-color:#fecdd3;">
            Punch Out (End Floor Shift)
          </button>
        `}
      </div>
    </div>

    <!-- Store Staff Roster (Visible to all, fully detailed for Admin) -->
    <div class="section-label">
      <span>Today's Boutique Attendance (${State.attendance.filter(a => a.date === today).length} On Duty)</span>
      <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">Live Roster</span>
    </div>

    <div style="display:flex; flex-direction:column; gap:8px;">
      ${State.staffUsers.filter(u => u.role === 'salesman').map(user => {
        const record = State.attendance.find(a => a.userId === user.id && a.date === today);
        const storeName = State.stores.find(s => s.id === user.storeId)?.code || 'JBL';
        const isCheckedIn = record?.status === 'Checked In';

        return `
          <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-card); border:1px solid var(--surface-border); border-radius:var(--radius-md); padding:10px 12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:34px; height:34px; border-radius:50%; background:${isCheckedIn ? 'var(--status-instock-bg)' : 'var(--surface-cream)'}; border:1px solid ${isCheckedIn ? 'var(--status-instock-border)' : 'var(--surface-border)'}; display:flex; align-items:center; justify-content:center; font-weight:700; color:${isCheckedIn ? 'var(--status-instock)' : 'var(--text-muted)'};">
                ${user.name.charAt(0)}
              </div>
              <div>
                <div style="font-weight:700; font-size:12px; color:var(--text-main);">${user.name}</div>
                <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">
                  ${user.designation} • ${storeName}
                </div>
              </div>
            </div>

            <div style="text-align:right;">
              <span class="status-pill ${isCheckedIn ? 'instock' : (record?.status === 'Checked Out' ? 'lowstock' : 'outstock')}" style="font-size:10px;">
                ${record ? record.status : 'Absent'}
              </span>
              <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono); margin-top:2px;">
                ${record?.checkInTime ? `In: ${record.checkInTime}` : 'Not clocked'}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind Events
  container.querySelector('#btn-punch-in')?.addEventListener('click', () => {
    State.checkInAttendance(currentUser.id);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Checked In successfully for ${currentUser.name}!`, type: 'success' }
    }));
    renderAttendance(container);
  });

  container.querySelector('#btn-punch-out')?.addEventListener('click', () => {
    State.checkOutAttendance(currentUser.id);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Shift punch-out recorded for ${currentUser.name}!`, type: 'success' }
    }));
    renderAttendance(container);
  });
}
