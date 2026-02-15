import {generateScript} from "./steps/generate_script.ts";
import {scriptSentencesToSpeech} from "./steps/tts.ts";
import {getPersona} from "./personae.mts";
import downloadIllustrations from "./steps/download_illustrations.mts";
import {createOuptutFolder, normalizeAndSaveVideoConfig, sendRenderMessage} from "./utils/utils.mts";
import {getAuthenticatedClient, uploadShort} from "./utils/google.mts";

const persona = getPersona('debug');

console.log('== Generating script');
const sentences = await generateScript(persona);
const folder = await createOuptutFolder();

console.log(`== Downloading illustrations (${sentences.length} total)`);
await downloadIllustrations(sentences, folder);

console.log('== TTS processing');
await scriptSentencesToSpeech(folder, sentences, persona);

console.log('== Queuing render');
await normalizeAndSaveVideoConfig(folder, persona, sentences);
await sendRenderMessage(folder, true);

// const googleCredentials = await getAuthenticatedClient();
// await uploadShort(googleCredentials, '/output/2026-02-14_22-20-52_3c368e18/render.mp4');