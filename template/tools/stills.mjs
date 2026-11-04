// node tools/stills.mjs Thu05 0,40,80,120,160,200,235  -> out/still/<id>_<frame>.jpg
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const id = process.argv[2] ?? 'Thu05';
const frames = (process.argv[3] ?? '0,60,120,180,235').split(',').map(Number);
fs.mkdirSync('out/still', {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = {gl: 'angle'};
const browser = await openBrowser('chrome', {chromiumOptions});
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser, chromiumOptions});
const t0 = Date.now();
for (const frame of frames) {
	try {
		await renderStill({composition, serveUrl, frame, output: `out/still/${id}_${String(frame).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, puppeteerInstance: browser, chromiumOptions, logLevel: 'error'});
	} catch (e) { console.log('LOI', frame, String(e).slice(0, 600)); }
}
console.log('xong', frames.length, 'anh', Math.round((Date.now() - t0) / 1000), 's');
await browser.close({silent: true});
