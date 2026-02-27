import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from flask import current_app
import threading
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _send_email_async(app, booking, car_name):
    """Sends a styled email notification via the Brevo API in a background thread."""
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
            
            subject = f"🔔 New Booking Request: {car_name}"
            admin_url = f"{current_app.config.get('FRONTEND_URL', 'https://mistersdrivers.com')}/admin"
            
            # Enhanced professional HTML template
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                    <h1 style="color: #111827; margin: 0;">New Booking Request</h1>
                    <p style="color: #6b7280; font-size: 16px; margin-top: 5px;">A new customer has submitted a reservation.</p>
                </div>
                
                <div style="padding: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280;"><strong>Customer Name</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #111827; font-weight: 500;">{booking.customer_name}</td></tr>
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280;"><strong>Phone</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #111827; font-weight: 500;">{booking.customer_phone}</td></tr>
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280;"><strong>Email</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #111827; font-weight: 500;">{booking.customer_email}</td></tr>
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280;"><strong>Vehicle</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #111827; font-weight: 500;">{car_name}</td></tr>
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #6b7280;"><strong>Dates</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #111827; font-weight: 500;">{booking.start_date.strftime('%d %b %Y')} - {booking.end_date.strftime('%d %b %Y')}</td></tr>
                        <tr><td style="padding: 15px 0 5px 0; color: #6b7280;"><strong>Total Price</strong></td><td style="padding: 15px 0 5px 0; text-align: right; color: #111827; font-size: 18px; font-weight: bold;">{booking.total_price} MAD</td></tr>
                    </table>
                </div>
                
                <div style="text-align: center; padding-top: 20px;">
                    <a href="{admin_url}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View in Dashboard</a>
                </div>
            </div>
            """
            
            sender = {"name":"Misters Drivers", "email":sender_email}
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
            logger.error(f"Brevo Email API Exception: {e}")
        except Exception as e:
            logger.error(f"Failed to send admin email: {str(e)}")

def _send_sms_async(app, booking, car_name):
    """Sends an SMS notification via the Brevo API in a background thread."""
    with app.app_context():
        try:
            api_key = current_app.config.get('BREVO_API_KEY')
            admin_phone = current_app.config.get('ADMIN_PHONE_NUMBER')

            if not all([api_key, admin_phone]):
                logger.warning("Brevo API key or admin phone is missing. Skipping SMS notification.")
                return

            configuration = sib_api_v3_sdk.Configuration()
            configuration.api_key['api-key'] = api_key
            api_instance = sib_api_v3_sdk.TransactionalSMSApi(sib_api_v3_sdk.ApiClient(configuration))
            
            message_body = (
                f"🚨 New Booking Request\n"
                f"Car: {car_name}\n"
                f"Name: {booking.customer_name}\n"
                f"Phone: {booking.customer_phone}\n"
                f"Dates: {booking.start_date.strftime('%d/%m')} to {booking.end_date.strftime('%d/%m')}\n"
                f"Price: {booking.total_price} MAD"
            )
            
            # Brevo requires the sender name to be alphanumeric and max 11 chars.
            sender = "MDrivers" 
            
            send_transac_sms = sib_api_v3_sdk.SendTransacSms(
                sender=sender,
                recipient=admin_phone,
                content=message_body
            )
            
            api_instance.send_transac_sms(send_transac_sms)
            logger.info(f"Admin Brevo SMS notification sent for booking {booking.id}")
            
        except ApiException as e:
            logger.error(f"Brevo SMS API Exception: {e}")
        except Exception as e:
            logger.error(f"Failed to send admin SMS: {str(e)}")

def _send_customer_confirmation_email_async(app, booking, car_name):
    """Sends a styled confirmation email via the Brevo API in a background thread."""
    with app.app_context():
        try:
            sender_email = current_app.config.get('ADMIN_SENDER_EMAIL') or "notifications@mistersdrivers.com"
            api_key = current_app.config.get('BREVO_API_KEY')

            if not api_key or not booking.customer_email:
                logger.warning("Brevo API key or customer email missing. Skipping confirmation email.")
                return

            configuration = sib_api_v3_sdk.Configuration()
            configuration.api_key['api-key'] = api_key
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            frontend_url = current_app.config.get('FRONTEND_URL', 'https://mistersdrivers.com')
            logo_url = f"{frontend_url}/logo.png"
            subject = f"Misters Drivers - Your Booking is Confirmed!"
            
            # Enhanced professional HTML template for the customer with App Theme (Dark/Red matching)
            html_content = f"""
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
                
                <!-- Dark Header with Logo -->
                <div style="background-color: #0a0a0a; padding: 30px 20px; text-align: center; border-bottom: 4px solid #ef4444;">
                    <img src="{logo_url}" alt="Misters Drivers" style="max-height: 45px; width: auto; display: block; margin: 0 auto;" />
                </div>
                
                <div style="padding: 40px 30px;">
                    <div style="text-align: center; padding-bottom: 25px;">
                        <span style="display: inline-block; background-color: #ecfdf5; color: #10b981; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 15px;">✓ Reservation Confirmed</span>
                        <h1 style="color: #111827; margin: 0 0 10px 0; font-size: 24px;">Thank you, {booking.customer_name}!</h1>
                        <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">Your vehicle is officially reserved. We are reviewing the final details and look forward to serving you.</p>
                    </div>
                    
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 25px; border: 1px solid #f3f4f6;">
                        <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #6b7280; font-size: 15px;"><strong>Vehicle</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; text-align: right; color: #111827; font-weight: 600; font-size: 15px;">{car_name}</td></tr>
                            <tr><td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #6b7280; font-size: 15px;"><strong>Dates</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; text-align: right; color: #111827; font-weight: 600; font-size: 15px;">{booking.start_date.strftime('%d %b %Y')} - {booking.end_date.strftime('%d %b %Y')}</td></tr>
                            <tr><td style="padding: 15px 0 0 0; color: #6b7280; font-size: 15px;"><strong>Total Price</strong></td><td style="padding: 15px 0 0 0; text-align: right; color: #ef4444; font-size: 20px; font-weight: bold;">{booking.total_price} DH</td></tr>
                        </table>
                    </div>
                </div>
                
                <!-- Footer area -->
                <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #eaeaea;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Need to make changes to your trip?</p>
                    <a href="{frontend_url}/#contact" style="color: #ef4444; text-decoration: none; font-weight: bold; font-size: 14px;">Contact Support</a>
                    <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">&copy; 2026 Misters Drivers. All rights reserved.</p>
                </div>
            </div>
            """
            
            sender = {"name":"Misters Drivers", "email":sender_email}
            to = [{"email":booking.customer_email, "name":booking.customer_name}]
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=to,
                html_content=html_content,
                sender=sender,
                subject=subject
            )
            
            api_instance.send_transac_email(send_smtp_email)
            logger.info(f"Customer confirmation Brevo email sent for booking {booking.id}")
            
        except ApiException as e:
            logger.error(f"Brevo Email API Exception (Customer): {e}")
        except Exception as e:
            logger.error(f"Failed to send customer confirmation email: {str(e)}")

def notify_admin_of_new_booking(booking, car_name):
    """Entry point to dispatch async notifications for admins. Returns immediately."""
    app = current_app._get_current_object()
    
    email_thread = threading.Thread(target=_send_email_async, args=(app, booking, car_name))
    sms_thread = threading.Thread(target=_send_sms_async, args=(app, booking, car_name))
    
    email_thread.start()
    sms_thread.start()

def notify_customer_booking_confirmed(booking, car_name):
    """Entry point to dispatch customer confirmation email. Returns immediately."""
    app = current_app._get_current_object()
    
    email_thread = threading.Thread(target=_send_customer_confirmation_email_async, args=(app, booking, car_name))
    email_thread.start()
