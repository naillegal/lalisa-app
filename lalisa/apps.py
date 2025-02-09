from django.apps import AppConfig

class LalisaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lalisa'

    def ready(self):
        from . import firebase_admin_init
