from django.core.management.base import BaseCommand
from lalisa.models import Discount
from django.utils import timezone

class Command(BaseCommand):
    help = 'Deactivates expired discounts'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        expired_discounts = Discount.objects.filter(end_date__lt=today, active=True)
        count = expired_discounts.update(active=False)
        self.stdout.write(self.style.SUCCESS(f'Successfully deactivated {count} expired discounts.'))
