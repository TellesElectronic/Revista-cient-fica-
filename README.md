# Saberes Politécnicos — Revista Científica Digital

**Portal web institucional** de la revista científica digital de acceso abierto, asociada a la **Universidad Politécnica Territorial del Estado Aragua (UPTA)** — Federico Brito Figueroa.

## Descripción

Saberes Politécnicos es una publicación semestral orientada a la divulgación de artículos de investigación (maestría PNFA) y proyectos de grado (pregrado PNF) en áreas de ingeniería, tecnología, administración y ciencias aplicadas.

**Depósito Legal:** AR2026000105  
**ISSN:** En trámite

## Estructura del sitio

El sitio es una **web estática** (HTML + CSS + JS) compatible con despliegue en **Vercel** u otro hosting estático.

### Secciones principales

| Sección | Descripción |
|---|---|
| **Inicio** | Hero institucional con logo UPT, convocatoria abierta, artículos recientes |
| **Artículos** | Listado de artículos científicos con búsqueda y filtros por programa |
| **Repositorio** | Proyectos de grado de pregrado con búsqueda y filtros |
| **Sobre la revista** | Presentación, misión, visión, alcance, política editorial |
| **Normas** | Guía completa para autores (estructura, formato, flujo editorial) |
| **Envíos** | Formularios de envío de artículos y proyectos de grado |
| **Comité** | Equipo editorial |
| **Portal institucional** | Sistema de acceso y registro por perfiles (ver abajo) |
| **Contacto** | Información de contacto y formulario |

### Portal institucional (nuevo)

El portal ofrece 4 perfiles diferenciados:

1. **Administrador** — Dashboard con edición de configuración general, comité editorial, artículos y convocatorias. Permite exportar datos como JSON para actualizar los archivos del sitio.

2. **Evaluador** — Registro de árbitros evaluadores con campos profesionales completos. Panel demostrativo de evaluaciones asignadas con emisión de dictámenes.

3. **Estudiantes** — Registro de pregrado (PNF) y postgrado (PNFA). Panel de envíos con historial, estado y formulario de nuevo envío.

4. **Público general** — Suscripción por correo electrónico para recibir ediciones digitales y avisos de la revista.

> **Nota:** El portal es demostrativo en frontend. No utiliza backend ni localStorage. Los datos editados en el panel de administración se pueden exportar como JSON.

## Archivos

```
├── index.html                  # Página principal (SPA con hash routing)
├── styles.css                  # Estilos completos (light/dark mode)
├── script.js                   # Lógica: navegación, datos, portal, forms
├── assets/
│   └── logo-upt.jpg            # Logo institucional UPT
├── content/
│   ├── site.json               # Configuración de la revista
│   ├── articles.json           # Artículos científicos
│   └── repository.json         # Proyectos de grado
├── templates/
│   ├── plantilla-articulo-cientifico.md
│   └── plantilla-repositorio-proyecto.md
├── favicon.svg
├── sitemap.xml
├── vercel.json
└── README.md
```

## Despliegue

### Vercel (recomendado)

1. Conecte el repositorio a Vercel
2. Framework preset: **Other**
3. Build command: (vacío — no requiere build)
4. Output directory: `.`
5. Desplegar

### Otros hosting estáticos

Suba todos los archivos tal como están. No requiere procesamiento ni compilación.

## Personalización

### Datos de la revista

Edite los archivos JSON en `content/`:
- `site.json` — nombre, institución, comité editorial, programas
- `articles.json` — artículos científicos
- `repository.json` — proyectos de grado

También puede usar el **Panel de administración** del portal para editar y exportar la configuración como JSON.

### Identidad visual

- Logo: reemplace `assets/logo-upt.jpg` con el logo institucional actualizado
- Colores: modifique las variables CSS en `:root` y `[data-theme="dark"]` en `styles.css`
- Tipografía: Instrument Serif (display) + Source Sans 3 (body), cargadas desde Google Fonts

### Correo institucional

Busque `[correo institucional por definir]` en `content/site.json` e `index.html` para configurar el correo de contacto oficial.

## Recomendación editorial

Para una gestión editorial completa a largo plazo, se recomienda la adopción de **[Open Journal Systems (OJS)](https://pkp.sfu.ca/software/ojs/)**, software libre del Public Knowledge Project (PKP).

## Licencia

Contenido editorial © 2026 Saberes Politécnicos — UPTA.  
Código del sitio web disponible para uso institucional.
