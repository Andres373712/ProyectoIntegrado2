/**
 * Config de Prettier compartida por client/ y server/.
 *
 * Base: estilo ya predominante en server/ (comillas simples, ver por ej.
 * server/src/db/schema.js o server/src/services/authService.js).
 *
 * client/ (Next.js + TypeScript) ya usa comillas dobles de forma consistente
 * en todo src/ (convención habitual de create-next-app / eslint-config-next).
 * Forzar singleQuote ahí generaría un diff masivo el día que se corra
 * `--write` sobre todo el repo, sin ningún beneficio real — por eso el
 * override de abajo restaura comillas dobles solo para client/.
 */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    {
      files: ['client/**/*.{js,jsx,ts,tsx}'],
      options: {
        singleQuote: false,
      },
    },
  ],
};
