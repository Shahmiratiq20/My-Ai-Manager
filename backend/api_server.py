from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
import sys
import os
import requests
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent))
from config.ai_config import AIEngine

app = Flask(__name__)
CORS(app)

vault_path = Path(__file__).parent.parent / 'vault'

@app.route('/api/stats')
def get_stats():
    return jsonify({
        'needs_action': len(list((vault_path / 'Needs_Action').glob('*.md'))),
        'plans': len(list((vault_path / 'Plans').glob('*.md'))),
        'done': len(list((vault_path / 'Done').glob('*.md'))),
        'pending_approval': len(list((vault_path / 'Pending_Approval').glob('*.md')))
    })

@app.route('/api/tasks')
def get_tasks():
    tasks = []
    for file in (vault_path / 'Needs_Action').glob('*.md'):
        tasks.append({
            'id': file.stem,
            'name': file.name,
            'content': file.read_text(encoding='utf-8')[:200]
        })
    return jsonify(tasks)

@app.route('/api/approvals')
def get_approvals():
    approvals = []
    for file in (vault_path / 'Pending_Approval').glob('*.md'):
        approvals.append({
            'id': file.stem,
            'name': file.name,
            'content': file.read_text(encoding='utf-8')
        })
    return jsonify(approvals)

@app.route('/api/approve/<task_id>', methods=['POST'])
def approve_task(task_id):
    source = vault_path / 'Pending_Approval' / f'{task_id}.md'
    dest = vault_path / 'Approved' / f'{task_id}.md'
    
    if source.exists():
        source.rename(dest)
        return jsonify({'status': 'approved'})
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/reject/<task_id>', methods=['POST'])
def reject_task(task_id):
    source = vault_path / 'Pending_Approval' / f'{task_id}.md'
    dest = vault_path / 'Rejected' / f'{task_id}.md'
    
    if source.exists():
        source.rename(dest)
        return jsonify({'status': 'rejected'})
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/chat', methods=['POST'])
def chat():
    message = request.json.get('message')
    
    try:
        ai = AIEngine()
        response = ai.process_task(message)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'response': f'Error: {str(e)}'})

@app.route('/api/social/generate', methods=['POST'])
def generate_social_post():
    """Generate social media post"""
    topic = request.json.get('topic', '')
    
    try:
        from scripts.social_media_manager import SocialMediaManager
        
        manager = SocialMediaManager(vault_path)
        content = manager.generate_post(topic)
        
        return jsonify({'content': content})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/social/post', methods=['POST'])
def post_to_social():
    """Post to LinkedIn with optional image"""
    content = request.json.get('content')
    image_url = request.json.get('image_url')
    
    try:
        from scripts.social_media_manager import SocialMediaManager
        
        manager = SocialMediaManager(vault_path)
        
        # Handle image if provided
        image_path = None
        if image_url:
            # Download image temporarily if URL
            if image_url.startswith('http'):
                import tempfile
                response = requests.get(image_url)
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                temp_file.write(response.content)
                temp_file.close()
                image_path = temp_file.name
            else:
                image_path = image_url
        
        result = manager.post_to_linkedin(content, image_path)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/social/upload-image', methods=['POST'])
def upload_image():
    """Upload image for LinkedIn post"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # Save to temp uploads folder
        uploads_dir = vault_path / 'Uploads'
        uploads_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{timestamp}_{file.filename}'
        filepath = uploads_dir / filename
        
        file.save(str(filepath))
        
        return jsonify({
            'status': 'success',
            'filepath': str(filepath),
            'filename': filename
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/linkedin/auth')
def linkedin_auth():
    """Start LinkedIn OAuth"""
    from dotenv import load_dotenv
    load_dotenv()
    
    client_id = os.getenv('LINKEDIN_CLIENT_ID')
    redirect_uri = os.getenv('LINKEDIN_REDIRECT_URI')
    
    auth_url = f'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope=openid%20profile%20w_member_social'
    
    return jsonify({'auth_url': auth_url})

@app.route('/api/linkedin/callback')
def linkedin_callback():
    """Handle LinkedIn callback"""
    from dotenv import load_dotenv
    load_dotenv()
    
    code = request.args.get('code')
    
    client_id = os.getenv('LINKEDIN_CLIENT_ID')
    client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
    redirect_uri = os.getenv('LINKEDIN_REDIRECT_URI')
    
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri
    }
    
    response = requests.post(token_url, data=data)
    token_data = response.json()
    
    access_token = token_data.get('access_token')
    
    return jsonify({'status': 'success', 'token': access_token})

@app.route('/api/audit/generate', methods=['POST'])
def generate_audit():
    """Generate weekly CEO audit"""
    try:
        from scripts.ceo_audit import CEOAudit
        
        auditor = CEOAudit(vault_path)
        report_path = auditor.generate_report()
        
        # Read report content
        content = report_path.read_text(encoding='utf-8')
        
        return jsonify({
            'status': 'success',
            'filename': report_path.name,
            'content': content
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/audit/latest')
def get_latest_audit():
    """Get latest audit report"""
    try:
        briefings_path = vault_path / 'Briefings'
        audits = sorted(briefings_path.glob('CEO_AUDIT_*.md'), reverse=True)
        
        if not audits:
            return jsonify({'error': 'No audits found'}), 404
        
        latest = audits[0]
        content = latest.read_text(encoding='utf-8')
        
        return jsonify({
            'filename': latest.name,
            'content': content,
            'generated': latest.stat().st_mtime
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/email/send', methods=['POST'])
def send_email():
    """Send email via MCP"""
    try:
        from mcp_servers.email_mcp import EmailMCP
        
        data = request.json
        mcp = EmailMCP()
        
        result = mcp.send_email(
            to=data.get('to'),
            subject=data.get('subject'),
            body=data.get('body'),
            html=data.get('html', False),
            attachments=data.get('attachments')
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/email/reply-template', methods=['POST'])
def generate_reply():
    """Generate AI email reply"""
    try:
        original_email = request.json.get('original')
        tone = request.json.get('tone', 'professional')
        
        ai = AIEngine()
        
        prompt = f"""Write a {tone} email reply to:

{original_email}

Requirements:
- Professional and concise
- Address main points
- End with call to action
- Max 150 words"""
        
        reply = ai.process_task(prompt)
        
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/autonomous/start', methods=['POST'])
def start_autonomous():
    """Start autonomous task processing"""
    try:
        task_id = request.json.get('task_id')
        max_iterations = request.json.get('max_iterations', 5)
        
        from scripts.ralph_wiggum import RalphWiggum
        
        ralph = RalphWiggum(vault_path, max_iterations)
        
        # Find task
        task_file = vault_path / 'Needs_Action' / f'{task_id}.md'
        
        if not task_file.exists():
            return jsonify({'error': 'Task not found'}), 404
        
        # Process autonomously
        completed = ralph.process_task_autonomously(task_file)
        
        return jsonify({
            'status': 'completed' if completed else 'needs_review',
            'task_id': task_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/autonomous/status')
def autonomous_status():
    """Check autonomous processing status"""
    try:
        in_progress_path = vault_path / 'In_Progress'
        in_progress_path.mkdir(exist_ok=True)
        
        tasks = list(in_progress_path.glob('*.md'))
        
        return jsonify({
            'active': len(tasks),
            'tasks': [{'id': t.stem, 'name': t.name} for t in tasks]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/facebook/generate', methods=['POST'])
def generate_facebook_post():
    """Generate Facebook/Instagram post"""
    try:
        platform = request.json.get('platform', 'facebook')
        
        from scripts.facebook_manager import FacebookManager
        
        manager = FacebookManager(vault_path)
        content = manager.generate_post(platform)
        
        return jsonify({'content': content})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/facebook/post', methods=['POST'])
def post_to_facebook():
    """Post to Facebook"""
    try:
        message = request.json.get('message')
        image_url = request.json.get('image_url')
        link = request.json.get('link')
        
        from scripts.facebook_manager import FacebookManager
        
        manager = FacebookManager(vault_path)
        result = manager.post_to_facebook(message, image_url, link)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/instagram/post', methods=['POST'])
def post_to_instagram():
    """Post to Instagram"""
    try:
        image_url = request.json.get('image_url')
        caption = request.json.get('caption')
        
        if not image_url:
            return jsonify({'error': 'Image required for Instagram'}), 400
        
        from scripts.facebook_manager import FacebookManager
        
        manager = FacebookManager(vault_path)
        result = manager.post_to_instagram(image_url, caption)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    print("🚀 Backend API started: http://localhost:8000")
    app.run(debug=True, port=8000)