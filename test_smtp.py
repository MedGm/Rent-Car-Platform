import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def test_email():
    admin_email = os.environ.get('ADMIN_EMAIL')
    smtp_server = os.environ.get('SMTP_SERVER')
    smtp_username = os.environ.get('SMTP_USERNAME')
    # Try getting exactly what's in the env
    smtp_password = os.environ.get('SMTP_PASSWORD')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))

    print(f"Testing SMTP connection to {smtp_server}:{smtp_port} as {smtp_username}")
    print(f"Password raw from env: '{smtp_password}'")

    try:
        # Some users put spaces in Gmail App Passwords which can cause auth errors.
        # Gmail happily accepts them without spaces.
        if smtp_password:
            cleaned_password = smtp_password.replace(" ", "")
            print(f"Testing with cleaned password: '{cleaned_password}'")
        else:
            cleaned_password = ""

        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = admin_email
        msg['Subject'] = "Test Notification from Misters Drivers"

        body = "<p>This is a test notification.</p>"
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.set_debuglevel(1)  # Print full SMTP conversation
        server.starttls()
        # First try the cleaned password, which often fixes the issue
        server.login(smtp_username, cleaned_password)
        server.send_message(msg)
        server.quit()
        
        print("\n✅ Email sent successfully!")
    except Exception as e:
        print(f"\n❌ Failed: {str(e)}")

if __name__ == "__main__":
    test_email()
