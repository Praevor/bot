// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig(
	{ ignores: ['dist/**', 'node_modules/**'] },

	js.configs.recommended,
	tseslint.configs.recommended,

	{
		files: ['**/*.ts'],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			// Unused vars are fine if prefixed with _ (handy for unused interaction/client params)
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'no-console': 'off', // bots usually log to console
			eqeqeq: ['error', 'always'],
			'prefer-const': 'error',
		},
	},
);
