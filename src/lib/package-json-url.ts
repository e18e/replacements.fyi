// lz-string ships as CommonJS, so SvelteKit's SSR can't tree-shake named exports.
// Import the default and destructure to keep both SSR and the client happy.
import lz_string from 'lz-string';

const {
	compressToEncodedURIComponent: compress_to_encoded_uri_component,
	decompressFromEncodedURIComponent: decompress_from_encoded_uri_component
} = lz_string;

type DepsMap = Record<string, unknown>;

export function encode_deps(
	dependencies: DepsMap | undefined,
	dev_dependencies: DepsMap | undefined
) {
	const payload: { dependencies?: DepsMap; devDependencies?: DepsMap } = {};
	if (dependencies && Object.keys(dependencies).length > 0) {
		payload.dependencies = dependencies;
	}
	if (dev_dependencies && Object.keys(dev_dependencies).length > 0) {
		payload.devDependencies = dev_dependencies;
	}
	return compress_to_encoded_uri_component(JSON.stringify(payload));
}

export function decode_param(param: string) {
	const decompressed = decompress_from_encoded_uri_component(param);
	if (!decompressed) return null;
	return decompressed;
}
