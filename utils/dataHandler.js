import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function leerJSON(archivo) {
  const ruta = path.join(__dirname, '..', 'data', archivo);
  const contenido = fs.readFileSync(ruta, 'utf-8');
  return JSON.parse(contenido);
}

function escribirJSON(archivo, datos) {
  const ruta = path.join(__dirname, '..', 'data', archivo);
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf-8');
}

export { leerJSON, escribirJSON };
