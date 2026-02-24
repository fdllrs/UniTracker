# UniTracker 🎓

UniTracker es una herramienta interactiva diseñada para visualizar y gestionar planes de estudio universitarios de forma clara y moderna. Permite hacer un seguimiento detallado del progreso académico, calcular promedios y entender las dependencias entre materias.

## ✨ Características Principales

### 📊 Visualización de Grafo Inteligente
- **Grafo de Materias**: Un diseño limpio organizado por años y cuatrimestres.
- **Flechas de Dependencia**: Sistema de rutas ortogonales (giros de 90°) que conectan materias correlativas sin cruzar por encima de las tarjetas.
- **Resaltado Dinámico**: Al pasar el mouse sobre una materia, se iluminan sus correlativas (anteriores y posteriores) y se atenúa el resto del grafo para mejorar la visibilidad.

### 📝 Gestión Académica
- **Estados de Materia**:
  - `Pendiente`: Materia no cursada.
  - `Puedo Cursar`: Se desbloquea automáticamente cuando se cumplen las correlativas.
  - `Regular`: Materia cursada pero final pendiente.
  - `Aprobada`: Materia completada totalmente.
- **Cálculo de Promedio**: Ingresa tus notas y visualiza tu promedio general actualizado en tiempo real en la cabecera.
- **Carga Horaria**: Seguimiento de horas semanales por materia y totales por plan.

### 🛠️ Editor de Planes
- **Modo Edición**: Interfaz intuitiva para personalizar tu plan.
- **Drag & Drop**: Reordena materias entre cuatrimestres simplemente arrastrándolas.
- **Gestión de Correlativas**: Crea o elimina dependencias arrastrando desde el ícono de vínculo de una materia a otra.
- **Añadir/Quitar**: Agregá materias o cuatrimestres enteros con un clic.

### 💾 Persistencia y Plantillas
- **Auto-guardado**: Todo tu progreso y ediciones se guardan automáticamente en el almacenamiento local de tu navegador (`localStorage`).
- **Planes de Ejemplo**: Acceso a una biblioteca de planes pre-cargados (UBA, ITBA, UTN, UNA, etc.) para comenzar rápidamente.

## 🚀 Cómo empezar

1. **Instalación**:
   ```bash
   npm install
   ```

2. **Ejecución**:
   ```bash
   npm run dev
   ```

3. **Acceso**: Abre tu navegador en la dirección indicada por la terminal (usualmente `http://localhost:5173`).

---
Desarrollado con React y mucha dedicación para mejorar la experiencia académica.
