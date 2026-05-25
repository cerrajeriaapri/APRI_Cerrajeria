# Cerrajeria APRI - Android / Play Store

Este proyecto Android envuelve la app web de Cerrajeria APRI en un WebView nativo.

## Como generar el archivo para Play Store

1. Abrir la carpeta `android-app` con Android Studio.
2. Esperar a que Android Studio sincronice Gradle.
3. Ir a `Build > Generate Signed App Bundle / APK`.
4. Elegir `Android App Bundle`.
5. Crear o seleccionar una llave de firma.
6. Generar el archivo `app-release.aab`.
7. Subir ese `.aab` a Google Play Console.

## Datos importantes

- Package name: `com.cerrajeriaapri.app`
- Version inicial: `1.0.0`
- Version code: `1`
- La app abre WhatsApp, llamadas telefonicas y Google Maps como aplicaciones externas.
- La carga de fotos se usa para que el cliente pueda mostrar llaves, cerraduras, puertas o cajas fuertes.

## Antes de publicar

- Reemplazar el link de ubicacion del taller por la direccion exacta de Cerrajeria APRI.
- Crear una politica de privacidad, porque la app solicita fotos/camara.
- Generar capturas de pantalla para Play Store.
- Revisar nombre, descripcion corta y descripcion completa en Play Console.
