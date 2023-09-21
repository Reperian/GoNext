from ..database.database import *

# Adds a review to an event


def controller_add_review(u_id,event_id, title, description, rating):
    return db_add_review(u_id,event_id, title, description, rating)

# adds a reply to a review


def controller_add_review_reply(review_id, description):
    return db_add_review_reply(review_id, description)

# Gets the reviews for an event


def controller_get_event_reviews(event_id):
    return db_get_event_reviews(event_id)

# Gets the reviews for a host


def controller_get_host_reviews(host_id):
    return db_get_host_reviews(host_id)

# Gets the profile of a host


def controller_get_host_profile(host_id):
    profile = db_get_host_profile(host_id)
    if profile == None:
        return None
    else:
        profile[0]['avg_rating'] = db_get_avg_rating(host_id)
        return profile[0]
    
# Gets a review    


def controller_get_review(review_id):
    return db_get_review(review_id)
    
# Gets the average rating of an event    
    
    
def controller_get_avg_rating_event(event_id):
    return db_get_avg_rating_event(event_id)

# Gets the status of a review


def controller_get_review_status(u_id, event_id):
    if db_get_review_status(u_id, event_id) is None:
        return False
    else:
        return True
    
    