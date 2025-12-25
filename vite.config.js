import fs from 'fs'
import { globSync } from 'glob'
import path from 'path'
import { defineConfig } from "vite"

// Build settings
import templateConfig from './template.config.js'
// Imported modules
import templateImports from './template_modules/template.imports.js'
// Generating settings for the editor
templateConfig.vscode.settings ? templateImports.vscodeSettings() : null
// Generating snippets for the editor
templateConfig.vscode.snippets ? templateImports.addSnippets() : null
// Povidoblen language
const lang = JSON.parse(fs.readFileSync(`./template_modules/languages/${templateConfig.lang}.json`, 'UTF-8'))
// Creating aliases for Vite
const makeAliases = (aliases) => {
	return Object.entries(aliases).reduce((acc, [key, value]) => {
		value = !value.startsWith(`./`) ? `./${value}` : value
		acc[key] = path.resolve(process.cwd(), value)
		return acc
	}, {})
}
const aliases = makeAliases(templateConfig.aliases)
// Logging
import logger from "./template_modules/logger.js"

const isProduction = process.env.NODE_ENV === 'production'
const isInspect = process.argv.includes('--inspect')
const isWp = process.argv.includes('--wp')
const isGit = process.argv.includes('--git')
const isHost = process.argv.includes('--host')

import { ignoredDirs, ignoredFiles } from './template_modules/ignored.js'

import qrcode from 'qrcode-terminal'
import Inspect from 'vite-plugin-inspect'

export default defineConfig(({ command, mode, ssrBuild }) => {
	return {
		define: {
			flsLogging: isProduction && templateConfig.logger.console.removeonbuild ? false : templateConfig.logger.console.enable,
			flsLang: isProduction && templateConfig.logger.console.removeonbuild ? false : lang,
			aliases: aliases
		},
		resolve: {
			alias: {
				vue: 'vue/dist/vue.esm-bundler.js',
				...aliases
			},
		},
		base: templateConfig.server.path,
		assetsInclude: ['src/components/**/*.html'],
		clearScreen: true,
		root: path.join(__dirname, "src"),
		logLevel: "silent",
		publicDir: false,
		server: {
			open: isWp ? 'http://localhost:8080' : true,
			host: templateConfig.server.hostname,
			port: templateConfig.server.port,
			watch: {
				ignored: [
					...ignoredDirs.map(dir => `**/${dir}/**`),
					...ignoredFiles.map(file => `**/${file}/**`),
				],
			}
		},
		plugins: [
			// Part HTML
			...templateImports.htmlPlugins,
			// Part scripts
			...templateImports.scriptsPlugins,
			// Part fonts
			...templateImports.fontPlugins,
			// Part styles
			...templateImports.stylesPlugins,
			// Part images
			...templateImports.imagePlugins,
			// Part zip
			...templateImports.zipPlugin,
			// Part FTP
			...templateImports.ftpPlugin,
			// Copying files
			...(isProduction && templateConfig.server.copyfiles ? [templateImports.viteStaticCopy({
				targets: [
					{
						src: 'files',
						dest: './',
					},
				],
				silent: true
			})] : []),
			// Part statistics
			...templateImports.statPlugins,
			// Part GitHub
			...(isProduction && isGit ? [...templateImports.gitPlugins] : []),
			// Adding a file version
			...(isProduction && templateConfig.server.version ? [{
				//templateImports.addVersion((new Date()).getTime())
				name: "add-version",
				apply: "build",
				transformIndexHtml(html) {
					const version = (new Date()).getTime()
					const regex = /<script[^>]*src\s*=\s*["']([^"']+\.js)["'][^>]*><\/script>|<link[^>]*href\s*=\s*["']([^"']+\.css)["'][^>]*>/gi;
					return html.replace(regex, (code) => {
						return code.replace(/\.css|\.js/gi, ($0) => `${$0}?v=${version}`)
					})
				},
			}] : []),
			// Browser update
			{
				name: 'custom-hmr',
				enforce: 'post',
				handleHotUpdate({ file, server }) {
					if (file.endsWith('.html') || file.endsWith('.json') || file.endsWith('.php') || file.includes('fls-theme')) {
						server.ws.send({ type: 'full-reload', path: '*' })
					}
				},
			},
			// Message
			{
				name: 'message-dev',
				enforce: 'post',
				configureServer: {
					order: 'post',
					handler: (server) => {
						// Adding a QR code to the terminal
						if (isHost) {
							setTimeout(() => {
								const urls = server.resolvedUrls || server.network
								for (const key in urls) {
									const element = urls[key];
									if (key === 'local') {
										logger(`_DEV_HOST_ADDRESS`, element[0])
									} else {
										element.forEach(item => {
											logger(`_DEV_HOST_IP_ADDRESS`, item)
											logger(`_DEV_HOST_QRCODE`)
											qrcode.generate(item, { small: true })
										})
									}
								}
								logger(`_DEV_DONE`)
							}, 1000);
						} else {
							logger(`_DEV_HOST_ADDRESS`, isWp ? `http://localhost:8080` : `http://${templateConfig.server.hostname}:${templateConfig.server.port}`)
							logger(`_DEV_DONE`)
						}
					}
				}
			},
			{
				name: 'message-build',
				apply: 'build',
				enforce: 'post',
				writeBundle: {
					order: 'post',
					handler: () => {
						logger(`_BUILD_DONE`)
					}
				},
			},
			...(isInspect ? [Inspect()] : [])
		],
		css: {
			devSourcemap: true,
			preprocessorOptions: {
				scss: {
					silenceDeprecations: [],
					additionalData: `
						@use "sass:math";
						@use "@styles/includes/index.scss" as *;
					`,
					sourceMap: true,
					quietDeps: true,
					api: 'modern-compiler'
				},
			},
		},
		build: {
			outDir: isWp ? path.join(__dirname, "src/components/wordpress/fls-theme/assets/build") : path.join(__dirname, "dist"),
			emptyOutDir: true,
			manifest: false,
			minify: !templateConfig.js.devfiles,
			cssMinify: !templateConfig.styles.devfiles,
			cssCodeSplit: templateConfig.styles.codesplit,
			assetsInlineLimit: 0,
			rollupOptions: {
				input: isWp ? ['src/components/wordpress/fls-theme/assets/app.js'] : globSync('./src/*.html', { ignore: [`./src/${templateConfig.devcomponents.filename}`] }),
				plugins: [
					templateImports.rollupPlugins
				],
				output: [{
					manualChunks(id) {
						if (templateConfig.js.bundle.enable) {
							return 'app'
						} else if (id.includes('js/custom')) {
							const customName = id.split('/').pop().replace('.js', '')
							return customName
						}
					},
					// Configuring assets
					assetFileNames: (asset) => {
						let getPath = asset.originalFileNames[0] && asset.names && asset.names.length > 0 ? asset.originalFileNames[0].replace(`/${asset.names[0]}`, '') : ''
						let extType = asset.names && asset.names.length > 0 ? asset.names[0].split('.').pop() : ''
						if (/css/.test(extType)) {
							return templateConfig.js.bundle.enable ? `css/app.min[extname]` : `css/[name].min[extname]`
						} else {
							if (/eot|otf|ttf|woff|woff2/.test(extType)) {
								extType = "assets/fonts";
							} else {
								extType = getPath
							}
							return `${extType}/[name][extname]`; //-[hash]
						}
					},
					entryFileNames(name) {
						return templateConfig.js.bundle.enable ? 'js/app.min.js' : `js/[name].min.js`
					},
					chunkFileNames(name) {
						return templateConfig.js.bundle.enable ? 'js/app.min.js' : `js/[name].min.js`
					}
				}],
			}
		}
	}
})