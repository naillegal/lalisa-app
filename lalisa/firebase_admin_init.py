import firebase_admin
from firebase_admin import credentials
from django.conf import settings

cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT)
firebase_admin.initialize_app(cred)
