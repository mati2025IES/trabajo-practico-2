import express from 'express';
import { leerJSON, escribirJSON } from '../utils/dataHandler.js';

const router = express.Router();

router.get('/', (req, res) => {
  const productos = leerJSON('productos.json');
  res.json(productos);
});

router.get('/:id', (req, res) => {
  const productos = leerJSON('productos.json');
  const producto = productos.find(p => p.id === parseInt(req.params.id));
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

router.post('/buscar', (req, res) => {
  const { categoria, precio_min, precio_max, destacado } = req.body;
  let productos = leerJSON('productos.json');

  if (categoria) productos = productos.filter(p => p.categoria === categoria);
  if (precio_min) productos = productos.filter(p => p.precio >= precio_min);
  if (precio_max) productos = productos.filter(p => p.precio <= precio_max);
  if (typeof destacado === 'boolean') productos = productos.filter(p => p.destacado === destacado);

  res.json(productos);
});

router.post('/', (req, res) => {
  const { nombre, desc, precio, imagen, categoria, stock, destacado } = req.body;
  if (!nombre || !desc || !precio || !categoria) {
    return res.status(400).json({ error: 'Nombre, desc, precio y categoria son requeridos' });
  }
  const productos = leerJSON('productos.json');
  const nuevoProducto = {
    id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    nombre,
    desc,
    precio,
    imagen: imagen || null,
    categoria,
    stock: stock || 0,
    destacado: destacado || false
  };
  productos.push(nuevoProducto);
  escribirJSON('productos.json', productos);
  res.status(201).json(nuevoProducto);
});

router.put('/:id', (req, res) => {
  const productos = leerJSON('productos.json');
  const index = productos.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const { nombre, desc, precio, imagen, categoria, stock, destacado } = req.body;
  if (nombre) productos[index].nombre = nombre;
  if (desc) productos[index].desc = desc;
  if (precio) productos[index].precio = precio;
  if (imagen) productos[index].imagen = imagen;
  if (categoria) productos[index].categoria = categoria;
  if (typeof stock === 'number') productos[index].stock = stock;
  if (typeof destacado === 'boolean') productos[index].destacado = destacado;

  escribirJSON('productos.json', productos);
  res.json(productos[index]);
});

export default router;
