(() => {
  const addVariants = () => {
    document.querySelectorAll('select').forEach(select => {
      const options = [...select.options];
      const v1 = options.find(o => /\bvariant\s*1\b/i.test(o.textContent || ''));
      if (!v1) return;

      const context = [
        select.id,
        select.name,
        select.getAttribute('aria-label'),
        select.closest('label, .card, .panel, section, form, div')?.innerText || ''
      ].join(' ');
      if (!/full\s*paper/i.test(context) && !/variant/i.test(context)) return;

      const valueFor = n => {
        const base = String(v1.value ?? '1');
        if (/^[46]1$/.test(base)) return base.slice(0, -1) + n;
        if (/^\d+$/.test(base)) return base === '1' ? String(n) : base.replace(/1$/, String(n));
        return String(n);
      };

      [2, 3].forEach(n => {
        const exists = [...select.options].some(o =>
          new RegExp('\\bvariant\\s*' + n + '\\b', 'i').test(o.textContent || '')
        );
        if (!exists) select.add(new Option('Variant ' + n, valueFor(n)));
      });
    });
  };

  addVariants();
  new MutationObserver(addVariants).observe(document.documentElement, { childList: true, subtree: true });
})();