// Local, browser-side text extraction for Physics AI-sistant.
// Selectable PDF text is preferred; OCR is used for scanned PDF pages and photos.
let pdfjsPromise;
let tesseractPromise;
let workerPromise;
async function getPdfJs(){
 if(!pdfjsPromise)pdfjsPromise=import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs').then(pdfjs=>{pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';return pdfjs});
 return pdfjsPromise;
}
async function getOcrWorker(onProgress){
 if(!tesseractPromise)tesseractPromise=import('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js');
 const{createWorker}=await tesseractPromise;
 if(!workerPromise)workerPromise=createWorker('eng',1,{logger:m=>{if(m.status==='recognizing text')onProgress?.('OCR running '+Math.round((m.progress||0)*100)+'%…')}});
 return workerPromise;
}
export async function extractPhysicsText(file,onProgress=()=>{}){
 if(!file)throw new Error('No file supplied for text extraction.');
 const type=file.type||'';
 if(type.startsWith('image/')){
  onProgress('Reading image text locally…');const worker=await getOcrWorker(onProgress);const{data}=await worker.recognize(file);return String(data?.text||'').trim();
 }
 if(type!=='application/pdf'&&!/\.pdf$/i.test(file.name||''))throw new Error('Only images and PDFs can be read by the local text extractor.');
 onProgress('Reading PDF text locally…');const pdfjs=await getPdfJs();const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;const pages=[];let worker=null;
 for(let i=1;i<=pdf.numPages;i++){
  onProgress('Reading PDF page '+i+' of '+pdf.numPages+'…');const page=await pdf.getPage(i);const tc=await page.getTextContent();const direct=tc.items.map(x=>typeof x.str==='string'?x.str:'').filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  if(direct.length>=35){pages.push('[Page '+i+']\n'+direct);continue}
  worker=worker||await getOcrWorker(onProgress);const viewport=page.getViewport({scale:1.65});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx){pages.push('[Page '+i+'] [Unable to render page for OCR]');continue}
  await page.render({canvasContext:ctx,viewport}).promise;const{data}=await worker.recognize(canvas);const recognized=String(data?.text||'').trim();pages.push('[Page '+i+']\n'+(recognized||direct||'[No readable text found]'));canvas.width=0;canvas.height=0;page.cleanup();
 }
 return pages.join('\n\n').trim();
}
