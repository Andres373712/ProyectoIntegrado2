# AI Trading Analyst — skills vendorizadas

Este directorio no tiene relación con la app de TMM Bienestar y Conexión.
Contiene una copia vendorizada del toolkit **AI Trading Analyst**
(16 skills + 5 agentes + script de PDF), instalado originalmente desde
[`zubair-trabzada/ai-trading-claude`](https://github.com/zubair-trabzada/ai-trading-claude),
para que persista en el repo en vez de depender de una instalación efímera
en `~/.claude/`.

Es una herramienta de investigación de mercados (no ejecuta operaciones ni
da asesoría financiera) — ver el disclaimer en `skills/trade/SKILL.md`.

## Activarla en una sesión nueva

Claude Code carga skills/agentes solo desde `~/.claude/`, no desde rutas de
proyecto arbitrarias. Para activarlas en una sesión:

```bash
cp -r .claude/skills/trade* ~/.claude/skills/
cp -r .claude/agents/trade-*.md ~/.claude/agents/
pip3 install reportlab   # necesario para /trade report-pdf
```

Luego los comandos `/trade analyze <ticker>`, `/trade quick <ticker>`, etc.
quedan disponibles. Ver `skills/trade/SKILL.md` para la referencia completa
de comandos.

## Actualizar desde el upstream

```bash
git clone --depth 1 https://github.com/zubair-trabzada/ai-trading-claude.git /tmp/ai-trading-claude
cp -r /tmp/ai-trading-claude/trade/SKILL.md .claude/skills/trade/SKILL.md
cp -r /tmp/ai-trading-claude/skills/*/SKILL.md .claude/skills/  # ajustar por skill
cp /tmp/ai-trading-claude/agents/*.md .claude/agents/
cp /tmp/ai-trading-claude/scripts/*.py .claude/skills/trade/scripts/
```
