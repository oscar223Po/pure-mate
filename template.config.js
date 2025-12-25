import path from 'path'
const projectName = path.basename(path.resolve()).toLowerCase()

export default {
	lang: 'en',
	vscode: {
		settings: true,
		snippets: true
	},
	devcomponents: {
		enable: false,
		filename: '_components.html'
	},
	git: {
		repo: `https://github.com/oscar223Po/pure-mate.git`,
		branch: `main`
	},
	navpanel: {
		dev: true,
		build: false,
		position: 'left',
		color: '#ffffff',
		background: 'rgba(51, 51, 51, 0.5)',
		transition: '300'
	},
	statistics: {
		enable: false,
		showonbuild: false
	},
	server: {
		path: './',
		copyfiles: true,
		version: true,
		hostname: 'localhost',
		port: '1111'
	},
	html: {
		beautify: {
			enable: true,
			indent: 'tab'
		}
	},
	styles: {
		pxtorem: true,
		critical: false,
		codesplit: true,
		devfiles: true
	},
	fonts: {
		iconsfont: true,
		download: false // Download google fonts by production
	},
	images: {
		svgsprite: false,
		optimize: {
			enable: false,
			edithtml: true,
			sizes: [600, 1200],
			dpi: [],
			attrignore: 'data-fls-image-ignore',
			modernformat: {
				enable: true,
				type: 'webp', // webp/avif
				only: true,
				quality: 80
			},
			jpeg: {
				quality: 80
			},
			png: {
				quality: 80
			}
		}
	},
	js: {
		hotmodules: true,
		devfiles: true,
		bundle: {
			// Collects in one JS and one CSS files
			// regardless of the configuration
			// styles -> codesplit
			enable: false
		}
	},
	pug: {
		enable: false
	},
	ftp: {
		host: '127.0.0.1',
		port: 21,
		remoteDir: `/www/.../${projectName}`,
		user: 'root',
		password: '123456'
	},
	logger: {
		// Terminal
		terminal: false,
		// Console
		console: {
			enable: false,
			removeonbuild: true
		}
	},
	aliases: {
		// HTML/SCSS/JS components
		'@components': 'src/components',
		// Scripts
		'@js': 'src/js',
		// Styles
		'@styles': 'src/styles',
		// Media & files
		'@fonts': 'src/assets/fonts',
		'@img': 'src/assets/img',
		'@video': 'src/assets/video',
		'@files': 'src/files',
		// Other
		'@pug': 'src/pug'
	}
}
