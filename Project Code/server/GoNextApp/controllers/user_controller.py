from ..exceptions import AlreadyExistError
from django.db.utils import IntegrityError
from ..database.database import *
from ..Email import send_mail 
import datetime
import random
import string

# Creates a user


def create_user(firstName, lastName, Dob, password, phoneNumber, email):
    try:
        return db_create_user(firstName.title(), lastName.title(), Dob, password, email.lower())
    except IntegrityError:
        raise AlreadyExistError()

# Determines if a user with the given email exists


def find_user(email):
    if len(db_find_user(email)) != 0:
        raise AlreadyExistError()
    return

# Gets the details of the user


def get_user_detail(u_id):
    return db_find_user(u_id)


# Determines if the u_id belongs to the admin user

def is_user_admin(u_id):
    return u_id == 1
    
# Gets all the events hosted by a user
 
    
def get_events_hosted_by_user(u_id):
    
    # if account is the admin account then all events in the database are returned
    if u_id == 1:
        return db_get_all_events_as_dic()
    else:
        email = db_get_email_from_uid(u_id)
        return db_get_events_hosted_by_user(email)

# Gets all the events that a user has booked tickets to


def get_get_events_user_attending(u_id):
    email = db_get_email_from_uid(u_id)
    return db_get_events_user_attending(email)

# Cancels a ticket booked by a user


def user_cancel_tickets(u_id, attending_id, event_id):
    email = db_get_email_from_uid(u_id) 
    refund = False
    
    # Calculates the datetime between cancelling ticket and the start of the event
    start_time = db_get_start_time_event(event_id)[0]
    current_time = datetime.datetime.now().replace(microsecond=0)
    difference = start_time - current_time
    seconds_in_day = 24 * 60 * 60
    divmod(difference.days * seconds_in_day + difference.seconds, 60)
    
    if (difference > datetime.timedelta(days=7)): 
        refund = True
        
    event_details = db_get_event(event_id) 
    event_name = event_details.get('event_name')
   
     
    if refund:
        cost = db_get_price_seat(attending_id)
        db_update_money_spent(email, -1 * cost) 
        
        send_mail(email, f"You have cancelled a ticket for the event '{event_name}'." +
                " Since you have refunded this ticket at least a week prior to the event, you have been granted a full refund", "Refund approved")
    else:
        send_mail(email, f"You have cancelled a ticket for the event '{event_name}'." + 
                " Since you have not refunded this ticket at least a week prior to the event, you have not been granted a refund", "Refund refused")
        
    booking_id = db_get_booking_id_from_attending_record(attending_id)
    
    seat_id = db_get_seat_id_from_attending(attending_id)
    db_update_seat_occupied(seat_id, False)
    db_user_cancelling_ticket(attending_id)
    
    if (db_get_amount_attending_for_booking(booking_id) == 0):
        db_user_remove_booking(booking_id)
        
    return True
    
    
# Updates the details on a users profile    
    
        
def update_user_profile(u_id, firstName, lastName, Dob, password):
    email = db_get_email_from_uid(u_id)
    return {
        'isSuccess': True,
        'results': db_update_user_profile(firstName, lastName, Dob,email, password)
    }
   
   
# Sends a password reset code to an user's email   
   

def get_user_password_reset_request(email):
    try:
        find_user(email) # if find user raise an exection then user does exist, so if it passes then inputted email doesn't match any users
        return False
    except:
        pass
    
    code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    db_add_reset_password_code(email,code)
    send_mail(email, f" Your password reset code is {code}", "Your Password Reset Code")
    
    return True

# Determines if the inputted email and password reset code pair exist in the database


def user_check_reset_code(email, code):
    record = db_retrieve_password_reset_code(email,code)
    if record is None: 
        return False 
    else:
        return True

# Updates the password for a user


def user_update_password(email, new_pass):
    db_update_password(new_pass, email)
    db_remove_password_reset_code(email)
    send_mail(email, f" Your password has been successfully reset", "Password Reset Successful")
    return True
    
# Gets the events that are within a certain radius of the user 
    
    
def get_events_near_user(lat, lng, radius):
    result = db_get_events_near_user(lat, lng, radius)
    return result

def controller_8_rec_events(uid):
    genres = db_liked_genres(uid)
    print(genres)
    if len(genres) == 0: 
        return [dict['id'] for dict in db_8_rand_events()] 
    else:
        return [dict['id'] for dict in db_8_rec_events(genres)]
    
# Calls database function that adds a payment detail


def add_payment_details(identify_input, name_on_card, card_number, expiry_month, expiry_year, cvc):
    
    # checks if identify_input is a email or a u_id
    # if it is an email, gets the u_id corresponding to that email
    
    if "@" in str(identify_input):
        u_id = db_get_id_from_email(identify_input)
    else:
        u_id = identify_input
    
    
    result = db_get_payment_detail(u_id)
    
    # checks if user already has payment details
    if not result: 
        return db_add_payment_detail(u_id, name_on_card, card_number, expiry_month, expiry_year, cvc)
    else:
        return update_payment_detail(u_id, name_on_card, card_number, expiry_month, expiry_year, cvc)

# Calls database function that updates payment detail


def update_payment_detail(u_id, name_on_card, card_number, expiry_month, expiry_year, cvc):
    return db_update_payment_detail(u_id, name_on_card, card_number, expiry_month, expiry_year, cvc)

# Calls database function that removes a payment detail


def remove_payment_detail(u_id):
    return db_remove_payment_detail(u_id)
        

# Calls database function to get card number and then returns last 4 digits of card number


def get_last_4_digits_card_number(u_id):
    detail = db_get_payment_detail(u_id)
    print(detail)
    if detail == None :
        return None
    else:
        card_number = detail[3]
        return str(card_number)[-4::]
   
    










