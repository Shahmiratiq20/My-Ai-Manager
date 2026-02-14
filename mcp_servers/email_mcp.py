import os
import sys
from pathlib import Path
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import smtplib
from dotenv import load_dotenv

sys.path.append(str(Path(__file__).parent.parent))
load_dotenv()

class EmailMCP:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.email = os.getenv('SMTP_EMAIL')
        self.password = os.getenv('SMTP_PASSWORD')
        
        if not self.email or not self.password:
            raise ValueError("SMTP credentials not configured in .env")
    
    def send_email(self, to, subject, body, html=False, attachments=None):
        """Send email via SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.email
            msg['To'] = to if isinstance(to, str) else ', '.join(to)
            msg['Subject'] = subject
            
            # Add body
            if html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            # Add attachments
            if attachments:
                for filepath in attachments:
                    self._add_attachment(msg, filepath)
            
            # Send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email, self.password)
                server.send_message(msg)
            
            return {
                'status': 'success',
                'to': to,
                'subject': subject
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def send_bulk(self, recipients, subject, body, html=False):
        """Send bulk emails"""
        results = []
        
        for recipient in recipients:
            result = self.send_email(recipient, subject, body, html)
            results.append({
                'recipient': recipient,
                'status': result['status']
            })
        
        return {
            'total': len(recipients),
            'sent': len([r for r in results if r['status'] == 'success']),
            'failed': len([r for r in results if r['status'] != 'success']),
            'results': results
        }
    
    def _add_attachment(self, msg, filepath):
        """Add attachment to email"""
        filepath = Path(filepath)
        
        with open(filepath, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
        
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            f'attachment; filename={filepath.name}'
        )
        
        msg.attach(part)

# MCP Server Interface
def handle_request(method, params):
    """MCP protocol handler"""
    mcp = EmailMCP()
    
    if method == 'send_email':
        return mcp.send_email(
            to=params.get('to'),
            subject=params.get('subject'),
            body=params.get('body'),
            html=params.get('html', False),
            attachments=params.get('attachments')
        )
    
    elif method == 'send_bulk':
        return mcp.send_bulk(
            recipients=params.get('recipients'),
            subject=params.get('subject'),
            body=params.get('body'),
            html=params.get('html', False)
        )
    
    else:
        return {'error': f'Unknown method: {method}'}

if __name__ == "__main__":
    # Test
    print("📧 Email MCP Server")
    
    # Example usage
    mcp = EmailMCP()
    
    result = mcp.send_email(
        to='freelacing123@gmail.com',
        subject='Test from AI Employee',
        body='This is a test email sent via MCP server.'
    )
    
    print(f"Result: {result}")