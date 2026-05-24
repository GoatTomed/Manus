/**
 * Hook pour générer des liens EarnPaste avec les URLs de vérification Supabase
 */

const EARNPASTE_API_KEY = "ep_1fc0807b695b99c7f244b4d0dd6ac65bd49085dc6a6a2cd2";
const EARNPASTE_API_URL = "https://us-central1-earnpaste-3cd5a.cloudfunctions.net/apiCreatePaste";

export async function createEarnPasteLink(targetUrl: string, timer: number = 15): Promise<string> {
  try {
    const response = await fetch(EARNPASTE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": EARNPASTE_API_KEY,
      },
      body: JSON.stringify({ targetUrl, timer }),
    });

    if (!response.ok) {
      throw new Error(`EarnPaste API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error("No URL returned from EarnPaste API");
    }

    return data.url;
  } catch (error) {
    console.error("EarnPaste error:", error);
    throw error;
  }
}
