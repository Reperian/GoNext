from unicodedata import decimal
from ..database.database import *
from decimal import Decimal

# Makings a book for an event 

def controller_make_booking(u_id, event_id, tickets):
    event_cost = float(db_get_cost_event(event_id)[0])
    user_money = db_get_user_money_spent(u_id)[0]
    num_tickets = len(tickets)

    # Determines loyalty discounts
    if user_money >= 2000:
        discount_percent = 0.15
    elif user_money >= 750:
        discount_percent = 0.1
    elif user_money >= 250:
        discount_percent = 0.05
    else:
        discount_percent = 0

    user_price = event_cost - event_cost * discount_percent

    # Determines bulk discount
    bulk_multiplier = 1
    if num_tickets >= 4:
        bulk_multiplier = 0.95
        user_price = user_price * float(bulk_multiplier)
    
    email = db_get_email_from_id(u_id)

    booking_id  = db_create_booking(u_id, event_id)

    total_cost = 0 

    seat_ids = [ticket['seat'] for ticket in tickets] 
    db_occupy_seat(seat_ids)

    for ticket in tickets:
        # able to add fname, lname and seat later if needed 
        if ticket['no_discount_price'] == None:
            db_add_attending(booking_id, ticket['seat'],user_price)
            total_cost += user_price
        else:
            cur_price = (ticket['no_discount_price'] - ticket['no_discount_price']*discount_percent)*bulk_multiplier
            db_add_attending(booking_id, ticket['seat'],cur_price)
            total_cost+=cur_price
    
    db_update_money_spent(email, float(total_cost))
    return True 

# Gets the active tickets for an user


def get_active_tickets(u_id):
    return db_get_active_tickets(u_id)

# Gets how much a user has spend on events

#gets the money spent by a user
def get_user_money_spent(u_id):
    return  db_get_user_money_spent(u_id)[0]

#gets the discounts that should apply for a user booking an event
def get_user_discounts(u_id, num_tix, event_id):
    bulk_discount = 0
    user_money = db_get_user_money_spent(u_id)[0]
    event_price = float(db_get_cost_event(event_id)[0])

    if user_money >= 2000:
        discount_percent = 0.15
    elif user_money >= 750:
        discount_percent = 0.1
    elif user_money >= 250:
        discount_percent = 0.05
    else:
        discount_percent = 0

    if int(num_tix) >= 4:
        bulk_discount = 0.05

    if discount_percent == 0:
        discounts = [discount_percent*100, bulk_discount*100, round(event_price*float(num_tix)*discount_percent,2), round(event_price*float(num_tix)*bulk_discount,2)]
    else:
         discounts = [discount_percent*100, bulk_discount*100, round(event_price*float(num_tix)*discount_percent,2), round(event_price*float(num_tix)*(1-discount_percent)*bulk_discount,2)]
    

    return discounts

# Gets events whose categories match the inputted categories


def controller_get_events_in_cats(categories):
    categories = categories.lower().split(',')
    try:
        categories.remove('')
    except:
        pass
    if len(categories) == 0: return db_get_all_events()
    matches = db_get_events_in_cats(categories)
    num_genres = len(categories)

    #puts all category ids into an array if the numbmber of genres matches
    #the number of categories specified by the user
    return [ cat['id'] for cat in matches if cat['count'] >= num_genres] 

# Gets the amount of tickets booked for an event


def controller_get_num_tickets_booked(event_id):
    return db_get_num_tickets_booked(event_id)