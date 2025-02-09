import firebase_admin
from firebase_admin import messaging

def send_push_notification(registration_tokens, title, body, data_message=None):
    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data=data_message if data_message else {},
        tokens=registration_tokens,
    )
    
    response = messaging.send_multicast(message)
    return response
