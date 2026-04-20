const API_BASE_URL = "/api";

// Shared fetch wrapper handling unified Headers and error catching
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Avoid json() parsing errors for responses without a body, like 204 No Content
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Extract detailed messages aligning with the backend error format
    const apiError = result.data;
    const correlationId = result.correlationId;
    let errorMessage = result.message || `HTTP error! Status: ${response.status}`;

    if (apiError && apiError.message) {
      errorMessage = `Error: ${apiError.message} (Code: ${apiError.code || "N/A"}, ID: ${correlationId || "N/A"})`;
    }
    throw new Error(errorMessage);
  }

  return result;
}