document.addEventListener('DOMContentLoaded', () => {
    const cuadriculaProductos = document.getElementById('products-grid');
    const filtroCategoria = document.getElementById('category-filter');
    const ordenamiento = document.getElementById('sort-order');
    const campoBusqueda = document.getElementById('search-input');
    const contenedorItemsCarrito = document.getElementById('cart-items');
    const precioTotalCarrito = document.getElementById('cart-total-price');
    const botonVaciarCarrito = document.getElementById('clear-cart-button');
    const botonCarrito = document.querySelector('.cart-button');
    const barraLateralCarrito = document.getElementById('cart-sidebar');
    const botonCerrarCarrito = document.getElementById('close-cart-btn');
    const contadorItemsCarritoHeader = document.getElementById('cart-item-count');
    const totalPrecioCarritoHeader = document.getElementById('cart-total-header');

    let todosLosProductos = [];
    let carrito = {};

    const API_URL = 'https://fakestoreapi.com/products';

    const superposicion = document.createElement('div');
    superposicion.className = 'overlay';
    document.body.appendChild(superposicion);

    const toggleVisibilidadCarrito = () => {
        barraLateralCarrito.classList.toggle('is-visible');
        superposicion.classList.toggle('is-visible');
    };

    const obtenerProductos = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) {
                throw new Error(`Error HTTP! estado: ${respuesta.status}`);
            }
            todosLosProductos = await respuesta.json();
            cargarCarrito();
            poblarFiltroCategoria();
            renderizarProductos();
        } catch (error) {
            console.error("Error al obtener los productos:", error);
            const mensajeError = document.createElement('p');
            mensajeError.textContent = 'No se pudieron cargar los productos. Intenta recargar la página.';
            cuadriculaProductos.appendChild(mensajeError);
        }
    };

    const renderizarProductos = (productos = todosLosProductos) => {
        cuadriculaProductos.replaceChildren();
        if (productos.length === 0) {
            const mensajeNoEncontrado = document.createElement('p');
            mensajeNoEncontrado.textContent = 'No se encontraron productos que coincidan con tu búsqueda.';
            cuadriculaProductos.appendChild(mensajeNoEncontrado);
            return;
        }

        productos.forEach(producto => {
            const tarjetaProducto = document.createElement('div');
            tarjetaProducto.className = 'product-card';

            const imagen = document.createElement('img');
            imagen.src = producto.image;
            imagen.alt = producto.title;
            imagen.className = 'product-card__image';
            tarjetaProducto.appendChild(imagen);

            const infoProducto = document.createElement('div');
            infoProducto.className = 'product-card__info';

            const titulo = document.createElement('h3');
            titulo.className = 'product-card__title';
            titulo.textContent = producto.title;
            infoProducto.appendChild(titulo);

            const precio = document.createElement('p');
            precio.className = 'product-card__price';
            precio.textContent = `$${producto.price.toFixed(2)}`;
            infoProducto.appendChild(precio);

            const botonAgregar = document.createElement('button');
            botonAgregar.className = 'product-card__button';
            botonAgregar.dataset.id = producto.id;
            botonAgregar.textContent = 'Agregar al carrito';
            infoProducto.appendChild(botonAgregar);

            tarjetaProducto.appendChild(infoProducto);
            cuadriculaProductos.appendChild(tarjetaProducto);
        });
    };
    
    const poblarFiltroCategoria = () => {
        const categorias = [...new Set(todosLosProductos.map(p => p.category))];
        categorias.forEach(categoria => {
            const opcion = document.createElement('option');
            opcion.value = categoria;
            opcion.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            filtroCategoria.appendChild(opcion);
        });
    };

    const aplicarFiltrosYOrden = () => {
        let productosFiltrados = [...todosLosProductos];

        const categoriaSeleccionada = filtroCategoria.value;
        if (categoriaSeleccionada !== 'all') {
            productosFiltrados = productosFiltrados.filter(p => p.category === categoriaSeleccionada);
        }

        const terminoBusqueda = campoBusqueda.value.toLowerCase().trim();
        if (terminoBusqueda) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.title.toLowerCase().includes(terminoBusqueda) ||
                p.description.toLowerCase().includes(terminoBusqueda)
            );
        }

        const [ordenarPor, direccion] = ordenamiento.value.split('-');
        if (ordenarPor !== 'default') {
            productosFiltrados.sort((a, b) => {
                if (ordenarPor === 'price') {
                    return direccion === 'asc' ? a.price - b.price : b.price - a.price;
                }
                if (ordenarPor === 'name') {
                    return direccion === 'asc' 
                        ? a.title.localeCompare(b.title)
                        : b.title.localeCompare(a.title);
                }
                return 0;
            });
        }
        
        renderizarProductos(productosFiltrados);
    };

    
    const agregarAlCarrito = (idProducto) => {
        if (carrito[idProducto]) {
            carrito[idProducto].quantity++;
        } else {
            const producto = todosLosProductos.find(p => p.id === idProducto);
            if(producto) {
                carrito[idProducto] = { ...producto, quantity: 1 };
            }
        }
        actualizarCarrito();
    };

    const eliminarDelCarrito = (idProducto) => {
        if (carrito[idProducto]) {
            delete carrito[idProducto];
            actualizarCarrito();
        }
    };

    const vaciarCarrito = () => {
        carrito = {};
        actualizarCarrito();
    };

    const actualizarCarrito = () => {
        renderizarItemsCarrito();
        calcularTotalCarrito();
        guardarCarrito();
        const totalItems = Object.values(carrito).reduce((acc, item) => acc + item.quantity, 0);
        contadorItemsCarritoHeader.textContent = totalItems;
        
        const totalAmount = Object.values(carrito).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPrecioCarritoHeader.textContent = `$${totalAmount.toFixed(2)}`;
    };
    
    const renderizarItemsCarrito = () => {
        contenedorItemsCarrito.replaceChildren();
        if (Object.keys(carrito).length === 0) {
            const mensajeVacio = document.createElement('p');
            mensajeVacio.textContent = 'El carrito está vacío.';
            contenedorItemsCarrito.appendChild(mensajeVacio);
            return;
        }

        Object.values(carrito).forEach(item => {
            const itemCarrito = document.createElement('div');
            itemCarrito.className = 'cart-item';

            const imagen = document.createElement('img');
            imagen.src = item.image;
            imagen.alt = item.title;
            itemCarrito.appendChild(imagen);

            const infoItem = document.createElement('div');
            infoItem.className = 'cart-item-info';

            const titulo = document.createElement('p');
            titulo.textContent = item.title;
            infoItem.appendChild(titulo);

            const cantidadPrecio = document.createElement('p');
            cantidadPrecio.textContent = `Cant: ${item.quantity} x $${item.price.toFixed(2)}`;
            infoItem.appendChild(cantidadPrecio);

            itemCarrito.appendChild(infoItem);

            const accionesItem = document.createElement('div');
            accionesItem.className = 'cart-item-actions';

            const botonEliminar = document.createElement('button');
            botonEliminar.className = 'remove-from-cart';
            botonEliminar.dataset.id = item.id;
            botonEliminar.textContent = '×';
            accionesItem.appendChild(botonEliminar);

            itemCarrito.appendChild(accionesItem);
            contenedorItemsCarrito.appendChild(itemCarrito);
        });
    };

    const calcularTotalCarrito = () => {
        const total = Object.values(carrito).reduce((suma, item) => suma + (item.price * item.quantity), 0);
        precioTotalCarrito.textContent = `$${total.toFixed(2)}`;
    };

    const guardarCarrito = () => {
        localStorage.setItem('shoppingCart', JSON.stringify(carrito));
    };

    const cargarCarrito = () => {
        const carritoGuardado = localStorage.getItem('shoppingCart');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            actualizarCarrito();
        }
    };

    filtroCategoria.addEventListener('change', aplicarFiltrosYOrden);
    ordenamiento.addEventListener('change', aplicarFiltrosYOrden);
    campoBusqueda.addEventListener('input', aplicarFiltrosYOrden);
    
    botonCarrito.addEventListener('click', toggleVisibilidadCarrito);
    botonCerrarCarrito.addEventListener('click', toggleVisibilidadCarrito);
    superposicion.addEventListener('click', toggleVisibilidadCarrito);

    cuadriculaProductos.addEventListener('click', (e) => {
        if (e.target.matches('.product-card__button')) {
            const id = Number(e.target.dataset.id);
            agregarAlCarrito(id);
        }
    });

    contenedorItemsCarrito.addEventListener('click', (e) => {
        if (e.target.matches('.remove-from-cart')) {
            const id = Number(e.target.dataset.id);
            eliminarDelCarrito(id);
        }
    });

    botonVaciarCarrito.addEventListener('click', vaciarCarrito);

    obtenerProductos();
});