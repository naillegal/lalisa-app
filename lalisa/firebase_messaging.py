import logging
from firebase_admin import messaging, exceptions


def send_push_notification(registration_tokens, title, body, data_message=None):

    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data=data_message if data_message else {},
        tokens=registration_tokens,
    )

    try:
        response = messaging.send_multicast(message)
        logging.info("Firebase push sent, success_count=%d, failure_count=%d",
                     response.success_count, response.failure_count)
        return response
    except exceptions.FirebaseError as e:
        logging.exception("Firebase push notification failed: %s", e)
        return None
