/**
 * ============================================================
 * ALPHENEX — GLOBAL FRONTEND ERROR INTERCEPTOR
 * ============================================================
 */

const ERROR_LOG_URL = '/api/log_error.php';
let isLogging = false;

/**
 * Generate a short unique ID for grouping related errors
 */
function generateCorrelationId() {
  return 'ERR_' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

function detectPageName(endpointUrl) {
  const url = endpointUrl.toLowerCase();
  if (url.includes('raga.php'))             return 'RagaChatbot.jsx';
  if (url.includes('save_raga_lead.php'))    return 'RagaChatbot.jsx';
  if (url.includes('submit_inquiry.php'))    return 'ContactForm.jsx';
  
  const path = window.location.pathname.toLowerCase();
  if (path.includes('contact'))             return 'ContactForm.jsx';
  if (path === '/' || path === '')           return 'HomePage.jsx';
  return 'Page: ' + window.location.pathname;
}

async function reportError(errorData) {
  if (isLogging) return;
  isLogging = true;
  try {
    await fetch(ERROR_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    });
  } catch {} finally { isLogging = false; }
}

export function initErrorInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    // Generate a unique ID for THIS specific request flow
    const uniqueId = generateCorrelationId();
    
    const url = args[0] instanceof Request ? args[0].url : String(args[0]);
    const method = args[1]?.method || 'GET';

    if (url.includes('log_error.php')) {
      return originalFetch.apply(this, args);
    }

    // Add the ID to outgoing headers so the backend can log it too
    if (!args[1]) args[1] = {};
    if (!args[1].headers) args[1].headers = {};
    args[1].headers['X-Correlation-ID'] = uniqueId;

    try {
      const response = await originalFetch.apply(this, args);

      if (!response.ok) {
        const clonedResp = response.clone();
        let fullResponseBody = '';
        try { fullResponseBody = await clonedResp.text(); } catch { fullResponseBody = '[Body Error]'; }

        reportError({
          error_source: 'frontend',
          unique_error_id: uniqueId, // Send the same ID to grouping
          error_page_name: detectPageName(url),
          endpoint: url,
          http_status: response.status,
          error_message: fullResponseBody,
          request_data: args[1]?.body ? String(args[1].body).substring(0, 2000) : null,
        });
      }
      return response;
    } catch (networkError) {
      reportError({
        error_source: 'frontend',
        unique_error_id: uniqueId,
        error_page_name: detectPageName(url),
        endpoint: url,
        error_message: `NETWORK ERROR: ${networkError.message}`,
      });
      throw networkError;
    }
  };

  // JS Errors
  window.addEventListener('error', (event) => {
    reportError({
      error_source: 'frontend',
      unique_error_id: generateCorrelationId(),
      error_page_name: event.filename?.split('/').pop() || 'Global JS',
      error_message: `${event.message}\nFile: ${event.filename}`,
    });
  });
}
