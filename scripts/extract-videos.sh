#!/usr/bin/env bash
# Extrae los videos referenciados en los posts a videos-para-youtube/
# con el nombre numerado que coincide con el XLSX.
# Idempotente: salta archivos ya extraídos.
#
# Uso:
#   chmod +x scripts/extract-videos.sh
#   ./scripts/extract-videos.sh

set -e
cd "$(dirname "$0")/.."
DEST="videos-para-youtube"
mkdir -p "$DEST"

ZIP="uploads.zip"
if [ ! -f "$ZIP" ]; then
  echo "ERROR: no encuentro $ZIP en la raíz del proyecto."
  exit 1
fi

total=0; ok=0; skip=0; fail=0

total=$((total+1))
OUT="$DEST/01_concusion.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   01_concusion.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2026/04/WhatsApp-Video-2026-04-21-at-10.04.38.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  01_concusion.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   01_concusion.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/02_misterio-del-millon-de-dolares-notimundo-a-la-cart.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   02_misterio-del-millon-de-dolares-notimundo-a-la-cart.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2026/03/WhatsApp-Video-2026-03-25-at-05.48.52.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  02_misterio-del-millon-de-dolares-notimundo-a-la-cart.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   02_misterio-del-millon-de-dolares-notimundo-a-la-cart.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/03_incautamente-millon-de-dolares-ecuavisa.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   03_incautamente-millon-de-dolares-ecuavisa.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2026/03/WhatsApp-Video-2026-03-25-at-05.48.58.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  03_incautamente-millon-de-dolares-ecuavisa.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   03_incautamente-millon-de-dolares-ecuavisa.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/04_entrevista-millon-de-dolares-teleamazonas.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   04_entrevista-millon-de-dolares-teleamazonas.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2026/03/WhatsApp-Video-2026-03-25-at-05.49.02.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  04_entrevista-millon-de-dolares-teleamazonas.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   04_entrevista-millon-de-dolares-teleamazonas.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/05_de-donde-proviene-el-millon-de-dolares-rtu.mov"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   05_de-donde-proviene-el-millon-de-dolares-rtu.mov"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2026/03/Grabacion-de-pantalla-2026-03-25-a-las-4.04.19 p.-m.mov" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  05_de-donde-proviene-el-millon-de-dolares-rtu.mov"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   05_de-donde-proviene-el-millon-de-dolares-rtu.mov"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/06_comparecencia-del-dr-mario-godoy-en-la-asamblea-na.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   06_comparecencia-del-dr-mario-godoy-en-la-asamblea-na.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2026/01/videoplayback.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  06_comparecencia-del-dr-mario-godoy-en-la-asamblea-na.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   06_comparecencia-del-dr-mario-godoy-en-la-asamblea-na.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/07_reformas-al-coip-rtu.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   07_reformas-al-coip-rtu.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/12/WhatsApp-Video-2025-12-22-at-9.36.59-AM.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  07_reformas-al-coip-rtu.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   07_reformas-al-coip-rtu.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/08_privados-de-libertad-proteccion-o-privilegio-rtu.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   08_privados-de-libertad-proteccion-o-privilegio-rtu.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/12/WhatsApp-Video-2025-12-22-at-9.42.04-AM.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  08_privados-de-libertad-proteccion-o-privilegio-rtu.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   08_privados-de-libertad-proteccion-o-privilegio-rtu.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/09_ppl-grupos-de-atencion-prioritaria.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   09_ppl-grupos-de-atencion-prioritaria.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/12/WhatsApp-Video-2025-12-22-at-9.37.15-AM.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  09_ppl-grupos-de-atencion-prioritaria.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   09_ppl-grupos-de-atencion-prioritaria.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/10_analisis-de-reforma-a-la-prision-preventiva-tvc-no.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   10_analisis-de-reforma-a-la-prision-preventiva-tvc-no.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/12/ANALISIS-REFORMA-PRISION-PREVENTIVA.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  10_analisis-de-reforma-a-la-prision-preventiva-tvc-no.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   10_analisis-de-reforma-a-la-prision-preventiva-tvc-no.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/11_entrevista-unsion-tv-audiencia-de-formulacion-de-c.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   11_entrevista-unsion-tv-audiencia-de-formulacion-de-c.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/08/AQMvYTLCs111dQ7Wax0bomQAJMybI6PGdi-BhJKp3Y1e1nTmIW3yNfc1PYUjjJ8aRwRf57dTC8-Bucwrdh_Nhp19ab1CPDnBL0rXMoLU_wC7AnCQbw.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  11_entrevista-unsion-tv-audiencia-de-formulacion-de-c.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   11_entrevista-unsion-tv-audiencia-de-formulacion-de-c.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/12_entrevista-radio-america-analisis-de-las-preguntas.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   12_entrevista-radio-america-analisis-de-las-preguntas.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/08/entrevista-america_pwijEuot.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  12_entrevista-radio-america-analisis-de-las-preguntas.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   12_entrevista-radio-america-analisis-de-las-preguntas.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/13_analisis-proceso-de-extradicion-de-alias-fito-anal.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   13_analisis-proceso-de-extradicion-de-alias-fito-anal.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/07/entrevista-NOTIMAR.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  13_analisis-proceso-de-extradicion-de-alias-fito-anal.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   13_analisis-proceso-de-extradicion-de-alias-fito-anal.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/14_proceso-de-extradicion-de-alias-fito-un-cafe-con-j.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   14_proceso-de-extradicion-de-alias-fito-un-cafe-con-j.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/07/entrevista-completa-cafe-con-jj-1_4CER7BxG.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  14_proceso-de-extradicion-de-alias-fito-un-cafe-con-j.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   14_proceso-de-extradicion-de-alias-fito-un-cafe-con-j.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/15_proceso-de-extradicion-de-alias-fito-fb-radio.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   15_proceso-de-extradicion-de-alias-fito-fb-radio.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/07/entrevista-FB-RADIO.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  15_proceso-de-extradicion-de-alias-fito-fb-radio.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   15_proceso-de-extradicion-de-alias-fito-fb-radio.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/16_extradicion-de-alias-fito-unsion-noticias.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   16_extradicion-de-alias-fito-unsion-noticias.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/07/unsion-noticias.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  16_extradicion-de-alias-fito-unsion-noticias.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   16_extradicion-de-alias-fito-unsion-noticias.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/17_proceso-de-extradicion-de-fito-primera-plana-ecu.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   17_proceso-de-extradicion-de-fito-primera-plana-ecu.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/07/entrevista-primera-plana.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  17_proceso-de-extradicion-de-fito-primera-plana-ecu.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   17_proceso-de-extradicion-de-fito-primera-plana-ecu.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/18_entrevista-mqnoticias-analisis-de-la-extradicion-e.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   18_entrevista-mqnoticias-analisis-de-la-extradicion-e.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/07/video-entrevista.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  18_entrevista-mqnoticias-analisis-de-la-extradicion-e.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   18_entrevista-mqnoticias-analisis-de-la-extradicion-e.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/19_curso-especializado-de-garantias-penitenciarias.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   19_curso-especializado-de-garantias-penitenciarias.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/06/conferencia.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  19_curso-especializado-de-garantias-penitenciarias.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   19_curso-especializado-de-garantias-penitenciarias.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/20_entrevista-sonorama-economias-criminales.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   20_entrevista-sonorama-economias-criminales.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/05/entrevista-sonorama.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  20_entrevista-sonorama-economias-criminales.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   20_entrevista-sonorama-economias-criminales.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/21_entrevista-unsion-tv-proyecto-de-ley-organica-para.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   21_entrevista-unsion-tv-proyecto-de-ley-organica-para.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/05/entrevista-unsion_x5GrzDKI-2.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  21_entrevista-unsion-tv-proyecto-de-ley-organica-para.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   21_entrevista-unsion-tv-proyecto-de-ley-organica-para.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/22_tecnicas-de-litigacion-oral-en-materia-penal.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   22_tecnicas-de-litigacion-oral-en-materia-penal.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2025/05/WhatsApp-Video-2025-05-07-at-5.17.55-PM-1.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  22_tecnicas-de-litigacion-oral-en-materia-penal.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   22_tecnicas-de-litigacion-oral-en-materia-penal.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/23_debate-proyecto-de-ley-consulta-popular-y-referend.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   23_debate-proyecto-de-ley-consulta-popular-y-referend.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/07/rpreplay-final1720045682_RXsVUK32.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  23_debate-proyecto-de-ley-consulta-popular-y-referend.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   23_debate-proyecto-de-ley-consulta-popular-y-referend.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/24_entrevista-7.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   24_entrevista-7.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/06/RPReplay_Final1718404676-2-Compressed-with-FlexClip.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  24_entrevista-7.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   24_entrevista-7.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/25_entrevista-pt-2.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   25_entrevista-pt-2.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/06/RPReplay_Final1717632223-2-Compressed-with-FlexClip-1.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  25_entrevista-pt-2.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   25_entrevista-pt-2.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/26_entrevista-6.mov"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   26_entrevista-6.mov"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/06/RPReplay_Final1717626603-3.mov" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  26_entrevista-6.mov"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   26_entrevista-6.mov"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/27_consulta-popular-y-sus-resultados.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   27_consulta-popular-y-sus-resultados.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/05/GESTION-COMISION-DESIGNACION-JUECES.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  27_consulta-popular-y-sus-resultados.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   27_consulta-popular-y-sus-resultados.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/28_entrevista-5.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   28_entrevista-5.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/03/WhatsApp-Video-2024-03-13-at-10.04.17.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  28_entrevista-5.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   28_entrevista-5.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/29_entrevista-4.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   29_entrevista-4.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/01/WhatsApp-Video-2024-01-19-at-18.39.55.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  29_entrevista-4.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   29_entrevista-4.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/30_entrevista-3.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   30_entrevista-3.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2024/01/3f41790b-eba8-4da4-bdfa-5ab89b3de138.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  30_entrevista-3.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   30_entrevista-3.mp4"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/31_entrevista-2.mov"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   31_entrevista-2.mov"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2023/10/RPReplay_Final1698241328-1.mov" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  31_entrevista-2.mov"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   31_entrevista-2.mov"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/32_entrevista.mov"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   32_entrevista.mov"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2023/09/88b2c9c1-129e-4291-b1cd-7fbb488c3a64.mov" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  32_entrevista.mov"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   32_entrevista.mov"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/33_experiencia-unica-en-el-ukuyaku-trail-jorge-luis-o.mov"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   33_experiencia-unica-en-el-ukuyaku-trail-jorge-luis-o.mov"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2023/08/CARRERA-JLOS.mov" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  33_experiencia-unica-en-el-ukuyaku-trail-jorge-luis-o.mov"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   33_experiencia-unica-en-el-ukuyaku-trail-jorge-luis-o.mov"
    fail=$((fail+1))
  fi
fi

total=$((total+1))
OUT="$DEST/34_ministro-de-gobierno-se-declara-en-rebeldia.mp4"
if [ -f "$OUT" ] && [ -s "$OUT" ]; then
  echo "  skip   34_ministro-de-gobierno-se-declara-en-rebeldia.mp4"
  skip=$((skip+1))
else
  if unzip -p -- "$ZIP" "2023/06/JLO_Video_entrevista.mp4" > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
    echo "  wrote  34_ministro-de-gobierno-se-declara-en-rebeldia.mp4"
    ok=$((ok+1))
  else
    rm -f "$OUT"
    echo "  FAIL   34_ministro-de-gobierno-se-declara-en-rebeldia.mp4"
    fail=$((fail+1))
  fi
fi

echo
echo "Listo. total=$total  ok=$ok  skip=$skip  fail=$fail"
echo "Archivos guardados en: $DEST/"