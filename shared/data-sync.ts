// Shared logic for data serialization/deserialization

// Export full bundle to JSON
export function exportBundleToJson(bundle: any): string {
	return JSON.stringify(bundle);
}

// Import full bundle from JSON
export function importBundleFromJson(json: string): any {
	try {
		return JSON.parse(json);
	} catch {
		return null;
	}
}

// Usage:
// - Use exportBundleToJson() before uploading to Drive
// - Use importBundleFromJson() after downloading from Drive
