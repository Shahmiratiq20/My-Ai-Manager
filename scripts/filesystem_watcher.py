import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime

class DropFolderHandler(FileSystemEventHandler):
    def __init__(self, vault_path):
        self.needs_action = Path(vault_path) / 'Needs_Action'
        
    def on_created(self, event):
        if event.is_directory:
            return
            
        source = Path(event.src_path)
        if source.suffix == '.md':
            return  # Skip markdown files
            
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        meta_path = self.needs_action / f'FILE_{timestamp}_{source.name}.md'
        
        content = f"""---
type: file_drop
original_name: {source.name}
size: {source.stat().st_size} bytes
dropped: {datetime.now().isoformat()}
status: pending
---

## File Details
New file dropped for processing: {source.name}

## Suggested Actions
- [ ] Review file contents
- [ ] Process if needed
- [ ] Move to Done when complete
"""
        meta_path.write_text(content, encoding='utf-8')
        print(f"✅ Detected: {source.name}")

def watch_inbox(vault_path):
    inbox = Path(vault_path) / 'Inbox'
    inbox.mkdir(exist_ok=True)
    
    handler = DropFolderHandler(vault_path)
    observer = Observer()
    observer.schedule(handler, str(inbox), recursive=False)
    observer.start()
    
    print(f"📂 Watching: {inbox}")
    print("Drop files in /vault/Inbox to trigger AI...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n⏹️  File watcher stopped")
    
    observer.join()

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    watch_inbox(vault)