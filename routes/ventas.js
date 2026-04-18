const express = require('express');
const router = express.Router();
const { leerJSON, escribirJSON } = require('../utils/dataHandler');

router.get('/', (req, res) => {
  const ventas = leerJSON('ventas.json');
  res.json(ventas);
});

router.get('/:id', (req, res) => {
  const ventas = leerJSON('ventas.json');
  const venta = ventas.find(v => v.id === parseInt(req.params.id));
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json(venta);
});

router.post('/por-usuario', (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) return res.status(400).json({ error: 'id_usuario es requerido' });
  const ventas = leerJSON('ventas.json');
  const ventasUsuario = ventas.filter(v => v.id_usuario === id_usuario);
  res.json(ventasUsuario);
});

router.post('/', (req, res) => {
  const { id_usuario, direccion, envio_express, productos } = req.body;
  if (!id_usuario || !direccion || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'id_usuario, direccion y productos (array) son requeridos' });
  }

  const usuarios = leerJSON('usuarios.json');
  const usuario = usuarios.find(u => u.id === id_usuario);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

  const productosDB = leerJSON('productos.json');
  let total = 0;
  for (const item of productos) {
    const prod = productosDB.find(p => p.id === item.id_producto);
    if (!prod) return res.status(404).json({ error: `Producto con id ${item.id_producto} no encontrado` });
    const cant = item.cantidad || 1;
    if (prod.stock < cant) {
      return res.status(400).json({ error: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}` });
    }
    total += prod.precio * cant;
  }

  for (const item of productos) {
    const prod = productosDB.find(p => p.id === item.id_producto);
    prod.stock -= (item.cantidad || 1);
  }
  escribirJSON('productos.json', productosDB);

  const ventas = leerJSON('ventas.json');
  const nuevaVenta = {
    id: ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1,
    id_usuario,
    fecha: new Date().toISOString().split('T')[0],
    total,
    direccion,
    envio_express: envio_express || false,
    productos
  };
  ventas.push(nuevaVenta);
  escribirJSON('ventas.json', ventas);
  res.status(201).json(nuevaVenta);
});

router.put('/:id', (req, res) => {
  const ventas = leerJSON('ventas.json');
  const index = ventas.findIndex(v => v.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Venta no encontrada' });

  const { direccion, envio_express } = req.body;
  if (direccion) ventas[index].direccion = direccion;
  if (typeof envio_express === 'boolean') ventas[index].envio_express = envio_express;

  escribirJSON('ventas.json', ventas);
  res.json(ventas[index]);
});

module.exports = router;
