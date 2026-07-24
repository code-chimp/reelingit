import { existsSync } from 'fs';

/**
 * Ensures the repository uses a single, consistent package manager by checking for
 * the presence of lock files and reporting conflicts.
 *
 * This script enforces a single lock file in the repo so contributors and
 * automation use the same package manager semantics. The preferred lock file is
 * defined by the `PREFERRED_LOCK` constant in this script so the project-wide
 * preference is enforced for all contributors.
 *
 * - By default `PREFERRED_LOCK` is `package-lock.json` (npm).
 * - To change the preferred lock file for the project, edit the `PREFERRED_LOCK`
 *   constant below and commit the change, or update your CI configuration to
 *   use the new preference (so the enforcement is consistent across all
 *   automation and contributors).
 *
 * The intent is neutrality: this project intentionally picks one package
 * manager for consistency, not because one is inherently better.
 *
 * If a conflicting lock file is present the script will report which file(s)
 * to remove and recommend the install command for the preferred manager.
 *
 * Examples to change preference permanently:
 * - To prefer pnpm: set `PREFERRED_LOCK = 'pnpm-lock.yaml'` in this script and
 *   commit that change (or update CI to enforce the same value). The script
 *   will then prefer pnpm and recommend `pnpm install` when the preferred lock
 *   is missing.
 * - To prefer bun: set `PREFERRED_LOCK = 'bun.lockb'` in this script and commit
 *   the change (or update CI). The script will then recommend `bun install`
 *   when needed.
 *
 * An alternative is to document the preferred package manager in the repository
 * README and align CI to that choice, but storing the preference as a constant
 * in this script guarantees a single source of enforcement.
 *
 * @returns An object containing:
 *   - `invalid`: boolean indicating whether an invalid/conflicting lock file
 *     was found.
 *   - `error`: a human-readable error message explaining what to change.
 */

// Preferred lock file is set as a constant in this script to ensure the
// project-wide preference is enforced consistently for all contributors.
const PREFERRED_LOCK = 'package-lock.json';

/**
 * @param {string} lock
 * @returns {string}
 */
function preferredManagerFromLock(lock) {
  switch (lock) {
    case 'pnpm-lock.yaml':
      return 'pnpm';
    case 'bun.lockb':
      return 'bun';
    case 'yarn.lock':
      return 'yarn';
    case 'package-lock.json':
    default:
      return 'npm';
  }
}

/**
 * @returns {{ invalid: boolean, error: string }}
 */
function checkLockFiles() {
  let error = '';

  const knownLocks = ['package-lock.json', 'pnpm-lock.yaml', 'bun.lockb', 'yarn.lock'];
  const preferred = PREFERRED_LOCK;
  const otherLocks = knownLocks.filter(l => l !== preferred && existsSync(l));

  if (otherLocks.length > 0) {
    const listed = otherLocks.join(', ');
    const manager = preferredManagerFromLock(preferred);
    error = `Found conflicting lock file(s): ${listed}. Please remove ${otherLocks.length > 1 ? 'these' : 'this'} file(s) and keep only "${preferred}". Run "${manager} install" to regenerate the preferred lock file if needed.`;
  } else if (!existsSync(preferred)) {
    const manager = preferredManagerFromLock(preferred);
    error = `Missing "${preferred}" file. Please run "${manager} install" to generate it.`;
  }

  return { invalid: Boolean(error.length), error };
}

console.log('🔒🔒🔒 Validating lock file 🔒🔒🔒\n');
const { invalid, error } = checkLockFiles();

if (invalid) {
  console.error(error);
  process.exit(1);
} else {
  console.log('Lock file is valid 👍');
  process.exit(0);
}
