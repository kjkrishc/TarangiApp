// Component: Real Mobile Camera Barcode / SKU Scanner Viewfinder
import { State } from '../state.js';
import { Icons } from '../icons.js';

let activeMediaStream = null;

export function openBarcodeScannerModal() {
  const existing = document.getElementById('modal-scanner');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-scanner';

  modal.innerHTML = `
    <div class="modal-sheet" style="padding-bottom:24px;">
      <div class="modal-drag-handle"></div>
      <div class="modal-header-row">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="color:var(--color-primary);">${Icons.camera(20)}</span>
          <h3 class="modal-title">Live Camera Barcode Scanner</h3>
        </div>
        <button class="icon-btn-ghost modal-close-btn" style="width:32px; height:32px;">${Icons.x(16)}</button>
      </div>

      <!-- Real Video / Camera Stream Viewfinder -->
      <div class="scanner-viewfinder-box" id="camera-viewport-box">
        <video id="scanner-video-feed" autoplay playsinline muted style="width:100%; height:100%; object-fit:cover; position:absolute; inset:0;"></video>
        
        <div class="scanner-crosshairs"></div>
        <div class="scanner-laser-line"></div>
        
        <div id="camera-status-overlay" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(18,15,16,0.85); color:#fff; text-align:center; padding:16px;">
          <span style="color:var(--color-tertiary); margin-bottom:8px;">${Icons.camera(28)}</span>
          <div style="font-size:12px; font-weight:600; margin-bottom:4px;" id="camera-status-msg">Requesting Camera Access...</div>
          <button id="btn-request-cam-perm" class="btn-primary" style="height:32px; font-size:11px; padding:0 12px; margin-top:6px;">
            Enable Mobile Camera
          </button>
        </div>

        <!-- Torch / Flash toggle if supported -->
        <button id="btn-toggle-torch" class="icon-btn-ghost" style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.5); color:#fff; border:none; z-index:10; display:none;">
          ${Icons.flash(16)}
        </button>

        <div style="position:absolute; bottom:10px; color:rgba(255,255,255,0.85); font-size:10px; font-family:var(--font-mono); z-index:10; background:rgba(0,0,0,0.6); padding:2px 8px; border-radius:4px;">
          ALIGN GARMENT TAG WITHIN RED RETICLE
        </div>
      </div>

      <div style="text-align:center; font-size:11px; color:var(--text-muted); margin-bottom:10px;">
        Tap sample garment tag to simulate quick capture:
      </div>

      <!-- Quick Test Barcodes of Current Stock -->
      <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto; margin-bottom:12px;">
        ${State.products.slice(0, 5).map(prod => `
          <button class="btn-secondary mock-scan-tag-btn" data-sku="${prod.sku}" style="justify-content:space-between; height:34px; padding:0 10px; font-size:11px;">
            <span style="font-family:var(--font-mono); font-weight:700; color:var(--color-primary);">${prod.sku}</span>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; color:var(--text-main); font-weight:500;">
              ${prod.name}
            </span>
            <span style="font-family:var(--font-mono); font-weight:700;">₹${prod.price.toLocaleString('en-IN')}</span>
          </button>
        `).join('')}
      </div>

      <div style="display:flex; gap:8px;">
        <input 
          type="text" 
          id="manual-barcode-input" 
          class="form-control" 
          placeholder="Or enter SKU (e.g. TRG-KRT-4091)" 
          style="font-family:var(--font-mono); font-size:12px; height:38px;"
        />
        <button id="btn-manual-barcode-submit" class="btn-primary" style="height:38px; padding:0 14px; font-size:12px;">
          Detect
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const videoEl = modal.querySelector('#scanner-video-feed');
  const statusOverlay = modal.querySelector('#camera-status-overlay');
  const statusMsg = modal.querySelector('#camera-status-msg');
  const torchBtn = modal.querySelector('#btn-toggle-torch');

  const stopStream = () => {
    if (activeMediaStream) {
      activeMediaStream.getTracks().forEach(track => track.stop());
      activeMediaStream = null;
    }
  };

  const closeModal = () => {
    stopStream();
    modal.remove();
  };

  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Request real camera
  async function startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        statusMsg.textContent = 'Camera API not supported in browser environment';
        return;
      }
      statusMsg.textContent = 'Connecting to camera...';
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      activeMediaStream = stream;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play();
        statusOverlay.style.display = 'none';
      }

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        torchBtn.style.display = 'inline-flex';
        let torchOn = false;
        torchBtn.addEventListener('click', () => {
          torchOn = !torchOn;
          track.applyConstraints({ advanced: [{ torch: torchOn }] });
        });
      }

      // If Native BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['code_128', 'qr_code', 'ean_13'] });
        const scanLoop = async () => {
          if (!activeMediaStream || !modal.isConnected) return;
          try {
            const barcodes = await barcodeDetector.detect(videoEl);
            if (barcodes.length > 0) {
              const detected = barcodes[0].rawValue;
              handleScanMatch(detected);
              return;
            }
          } catch (e) {}
          requestAnimationFrame(scanLoop);
        };
        requestAnimationFrame(scanLoop);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      statusMsg.textContent = 'Camera unavailable or permission denied. Use sample tags below.';
    }
  }

  modal.querySelector('#btn-request-cam-perm')?.addEventListener('click', startCamera);
  // Auto-attempt start
  startCamera();

  const handleScanMatch = (sku) => {
    const prod = State.products.find(p => p.sku.toLowerCase() === sku.toLowerCase() || p.id.toLowerCase() === sku.toLowerCase());
    if (prod) {
      State.addToCart(prod);
      closeModal();
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Scanned & added ${prod.name} to Cart!`, type: 'success' }
      }));
      if (State.activeTab !== 'pos') {
        State.setActiveTab('pos');
      }
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `SKU '${sku}' not found in catalog`, type: 'alert' }
      }));
    }
  };

  modal.querySelectorAll('.mock-scan-tag-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sku = e.currentTarget.dataset.sku;
      handleScanMatch(sku);
    });
  });

  modal.querySelector('#btn-manual-barcode-submit')?.addEventListener('click', () => {
    const val = modal.querySelector('#manual-barcode-input').value.trim();
    if (val) handleScanMatch(val);
  });
}
