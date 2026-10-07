// Screen: Daily Store Expenses & Cash Drawer Balancing (No Alterations)
import { State } from '../state.js';
import { Icons } from '../icons.js';

export function renderExpenses(container) {
  const currentStore = State.getCurrentStore();
  const storeExpenses = State.expenses.filter(e => e.storeId === currentStore.id);
  const totalExpensesToday = storeExpenses.reduce((s, e) => s + e.amount, 0);

  // Cash calculations
  const openingFloat = 10000;
  const storeBills = State.recentBills.filter(b => b.storeId === currentStore.id && b.paymentMode === 'Cash');
  const cashSalesToday = storeBills.reduce((s, b) => s + b.total, 0) + 12500;
  const cashExpensesOut = storeExpenses.filter(e => e.paidVia === 'Cash').reduce((s, e) => s + e.amount, 0);
  const currentCashInDrawer = openingFloat + cashSalesToday - cashExpensesOut;

  container.innerHTML = `
    <div class="page-header-row">
      <div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <span class="status-pill instock" style="font-size:10px;">
            ${currentStore.name}
          </span>
          <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
            Cash Drawer Float
          </span>
        </div>
        <h1 class="screen-title">Store Expenses</h1>
        <p class="screen-subtitle">Record expenses and reconcile the cash drawer</p>
      </div>
      <button id="btn-quick-log-exp" class="btn-primary" style="height:36px; padding:0 10px; font-size:11px;">
        ${Icons.plus(14)} Add Expense
      </button>
    </div>

    <!-- Petty Cash Summary Card -->
    <div class="artisanal-card accent-rose" style="padding:14px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--color-secondary); text-transform:uppercase;">
            TODAY'S PETTY CASH TOTAL (${currentStore.code})
          </div>
          <div style="font-family:var(--font-mono); font-size:22px; font-weight:700; color:var(--color-primary);">
            ₹${totalExpensesToday.toLocaleString('en-IN')}
          </div>
        </div>
        <span class="status-pill outstock">${storeExpenses.length} Vouchers</span>
      </div>
    </div>

    <!-- Shift Cash Drawer Balance -->
    <div class="artisanal-card" style="padding:16px; margin-bottom:14px;">
      <div class="section-label" style="margin-bottom:12px;">
        <span>Floor Cash Register Balancing</span>
        <span class="status-pill instock" style="font-size:10px;">Register Open</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; font-size:13px;">
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-muted);">Opening Cash Float (Morning)</span>
          <span style="font-family:var(--font-mono); font-weight:600;">₹${openingFloat.toLocaleString('en-IN')}</span>
        </div>

        <div style="display:flex; justify-content:space-between; color:var(--status-instock);">
          <span>+ Cash Bill Receipts</span>
          <span style="font-family:var(--font-mono); font-weight:600;">+₹${cashSalesToday.toLocaleString('en-IN')}</span>
        </div>

        <div style="display:flex; justify-content:space-between; color:var(--status-outstock);">
          <span>- Petty Cash Paid Out</span>
          <span style="font-family:var(--font-mono); font-weight:600;">-₹${cashExpensesOut.toLocaleString('en-IN')}</span>
        </div>

        <div style="border-top:1px dashed var(--surface-border); padding-top:10px; display:flex; justify-content:space-between; font-size:16px; font-weight:700; color:var(--color-primary);">
          <span>Expected Cash in Drawer</span>
          <span style="font-family:var(--font-mono);">₹${currentCashInDrawer.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <button id="btn-reconcile-cash" class="btn-secondary btn-full" style="margin-top:14px;">
        ${Icons.check(16)} Reconcile & Verify Cash Till
      </button>
    </div>

    <!-- Expense Entries List -->
    <div class="section-label">Expense Log (${storeExpenses.length} entries)</div>

    <div style="display:flex; flex-direction:column; gap:8px;">
      ${storeExpenses.length ? storeExpenses.map(exp => `
        <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-card); border:1px solid var(--surface-border); border-radius:var(--radius-md); padding:10px 12px;">
          <div style="flex:1; min-width:0; padding-right:8px;">
            <div style="font-weight:600; font-size:13px; color:var(--text-main);">${exp.title}</div>
            <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">
              ${exp.time} • ${exp.category} • Paid via ${exp.paidVia}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="font-family:var(--font-mono); font-weight:700; font-size:14px; color:var(--status-outstock);">
              -₹${exp.amount.toLocaleString('en-IN')}
            </div>
            <button class="icon-btn-ghost btn-edit-expense" data-id="${exp.id}" title="Edit expense" aria-label="Edit expense">${Icons.edit(15)}</button>
            <button class="icon-btn-ghost btn-delete-expense" data-id="${exp.id}" title="Delete expense" style="color:var(--status-outstock);">${Icons.trash(14)}</button>
          </div>
        </div>
      `).join('') : `
        <div class="artisanal-card" style="text-align:center; padding:20px;">
          <p style="font-size:13px; font-weight:600; margin-bottom:4px;">No expenses recorded for this store yet</p>
          <p style="font-size:11px; color:var(--text-muted); margin-bottom:12px;">Use Add Expense to record a store payment.</p>
          <button id="btn-empty-add-expense" class="btn-primary" style="height:36px; padding:0 12px;">
            ${Icons.plus(14)} Add Expense
          </button>
        </div>
      `}
    </div>
  `;

  // Bind Events
  const openExpense = () => openExpenseModal(container);
  container.querySelector('#btn-quick-log-exp')?.addEventListener('click', openExpense);
  container.querySelector('#btn-empty-add-expense')?.addEventListener('click', openExpense);
  container.querySelectorAll('.btn-edit-expense').forEach(button => {
    button.addEventListener('click', () => {
      const expense = State.expenses.find(item => item.id === button.dataset.id);
      if (expense) openExpenseModal(container, expense);
    });
  });
  container.querySelectorAll('.btn-delete-expense').forEach(button => {
    button.addEventListener('click', () => {
      const expense = State.expenses.find(item => item.id === button.dataset.id);
      if (!expense || !window.confirm(`Delete expense "${expense.title}" for ₹${expense.amount}?`)) return;
      try {
        State.deleteExpense(expense.id);
        renderExpenses(container);
      } catch (error) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
      }
    });
  });

  container.querySelector('#btn-reconcile-cash')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Cash till reconciled for ${currentStore.name}: ₹${currentCashInDrawer.toLocaleString('en-IN')}`, type: 'success' }
    }));
  });
}

function openExpenseModal(container, expense = null) {
  const editing = Boolean(expense);
  const currentStore = State.getCurrentStore();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <h3 class="modal-title">${editing ? 'Edit Store Expense' : 'Add Store Expense'}</h3>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <div style="font-size:11px; color:var(--text-muted); margin-bottom:12px;">
        Store: <strong>${currentStore.name}</strong> (${currentStore.code})
      </div>

      <form id="form-new-expense">
        <div class="form-group">
          <label class="form-label">Expense Description</label>
          <input type="text" id="exp-title" class="form-control" placeholder="e.g. Garment tags, hangers & steamer water" value="${expense?.title || ''}" required />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="exp-cat" class="form-control">
              ${['Store Maintenance', 'Store Ambiance', 'Packing Supplies', 'Staff Refreshments', 'Decor & Tradition', 'Other'].map(category => `<option value="${category}" ${expense?.category === category ? 'selected' : ''}>${category}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Amount (₹)</label>
            <input type="number" id="exp-amount" class="form-control" placeholder="450" value="${expense?.amount ?? ''}" min="0.01" step="0.01" required />
          </div>
        </div>

        <div class="form-group" id="exp-custom-category-group" style="display:none;">
          <label class="form-label" for="exp-custom-category">Other category</label>
          <input type="text" id="exp-custom-category" class="form-control" placeholder="Enter expense category" value="${expense && !['Store Maintenance', 'Store Ambiance', 'Packing Supplies', 'Staff Refreshments', 'Decor & Tradition'].includes(expense.category) ? expense.category : ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Disbursement Source</label>
          <select id="exp-mode" class="form-control">
            <option value="Cash" ${expense?.paidVia === 'Cash' ? 'selected' : ''}>Cash (from drawer float)</option>
            <option value="UPI" ${expense?.paidVia === 'UPI' ? 'selected' : ''}>UPI (Store account)</option>
          </select>
        </div>

        <button type="submit" class="btn-primary btn-full" style="margin-top:10px;">
          ${Icons.check(16)} ${editing ? 'Save Changes' : 'Save Expense'}
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close-btn')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  modal.querySelector('#exp-amount')?.addEventListener('input', event => {
    event.currentTarget.setCustomValidity('');
  });
  const categorySelect = modal.querySelector('#exp-cat');
  const customCategoryGroup = modal.querySelector('#exp-custom-category-group');
  const customCategoryInput = modal.querySelector('#exp-custom-category');
  if (expense && !['Store Maintenance', 'Store Ambiance', 'Packing Supplies', 'Staff Refreshments', 'Decor & Tradition'].includes(expense.category)) {
    categorySelect.value = 'Other';
  }
  categorySelect.addEventListener('change', () => {
    const isOther = categorySelect.value === 'Other';
    customCategoryGroup.style.display = isOther ? '' : 'none';
    customCategoryInput.required = isOther;
    if (!isOther) customCategoryInput.value = '';
  });
  categorySelect.dispatchEvent(new Event('change'));

  modal.querySelector('#form-new-expense')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = modal.querySelector('#exp-title').value;
    const category = categorySelect.value === 'Other'
      ? customCategoryInput.value.trim()
      : categorySelect.value;
    const amount = Number(modal.querySelector('#exp-amount').value);
    const paidVia = modal.querySelector('#exp-mode').value;

    if (!category) {
      customCategoryInput.setCustomValidity('Enter the expense category.');
      customCategoryInput.reportValidity();
      return;
    }
    customCategoryInput.setCustomValidity('');

    if (!Number.isFinite(amount) || amount <= 0) {
      const amountInput = modal.querySelector('#exp-amount');
      amountInput.setCustomValidity('Enter an expense amount greater than zero.');
      amountInput.reportValidity();
      return;
    }

    try {
      if (editing) State.updateExpense(expense.id, { title, category, amount, paidVia });
      else State.addExpense({ title, category, amount, paidVia });
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: error.message, type: 'alert' } }));
      return;
    }
    modal.remove();
    renderExpenses(container);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `${editing ? 'Updated' : 'Logged'} ₹${amount} for ${title}`, type: 'success' }
    }));
  });
}
