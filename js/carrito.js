document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("carrito-container");
  const totalDiv = document.getElementById("carrito-total");
  const accionesDiv = document.getElementById("carrito-acciones");

  function renderCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

    if (carrito.length === 0) {
      contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
      totalDiv.innerHTML = "";
      accionesDiv.innerHTML = `<a href="/pages/productos.html" class="btn">Ver productos</a>`;
      return;
    }

    let html = `<table class="carrito-tabla">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>`;

    let total = 0;
    carrito.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      html += `<tr>
        <td>${item.nombre}</td>
        <td>$${item.precio}</td>
        <td>
          <button class="cantidad-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
          <span>${item.cantidad}</span>
          <button class="cantidad-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
        </td>
        <td>$${subtotal}</td>
        <td><button class="btn btn-eliminar" onclick="eliminarItem(${index})">X</button></td>
      </tr>`;
    });

    html += `</tbody></table>`;
    contenedor.innerHTML = html;
    totalDiv.innerHTML = `<h3>Total: $${total}</h3>`;

    accionesDiv.innerHTML = `
      <button class="btn" onclick="vaciarCarrito()">Vaciar carrito</button>
      <button class="btn btn-comprar" onclick="realizarCompra()">Confirmar compra</button>
    `;
  }

  window.cambiarCantidad = function(index, delta) {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
    crearNavbar();
  };

  window.eliminarItem = function(index) {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
    crearNavbar();
  };

  window.vaciarCarrito = function() {
    localStorage.setItem("carrito", JSON.stringify([]));
    renderCarrito();
    crearNavbar();
  };

  window.realizarCompra = async function() {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!usuario) {
      alert("Debes iniciar sesión para comprar.");
      window.location.href = "/pages/login.html";
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    if (carrito.length === 0) return;

    const direccion = prompt("Ingresá tu dirección de envío:");
    if (!direccion) return;

    const envio_express = confirm("¿Querés envío express?");

    const venta = {
      id_usuario: usuario.id,
      direccion,
      envio_express,
      productos: carrito.map(item => ({
        id_producto: item.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Error al realizar la compra: " + error.error);
        return;
      }

      const resultado = await res.json();
      alert(`¡Compra realizada! Orden #${resultado.id} - Total: $${resultado.total}`);
      localStorage.setItem("carrito", JSON.stringify([]));
      renderCarrito();
      crearNavbar();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  renderCarrito();
});
