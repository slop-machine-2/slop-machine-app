import {ensureDevelopmentAssets, sendRenderMessage} from "../utils/utils.mts";

const folder = process.argv[2];

if (!folder) {
	console.log(process.argv);
	throw new Error('folder not given. give "output/YYYY_..."');
}

await ensureDevelopmentAssets();
await sendRenderMessage('output/' + folder, { showProgress: true });
