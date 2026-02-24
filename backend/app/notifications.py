import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from twilio.rest import Client
from flask import current_app
import threading
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _send_email_async(app, booking, car_name):
    """Sends an email notification via the Brevo API in a background thread."""
    with app.app_context():
        try:
            admin_email = current_app.config.get('ADMIN_EMAIL')
            sender_email = current_app.config.get('ADMIN_SENDER_EMAIL') or "notifications@mistersdrivers.com"
            api_key = current_app.config.get('BREVO_API_KEY')

            if not all([admin_email, api_key]):
                logger.warning("Brevo API configuration is incomplete. Skipping email notification.")
                return

            configuration = sib_api_v3_sdk.Configuration()
            configuration.api_key['api-key'] = api_key
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            subject = f"New Booking Request: {car_name} - {booking.customer_name}"
            html_content = f"""
            <html><body>
            <h2>New Booking Request Received</h2>
            <p><strong>Customer Name:</strong> {booking.customer_name}</p>
            <p><strong>Phone:</strong> {booking.customer_phone}</p>
            <p><strong>Email:</strong> {booking.customer_email}</p>
            <p><strong>Car:</strong> {car_name}</p>
            <p><strong>Dates:</strong> {booking.start_date.strftime('%Y-%m-%d')} to {booking.end_date.strftime('%Y-%m-%d')}</p>
            <p><strong>Total Price:</strong> {booking.total_price} MAD</p>
            <hr>
            <p><a href="{current_app.config.get('FRONTEND_URL', 'https://mistersdrivers.com')}/admin">Log in to the Admin Dashboard to review.</a></p>
            </body></html>
            """
            
            sender = {"name":"Misters Drivers Notifications", "email":sender_email}
            to = [{"email":admin_email, "name":"Admin"}]
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=to,
                html_content=html_content,
                sender=sender,
                subject=subject
            )
            
            api_instance.send_transac_email(send_smtp_email)
            logger.info(f"Admin Brevo email notification sent for booking {booking.id}")
            
        except ApiException as e:
            logger.error(f"Brevo API Exception: {e}")
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
