import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if RootStackParamList is not imported from StackNavigation
    if 'RootStackParamList' not in content or 'StackNavigation' not in content:
        return

    # Replace import
    # Match: import { ..., RootStackParamList, ... } from '../Navigation/StackNavigation';
    # Or: import { RootStackParamList } from '../Navigation/StackNavigation';
    
    # 1. If it's a single import from StackNavigation, change the source to ./types
    content = re.sub(
        r"import\s*\{\s*RootStackParamList\s*\}\s*from\s*['\"](\.\.?/Navigation/)StackNavigation['\"];?",
        r"import { RootStackParamList } from '\1types';",
        content
    )
    
    # 2. Handle cases where other things might be imported too (though usually only RootStackParamList is exported from there)
    # Actually, usually it's just RootStackParamList.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Refactored imports in {filepath}")

def main():
    src_dir = os.path.join(os.getcwd(), 'Src')
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
