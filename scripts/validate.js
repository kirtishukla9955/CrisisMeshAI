#!/usr/bin/env node

/**
 * Cross-platform static validation for Member 4's slice.
 *
 * Checks:
 * 1. JS syntax under backend/, ai/, shared/
 * 2. JSON validity
 * 3. Backend tests
 * 4. Frontend bundle using locally installed esbuild
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const BACKEND_DIR = path.join(ROOT, 'backend');

let failures = 0;

function log(message) {
  process.stdout.write(message + '\n');
}

function fail(message) {
  failures += 1;
  process.stderr.write(`FAIL: ${message}\n`);
}

/**
 * Recursively find files matching a predicate.
 * node_modules and .git are ignored.
 */
function findFiles(dir, predicate, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findFiles(fullPath, predicate, results);
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * CHECK 1
 * Validate JavaScript syntax.
 */
function checkJsSyntax() {
  const directories = [
    path.join(ROOT, 'backend'),
    path.join(ROOT, 'ai'),
    path.join(ROOT, 'shared'),
  ];

  let files = [];

  for (const directory of directories) {
    files = findFiles(
      directory,
      (file) => file.endsWith('.js'),
      files
    );
  }

  log(
    `\n[1/4] Checking JS syntax on ${files.length} files under backend/, ai/, shared/...`
  );

  let localFailures = 0;

  for (const file of files) {
    try {
      const source = fs.readFileSync(file, 'utf8');

      new vm.Script(source, {
        filename: file,
      });
    } catch (error) {
      localFailures += 1;

      fail(
        `${path.relative(ROOT, file)} — ${error.message}`
      );
    }
  }

  if (localFailures === 0) {
    log('  All JS files parse cleanly.');
  }
}

/**
 * CHECK 2
 * Validate JSON files.
 */
function checkJsonFiles() {
  let files = findFiles(
    path.join(ROOT, 'demo', 'seed-data'),
    (file) => file.endsWith('.json')
  );

  const backendPackage = path.join(
    ROOT,
    'backend',
    'package.json'
  );

  const frontendPackage = path.join(
    ROOT,
    'frontend',
    'package.json'
  );

  files.push(backendPackage);
  files.push(frontendPackage);

  log(
    `\n[2/4] Checking JSON validity on ${files.length} files...`
  );

  let localFailures = 0;

  for (const file of files) {
    try {
      const contents = fs.readFileSync(file, 'utf8');

      JSON.parse(contents);
    } catch (error) {
      localFailures += 1;

      fail(
        `${path.relative(ROOT, file)} — ${error.message}`
      );
    }
  }

  if (localFailures === 0) {
    log('  All JSON files are valid.');
  }
}

/**
 * CHECK 3
 * Run backend tests.
 */
function runBackendTests() {
  log(
    '\n[3/4] Running backend test suite (node:test)...'
  );

  try {
    const output = execFileSync(
      process.execPath,
      ['--test'],
      {
        cwd: BACKEND_DIR,
        encoding: 'utf8',
      }
    );

    const lines = output.split('\n');

    log(
      lines.slice(-12).join('\n')
    );
  } catch (error) {
    fail(
      'backend test suite failed — see output below.'
    );

    if (error.stdout) {
      log(error.stdout);
    }

    if (error.stderr) {
      log(error.stderr);
    }
  }
}

/**
 * CHECK 4
 * Check the frontend bundle using the locally installed esbuild.
 *
 * IMPORTANT:
 * On Windows, esbuild is normally exposed as:
 *
 * frontend/node_modules/.bin/esbuild.cmd
 *
 * Node can produce EINVAL when trying to execute that .cmd
 * shim directly. We therefore use shell:true on Windows.
 */
function checkFrontendBundle() {
  log(
    '\n[4/4] Checking frontend bundle with locally installed esbuild...'
  );

  const entry = path.join(
    FRONTEND_DIR,
    'authority',
    'pages',
    'CommandCenterPage.jsx'
  );

  if (!fs.existsSync(entry)) {
    fail(
      `frontend entry file not found: ${path.relative(ROOT, entry)}`
    );

    return;
  }

  let esbuildPath;

  if (process.platform === 'win32') {
    esbuildPath = path.join(
      FRONTEND_DIR,
      'node_modules',
      '.bin',
      'esbuild.cmd'
    );
  } else {
    esbuildPath = path.join(
      FRONTEND_DIR,
      'node_modules',
      '.bin',
      'esbuild'
    );
  }

  if (!fs.existsSync(esbuildPath)) {
    fail(
      `local esbuild not found: ${path.relative(ROOT, esbuildPath)}`
    );

    return;
  }

  log(
    `  Using local esbuild: ${path.relative(ROOT, esbuildPath)}`
  );

  const temporaryOutput = path.join(
    os.tmpdir(),
    `crisismesh-member4-validate-${process.pid}.js`
  );

  const bundleArguments = [
    entry,
    '--bundle',
    '--platform=browser',
    '--format=esm',

    '--external:react',
    '--external:react-dom',
    '--external:react/jsx-runtime',
    '--external:recharts',
    '--external:lucide-react',
    '--external:firebase/*',

    `--outfile=${temporaryOutput}`,
  ];

  try {
    const options = {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    };

    /*
     * Windows needs shell:true for .cmd files.
     */
    if (process.platform === 'win32') {
      options.shell = true;
    }

    execFileSync(
      esbuildPath,
      bundleArguments,
      options
    );

    if (!fs.existsSync(temporaryOutput)) {
      fail(
        'frontend bundle command completed but no output file was created.'
      );

      return;
    }

    log(
      '  Frontend bundle resolves cleanly.'
    );
  } catch (error) {
    let details = '';

    if (error.stderr) {
      details = error.stderr.toString();
    } else if (error.stdout) {
      details = error.stdout.toString();
    } else if (error.message) {
      details = error.message;
    } else {
      details = String(error);
    }

    fail(
      `frontend bundle check failed:\n${details}`
    );
  } finally {
    try {
      if (fs.existsSync(temporaryOutput)) {
        fs.unlinkSync(temporaryOutput);
      }
    } catch {
      // Ignore temporary-file cleanup errors.
    }
  }
}

/**
 * Run all validation checks.
 */
checkJsSyntax();
checkJsonFiles();
runBackendTests();
checkFrontendBundle();

log(
  `\n${'='.repeat(50)}`
);

if (failures > 0) {
  log(
    `VALIDATION FAILED: ${failures} issue(s) found.`
  );

  process.exit(1);
}

log(
  'VALIDATION PASSED.'
);

process.exit(0);