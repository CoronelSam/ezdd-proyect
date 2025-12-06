export { http, default as httpClient } from './http.service';

// servicios principales
export { default as authService } from './auth.service';
export { clientePerfilService } from './cliente-perfil.service';
export { default as clientesService } from './clientes.service';
export { default as inventariosService } from './inventarios.service';
export { default as pedidosService } from './pedidos.service';
export { default as productosService } from './productos.service';

// servicios complementarios
export { default as categoriasService } from './categorias.service';
export { default as empleadosService } from './empleados.service';
export { default as ingredientesService } from './ingredientes.service';
export { default as preciosService } from './precios.service';
export { default as recetasService } from './recetas.service';
export { default as usuariosService } from './usuarios.service';

// servicios de tiempo real
export { default as socketService } from './socket.service';

