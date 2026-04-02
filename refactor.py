import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if Theme is not imported
    if 'import { Theme }' not in content and 'import {Theme}' not in content:
        return

    # Calculate relative path to ThemeContext
    depth = filepath.replace(os.path.join(os.getcwd(), 'Src/'), '').count('/')
    context_import_path = '../' * depth + 'ThemeContext' if depth > 0 else './ThemeContext'

    # Replace import
    content = re.sub(r'import\s*\{\s*Theme\s*\}\s*from\s*[\'"].*?theme[\'"];?', f"import {{ useAppTheme }} from '{context_import_path}';", content)

    # Make sure useMemo is imported
    if 'useMemo' not in content:
        content = re.sub(r'import\s+React.*?from\s+[\'"]react[\'"];?', lambda m: m.group(0).replace('React', 'React, { useMemo }') if '{' not in m.group(0) else m.group(0).replace('{', '{ useMemo, '), content)

    # Inject hooks into functional components
    # Find main component definition: export default function X(...) {
    comp_pattern = re.compile(r'(export\s+(?:default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)')
    if comp_pattern.search(content):
        inject_hook = r'\1\n  const { theme: Theme } = useAppTheme();\n  const styles = useMemo(() => getStyles(Theme), [Theme]);'
        content = comp_pattern.sub(inject_hook, content)
    else:
        # Try finding const X = (...) => {
        arrow_comp_pattern = re.compile(r'(export\s+(?:default\s+)?const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)')
        if arrow_comp_pattern.search(content):
            inject_hook = r'\1\n  const { theme: Theme } = useAppTheme();\n  const styles = useMemo(() => getStyles(Theme), [Theme]);'
            content = arrow_comp_pattern.sub(inject_hook, content)
        else:
            print(f"Skipping component hook injection for {filepath} (No standard component found)")

    # Replace styles definition
    content = re.sub(r'const\s+styles\s*=\s*StyleSheet\.create\s*\(\{', 'const getStyles = (Theme: any) => StyleSheet.create({', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Refactored {filepath}")

def main():
    src_dir = os.path.join(os.getcwd(), 'Src')
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
