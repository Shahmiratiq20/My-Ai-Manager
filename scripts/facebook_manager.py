import os
import sys
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import requests

sys.path.append(str(Path(__file__).parent.parent))

load_dotenv()

class FacebookManager:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.posted = self.vault_path / 'Posted'
        self.posted.mkdir(exist_ok=True)
        
        # Facebook credentials
        self.access_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
        self.page_id = os.getenv('FACEBOOK_PAGE_ID')
        self.instagram_account_id = os.getenv('INSTAGRAM_ACCOUNT_ID')
        
    def post_to_facebook(self, message, image_url=None, link=None):
        """Post to Facebook Page"""
        if not self.access_token or not self.page_id:
            return {'error': 'Facebook not configured'}
        
        url = f'https://graph.facebook.com/v18.0/{self.page_id}/feed'
        
        params = {
            'message': message,
            'access_token': self.access_token
        }
        
        if link:
            params['link'] = link
        
        try:
            if image_url:
                # Post with photo
                photo_url = f'https://graph.facebook.com/v18.0/{self.page_id}/photos'
                photo_params = {
                    'url': image_url,
                    'caption': message,
                    'access_token': self.access_token
                }
                response = requests.post(photo_url, data=photo_params)
            else:
                # Text only post
                response = requests.post(url, data=params)
            
            if response.status_code == 200:
                self._save_post('facebook', message, image_url)
                return {
                    'status': 'success',
                    'platform': 'facebook',
                    'post_id': response.json().get('id')
                }
            else:
                return {'error': f'Facebook error: {response.status_code}', 'details': response.text}
                
        except Exception as e:
            return {'error': str(e)}
    
    def post_to_instagram(self, image_url, caption):
        """Post to Instagram (Business Account required)"""
        if not self.access_token or not self.instagram_account_id:
            return {'error': 'Instagram not configured'}
        
        try:
            # Step 1: Create media container
            container_url = f'https://graph.facebook.com/v18.0/{self.instagram_account_id}/media'
            
            container_params = {
                'image_url': image_url,
                'caption': caption,
                'access_token': self.access_token
            }
            
            container_response = requests.post(container_url, data=container_params)
            
            if container_response.status_code != 200:
                return {'error': f'Container creation failed: {container_response.text}'}
            
            creation_id = container_response.json().get('id')
            
            # Step 2: Publish media
            publish_url = f'https://graph.facebook.com/v18.0/{self.instagram_account_id}/media_publish'
            
            publish_params = {
                'creation_id': creation_id,
                'access_token': self.access_token
            }
            
            publish_response = requests.post(publish_url, data=publish_params)
            
            if publish_response.status_code == 200:
                self._save_post('instagram', caption, image_url)
                return {
                    'status': 'success',
                    'platform': 'instagram',
                    'post_id': publish_response.json().get('id')
                }
            else:
                return {'error': f'Publish failed: {publish_response.text}'}
                
        except Exception as e:
            return {'error': str(e)}
    
    def generate_post(self, platform='facebook'):
        """Generate platform-specific content"""
        from config.ai_config import AIEngine
        
        ai = AIEngine()
        
        if platform == 'instagram':
            prompt = """Create an engaging Instagram caption about business automation.

Requirements:
- 100-150 words
- Conversational tone
- Include 5-7 relevant hashtags
- Include call-to-action
- Engaging and visual"""
        else:
            prompt = """Create an engaging Facebook post about AI and business.

Requirements:
- 150-200 words
- Conversational and friendly
- Include question to engage audience
- 2-3 hashtags
- Call-to-action"""
        
        return ai.process_task(prompt)
    
    def _save_post(self, platform, content, media=None):
        """Save posted content"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = self.posted / f'{platform.upper()}_{timestamp}.md'
        
        filepath.write_text(f"""---
platform: {platform}
posted: {datetime.now().isoformat()}
status: success
media: {media if media else 'none'}
---

{content}
""", encoding='utf-8')

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    manager = FacebookManager(vault)
    
    # Test post generation
    post = manager.generate_post('facebook')
    print("📱 Generated Facebook Post:\n")
    print(post)