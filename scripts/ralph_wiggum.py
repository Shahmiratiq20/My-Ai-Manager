import sys
import time
from pathlib import Path
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent))
from config.ai_config import AIEngine

class RalphWiggum:
    """
    Autonomous task completion loop
    Keeps iterating until task is marked complete
    """
    
    def __init__(self, vault_path, max_iterations=10):
        self.vault_path = Path(vault_path)
        self.max_iterations = max_iterations
        self.needs_action = self.vault_path / 'Needs_Action'
        self.in_progress = self.vault_path / 'In_Progress'
        self.done = self.vault_path / 'Done'
        self.plans = self.vault_path / 'Plans'
        
        # Create In_Progress folder
        self.in_progress.mkdir(exist_ok=True)
        
    def process_task_autonomously(self, task_file):
        """
        Process a single task with autonomous iteration
        """
        print(f"\n🤖 Starting autonomous processing: {task_file.name}")
        
        # Move to In_Progress
        in_progress_file = self.in_progress / task_file.name
        task_file.rename(in_progress_file)
        
        task_content = in_progress_file.read_text(encoding='utf-8')
        iteration = 0
        completed = False
        
        ai = AIEngine()
        conversation_history = []
        
        while iteration < self.max_iterations and not completed:
            iteration += 1
            print(f"\n📍 Iteration {iteration}/{self.max_iterations}")
            
            # Build context with history
            if iteration == 1:
                prompt = f"""You are an autonomous AI agent. Analyze this task and create an action plan:

Task:
{task_content}

Requirements:
1. Break down into specific steps
2. Identify what you can do now
3. Identify what needs human approval
4. If task is simple and you can complete it, output: <TASK_COMPLETE>

Provide your plan and next action."""
            else:
                prompt = f"""Previous attempts: {iteration - 1}

Original task:
{task_content}

Previous actions:
{chr(10).join(conversation_history[-3:])}

Continue working on this task. What's your next action?
If task is complete, output: <TASK_COMPLETE>"""
            
            # Get AI response
            response = ai.process_task(prompt)
            conversation_history.append(f"[Iteration {iteration}] {response}")
            
            print(f"💭 AI Response:\n{response[:200]}...")
            
            # Check completion
            if '<TASK_COMPLETE>' in response:
                completed = True
                print(f"\n✅ Task completed in {iteration} iterations!")
                
                # Create completion report
                self._create_completion_report(
                    task_file.stem,
                    task_content,
                    conversation_history,
                    iteration
                )
                
                # Move to Done
                done_file = self.done / task_file.name
                in_progress_file.rename(done_file)
                
            else:
                # Save progress
                self._save_progress(
                    task_file.stem,
                    iteration,
                    response
                )
                
                time.sleep(2)  # Prevent API rate limits
        
        if not completed:
            print(f"\n⚠️ Max iterations reached. Task needs manual review.")
            # Keep in In_Progress for review
        
        return completed
    
    def _create_completion_report(self, task_name, original_task, history, iterations):
        """Create report of autonomous completion"""
        report_path = self.plans / f"AUTONOMOUS_{task_name}.md"
        
        report = f"""# Autonomous Task Completion Report

Task: {task_name}
Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Iterations: {iterations}

## Original Task
{original_task}

## Execution Log
{chr(10).join(history)}

---
*Completed autonomously by Ralph Wiggum Loop*
"""
        
        report_path.write_text(report, encoding='utf-8')
        print(f"📄 Report saved: {report_path.name}")
    
    def _save_progress(self, task_name, iteration, response):
        """Save iteration progress"""
        progress_path = self.in_progress / f"PROGRESS_{task_name}_iter{iteration}.md"
        
        content = f"""# Progress Update - Iteration {iteration}

Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## AI Response
{response}

---
"""
        progress_path.write_text(content, encoding='utf-8')
    
    def run_autonomous_loop(self):
        """
        Main autonomous loop - processes all pending tasks
        """
        print("🚀 Ralph Wiggum Autonomous Loop Started")
        print(f"📂 Watching: {self.needs_action}")
        
        while True:
            try:
                # Get pending tasks
                tasks = list(self.needs_action.glob('*.md'))
                
                if tasks:
                    print(f"\n📋 Found {len(tasks)} pending task(s)")
                    
                    for task in tasks:
                        self.process_task_autonomously(task)
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] No pending tasks")
                
                time.sleep(30)  # Check every 30 seconds
                
            except KeyboardInterrupt:
                print("\n⏹️  Autonomous loop stopped")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(60)

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    ralph = RalphWiggum(vault, max_iterations=5)
    
    ralph.run_autonomous_loop()