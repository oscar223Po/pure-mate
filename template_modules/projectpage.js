// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import { globSync } from 'glob'
import fs from 'fs'
import path from 'path';

const projectName = path.basename(path.resolve())

export default function projectPage() {
	return {
		name: 'add-project-page',
		apply: 'build',
		enforce: 'post',
		writeBundle: async ({ dir }) => {
			const htmlFiles = globSync('dist/*.html')
			let links = ``
			if (htmlFiles.length) {
				htmlFiles.forEach(async htmlFile => {
					const href = htmlFile.replace('dist\\', '')
					const name = href.replace('.html', '')
					links += `\n<li><a target="_blank" href="${href}">${name}</a></li>`
				});
			}
			let page = `
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<meta name="robots" content="noindex, nofollow">
						<title>Website: %projectname%</title>
					</head>
					<body>
						<div class="wrapper">
							<main>
								<h1>Project overview: %projectname%</h1>
								<h2>Pages to view:</h2>
								<ul>%pages%</ul>
							</main>
						</div>
					</body>
				</html>
				`
			const template = fs.readFileSync(templateConfig.projectpage.template, 'utf-8')
			let pageTemplate = template || page

			pageTemplate = pageTemplate.replace(new RegExp('%projectname%', 'g'), templateConfig.projectpage.projectname || projectName)
			pageTemplate = pageTemplate.replace(new RegExp('%pages%', 'g'), links)

			fs.writeFileSync(`dist/${templateConfig.projectpage.outfilename || projectName.toLowerCase()}.html`, pageTemplate);
		}
	}
}