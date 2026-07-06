import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const recipesPath = path.join(projectRoot, 'data', 'recipes.json');

const pdfCandidates = [
  path.join(projectRoot, 'cupidcookbook.pdf'),
  path.join(projectRoot, 'data', 'cupidcookbook.pdf'),
  path.join(projectRoot, 'assets', 'cupidcookbook.pdf'),
  'C:\\Users\\Asus\\Downloads\\cupidcookbook.pdf',
];

const consonants = new Set('ကခဂဃငစဆဇဈညဋဌဍဎဏတထဒဓနပဖဗဘမယရလဝသဟဠအဥဧဩဪ'.split(''));
const medials = new Set(['ျ', 'ြ', 'ွ', 'ှ']);

const winInnwaMap = new Map(Object.entries({
  u: 'က',
  c: 'ခ',
  '*': 'ဂ',
  C: 'ဃ',
  i: 'င',
  p: 'စ',
  q: 'ဆ',
  Z: 'ဇ',
  Q: 'ဈ',
  n: 'ည',
  '#': 'ဋ',
  X: 'ဌ',
  '!': 'ဍ',
  P: 'ဎ',
  W: 'ဏ',
  w: 'တ',
  x: 'ထ',
  "'": 'ဒ',
  '"': 'ဓ',
  e: 'န',
  y: 'ပ',
  z: 'ဖ',
  A: 'ဗ',
  b: 'ဘ',
  r: 'မ',
  ',': 'ယ',
  '&': 'ရ',
  v: 'လ',
  o: 'သ',
  '[': 'ဟ',
  V: 'ဠ',
  t: 'အ',
  O: 'ဥ',
  0: 'ဝ',
  '\\': 'ဧ',
  m: 'ာ',
  g: 'ါ',
  d: 'ိ',
  D: 'ီ',
  k: 'ု',
  l: 'ူ',
  J: 'ဲ',
  H: 'ံ',
  h: '့',
  f: '်',
  ';': 'း',
  j: 'ြ',
  M: 'ြ',
  N: 'မြ',
  R: 'ျ',
  s: 'ျ',
  B: 'ြ',
  G: 'ွ',
  S: 'ှ',
  U: '့',
  a: 'ေ',
  E: 'န',
  I: '၍',
  Y: '၏',
  '/': '။',
  '?': '၊',
  '½': 'ှ',
  '§': '္ဓ',
  'é': 'င်္',
  'þ': 'ဤ',
  'í': '၍',
  'ü': '၌',
  '©': '©',
}));

function findPdf() {
  const foundInProject = pdfCandidates.slice(0, -1).find((candidate) => existsSync(candidate));
  if (foundInProject) return foundInProject;

  const downloadsPdf = pdfCandidates.at(-1);
  if (existsSync(downloadsPdf)) return downloadsPdf;

  throw new Error(`Recipe PDF not found. Checked:\n${pdfCandidates.join('\n')}`);
}

function uniqueRepeats(line) {
  const parts = line.split(/\t+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return line;
  const headingPart = parts
    .filter((part) => /\d+\s*\)/.test(part) && /\s[-–]\s/.test(part))
    .sort((a, b) => b.length - a.length)[0];
  if (headingPart) return headingPart.replace(/^((\d+)\s+)+(?=\d+\))/, '');

  const counts = new Map(parts.map((part) => [part, 0]));
  for (const part of parts) counts.set(part, counts.get(part) + 1);
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0];
  return best?.[1] > 1 ? best[0] : parts.join(' ');
}

function cleanRawText(text) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => uniqueRepeats(line).replace(/\s+/g, ' ').trim())
    .filter((line) => line && !/^-- \d+ of \d+ --$/.test(line))
    .filter((line) => !/^NrefrmusL;ypf \[if;csufenf;/.test(line))
    .join('\n');
}

function convertWinInnwa(input) {
  let output = '';

  for (const char of input) {
    output += winInnwaMap.get(char) ?? char;
  }

  output = output
    .replace(/ေ([က-အဥဧဩဪ])([ျြွှ]*)/g, '$1$2ေ')
    .replace(/([ိီုူဲံ့း်]+)ြ([က-အဥဧဩဪ])/g, '$1$2ြ')
    .replace(/([က-အဥဧဩဪ])([ာါိီုူဲံ့း်]*)ြ/g, '$1ြ$2')
    .replace(/([က-အဥဧဩဪ])([ာါိီုူဲံ့း်]*)ျ/g, '$1ျ$2')
    .replace(/([က-အဥဧဩဪ])([ာါိီုူဲံ့း်]*)ွ/g, '$1ွ$2')
    .replace(/([က-အဥဧဩဪ])([ာါိီုူဲံ့း်]*)ှ/g, '$1ှ$2')
    .replace(/(^|[\s([၊။])([ျြွှ]+)([က-အဥဧဩဪ])/g, '$1$3$2')
    .replace(/([က-အဥဧဩဪ])နွ်/g, '$1ွန်')
    .replace(/([က-အဥဧဩဪ])်([က-အဥဧဩဪ])/g, '$1်$2')
    .replace(/\s+/g, ' ')
    .trim();

  return output;
}

function normalizeMyanmarText(value) {
  return convertWinInnwa(value)
    .replace(/[ \t]+([၊။])/g, '$1')
    .replace(/([၊။])(?=\S)/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyHeading(line) {
  return /^\d/.test(line) && /\)/.test(line) && /[-–]/.test(line);
}

function headingNumber(line, expected) {
  const prefix = line.match(/^([\d\s]+)\)/)?.[1];
  if (!prefix) return null;

  const groups = prefix.match(/\d+/g) ?? [];
  const direct = groups.map(Number).find((value) => value === expected);
  if (direct) return direct;

  const joined = groups.join('');
  if (joined.endsWith(String(expected))) return expected;

  return Number(groups.at(-1));
}

function splitBlocks(text) {
  return cleanRawText(text)
    .split(/%{5,}/)
    .map((chunk) => chunk.split('\n').map((line) => line.trim()).filter(Boolean))
    .map((lines) => {
      const headingIndex = lines.findIndex(isLikelyHeading);
      return headingIndex === -1 ? [] : lines.slice(headingIndex);
    })
    .filter((lines) => lines.length);
}

function cleanTitle(rawTitle) {
  return normalizeMyanmarText(rawTitle)
    .replace(/^[0-9]+\)\s*/, '')
    .replace(/\s[-–]\s.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitNumberedItems(lines) {
  const items = [];
  let current = '';

  for (const line of lines) {
    const match = line.match(/^(\d+)\)\s*(.*)$/);
    if (match) {
      if (current.trim()) items.push(current.trim());
      current = match[2];
    } else if (current) {
      current += ` ${line}`;
    }
  }

  if (current.trim()) items.push(current.trim());
  return items.map(normalizeMyanmarText).filter(Boolean);
}

function findStepStart(lines) {
  const index = lines.findIndex((line, lineIndex) => {
    if (lineIndex < 1) return false;
    return /csuf|pwif|jyif|aMumf|vkyf|enf/.test(line) && !/^\d+\)/.test(line);
  });

  return index === -1 ? Math.min(lines.length, 2) : index + 1;
}

function extractRecipe(block) {
  const heading = block[0];
  const titlePart = heading.replace(/^\d+\)\s*/, '').replace(/\s[-–]\s.*$/, '');
  const nameMm = cleanTitle(titlePart);
  if (!nameMm || !/[က-အ]/.test(nameMm)) return null;
  if (/^[\d\s-]/.test(nameMm) || nameMm.length > 80) return null;

  const body = block.slice(1).filter((line) => !/^%+$/.test(line));
  const stepStart = findStepStart(body);
  const ingredientLines = body.slice(0, stepStart);
  const stepLines = body.slice(stepStart);
  const ingredients = splitNumberedItems(ingredientLines);
  let steps = splitNumberedItems(stepLines);

  if (!steps.length) {
    const prose = stepLines.map(normalizeMyanmarText).join(' ').trim();
    if (prose) steps = [prose];
  }

  const missingFields = ['time', 'difficulty'];
  if (!ingredients.length) missingFields.push('ingredients');
  if (!steps.length) missingFields.push('steps');

  return {
    id: slugify(nameMm),
    name_mm: nameMm,
    name_en: null,
    ingredients,
    ingredients_mm: ingredients,
    ingredients_en: [],
    steps,
    steps_mm: steps,
    time: null,
    time_minutes: null,
    difficulty: null,
    source: 'pdf',
    needs_ai_completion: missingFields.length > 0,
    missing_fields: missingFields,
  };
}

function slugify(value) {
  const ascii = [...value].map((char) => {
    const code = char.codePointAt(0).toString(16);
    return /[a-z0-9]/i.test(char) ? char.toLowerCase() : code;
  }).join('_');
  return `pdf_${ascii}`.replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function recipeNameKey(recipe) {
  return String(recipe.name_mm ?? '').normalize('NFC').trim().toLowerCase();
}

function recipeIdSet(recipes) {
  return new Set(recipes.map((recipe) => recipe.id));
}

function ensureUniqueId(recipe, usedIds) {
  let nextId = recipe.id;
  let suffix = 2;
  while (usedIds.has(nextId)) {
    nextId = `${recipe.id}_${suffix}`;
    suffix += 1;
  }
  usedIds.add(nextId);
  return { ...recipe, id: nextId };
}

function normalizeExistingRecipe(recipe) {
  const ingredients = recipe.ingredients ?? recipe.ingredients_mm ?? [];
  const steps = recipe.steps ?? recipe.steps_mm ?? [];
  const missingFields = recipe.missing_fields ?? [];
  return {
    ...recipe,
    ingredients,
    ingredients_mm: recipe.ingredients_mm ?? ingredients,
    ingredients_en: recipe.ingredients_en ?? [],
    steps,
    steps_mm: recipe.steps_mm ?? steps,
    source: recipe.source ?? 'local',
    needs_ai_completion: recipe.needs_ai_completion ?? false,
    missing_fields: missingFields,
  };
}

function validateRecipes(recipes) {
  const ids = new Set();
  const names = new Set();

  for (const recipe of recipes) {
    if (!recipe.id) throw new Error(`Recipe missing id: ${recipe.name_mm ?? '(unknown)'}`);
    if (!recipe.name_mm) throw new Error(`Recipe missing name_mm: ${recipe.id}`);
    if (!Array.isArray(recipe.ingredients)) throw new Error(`Recipe ingredients must be an array: ${recipe.id}`);
    if (!Array.isArray(recipe.steps)) throw new Error(`Recipe steps must be an array: ${recipe.id}`);
    if (ids.has(recipe.id)) throw new Error(`Duplicate recipe id: ${recipe.id}`);
    ids.add(recipe.id);

    const nameKey = recipeNameKey(recipe);
    if (names.has(nameKey)) throw new Error(`Duplicate recipe name: ${recipe.name_mm}`);
    names.add(nameKey);
  }
}

async function extractPdfText(pdfPath) {
  const data = await readFile(pdfPath);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function main() {
  const pdfPath = findPdf();
  const recipes = JSON.parse(await readFile(recipesPath, 'utf8'))
    .map(normalizeExistingRecipe)
    .filter((recipe) => recipe.source !== 'pdf');
  const existingNames = new Set(recipes.map(recipeNameKey));
  const usedIds = recipeIdSet(recipes);

  const pdfText = await extractPdfText(pdfPath);
  const extracted = splitBlocks(pdfText).map(extractRecipe).filter(Boolean);

  let added = 0;
  let skippedDuplicates = 0;
  let needsAiCompletion = 0;

  for (const recipe of extracted) {
    const nameKey = recipeNameKey(recipe);
    if (existingNames.has(nameKey)) {
      skippedDuplicates += 1;
      continue;
    }

    const uniqueRecipe = ensureUniqueId(recipe, usedIds);
    recipes.push(uniqueRecipe);
    existingNames.add(nameKey);
    added += 1;
    if (uniqueRecipe.needs_ai_completion) needsAiCompletion += 1;
  }

  validateRecipes(recipes);
  await writeFile(recipesPath, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    pdfPath,
    extracted: extracted.length,
    added,
    skippedDuplicates,
    needsAiCompletion,
    recipesPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
