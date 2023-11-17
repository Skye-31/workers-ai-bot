module.exports = {
	ignorePatterns: ['**/node_modules/**'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'import', 'unused-imports'],
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
			rules: {
				'no-empty': 'off',
				'no-empty-function': 'off',
				'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
				'no-shadow': 'off',
				'require-yield': 'off',
				'@typescript-eslint/consistent-type-imports': ['error'],
				'@typescript-eslint/no-empty-function': 'off',
				'@typescript-eslint/no-explicit-any': 'error',
				'@typescript-eslint/no-floating-promises': 'error',
				'@typescript-eslint/no-unused-vars': 'off',
				'@typescript-eslint/no-shadow': 'error',
				'import/order': [
					'warn',
					{
						groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
						alphabetize: {
							order: 'asc',
						},
					},
				],
				'unused-imports/no-unused-imports': 'error',
				'unused-imports/no-unused-vars': [
					'warn',
					{
						vars: 'all',
						varsIgnorePattern: '^_',
						args: 'after-used',
						argsIgnorePattern: '^_',
					},
				],
			},
			parserOptions: {
				project: ['./tsconfig.json'], // Specify it only for TypeScript files
			},
		},
	],
};
