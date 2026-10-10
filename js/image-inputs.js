// Adds clipboard-paste and live-camera capture to the existing syllabus image input.
// The selected image is placed in #syImage so the existing Gemini upload/request flow is reused.
const STYLE = `
.image-extra-actions{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 8px}
.image-extra-actions button{border:1px solid var(--line,#d0d5dd);background:#fff;border-radius:10px;padding:10px 12px;font:inherit;font-weight:700;cursor:pointer}
.image-extra-actions button:hover{border-color:var(--blue,#3559a8)}
.image-paste-hint{font-size:12px;color:var(--muted,#667085);margin:4px 0 8px;line-height:1.45}
.camera-layer{position:fixed;inset:0;z-index:10000;background:rgba(10,18,32,.78);display:grid;place-items:center;padding:18px}
.camera-card{width:min(680px,100%);background:#fff;color:#101828;border-radius:16px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.camera-card h2{font-size:20px;margin:0 0 12px}.camera-video{width:100%;max-height:65vh;background:#111;border-radius:12px;object-fit:contain}.camera-message{font-size:13px;color:#667085;margin:10px 0}.camera-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.camera-actions button{border:1px solid #d0d5dd;border-radius:10px;background:#fff;padding:10px 14px;font:inherit;font-weight:700;cursor:pointer}.camera-actions .camera-capture{background:#101828;color:#fff;border-color:#101828}
`;
const style = document.createElement('style');
style.textContent = STYLE;
document.head.append(style);
let cameraLayer = null;
let cameraStream = null;
let cameraBusy = false;

function setImageFile(input, file, sourceLabel) {
  if (!input || !file || !file.type.startsWith('image/')) return;
  const transfer = new DataTransfer();
  const safeName = file.name || (sourceLabel === 'camera' ? 'camera-physics-question.jpg' : 'pasted-physics-question.png');
  transfer.items.add(new File([file], safeName, { type: file.type, lastModified: Date.now() }));
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  const status = document.querySelector('#syImageStatus');
  if (status) status.textContent = `✓ ${sourceLabel === 'camera' ? 'Camera photo' : 'Pasted image'} ready (${Math.max(1, Math.round(file.size / 1024))} KB)`;
}

function enhanceImageInput() {
  const input = document.querySelector('#syImage');
  if (!input || input.dataset.imageExtrasReady === 'true') return;
  const label = document.querySelector('label[for="syImage"]');
  if (!label) return;
  input.dataset.imageExtrasReady = 'true';
  const actions = document.createElement('div');
  actions.className = 'image-extra-actions';
  const cameraButton = document.createElement('button');
  cameraButton.type = 'button';
  cameraButton.textContent = '◎ Capture with camera';
  cameraButton.addEventListener('click', openCamera);
  actions.append(cameraButton);
  const hint = document.createElement('p');
  hint.className = 'image-paste-hint';
  hint.textContent = 'Tip: copy a question image and press Ctrl + V anywhere on this page to attach it.';
  label.insertAdjacentElement('afterend', actions);
  actions.insertAdjacentElement('afterend', hint);
}

async function openCamera() {
  if (cameraBusy) return;
  cameraBusy = true;
  if (!navigator.mediaDevices?.getUserMedia) {
    alert('Camera capture needs a secure HTTPS page and a browser that supports camera access. You can still upload or paste an image.');
    cameraBusy = false;
    return;
  }
  cameraLayer = document.createElement('div');
  cameraLayer.className = 'camera-layer';
  cameraLayer.innerHTML = `<section class="camera-card" role="dialog" aria-modal="true" aria-labelledby="cameraTitle"><h2 id="cameraTitle">Capture your Physics question</h2><video class="camera-video" autoplay playsinline muted></video><p class="camera-message">Allow camera access, point at the question, then capture the photo.</p><div class="camera-actions"><button type="button" class="camera-capture">Capture photo</button><button type="button" class="camera-close">Cancel</button></div></section>`;
  document.body.append(cameraLayer);
  const video = cameraLayer.querySelector('video');
  const message = cameraLayer.querySelector('.camera-message');
  const close = () => closeCamera();
  cameraLayer.querySelector('.camera-close').addEventListener('click', close);
  cameraLayer.addEventListener('click', event => { if (event.target === cameraLayer) close(); });
  cameraLayer.querySelector('.camera-capture').addEventListener('click', () => {
    if (!video.videoWidth || !video.videoHeight) { message.textContent = 'Camera is not ready yet. Please wait a moment.'; return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) { message.textContent = 'Could not capture the photo. Please try again.'; return; }
      setImageFile(document.querySelector('#syImage'), new File([blob], 'camera-physics-question.jpg', { type: 'image/jpeg' }), 'camera');
      closeCamera();
    }, 'image/jpeg', 0.92);
  });
  try {
    try { cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }); }
    catch { cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
    if (!cameraLayer || !video.isConnected) { cameraStream.getTracks().forEach(track => track.stop()); cameraStream = null; return; }
    video.srcObject = cameraStream;
    await video.play();
  } catch (error) {
    message.textContent = `Camera unavailable: ${error.message || 'permission denied'}. Check browser permissions or use upload/paste instead.`;
  } finally { cameraBusy = false; }
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
  const imageItem = items.find(item => item.kind === 'file' && item.type.startsWith('image/'));
  const file = imageItem?.getAsFile();
  if (!file) return;
  event.preventDefault();
  setImageFile(input, file, 'paste');
});

const observer = new MutationObserver(enhanceImageInput);
observer.observe(document.documentElement, { childList: true, subtree: true });
enhanceImageInput();
