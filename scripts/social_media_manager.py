import os
import sys
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import requests

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

load_dotenv()

class SocialMediaManager:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.posted = self.vault_path / 'Posted'
        self.posted.mkdir(exist_ok=True)
        
        # API credentials
        self.linkedin_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        self.linkedin_person_id = os.getenv('LINKEDIN_PERSON_ID')
        
    def post_to_linkedin(self, content, image_path=None):
        """Post to LinkedIn with optional image"""
        if not self.linkedin_token:
            return {'error': 'LinkedIn token not configured'}
        
        # Step 1: Register upload if image provided
        media_urn = None
        if image_path:
            media_urn = self._upload_image(image_path)
            if not media_urn:
                return {'error': 'Image upload failed'}
        
        url = 'https://api.linkedin.com/v2/ugcPosts'
        
        headers = {
            'Authorization': f'Bearer {self.linkedin_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Post data with or without media
        share_content = {
            'shareCommentary': {'text': content},
            'shareMediaCategory': 'IMAGE' if image_path else 'NONE'
        }
        
        if media_urn:
            share_content['media'] = [{
                'status': 'READY',
                'media': media_urn
            }]
        
        post_data = {
            'author': f'urn:li:person:{self.linkedin_person_id}',
            'lifecycleState': 'PUBLISHED',
            'specificContent': {'com.linkedin.ugc.ShareContent': share_content},
            'visibility': {'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'}
        }
        
        try:
            response = requests.post(url, json=post_data, headers=headers)
            
            if response.status_code == 201:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filepath = self.posted / f'LINKEDIN_{timestamp}.md'
                filepath.write_text(f"""---
platform: linkedin
posted: {datetime.now().isoformat()}
status: success
media: {image_path if image_path else 'none'}
---

{content}
""", encoding='utf-8')
                
                return {'status': 'success', 'platform': 'linkedin'}
            else:
                return {'error': f'LinkedIn error: {response.status_code}', 'details': response.text}
                
        except Exception as e:
            return {'error': str(e)}
    
    def _upload_image(self, image_path):
        """Upload image to LinkedIn"""
        # Register upload
        register_url = 'https://api.linkedin.com/v2/assets?action=registerUpload'
        
        register_data = {
            'registerUploadRequest': {
                'recipes': ['urn:li:digitalmediaRecipe:feedshare-image'],
                'owner': f'urn:li:person:{self.linkedin_person_id}',
                'serviceRelationships': [{
                    'relationshipType': 'OWNER',
                    'identifier': 'urn:li:userGeneratedContent'
                }]
            }
        }
        
        headers = {
            'Authorization': f'Bearer {self.linkedin_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(register_url, json=register_data, headers=headers)
            
            if response.status_code != 200:
                print(f"Register failed: {response.text}")
                return None
            
            data = response.json()
            upload_url = data['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl']
            asset = data['value']['asset']
            
            # Upload actual image
            if image_path.startswith('http'):
                img_response = requests.get(image_path)
                img_data = img_response.content
            else:
                with open(image_path, 'rb') as f:
                    img_data = f.read()
            
            upload_response = requests.put(
                upload_url, 
                data=img_data, 
                headers={
                    'Authorization': f'Bearer {self.linkedin_token}',
                    'Content-Type': 'application/octet-stream'
                }
            )
            
            if upload_response.status_code == 201:
                return asset
            
            print(f"Upload failed: {upload_response.status_code}")
            return None
            
        except Exception as e:
            print(f"Image upload error: {e}")
            return None
    
    def generate_post(self, topic=None):
        """Generate AI-powered post"""
        from config.ai_config import AIEngine
        
        ai = AIEngine()
        
        if topic:
            prompt = f"""Create a professional LinkedIn post about {topic}.

Requirements:
- 150-200 words
- Professional tone
- Include 2-3 hashtags
- Actionable insight
- No emojis"""
        else:
            prompt = """Create a professional LinkedIn post about AI automation benefits for small businesses.

Requirements:
- 150-200 words
- Professional tone
- Include 2-3 hashtags
- Actionable insight
- No emojis"""
        
        return ai.process_task(prompt)
    
    def auto_post_daily(self):
        """Generate and post content"""
        print("🤖 Generating LinkedIn post...")
        
        content = self.generate_post()
        print(f"📝 Content generated: {content[:100]}...")
        
        result = self.post_to_linkedin(content)
        
        if 'error' in result:
            print(f"❌ Failed: {result['error']}")
        else:
            print(f"✅ Posted to LinkedIn!")
        
        return result

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    manager = SocialMediaManager(vault)
    
    # Test post generation and posting
    print("🚀 Testing LinkedIn Integration...\n")
    
    content = manager.generate_post()
    print("=== Generated Post ===\n")
    print(content)
    print("\n" + "="*50 + "\n")
    
    # Post to LinkedIn
    result = manager.post_to_linkedin(content)
    print(f"\n📤 Posting Result: {result}")