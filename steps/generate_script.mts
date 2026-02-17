import myPexelsClient from "../clients/pexels.mts";
import type { ScriptSentence } from "../types/app";
import type { PersonaConfig } from "../personae.mts";
import { parseAiJson, promptLlm } from "../utils/llm.mts";
import type { FullTopicContext } from "./generate_topic.mts";

function dummy(): ScriptSentence[] {
	return [
		{
			sentence:
				"With a soft and whispery American accent, I'm the ideal choice for creating ASMR content, meditative guides, or adding an intimate feel to your narrative projects.",
			stance: "talking",
			illustration: "Microphone",
			wordsAlignment: [],
		},
		{
			sentence:
				"Do people forget we have lives outside our screens? Jobs, sleep, just... breathing?!",
			stance: "stupid",
			illustration: "clock",
			wordsAlignment: [],
		},
	];
}

async function addIllustrationLink(sentences: ScriptSentence[]) {
	const usedVideoIds = new Set<number>();

	for (const sentence of sentences) {
		const response = await myPexelsClient.videos.search({
			query: sentence.illustration,
			per_page: 10,
		});

		if (!("videos" in response)) {
			throw new Error("FAILED TO SEARCH FOR VIDEOS");
		}

		if (response.videos.length > 0) {
			const bestVideo = response.videos.find((video) => {
				if (usedVideoIds.has(video.id)) return false;

				return video.video_files.some(
					(file) => (file.width || 0) >= 540 && (file.height || 0) >= 960,
				);
			});

			const selectedVideo = bestVideo || response.videos[0];

			if (!selectedVideo) {
				throw new Error("No available video!!!");
			}

			// Filter for files meeting the minimum, then sort ascending (smallest first)
			const validFile = selectedVideo.video_files
				.filter((file) => (file.width || 0) >= 540 && (file.height || 0) >= 960)
				.sort((a, b) => (a.width || 0) - (b.width || 0))[0];

			sentence.illustrationVideo = validFile!;
			usedVideoIds.add(selectedVideo.id);
		}
	}
}

// export async function generateScript(
// 	persona: PersonaConfig,
// ): Promise<ScriptSentence[]> {
// 	if (process.env.DEBUG !== "false") {
// 		return dummy();
// 	}
//
// 	const text = await promptLlm(`Your task is to generate a punchy, engaging script for a short-form social media video (10-35 seconds).
// You are performing as a PNG-tuber with the following personality: ${persona.promptPersonality}
//
// ### Script Guidelines:
// 1. Format: Script must be broken down sentence-by-sentence.
// 2. Length: Each sentence must be under 12 words to maintain a fast, "snackable" pace.
// 3. Arc:
//    - Hook: Immediately state a spicy or controversial topic.
//    - Conflict: Express a strong emotional critique (anger, disbelief, or feigned outrage).
//    - Vibe: Prioritize character voice and emotion over dry facts.
//
// ### Output Format:
// Return ONLY a raw JSON array of objects. Each object must contain:
// - "sentence": (string) The spoken line.
// - "stance": (string) Must be one of: ${persona.stances.join(", ")}.
// - "illustration": (string) A 1-3 word search term for Pexels stock footage (focus on concrete visuals, e.g., "broken clock" instead of "wasted time").
//
// JSON Structure:
// [
//   {
//     "sentence": "",
//     "stance": "",
//     "illustration": ""
//   }
// ]
// `, 'gemini');
//
// 	const sentences: ScriptSentence[] = parseAiJson(text);
// 	await addIllustrationLink(sentences);
// 	return sentences;
// }

export async function generateScriptOnTopic(
	persona: PersonaConfig,
	topic: FullTopicContext,
): Promise<ScriptSentence[]> {
	if (process.env.DEBUG !== "false") {
		return dummy();
	}

	const text = await promptLlm(
		`${persona.promptScriptGuidelines(topic)}

### Output Format:
Return ONLY a raw JSON array of objects. Each object must contain:
- "sentence": (string) The spoken line.
- "stance": (string) Must be one of: ${persona.stances.join(", ")}.
- "illustration": (string) A 1-3 word search term for Pexels stock footage (focus on concrete visuals, e.g., "broken clock" instead of "wasted time").

JSON Structure:
[
  {
    "sentence": "",
    "stance": "",
    "illustration": ""
  }
]
`,
		"gemini",
	);

	const sentences: ScriptSentence[] = parseAiJson(text);
	await addIllustrationLink(sentences);
	return sentences;
}
