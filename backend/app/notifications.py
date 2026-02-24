import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client
from flask import current_app
import threading
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _send_email_async(app, booking, car_name):
    """Sends an email notification via SMTP in a background thread."""
    with app.app_context():
        try:
            admin_email = current_app.config.get('ADMIN_EMAIL')
            smtp_server = current_app.config.get('SMTP_SERVER')
            smtp_username = current_app.config.get('SMTP_USERNAME')
            smtp_password = current_app.config.get('SMTP_PASSWORD')
            smtp_port = current_app.config.get('SMTP_PORT', 587)

            if not all([admin_email, smtp_server, smtp_username, smtp_password]):
                logger.warning("SMTP configuration is incomplete. Skipping email notification.")
                return

            msg = MIMEMultipart()
            msg['From'] = smtp_username
            msg['To'] = admin_email
            msg['Subject'] = f"New Booking Request: {car_name} - {booking.customer_name}"

            body = f"""
            <h2>New Booking Request Received</h2>
            <p><strong>Customer Name:</strong> {booking.customer_name}</p>
            <p><strong>Phone:</strong> {booking.customer_phone}</p>
            <p><strong>Email:</strong> {booking.customer_email}</p>
            <p><strong>Car:</strong> {car_name}</p>
            <p><strong>Dates:</strong> {booking.start_date.strftime('%Y-%m-%d')} to {booking.end_date.strftime('%Y-%m-%d')}</p>
            <p><strong>Total Price:</strong> {booking.total_price} MAD</p>
            <hr>
            <p><a href="{current_app.config.get('FRONTEND_URL', 'https://mistersdrivers.com')}/admin">Log in to the Admin Dashboard to review.</a></p>
            """
            
            msg.attach(MIMEText(body, 'html'))

            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Admin email notification sent for booking {booking.id}")
        except Exception as e:
            logger.error(f"Failed to send admin email: {str(e)}")

def _send_sms_async(app, booking, car_name):
    """Sends an SMS notification via Twilio in a background thread."""
    with app.app_context():
        try:
            twilio_sid = current_app.config.get('TWILIO_ACCOUNT_SID')
            twilio_auth = current_app.config.get('TWILIO_AUTH_TOKEN')
            twilio_phone = current_app.config.get('TWILIO_PHONE_NUMBER')
            admin_phone = current_app.config.get('ADMIN_PHONE_NUMBER')

            if not all([twilio_sid, twilio_auth, twilio_phone, admin_phone]):
                logger.warning("Twilio configuration is incomplete. Skipping SMS notification.")
                return

            client = Client(twilio_sid, twilio_auth)
            
            message_body = (
                f"🚨 New Booking\n"
                f"Car: {car_name}\n"
                f"Name: {booking.customer_name}\n"
                f"Phone: {booking.customer_phone}\n"
                f"Dates: {booking.start_date.strftime('%Y-%m-%d')} to {booking.end_date.strftime('%Y-%m-%d')}"
            )
            
            client.messages.create(
                body=message_body,
                from_=twilio_phone,
                to=admin_phone
            )
            
            logger.info(f"Admin SMS notification sent for booking {booking.id}")
        except Exception as e:
            logger.error(f"Failed to send admin SMS: {str(e)}")

def notify_admin_of_new_booking(booking, car_name):
    """Entry point to dispatch async notifications. Returns immediately."""
    # We grab the actual Flask app instance to pass into the thread context
    app = current_app._get_current_object()
    
    email_thread = threading.Thread(target=_send_email_async, args=(app, booking, car_name))
    sms_thread = threading.Thread(target=_send_sms_async, args=(app, booking, car_name))
    
    email_thread.start()
    sms_thread.start()
