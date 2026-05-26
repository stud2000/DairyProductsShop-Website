// Sidebar mobile toggle
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// Auto-dismiss flash
setTimeout(() => {
  document.querySelectorAll('.flash').forEach(el => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  });
}, 4000);

// Delete confirmation
document.querySelectorAll('[data-confirm]').forEach(btn => {
  btn.addEventListener('click', function (e) {
    if (!confirm(this.dataset.confirm || 'Are you sure?')) e.preventDefault();
  });
});

// Variant rows
let variantCount = document.querySelectorAll('.variant-row').length;

function addVariantRow() {
  variantCount++;
  const container = document.getElementById('variantsContainer');
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = `
    <input type="text" name="quantity" placeholder="e.g. 500ml, 1kg" required>
    <input type="number" name="price" placeholder="Price (₹)" step="0.01" min="0" required>
    <button type="button" class="btn-remove-variant" onclick="removeVariant(this)">✕</button>
  `;
  container.appendChild(row);
}

function removeVariant(btn) {
  const rows = document.querySelectorAll('.variant-row');
  if (rows.length > 1) btn.parentElement.remove();
  else alert('At least one variant is required.');
}

// Image preview
const imgInput = document.getElementById('imageInput');
const imgPreview = document.getElementById('imgPreview');
const uploadZone = document.getElementById('uploadZone');

if (imgInput) {
  imgInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        imgPreview.src = e.target.result;
        imgPreview.style.display = 'block';
        uploadZone.querySelector('p').textContent = this.files[0].name;
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

if (uploadZone) {
  uploadZone.addEventListener('click', () => imgInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = '#5C3D1E'; });
  uploadZone.addEventListener('dragleave', () => uploadZone.style.borderColor = '');
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    if (e.dataTransfer.files[0]) {
      imgInput.files = e.dataTransfer.files;
      imgInput.dispatchEvent(new Event('change'));
    }
  });
}

// Toggle availability via AJAX
document.querySelectorAll('.avail-toggle').forEach(toggle => {
  toggle.addEventListener('change', async function () {
    const productId = this.dataset.id;
    try {
      const res = await fetch(`/admin/products/${productId}/toggle`, { method: 'POST' });
      const data = await res.json();
      const badge = document.querySelector(`[data-badge="${productId}"]`);
      if (badge) {
        badge.textContent = data.isAvailable ? 'Available' : 'Unavailable';
        badge.className = `badge ${data.isAvailable ? 'badge-success' : 'badge-danger'}`;
      }
    } catch (e) { console.error(e); }
  });
});

// Animate category bars on load
window.addEventListener('load', () => {
  document.querySelectorAll('.cat-bar-fill').forEach(bar => {
    const w = bar.dataset.width;
    setTimeout(() => bar.style.width = w + '%', 300);
  });
});
