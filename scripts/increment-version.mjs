import { readFile, writeFile } from 'node:fs/promises';

const packageJsonPath = new URL('../package.json', import.meta.url);
const packageJsonText = await readFile(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonText);
const versionMatch = /^(\d+)\.(\d+)\.(\d+)$/.exec(packageJson.version);

if (!versionMatch) {
  throw new Error(`Cannot increment invalid package version: ${packageJson.version}`);
}

const [, major, minor, patch] = versionMatch;
const nextPatch = Number(patch) + 1;

if (!Number.isSafeInteger(nextPatch)) {
  throw new Error(`Package patch version is out of range: ${packageJson.version}`);
}

packageJson.version = `${major}.${minor}.${nextPatch}`;
await writeFile(
  packageJsonPath,
  `${JSON.stringify(packageJson, null, 2)}\n`,
  'utf8',
);
console.log(`Building Uchilles ${packageJson.version}`);
