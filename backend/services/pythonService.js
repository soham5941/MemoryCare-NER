const DEFAULT_PYTHON_NER_URL = 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 10000;

class PythonServiceError extends Error {
  constructor(code, statusCode, userMessage, message) {
    super(message);
    this.name = 'PythonServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

function getTimeoutMs() {
  const configuredTimeout = Number.parseInt(process.env.PYTHON_TIMEOUT_MS, 10);

  if (!Number.isInteger(configuredTimeout) || configuredTimeout <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  // Keep a mistaken environment setting from leaving requests open indefinitely.
  return Math.min(configuredTimeout, 60000);
}

function getAnalyzeUrl() {
  const baseUrl = (process.env.PYTHON_NER_URL || DEFAULT_PYTHON_NER_URL).replace(/\/+$/, '');
  const analyzeUrl = `${baseUrl}/analyze`;

  try {
    const parsedUrl = new URL(analyzeUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol');
    }
  } catch (_error) {
    throw new PythonServiceError(
      'configuration_error',
      500,
      'NER service configuration is unavailable. Please contact the demo administrator.',
      'PYTHON_NER_URL is not a valid HTTP(S) URL.'
    );
  }

  return analyzeUrl;
}

function isValidEntity(entity, textLength) {
  if (!entity || typeof entity !== 'object') {
    return false;
  }

  if (typeof entity.text !== 'string' || !entity.text || typeof entity.label !== 'string' || !entity.label.trim()) {
    return false;
  }

  if (!Number.isInteger(entity.start) || !Number.isInteger(entity.end)) {
    return false;
  }

  if (entity.start < 0 || entity.end < entity.start || entity.end > textLength) {
    return false;
  }

  if (
    entity.confidence !== undefined &&
    entity.confidence !== null &&
    (typeof entity.confidence !== 'number' || !Number.isFinite(entity.confidence))
  ) {
    return false;
  }

  return true;
}

function isValidNerResponse(payload, textLength) {
  return (
    payload &&
    typeof payload === 'object' &&
    payload.success === true &&
    Array.isArray(payload.entities) &&
    payload.entities.every((entity) => isValidEntity(entity, textLength))
  );
}

async function analyzeTextWithPython(text) {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, getTimeoutMs());

  try {
    let response;

    try {
      response = await fetch(getAnalyzeUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });
    } catch (error) {
      if (timedOut || error.name === 'AbortError') {
        throw new PythonServiceError(
          'timeout',
          504,
          'NER analysis timed out. Please try again.',
          'The Python NER service did not respond before the configured timeout.'
        );
      }

      throw new PythonServiceError(
        'unavailable',
        503,
        'Unable to analyze the text. Please make sure the backend services are running.',
        `Unable to reach the Python NER service: ${error.message}`
      );
    }

    if (!response.ok) {
      throw new PythonServiceError(
        'upstream_error',
        502,
        'The NER analysis service could not process this request. Please try again.',
        `The Python NER service returned HTTP ${response.status}.`
      );
    }

    let payload;
    try {
      payload = await response.json();
    } catch (_error) {
      throw new PythonServiceError(
        'invalid_response',
        502,
        'The NER analysis service returned an invalid response. Please try again.',
        'The Python NER service returned a non-JSON response.'
      );
    }

    if (!isValidNerResponse(payload, text.length)) {
      throw new PythonServiceError(
        'invalid_response',
        502,
        'The NER analysis service returned an invalid response. Please try again.',
        'The Python NER service response did not match the expected entity format.'
      );
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  analyzeTextWithPython,
  PythonServiceError,
  isValidNerResponse
};
