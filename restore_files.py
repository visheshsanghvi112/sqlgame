import subprocess
import os
from pathlib import Path

# Get list of all files in HEAD except the problematic one
result = subprocess.run(['git', 'ls-tree', '-r', 'HEAD', '--name-only'], 
                       capture_output=True, text=True)
files = [f for f in result.stdout.strip().split('\n') 
         if f and 'migrated_prompt_history' not in f]

for filepath in files:
    # Create directories if needed
    dirname = os.path.dirname(filepath)
    if dirname:
        Path(dirname).mkdir(parents=True, exist_ok=True)
    
    # Get file from git
    result = subprocess.run(['git', 'show', f'HEAD:{filepath}'], 
                           capture_output=True)
    
    # Write file with proper encoding
    with open(filepath, 'wb') as f:
        f.write(result.stdout)

print(f"Extracted {len(files)} files")
