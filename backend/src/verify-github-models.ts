import { ProviderError } from "./ai.ts";
import { createGitHubModelsProvider } from "./github-models.ts";

const token = process.env.GITHUB_MODELS_TOKEN?.trim();
const model = process.env.GITHUB_MODELS_MODEL?.trim();
if (!token || !model) {
  console.error(JSON.stringify({ event: "github_models_verification_failed", error: "missing_configuration" }));
  process.exitCode = 1;
} else {
  try {
    const result = await createGitHubModelsProvider({ token, model })("Reply with only the word READY.");
    console.log(JSON.stringify({ event: "github_models_verified", model: result.model, responseId: result.responseId }));
  } catch (error) {
    console.error(JSON.stringify({
      event: "github_models_verification_failed",
      error: error instanceof ProviderError ? error.code : "unexpected",
    }));
    process.exitCode = 1;
  }
}
