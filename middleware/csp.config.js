function getCspPolicy(reduced = false) {
	const cspPolicy = {
		'base-uri': ["'self'"],
		'frame-src': ["'self'"],
		'object-src': ["'none'"],
		'script-src': ["'self'", "'unsafe-eval'", "'strict-dynamic'", 'https:', 'http:', 'nonce-'],
		'report-uri': ['/api/0.2/reporting'],
		'report-to': ['/api/0.2/reporting']
	};
	if (reduced || process.env.NODE_ENV === 'development') {
		delete cspPolicy['script-src'];
	}

	const cspString = Object.entries(cspPolicy)
		.map(([directive, sources]) => {
			if (Array.isArray(sources)) {
				return `${directive} ${sources.join(' ')}`;
			} else if (typeof sources === 'boolean') {
				return sources ? directive : '';
			} else {
				return '';
			}
		})
		.filter(Boolean)
		.join('; ');

	return cspString;
}

function getSecurityHeaders() {
	return {
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'X-XSS-Protection': '1; mode=block'
	};
}
module.exports = { getCspPolicy, getSecurityHeaders };
