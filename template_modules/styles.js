// Template settings
import templateConfig from '../template.config.js'
// PostCSS
import postcss from 'postcss'
// Grouping media queries
import combineMediaQuery from 'postcss-combine-media-query'
import sortMediaQueries from 'postcss-sort-media-queries'
// Optimization
import cssnano from 'cssnano'

import fs from 'fs'
import { globSync } from 'glob'
import { normalizePath } from 'vite'
import logger from './logger.js'

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

export const stylesPlugins = [
	// Replacing PX with REM
	...((isProduction && templateConfig.styles.pxtorem) ? [{
		name: "css-pxtorem",
		apply: 'build',
		writeBundle: async ({ dir }) => {
			const cssFiles = globSync(`${dir}/css/*.css`)
			cssFiles.forEach(async cssFile => {
				let content = fs.readFileSync(cssFile, 'utf-8');
				content = content.replace(new RegExp(/\d+(\.\d+)?px/, "g"), (data) => {
					let value = `${parseFloat(data) / 16}rem`
					return value
				})
				fs.writeFileSync(cssFile, content, 'utf-8');
			});
		}
	}] : []),
	// Grouping Media queries
	...((isProduction) ? [{
		name: "css-combine-media-query",
		apply: 'build',
		writeBundle: {
			order: 'post',
			handler: async ({ dir }) => {
				const cssFiles = globSync(`${dir}/css`)
				cssFiles.forEach((cssFile) => {
					fs.readdirSync(cssFile).filter((filename) => /\.css$/.test(filename)).map((filename) => combineMediaQueries(`${cssFile}/${filename}`))
				});
				function combineMediaQueries(filePath) {
					const css = fs.readFileSync(filePath, 'utf8');
					const devFile = postcss()
						.use(combineMediaQuery())
						.use(sortMediaQueries({ sort: 'desktop-first' }))
						.process(css, { from: filePath });
					fs.writeFileSync(filePath, devFile.css, 'utf8');
				}
			}
		}
	}] : []),
	...((isProduction && isWp) ? [{
		name: "wp-css-fonts-path",
		apply: 'build',
		writeBundle: {
			order: 'pre',
			handler: ({ dir }) => {
				const cssFiles = globSync(`${dir}/css/*.css`)
				if (cssFiles.length) {
					cssFiles.forEach(async (cssFile) => {
						const cssFileCode = fs.readFileSync(cssFile, 'utf-8')
						const reg = /\/assets\/fonts\//g
						fs.writeFileSync(cssFile, cssFileCode.replace(reg, '/assets/fonts/'), 'utf8')
					})
				}
				if (templateConfig.fonts.download) {
					let cssCode = fs.readFileSync(`${dir}/css/webfonts.min.css`, 'utf8')
					cssCode = cssCode.replace(/src:\s*url\(\s*fonts/gi, `src:url(/wp-content/themes/fls-theme/assets/fonts/`)
					fs.writeFileSync(`${dir}/css/webfonts.min.css`, cssCode, 'utf8');
				}
			}
		}
	}] : []),
	...((isProduction && templateConfig.fonts.download) ? [{
		name: "css-download-path",
		apply: 'build',
		writeBundle: {
			order: 'post',
			handler: ({ dir }) => {
				let cssCode = fs.readFileSync(`${dir}/css/webfonts.min.css`, 'utf8')
				cssCode = cssCode.replace(/src:\s*url\(\s*fonts/gi, `src:url(${templateConfig.server.path === './' ? '../' : '/'}assets/fonts`)
				fs.writeFileSync(`${dir}/css/webfonts.min.css`, cssCode, 'utf8');
			}
		}
	}] : []),
	// Creating a copy of the file (Liv) for developers
	...((isProduction && templateConfig.styles.devfiles) ? [{
		name: "css-devfiles",
		apply: 'build',
		writeBundle: {
			order: 'post',
			handler: ({ dir }) => {
				const cssFiles = globSync(`${dir}/css/*.css`)
				if (cssFiles.length) {
					!fs.existsSync(`${dir}/css/dev`) && templateConfig.styles.codesplit ? fs.mkdirSync(`${dir}/css/dev`) : null
					cssFiles.forEach(async (cssFile) => {
						cssFile = normalizePath(cssFile)
						let devCssFile = cssFile.replace('.min', '')
						templateConfig.styles.codesplit ? devCssFile = devCssFile.replace('/css/', '/css/dev/') : null
						fs.copyFileSync(cssFile, devCssFile)
						const cssCode = fs.readFileSync(cssFile, 'utf8');
						const cssFileMin = await postcss().use(cssnano()).process(cssCode, { from: cssFile });
						fs.writeFileSync(cssFile, cssFileMin.css, 'utf8');
					});
					logger('_IMG_CSS_DEV_DONE')
				}
			}
		}
	}] : [])

]