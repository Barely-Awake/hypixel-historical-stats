import { readFile, writeFile } from 'fs/promises';
import { load } from 'js-yaml';

async function convertYaml() {
  const yaml = await readFile('./api-docs.yaml');
  const json = load(yaml.toString());

  await writeFile('./assets/swagger.json', JSON.stringify(json, null, 2));
}

convertYaml()
