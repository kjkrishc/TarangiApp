# Tarangi Retail POS — Technical and Functional Guide

## 1. Purpose and scope

Tarangi is a browser-based, single-page retail point-of-sale application for garment and innerwear stores. It combines staff sign-in, store selection, product and stock administration, concurrent POS drafts, billing, returns/exchanges, expenses, attendance, printable invoices, barcode labels, and management reports.

This guide describes the implementation in this repository. It is not a specification for functionality that is not currently present. In particular, the application currently runs without a server-side API or database; operational records are kept in the browser's local storage.

## 2. Functional overview

### 2.1 Sign-in, roles, and stores

- Users sign in from the initial login screen by choosing a staff account and entering a PIN.
- A newly added account with no PIN is prompted to set and confirm a 4–8 digit PIN at first sign-in.
- Admin and sales staff have different navigation menus. Admin has Dashboard, Inventory, POS, Reports, Expenses, and Master. Sales staff have Billing, Stock, Attendance, and Expenses.
- An active store is selected from the header. A staff account can be associated with a store; signing in selects that store.
- An active user can be switched, or the register can be signed out, from the user control in the header.
- The demo seed data includes accounts and products. Seed credentials are development/demo data and should not be used as production credentials.

### 2.2 Customers and concurrent bills

- POS customer lookup accepts at least two characters and searches customer names and mobile digits. Up to eight matches are shown with each customer's phone number and visit count.
- Selecting a suggestion fills the active bill's customer details.
- Search results are suggestions; staff can enter a name and phone directly instead. Exact name matches do not block suggestions or manual entry, so a different person with the same name can be billed using their own mobile number.
- Checkout requires a non-empty customer name and a valid 10-digit Indian mobile number beginning with 6–9. The same rule is enforced by both the POS interaction and the state-layer checkout method.
- The customer registry is matched by normalized mobile number, not name. A different mobile number creates a separate customer entry, even when the name is identical.
- Multiple independent draft bills can be open at once. Staff can create a new draft, switch between drafts, and discard a draft after confirmation. Drafts and their customer/cart data persist in the browser.

### 2.3 Product search, cart, discounts, and payment

- POS search matches product name or SKU and displays up to eight suggestions. Choosing a suggestion opens the product's size picker; choosing a size adds the item to the active draft. Enter submits the first matching product.
- Barcode scanning can also resolve a product and open the size picker. The scanner accepts catalog SKU/ID values and the SKU-plus-size barcode payload used on retail tags.
- Cart rows support quantity increments/decrements, removal, clear-cart, and per-item discount entry.
- The effective discount ceiling is the lower of the product maximum and category maximum. State logic clamps requested line discounts to that ceiling.
- Stock validation checks the product's aggregate on-hand units for the active store against the quantity in the bill. Stock is reduced when the sale is completed.
- Product MRP is treated as GST-inclusive. Taxable value and the 5% total GST are calculated backwards from the post-discount payable amount; CGST and SGST split the total equally, with rounding to two decimal places.
- Payment choices are UPI, Card, and Cash. UPI opens a simulated payment confirmation; it does not connect to a payment provider. Card and Cash complete directly.
- Checkout creates a store-prefixed invoice number and printable invoice, and adds the transaction to recent bills.

### 2.4 Returns and exchanges

- Return/exchange search locates completed original invoices by customer name or phone.
- The selected invoice shows each purchased line and the remaining returnable quantity. Previously returned quantities are subtracted before further returns are allowed.
- Staff enter quantities to return, optionally choose an exchange product and size, and may apply an exchange-line discount subject to the configured product/category limit.
- Returned items are credited at their original billed discount percentage. The exchange item's amount is calculated after its entered discount. The difference is represented as balance due, refund due, or even exchange.
- A return/exchange record and a printable return invoice are created. The receipt identifies the original invoice and return reference and displays return credit, exchange subtotal/discount, included GST information, and net amount.
- Inventory is adjusted in the original invoice's store: returned quantity is added and exchange quantity is deducted. The exchange stock check accounts for units returned in the same operation.
- Returned quantity cannot exceed the unreturned purchased quantity for a product and size.

### 2.5 Inventory and barcode labels

- Inventory supports product name/SKU/craft/color search, category filters, and All/In Stock/Low Stock/Out of Stock views for the active store.
- Inventory cards display current-store stock, price, sizes, and (for admins) stock by each configured store.
- Admins can add products and edit/delete existing products. Product entry includes name, category, innerwear subtype, color, available sizes, MRP, current-store stock, craft/type, optional image, and maximum discount percentage.
- Product images are optional data URLs in local storage. The UI accepts image files up to 1 MiB.
- Stock increment/decrement controls support manual restocking/adjustment. Product price changes are made through product editing.
- Admins can generate labels for selected available sizes and a chosen number of copies per size (1–100). A label contains brand, product/category, size, color, MRP, tax-included text, and a Code 128 barcode value based on SKU and normalized size.
- Invoices also show a Code 128 barcode. New sale payloads use `TARANGI-{store code}-{invoice sequence}`; return invoice payloads use `TARANGI-{store code}-{return ID}`.
- The label's “Download Label” action currently confirms preparation via a toast; it does not download a file. Printing uses the browser's print dialog.

### 2.6 Master data administration

The admin Master screen has Categories, Sizes, Stores, and Staff tabs.

- Categories may be added, renamed, deleted when no product references them, and assigned a maximum discount from 0–100%.
- Sizes may be added, renamed, or deleted when no product references them.
- Stores may be added, edited, or deleted subject to safety checks. The app prevents deleting the last store, the active store, a store assigned to staff, or a store with remaining product stock. Store codes are unique and must be 2–4 letters/numbers.
- Staff accounts may be added with name, role, designation, and store. The first PIN is set at first sign-in. Accounts may be deleted subject to safeguards against deleting the current user or the last admin.
- Store and staff administration is browser-local; there is no central account synchronization.

### 2.7 Expenses, attendance, and reports

- Expenses are recorded per active store with title, category, amount, and payment method (Cash or UPI). The predefined categories include an Other option with a required free-text category.
- Expense records can be edited or deleted.
- The Expenses screen shows an expense log and a cash drawer reconciliation display.
- Staff can punch in and punch out. Attendance records are stored by user and date; the attendance screen also displays the staff roster.
- Reports have Sales, Stock Audit, and Expenses tabs; a date selector for Daily, Monthly, Quarterly, and Yearly periods; a store filter for one store or all stores; and a print action.
- Sales reports summarize bills in the selected interval, average invoice amount, tender totals, and invoice rows. Stock reports show unit counts, MRP/cost valuation, low-stock products, and category allocation. Expense reports summarize expenses and list entries in the selected interval.

## 3. Main user flows

### Complete a sale

1. Sign in and confirm the active store.
2. Open POS and use an existing bill or create a new one.
3. Search for a customer or enter a new customer's name and phone.
4. Search/type a SKU or product name, or scan a barcode.
5. Select a size, review quantities and discounts, and choose a payment method.
6. Select **Complete**. UPI requires the simulated payment confirmation.
7. Review or print the generated invoice.

### Process a return or exchange

1. Open **Return / Exchange** from POS.
2. Search for the original bill using the customer's name or mobile.
3. Select the bill, enter return quantities, and optionally choose an exchange product, size, and discount.
4. Process the transaction. The return record and stock changes are saved, then the return invoice opens for review/printing.

### Add a product

1. As an admin, open Inventory and choose **Add Product**.
2. Enter the product data and select one or more sizes.
3. Set MRP, initial stock for the active store, and the product discount ceiling.
4. Optionally select an image (maximum 1 MiB).
5. Save. The new product is added and the barcode label modal opens.

## 4. Technical architecture

### 4.1 Runtime and dependencies

- **Application type:** Vite single-page application using native JavaScript modules and browser DOM APIs.
- **UI:** HTML templates are assembled and inserted by screen/component functions; event listeners are attached after rendering.
- **Styling:** One shared stylesheet, `src/style.css`, with responsive layout rules and design tokens.
- **Barcode library:** `jsbarcode` creates standards-compliant Code 128 SVG output.
- **Build scripts:** `npm run dev`, `npm run build`, and `npm run preview`.
- There is no client-side framework, router, API client, server, or automated test command configured in `package.json`.

### 4.2 Source layout

| Path | Responsibility |
|---|---|
| `src/main.js` | App shell, sign-in screen, navigation, store/user controls, global events, and screen dispatch |
| `src/state.js` | Seed data, persistent state, business rules, customer registry, bills, inventory, returns, attendance, master data, and expenses |
| `src/screens/pos.js` | Concurrent bill drafts, customer lookup, product search, cart, payment, and return/exchange UI |
| `src/screens/inventory.js` | Product catalog, filters, stock controls, product form, and product actions |
| `src/screens/masterData.js` | Admin CRUD for categories, sizes, stores, and staff accounts |
| `src/screens/expenses.js` | Store expense entry, edit/delete, and cash drawer display |
| `src/screens/reports.js` | Date/store filters and sales, stock, and expense report views |
| `src/screens/attendance.js` | Staff punch-in/out and roster |
| `src/screens/dashboard.js` | Store metrics, operational shortcuts, and low-stock section |
| `src/components/loginModal.js` | In-session user switch/sign-out modal |
| `src/components/scannerModal.js` | Camera/manual/sample barcode scanner UI |
| `src/components/barcodeGenerator.js` | Code 128 generation and retail tag modal |
| `src/components/receiptModal.js` | Printable sale and return/exchange invoices |
| `src/icons.js` | Shared inline SVG icons |
| `src/style.css` | Shared design system and responsive components |

### 4.3 State and persistence

`State` is a singleton instance of `StateManager` in `src/state.js`. Screens call state methods directly. Mutations generally call `notify()`, which persists state and notifies subscribers; the app shell subscribes and refreshes header, navigation, and active screen. Customer field changes can persist without a full rerender to preserve input interaction.

The serialized record is stored in browser `localStorage` under `tarangi_retail_suite_v3`. It includes:

- stores and active store ID;
- staff users and active tab (login state is reset on reload);
- master data and category discount rules;
- products and store stock;
- customers;
- attendance and expenses;
- recent bills and return records;
- open bill drafts and active draft ID.

If no saved record is present, the app initializes from in-code sample stores, staff, products, customers, attendance, and expenses. The first-run state includes example sales data. Browser storage is origin- and browser-profile-specific; clearing site data removes the locally stored business state.

### 4.4 Important data shapes

- **Store:** `id`, `name`, `code`, `address`, `phone`, `gstin`.
- **User:** `id`, `name`, `role`, `pin`, `designation`, `storeId`.
- **Product:** `id`, `sku`, `name`, `category`, `subType`/`craft`, color attributes, `price`, `costPrice`, `availableSizes`, `maxDiscountPercent`, `threshold`, optional `imageDataUrl`, and `stockPerStore`.
- **Draft bill:** `id`, `title`, `customer { name, mobile }`, `items[]`, `createdAt`.
- **Bill line:** `product`, `size`, `quantity`, `discountPercent`.
- **Sale invoice:** invoice/store/customer/tender metadata, bill lines, subtotal/discount/tax totals, and barcode payload.
- **Return record:** original bill/store/customer references, returned lines, exchanged lines, return credit, exchange amount, and net due/refund.
- **Expense:** `id`, `storeId`, `title`, `category`, `amount`, `paidVia`, `time`, `dateISO`.
- **Attendance:** `id`, `userId`, `userName`, `storeId`, date, in/out times, and status.

### 4.5 State and UI events

The main shell listens for the following window events:

- `open-barcode-scanner` — opens the scanner.
- `show-receipt-modal` — opens a sale or return invoice.
- `show-toast` — displays a temporary status/error message.

The state observer is used to redraw the header, role-appropriate navigation, and active screen after state changes.

## 5. Business rules and calculations

### Customer identity

- Mobile digits are normalized before customer lookup.
- A checkout mobile must match `^[6-9][0-9]{9}$` after stripping non-digits.
- Existing customers are looked up by mobile, not by name. Same-name customers with distinct mobiles are separate records.

### Discounts and tax

- Sale line net = rounded line MRP less the line discount.
- Bill subtotal is the sum of undiscounted line MRP.
- GST rate is currently fixed at 5%, assumed intra-state, and included in selling prices.
- Taxable value = net payable / 1.05; total GST is the difference between net payable and taxable value, split into CGST/SGST.

### Stock

- Quantity is stored at product/store level, not at product/store/size level.
- Size is captured on the invoice line and used to validate how many units of that line may be returned, but a size-specific stock count is not maintained.
- Stock adjustments are bounded below by zero. Sale checkout checks total required quantity per product at the current store.

### Returns

- Return quantity is capped by original purchased quantity less prior returns for the same product and size.
- Return credit uses the original line's discount percentage.
- Exchange totals use the current exchange product price and entered discount.
- Return invoice net = exchange amount minus return credit. A negative amount indicates refund due; a positive amount indicates balance due.

## 6. Build, run, and validate

Prerequisite: install a supported Node.js runtime and npm.

```powershell
npm install
npm run dev
```

Build and preview:

```powershell
npm run build
npm run preview
```

`npm run build` is the configured production compilation check. JavaScript syntax can be checked with `node --check <file>`. There is no configured unit-test or end-to-end test script in the package manifest.

## 7. Current implementation boundaries

The following behaviors are important when evaluating the app for live retail use:

1. **Browser-local data only:** There is no central database, multi-device synchronization, backup service, or server API. Multiple registers do not share updates.
2. **PIN storage/security:** PINs and business data are persisted in local storage in readable client-side form. There is no server authentication, password hashing, session service, authorization boundary, or audit log. Role checks are client-side UI/business rules and should not be treated as a production security boundary.
3. **Demo values:** Initial product/customer/expense/sales data are sample data. Dashboard headline sales and bill count include fixed demo offsets; the expense cash drawer display also uses fixed sample float/sales values. These are not a verified accounting close.
4. **Payment processing:** UPI success is simulated. Card and cash are recorded as selected tenders, but no external payment gateway or terminal is integrated.
5. **Inventory granularity:** Stock is product/store aggregate stock. It is not tracked by size or barcode-tag instance. Returns restore the aggregate count.
6. **Tax configuration:** The GST calculation is hard-coded at 5% with an equal CGST/SGST split and is not configured by product HSN, jurisdiction, tax slab, or tax registration rules.
7. **Invoice and return semantics:** Return/exchange records are local transaction records. Refund disbursement and exchange balance collection are not connected to payment systems.
8. **Barcode output:** Barcode SVGs encode Code 128 values, and print invokes the browser print dialog. The label download action is only a preparation notification; direct file export is not implemented.
9. **Store metadata:** Store creation currently generates a placeholder-format GSTIN from the current store count; it is not a GSTIN validation or registration service.
10. **Operational reporting:** Reports summarize local saved bills, current local stock, and local expense entries. They are not reconciled with an external accounting or inventory system.

Before deployment for live operations, provide a backend with authenticated users and authorization, durable shared storage, audit/history controls, verified tax and invoice requirements, production payment/refund integrations, backups, and appropriate monitoring.
