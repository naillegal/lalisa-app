from django.http import HttpResponse
from .models import Moderator

def moderator_role_required(role_field):
 
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):

            moderator_id = request.session.get('moderator_id')
            if not moderator_id:
                return HttpResponse("Bu səhifəyə daxil olma icazəniz yoxdur!", status=403)

            try:
                moderator = Moderator.objects.get(id=moderator_id)
            except Moderator.DoesNotExist:
                return HttpResponse("Bu səhifəyə daxil olma icazəniz yoxdur!", status=403)

            if not getattr(moderator, role_field, False):
                return HttpResponse("Bu səhifəyə daxil olma icazəniz yoxdur!", status=403)

            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator
