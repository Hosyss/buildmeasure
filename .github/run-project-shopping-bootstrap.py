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

# The original bootstrap was embedded inside a YAML block scalar. Top-level
# Python indentation needs de-indenting, but literal source anchors must keep
# the indentation of the files they target. Rewrite the fragile sections here
# so the actual product patch is deterministic and indentation-safe.
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

help_start = script.index("old_help = '''")
help_end_marker = "mode = mode.replace(old_help, new_help, 1)"
help_end = script.index(help_end_marker, help_start) + len(help_end_marker)
help_replacement = '''old_help_pattern = re.compile(
    r"Print one project or use your browser&apos;s print dialog to save it as\\s+a PDF\\. The report is created locally from the saved project snapshot\\."
)
mode, help_count = old_help_pattern.subn(
    "Print one project or use your browser&apos;s print dialog to save it as\\n              a PDF. Shopping lists use structured purchase quantities from newly\\n              saved estimates; older snapshots stay readable and are never parsed\\n              to invent quantities.",
    mode,
    count=1,
)
if help_count != 1:
    raise SystemExit("Missing saved-project help anchor")'''
script = script[:help_start] + help_replacement + script[help_end:]

card_start = script.index("card_anchor = '''")
mode_write = script.index('mode_path.write_text(mode, encoding="utf-8")', card_start)
card_print_replacement = '''card_marker = "                <div className={styles.cardActions}>"
if card_marker not in mode:
    raise SystemExit("Missing saved project card marker")
mode = mode.replace(
    card_marker,
    "                <ProjectShoppingList project={project} />\\n" + card_marker,
    1,
)

print_marker = "          <div className={styles.printNote}>"
if print_marker not in mode:
    raise SystemExit("Missing printable report marker")
mode = mode.replace(
    print_marker,
    "          <ProjectShoppingList project={printingProject} printable />\\n" + print_marker,
    1,
)
'''
script = script[:card_start] + card_print_replacement + script[mode_write:]

mobile_start = script.index("mobile_anchor = '''")
css_write = script.index('css_path.write_text(css, encoding="utf-8")', mobile_start)
mobile_replacement = '''mobile_anchor = "  .selectionActions,\\n  .cardActions,\\n  .formActions {"
if mobile_anchor not in css:
    raise SystemExit("Missing mobile action anchor")
if ".shoppingList li {\\n    grid-template-columns: 1fr;" not in css:
    css = css.replace(
        mobile_anchor,
        "  .shoppingList li {\\n    grid-template-columns: 1fr;\\n  }\\n\\n  .shoppingList b {\\n    text-align: left;\\n  }\\n\\n" + mobile_anchor,
        1,
    )
'''
script = script[:mobile_start] + mobile_replacement + script[css_write:]

privacy_start = script.index("privacy_anchor = '''")
privacy_write = script.index('privacy_path.write_text(privacy, encoding="utf-8")', privacy_start)
privacy_replacement = '''privacy_pattern = re.compile(
    r"browser storage\\. Estimates and projects are not synchronized to an\\s+account or sent to BuildMeasure\\."
)
privacy, privacy_count = privacy_pattern.subn(
    "browser storage. Newly saved estimates may also keep the calculated\\n        purchase quantity, purchase-unit label, and any optional local price and\\n        currency snapshot you entered. Project Mode uses those structured local\\n        fields for shopping lists instead of reading numbers back from display\\n        text. Estimates and projects are not synchronized to an account or sent\\n        to BuildMeasure.",
    privacy,
    count=1,
)
if privacy_count != 1:
    raise SystemExit("Missing privacy anchor")
'''
script = script[:privacy_start] + privacy_replacement + script[privacy_write:]

note_start = script.index("note_anchor = '''")
roadmap_write = script.index('roadmap_path.write_text(roadmap, encoding="utf-8")', note_start)
note_replacement = '''note_anchor = "saved estimate snapshot exactly as the user stored it and do not invent totals.\\n"
if note_anchor not in roadmap:
    raise SystemExit("Missing Roadmap note anchor")
roadmap = roadmap.replace(
    note_anchor,
    note_anchor + "Shopping lists now use structured purchase quantity and unit fields stored with\\nnew estimates. Older snapshots remain compatible but are not parsed to invent\\nmissing purchase data. Waste/cost roll-up remains a separate future slice.\\n",
    1,
)
'''
script = script[:note_start] + note_replacement + script[roadmap_write:]

Path('/tmp/project-shopping-bootstrap.py').write_text(script, encoding='utf-8')
subprocess.run(['python3', '/tmp/project-shopping-bootstrap.py'], check=True)
