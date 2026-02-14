import sys
from pathlib import Path
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

sys.path.append(str(Path(__file__).parent.parent))

load_dotenv()

class WhatsAppManager:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        
        # WhatsApp Business API credentials
        self.phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
        self.access_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
        self.api_version = 'v18.0'
        
    def send_message(self, to, message):
        """Send WhatsApp message"""
        if not self.phone_number_id or not self.access_token:
            return {'error': 'WhatsApp not configured'}
        
        url = f'https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages'
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'messaging_product': 'whatsapp',
            'to': to,
            'type': 'text',
            'text': {'body': message}
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                return {
                    'status': 'success',
                    'message_id': response.json().get('messages', [{}])[0].get('id')
                }
            else:
                return {'error': f'WhatsApp error: {response.status_code}', 'details': response.text}
                
        except Exception as e:
            return {'error': str(e)}
    
    def send_template(self, to, template_name, language='en'):
        """Send WhatsApp template message"""
        if not self.phone_number_id or not self.access_token:
            return {'error': 'WhatsApp not configured'}
        
        url = f'https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages'
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'messaging_product': 'whatsapp',
            'to': to,
            'type': 'template',
            'template': {
                'name': template_name,
                'language': {'code': language}
            }
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                return {'status': 'success'}
            else:
                return {'error': f'Template send failed: {response.text}'}
                
        except Exception as e:
            return {'error': str(e)}
    
    def generate_reply(self, incoming_message):
        """Generate AI reply to WhatsApp message"""
        from config.ai_config import AIEngine
        
        ai = AIEngine()
        
        prompt = f"""Generate a professional WhatsApp reply to:

"{incoming_message}"

Requirements:
- Brief and conversational (max 100 words)
- Helpful and friendly tone
- End with clear next step if needed"""
        
        return ai.process_task(prompt)

if __name__ == "__main__":
    vault = Path(__file__).parent.parent / 'vault'
    manager = WhatsAppManager(vault)
    
    # Test message generation
    reply = manager.generate_reply("Hi, can you send me the invoice?")
    print("💬 Generated Reply:\n")
    print(reply)