# Saberes Politécnicos — Guía de administración

## Descripción

**Saberes Politécnicos** es un sitio web estático para una revista científica digital de acceso abierto, asociada a la Universidad Politécnica Territorial del Estado Aragua (UPTA). No requiere servidor ni base de datos: todo el contenido se gestiona editando archivos JSON y se publica como archivos estáticos.

**Depósito Legal:** AR2026000105
**ISSN:** En trámite

---

## Estructura del proyecto

```
saberes-politecnicos-site/
├── index.html                     ← Página principal (toda la navegación)
├── styles.css                     ← Estilos del sitio
├── script.js                      ← Lógica de navegación, búsqueda, filtros
├── sitemap.xml                    ← Mapa del sitio para buscadores
├── README.md                      ← Esta guía
├── content/                       ← CONTENIDO EDITABLE
│   ├── articles.json              ← Artículos científicos
│   ├── repository.json            ← Proyectos de grado
│   └── site.json                  ← Datos generales de la revista
└── templates/                     ← Plantillas descargables
    ├── plantilla-articulo-cientifico.md
    └── plantilla-repositorio-proyecto.md
```

---

## Cómo editar el contenido

### Agregar un artículo científico

1. Abra el archivo `content/articles.json` con un editor de texto (VS Code, Notepad++, Gedit, etc.).
2. Copie un bloque existente y péguelo al final de la lista (antes del `]` de cierre).
3. Modifique los campos:

```json
{
  "id": "art-005",
  "titulo": "Título del nuevo artículo",
  "autores": ["Apellidos, Nombres"],
  "programa": "Nombre del PNFA",
  "resumen": "Texto del resumen...",
  "palabras_clave": ["palabra1", "palabra2", "palabra3"],
  "fecha": "2026-06-15",
  "volumen": "1",
  "numero": "2",
  "estado": "Publicado",
  "doi": "",
  "seccion": "Artículo de investigación"
}
```

4. Guarde el archivo. El cambio será visible al recargar el sitio.

**Importante:**
- El `id` debe ser único (use `art-` seguido de un número consecutivo).
- La `fecha` debe estar en formato `AAAA-MM-DD`.
- El `programa` debe coincidir con uno de los programas PNFA: Mecánica, Automatización, Control y Robótica, Informática mención Desarrollo de Software, Electricidad.

### Agregar un proyecto al repositorio

1. Abra `content/repository.json`.
2. Copie un bloque existente y modifique:

```json
{
  "id": "repo-007",
  "titulo": "Título del proyecto",
  "autores": ["Apellidos, Nombres"],
  "programa": "Nombre del PNF",
  "nivel": "Pregrado (PNF)",
  "tutor": "Prof. Nombre Completo",
  "anio": 2026,
  "resumen": "Texto del resumen...",
  "palabras_clave": ["palabra1", "palabra2"]
}
```

3. Guarde el archivo.

**Programas PNF válidos:** Instrumentación y Control, Electricidad, Electrónica, Telecomunicaciones, Mecánica, Mantenimiento, Administración, Contaduría Pública, Agroalimentación.

### Editar datos generales

Abra `content/site.json` para modificar:
- Nombre de la revista, descripción, misión, visión
- Miembros del comité editorial
- Políticas editoriales y de ética
- Correo de contacto
- Volumen y número actual

### Editar el comité editorial

En `content/site.json`, busque la sección `"comite_editorial"` y modifique los nombres:

```json
{
  "cargo": "Director(a) editorial",
  "nombre": "Prof. Nombre Real Aquí",
  "afiliacion": "UPTA"
}
```

---

## Cómo publicar cambios

### Opción 1: Servidor web simple

Copie toda la carpeta del proyecto al servidor web (Apache, Nginx, etc.) o a un servicio de hosting estático (GitHub Pages, Netlify, Vercel).

### Opción 2: Abrir localmente

Abra `index.html` directamente en un navegador. La búsqueda y los filtros funcionan con archivos locales si el navegador lo permite. Para mejor compatibilidad, use un servidor local:

```bash
# Con Python 3
cd saberes-politecnicos-site
python3 -m http.server 8000

# Abra http://localhost:8000 en el navegador
```

---

## Recomendaciones

### Software libre para gestión editorial

Para gestionar el flujo editorial completo (envíos, arbitraje, edición, publicación), se recomienda adoptar **Open Journal Systems (OJS)**, el software libre más utilizado en el mundo académico para revistas científicas.

- Sitio web: https://pkp.sfu.ca/software/ojs/
- Documentación: https://docs.pkp.sfu.ca/
- OJS permite gestionar todo el proceso de forma transparente, con soporte para metadatos, DOI, indexación y acceso abierto.

### Formatos de trabajo

- Las plantillas en `templates/` están en formato Markdown (`.md`).
- También se aceptan archivos `.docx` y `.odt`.
- Se recomienda usar **Zotero** o **Mendeley** como gestores de referencias bibliográficas.

---

## Soporte técnico

Para dudas sobre la edición del sitio, contacte al equipo de soporte técnico o actualice primero el correo institucional en `content/site.json`.

---

*Saberes Politécnicos — Revista Científica Digital*
*Depósito Legal: AR2026000105*
*Universidad Politécnica Territorial del Estado Aragua (UPTA)*
"# Revista-cient-fica-" 
