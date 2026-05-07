import os

def fix_css():
    path = r'src\styles\index.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define blocks to replace
    replacements = [
        (
            '.mcm-tree-panel {\n  width: 100%;\n  max-width: 840px;\n  margin-top: 1.1rem;\n  padding: 1rem;\n  border-radius: 8px;\n  background: linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(17, 24, 39, 0.62));\n  border: 1px solid rgba(148, 163, 184, 0.18);\n}',
            '.mcm-tree-panel {\n  width: 100%;\n  max-width: 840px;\n  margin-top: 1.5rem;\n  padding: 1.5rem;\n  border-radius: var(--radius-2xl);\n  background: rgba(15, 23, 42, 0.4);\n  backdrop-filter: blur(24px);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);\n}'
        ),
        (
            '.mcm-tree-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n  color: var(--color-text-secondary);\n  flex-wrap: wrap;\n}',
            '.mcm-tree-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n  color: var(--color-text-secondary);\n}'
        ),
        (
            '.mcm-tree-branch {\n  --tree-line: rgba(148, 163, 184, 0.35);\n  --tree-line-glow: rgba(96, 165, 250, 0.14);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  position: relative;\n  min-width: calc(var(--leaf-count, 1) * 88px);\n  flex: 0 0 auto;\n  transition: opacity 0.2s ease;\n}',
            '.mcm-tree-branch {\n  --tree-line: rgba(255, 255, 255, 0.1);\n  --tree-line-active: #facc15;\n  --tree-line-glow: rgba(250, 204, 21, 0.2);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  position: relative;\n  min-width: calc(var(--leaf-count, 1) * 92px);\n  flex: 0 0 auto;\n}'
        ),
        (
            '.mcm-tree-children::before {\n  content: "";\n  position: absolute;\n  top: 0.82rem;\n  left: calc(25% + 18px);\n  right: calc(25% + 18px);\n  height: 2px;\n  border-radius: 999px;\n  background: var(--tree-line);\n  box-shadow: 0 0 9px var(--tree-line-glow);\n}',
            '.mcm-tree-children::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 25%;\n  right: 25%;\n  height: 1.5rem;\n  border-top: 2px solid var(--tree-line);\n  border-left: 2px solid var(--tree-line);\n  border-right: 2px solid var(--tree-line);\n  border-radius: 12px 12px 0 0;\n}'
        ),
        (
            '.algo-card {\n  background: rgba(17,24,39,0.7);\n  backdrop-filter: blur(10px);\n  padding: 18px;\n  border-radius: 12px;\n  border: 1px solid rgba(255,255,255,0.05);\n  transition: all 0.25s ease;\n}',
            '.algo-card {\n  background: rgba(255, 255, 255, 0.94);\n  backdrop-filter: blur(10px);\n  padding: 24px;\n  border-radius: var(--radius-2xl);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);\n  transition: all var(--transition-normal);\n  position: relative;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  text-align: left;\n}'
        ),
        (
            '.algo-card-title {\n  font-size: 1.25rem;\n  font-weight: 700;\n  color: #f1f5f9;\n  display: block;\n  margin-bottom: 8px;\n}',
            '.algo-card-title {\n  font-size: 1.5rem;\n  font-weight: 900;\n  color: #0f172a;\n  display: block;\n  margin-bottom: 8px;\n  letter-spacing: -0.02em;\n}'
        ),
        (
            '.algo-card-copy {\n  font-size: 0.9rem;\n  color: #94a3b8;\n  line-height: 1.5;\n  margin-bottom: 20px;\n  display: block;\n}',
            '.algo-card-copy {\n  font-size: 0.95rem;\n  color: #475569;\n  line-height: 1.6;\n  margin-bottom: 24px;\n  display: block;\n}'
        ),
        (
            '.pattern-pill {\n  padding: 3px 8px;\n  border-radius: 6px;\n  background: rgba(59, 130, 246, 0.15);\n  color: #60a5fa;\n  font-size: 0.75rem;\n  font-weight: 600;\n}',
            '.pattern-pill {\n  padding: 4px 10px;\n  border-radius: var(--radius-md);\n  background: #f1f5f9;\n  color: #475569;\n  font-size: 11px;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}'
        ),
        (
            '.complexity-badge {\n  font-size: 0.75rem;\n  color: #94a3b8;\n}',
            '.complexity-badge {\n  font-size: 12px;\n  color: #64748b;\n  font-weight: 600;\n}'
        ),
        (
            '.algo-card-icon {\n  font-size: 1.8rem;\n  margin-bottom: 15px;\n  display: block;\n}',
            '.algo-card-icon {\n  font-size: 2.2rem;\n  margin-bottom: 20px;\n  display: flex;\n  width: 56px;\n  height: 56px;\n  background: #f8fafc;\n  border-radius: var(--radius-lg);\n  align-items: center;\n  justify-content: center;\n  border: 1px solid #f1f5f9;\n}'
        ),
        (
            '.dp-legend-swatch--active {\n  background: linear-gradient(135deg, #fde68a, var(--dp-active));\n  box-shadow: 0 0 10px var(--dp-active-glow);\n}',
            '.dp-legend-swatch--active {\n  background: var(--color-cell-active);\n  box-shadow: 0 0 12px var(--color-cell-active-glow);\n  border-radius: var(--radius-sm);\n}'
        ),
        (
            '.dp-legend-swatch--dependency {\n  background: var(--dp-dependency-soft);\n  border: 1px dashed rgba(129, 140, 248, 0.82);\n}',
            '.dp-legend-swatch--dependency {\n  background: rgba(59, 130, 246, 0.1);\n  border: 1px dashed var(--color-cell-dependency);\n  border-radius: var(--radius-sm);\n}'
        ),
        (
            '.dp-legend-swatch--result {\n  background: var(--dp-result);\n  box-shadow: 0 0 10px var(--dp-result-glow);\n}',
            '.dp-legend-swatch--result {\n  background: var(--color-cell-computed);\n  box-shadow: 0 0 12px var(--color-cell-computed-subtle);\n  border-radius: var(--radius-sm);\n}'
        ),
        (
            '.demo-container {\n  background: rgba(17, 24, 39, 0.6);\n  backdrop-filter: blur(12px);\n  border-radius: 14px;\n  padding: 16px;\n  border: 1px solid rgba(255,255,255,0.05);\n  box-shadow: 0 10px 30px rgba(0,0,0,0.4);\n}',
            '.demo-container {\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: var(--radius-lg);\n  padding: var(--space-6);\n  border: 1px solid rgba(255, 255, 255, 0.03);\n}'
        ),
        (
            '.demo-cell {\n  width: 36px;\n  height: 36px;\n  display: grid;\n  place-items: center;\n  border-radius: 8px;\n  background: #1f2937;\n  transition: all 0.25s ease;\n}',
            '.demo-cell {\n  width: 42px;\n  height: 42px;\n  display: grid;\n  place-items: center;\n  border-radius: var(--radius-md);\n  background: var(--color-bg-tertiary);\n  border: 1px solid var(--color-border-subtle);\n  font-family: var(--font-family-mono);\n  font-weight: 700;\n  font-size: var(--font-size-base);\n  color: var(--color-text-muted);\n  transition: all var(--transition-normal);\n}'
        ),
        (
            '.demo-cell.active {\n  background: #2dd4bf;\n  transform: scale(1.1);\n  box-shadow: 0 0 12px rgba(34,197,94,0.6);\n}',
            '.demo-cell.active {\n  background: rgba(250, 204, 21, 0.1);\n  border-color: var(--color-cell-active);\n  color: var(--color-cell-active);\n  box-shadow: 0 0 20px var(--color-cell-active-glow);\n  transform: translateY(-2px);\n}'
        ),
        (
            '.mcm-cost-panel {\n  padding: 12px;\n  border-radius: 8px;\n  background: rgba(15, 23, 42, 0.45);\n  border: 1px solid rgba(148, 163, 184, 0.16);\n  font-family: var(--font-family-mono);\n}',
            '.mcm-cost-panel {\n  padding: 20px;\n  border-radius: var(--radius-xl);\n  background: rgba(15, 23, 42, 0.6);\n  border: 1px solid rgba(255, 255, 255, 0.05);\n  font-family: var(--font-family-mono);\n  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);\n}'
        ),
        (
            '.mcm-cost-equation {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 0.95rem;\n  color: var(--color-text-primary);\n  flex-wrap: wrap;\n}',
            '.mcm-cost-equation {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  font-size: 1.1rem;\n  color: white;\n  flex-wrap: wrap;\n  line-height: 2;\n}'
        ),
        (
            '.explanation-card {\n  background: rgba(22, 27, 34, 0.5);\n  padding: 1.25rem;\n  border-radius: 8px;\n  border-left: 4px solid #3b82f6;\n}',
            '.explanation-card-premium {\n  background: rgba(255, 255, 255, 0.03);\n  padding: 1.75rem;\n  border-radius: var(--radius-xl);\n  border-left: 4px solid var(--color-accent-secondary);\n  box-shadow: var(--shadow-lg);\n  backdrop-filter: blur(12px);\n  margin-bottom: 1rem;\n}'
        )
    ]

    for old, new in replacements:
        # Try both \n and \r\n
        content = content.replace(old, new)
        content = content.replace(old.replace('\n', '\r\n'), new.replace('\n', '\r\n'))

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_css()
