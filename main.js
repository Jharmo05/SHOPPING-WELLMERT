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

    const botonFavoritos = document.querySelector('.favorites-button');
    const barraLateralFavoritos = document.getElementById('favorites-sidebar');
    const botonCerrarFavoritos = document.getElementById('close-favorites-btn');
    const contenedorItemsFavoritos = document.getElementById('favorites-items');
    const botonVaciarFavoritos = document.getElementById('clear-favorites-button');
    const contadorItemsFavoritosHeader = document.getElementById('favorites-item-count');

    let todosLosProductos = [];
    let carrito = {};
    let favoritos = [];

    const API_URL = 'https://fakestoreapi.com/products';

    const superposicion = document.createElement('div');
    superposicion.className = 'overlay';
    document.body.appendChild(superposicion);

    const toggleVisibilidadCarrito = () => {
        barraLateralCarrito.classList.toggle('is-visible');
        if (barraLateralFavoritos.classList.contains('is-visible')) {
            barraLateralFavoritos.classList.remove('is-visible');
        }
        superposicion.classList.toggle('is-visible');
    };

    const toggleVisibilidadFavoritos = () => {
        barraLateralFavoritos.classList.toggle('is-visible');
        if (barraLateralCarrito.classList.contains('is-visible')) {
            barraLateralCarrito.classList.remove('is-visible');
        }
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
            cargarFavoritos();
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

            const botonFavorito = document.createElement('button');
            botonFavorito.className = 'add-to-favorites-btn';
            botonFavorito.dataset.id = producto.id;
            const esFavorito = favoritos.some(fav => fav.id === producto.id);
            if (esFavorito) {
                botonFavorito.classList.add('favorited');
            }
            botonFavorito.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            tarjetaProducto.appendChild(botonFavorito);

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

    const incrementarCantidad = (idProducto) => {
        if (carrito[idProducto]) {
            carrito[idProducto].quantity++;
            actualizarCarrito();
        }
    };

    const decrementarCantidad = (idProducto) => {
        if (carrito[idProducto]) {
            carrito[idProducto].quantity--;
            if (carrito[idProducto].quantity <= 0) {
                delete carrito[idProducto];
            }
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

            const controlCantidad = document.createElement('div');
            controlCantidad.className = 'quantity-control';

            const botonMenos = document.createElement('button');
            botonMenos.textContent = '-';
            botonMenos.className = 'quantity-btn decrement';
            botonMenos.dataset.id = item.id;
            controlCantidad.appendChild(botonMenos);

            const cantidadSpan = document.createElement('span');
            cantidadSpan.textContent = item.quantity;
            cantidadSpan.className = 'item-quantity';
            controlCantidad.appendChild(cantidadSpan);

            const botonMas = document.createElement('button');
            botonMas.textContent = '+';
            botonMas.className = 'quantity-btn increment';
            botonMas.dataset.id = item.id;
            controlCantidad.appendChild(botonMas);

            infoItem.appendChild(controlCantidad);

            const precioUnitario = document.createElement('p');
            precioUnitario.textContent = `$${item.price.toFixed(2)} c/u`;
            infoItem.appendChild(precioUnitario);

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

    const agregarQuitarFavorito = (idProducto) => {
        const index = favoritos.findIndex(fav => fav.id === idProducto);
        if (index > -1) {
            favoritos.splice(index, 1);
        } else {
            const producto = todosLosProductos.find(p => p.id === idProducto);
            if (producto) {
                favoritos.push(producto);
            }
        }
        actualizarFavoritos();
        renderizarProductos(aplicarFiltrosYOrden('returnProducts'));
    };

    const eliminarDeFavoritos = (idProducto) => {
        favoritos = favoritos.filter(fav => fav.id !== idProducto);
        actualizarFavoritos();
        renderizarProductos(aplicarFiltrosYOrden('returnProducts'));
    };

    const vaciarFavoritos = () => {
        favoritos = [];
        actualizarFavoritos();
        renderizarProductos(aplicarFiltrosYOrden('returnProducts'));
    };

    const actualizarFavoritos = () => {
        renderizarItemsFavoritos();
        guardarFavoritos();
        contadorItemsFavoritosHeader.textContent = favoritos.length;
    };

    const renderizarItemsFavoritos = () => {
        contenedorItemsFavoritos.replaceChildren();
        if (favoritos.length === 0) {
            const mensajeVacio = document.createElement('p');
            mensajeVacio.textContent = 'No tienes productos favoritos.';
            contenedorItemsFavoritos.appendChild(mensajeVacio);
            return;
        }

        favoritos.forEach(item => {
            const itemFavorito = document.createElement('div');
            itemFavorito.className = 'favorite-item';

            const imagen = document.createElement('img');
            imagen.src = item.image;
            imagen.alt = item.title;
            itemFavorito.appendChild(imagen);

            const infoItem = document.createElement('div');
            infoItem.className = 'favorite-item-info';

            const titulo = document.createElement('p');
            titulo.textContent = item.title;
            infoItem.appendChild(titulo);

            const precio = document.createElement('p');
            precio.textContent = `$${item.price.toFixed(2)}`;
            infoItem.appendChild(precio);

            itemFavorito.appendChild(infoItem);

            const accionesItem = document.createElement('div');
            accionesItem.className = 'favorite-item-actions';
            
            const botonAgregarACarrito = document.createElement('button');
            botonAgregarACarrito.textContent = '🛒';
            botonAgregarACarrito.className = 'add-from-favorites-to-cart';
            botonAgregarACarrito.dataset.id = item.id;
            accionesItem.appendChild(botonAgregarACarrito);

            const botonEliminar = document.createElement('button');
            botonEliminar.className = 'remove-from-favorites';
            botonEliminar.dataset.id = item.id;
            botonEliminar.textContent = '×';
            accionesItem.appendChild(botonEliminar);

            itemFavorito.appendChild(accionesItem);
            contenedorItemsFavoritos.appendChild(itemFavorito);
        });
    };

    const guardarFavoritos = () => {
        localStorage.setItem('favoriteProducts', JSON.stringify(favoritos));
    };

    const cargarFavoritos = () => {
        const favoritosGuardados = localStorage.getItem('favoriteProducts');
        if (favoritosGuardados) {
            favoritos = JSON.parse(favoritosGuardados);
            actualizarFavoritos();
        }
    };

    filtroCategoria.addEventListener('change', aplicarFiltrosYOrden);
    ordenamiento.addEventListener('change', aplicarFiltrosYOrden);
    campoBusqueda.addEventListener('input', aplicarFiltrosYOrden);
    
    botonCarrito.addEventListener('click', toggleVisibilidadCarrito);
    botonCerrarCarrito.addEventListener('click', toggleVisibilidadCarrito);
    botonFavoritos.addEventListener('click', toggleVisibilidadFavoritos);
    botonCerrarFavoritos.addEventListener('click', toggleVisibilidadFavoritos);
    superposicion.addEventListener('click', () => {
        if (barraLateralCarrito.classList.contains('is-visible') || barraLateralFavoritos.classList.contains('is-visible')) {
            barraLateralCarrito.classList.remove('is-visible');
            barraLateralFavoritos.classList.remove('is-visible');
            superposicion.classList.remove('is-visible');
        }
    });

    cuadriculaProductos.addEventListener('click', (e) => {
        if (e.target.matches('.product-card__button')) {
            const id = Number(e.target.dataset.id);
            agregarAlCarrito(id);
        } else if (e.target.closest('.add-to-favorites-btn')) {
            const id = Number(e.target.closest('.add-to-favorites-btn').dataset.id);
            agregarQuitarFavorito(id);
        }
    });

    contenedorItemsCarrito.addEventListener('click', (e) => {
        const id = Number(e.target.dataset.id);
        if (e.target.matches('.remove-from-cart')) {
            eliminarDelCarrito(id);
        } else if (e.target.matches('.quantity-btn.increment')) {
            incrementarCantidad(id);
        } else if (e.target.matches('.quantity-btn.decrement')) {
            decrementarCantidad(id);
        }
    });

    contenedorItemsFavoritos.addEventListener('click', (e) => {
        const id = Number(e.target.dataset.id);
        if (e.target.matches('.remove-from-favorites')) {
            eliminarDeFavoritos(id);
        } else if (e.target.matches('.add-from-favorites-to-cart')) {
            agregarAlCarrito(id);
        }
    });

    botonVaciarCarrito.addEventListener('click', vaciarCarrito);
    botonVaciarFavoritos.addEventListener('click', vaciarFavoritos);

    obtenerProductos();
});