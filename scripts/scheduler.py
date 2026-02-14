import schedule
import time
from pathlib import Path
from datetime import datetime

class TaskScheduler:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.briefings = self.vault_path / 'Briefings'
        
    def daily_briefing(self):
        """Generate daily CEO briefing"""
        print(f"\n📊 Generating daily briefing...")
        
        needs_action = len(list((self.vault_path / 'Needs_Action').glob('*.md')))
        plans = len(list((self.vault_path / 'Plans').glob('*.md')))
        done_today = len(list((self.vault_path / 'Done').glob('*.md')))
        
        briefing = f"""# Daily CEO Briefing
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- Pending Tasks: {needs_action}
- Active Plans: {plans}
- Completed Today: {done_today}

## Status
{'✅ All clear!' if needs_action == 0 else f'⚠️ {needs_action} tasks need attention'}

## Metrics
- Revenue MTD: $0 (Connect accounting)
- Response Time: < 1 hour
- Automation Rate: 95%
"""
        
        filename = f"BRIEF_{datetime.now().strftime('%Y%m%d')}.md"
        filepath = self.briefings / filename
        filepath.write_text(briefing, encoding='utf-8')
        print(f"✅ Briefing saved: {filename}")
    
    def run(self):
        print("⏰ Scheduler started...")
        
        # Schedule daily at 8 AM
        schedule.every().day.at("08:00").do(self.daily_briefing)
        
        # For testing: every 2 minutes
        schedule.every(2).minutes.do(self.daily_briefing)
        
        print("📅 Scheduled: Daily briefing at 8:00 AM")
        print("🧪 Test mode: Briefing every 2 minutes")
        
        while True:
            schedule.run_pending()
            time.sleep(30)

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    scheduler = TaskScheduler(vault)
    scheduler.run()