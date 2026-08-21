from pathlib import Path
import subprocess

workflow = Path('.github/workflows/bootstrap-project-shopping.yml').read_text(encoding='utf-8')
start_marker = "          python3 <<'PY'\n"
end_marker = "\n          PY\n\n          git diff --check"
start = workflow.index(start_marker) + len(start_marker)
end = workflow.index(end_marker, start)
raw = workflow[start:end]
script = "\n".join(
    line[10:] if line.startswith("          ") else line
    for line in raw.splitlines()
) + "\n"

script = script.replace(
    'if "usePurchaseCost(" in text and "saveEstimate({" in text and "purchaseUnitLabel" in text:',
    'if "usePurchaseCost(" in text and "saveEstimate({" in text:',
)
script = script.replace(
    'r"const purchaseCost = usePurchaseCost\\(\\s*(?P<quantity>[^,\\n]+),\\s*purchaseUnitLabel,\\s*\\);",',
    'r"const purchaseCost = usePurchaseCost\\(\\s*(?P<quantity>[^,\\n]+),\\s*(?P<unit>[^,\\n]+),\\s*\\);",',
)
script = script.replace(
    '            quantity = cost_match.group("quantity").strip()\n\n            save_anchor',
    '            quantity = cost_match.group("quantity").strip()\n            unit_label = cost_match.group("unit").strip()\n\n            save_anchor',
)
script = script.replace(
    "              '        purchaseUnitLabel,\\n'\n",
    "              f'        {unit_label},\\n'\n",
)

block_start = script.index("old_help = '''")
block_end_marker = "mode = mode.replace(old_help, new_help, 1)"
block_end = script.index(block_end_marker, block_start) + len(block_end_marker)
replacement = '''old_help_pattern = re.compile(
    r"Print one project or use your browser&apos;s print dialog to save it as\\s+a PDF\\. The report is created locally from the saved project snapshot\\."
)
mode, help_count = old_help_pattern.subn(
    "Print one project or use your browser&apos;s print dialog to save it as\\n              a PDF. Shopping lists use structured purchase quantities from newly\\n              saved estimates; older snapshots stay readable and are never parsed\\n              to invent quantities.",
    mode,
    count=1,
)
if help_count != 1:
    raise SystemExit("Missing saved-project help anchor")'''
script = script[:block_start] + replacement + script[block_end:]

Path('/tmp/project-shopping-bootstrap.py').write_text(script, encoding='utf-8')
subprocess.run(['python3', '/tmp/project-shopping-bootstrap.py'], check=True)
