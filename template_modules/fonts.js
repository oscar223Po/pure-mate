// Template settings
import templateConfig from '../template.config.js'
// Logger
import logger from './logger.js'

import { globSync } from 'glob'
import fs from 'node:fs';
import path from 'node:path'

// Font conversion
import Fontmin from 'fontmin';
// Local connection of remote fonts
import webfontDownload from 'vite-plugin-webfont-dl'
// Creating a font from SVG icons
import viteSvgToWebfont from 'vite-svg-2-webfont'
// Optimization of SVG icons
import { svgOptimaze } from './svgoptimaze.js'

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

// File paths
const fontsHTMLFile = 'src/components/layout/head/fonts-preload.html'
const fontsCSSFile = 'src/styles/fonts/fonts.css'
const iconsCSSFile = 'src/styles/fonts/iconfont.css'
const iconsPreviewFiles = globSync('src/assets/svgicons/preview/*.*')
const iconsFiles = globSync('src/assets/svgicons/*.svg')

// Font processing
function fontWork() {
	const fontsFiles = globSync('src/assets/fonts/*.{otf,ttf}', { posix: true })
	// Font conversion
	if (fontsFiles.length) {
		logger('_FONTS_START')
		const fontConverter = new Fontmin()
			.src('src/assets/fonts/*.{otf,ttf}')
			.dest('src/assets/fonts')
			.use(Fontmin.otf2ttf())
			.use(Fontmin.ttf2woff2())
		fontConverter.run(function (err, files, stream) {
			if (err) {
				throw err;
			}
			fontHtmlCss()
		})
	} else {
		fontHtmlCss()
	}
}
// Creating HTML, CSS files, and connecting fonts
const fontHtmlCss = () => {
	const fontsFiles = globSync('src/assets/fonts/*.woff2', { posix: true })
	if (fontsFiles.length) {
		// Variables
		let newFileOnly
		let linksToFonts = ``
		let fontsStyles = ``
		let counter = {
			all: 0
		}
		fontsFiles.forEach(fontsFile => {
			// File name
			const fontFileName = fontsFile.replace(new RegExp(' ', 'g'), '-').split('/').pop().split('.').slice(0, -1).join('.');
			// If the font was not processed earlier
			if (newFileOnly !== fontFileName) {
				const [fontName, fontWeightStr] = fontFileName.replace('--', '-').split("-");
				const fontStyle = fontFileName.toLowerCase().includes("-italic") ? "italic" : "normal";
				// Map for converting weight names to numeric values
				const fontWeightMap = { "thin": 100, "hairline": 100, "extralight": 200, "ultralight": 200, "light": 300, "medium": 500, "semibold": 600, "demibold": 600, "bold": 700, "extrabold": 800, "ultrabold": 800, "black": 900, "heavy": 900, "extrablack": 950, "ultrablack": 950, };
				// Checking the weight in the map, if not, use 400 (normal)
				let fontWeight = fontWeightStr ? fontWeightMap[fontWeightStr.toLowerCase()] || 400 : 400;
				// Creating font links
				linksToFonts += `<link rel="preload" href="@fonts/${fontFileName}.woff2" as="font" type="font/woff2" crossorigin="anonymous">\n`;
				// Creating styles for fonts
				fontsStyles += `@font-face {font-family: ${fontName};font-display: swap;src: url("@fonts/${fontFileName}.woff2") format("woff2");font-weight: ${fontWeight};font-style: ${fontStyle};}\n`;
				// Updating the name of the processed file
				newFileOnly = fontFileName;
			}
			counter.all++
		})
		fs.writeFile(fontsHTMLFile, linksToFonts, cb)
		fs.writeFile(fontsCSSFile, fontsStyles, cb)

		// Deleting derived files
		const fontsSrcFiles = globSync('src/assets/fonts/*.*', { posix: true })
		for (const file of fontsSrcFiles) {
			if (file.endsWith('.otf') || file.endsWith('.ttf')) {
				fs.unlink(file, (err) => { if (err) throw err })
			} else {
				file.includes(' ') ? fs.rename(file, file.replace(' ', '-'), () => { }) : null
			}
		}
		logger(`_FONTS_DONE`, [counter.all])
	} else {
		// If there are no fonts
		fs.writeFile(fontsHTMLFile, '', cb)
		fs.writeFile(fontsCSSFile, '', cb)
	}
}
// Adding an icon font
function addIconFonts() {
	if (iconsFiles.length && templateConfig.fonts.iconsfont) {
		!isProduction ? logger('_FONTS_ICONS_ADD_DONE') : null
	} else {
		fs.rm('src/assets/svgicons/preview', { recursive: true, force: true }, err => {
			if (err) {
				throw err;
			}
		});
		fs.writeFile(iconsCSSFile, '', cb)
	}
}
// Adding a font for WP
async function addWpFonts() {
	const styles = []
	styles.push(`import '@styles/fonts/fonts.css'`)
	iconsFiles.length && templateConfig.fonts.iconsfont ? styles.push(`import '@styles/fonts/iconfont.css'`) : null
	fs.writeFile('src/components/wordpress/fls-wp-fonts.js', styles.join('\n'), () => { })
}
// Plugins
export const fontPlugins = [
	// Font processing
	fontWork(),
	// Creating a font from SVG icons
	(iconsFiles.length && templateConfig.fonts.iconsfont) ? await {
		order: 'pre',
		...svgOptimaze(iconsFiles).then(() => { logger('_FONTS_ICONS_DONE') })
	} : [],
	(iconsFiles.length && templateConfig.fonts.iconsfont) ? {
		order: 'post',
		...viteSvgToWebfont({
			classPrefix: "--icon-",
			cssDest: path.resolve(iconsCSSFile),
			cssFontsUrl: path.resolve('src/assets/svgicons/preview'),
			types: ["woff2"],
			dest: "src/assets/svgicons/preview",
			cssTemplate: path.resolve('template_modules/iconfont/css.hbs'),
			htmlTemplate: path.resolve('template_modules/iconfont/html.hbs'),
			context: path.resolve('src/assets/svgicons'),
			normalize: true,
			inline: true,
			generateFiles: true //!iconsPreviewFiles.length
		})
	} : [],
	{
		order: 'post',
		...addIconFonts()
	},
	// Local connection of remote fonts
	...((templateConfig.fonts.download) ? [webfontDownload(
		[], {
		cache: true,
		embedFonts: false,
		injectAsStyleTag: false
	}
	)] : []),
	...(isWp ? [addWpFonts()] : []),
	...(isWp && !isProduction ? [{
		name: 'wp-iconfont-path',
		order: 'pre',
		transform(html, file) {
			if (file.endsWith("fonts.css")) {
				const reg = /\/assets\/fonts\//g
				return html.replace(reg, `http://${templateConfig.server.hostname}:${templateConfig.server.port}/assets/fonts/`)
			} else if (file.endsWith("iconfont.css")) {
				const reg = /\/assets\/svgicons\/preview\//g
				return html.replace(reg, `http://${templateConfig.server.hostname}:${templateConfig.server.port}/assets/svgicons/preview/`)
			}
		},
	}] : [])
]
// Function
function cb(err) {
	if (err) {
		throw err;
	}
}
