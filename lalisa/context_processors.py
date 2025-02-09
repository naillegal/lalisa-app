
from .models import Moderator

def current_moderator_context(request):
    moderator_id = request.session.get('moderator_id')
    if moderator_id:
        try:
            mod = Moderator.objects.get(id=moderator_id)
            return {'current_moderator': mod}
        except Moderator.DoesNotExist:
            pass
    return {'current_moderator': None}
