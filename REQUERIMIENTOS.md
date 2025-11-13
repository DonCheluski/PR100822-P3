# Requerimientos del Sistema - StockAI

## 1. Requerimientos Funcionales

### 1.1 Autenticación y Usuarios
- **RF-001**: El sistema debe permitir el registro de nuevos usuarios mediante email y contraseña
- **RF-002**: El sistema debe permitir el inicio de sesión de usuarios existentes con email y contraseña
- **RF-003**: El sistema debe confirmar automáticamente el email de los usuarios al registrarse
- **RF-004**: El sistema debe permitir cerrar sesión de forma segura
- **RF-005**: Los datos de cada usuario deben estar aislados mediante políticas de seguridad (RLS)

### 1.2 Gestión de Inventario
- **RF-006**: El sistema debe permitir crear nuevos artículos con los siguientes campos:
  - Nombre del artículo (obligatorio)
  - SKU/Código (obligatorio)
  - Cantidad (obligatorio, valor por defecto: 0)
  - Ubicación (opcional)
- **RF-007**: El sistema debe permitir visualizar todos los artículos del inventario del usuario
- **RF-008**: El sistema debe permitir editar la información de los artículos existentes
- **RF-009**: El sistema debe permitir eliminar artículos del inventario
- **RF-010**: El sistema debe ordenar los artículos por fecha de última actualización (más recientes primero)

### 1.3 Búsqueda y Filtrado
- **RF-011**: El sistema debe permitir buscar artículos por nombre
- **RF-012**: El sistema debe permitir buscar artículos por SKU
- **RF-013**: La búsqueda debe ser en tiempo real mientras el usuario escribe
- **RF-014**: La búsqueda debe ser insensible a mayúsculas/minúsculas

### 1.4 Estadísticas y Dashboard
- **RF-015**: El sistema debe mostrar el total de artículos en inventario
- **RF-016**: El sistema debe mostrar la cantidad de artículos con stock bajo (menos de 10 unidades)
- **RF-017**: El sistema debe mostrar la cantidad de artículos agotados (0 unidades)
- **RF-018**: Las estadísticas deben actualizarse automáticamente al modificar el inventario

### 1.5 Asistente de IA
- **RF-019**: El sistema debe incluir un asistente de chat con IA para consultas sobre el inventario
- **RF-020**: El asistente debe poder responder preguntas sobre stock disponible
- **RF-021**: El asistente debe poder buscar productos por nombre o SKU
- **RF-022**: El asistente debe poder generar sugerencias de reabastecimiento
- **RF-023**: El asistente debe poder crear carritos de compra automáticos identificando:
  - Items agotados (0 unidades)
  - Items con stock bajo (menos de 10 unidades)
  - Cantidad sugerida para pedir
  - Priorización por urgencia
- **RF-024**: El asistente debe proporcionar análisis de tendencias de inventario
- **RF-025**: El asistente debe ofrecer recomendaciones de organización
- **RF-026**: Todas las respuestas del asistente deben ser en español

## 2. Requerimientos No Funcionales

### 2.1 Usabilidad
- **RNF-001**: La interfaz debe ser responsive y adaptarse a dispositivos móviles
- **RNF-002**: La interfaz debe utilizar un sistema de diseño consistente con colores y estilos coherentes
- **RNF-003**: Las acciones principales deben estar accesibles con no más de 2 clics
- **RNF-004**: El sistema debe mostrar mensajes de retroalimentación claros (toasts) para las acciones importantes

### 2.2 Rendimiento
- **RNF-005**: La carga inicial del inventario debe completarse en menos de 3 segundos
- **RNF-006**: La búsqueda debe responder en tiempo real sin demoras perceptibles
- **RNF-007**: Las respuestas del asistente de IA deben comenzar a mostrarse en menos de 2 segundos

### 2.3 Seguridad
- **RNF-008**: Cada usuario solo debe poder acceder a sus propios datos
- **RNF-009**: Las contraseñas deben almacenarse de forma segura (hash)
- **RNF-010**: Las sesiones deben expirar automáticamente por seguridad
- **RNF-011**: Todas las comunicaciones con la API deben estar autenticadas

### 2.4 Disponibilidad
- **RNF-012**: El sistema debe estar disponible 24/7
- **RNF-013**: El sistema debe manejar errores de red de forma elegante con mensajes claros

### 2.5 Mantenibilidad
- **RNF-014**: El código debe seguir las mejores prácticas de React y TypeScript
- **RNF-015**: Los componentes deben ser reutilizables y modulares
- **RNF-016**: El sistema debe utilizar un sistema de diseño basado en tokens semánticos

## 3. Requerimientos Técnicos

### 3.1 Stack Tecnológico
- **RT-001**: Frontend desarrollado en React 18+ con TypeScript
- **RT-002**: Gestión de estado mediante React Hooks
- **RT-003**: Enrutamiento mediante React Router v6
- **RT-004**: Estilos con Tailwind CSS
- **RT-005**: Componentes UI basados en shadcn/ui
- **RT-006**: Backend con Supabase (Lovable Cloud)
- **RT-007**: Base de datos PostgreSQL con Row Level Security
- **RT-008**: Funciones serverless (Edge Functions) para lógica backend
- **RT-009**: Integración con Lovable AI Gateway (Google Gemini 2.5 Flash)

### 3.2 Estructura de Datos
- **RT-010**: Tabla `inventory_items` con campos:
  - id (UUID, primary key)
  - user_id (UUID, foreign key)
  - name (text, not null)
  - sku (text, not null)
  - quantity (integer, default 0)
  - location (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

### 3.3 Integraciones
- **RT-011**: Integración con Lovable AI para el asistente de chat
- **RT-012**: Uso de la API key de Lovable AI preconfigurada
- **RT-013**: Modelo de IA: Google Gemini 2.5 Flash

## 4. Casos de Uso Principales

### CU-001: Agregar Artículo al Inventario
**Actor**: Usuario autenticado  
**Flujo**:
1. Usuario navega al dashboard
2. Usuario hace clic en el botón "Agregar artículo"
3. Usuario completa el formulario con nombre, SKU, cantidad y ubicación
4. Usuario envía el formulario
5. Sistema valida los datos
6. Sistema guarda el artículo en la base de datos
7. Sistema muestra confirmación y redirige al dashboard

### CU-002: Consultar Stock con el Asistente de IA
**Actor**: Usuario autenticado  
**Flujo**:
1. Usuario hace clic en el ícono de chat
2. Usuario escribe una pregunta sobre el inventario
3. Sistema envía la consulta al asistente de IA con contexto del inventario
4. IA procesa la consulta y genera respuesta
5. Sistema muestra la respuesta al usuario

### CU-003: Crear Carrito de Compra Automático
**Actor**: Usuario autenticado  
**Flujo**:
1. Usuario solicita al asistente "armar un carrito de compra"
2. IA analiza el inventario completo
3. IA identifica items agotados y con stock bajo
4. IA calcula cantidades sugeridas de reabastecimiento
5. IA presenta lista organizada por prioridad con totales
6. Usuario revisa las recomendaciones

## 5. Criterios de Aceptación

- Todos los usuarios deben poder registrarse e iniciar sesión sin problemas
- Los datos de cada usuario deben estar completamente aislados
- La búsqueda debe funcionar correctamente con nombres parciales y SKUs
- Las estadísticas deben reflejar el estado real del inventario en todo momento
- El asistente de IA debe responder en español y generar carritos de compra precisos
- La interfaz debe ser completamente responsive en móviles y tablets
- No deben existir errores de consola en producción
