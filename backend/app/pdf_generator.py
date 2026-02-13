"""
PDF Generator for Rental Contracts and Invoices (Facturation)
Format matches Misters Drivers Agadir rental agency documents exactly.
"""
import os
from io import BytesIO
from datetime import datetime, date
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import black, white, HexColor, grey, lightgrey
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

# Company info
COMPANY_NAME = "MISTERS DRIVERS"
COMPANY_TEL_1 = "05 28 21 09 09"
COMPANY_TEL_2 = "06 71 92 05 45"
COMPANY_TEL_FULL = "+212 661 49 46 62 / +212 528 21 09 09"
COMPANY_EMAIL = "driversmisters@gmail.com"
COMPANY_ADDRESS = "Mag N° AH 545, Cité El Qods, Agadir"
COMPANY_TP = "67501753"
COMPANY_RC = "42331"
COMPANY_IF = "42725675"
COMPANY_ICE = "002380371000049"
COMPANY_BANK = "Attijari Wafabank"
COMPANY_BANK_AGENCY = "Hassan 1er Dakhla Agadir"
COMPANY_RIB = "007 010 0015245000000014 86"

# Colors matching the original documents (dark navy blue)
NAVY = HexColor('#1a2744')
DARK_NAVY = HexColor('#0f1a30')
BLACK = HexColor('#000000')
LIGHT_GREY = HexColor('#F0F0F0')
MEDIUM_GREY = HexColor('#888888')
TABLE_BORDER = HexColor('#1a2744')
WHITE = white

LOGO_PATH = os.path.join(os.path.dirname(__file__), 'static', 'logo.png')
CAR_DIAGRAM_PATH = os.path.join(os.path.dirname(__file__), 'static', 'contrat.png')


def _get_logo_path():
    """Get the absolute path to the logo file."""
    if os.path.exists(LOGO_PATH):
        return LOGO_PATH
    # Fallback: try relative to cwd
    alt = os.path.join(os.getcwd(), 'app', 'static', 'logo.png')
    if os.path.exists(alt):
        return alt
    return None


def _draw_dotted_line(c, x1, y, x2):
    """Draw a dotted fill line for form fields."""
    c.setStrokeColor(MEDIUM_GREY)
    c.setDash(1, 2)
    c.setLineWidth(0.3)
    c.line(x1, y, x2, y)
    c.setDash()
    c.setStrokeColor(BLACK)
    c.setLineWidth(0.5)


def generate_contract_pdf(booking, car, output_path):
    """
    Generate a rental contract PDF (Contrat de Location).
    Matches the exact Misters Drivers contract format.
    """
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    margin_l = 25
    margin_r = width - 25
    mid_x = width / 2  # divider between left and right columns

    customer_name = booking.customer_name or ""
    customer_phone = booking.customer_phone or ""
    customer_email = booking.customer_email or ""
    rental_duration = (booking.end_date - booking.start_date).days
    contract_num = f"{booking.id:06d}"

    # Extract customer details from JSONB
    cd = booking.customer_details or {}
    address_morocco = cd.get('address_morocco', '')
    address_abroad = cd.get('address_abroad', '')
    license_number = cd.get('license_number', '')
    license_issued_at = cd.get('license_issued_at', '')
    passport = cd.get('passport', '')
    cin = cd.get('cin', '')
    cin_valid_until = cd.get('cin_valid_until', '')
    birth_date = cd.get('birth_date', '')
    nationality = cd.get('nationality', '')
    delivery_location = cd.get('delivery_location', '')
    return_location = cd.get('return_location', '')

    # ============================================================
    # HEADER - Logo + Title
    # ============================================================
    logo = _get_logo_path()
    if logo:
        c.drawImage(logo, margin_l, height - 85, width=100, height=55,
                     preserveAspectRatio=True, mask='auto')

    # Title block - top right
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 16)
    c.drawRightString(margin_r, height - 30, "CONTRAT DE LOCATION")
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(margin_r, height - 48, contract_num)

    # Contact info below title
    c.setFont("Helvetica", 7)
    c.setFillColor(BLACK)
    c.drawRightString(margin_r, height - 62, f"Tél: {COMPANY_TEL_1} / {COMPANY_TEL_2}")
    c.drawRightString(margin_r, height - 72, f"E-mail: {COMPANY_EMAIL}")
    c.drawRightString(margin_r, height - 82, f"ADRESSE: {COMPANY_ADDRESS}")

    # Horizontal line under header
    y = height - 90
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.5)
    c.line(margin_l, y, margin_r, y)

    # ============================================================
    # LEFT COLUMN - Vehicle & Rental Info
    # ============================================================
    col_left_end = mid_x - 10
    y_left = y - 15
    label_x = margin_l + 5
    dots_start = margin_l + 95
    dots_end = col_left_end

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)

    # MARQUE / N° IMM
    c.drawString(label_x, y_left, "MARQUE :")
    _draw_dotted_line(c, label_x + 50, y_left - 2, dots_start + 30)
    c.setFillColor(BLACK)
    c.setFont("Helvetica", 8)
    c.drawString(label_x + 52, y_left, car.name)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(dots_start + 35, y_left, "N° IMM :")
    _draw_dotted_line(c, dots_start + 75, y_left - 2, dots_end)

    y_left -= 14
    c.drawString(label_x, y_left, "LIEU DE LIVRAISON :")
    _draw_dotted_line(c, label_x + 95, y_left - 2, dots_end)
    if delivery_location:
        c.setFillColor(BLACK)
        c.setFont("Helvetica", 8)
        c.drawString(label_x + 97, y_left, delivery_location)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 8)

    y_left -= 14
    c.drawString(label_x, y_left, "LIEU DE REPRISE :")
    _draw_dotted_line(c, label_x + 85, y_left - 2, dots_end)
    if return_location:
        c.setFillColor(BLACK)
        c.setFont("Helvetica", 8)
        c.drawString(label_x + 87, y_left, return_location)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 8)

    # Date/time fields with boxes
    y_left -= 16
    c.drawString(label_x, y_left, "DATE ET HEURE DEPART")
    # Date box
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.5)
    box_x = label_x + 110
    c.rect(box_x, y_left - 4, 80, 14, fill=0)
    c.setFillColor(BLACK)
    c.setFont("Helvetica", 8)
    c.drawCentredString(box_x + 40, y_left, booking.start_date.strftime('%d/%m/%Y'))
    # H box
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(box_x + 85, y_left, "H")
    c.rect(box_x + 95, y_left - 4, 35, 14, fill=0)

    y_left -= 16
    c.drawString(label_x, y_left, "DATE ET HEURE RETOUR")
    c.rect(box_x, y_left - 4, 80, 14, fill=0)
    c.setFillColor(BLACK)
    c.setFont("Helvetica", 8)
    c.drawCentredString(box_x + 40, y_left, booking.end_date.strftime('%d/%m/%Y'))
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(box_x + 85, y_left, "H")
    c.rect(box_x + 95, y_left - 4, 35, 14, fill=0)

    y_left -= 16
    c.drawString(label_x, y_left, "DURÉE LOCATION")
    c.rect(box_x, y_left - 4, 80, 14, fill=0)
    c.setFillColor(BLACK)
    c.setFont("Helvetica", 8)
    c.drawCentredString(box_x + 40, y_left, f"{rental_duration} jour(s)")

    # LOCATION section header
    y_left -= 22
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString((margin_l + col_left_end) / 2, y_left, "LOCATION")

    # Client fields
    y_left -= 18
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(NAVY)

    location_fields = [
        ("Nom prénom", customer_name),
        ("Adresse au Maroc", address_morocco),
        ("", ""),
        ("Tél", customer_phone),
        ("Adresse à l'étranger", address_abroad),
        ("", ""),
        ("Permis de conduire n°", license_number),
        ("Délivré", license_issued_at),
        ("Passeport", passport),
        ("N° C.I.N.", cin),
        ("Jusqu'au", cin_valid_until),
        ("Né le", birth_date),
        ("Nationalité", nationality),
    ]

    for label, value in location_fields:
        if label:
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 7)
            lw = c.stringWidth(label + " :", "Helvetica-Bold", 7)
            c.drawString(label_x, y_left, label + " :")
            _draw_dotted_line(c, label_x + lw + 3, y_left - 2, dots_end)
            if value:
                c.setFillColor(BLACK)
                c.setFont("Helvetica", 7)
                c.drawString(label_x + lw + 5, y_left, value)
        y_left -= 12

    # 2ème CONDUCTEUR section
    y_left -= 8
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString((margin_l + col_left_end) / 2, y_left, "2ème CONDUCTEUR Agrée")

    y_left -= 14
    cond_fields = [
        "Nom prénom",
        "Permis de conduire n°",
        "C.I.N.N°",
        "Délivré le",
        "Passeport",
        "Adresse",
    ]
    c.setFont("Helvetica-Bold", 7)
    for label in cond_fields:
        c.setFillColor(NAVY)
        lw = c.stringWidth(label + " :", "Helvetica-Bold", 7)
        c.drawString(label_x, y_left, label + " :")
        _draw_dotted_line(c, label_x + lw + 3, y_left - 2, dots_end)
        y_left -= 12

    # Disclaimer text
    y_left -= 8
    c.setFillColor(BLACK)
    c.setFont("Helvetica", 6)
    disclaimer_lines = [
        "Je reconnais ma responsabilité pour tous dégâts subis par",
        "la voiture à moins qu'il soit établi l'existence d'un autre responsable",
        "pour les dits dégâts.",
        "",
        "Lu et accepté les conditions stipulées ci-contre au verso de",
        "ce contrat",
    ]
    for line in disclaimer_lines:
        c.drawString(label_x, y_left, line)
        y_left -= 9

    # Signature areas
    y_left -= 8
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString((margin_l + col_left_end) / 2, y_left, "Signater Locataire (1)")
    y_left -= 35
    c.setStrokeColor(MEDIUM_GREY)
    c.setLineWidth(0.3)
    c.rect(label_x, y_left, col_left_end - label_x - 10, 30, fill=0)

    y_left -= 15
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString((margin_l + col_left_end) / 2, y_left, "Signater Locataire (2)")
    y_left -= 35
    c.setStrokeColor(MEDIUM_GREY)
    c.rect(label_x, y_left, col_left_end - label_x - 10, 30, fill=0)

    # ============================================================
    # RIGHT COLUMN - Prolongation, Car Diagram, Payment
    # ============================================================
    col_right_start = mid_x + 5
    col_right_end = margin_r - 5
    y_right = y - 15
    rlabel_x = col_right_start + 5

    # PROLONGATION
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString((col_right_start + col_right_end) / 2, y_right, "PROLONGATION")

    y_right -= 16
    c.setFont("Helvetica-Bold", 7)
    c.drawString(rlabel_x, y_right, "Du :")
    _draw_dotted_line(c, rlabel_x + 20, y_right - 2, (col_right_start + col_right_end) / 2)
    c.drawString((col_right_start + col_right_end) / 2 + 5, y_right, "Au :")
    _draw_dotted_line(c, (col_right_start + col_right_end) / 2 + 25, y_right - 2, col_right_end)

    # CHANGEMENT DE VÉHICULE
    y_right -= 22
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString((col_right_start + col_right_end) / 2, y_right, "CHANGEMENT DE VÉHICULE")

    y_right -= 16
    c.setFont("Helvetica-Bold", 7)
    change_fields = [
        "MARQUE :",
        "N° IMM :",
        "LIEU DE LIVRAISON :",
    ]
    for label in change_fields:
        c.drawString(rlabel_x, y_right, label)
        lw = c.stringWidth(label, "Helvetica-Bold", 7)
        _draw_dotted_line(c, rlabel_x + lw + 3, y_right - 2, col_right_end)
        y_right -= 12

    # Date/time fields for vehicle change
    for dt_label in ["DATE ET HEURE DEPART", "DATE ET HEURE RETOUR"]:
        c.drawString(rlabel_x, y_right, dt_label)
        rbox_x = rlabel_x + 110
        c.setStrokeColor(NAVY)
        c.rect(rbox_x, y_right - 4, 65, 14, fill=0)
        c.drawString(rbox_x + 68, y_right, "H")
        c.rect(rbox_x + 78, y_right - 4, 30, 14, fill=0)
        y_right -= 16

    c.drawString(rlabel_x, y_right, "DURÉE LOCATION")
    c.rect(rlabel_x + 110, y_right - 4, 65, 14, fill=0)

    # Car Diagram (AV / AR) - use contrat.png image
    y_right -= 25
    car_center_x = (col_right_start + col_right_end) / 2
    car_center_y = y_right - 32

    # Draw the car diagram image
    car_w = 110
    car_h = 72
    car_img_path = CAR_DIAGRAM_PATH
    if os.path.exists(car_img_path):
        c.drawImage(car_img_path,
                    car_center_x - car_w/2, car_center_y - car_h/2,
                    width=car_w, height=car_h,
                    preserveAspectRatio=True, mask='auto')
    else:
        # Fallback: simple rectangle
        c.setStrokeColor(NAVY)
        c.setLineWidth(0.8)
        c.rect(car_center_x - car_w/2, car_center_y - car_h/2, car_w, car_h, fill=0)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(col_right_start + 10, car_center_y, "AV")
    c.drawRightString(col_right_end - 10, car_center_y, "AR")

    # Carburant + Number Km section
    y_right = car_center_y - car_h/2 - 15
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.5)

    # Carburant box
    carb_x = col_right_start + 5
    carb_w = (col_right_end - col_right_start) / 2 - 10
    carb_box_h = 32
    c.rect(carb_x, y_right - carb_box_h + 5, carb_w, carb_box_h, fill=0)
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(NAVY)
    c.drawCentredString(carb_x + carb_w/2, y_right + 6, "Carburant")

    # Fuel gauge indicators E-F
    gauge_y = y_right - 14
    c.setFont("Helvetica-Bold", 7)
    c.drawString(carb_x + 5, gauge_y, "E")
    c.drawRightString(carb_x + carb_w - 5, gauge_y, "F")
    # Draw gauge marks
    for i in range(8):
        gx = carb_x + 18 + i * ((carb_w - 36) / 7)
        c.setLineWidth(0.3)
        c.line(gx, gauge_y - 3, gx, gauge_y + 8)

    # Number Km box
    km_x = carb_x + carb_w + 10
    km_w = carb_w
    c.setLineWidth(0.5)
    c.rect(km_x, y_right - carb_box_h + 5, km_w, carb_box_h, fill=0)
    c.drawCentredString(km_x + km_w/2, y_right + 6, "Number Km")

    # ASSURANCE section
    y_right -= 50
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(NAVY)
    c.setStrokeColor(NAVY)
    assur_box_h = 58
    c.rect(col_right_start + 5, y_right - assur_box_h + 5, col_right_end - col_right_start - 10, assur_box_h, fill=0)
    c.drawCentredString((col_right_start + col_right_end) / 2, y_right + 6,
                         'ASSURANCE "TOUS RISQUES" AUX TIRES')

    # AVEC / SANS checkboxes
    assur_y = y_right - 12
    c.setFont("Helvetica-Bold", 7)
    c.rect(rlabel_x + 5, assur_y - 2, 10, 10, fill=0)
    c.drawString(rlabel_x + 18, assur_y, "AVEC")
    c.rect(rlabel_x + 55, assur_y - 2, 10, 10, fill=0)
    c.drawString(rlabel_x + 68, assur_y, "SANS")

    assur_y -= 15
    c.drawString(rlabel_x, assur_y, "Franchise :")
    _draw_dotted_line(c, rlabel_x + 50, assur_y - 2, col_right_end - 10)
    assur_y -= 14
    c.drawString(rlabel_x, assur_y, "Avance :")
    _draw_dotted_line(c, rlabel_x + 40, assur_y - 2, col_right_end - 10)

    # Payment section
    y_right -= 72
    c.setFont("Helvetica-Bold", 7)
    payment_items = [
        ("ESPECES", True),
        ("CHEQUE N°", True),
        ("CARTE DE CREDIT", True),
    ]
    for label, has_box in payment_items:
        if has_box:
            c.rect(rlabel_x + 5, y_right - 2, 10, 10, fill=0)
            c.drawString(rlabel_x + 18, y_right, label)
            _draw_dotted_line(c, rlabel_x + 18 + c.stringWidth(label, "Helvetica-Bold", 7) + 3,
                              y_right - 2, col_right_end - 10)
        y_right -= 14

    # Date de Paiement
    y_right -= 5
    c.drawString(rlabel_x, y_right, "Date de Paiement")
    c.rect(rlabel_x + 80, y_right - 4, 70, 14, fill=0)
    c.rect(rlabel_x + 155, y_right - 4, 50, 14, fill=0)

    # Right column bottom disclaimer
    y_right -= 25
    c.setFillColor(BLACK)
    c.setFont("Helvetica", 5.5)
    right_disclaimer = [
        "Le locataire reconnaît sa responsabilité pour tous les dégâts",
        "subis par la voiture à moins qu'il soit établi l'existence",
        "d'une autre responsabilité pour ces dégâts.",
        "",
        "Lu et approuvé par le locataire, les conditions mentionnées ci-contre et au verso",
    ]
    for line in right_disclaimer:
        c.drawString(rlabel_x, y_right, line)
        y_right -= 8

    y_right -= 8
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString((col_right_start + col_right_end) / 2, y_right, "BONNE ROUTE")

    # ============================================================
    # Bottom - Fait à / Le
    # ============================================================
    bottom_y = 50
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin_l + 5, bottom_y, "Fait à :")
    _draw_dotted_line(c, margin_l + 40, bottom_y - 2, margin_l + 140)
    c.drawString(margin_l + 145, bottom_y, "Le :")
    _draw_dotted_line(c, margin_l + 160, bottom_y - 2, margin_l + 260)

    # Footer line
    footer_y = 30
    c.setStrokeColor(NAVY)
    c.setLineWidth(1)
    c.line(margin_l, footer_y + 5, margin_r, footer_y + 5)

    c.setFillColor(MEDIUM_GREY)
    c.setFont("Helvetica", 5.5)
    footer_text = f"Mag N° AH 545, cité El Qods, Agadir. TP : {COMPANY_TP} - RC : {COMPANY_RC} - IF : {COMPANY_IF} - ICE : {COMPANY_ICE}"
    c.drawCentredString(width / 2, footer_y - 3, footer_text)
    c.drawCentredString(width / 2, footer_y - 11, f"Tél : {COMPANY_TEL_FULL} - E-mail: {COMPANY_EMAIL}")

    c.save()
    return output_path


def _amount_to_words_fr(amount):
    """Convert amount to French words."""
    try:
        from num2words import num2words
        integer_part = int(amount)
        return num2words(integer_part, lang='fr') + " MAD"
    except Exception:
        return f"{amount} MAD"


def generate_invoice_pdf(booking, car, output_path, include_tax=True):
    """
    Generate an invoice/facturation PDF.
    Matches exact Misters Drivers facturation format.
    Single page with all totals (HT, TVA, TTC).
    """
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    rental_days = (booking.end_date - booking.start_date).days
    daily_rate = 200  # Default MAD per day
    if car.specs and isinstance(car.specs, dict):
        daily_rate = car.specs.get('daily_rate', 200)

    total_ht = daily_rate * rental_days
    tva_rate = 0.20
    tva_amount = total_ht * tva_rate
    total_ttc = total_ht + tva_amount

    customer_name = booking.customer_name or "Client"
    customer_phone = booking.customer_phone or ""
    customer_email = booking.customer_email or ""
    invoice_date = datetime.now().strftime('%d/%m/%Y')
    invoice_num = f"FA-{booking.id:04d}-{datetime.now().strftime('%y')}-{customer_name.upper().replace(' ', '-')}"
    invoice_ref = f"FA-{booking.id:04d}- 1/1"

    margin_l = 35
    margin_r = width - 35

    _draw_invoice_page(c, width, height,
                       invoice_num=invoice_num,
                       invoice_ref=invoice_ref,
                       invoice_date=invoice_date,
                       customer_name=customer_name,
                       customer_email=customer_email,
                       customer_phone=customer_phone,
                       car_name=car.name,
                       start_date=booking.start_date.strftime('%d/%m/%Y'),
                       end_date=booking.end_date.strftime('%d/%m/%Y'),
                       rental_days=rental_days,
                       daily_rate=daily_rate,
                       total_ht=total_ht,
                       tva_amount=tva_amount,
                       total_ttc=total_ttc)

    c.save()
    return output_path


def _draw_invoice_page(c, width, height, invoice_num, invoice_ref, invoice_date,
                       customer_name, customer_email, customer_phone,
                       car_name, start_date, end_date, rental_days,
                       daily_rate, total_ht, tva_amount, total_ttc):
    """Draw a single invoice page matching the exact Misters Drivers facturation format."""

    margin_l = 35
    margin_r = width - 35

    # ============================================================
    # HEADER - Logo + Date
    # ============================================================
    logo = _get_logo_path()
    if logo:
        c.drawImage(logo, margin_l, height - 90, width=120, height=65,
                     preserveAspectRatio=True, mask='auto')

    # Date top right
    c.setFillColor(BLACK)
    c.setFont("Helvetica", 10)
    c.drawRightString(margin_r, height - 45, f"AGADIR, le {invoice_date}")

    # ============================================================
    # CLIENT INFO
    # ============================================================
    y = height - 110
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", 9)

    # Client fields with dotted lines
    client_fields = [
        ("Société", customer_name),
        ("ICE", ""),
        ("Adresse", ""),
    ]

    for label, value in client_fields:
        c.setFont("Helvetica-Bold", 9)
        lw = c.stringWidth(label + " : ", "Helvetica-Bold", 9)
        c.drawString(margin_l, y, label + " :")
        c.setFont("Helvetica", 9)
        if value:
            c.drawString(margin_l + lw + 5, y, value)
        y -= 16

    # ============================================================
    # FACTURE NUMBER
    # ============================================================
    y -= 8
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin_l, y, f"Facture N° : {invoice_num}")

    # ============================================================
    # ITEMS TABLE
    # ============================================================
    y -= 25

    # Table columns matching the original:
    # Désignation | Quantité | P.U en MAD HT | Prix Total en MAD (H.T)
    col_widths = [190, 55, 125, 155]
    table_width = sum(col_widths)

    header = ["Désignation", "Quantité", "P.U en MAD HT", "Prix Total en MAD (H.T)"]

    # Row 1: Immatriculation (blank/placeholder)
    # Row 2: LOCATION details
    items = [
        [f"LOCATION {car_name}", "", "", ""],
        [f"DU {start_date} AU {end_date}",
         str(rental_days),
         f"{daily_rate:.2f}",
         f"{total_ht:,.2f}"],
    ]

    # Total rows - these go to the right side of the table
    # We need blank cols on left, labels and values on right
    total_rows = [
        ["", "", "Total HT", f"{total_ht:,.2f}"],
        ["", "", "T.V.A (20%)", f"{tva_amount:,.2f}"],
        ["", "", "Montant total (T.T.C)", f"{total_ttc:,.2f}"],
    ]

    all_rows = [header] + items + total_rows

    table = Table(all_rows, colWidths=col_widths)

    num_items = len(items)
    num_header = 1
    num_totals = len(total_rows)

    style_cmds = [
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),

        # Body text
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('ALIGN', (-1, 1), (-1, -1), 'RIGHT'),

        # Grid for header + items
        ('GRID', (0, 0), (-1, num_header + num_items - 1), 0.5, NAVY),

        # Total rows - right-aligned labels
        ('FONTNAME', (-2, num_header + num_items), (-2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (-2, num_header + num_items), (-1, -1), 9),
        ('ALIGN', (-2, num_header + num_items), (-2, -1), 'RIGHT'),
        ('ALIGN', (-1, num_header + num_items), (-1, -1), 'RIGHT'),

        # Box around totals with internal grid
        ('BOX', (-2, num_header + num_items), (-1, -1), 0.5, NAVY),
        ('INNERGRID', (-2, num_header + num_items), (-1, -1), 0.5, NAVY),

        # Last row (TTC) highlight
        ('BACKGROUND', (-2, -1), (-1, -1), LIGHT_GREY),
        ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),

        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]

    table.setStyle(TableStyle(style_cmds))
    tw, th = table.wrapOn(c, width, height)
    table.drawOn(c, margin_l, y - th)
    y = y - th - 25

    # ============================================================
    # AMOUNT IN WORDS
    # ============================================================
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BLACK)
    c.drawString(margin_l, y, "Arrêtée la présente facture à la somme de:")
    y -= 18
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(margin_l, y, ">" + _amount_to_words_fr(total_ttc))

    # ============================================================
    # BANK DETAILS
    # ============================================================
    y -= 25
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin_l, y, "Coordonnées Bancaires :")
    y -= 14
    c.setFont("Helvetica", 8)
    c.drawString(margin_l, y, f"Par chèque : au nom de {COMPANY_NAME}")
    y -= 12
    c.drawString(margin_l, y, f"Par virement : RIB : {COMPANY_RIB} , Banque : {COMPANY_BANK} , Agence {COMPANY_BANK_AGENCY}")

    # ============================================================
    # SIGNATURE AREA
    # ============================================================
    y -= 50
    # Two signature blocks
    c.setStrokeColor(MEDIUM_GREY)
    c.setLineWidth(0.3)
    # Left signature
    c.rect(margin_l, y - 50, 180, 55, fill=0)
    # Right signature - company stamp area
    c.rect(margin_r - 180, y - 50, 180, 55, fill=0)

    # ============================================================
    # INVOICE REFERENCE (bottom right)
    # ============================================================
    c.setFillColor(MEDIUM_GREY)
    c.setFont("Helvetica", 7)
    c.drawRightString(margin_r, 55, invoice_ref)

    # ============================================================
    # FOOTER
    # ============================================================
    footer_y = 30
    c.setStrokeColor(NAVY)
    c.setLineWidth(1)
    c.line(margin_l, footer_y + 8, margin_r, footer_y + 8)

    c.setFillColor(MEDIUM_GREY)
    c.setFont("Helvetica", 5.5)
    footer_text = f"Mag N° AH 545, cité El Qods, Agadir. TP : {COMPANY_TP} - RC : {COMPANY_RC} - IF : {COMPANY_IF} - ICE : {COMPANY_ICE}"
    c.drawCentredString(width / 2, footer_y - 2, footer_text)
    c.drawCentredString(width / 2, footer_y - 10, f"Tél : {COMPANY_TEL_FULL} - E-mail: {COMPANY_EMAIL}")
