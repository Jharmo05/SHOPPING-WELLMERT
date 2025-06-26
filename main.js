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
            cuadriculaProductos.innerHTML = `<p>No se pudieron cargar los productos. Intenta recargar la página.</p>`;
        }
    };

    const renderizarProductos = (productos = todosLosProductos) => {
        cuadriculaProductos.innerHTML = '';
        if (productos.length === 0) {
            cuadriculaProductos.innerHTML = '<p>No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }

        productos.forEach(producto => {
            const tarjetaProducto = document.createElement('div');
            tarjetaProducto.className = 'product-card';
            tarjetaProducto.innerHTML = `
                <img src="${producto.image}" alt="${producto.title}" class="product-card__image">
                <div class="product-card__info">
                    <h3 class="product-card__title">${producto.title}</h3>
                    <p class="product-card__price">$${producto.price.toFixed(2)}</p>
                    <button class="product-card__button" data-id="${producto.id}">Agregar al carrito</button>
                </div>
            `;
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
    };
    
    const renderizarItemsCarrito = () => {
        contenedorItemsCarrito.innerHTML = '';
        if (Object.keys(carrito).length === 0) {
            contenedorItemsCarrito.innerHTML = '<p>El carrito está vacío.</p>';
            return;
        }

        Object.values(carrito).forEach(item => {
            const itemCarrito = document.createElement('div');
            itemCarrito.className = 'cart-item';
            itemCarrito.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <p>${item.title}</p>
                    <p>Cant: ${item.quantity} x $${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-from-cart" data-id="${item.id}">&times;</button>
                </div>
            `;
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