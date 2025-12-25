// Template settings
import templateConfig from '../template.config.js'
// Logger
import logger from './logger.js'
// Navigation
import { navPanel } from './navpanel.js'

import { globSync } from 'glob'
import fs from 'fs'

// HTML processing
import posthtml from 'posthtml'
import prerenderHTML from './posthtml/prerender.js'
import posthtmBeautify from 'posthtml-beautify'

import nunjucks from 'vite-plugin-nunjucks'

import pugAliases from "pug-alias"
import pugPlugin from "./pug.js"

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

export const htmlPlugins = [
	// Pre-test Include, Extend, Expressions
	prerenderHTML({}),
	// Nunjucks 
	nunjucks(),
	// Navigation
	...((!isWp && ((!isProduction && templateConfig.navpanel.dev) || (isProduction && templateConfig.navpanel.build))) ? [{
		name: 'nav-panel',
		order: 'pre',
		transformIndexHtml(html) {
			html = html.replace("</body>", `${navPanel()}</body>`)
			return html
		},
	}] : []),
	// Pug prerocessor
	...((templateConfig.pug.enable) ?
		[pugPlugin({
			plugins: [
				pugAliases({ '@pug': 'src/pug' })
			]
		})] : []),
	// Post-processing of HTML files
	{
		name: 'add-posthtml',
		apply: 'build',
		enforce: 'post',
		writeBundle: async ({ dir }) => {
			const htmlFiles = globSync(`${dir}/*.html`)
			htmlFiles.forEach(async htmlFile => {
				let content = fs.readFileSync(htmlFile, 'utf-8')
				// SVG Sprite slots
				if (templateConfig.images.svgsprite && content.includes('__spritemap')) {
					content = content.replace(new RegExp('__spritemap', 'gi'), `${templateConfig.server.path}assets/img/spritemap.svg`)
				}
				// Formatting
				if (templateConfig.html.beautify.enable) {
					const render = await new Promise((resolve) => {
						const output = {}
						const plugins = [
							posthtmBeautify({
								rules: {
									indent: templateConfig.html.beautify.indent,
									blankLines: '',
									sortAttrs: true
								},
							})
						]
						posthtml(plugins).process(content).catch(error => {
							output.error = error
							console.log(error);
							resolve(output)
						}).then(result => {
							output.content = result?.html
							resolve(output)
						})
					})
					content = render.content
				}
				fs.writeFileSync(htmlFile, content, 'utf-8');
			})
		}
	}
]
if (templateConfig.navpanel.dev && !isProduction) {
	logger('_NAVPAN_DONE')
} else if (templateConfig.navpanel.build && isProduction) {
	logger('_NAVPAN_WARN')
}
