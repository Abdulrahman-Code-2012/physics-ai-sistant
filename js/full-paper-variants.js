(() => {
  const syncVariants = () => {
    const select = document.querySelector('#paperVariant');
    const paper = document.querySelector('#paperType')?.value || '4';
    if (!select) return;
    const variants = paper === '6' ? ['61','62','63'] : ['41','42','43'];
    const current = select.value;
    select.innerHTML = variants.map(v => '<option value="' + v + '">Variant ' + v.slice(1) + '</option>').join('');
    if (variants.includes(current)) select.value = current;
  };
  syncVariants();
  new MutationObserver(syncVariants).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('change', e => { if (e.target?.id === 'paperType') syncVariants(); });
})();
