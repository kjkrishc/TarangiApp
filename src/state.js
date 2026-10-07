// Central State Manager with Multi-Store, Multi-Bill Tabs, Innerwear, Item-level Discounts & Returns
const STORAGE_KEY = 'tarangi_retail_suite_v3';

const INITIAL_STORES = [
  {
    id: 'ST-01',
    name: 'Jubilee Hills Flagship',
    code: 'JBL',
    address: 'Plot 48, Road No. 36, Jubilee Hills, Hyderabad',
    phone: '+91 40 2355 9011',
    gstin: '36AAACT9108K1Z5'
  },
  {
    id: 'ST-02',
    name: 'Banjara Hills Boutique',
    code: 'BNJ',
    address: 'Road No. 12, Banjara Hills, Hyderabad',
    phone: '+91 40 2331 4422',
    gstin: '36AAACT9108K2Z4'
  },
  {
    id: 'ST-03',
    name: 'Inorbit Mall Galleria',
    code: 'INB',
    address: 'Level 2, Inorbit Mall, Madhapur, Hyderabad',
    phone: '+91 40 4012 8890',
    gstin: '36AAACT9108K3Z3'
  }
];

const INITIAL_USERS = [
  {
    id: 'USR-01',
    name: 'Bala Krishna',
    role: 'admin',
    pin: '1234',
    designation: 'Store Owner / General Manager',
    storeId: 'ST-01'
  },
  {
    id: 'USR-02',
    name: 'Ramesh Kumar',
    role: 'salesman',
    pin: '1111',
    designation: 'Senior Fashion Consultant',
    storeId: 'ST-01'
  },
  {
    id: 'USR-03',
    name: 'Sunita Sharma',
    role: 'salesman',
    pin: '2222',
    designation: 'Floor Stylist',
    storeId: 'ST-01'
  },
  {
    id: 'USR-04',
    name: 'Anil Reddy',
    role: 'salesman',
    pin: '3333',
    designation: 'Store Associate',
    storeId: 'ST-02'
  }
];

const INITIAL_MASTER_DATA = {
  categories: [
    'Straight Kurtis',
    'Anarkali Kurti Sets',
    'Kurti Pant Sets',
    'Co-ord Sets',
    'Innerwear (Bras/Panties/Strips)',
    'Festive Sarees',
    'Short Tunics'
  ],
  innerwearTypes: [
    'Bra',
    'Panties',
    'Strips'
  ],
  sizes: [
    'XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)', '2XL (44)', '3XL (46)',
    '32B', '34B', '36B', '34C', '36C', '38C',
    'Free Size'
  ],
  maxDiscountRules: {
    'Straight Kurtis': 20,
    'Anarkali Kurti Sets': 15,
    'Kurti Pant Sets': 15,
    'Co-ord Sets': 15,
    'Innerwear (Bras/Panties/Strips)': 10,
    'Festive Sarees': 15,
    'Short Tunics': 20
  }
};

const INITIAL_PRODUCTS = [
  {
    id: 'TRG-KRT-1011',
    sku: 'TRG-KRT-1011',
    name: 'Mulmul Chikankari Straight Kurti',
    category: 'Straight Kurtis',
    subType: 'Straight Kurti',
    colorName: 'Powder Lilac Blue',
    colorHex: '#93c5fd',
    price: 2499,
    costPrice: 1350,
    size: 'M (38)',
    availableSizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)', '2XL (44)'],
    maxDiscountPercent: 20,
    stockPerStore: { 'ST-01': 8, 'ST-02': 5, 'ST-03': 3 },
    threshold: 3,
    imageGradient: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
  },
  {
    id: 'TRG-SET-2045',
    sku: 'TRG-SET-2045',
    name: 'Chanderi Zari Anarkali 3-Piece Set',
    category: 'Anarkali Kurti Sets',
    subType: 'Anarkali Set',
    colorName: 'Royal Wine Rose',
    colorHex: '#881337',
    price: 6899,
    costPrice: 4200,
    size: 'L (40)',
    availableSizes: ['M (38)', 'L (40)', 'XL (42)', '2XL (44)'],
    maxDiscountPercent: 15,
    stockPerStore: { 'ST-01': 4, 'ST-02': 2, 'ST-03': 1 },
    threshold: 2,
    imageGradient: 'linear-gradient(135deg, #881337 0%, #b45309 100%)'
  },
  {
    id: 'TRG-INW-701',
    sku: 'TRG-INW-701',
    name: 'Seamless T-Shirt Molded Bra (Nude)',
    category: 'Innerwear (Bras/Panties/Strips)',
    subType: 'T-Shirt & Seamless Bra',
    colorName: 'Warm Skin Nude',
    colorHex: '#e5c298',
    price: 999,
    costPrice: 520,
    size: '34B',
    availableSizes: ['32B', '34B', '36B', '34C', '36C', '38C'],
    maxDiscountPercent: 10,
    stockPerStore: { 'ST-01': 15, 'ST-02': 10, 'ST-03': 8 },
    threshold: 4,
    imageGradient: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)'
  },
  {
    id: 'TRG-INW-702',
    sku: 'TRG-INW-702',
    name: 'Pure Cotton Hipster Panties (Pack of 3)',
    category: 'Innerwear (Bras/Panties/Strips)',
    subType: 'Cotton Hipster Panties (Pack of 3)',
    colorName: 'Pastel Assorted',
    colorHex: '#f472b6',
    price: 699,
    costPrice: 350,
    size: 'M (38)',
    availableSizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    maxDiscountPercent: 10,
    stockPerStore: { 'ST-01': 20, 'ST-02': 14, 'ST-03': 10 },
    threshold: 5,
    imageGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
  },
  {
    id: 'TRG-INW-703',
    sku: 'TRG-INW-703',
    name: 'Clear Transparent Silicone Bra Straps / Strips',
    category: 'Innerwear (Bras/Panties/Strips)',
    subType: 'Transparent Silicone Straps / Strips',
    colorName: 'Clear Transparent',
    colorHex: '#cbd5e1',
    price: 199,
    costPrice: 70,
    size: 'Free Size',
    availableSizes: ['Free Size'],
    maxDiscountPercent: 5,
    stockPerStore: { 'ST-01': 30, 'ST-02': 25, 'ST-03': 18 },
    threshold: 8,
    imageGradient: 'linear-gradient(135deg, #94a3b8 0%, #e2e8f0 100%)'
  },
  {
    id: 'TRG-INW-704',
    sku: 'TRG-INW-704',
    name: 'Pure Mulmul Kurti Full Slip / Camisole',
    category: 'Innerwear (Bras/Panties/Strips)',
    subType: 'Kurti Full Slip / Camisole',
    colorName: 'Ivory White',
    colorHex: '#f8fafc',
    price: 499,
    costPrice: 240,
    size: 'L (40)',
    availableSizes: ['M (38)', 'L (40)', 'XL (42)', '2XL (44)'],
    maxDiscountPercent: 10,
    stockPerStore: { 'ST-01': 14, 'ST-02': 8, 'ST-03': 6 },
    threshold: 3,
    imageGradient: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
  },
  {
    id: 'TRG-CRD-3088',
    sku: 'TRG-CRD-3088',
    name: 'Muslin Printed Festive Co-ord Set',
    category: 'Co-ord Sets',
    subType: 'Co-ord Set',
    colorName: 'Emerald Forest Green',
    colorHex: '#065f46',
    price: 4250,
    costPrice: 2600,
    size: 'M (38)',
    availableSizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    maxDiscountPercent: 15,
    stockPerStore: { 'ST-01': 6, 'ST-02': 4, 'ST-03': 2 },
    threshold: 2,
    imageGradient: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #d97706 100%)'
  },
  {
    id: 'TRG-SAR-9021',
    sku: 'TRG-SAR-9021',
    name: 'Kanjeevaram Bridal Silk Saree',
    category: 'Festive Sarees',
    subType: 'Kanjeevaram Saree',
    colorName: 'Crimson & Pure Zari',
    colorHex: '#640023',
    price: 38500,
    costPrice: 25000,
    size: 'Free Size',
    availableSizes: ['Free Size'],
    maxDiscountPercent: 15,
    stockPerStore: { 'ST-01': 2, 'ST-02': 1, 'ST-03': 0 },
    threshold: 2,
    imageGradient: 'linear-gradient(135deg, #700f2b 0%, #d97706 100%)'
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-01',
    name: 'Smt. Kavitha Reddy',
    mobile: '9849012345',
    email: 'kavitha.reddy@gmail.com',
    visits: 6,
    totalSpent: 28400,
    lastVisit: 'Yesterday'
  },
  {
    id: 'CUST-02',
    name: 'Pooja Agarwal',
    mobile: '9989045678',
    email: 'pooja.agarwal@outlook.com',
    visits: 2,
    totalSpent: 7150,
    lastVisit: '4 days ago'
  },
  {
    id: 'CUST-03',
    name: 'Dr. Swapna Rao',
    mobile: '9440178901',
    email: 'swapna.rao@yahoo.com',
    visits: 8,
    totalSpent: 48900,
    lastVisit: 'Last week'
  }
];

const INITIAL_ATTENDANCE = [
  {
    id: 'ATT-01',
    userId: 'USR-02',
    userName: 'Ramesh Kumar',
    storeId: 'ST-01',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:45 AM',
    checkOutTime: null,
    status: 'Checked In',
    shift: 'Full Day'
  },
  {
    id: 'ATT-02',
    userId: 'USR-03',
    userName: 'Sunita Sharma',
    storeId: 'ST-01',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '10:05 AM',
    checkOutTime: null,
    status: 'Checked In',
    shift: 'Full Day'
  }
];

const INITIAL_EXPENSES = [
  {
    id: 'EXP-501',
    storeId: 'ST-01',
    title: 'Trial fitting room dry cleaning batch',
    category: 'Store Maintenance',
    amount: 1400,
    time: '11:15 AM',
    dateISO: new Date().toISOString(),
    paidVia: 'Cash'
  },
  {
    id: 'EXP-502',
    storeId: 'ST-01',
    title: 'Sandalwood room mist & brass bells polish',
    category: 'Store Ambiance',
    amount: 650,
    time: '12:30 PM',
    dateISO: new Date().toISOString(),
    paidVia: 'Cash'
  }
];

class StateManager {
  constructor() {
    this.listeners = new Set();
    this.loadState();
    this.initAudio();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.isLoggedIn = false;
        this.stores = parsed.stores || INITIAL_STORES;
        this.currentStoreId = parsed.currentStoreId || 'ST-01';
        this.staffUsers = parsed.staffUsers || INITIAL_USERS;
        this.currentUser = null;
        this.masterData = {
          ...INITIAL_MASTER_DATA,
          ...(parsed.masterData || {}),
          maxDiscountRules: {
            ...INITIAL_MASTER_DATA.maxDiscountRules,
            ...(parsed.masterData?.maxDiscountRules || {})
          }
        };
        this.products = parsed.products || INITIAL_PRODUCTS;
        this.products.forEach(product => {
          product.availableSizes = product.availableSizes || product.sizes || [product.size].filter(Boolean);
          product.maxDiscountPercent ??= this.masterData.maxDiscountRules[product.category] ?? 15;
        });
        this.customers = parsed.customers || INITIAL_CUSTOMERS;
        this.attendance = parsed.attendance || INITIAL_ATTENDANCE;
        this.expenses = parsed.expenses || INITIAL_EXPENSES;
        this.recentBills = parsed.recentBills || [];
        this.returns = parsed.returns || [];
        this.openBills = parsed.openBills || this.getDefaultOpenBills();
        this.activeBillId = parsed.activeBillId || this.openBills[0]?.id;
        this.activeTab = parsed.activeTab || 'pos';
        return;
      }
    } catch (e) {
      console.warn('Fallback to defaults', e);
    }

    this.isLoggedIn = false; // Start from Login screen
    this.stores = [...INITIAL_STORES];
    this.currentStoreId = 'ST-01';
    this.staffUsers = [...INITIAL_USERS];
    this.currentUser = null;
    this.masterData = { ...INITIAL_MASTER_DATA };
    this.products = [...INITIAL_PRODUCTS];
    this.customers = [...INITIAL_CUSTOMERS];
    this.attendance = [...INITIAL_ATTENDANCE];
    this.expenses = [...INITIAL_EXPENSES];
    this.returns = [];
    this.recentBills = [
      {
        id: 'JBL-801',
        billNumber: 'JBL-801',
        storeId: 'ST-01',
        dateISO: new Date().toISOString(),
        salesmanId: 'USR-02',
        salesmanName: 'Ramesh Kumar',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: '12:30 PM',
        customerName: 'Smt. Kavitha Reddy',
        customerMobile: '9849012345',
        items: [
          { product: this.products[0], quantity: 1, size: 'M (38)', discountPercent: 10 }
        ],
        itemsCount: 1,
        subtotal: 2499,
        discountAmount: 250,
        taxable: 2142,
        cgst: 53.5,
        sgst: 53.5,
        total: 2249,
        paymentMode: 'UPI'
      }
    ];
    this.openBills = this.getDefaultOpenBills();
    this.activeBillId = this.openBills[0].id;
    this.activeTab = 'pos';
  }

  getDefaultOpenBills() {
    return [
      {
        id: 'BILL-TAB-1',
        title: 'Bill 1',
        customer: { name: '', mobile: '' },
        items: [],
        createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isLoggedIn: this.isLoggedIn,
        stores: this.stores,
        currentStoreId: this.currentStoreId,
        staffUsers: this.staffUsers,
        currentUser: this.currentUser,
        masterData: this.masterData,
        products: this.products,
        customers: this.customers,
        attendance: this.attendance,
        expenses: this.expenses,
        recentBills: this.recentBills,
        returns: this.returns,
        openBills: this.openBills,
        activeBillId: this.activeBillId,
        activeTab: this.activeTab
      }));
    } catch (e) {
      console.error('Save failed', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveState();
    this.listeners.forEach(fn => fn(this));
  }

  // Audio effects
  initAudio() {
    this.audioCtx = null;
  }

  playBeep() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.12);
    } catch (e) {}
  }

  playChime() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const now = this.audioCtx.currentTime;
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {}
  }

  playClick() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  // Authentication
  login(userId, pin = '') {
    const user = this.staffUsers.find(u => u.id === userId);
    if (!user) return false;
    if (!user.pin || user.pin !== pin) {
      return false;
    }
    this.currentUser = user;
    this.isLoggedIn = true;
    if (user.storeId) this.currentStoreId = user.storeId;
    this.activeTab = user.role === 'admin' ? 'dashboard' : 'pos';
    this.playChime();
    this.notify();
    return true;
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    this.playClick();
    this.notify();
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  // Store Management
  setCurrentStore(storeId) {
    this.currentStoreId = storeId;
    this.playClick();
    this.notify();
  }

  getCurrentStore() {
    return this.stores.find(s => s.id === this.currentStoreId) || this.stores[0];
  }

  // Navigation
  setActiveTab(tabName) {
    this.activeTab = tabName;
    this.playClick();
    this.notify();
  }

  // Multi-Customer POS Bills (Concurrent Draft Tabs)
  getActiveBill() {
    let bill = this.openBills.find(b => b.id === this.activeBillId);
    if (!bill) {
      if (this.openBills.length === 0) {
        this.createNewBillTab();
      }
      bill = this.openBills[0];
      this.activeBillId = bill.id;
    }
    return bill;
  }

  createNewBillTab() {
    const nextNum = this.openBills.reduce((max, bill) => {
      const match = bill.title.match(/^Bill (\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;
    const newBill = {
      id: 'BILL-TAB-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: `Bill ${nextNum}`,
      customer: { name: '', mobile: '' },
      items: [],
      createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    this.openBills.push(newBill);
    this.activeBillId = newBill.id;
    this.playClick();
    this.notify();
    return newBill;
  }

  switchBillTab(billId) {
    if (this.openBills.some(b => b.id === billId)) {
      this.activeBillId = billId;
      this.playClick();
      this.notify();
    }
  }

  closeBillTab(billId) {
    if (this.openBills.length <= 1) {
      // Just clear items of the last bill
      const b = this.openBills[0];
      b.items = [];
      b.customer = { name: '', mobile: '' };
      b.title = 'Bill 1';
      this.notify();
      return;
    }
    const idx = this.openBills.findIndex(b => b.id === billId);
    if (idx !== -1) {
      this.openBills.splice(idx, 1);
      this.activeBillId = this.openBills[Math.max(0, idx - 1)].id;
      this.playClick();
      this.notify();
    }
  }

  discardBillTab(billId) {
    const index = this.openBills.findIndex(bill => bill.id === billId);
    if (index === -1) return false;
    this.openBills.splice(index, 1);
    if (!this.openBills.length) {
      this.openBills.push({
        id: 'BILL-TAB-' + Date.now(),
        title: 'Bill 1',
        customer: { name: '', mobile: '' },
        items: [],
        createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
    }
    if (!this.openBills.some(bill => bill.id === this.activeBillId)) {
      this.activeBillId = this.openBills[Math.max(0, index - 1)].id;
    }
    this.notify();
    return true;
  }

  // Active Bill Cart Operations
  addToActiveBill(product, size = null) {
    const bill = this.getActiveBill();
    const availableSizes = product.availableSizes || product.sizes || [product.size].filter(Boolean);
    const selSize = size || product.size || availableSizes[0];
    if (!selSize || !availableSizes.includes(selSize)) return false;
    const existing = bill.items.find(i => i.product.id === product.id && i.size === selSize);
    const currentQuantity = existing?.quantity || 0;
    if (this.getProductStock(product.id, this.currentStoreId) <= currentQuantity) {
      throw new Error(`${product.name} is out of stock in the selected size.`);
    }
    if (existing) {
      existing.quantity += 1;
    } else {
      bill.items.push({
        product,
        quantity: 1,
        size: selSize,
        discountPercent: 0 // default 0%
      });
    }
    this.playBeep();
    this.notify();
    return true;
  }

  updateItemQuantity(index, delta) {
    const bill = this.getActiveBill();
    if (!bill.items[index]) return;
    bill.items[index].quantity += delta;
    if (bill.items[index].quantity <= 0) {
      bill.items.splice(index, 1);
    }
    this.playClick();
    this.notify();
  }

  updateItemDiscount(index, discountPercent) {
    const bill = this.getActiveBill();
    if (!bill.items[index]) return;
    const item = bill.items[index];
    const typeLimit = Number(this.masterData.maxDiscountRules[item.product.category] ?? 15);
    const maxAllowed = Math.min(Number(item.product.maxDiscountPercent ?? typeLimit), typeLimit);
    const requested = Number(discountPercent);
    const clamped = Math.max(0, Math.min(maxAllowed, Number.isFinite(requested) ? requested : 0));
    item.discountPercent = clamped;
    this.notify();
    return clamped;
  }

  removeItemFromActiveBill(index) {
    const bill = this.getActiveBill();
    if (bill.items[index]) {
      bill.items.splice(index, 1);
      this.playClick();
      this.notify();
    }
  }

  setCustomerForActiveBill(name, mobile, shouldNotify = true) {
    const bill = this.getActiveBill();
    bill.customer = { name: name.trim(), mobile: mobile.trim() };
    if (name.trim()) {
      const titleWords = name.trim().split(/\s+/).filter(word => !['mr.', 'mrs.', 'ms.', 'smt.', 'dr.'].includes(word.toLowerCase()));
      bill.title = titleWords[0] || name.trim().split(/\s+/)[0];
    }
    if (shouldNotify) this.notify();
    else this.saveState();
  }

  // Tax Calculation (GST INCLUSIVE as requested: calculate backward from final MRP)
  calculateBillTotals(bill = this.getActiveBill()) {
    let subtotalMrp = 0;
    let totalDiscountAmount = 0;
    let netFinalPayable = 0;

    bill.items.forEach(item => {
      const lineMrp = item.product.price * item.quantity;
      const lineDisc = Math.round(lineMrp * (item.discountPercent / 100));
      const lineNet = lineMrp - lineDisc;

      subtotalMrp += lineMrp;
      totalDiscountAmount += lineDisc;
      netFinalPayable += lineNet;
    });

    // 5% Handloom & Ready-made Garment GST inclusive back-calculation:
    // Taxable = Total / 1.05
    const taxableValue = Math.round((netFinalPayable / 1.05) * 100) / 100;
    const totalGst = Math.round((netFinalPayable - taxableValue) * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst - cgst) * 100) / 100;

    return {
      subtotalMrp,
      totalDiscountAmount,
      netFinalPayable,
      taxableValue,
      totalGst,
      cgst,
      sgst
    };
  }

  completeActiveBill(paymentMode = 'UPI') {
    const bill = this.getActiveBill();
    if (bill.items.length === 0) return null;
    const customerName = bill.customer.name.trim();
    const customerMobile = bill.customer.mobile.replace(/\D/g, '');
    if (!customerName) throw new Error('Enter the customer name before completing this bill.');
    if (!/^[6-9]\d{9}$/.test(customerMobile)) throw new Error('Enter a valid 10-digit mobile number before completing this bill.');

    const store = this.getCurrentStore();
    const requiredByProduct = bill.items.reduce((required, item) => {
      required.set(item.product.id, (required.get(item.product.id) || 0) + item.quantity);
      return required;
    }, new Map());
    const outOfStockId = Array.from(requiredByProduct.entries())
      .find(([productId, quantity]) => this.getProductStock(productId, store.id) < quantity)?.[0];
    if (outOfStockId) {
      const outOfStockItem = bill.items.find(item => item.product.id === outOfStockId);
      throw new Error(`${outOfStockItem.product.name} does not have enough stock to complete this bill.`);
    }
    const totals = this.calculateBillTotals(bill);

    // Save/Update Customer in registry
    const custName = customerName;
    const custMobile = customerMobile;
    const customer = this.upsertCustomer(custName, custMobile);
    customer.totalSpent = (customer.totalSpent || 0) + totals.netFinalPayable;

    // Deduct inventory stock for current store
    bill.items.forEach(item => {
      this.adjustStock(item.product.id, -item.quantity, store.id);
    });

    const billNumber = `${store.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    const completedBill = {
      id: billNumber,
      billNumber,
      storeId: store.id,
      storeName: store.name,
      storeCode: store.code,
      storeAddress: store.address,
      storeGstin: store.gstin,
      salesmanId: this.currentUser?.id || 'USR-01',
      salesmanName: this.currentUser?.name || 'Staff',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dateISO: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      customer: custName,
      customerName: custName,
      customerMobile: custMobile,
      items: [...bill.items],
      itemsCount: bill.items.reduce((s, i) => s + i.quantity, 0),
      subtotal: totals.subtotalMrp,
      discountAmount: totals.totalDiscountAmount,
      taxable: totals.taxableValue,
      cgst: totals.cgst,
      sgst: totals.sgst,
      totalGst: totals.totalGst,
      total: totals.netFinalPayable,
      grandTotal: totals.netFinalPayable,
      paymentMode
    };
    const invoiceSequence = billNumber.startsWith(`${store.code}-`) ? billNumber.slice(store.code.length + 1) : billNumber;
    completedBill.barcodePayload = `TARANGI-${store.code}-${invoiceSequence}`;

    this.recentBills.unshift(completedBill);
    this.closeBillTab(bill.id);
    this.playChime();
    this.notify();
    return completedBill;
  }

  // Stock operations
  getProductStock(productId, storeId = this.currentStoreId) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return 0;
    if (storeId === 'ALL') {
      return Object.values(prod.stockPerStore || {}).reduce((a, b) => a + b, 0);
    }
    return (prod.stockPerStore && prod.stockPerStore[storeId]) ?? 0;
  }

  adjustStock(productId, delta, storeId = this.currentStoreId) {
    const targetStore = storeId === 'ALL' ? 'ST-01' : storeId;
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return;
    if (!prod.stockPerStore) prod.stockPerStore = {};
    const current = prod.stockPerStore[targetStore] || 0;
    prod.stockPerStore[targetStore] = Math.max(0, current + delta);
    this.notify();
  }

  addNewProduct(newProd) {
    if (this.products.some(product => product.sku.toLowerCase() === String(newProd.sku || '').toLowerCase())) {
      throw new Error('A product with this SKU already exists.');
    }
    if (!(newProd.availableSizes || newProd.sizes || [newProd.size].filter(Boolean)).length) {
      throw new Error('Select at least one available size.');
    }
    const targetStore = this.currentStoreId === 'ALL' ? 'ST-01' : this.currentStoreId;
    const stockMap = {};
    this.stores.forEach(s => {
      stockMap[s.id] = s.id === targetStore ? (newProd.initialStock ?? 0) : 0;
    });

    const productRecord = {
      ...newProd,
      availableSizes: newProd.availableSizes || newProd.sizes || [newProd.size].filter(Boolean),
      maxDiscountPercent: Number(newProd.maxDiscountPercent ?? this.masterData.maxDiscountRules[newProd.category] ?? 15),
      stockPerStore: stockMap
    };
    this.products.unshift(productRecord);
    this.playChime();
    this.notify();
    return productRecord;
  }

  updateProduct(productId, updates) {
    const product = this.products.find(item => item.id === productId);
    if (!product) throw new Error('Product not found.');
    if (updates.sku && this.products.some(item => item.id !== productId && item.sku.toLowerCase() === updates.sku.toLowerCase())) {
      throw new Error('A product with this SKU already exists.');
    }
    Object.assign(product, updates);
    product.availableSizes = updates.availableSizes || product.availableSizes || [product.size].filter(Boolean);
    product.size = product.availableSizes[0] || '';
    product.maxDiscountPercent = Number(updates.maxDiscountPercent ?? product.maxDiscountPercent ?? 15);
    this.notify();
    return product;
  }

  deleteProduct(productId) {
    const hasOpenBill = this.openBills.some(bill => bill.items.some(item => item.product.id === productId));
    if (hasOpenBill) throw new Error('Remove this product from all open bills before deleting it.');
    const index = this.products.findIndex(product => product.id === productId);
    if (index === -1) throw new Error('Product not found.');
    this.products.splice(index, 1);
    this.notify();
  }

  setStock(productId, quantity, storeId = this.currentStoreId) {
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Stock must be a whole number greater than or equal to zero.');
    const product = this.products.find(item => item.id === productId);
    if (!product) throw new Error('Product not found.');
    product.stockPerStore ||= {};
    product.stockPerStore[storeId] = quantity;
    this.notify();
  }

  addStaffUser(user) {
    const id = 'USR-' + Date.now();
    const record = { ...user, id, pin: '' };
    this.staffUsers.push(record);
    this.notify();
    return record;
  }

  setStaffPin(userId, pin) {
    if (!/^\d{4,8}$/.test(pin)) throw new Error('PIN must contain 4 to 8 digits.');
    const user = this.staffUsers.find(item => item.id === userId);
    if (!user) throw new Error('Staff user not found.');
    user.pin = pin;
    this.notify();
  }

  deleteStaffUser(userId) {
    if (this.currentUser?.id === userId) throw new Error('Sign in as another user before deleting this account.');
    if (this.staffUsers.filter(user => user.role === 'admin').length <= 1 && this.staffUsers.find(user => user.id === userId)?.role === 'admin') {
      throw new Error('At least one admin account must remain.');
    }
    this.staffUsers = this.staffUsers.filter(user => user.id !== userId);
    this.notify();
  }

  updateStore(storeId, updates) {
    const store = this.stores.find(item => item.id === storeId);
    if (!store) throw new Error('Store not found.');
    const normalized = {
      ...updates,
      name: String(updates.name ?? store.name).trim(),
      code: String(updates.code ?? store.code).trim().toUpperCase(),
      phone: String(updates.phone ?? store.phone).trim(),
      address: String(updates.address ?? store.address).trim(),
      gstin: String(updates.gstin ?? store.gstin).trim()
    };
    if (!normalized.name || !normalized.phone || !normalized.address || !normalized.gstin) {
      throw new Error('Store name, phone, address, and GSTIN are required.');
    }
    if (!/^[A-Z0-9]{2,4}$/.test(normalized.code)) throw new Error('Store code must be 2 to 4 letters or numbers.');
    if (this.stores.some(item => item.id !== storeId && item.code.toUpperCase() === normalized.code)) {
      throw new Error('That store code is already in use.');
    }
    Object.assign(store, normalized);
    this.notify();
  }

  addStore(details) {
    const store = {
      id: `ST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: String(details.name || '').trim(),
      code: String(details.code || '').trim().toUpperCase(),
      phone: String(details.phone || '').trim(),
      address: String(details.address || '').trim(),
      gstin: String(details.gstin || '').trim()
    };
    if (!store.name || !store.phone || !store.address || !store.gstin) {
      throw new Error('Store name, phone, address, and GSTIN are required.');
    }
    if (!/^[A-Z0-9]{2,4}$/.test(store.code)) throw new Error('Store code must be 2 to 4 letters or numbers.');
    if (this.stores.some(item => item.code.toUpperCase() === store.code)) {
      throw new Error('That store code is already in use.');
    }
    this.stores.push(store);
    this.notify();
    return store;
  }

  deleteStore(storeId) {
    if (this.stores.length <= 1) throw new Error('At least one store must remain.');
    if (this.currentStoreId === storeId) throw new Error('Switch to another store before deleting this store.');
    if (this.staffUsers.some(user => user.storeId === storeId)) throw new Error('Reassign staff from this store before deleting it.');
    if (this.products.some(product => (product.stockPerStore?.[storeId] || 0) > 0)) throw new Error('Move or remove this store’s stock before deleting it.');
    this.stores = this.stores.filter(store => store.id !== storeId);
    this.products.forEach(product => { delete product.stockPerStore?.[storeId]; });
    this.notify();
  }

  deleteMasterDataItem(type, value) {
    if (type === 'categories' && this.products.some(product => product.category === value)) {
      throw new Error('Reassign products in this category before deleting it.');
    }
    if (type === 'sizes' && this.products.some(product => (product.availableSizes || product.sizes || []).includes(value))) {
      throw new Error('Remove this size from product variants before deleting it.');
    }
    if (!Array.isArray(this.masterData[type])) throw new Error('Master data list not found.');
    this.masterData[type] = this.masterData[type].filter(item => item !== value);
    if (type === 'categories') delete this.masterData.maxDiscountRules[value];
    this.notify();
  }

  renameMasterDataItem(type, oldValue, newValue) {
    const replacement = newValue.trim();
    if (!replacement) throw new Error('Enter a non-empty name.');
    if (!Array.isArray(this.masterData[type]) || !this.masterData[type].includes(oldValue)) {
      throw new Error('Master data item not found.');
    }
    if (this.masterData[type].some(item => item.toLowerCase() === replacement.toLowerCase() && item !== oldValue)) {
      throw new Error(`'${replacement}' already exists.`);
    }
    if (type === 'categories') {
      this.masterData.categories = this.masterData.categories.map(item => item === oldValue ? replacement : item);
      this.masterData.maxDiscountRules[replacement] = this.masterData.maxDiscountRules[oldValue] ?? 15;
      delete this.masterData.maxDiscountRules[oldValue];
      this.products.forEach(product => {
        if (product.category === oldValue) product.category = replacement;
      });
    } else if (type === 'sizes') {
      this.masterData.sizes = this.masterData.sizes.map(item => item === oldValue ? replacement : item);
      this.products.forEach(product => {
        product.availableSizes = (product.availableSizes || product.sizes || []).map(size => size === oldValue ? replacement : size);
        if (product.size === oldValue) product.size = replacement;
      });
    } else {
      this.masterData[type] = this.masterData[type].map(item => item === oldValue ? replacement : item);
    }
    this.notify();
  }

  // Returns & Exchanges
  processReturnOrExchange(returnData) {
    const { originalBill, returnedItems, newItems, customerName, customerMobile } = returnData;
    if (!originalBill || !returnedItems?.length) throw new Error('Select an original invoice and at least one item to return.');
    const originalBillNumber = originalBill.billNumber || originalBill.id;
    const store = this.stores.find(item => item.id === originalBill.storeId) || this.getCurrentStore();
    if (!customerName?.trim() || !/^[6-9]\d{9}$/.test(String(customerMobile || '').replace(/\D/g, ''))) {
      throw new Error('The original invoice must have a customer name and valid mobile number.');
    }
    const priorReturns = this.returns
      .filter(record => record.originalBillNumber === originalBillNumber)
      .flatMap(record => record.returnedItems)
      .reduce((quantities, item) => {
        const key = `${item.product.id}:${item.size}`;
        quantities[key] = (quantities[key] || 0) + item.quantity;
        return quantities;
      }, {});
    returnedItems.forEach(item => {
      const key = `${item.product.id}:${item.size}`;
      const originalItems = originalBill.items
        .filter(originalItem => originalItem.product.id === item.product.id && originalItem.size === item.size);
      const purchased = originalItems.reduce((sum, originalItem) => sum + originalItem.quantity, 0);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity + (priorReturns[key] || 0) > purchased) {
        throw new Error(`${item.product.name} return quantity exceeds the unreturned quantity on this invoice.`);
      }
      item.discountPercent = originalItems[0]?.discountPercent || 0;
    });
    const returnedQuantityByProduct = returnedItems.reduce((quantities, item) => {
      quantities[item.product.id] = (quantities[item.product.id] || 0) + item.quantity;
      return quantities;
    }, {});
    (newItems || []).forEach(item => {
      const sizes = item.product.availableSizes || item.product.sizes || [item.product.size].filter(Boolean);
      const typeLimit = Number(this.masterData.maxDiscountRules[item.product.category] ?? 15);
      const maxDiscount = Math.min(Number(item.product.maxDiscountPercent ?? typeLimit), typeLimit);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || !sizes.includes(item.size)) {
        throw new Error(`Choose a valid size and quantity for ${item.product.name}.`);
      }
      if (!Number.isFinite(Number(item.discountPercent)) || item.discountPercent < 0 || item.discountPercent > maxDiscount) {
        throw new Error(`Discount for ${item.product.name} cannot exceed ${maxDiscount}%.`);
      }
      if (this.getProductStock(item.product.id, store.id) + (returnedQuantityByProduct[item.product.id] || 0) < item.quantity) {
        throw new Error(`${item.product.name} does not have enough stock for this exchange.`);
      }
    });

    const returnCreditAmount = returnedItems.reduce((sum, item) =>
      sum + Math.round(item.product.price * item.quantity * (1 - (item.discountPercent || 0) / 100)), 0);
    const exchangeSubtotal = (newItems || []).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const exchangeDiscountAmount = (newItems || []).reduce((sum, item) =>
      sum + Math.round(item.product.price * item.quantity * (item.discountPercent || 0) / 100), 0);
    const exchangeAmount = exchangeSubtotal - exchangeDiscountAmount;
    const amountDue = exchangeAmount - returnCreditAmount;

    // 1. Put returned items back in stock
    returnedItems.forEach(item => {
      this.adjustStock(item.product.id, item.quantity, store.id);
    });

    // 2. If exchange, deduct new items from stock
    if (newItems && newItems.length > 0) {
      newItems.forEach(item => {
        this.adjustStock(item.product.id, -item.quantity, store.id);
      });
    }

    const returnRecord = {
      id: 'RET-' + Math.floor(1000 + Math.random() * 9000),
      originalBillNumber,
      storeId: store.id,
      storeName: store.name,
      storeCode: store.code,
      customerName,
      customerMobile,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      returnedItems,
      newItems: newItems || [],
      returnCreditAmount,
      exchangeAmount,
      netPayableOrRefund: amountDue
    };

    this.returns.unshift(returnRecord);
    const taxable = Math.round((exchangeAmount / 1.05) * 100) / 100;
    const gst = Math.round((exchangeAmount - taxable) * 100) / 100;
    const returnTaxable = Math.round((returnCreditAmount / 1.05) * 100) / 100;
    const returnGst = Math.round((returnCreditAmount - returnTaxable) * 100) / 100;
    const returnBill = {
      id: returnRecord.id,
      billNumber: returnRecord.id,
      billType: 'return-exchange',
      originalBillNumber,
      returnId: returnRecord.id,
      storeId: store.id,
      storeName: store.name,
      storeCode: store.code,
      storeAddress: store.address,
      storeGstin: store.gstin,
      salesmanId: this.currentUser?.id || 'USR-01',
      salesmanName: this.currentUser?.name || 'Staff',
      date: returnRecord.date,
      dateISO: new Date().toISOString(),
      time: returnRecord.time,
      customer: customerName,
      customerName,
      customerMobile,
      items: [
        ...returnedItems.map(item => ({ ...item, quantity: -item.quantity, returnLine: true })),
        ...(newItems || []).map(item => ({ ...item, returnLine: false }))
      ],
      itemsCount: returnedItems.reduce((sum, item) => sum + item.quantity, 0) + (newItems || []).reduce((sum, item) => sum + item.quantity, 0),
      subtotal: exchangeSubtotal,
      discountAmount: exchangeDiscountAmount,
      taxable,
      cgst: Math.round((gst / 2) * 100) / 100,
      sgst: Math.round((gst - Math.round((gst / 2) * 100) / 100) * 100) / 100,
      totalGst: gst,
      total: amountDue,
      grandTotal: amountDue,
      paymentMode: amountDue > 0 ? 'Exchange balance due' : amountDue < 0 ? 'Refund due' : 'Exchange',
      barcodePayload: `TARANGI-${store.code}-${returnRecord.id}`,
      returnDetails: {
        originalBillNumber,
        returnCreditAmount,
        returnTaxable,
        returnGst,
        exchangeSubtotal,
        exchangeDiscountAmount,
        exchangeAmount,
        netPayableOrRefund: amountDue,
        cgst: Math.round((gst / 2) * 100) / 100,
        sgst: Math.round((gst - Math.round((gst / 2) * 100) / 100) * 100) / 100
      }
    };
    this.recentBills.unshift(returnBill);
    this.playChime();
    this.notify();
    return { ...returnRecord, returnBill };
  }

  // Customer Management
  searchCustomers(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    const mobileQuery = q.replace(/\D/g, '');
    return this.customers.filter(c => 
      (c.name || '').toLowerCase().includes(q) ||
      (mobileQuery.length >= 2 && (c.mobile || '').replace(/\D/g, '').includes(mobileQuery))
    );
  }

  upsertCustomer(name, mobile) {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    let existing = this.customers.find(c => c.mobile.replace(/\D/g, '').slice(-10) === cleanMobile);
    if (existing) {
      existing.visits = (existing.visits || 1) + 1;
      existing.lastVisit = 'Today';
      if (name && name !== 'Walk-in Client') existing.name = name;
      return existing;
    } else {
      const newCust = {
        id: 'CUST-' + Math.floor(1000 + Math.random() * 9000),
        name: name.trim() || 'Valued Customer',
        mobile: cleanMobile || '9800000000',
        visits: 1,
        totalSpent: 0,
        lastVisit: 'Today'
      };
      this.customers.unshift(newCust);
      return newCust;
    }
  }

  // Master Data Additions
  addMasterDataItem(type, value) {
    if (!this.masterData[type]) this.masterData[type] = [];
    const trimmed = value.trim();
    if (trimmed && !this.masterData[type].includes(trimmed)) {
      this.masterData[type].push(trimmed);
      if (type === 'categories') this.masterData.maxDiscountRules[trimmed] ??= 15;
      this.playChime();
      this.notify();
    }
  }

  setCategoryDiscountLimit(category, value) {
    this.masterData.maxDiscountRules[category] = value;
    this.notify();
  }

  // Attendance
  checkInAttendance(userId = this.currentUser?.id) {
    if (!userId) return;
    const user = this.staffUsers.find(u => u.id === userId);
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const existing = this.attendance.find(a => a.userId === userId && a.date === today);
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (existing) {
      existing.checkInTime = nowTime;
      existing.status = 'Checked In';
    } else {
      this.attendance.unshift({
        id: 'ATT-' + Math.floor(100 + Math.random() * 900),
        userId: user.id,
        userName: user.name,
        storeId: this.currentStoreId,
        date: today,
        checkInTime: nowTime,
        checkOutTime: null,
        status: 'Checked In',
        shift: 'Floor Shift'
      });
    }
    this.playChime();
    this.notify();
  }

  checkOutAttendance(userId = this.currentUser?.id) {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const rec = this.attendance.find(a => a.userId === userId && a.date === today);
    if (rec) {
      rec.checkOutTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      rec.status = 'Checked Out';
      this.playChime();
      this.notify();
    }
  }

  // Expenses
  addExpense(expense) {
    const store = this.getCurrentStore();
    this.expenses.unshift({
      id: 'EXP-' + Math.floor(100 + Math.random() * 900),
      storeId: store.id,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      dateISO: new Date().toISOString(),
      ...expense
    });
    this.playChime();
    this.notify();
  }

  updateExpense(expenseId, updates) {
    const expense = this.expenses.find(item => item.id === expenseId);
    if (!expense) throw new Error('Expense entry not found.');
    Object.assign(expense, updates);
    this.notify();
  }

  deleteExpense(expenseId) {
    const originalLength = this.expenses.length;
    this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
    if (this.expenses.length === originalLength) throw new Error('Expense entry not found.');
    this.notify();
  }
}

export const State = new StateManager();
