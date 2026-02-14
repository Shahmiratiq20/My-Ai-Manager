# AI Employee System

## Setup Complete ✅

### Features Working:
- ✅ File monitoring (Inbox folder)
- ✅ AI task processing (OpenRouter)
- ✅ Automatic plan generation
- ✅ Dashboard updates
- ✅ Obsidian vault integration

### How to Use:

**Start System:**
```powershell
# Window 1: File Watcher
python scripts\filesystem_watcher.py

# Window 2: Orchestrator (optional - auto-processes)
python scripts\orchestrator.py
```

**Add Tasks:**
1. Drop files in `vault\Inbox`
2. Or create `.md` files in `vault\Needs_Action`

**View Results:**
- Open Obsidian vault
- Check `Plans` folder for AI-generated plans
- Check `Dashboard.md` for stats

### Next Steps (Silver Tier):
- Gmail integration
- Human approval workflow
- Scheduled tasks