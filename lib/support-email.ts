// This file is auto-generated at build time to inject the support email from package.json
import pkg from '../package.json';

if (!pkg.author || !pkg.email) {
	throw new Error('Both author and email must be defined in package.json');
}

export const SUPPORT_AUTHOR = pkg.author as string;
export const SUPPORT_EMAIL = pkg.email as string;
