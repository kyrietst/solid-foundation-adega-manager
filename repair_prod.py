import re
import subprocess
import os

log_file = 'push_log.txt'

# Try reading with utf-16-le
try:
    with open(log_file, 'r', encoding='utf-16-le') as f:
        content = f.read()
except:
    # Fallback
    with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

# If content looks scattered with nulls or spaces, clean it
# The view_file output showed "n o d e". If it was utf-16 read as utf-8, it would be "n\x00o\x00".
# But if view_file simply showed spaces, maybe it was utf-16le.
# Let's simple remove nulls and extra spaces if they follow pattern.
content = content.replace('\x00', '')

# Extract timestamps: 8 to 14 digits starting with 20
# Pattern: 20[0-9]{6,12}
timestamps = re.findall(r'20\d{6,12}', content)
timestamps = sorted(list(set(timestamps)))

print(f"Found {len(timestamps)} timestamps to revert.")

if not timestamps:
    print("No timestamps found. Check encoding.")
    exit(1)

# Batch execution to avoid command line length limits
batch_size = 50
for i in range(0, len(timestamps), batch_size):
    batch = timestamps[i:i+batch_size]
    # Use shell=True for npx in windows, but ensure list is passed as string
    args = " ".join(batch)
    cmd = f"npx supabase migration repair --status reverted {args}"
    print(f"Executing batch {i}...")
    subprocess.run(cmd, shell=True)
