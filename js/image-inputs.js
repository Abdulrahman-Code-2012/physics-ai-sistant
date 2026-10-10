// Image attachments for the Syllabus Questions page.
// Supports file selection, Ctrl+V paste, camera capture, photo previews,
// individual delete buttons, and up to 8 photos per question.
const style = document.createElement('style');
style.textContent = `
.image-extra-actions{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.image-extra-actions button{border:1px solid var(--line,#d0d5dd);background:var(--panel,#fff);color:inherit;border-radius:10px;padding:10px 12px;font:inherit;font-weight:700;cursor:pointer}
.image-extra-actions button:hover{border-color:var(--blue,#3559a8)}
.image-paste-hint{font-size:12px;color:var(--muted,#667085);margin:4px 0 8px;line-height:1.45}
.image-attachment-preview{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin:8px 0 12px}
.image-preview-card{position:relative;border:1px solid var(--line,#d0d5dd);border-radius:12px;background:var(--panel,#fff);padding:6px;overflow:hidden}
.image-preview-card img{display:block;width:100%;height:110px;object-fit:contain;border-radius:8px;background:#f5f6f8}
.image-preview-card .image-preview-number{font-size:11px;color:var(--muted,#667085);padding:5px 3px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.image-preview-delete{position:absolute;right:9px;top:9px;border:0!important;border-radius:999px!important;width:30px;height:30px;padding:0!important;background:#fff!important;color:#b42318!important;box-shadow:0 2px 8px rgba(0,0,0,.18);font-size:18px;line-height:1;cursor:pointer}
.image-preview-delete:hover{background:#fef3f2!important}
.camera-layer{position:fixed;inset:0;z-index:10000;background:rgba(10,18,32,.78);display:grid;place-items:center;padding:18px}
.camera-card{width:min(680px,100%);background:#fff;color:#101828;border-radius:16px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.camera-card h2{font-size:20px;margin:0 0 12px}.camera-video{width:100%;max-height:65vh;background:#111;border-radius:12px;object-fit:contain}.camera-message{font-size:13px;color:#667085;margin:10px 0}.camera-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.camera-actions button{border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#101828;padding:10px 14px;font:inherit;font-weight:700;cursor:pointer}.camera-actions .camera-capture{background:#101828;color:#fff;border-color:#101828}
`;
document.head.append(style);

let cameraLayer = null;
let cameraStream = null;
let cameraBusy = false;
const MAX_PHOTOS = 8;
const photoState = new WeakMap();

function getState(input) {
  let state = photoState.get(input);
  if (!state) {
    state = { photos: [], internalChange: false, combining: false };
    photoState.set(input, state);
  }
  return state;
}

function setStatus(input, message) {
  const status = document.querySelector('#syImageStatus');
  if (status) status.textContent = message;
}

function setInputFiles(input, files) {
  const transfer = new DataTransfer();
  files.forEach(file => transfer.items.add(file));
  const state = getState(input);
  state.internalChange = true;
  input.files = transfer.files;
  queueMicrotask(() => { state.internalChange = false; });
}

function renderPreview(input) {
  const state = getState(input);
  let preview = document.querySelector('#syImagePreview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'syImagePreview';
    preview.className = 'image-attachment-preview';
    const label = document.querySelector('label[for="syImage"]');
    if (label) label.insertAdjacentElement('afterend', preview);
  }
  preview.replaceChildren();
  state.photos.forEach((file, index) => {
    const card = document.createElement('div');
    card.className = 'image-preview-card';
    const img = document.createElement('img');
    img.alt = `Photo ${index + 1}`;
    const url = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(url);
    img.src = url;
    const name = document.createElement('div');
    name.className = 'image-preview-number';
    name.textContent = `Photo ${index + 1} · ${file.name || 'image'}`;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'image-preview-delete';
    del.title = `Delete photo ${index + 1}`;
    del.setAttribute('aria-label', `Delete photo ${index + 1}`);
    del.textContent = '×';
    del.addEventListener('click', () => removePhoto(input, index));
    card.append(img, del, name);
    preview.append(card);
  });
  if (!state.photos.length) preview.remove();
}

function addPhotos(input, files) {
  if (!input || !files?.length) return;
  const state = getState(input);
  if (state.combining) return;
  const valid = files.filter(file => file?.type?.startsWith('image/'));
  if (!valid.length) return;
  const available = MAX_PHOTOS - state.photos.length;
  if (available <= 0) {
    setStatus(input, `Maximum ${MAX_PHOTOS} photos per question. Delete a photo to add another.`);
    return;
  }
  const added = valid.slice(0, available).map((file, i) => new File([file], file.name || `physics-question-${state.photos.length + i + 1}.png`, { type: file.type || 'image/png', lastModified: Date.now() }));
  state.photos.push(...added);
  if (valid.length > available) setStatus(input, `Maximum ${MAX_PHOTOS} photos reached. Extra photos were not added.`);
  renderPreview(input);
  rebuildInput(input);
}

function removePhoto(input, index) {
  const state = getState(input);
  if (state.combining) return;
  if (index < 0 || index >= state.photos.length) return;
  state.photos.splice(index, 1);
  renderPreview(input);
  rebuildInput(input);
}

async function rebuildInput(input) {
  const state = getState(input);
  if (state.combining) return;
  if (!state.photos.length) {
    setInputFiles(input, []);
    input.dataset.sourceCount = '0';
    setStatus(input, 'No image selected.');
    return;
  }
  input.dataset.sourceCount = String(state.photos.length);
  if (state.photos.length === 1) {
    setInputFiles(input, state.photos);
    setStatus(input, '🖼️ 1 photo attached');
    return;
  }
  await combinePhotos(input);
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

async function combinePhotos(input) {
  const state = getState(input);
  if (state.combining) return;
  state.combining = true;
  const askButton = document.querySelector('#askSyllabus');
  const askWasDisabled = askButton?.disabled || false;
  if (askButton) askButton.disabled = true;
  setStatus(input, `Preparing ${state.photos.length} photos…`);
  try {
    const images = await Promise.all(state.photos.map(loadImage));
    const maxWidth = 1600;
    const gap = 24;
    const rendered = images.map(img => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      return { img, width: Math.max(1, Math.round(img.naturalWidth * scale)), height: Math.max(1, Math.round(img.naturalHeight * scale)) };
    });
    const width = Math.max(...rendered.map(x => x.width));
    const height = rendered.reduce((sum, x) => sum + x.height, 0) + gap * (rendered.length - 1);
    if (height > 14000) throw new Error('Combined image is too tall. Choose fewer or smaller photos.');
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    let y = 0;
    rendered.forEach((item, index) => {
      if (index) { ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, y, width, gap); y += gap; }
      ctx.drawImage(item.img, 0, y, item.width, item.height);
      y += item.height;
    });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .88));
    if (!blob) throw new Error('Image processing failed.');
    const combined = new File([blob], `physics-question-${state.photos.length}-photos.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    setInputFiles(input, [combined]);
    input.dataset.sourceCount = String(state.photos.length);
    setStatus(input, `🖼️ ${state.photos.length} photos attached together — ready to ask Gemini`);
  } catch (error) {
    console.error('Could not combine question photos:', error);
    setStatus(input, `Could not combine photos: ${error.message}`);
  } finally {
    state.combining = false;
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
  getState(input);

  let status = document.querySelector('#syImageStatus');
  if (!status) {
    status = document.createElement('div');
    status.id = 'syImageStatus';
    status.className = 'image-attachment-preview';
    status.style.display = 'block';
    status.style.fontSize = '13px';
    status.style.color = 'var(--muted,#667085)';
    label.insertAdjacentElement('afterend', status);
  }

  input.addEventListener('change', () => {
    const state = getState(input);
    if (state.internalChange) return;
    const files = Array.from(input.files || []);
    state.photos = [];
    if (!files.length) {
      renderPreview(input);
      setStatus(input, 'No image selected.');
      return;
    }
    addPhotos(input, files);
  });

  const actions = document.createElement('div');
  actions.className = 'image-extra-actions';
  const pasteButton = document.createElement('button');
  pasteButton.type = 'button';
  pasteButton.textContent = '📋 Paste image (Ctrl + V)';
  pasteButton.addEventListener('click', () => {
    setStatus(input, 'Copy a picture, then press Ctrl + V on this page.');
    document.querySelector('#syQuestion')?.focus();
  });
  const cameraButton = document.createElement('button');
  cameraButton.type = 'button';
  cameraButton.textContent = '📷 Capture with camera';
  cameraButton.addEventListener('click', () => openCamera(input));
  actions.append(pasteButton, cameraButton);
  label.insertAdjacentElement('afterend', actions);

  const hint = document.createElement('p');
  hint.className = 'image-paste-hint';
  hint.textContent = `Add up to ${MAX_PHOTOS} photos. Each preview has a × button to delete it before asking.`;
  actions.insertAdjacentElement('afterend', hint);
}

async function openCamera(input) {
  if (cameraBusy) return;
  cameraBusy = true;
  if (!navigator.mediaDevices?.getUserMedia) {
    alert('Camera capture needs HTTPS and a supported browser. You can still upload or paste images.');
    cameraBusy = false;
    return;
  }
  cameraLayer = document.createElement('div');
  cameraLayer.className = 'camera-layer';
  cameraLayer.innerHTML = `<section class="camera-card" role="dialog" aria-modal="true" aria-labelledby="cameraTitle"><h2 id="cameraTitle">Capture your Physics question</h2><video class="camera-video" autoplay playsinline muted></video><p class="camera-message">Point the camera at the question, then capture. You can take several photos before pressing Done.</p><div class="camera-actions"><button type="button" class="camera-capture">Capture photo</button><button type="button" class="camera-close">Done</button></div></section>`;
  document.body.append(cameraLayer);
  const video = cameraLayer.querySelector('video');
  const message = cameraLayer.querySelector('.camera-message');
  cameraLayer.querySelector('.camera-close').addEventListener('click', () => closeCamera());
  cameraLayer.addEventListener('click', e => { if (e.target === cameraLayer) closeCamera(); });
  cameraLayer.querySelector('.camera-capture').addEventListener('click', () => {
    if (!video.videoWidth || !video.videoHeight) { message.textContent = 'Camera is not ready yet. Please wait a moment.'; return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) { message.textContent = 'Could not capture the photo. Please try again.'; return; }
      const state = getState(input);
      if (state.photos.length >= MAX_PHOTOS) { message.textContent = `Maximum ${MAX_PHOTOS} photos reached. Press Done or delete one first.`; return; }
      addPhotos(input, [new File([blob], `camera-physics-question-${state.photos.length + 1}.jpg`, { type: 'image/jpeg' })]);
      message.textContent = 'Photo captured. You can capture another or press Done.';
    }, 'image/jpeg', .9);
  });
  try {
    try { cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }); }
    catch { cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
    video.srcObject = cameraStream;
    await video.play();
  } catch (error) {
    message.textContent = `Camera unavailable: ${error.message || 'permission denied'}. Check browser permissions or use upload/paste.`;
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
  if (!item) return;
  const file = item.getAsFile();
  if (!file) return;
  event.preventDefault();
  addPhotos(input, [file]);
});

const observer = new MutationObserver(enhanceImageInput);
observer.observe(document.documentElement, { childList: true, subtree: true });
enhanceImageInput();
