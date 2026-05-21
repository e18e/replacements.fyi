import { matcher } from './routes/mocks';

if (process.env.PLAYWRIGHT_TEST) {
	// poor man interception: since we run the app with `wrangler` we can't use nice libraries
	// like msw since they rely on node. The only way I found is to monkey patch `fetch`.

	const original_fetch = globalThis.fetch;
	globalThis.fetch = async (init, options) => {
		let url;
		if (init instanceof Request) {
			url = init.url;
		} else {
			url = init;
		}
		const response = matcher.match(url);
		if (response) {
			return response.data(response.params);
		}
		return original_fetch(url, options);
	};
}
