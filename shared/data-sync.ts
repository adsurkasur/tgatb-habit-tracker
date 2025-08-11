// Shared logic for data serialization/deserialization

// Example: Export habit data to JSON
export function exportHabitsToJson(habits: any[]): string {
	return JSON.stringify(habits);
}

// Example: Import habit data from JSON
export function importHabitsFromJson(json: string): any[] {
	try {
		return JSON.parse(json);
	} catch {
		return [];
	}
}

// Usage:
// - Use exportHabitsToJson() before uploading to Drive
// - Use importHabitsFromJson() after downloading from Drive
