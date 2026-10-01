// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			package_name?: string;
		}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			package_json?: string;
		}
		// interface Platform {}
	}
}

export {};
