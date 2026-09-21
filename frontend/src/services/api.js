const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const SERVICE_UNAVAILABLE_MESSAGE =
  "Unable to analyze the text. Please make sure the backend services are running.";

async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    throw new Error("The analysis service returned an unexpected response. Please try again.");
  }
}

export async function analyzeText(text) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/ner/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    const payload = await readResponse(response);

    if (!response.ok || payload?.success === false) {
      const message = typeof payload?.error === "string" ? payload.error : payload?.message;
      throw new Error(typeof message === "string" && message.trim() ? message : SERVICE_UNAVAILABLE_MESSAGE);
    }

    if (!Array.isArray(payload?.entities)) {
      throw new Error("The analysis service returned an unexpected response. Please try again.");
    }

    return {
      entities: payload.entities,
      statistics: payload.statistics && typeof payload.statistics === "object" ? payload.statistics : {},
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The analysis request timed out. Please make sure the backend services are running.");
    }

    if (error instanceof TypeError) {
      throw new Error(SERVICE_UNAVAILABLE_MESSAGE);
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
