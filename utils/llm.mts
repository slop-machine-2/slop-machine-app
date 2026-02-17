import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { huggingface } from "@ai-sdk/huggingface";

const GEMINI_MODEL = google("gemini-2.5-flash");
const GLM_MODEL = huggingface("zai-org/GLM-5");
const HF_MODEL = huggingface("HuggingFaceTB/SmolLM3-3B");

export async function promptLlm(
	prompt: string,
	model: "gemini" | "glm" | "hf",
): Promise<string> {
	const models = {
		gemini: GEMINI_MODEL,
		glm: GLM_MODEL,
		hf: HF_MODEL,
	};

	const modelObj = models[model];
	const { text } = await generateText({ prompt, model: modelObj });
	return text;
}

export function parseAiJson(rawString: string) {
	// Regex: Matches ``` (optional language) [content] ```
	// [^] matches any character including newlines
	const regex = /```(?:json)?\s*([\s\S]*?)\s*```/;
	const match = rawString.match(regex);
	const jsonString = match ? match[1]! : rawString;
	const finalString = jsonString.replace(/<think>[\s\S]*?<\/think>/g, "");

	try {
		return JSON.parse(finalString.trim());
	} catch (error) {
		console.error("Failed to parse JSON content:", jsonString, error);
		throw error;
	}
}
