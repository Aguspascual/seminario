import smtplib
import socket
import os
from dotenv import load_dotenv

# Force load .env
load_dotenv(override=True)

SMTP_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('MAIL_PORT', 465))
SMTP_USERNAME = os.getenv('MAIL_USERNAME')
SMTP_PASSWORD = os.getenv('MAIL_PASSWORD')

print(f"Testing connection to {SMTP_SERVER}:{SMTP_PORT}...")
print(f"User: {SMTP_USERNAME}")

try:
    if SMTP_PORT == 465:
        print("Using SMTP_SSL")
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
    else:
        print("Using SMTP (starttls)")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()

    print("Connected! Logging in...")
    server.login(SMTP_USERNAME, SMTP_PASSWORD)
    print("Login successful!")
    server.quit()
    print("Test PASSED.")

except ConnectionRefusedError:
    print("ERROR: Connection Refused (WinError 10061).")
    print("This usually means an Antivirus (Avast, AVG, etc.) or Firewall is blocking the script.")
except Exception as e:
    print(f"ERROR: {e}")
