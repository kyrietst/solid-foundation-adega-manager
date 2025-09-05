// Chrome-specific diagnostics utility
// Can be called manually from browser console: window.chromeDiagnostics()

export const runChromeDiagnostics = () => {
  console.group('🔍 CHROME DIAGNOSTICS - Análise Completa');
  
  // Browser info
  console.group('📱 Browser Information');
  console.log('User Agent:', navigator.userAgent);
  console.log('Platform:', navigator.platform);
  console.log('Language:', navigator.language);
  console.log('Cookies Enabled:', navigator.cookieEnabled);
  console.log('Online:', navigator.onLine);
  console.groupEnd();

  // Storage diagnostics
  console.group('💾 Storage Diagnostics');
  console.log('localStorage available:', typeof localStorage !== 'undefined');
  console.log('sessionStorage available:', typeof sessionStorage !== 'undefined');
  console.log('indexedDB available:', typeof indexedDB !== 'undefined');

  // Test storage functionality
  try {
    const testKey = '__chrome_diag_test__';
    localStorage.setItem(testKey, 'test');
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    console.log('localStorage read/write test:', retrieved === 'test' ? '✅ OK' : '❌ FAILED');
  } catch (e) {
    console.error('localStorage test failed:', e);
  }

  // Check existing storage keys
  const allKeys = Object.keys(localStorage);
  const supabaseKeys = allKeys.filter(key => 
    key.startsWith('supabase') || 
    key.startsWith('sb-') ||
    key.includes('auth')
  );
  console.log('Total localStorage keys:', allKeys.length);
  console.log('Supabase-related keys:', supabaseKeys);
  supabaseKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''));
  });
  console.groupEnd();

  // Network diagnostics
  console.group('🌐 Network Diagnostics');
  console.log('Connection type:', (navigator as any).connection?.effectiveType || 'unknown');
  console.log('Network downlink:', (navigator as any).connection?.downlink || 'unknown');
  console.log('Save data mode:', (navigator as any).connection?.saveData || false);

  // Test DNS/network connectivity to Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    console.log('Testing connectivity to Supabase:', supabaseUrl);
    fetch(supabaseUrl + '/rest/v1/', { method: 'HEAD' })
      .then(() => console.log('Supabase connectivity: ✅ OK'))
      .catch(e => console.error('Supabase connectivity: ❌ FAILED', e));
  }
  console.groupEnd();

  // Security & permissions
  console.group('🔒 Security & Permissions');
  console.log('Secure context (HTTPS):', location.protocol === 'https:');
  console.log('Third-party cookies:', document.cookie ? 'enabled' : 'unknown');
  console.log('Permissions API available:', 'permissions' in navigator);
  
  // Check for service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('Service Workers:', registrations.length);
      registrations.forEach((reg, i) => {
        console.log(`  SW ${i + 1}:`, reg.scope, reg.active?.state);
      });
    });
  }
  console.groupEnd();

  // Chrome-specific features
  console.group('🚀 Chrome-Specific Features');
  console.log('Chrome extensions detected:', !!(window as any).chrome?.runtime);
  console.log('WebRTC available:', !!(window as any).RTCPeerConnection);
  console.log('Notification permission:', (Notification as any).permission || 'not available');
  console.groupEnd();

  // Environment variables check
  console.group('⚙️ Environment Variables');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.groupEnd();

  console.groupEnd();

  return {
    browser: navigator.userAgent,
    storageWorking: typeof localStorage !== 'undefined',
    supabaseKeys: Object.keys(localStorage).filter(key => key.includes('supabase')),
    recommendations: [
      'Try clearing browser data for this site',
      'Disable Chrome extensions temporarily',
      'Check if third-party cookies are blocked',
      'Verify network connectivity to Supabase',
      'Check Chrome console for detailed error messages'
    ]
  };
};

// Make it available globally for manual testing
if (typeof window !== 'undefined') {
  (window as any).chromeDiagnostics = runChromeDiagnostics;
  (window as any).clearChromeAuthData = () => {
    // Import the function dynamically to avoid circular dependencies
    import('@/core/api/supabase/client').then(({ clearChromeAuthData }) => {
      const cleared = clearChromeAuthData();
      console.log(`🧹 Cleared ${cleared} Chrome auth keys`);
      return cleared;
    });
  };
}