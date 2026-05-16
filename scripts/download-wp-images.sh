#!/usr/bin/env bash
# Descarga todas las imágenes referenciadas en el export de WordPress
# y las guarda en public/uploads/wp/AAAA/MM/archivo.ext preservando la
# estructura original. Idempotente: si la imagen ya existe, la salta.
#
# Uso:
#   chmod +x scripts/download-wp-images.sh
#   ./scripts/download-wp-images.sh
#
# Requiere: curl (viene en macOS por defecto)

set -e

cd "$(dirname "$0")/.."   # raíz del proyecto
DEST="public/uploads/wp"
mkdir -p "$DEST"

# Lista de URLs (142 imágenes). Generada automáticamente desde el XML.
URLS=(
  "https://ortegaortegaabogados.com/wp-content/uploads/2023/08/jlo_podio2-819x1024.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2022/09/Captura-de-Pantalla-2023-06-06-a-las-13.55.59.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2022/11/Captura-de-Pantalla-2023-06-06-a-las-13.52.39.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2022/12/Cárceles-1.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/03/Captura-de-Pantalla-2023-06-06-a-las-13.32.42.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/03/Captura-de-Pantalla-2023-06-06-a-las-13.36.49.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/63b4bcfec8346.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/Captura-de-Pantalla-2023-06-06-a-las-12.29.44.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/Captura-de-Pantalla-2023-06-06-a-las-12.47.33.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/Captura-de-Pantalla-2023-06-06-a-las-13.04.03.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/Captura-de-Pantalla-2023-06-06-a-las-13.29.55.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/Cárceles-1.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/IMG_3127.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/IMG_3197.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/IMG_4881.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/IMG_5563.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/jlo1.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/jlo2.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/jlo4.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/04/jlo5.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-09-at-09.06.46.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/3.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/Diseno-sin-titulo-21.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/Diseno-sin-titulo-23-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/FONDO-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/FONDO_1-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/FONDO_2-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/FONDO_3-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_0072.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_0467_edited_edited-1.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_2905-1-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_3067_edited.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_4808-2-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_5101_edited.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_5105-1.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_5107-1-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/IMG_5109_edited_edited.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/PHOTO-2021-10-12-18-58-17.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/PHOTO-2022-08-22-10-36-49-11.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/PHOTO-2022-08-22-10-36-49-3.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/PHOTO-2022-08-22-10-36-49-5.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/PHOTO-2022-08-22-10-36-49-6.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/PHOTO-2022-08-22-10-36-49-8_edited.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/Sala-de-Reuniones-Ortega-Ortega-Abogados.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/Sin-titulo-1080-×-400-px-400-×-400-px-400-×-220-px.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/Sin-titulo-1080-×-400-px-700-×-300-px-1080-×-400-px.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/cropped-Diseno-sin-titulo-21-1.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/cropped-Diseno-sin-titulo-21.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/file.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/fondo2-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/jlo1.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/jlo11.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/jlo3.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/06/low20angle20photography20of20beige20building_edited-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/07/abril-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/07/ana_cris.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/08/jlo22.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/08/jlo_podio2.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/08/jlos.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/09/WhatsApp-Image-2024-03-20-at-10.38.50.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2023/10/WhatsApp-Image-2024-03-20-at-10.48.36.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/01/WhatsApp-Image-2024-03-20-at-10.18.03.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/01/WhatsApp-Image-2024-03-20-at-10.27.47-e1710948636824.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/01/WhatsApp-Image-2024-03-20-at-10.31.54.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/01/WhatsApp-Image-2024-03-20-at-10.46.25.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/02/WhatsApp-Image-2024-02-27-at-14.22.30.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/02/WhatsApp-Image-2024-03-20-at-10.18.03-e1710947977964.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/04/IMG_1513.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/05/WhatsApp-Image-2024-05-16-at-5.55.54-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/06/IMG_2594-1.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/06/IMG_2594-2-e1717630015941.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/06/IMG_2594.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/06/IMG_2596.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/06/IMG_2962.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/06/IMG_3230.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/07/IMG_4492.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/CAMI.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/CAMILA.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/IMG_7201.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/IMG_7731.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/JUANJOSE.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-20-at-4.38.25-PM-scaled.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-20-at-4.41.11-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-23-at-9.17.41-AM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/office_ooa.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/oficina_ooa2.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/08/oficina_ooa3.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/09/WhatsApp-Image-2024-09-06-at-4.59.02-PM-e1725659999202.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-21-at-9.39.18-AM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/01/Dic-12-Ortega-77-CAMBIO-1.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-09-at-4.03.24-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-14-at-5.51.58-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/03/WhatsApp-Image-2025-03-10-at-5.06.18-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/04/IMG_4086-1.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/04/IMG_4086.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/04/IMG_4098.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/04/WhatsApp-Image-2025-04-08-at-5.32.51-PM-scaled.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/OO-1.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/OO.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/Ortega-Fotos-145-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-07-at-4.43.06-PM-scaled.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-20-at-09.35.45-1.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-20-at-09.35.45-2.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-20-at-09.35.45.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-20-at-10.53.40-AM-scaled.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-21-at-11.53.06-AM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-21-at-11.58.54-AM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-28-at-5.22.42-PM-1.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-28-at-5.22.42-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/06/Fotos-Ortega-032-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/06/Fotos-Ortega-048-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-10-at-10.14.16-AM-scaled.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-10-at-12.06.03-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-10-at-12.08.43-PM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/Captura-de-pantalla-2025-07-14-a-las-11.18.39 a.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/Captura-de-pantalla-2025-07-14-a-las-3.25.49 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/Captura-de-pantalla-2025-07-14-a-las-3.32.32 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/Captura-de-pantalla-2025-07-14-a-las-9.31.35 a.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/Captura-de-pantalla-2025-07-21-a-las-11.40.45 a.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/Captura-de-pantalla-2025-07-22-a-las-4.30.45 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/IMG_2474.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/IMG_2481.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/IMG_3447.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/Unknown.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-01-at-8.57.20-AM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/08/Captura-de-pantalla-2025-08-20-a-las-3.08.21 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-22-at-7.51.46-AM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-22-at-9.48.38-AM-copia.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/01/IMG_3684-scaled.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-06-at-8.00.13-AM.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/02/Captura-de-pantalla-2026-02-03-a-las-11.20.00 a.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/02/Captura-de-pantalla-2026-02-20-a-las-12.17.13 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/02/Captura-de-pantalla-2026-02-20-a-las-12.20.39 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/Captura-de-pantalla-2026-03-06-a-las-1.38.46 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/Captura-de-pantalla-2026-03-12-a-las-10.27.32 a.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/Captura-de-pantalla-2026-03-25-a-las-3.41.10 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/Captura-de-pantalla-2026-03-25-a-las-3.44.44 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/Captura-de-pantalla-2026-03-25-a-las-3.48.59 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/Captura-de-pantalla-2026-03-25-a-las-3.57.56 p.-m.png"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/IMG_8108-scaled.jpg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-13-at-15.15.57.jpeg"
  "https://www.ortegaortegaabogados.com/wp-content/uploads/2026/05/Captura-de-pantalla-2026-05-12-a-las-9.55.39 a.-m.png"
)

total=${#URLS[@]}
ok=0
skip=0
fail=0
i=0

echo "Descargando $total imágenes a $DEST ..."
echo

for url in "${URLS[@]}"; do
  i=$((i+1))
  # Quita el prefijo https://(www.)?ortegaortegaabogados.com/wp-content/uploads/
  rel="${url#*wp-content/uploads/}"
  out="$DEST/$rel"
  mkdir -p "$(dirname "$out")"

  if [ -f "$out" ] && [ -s "$out" ]; then
    skip=$((skip+1))
    printf "  [%3d/%3d] SKIP  %s\n" "$i" "$total" "$rel"
    continue
  fi

  http_code=$(curl -sL -w "%{http_code}" -o "$out.tmp" \
    -A "Mozilla/5.0 ortega-migrator" --max-time 30 "$url" || echo "000")

  if [ "$http_code" = "200" ] && [ -s "$out.tmp" ]; then
    mv "$out.tmp" "$out"
    ok=$((ok+1))
    printf "  [%3d/%3d] OK    %s\n" "$i" "$total" "$rel"
  else
    rm -f "$out.tmp"
    fail=$((fail+1))
    printf "  [%3d/%3d] FAIL (%s) %s\n" "$i" "$total" "$http_code" "$rel"
  fi
done

echo
echo "Listo. OK=$ok  SKIP=$skip  FAIL=$fail"
echo "Imágenes guardadas en: $DEST"
