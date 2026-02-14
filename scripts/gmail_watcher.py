import os
import time
from pathlib import Path
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailWatcher:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        self.config_path = Path(__file__).parent.parent / 'config'
        self.check_interval = 60  # 1 minute
        self.service = None
        self.processed_ids = set()
        
    def authenticate(self):
        """Gmail authentication"""
        creds = None
        token_path = self.config_path / 'token.json'
        creds_path = self.config_path / 'credentials.json'
        
        if token_path.exists():
            creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(str(creds_path), SCOPES)
                creds = flow.run_local_server(port=0)
            
            token_path.write_text(creds.to_json())
        
        self.service = build('gmail', 'v1', credentials=creds)
        print("✅ Gmail authenticated!")
        
    def check_for_updates(self):
        """Check for unread important emails"""
        try:
            results = self.service.users().messages().list(
                userId='me',
                q='is:unread',
                maxResults=5
            ).execute()
            
            messages = results.get('messages', [])
            new_messages = [m for m in messages if m['id'] not in self.processed_ids]
            
            return new_messages
            
        except Exception as e:
            print(f"❌ Gmail error: {e}")
            return []
    
    def create_action_file(self, msg_id):
        """Create task file for email"""
        try:
            msg = self.service.users().messages().get(userId='me', id=msg_id).execute()
            
            headers = {h['name']: h['value'] for h in msg['payload']['headers']}
            subject = headers.get('Subject', 'No Subject')
            sender = headers.get('From', 'Unknown')
            snippet = msg.get('snippet', '')
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filepath = self.needs_action / f'EMAIL_{timestamp}.md'
            
            content = f"""---
type: email
from: {sender}
subject: {subject}
received: {datetime.now().isoformat()}
priority: high
status: pending
---

## Email Preview
{snippet}

## Suggested Actions
- [ ] Reply to sender
- [ ] Archive after processing
"""
            filepath.write_text(content, encoding='utf-8')
            self.processed_ids.add(msg_id)
            print(f"📧 New email: {subject[:50]}")
            
        except Exception as e:
            print(f"❌ Error creating file: {e}")
    
    def run(self):
        print("🔍 Gmail Watcher starting...")
        self.authenticate()
        
        while True:
            try:
                messages = self.check_for_updates()
                
                for msg in messages:
                    self.create_action_file(msg['id'])
                
                if not messages:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] No new emails")
                
                time.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                print("\n⏹️  Gmail watcher stopped")
                break

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    watcher = GmailWatcher(vault)
    watcher.run()