// Налаштування шаблону
// Генерація налаштувань для редактору
import vscodeSettings from './vscode-settings.js'
// Генерація сніпетів для редактору
import addSnippets from './snippets-generate.js'
// Генерація QR
import { qrcode } from 'vite-plugin-qrcode'
// Робота зі скриптами
import { scriptsPlugins } from './scripts.js'
// Робота зі шрифтами
import { fontPlugins } from "./fonts.js"
// Робота з зображеннями
import { imagePlugins } from "./images.js"
// Робота з HTML
import { htmlPlugins } from "./html.js"
// Робота зі стилями
import { stylesPlugins } from "./styles.js"
// Робота з архівом
import { zipPlugin } from "./zip.js"
// Робота з FTP
import { ftpPlugin } from "./ftp.js"
// Плагіни Rollup
import { rollupPlugins } from './rollup-plugins.js'
// Робота з Git
import { gitPlugins } from './git.js'
// Copying files
import { viteStaticCopy } from 'vite-plugin-static-copy'
// Working with statistics
import { statPlugins } from './statistics.js'

export default {
	statPlugins,
	gitPlugins,
	viteStaticCopy,
	rollupPlugins,
	scriptsPlugins,
	qrcode,
	ftpPlugin,
	zipPlugin,
	addSnippets,
	vscodeSettings,
	fontPlugins,
	imagePlugins,
	htmlPlugins,
	stylesPlugins
}