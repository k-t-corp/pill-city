import smtplib
import os
import logging
from email.mime.text import MIMEText
from flask_restful import Resource, reqparse
from pillcity.daos.password_reset import forget_password, reset_password


CLAIM_EXPIRATION_SECONDS = 60


def _send_password_reset_email(email: str, code: str):
    smtp_enabled = os.getenv("SMTP_ENABLED", "false")
    web_domain = os.environ['WEB_DOMAIN']
    smtp_from = os.environ['SMTP_FROM']

    msg = MIMEText(f"""Hello,

Go to https://{web_domain}/reset?code={code} to reset your password
""")
    msg['Subject'] = f'Reset your {web_domain} password'
    msg['From'] = smtp_from
    msg['To'] = email
    logging.info(f"Going to send email {msg}")
    if smtp_enabled != "true":
        return

    logging.info(f"Sending email {msg}")
    smtp_server = os.environ['SMTP_HOST']
    smtp_port = int(os.environ['SMTP_PORT'])
    smtp_username = os.environ['SMTP_USERNAME']
    smtp_password = os.environ['SMTP_PASSWORD']

    s = smtplib.SMTP(smtp_server, smtp_port)
    s.login(smtp_username, smtp_password)
    s.sendmail(msg['From'], msg['To'], msg.as_string())
    s.quit()


forget_password_args = reqparse.RequestParser()
forget_password_args.add_argument('email', type=str, required=True)


class ForgetPassword(Resource):
    def post(self):
        args = forget_password_args.parse_args()
        email = args.get('email')
        code = forget_password(email)
        if code:
            _send_password_reset_email(email, code)
            return {'msg': 'Password reset email sent'}, 200
        else:
            return {'msg': 'Email address is invalid or an associated password reset claim'
                           ' has not been expired yet'}, 401


reset_password_args = reqparse.RequestParser()
reset_password_args.add_argument('code', type=str, required=True)
reset_password_args.add_argument('password', type=str, required=True)


class ResetPassword(Resource):
    def post(self):
        args = reset_password_args.parse_args()
        code = args.get('code')
        password = args.get('password')
        if reset_password(code, password):
            return {'msg': 'Password has been reset'}, 200
        else:
            return {'msg': 'Invalid code or email is not associated with any user'}, 401
