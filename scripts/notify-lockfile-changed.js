/**
 * Warning message to notify the user that the `package-lock.json` file has changed.
 * Instructs the user to run `npm install` to ensure packages are up to date.
 */
if (process.argv.slice(2).some(arg => arg.includes('package-lock.json'))) {
  console.warn(
    [
      '⚠️ ------------------------------------------------------------------------------------------- ⚠️',
      '⚠️ package-lock.json changed, please run `npm install` to ensure your packages are up to date. ⚠️',
      '⚠️ ------------------------------------------------------------------------------------------- ⚠️',
    ].join('\n'),
  );
}
