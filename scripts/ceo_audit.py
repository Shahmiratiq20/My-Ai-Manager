import sys
from pathlib import Path
from datetime import datetime, timedelta
import json

sys.path.append(str(Path(__file__).parent.parent))
from config.ai_config import AIEngine

class CEOAudit:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.briefings = self.vault_path / 'Briefings'
        self.briefings.mkdir(exist_ok=True)
        self.done = self.vault_path / 'Done'
        self.plans = self.vault_path / 'Plans'
        self.posted = self.vault_path / 'Posted'
        
    def analyze_tasks(self):
        """Analyze completed tasks from past week"""
        week_ago = datetime.now() - timedelta(days=7)
        
        completed_tasks = []
        bottlenecks = []
        
        for file in self.done.glob('*.md'):
            try:
                mtime = datetime.fromtimestamp(file.stat().st_mtime)
                if mtime >= week_ago:
                    content = file.read_text(encoding='utf-8')
                    completed_tasks.append({
                        'name': file.stem,
                        'completed': mtime.strftime('%Y-%m-%d'),
                        'type': self._detect_task_type(file.name)
                    })
            except:
                pass
        
        return {
            'total_completed': len(completed_tasks),
            'by_type': self._group_by_type(completed_tasks),
            'tasks': completed_tasks
        }
    
    def analyze_social_media(self):
        """Analyze social media posts"""
        week_ago = datetime.now() - timedelta(days=7)
        
        posts = []
        for file in self.posted.glob('*.md'):
            try:
                mtime = datetime.fromtimestamp(file.stat().st_mtime)
                if mtime >= week_ago:
                    posts.append({
                        'platform': 'linkedin' if 'LINKEDIN' in file.name else 'other',
                        'posted': mtime.strftime('%Y-%m-%d')
                    })
            except:
                pass
        
        return {
            'total_posts': len(posts),
            'platforms': self._count_platforms(posts)
        }
    
    def analyze_revenue(self):
        """Analyze revenue (simulated for now)"""
        # TODO: Integrate with Odoo/accounting system
        return {
            'this_week': 2450,
            'last_week': 2100,
            'growth': '+16.7%',
            'mtd': 8900,
            'target': 10000,
            'on_track': True
        }
    
    def detect_bottlenecks(self):
        """Identify workflow bottlenecks"""
        bottlenecks = []
        
        # Check pending tasks
        pending = len(list((self.vault_path / 'Needs_Action').glob('*.md')))
        if pending > 5:
            bottlenecks.append({
                'area': 'Task Backlog',
                'severity': 'high',
                'count': pending,
                'suggestion': 'Consider prioritizing or delegating tasks'
            })
        
        # Check pending approvals
        approvals = len(list((self.vault_path / 'Pending_Approval').glob('*.md')))
        if approvals > 3:
            bottlenecks.append({
                'area': 'Approval Queue',
                'severity': 'medium',
                'count': approvals,
                'suggestion': 'Review and clear pending approvals'
            })
        
        return bottlenecks
    
    def generate_insights(self, data):
        """Generate AI-powered insights"""
        ai = AIEngine()
        
        prompt = f"""Analyze this business data and provide 3 actionable insights:

Tasks Completed: {data['tasks']['total_completed']}
Social Posts: {data['social']['total_posts']}
Revenue This Week: ${data['revenue']['this_week']}
Growth: {data['revenue']['growth']}
Bottlenecks: {len(data['bottlenecks'])}

Provide:
1. Key achievement
2. Area for improvement
3. Strategic recommendation

Keep it under 100 words, bullet points."""
        
        return ai.process_task(prompt)
    
    def generate_report(self):
        """Generate complete CEO audit report"""
        print("📊 Generating Weekly CEO Audit...")
        
        # Collect data
        tasks_data = self.analyze_tasks()
        social_data = self.analyze_social_media()
        revenue_data = self.analyze_revenue()
        bottlenecks = self.detect_bottlenecks()
        
        audit_data = {
            'tasks': tasks_data,
            'social': social_data,
            'revenue': revenue_data,
            'bottlenecks': bottlenecks
        }
        
        # Generate AI insights
        insights = self.generate_insights(audit_data)
        
        # Create report
        report = f"""# Weekly CEO Audit Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Period: {(datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')} to {datetime.now().strftime('%Y-%m-%d')}

---

## 📈 Executive Summary

### Revenue Performance
- **This Week:** ${revenue_data['this_week']:,}
- **Last Week:** ${revenue_data['last_week']:,}
- **Growth:** {revenue_data['growth']}
- **MTD:** ${revenue_data['mtd']:,} / ${revenue_data['target']:,}
- **Status:** {'✅ On Track' if revenue_data['on_track'] else '⚠️ Behind Target'}

### Productivity Metrics
- **Tasks Completed:** {tasks_data['total_completed']}
- **Social Media Posts:** {social_data['total_posts']}
- **Platforms:** {', '.join(social_data['platforms'].keys())}

---

## 🚨 Bottlenecks Detected

{self._format_bottlenecks(bottlenecks)}

---

## 💡 AI-Powered Insights

{insights}

---

## 📋 Task Breakdown

{self._format_task_breakdown(tasks_data)}

---

## 🎯 Recommendations

1. **Immediate Actions:**
   - Clear {len(bottlenecks)} identified bottlenecks
   - Review pending approvals

2. **This Week:**
   - Maintain current social media cadence
   - Focus on revenue-generating tasks

3. **Strategic:**
   - Continue automation improvements
   - Monitor task completion velocity

---

*Generated by AI Employee System v1.0*
"""
        
        # Save report
        filename = f"CEO_AUDIT_{datetime.now().strftime('%Y%m%d')}.md"
        filepath = self.briefings / filename
        filepath.write_text(report, encoding='utf-8')
        
        print(f"✅ Report saved: {filename}")
        return filepath
    
    def _detect_task_type(self, filename):
        """Detect task type from filename"""
        if 'EMAIL' in filename:
            return 'email'
        elif 'FILE' in filename:
            return 'file'
        elif 'PLAN' in filename:
            return 'planning'
        else:
            return 'other'
    
    def _group_by_type(self, tasks):
        """Group tasks by type"""
        grouped = {}
        for task in tasks:
            task_type = task['type']
            grouped[task_type] = grouped.get(task_type, 0) + 1
        return grouped
    
    def _count_platforms(self, posts):
        """Count posts by platform"""
        platforms = {}
        for post in posts:
            platform = post['platform']
            platforms[platform] = platforms.get(platform, 0) + 1
        return platforms
    
    def _format_bottlenecks(self, bottlenecks):
        """Format bottlenecks for report"""
        if not bottlenecks:
            return "✅ No major bottlenecks detected"
        
        formatted = []
        for b in bottlenecks:
            severity_emoji = '🔴' if b['severity'] == 'high' else '🟡'
            formatted.append(f"{severity_emoji} **{b['area']}:** {b['count']} items - {b['suggestion']}")
        
        return '\n'.join(formatted)
    
    def _format_task_breakdown(self, tasks_data):
        """Format task breakdown"""
        breakdown = []
        for task_type, count in tasks_data['by_type'].items():
            breakdown.append(f"- **{task_type.title()}:** {count} tasks")
        
        return '\n'.join(breakdown) if breakdown else "No tasks completed this week"

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    auditor = CEOAudit(vault)
    
    report_path = auditor.generate_report()
    print(f"\n📄 Report: {report_path}")