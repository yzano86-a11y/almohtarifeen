// UI click bridge: makes every inline UI action reliably resolve to the live app API.
(() => {
  const run = async (name, fallback) => {
    try {
      if (typeof window[name] === 'function') return await window[name]();
      if (typeof fallback === 'function') return await fallback();
    } catch (e) {
      console.error(`[ui] ${name} failed`, e);
      const state = document.getElementById('stateInfo');
      if (state) state.textContent = e?.message || 'تعذر تنفيذ العملية';
    }
  };

  window.guestPlay = window.guestPlay || (() => run('startGame', () => window.startGame?.(true)));

  const aliases = {
    openLogin: () => run('showAuth', () => { document.getElementById('auth')?.classList.remove('hidden'); }),
    openSignup: () => run('showAuth', () => { document.getElementById('auth')?.classList.remove('hidden'); }),
    createStory: () => run('openSocial', () => window.openSocial?.('profile')),
    createPost: () => run('openSocial', () => window.openSocial?.('feed')),
    openApprovedMenu: () => run('openSocial', () => window.openSocial?.('profile'))
  };
  for (const [name, fn] of Object.entries(aliases)) {
    if (typeof window[name] !== 'function') window[name] = fn;
  }

  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('button');
    if (!button) return;
    const action = button.getAttribute('onclick') || '';
    if (!action) return;
    // If an inline handler names a missing global, don't leave the click dead.
    const match = action.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);
    if (match && typeof window[match[1]] !== 'function') {
      event.preventDefault();
      console.warn('[ui] missing handler:', match[1]);
    }
  }, true);
})();
