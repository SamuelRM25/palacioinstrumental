#!/usr/bin/env python3
"""Extrae las capturas PNG del ÚLTIMO escenario de un bundle de evidencia REA.

    python3 scripts/ver-capturas.py /tmp/arte/bundle.json [directorio-salida]
"""
import base64
import json
import re
import sys
from pathlib import Path

bundle = Path(sys.argv[1])
salida = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/arte")
salida.mkdir(parents=True, exist_ok=True)

datos = json.loads(bundle.read_text())

escenarios = datos.get("scenarios") or []
registros = {r.get("evidence_id"): r for r in datos.get("records") or []}

ultimo = None
for escenario in escenarios:
    registro = registros.get(escenario.get("evidence_id"))
    if registro and "capture_browser_scenario" in json.dumps(registro)[:4000]:
        ultimo = registro
if ultimo is None and escenarios:
    ultimo = registros.get(escenarios[-1].get("evidence_id"))

crudo = json.dumps(ultimo if ultimo is not None else datos)

vistos: set[str] = set()
indice = 0
for coincidencia in re.finditer(r'"data_base64"\s*:\s*"([A-Za-z0-9+/=]{2000,})"', crudo):
    datos_b64 = base64.b64decode(coincidencia.group(1))
    if len(datos_b64) < 2000:
        continue
    firma = base64.b16encode(datos_b64[:48]).decode()
    if firma in vistos:
        continue
    vistos.add(firma)
    (salida / f"{indice:02d}.png").write_bytes(datos_b64)
    indice += 1

print(f"capturas: {indice} -> {salida}")

errores = []
for tipo in ("page-error", "console"):
    for coincidencia in re.finditer(rf'"{tipo}"(.{{0,800}})', crudo):
        fragmento = coincidencia.group(1)
        nivel = re.search(r'"level":"([^"]+)"', fragmento)
        if tipo == "console" and (not nivel or nivel.group(1) not in ("error", "warning")):
            continue
        mensaje = re.search(r'"(?:message|text)":"((?:[^"\\]|\\.){0,240})"', fragmento)
        errores.append(f"{tipo}: {mensaje.group(1) if mensaje else fragmento[:140]}")

print(f"incidencias: {len(errores)}")
for e in errores:
    print("  -", e)
