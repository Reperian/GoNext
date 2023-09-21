import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv
from os.path import join, dirname

load_dotenv()
dotenv_path = join(dirname(__file__), '.env')

#The mail addresses and password
sender_address = 'comp3900gonext@gmail.com'
sender_pass = 'nnzdqpqddllbqmsf'

def send_mail(receiver_address, mail_content, subject=""):
    #Setup the MIME
    message = MIMEMultipart()
    message['From'] = sender_address
    message['To'] = receiver_address
    message['Subject'] = f'GoNext! - {subject}'   #The subject line
    #The body and the attachments for the mail
    message.attach(MIMEText(mail_content, 'plain'))
    #Create SMTP session for sending the mail
    session = smtplib.SMTP('smtp.gmail.com', 587) #use gmail with port
    session.starttls() #enable security
    session.login(sender_address, sender_pass) #login with mail_id and password
    text = message.as_string()
    session.sendmail(sender_address, receiver_address, text)
    session.quit()