import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/**', 'src/db/migrations/**', 'uploads/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Permite parámetros/variables intencionalmente sin usar si se
      // nombran con guion bajo inicial (p. ej. middlewares de error de
      // Express que reciben `next` pero no lo invocan).
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Debe ir al final: apaga las reglas de formato de ESLint que chocarían
  // con Prettier (ya que Prettier es quien maneja el formato). No agrega
  // reglas propias, solo desactiva las que se solapan.
  eslintConfigPrettier,
];
