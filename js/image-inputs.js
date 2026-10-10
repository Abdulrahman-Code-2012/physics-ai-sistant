// Image attachments for the Syllabus Questions page.
// Paste, camera captures, and multiple selected photos are folded into one image
// so the existing ai-route imageUrl flow continues to work unchanged.
const style = document.createElement('style');
style.textContent = [
  '.image-extra-actions{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}',
  '.image-extra-actions button{border:1px solid var(--line,#d0d5dd);background:var(--panel,#fff);color:inherit;border-radius:10px;padding:10px 12px;font:inherit;font-weight:700;cursor:pointer}',
  '.image-extra-actions button:hover{border-color:var(--blue,#3559a8)}',
  '.image-paste-hint{font-size:12px;color:var(--muted,#667085);margin:4px 0 8px;line-height:1.45}',
  '.image-attachment-preview{font-size:13px;margin:6px 0 10px;color:var(--muted,#667085)}',
  '.camera-layer{position:fixed;inset:0;z-index:10000;background:rgba(10,18,32,.78);display:grid;place-items:center;padding:18px}',
  '.camera-card{width:min(680px,100%);background:#fff;color:#101828;border-radius:16px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.25)}',
  '.camera-card h2{font-size:20px;margin:0 0 12px}.camera-video{width:100%;max-height:65vh;background:#111;border-radius:12px;object-fit:contain}',
  '.camera-message{font-size:13px;color:#667085;margin:10px 0}.camera-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}',
  '.camera-actions button{border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#101828;padding:10px 14px;font:inherit;font-weight:700;cursor:pointer}',
  '.camera-actions .camera-capture{background:#101828;color:#fff;border-color:#101828}'
].join('\n');
document.head.append(style);

let cameraLayer = null;
let cameraStream = null;
let cameraBusy = false;
const MAX_PHOTOS = 8;

function setInputFiles(input, files) {
  const transfer = new DataTransfer();
  files.forEach(file => transfer.items.add(file));
  input.files = transfer.files;
}

function setStatus(input, message) {
  const status = document.querySelector('#syImageStatus');
  if (status) status.textContent = message;
  let preview = document.querySelector('#syImagePreview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'syImagePreview';
    preview.className = 'image-attachment-preview';
    const label = document.querySelector('label[for="syImage"]');
    if (label) label.insertAdjacentElement('afterend', preview);
  }
  if (preview) preview.textContent = message;
}

function addPhoto(input, file) {
  if (!input || !file || !file.type.startsWith('image/')) return;
  const current = Array.from(input.files || []);
  const count = Number(input.dataset.sourceCount || current.length || 0);
  if (count >= MAX_PHOTOS) {
    setStatus(input, 'Maximum ' + MAX_PHOTOS + ' photos per question. Clear the selection to start again.');
    return;
  }
  const safeName = file.name || ('physics-question-' + (count + 1) + '.png');
  const copy = new File([file], safeName, { type: file.type, lastModified: Date.now() });
  current.push(copy);
  input.dataset.sourceCount = String(count + 1);
  input.dataset.internalChange = '1';
  setInputFiles(input, current);
  input.dispatchEvent(new Event('change', { bubbles: true }));
  setStatus(input, '✓ ' + input.dataset.sourceCount + ' photo' + (Number(input.dataset.sourceCount) === 1 ? '' : 's') + ' attached');
  if (current.length > 1) combinePhotos(input, current).catch(error => {
    console.error('Could not combine question photos:', error);
    setStatus(input, 'Photos selected, but combining failed. Please try fewer/smaller photos.');
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read one of the selected photos.')); };
    img.src = url;
  });
}

async function combinePhotos(input, files) {
  if (input.dataset.combining === '1') return;
  input.dataset.combining = '1';
  const photoCount = Number(input.dataset.sourceCount || files.length);
  const askButton = document.querySelector('#askSyllabus');
  const askWasDisabled = askButton?.disabled || false;
  if (askButton) askButton.disabled = true;
  setStatus(input, 'Preparing ' + photoCount + ' photos…');
  try {
    const images = await Promise.all(files.map(loadImage));
    const maxWidth = 1600;
    const gap = 24;
    const rendered = images.map(img => {
      const scale = Math.min(1, maxWidth / img.naturalWidth, 1800 / img.naturalHeight);
      return { img, width: Math.max(1, Math.round(img.naturalWidth * scale)), height: Math.max(1, Math.round(img.naturalHeight * scale)) };
    });
    const width = Math.max(...rendered.map(item => item.width));
    const height = rendered.reduce((sum, item) => sum + item.height, 0) + gap * (rendered.length - 1);
    if (height > 14000) throw new Error('Combined image is too tall; choose fewer or smaller photos.');
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    let y = 0;
    rendered.forEach((item, index) => {
      if (index) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, y, width, gap);
        y += gap;
      }
      ctx.drawImage(item.img, 0, y, item.width, item.height);
      y += item.height;
    });
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image processing failed.')), 'image/jpeg', 0.88));
    const combined = new File([blob], 'physics-question-' + photoCount + '-photos.jpg', { type: 'image/jpeg', lastModified: Date.now() });
    input.dataset.internalChange = '1';
    setInputFiles(input, [combined]);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    setStatus(input, '✓ ' + photoCount + ' photos attached together — ready to ask Gemini');
  } finally {
    input.dataset.combining = '0';
    if (askButton) askButton.disabled = askWasDisabled;
  }
}

function enhanceImageInput() {
  const input = document.querySelector('#syImage');
  if (!input || input.dataset.imageExtrasReady === 'true') return;
  const label = document.querySelector('label[for="syImage"]');
  if (!label) return;
  input.dataset.imageExtrasReady = 'true';
  input.multiple = true;
  input.setAttribute('accept', 'image/*');
  input.addEventListener('change', () => {
    if (input.dataset.internalChange === '1') {
      input.dataset.internalChange = '0';
      return;
    }
    let files = Array.from(input.files || []);
    if (files.length > MAX_PHOTOS) {
      files = files.slice(0, MAX_PHOTOS);
      setInputFiles(input, files);
    }
    if (!files.length) {
      input.dataset.sourceCount = '0';
      setStatus(input, 'No image selected.');
      return;
    }
    input.dataset.sourceCount = String(files.length);
    setStatus(input, '✓ ' + files.length + ' photo' + (files.length === 1 ? '' : 's') + ' selected');
    if (files.length > 1) combinePhotos(input, files).catch(error => {
      console.error(error);
      setStatus(input, 'Could not combine photos: ' + error.message);
    });
  });
  const actions = document.createElement('div');
  actions.className = 'image-extra-actions';
  const pasteButton = document.createElement('button');
  pasteButton.type = 'button';
  pasteButton.textContent = '▣ Paste image (Ctrl + V)';
  pasteButton.addEventListener('click', () => {
    setStatus(input, 'Copy a picture, then press Ctrl + V on this page.');
    document.querySelector('#syQuestion')?.focus();
  });
  const cameraButton = document.createElement('button');
  cameraButton.type = 'button';
  cameraButton.textContent = '◎ Capture with camera';
  cameraButton.addEventListener('click', openCamera);
  actions.append(pasteButton, cameraButton);
  label.insertAdjacentElement('afterend', actions);
  const hint = document.createElement('p');
  hint.className = 'image-paste-hint';
  hint.textContent = 'Select up to ' + MAX_PHOTOS + ' photos, or copy and paste pictures with Ctrl + V. Photos are combined and sent with your question.';
  actions.insertAdjacentElement('afterend', hint);
}

async function openCamera() {
  if (cameraBusy) return;
  cameraBusy = true;
  if (!navigator.mediaDevices?.getUserMedia) {
    alert('Camera capture needs HTTPS and a supported browser. You can still upload or paste images.');
    cameraBusy = false;
    return;
  }
  cameraLayer = document.createElement('div');
  cameraLayer.className = 'camera-layer';
  cameraLayer.innerHTML = '<section class="camera-card" role="dialog" aria-modal="true" aria-labelledby="cameraTitle"><h2 id="cameraTitle">Capture your Physics question</h2><video class="camera-video" autoplay playsinline muted></video><p class="camera-message">Allow camera access, point at the question, then capture the photo. You can capture several photos before closing.</p><div class="camera-actions"><button type="button" class="camera-capture">Capture photo</button><button type="button" class="camera-close">Done</button></div></section>';
  document.body.append(cameraLayer);
  const video = cameraLayer.querySelector('video');
  const message = cameraLayer.querySelector('.camera-message');
  cameraLayer.querySelector('.camera-close').addEventListener('click', closeCamera);
  cameraLayer.addEventListener('click', event => { if (event.target === cameraLayer) closeCamera(); });
  cameraLayer.querySelector('.camera-capture').addEventListener('click', () => {
    if (!video.videoWidth || !video.videoHeight) {
      message.textContent = 'Camera is not ready yet. Please wait a moment.';
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) { message.textContent = 'Could not capture the photo. Please try again.'; return; }
      addPhoto(document.querySelector('#syImage'), new File([blob], 'camera-physics-question.jpg', { type: 'image/jpeg' }));
      message.textContent = 'Photo captured. You can capture another or press Done.';
    }, 'image/jpeg', 0.9);
  });
  try {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    } catch {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    if (!cameraLayer || !video.isConnected) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
      return;
    }
    video.srcObject = cameraStream;
    await video.play();
  } catch (error) {
    message.textContent = 'Camera unavailable: ' + (error.message || 'permission denied') + '. Check browser permissions or use upload/paste.';
  } finally {
    cameraBusy = false;
  }
}

function closeCamera() {
  if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
  cameraStream = null;
  cameraLayer?.remove();
  cameraLayer = null;
  cameraBusy = false;
}

document.addEventListener('paste', event => {
  const input = document.querySelector('#syImage');
  if (!input) return;
  const items = Array.from(event.clipboardData?.items || []);
  const item = items.find(entry => entry.kind === 'file' && entry.type.startsWith('image/'));
  const file = item?.getAsFile();
  if (!file) return;
  event.preventDefault();
  addPhoto(input, file);
});

const observer = new MutationObserver(enhanceImageInput);
observer.observe(document.documentElement, { childList: true, subtree: true });
enhanceImageInput();
