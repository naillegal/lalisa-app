from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.core.mail import send_mail
from .models import CustomUser, EmailVerification

@receiver(post_save, sender=CustomUser)
def create_email_verification(sender, instance, created, **kwargs):
    if created:
        instance.is_active = False
        instance.save(update_fields=['is_active'])

        code = EmailVerification.generate_code()

        EmailVerification.objects.create(
            user=instance,
            code=code
        )
        subject = "Email Verification Code"
        message = f"Sizin OTP kodunuz: {code}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [instance.email]

        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
