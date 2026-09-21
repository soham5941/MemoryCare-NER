const { analyzeTextWithPython, PythonServiceError } = require('../services/pythonService');

const DEFAULT_MAX_INPUT_LENGTH = 20000;

function getMaxInputLength() {
  const configuredLimit = Number.parseInt(process.env.MAX_INPUT_LENGTH, 10);

  return Number.isInteger(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : DEFAULT_MAX_INPUT_LENGTH;
}

function getStatisticLabel(label) {
  const normalizedLabel = label.trim().toUpperCase();

  return /^[A-Z][A-Z0-9_]{0,63}$/.test(normalizedLabel)
    ? normalizedLabel
    : 'OTHER_MEDICAL';
}

function calculateStatistics(entities) {
  const statistics = { total: entities.length };

  for (const entity of entities) {
    const label = getStatisticLabel(entity.label);
    statistics[label] = (statistics[label] || 0) + 1;
  }

  return statistics;
}

async function analyzeText(req, res) {
  const { text } = req.body || {};

  if (typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Provide the clinical text as a text string.'
    });
  }

  if (!text.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Text cannot be empty.'
    });
  }

  const maximumLength = getMaxInputLength();
  if (text.length > maximumLength) {
    return res.status(413).json({
      success: false,
      error: `Text must be ${maximumLength.toLocaleString()} characters or fewer.`
    });
  }

  try {
    const nerResult = await analyzeTextWithPython(text);
    const statistics = calculateStatistics(nerResult.entities);

    return res.status(200).json({
      success: true,
      entities: nerResult.entities,
      statistics
    });
  } catch (error) {
    if (error instanceof PythonServiceError) {
      // This deliberately excludes the submitted text and any raw Python response.
      console.error(`[MemoryCare NER backend] Python service ${error.code}: ${error.message}`);
      return res.status(error.statusCode).json({
        success: false,
        error: error.userMessage
      });
    }

    console.error('[MemoryCare NER backend] Analysis failed unexpectedly:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to analyze the text right now. Please try again.'
    });
  }
}

module.exports = {
  analyzeText,
  calculateStatistics
};
