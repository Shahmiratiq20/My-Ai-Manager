import time
from pathlib import Path
from datetime import datetime

class ApprovalHandler:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.pending = self.vault_path / 'Pending_Approval'
        self.approved = self.vault_path / 'Approved'
        self.rejected = self.vault_path / 'Rejected'
        self.check_interval = 5  # 5 seconds
        
    def check_approvals(self):
        """Check for approved files"""
        approved_files = list(self.approved.glob('*.md'))
        
        for file in approved_files:
            print(f"✅ Approved: {file.name}")
            # TODO: Execute action via MCP
            print(f"🚀 Executing action for {file.stem}")
            
            # Move to done
            done_path = self.vault_path / 'Done' / file.name
            file.rename(done_path)
            
    def check_rejections(self):
        """Check for rejected files"""
        rejected_files = list(self.rejected.glob('*.md'))
        
        for file in rejected_files:
            print(f"❌ Rejected: {file.name}")
            # Move to done
            done_path = self.vault_path / 'Done' / f"REJECTED_{file.name}"
            file.rename(done_path)
    
    def run(self):
        print("👤 Approval Handler started...")
        print(f"📂 Watching: {self.approved}")
        
        while True:
            try:
                self.check_approvals()
                self.check_rejections()
                time.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                print("\n⏹️  Approval handler stopped")
                break

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    handler = ApprovalHandler(vault)
    handler.run()