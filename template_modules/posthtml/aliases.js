/**
 * Universal function for replacing aliases in strings, objects, or arrays.
 * @param {string | object / Array} data - data to be processed (String, object, or array).
 * @param {Object} options - options to replace.
 * @param {boolean} [options.prependDot=false] - whether to add a dot ('.') at the beginning of the journey.
 * @param {boolean} [options.normalizePath= true] - whether to normalize the path (remove double slashes).
 * @param {boolean} [options.sortAliases=true] - whether to sort aliases by length (longer first).
 * @param {boolean} [options.reserveoriginal= true] - whether to return the original data if there are no aliases.
 * @param {Function} [options.transformReplacement] - function for transforming the replacement value.
 * @returns {string | object / Array} - processed data with replaced aliases.
 */
import templateCfg from '../../template.config.js'

const replaceAliases = (data, { prependDot = false, normalizePath = true, sortAliases = true, preserveOriginal = true, transformReplacement } = {}) => {
	const aliases = templateCfg.aliases || {}

	// If there are no aliases and reserveoriginal is enabled, we return the original data
	if (preserveOriginal && Object.keys(aliases).length === 0) {
		return data
	}
	// Function for escaping special characters in regular expressions
	const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

	// Function for escaping special characters in regular expressions
	if (typeof data === 'string') {
		let result = data
		// Sort aliases by length (longer first) if sortAliases are enabled
		const sortedAliases = sortAliases
			? Object.keys(aliases).sort((a, b) => b.length - a.length)
			: Object.keys(aliases)

		sortedAliases.forEach((alias) => {
			const regex = new RegExp(escapeRegExp(alias), 'g')
			if (result.match(regex)) {
				let replacement = aliases[alias]
				// Add a dot if necessary
				if (prependDot) {
					replacement = `.${replacement}`
				}
				// Apply a custom transformation if passed
				if (typeof transformReplacement === 'function') {
					replacement = transformReplacement(replacement, alias)
				}
				result = result.replace(regex, replacement)
			}
		})
		// Normalize the path if necessary
		if (normalizePath && !result.startsWith('http')) {
			result = result.replace(/\/+/g, '/')
		}
		// Removing SRC
		const src = new RegExp('src/', 'g')
		result = result.includes('src/') ? result.replace(src, '') : result

		return result
	}

	// Processing arrays
	if (Array.isArray(data)) {
		return data.map(item => replaceAliases(item, { prependDot, normalizePath, sortAliases, preserveOriginal, transformReplacement }))
	}

	// Object processing
	if (data && typeof data === 'object') {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => [
				key,
				replaceAliases(value, { prependDot, normalizePath, sortAliases, preserveOriginal, transformReplacement }),
			])
		)
	}

	// Return unmodified data if it is not a string, array, or object
	return data
}

export default replaceAliases