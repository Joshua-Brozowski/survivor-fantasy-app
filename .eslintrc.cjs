// Guards against the two bugs that have repeatedly blanked the app:
// hooks called conditionally (e.g. inside an admin sub-view) and variables
// used in a component without being passed in (missing AdminPanel props).
// Runs before every build, so these fail the Vercel deploy instead of shipping.
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'no-undef': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
  },
};
