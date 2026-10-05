# Sistema de Audios Dinámicos

La aplicación ahora soporta audios personalizados por **Tono** (1-13).

## Ubicación
Coloca tus archivos MP3 en la carpeta:
`frontend/public/assets/audio/tones/`

## Convención de Nombres
Los archivos deben nombrarse simplemente con el número del tono:
- `1.mp3` (Tono Magnético)
- `2.mp3` (Tono Lunar)
- ...
- `13.mp3` (Tono Cósmico)

## Comportamiento
1. La app intentará cargar el audio del tono correspondiente al Kin actual.
2. Si el archivo no existe o falla al cargar, **automáticamente** usará `ambient.mp3` como música de fondo por defecto.

## Futuro
Para agregar audios por Sello, se puede extender la lógica en `Home.jsx` siguiendo el mismo patrón.
