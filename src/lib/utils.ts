export function scopify(pkg: string) {
	if (pkg.startsWith('@')) {
		const [scope, name] = pkg.split('/');
		return { scope, package: name };
	} else {
		return { scope: undefined, package: pkg };
	}
}
