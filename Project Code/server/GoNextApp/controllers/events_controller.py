from .seats_controller import controller_create_seat_groups
from ..database.database import *
from .image_controller import save_image
from ..levenshtien import *
import re

# Creates an event and inserts the respective images for an event


def create_event(host, name, description, cost, capacity, category, location, longitude, latitude, date, time, is_seated, activities, thumbnail, gallery, venue_map, seating_groups):
    start = f'{date} {time}' 
    event_id = db_create_event(host, name, description, start, cost, location, longitude, latitude, is_seated, capacity)
    if thumbnail is not None:
        db_add_event_thumbnail(event_id, thumbnail)
    
    if len(activities) > 0:
        db_add_event_subevents(event_id, activities)
    
    if len(category) > 0:
        db_add_event_categories(event_id, category)
    
    if len(gallery) > 0:
        db_add_event_gallery(event_id, gallery)
        
    if seating_groups is not None and len(seating_groups.items()) > 0:
        if venue_map is not None:
            db_add_event_venue_map(event_id, venue_map)
        controller_create_seat_groups(event_id, seating_groups)
        
    return event_id

# Gets the ids of all the upcoming events that havne't been booked out


def get_upcoming_events():
    result = db_get_upcoming_events() 
    return [event_id for event_id in result if db_get_tickets_booked_for_event(event_id) < db_get_event_capacity(event_id)]

# Updates the details of the events, also updates the images associated with an event


def update_event_detail(event_id, name, description, capacity, categories, location,thumbnail, gallery, subevents):
    tickets_booked = db_get_tickets_booked_for_event(event_id)

    if tickets_booked[0] > capacity:
        return {
            "isSuccess": False,
            "Updated_Details": {} 
        }

    
    resp = db_update_event_details(event_id, name, description, capacity, location)
    
    # updates categories
    db_delete_event_from_category(event_id)
    db_add_event_categories(event_id, categories)

    # updates the event thumbnail    
    db_update_event_thumbnail(event_id, thumbnail)
    
    # updates the gallery
    dp_remove_event_gallery(event_id)
    db_add_event_gallery(event_id, gallery)
    
    # updates the activites
    db_remove_event_subevents(event_id)
    db_add_event_subevents(event_id, subevents)
    category_string = ', '.join(str(x) for x in categories)
    
    # Sends an email to all attendees notifying them of the changes
    for email in db_get_user_emails_attending_event(event_id):
        send_mail(email, f"Dear Event attendees, this is an automated message from GoNext to inform you that event" +
                f"{name} has updated their details.\n The new details are as follows\n" + "\n" +
                f"Event Name: {name}\n" +
                f"Event Description: {description}\n" +
                f"Event Capacity: {capacity}\n" +
                f"Event Category: {category_string}\n" +
                f"Event Location: {location}\n",
                f"{name} has updated details")
        
    
    return resp

# Sends an email to all the attendees of an event


def send_message_to_attendees(message, event_id):
    event_details = db_get_event(event_id)
    event_name = event_details.get('event_name')

    attendee_emails = db_get_user_emails_attending_event(event_id)
    for email in attendee_emails:
        send_mail(
            email[0], 
            message,
            f"A message from the organisers of {event_name}"
        )
    return True

# Cancels an event and refunds all attendees


def cancel_event(event_id, event_name):
    resp = {}
    attendee_emails = db_get_user_emails_attending_event(event_id)

    for email in attendee_emails:
        user_id = db_get_id_from_email(email)
        booking_id = db_get_booking_id_from_email_and_event(user_id, event_id)
        amount_to_be_refunded = get_total_price_of_tickets_purchased_by_user(booking_id)
        delete_from_attending(booking_id)
        db_user_remove_booking(booking_id)

        db_update_money_spent(email,-1 * amount_to_be_refunded)

        send_mail(email[0], 
            f"A notice that {event_name} has been cancelled and you have been refunded your tickets", 
            f"{event_name} has been cancelled")

    resp['isSuccess'] = db_cancel_event(event_id)
    pass

# Gets an event 


def get_event(event_id: int):
    return db_get_event(event_id)

# Gets all details for a budget


def get_event_budget_details(event_id):
    total_capacity = db_get_event_capacity(event_id)[0]
    tickets_booked = db_get_tickets_booked_for_event(event_id)[0]
    ticket_price = db_get_event(event_id).get('cost')
    
    result = {}
    result['total_capacity'] = total_capacity
    result['tickets_booked'] = tickets_booked
    result['ticket_price'] = ticket_price
    
    return result


# Gets the budget and subBudgets for ane vent


def get_budget(event_id):
    budget_list = db_get_budget_and_sub_budgets(event_id)
    formatted_list = []
    for budget in budget_list:
        sub_budget_list = []
        if budget['sub_budget'] is not None:
            sub_budget = budget['sub_budget']
            for item in sub_budget:
                sub_budget_list.append({'id': int(item[0]), 'name': item[1], 'date':item[2], 'price':int(item[3])})
        budget['sub_budget'] = sub_budget_list
        formatted_list.append(budget)
    return formatted_list


# Creates a budget for an event


def create_budget(event_id, name, allocation):
    return db_create_budget(event_id, name, allocation)

# Creates a sub budget for an event


def create_sub_budget(budget_id, date, name, cost):
    return db_create_sub_budget(budget_id, date, name, cost)


# Deletes a budget for an event


def delete_budget(budget_id):
    try:
        result = db_delete_budget(budget_id)
    except:
        result = False
    return result

# Deletes a sub budget for an event


def delete_sub_budget(budget_id):
    try:
        result = db_delete_sub_budget(budget_id)
    except:
        result = False  
    return result


# Updates a budget for an event


def update_budget(budget_id, budget_name, budget_allocation):
    return db_update_budget(budget_id, budget_name, budget_allocation)

# Updates a sub budget for an event


def update_sub_budget(sub_budget_id, sub_budget_date, sub_budget_name, sub_budget_cost):
    return db_update_sub_budget(sub_budget_id, sub_budget_date, sub_budget_name, sub_budget_cost)

# searches for the events whose names are most similar to input_string similarity is determined using the levenshtien alogrithm


def search_for_events(input_string):
    counter = 0
    event_id_array = []
    
    # formats user input string so that it is alphanumeric only, has no spaces and is lower case
    format_input_string = ''.join(char for char in str(input_string) if char.isalnum())
    format_input_string = format_input_string.lower()
    
    all_events = db_get_name_of_all_events()
    levenshtein_array = []
    
    # iterates through all the events
    for event in all_events:
        event_name = str(event.get('name'))
        event_id = event.get('id')
        
        # formats event name string so that it is alphanumeric only, has no spaces and is lower case
        format_event_name = ''.join(char for char in event_name if char.isalnum())
        format_event_name = format_event_name.lower()
        
        # if user inputted string is inside an event name, adds that event id to the return list
        # else proceeds to use the levenshtein value to calculate how "similar" the user input string 
        # and the event name is
        if format_input_string in format_event_name:
            counter += 1
            event_id_array.append(event_id)
        else:
            # makes both the event name string and the user input string the same length by adding empty spaces
            if (len(format_input_string) > len(event_name)):
                event_name.ljust(len(format_input_string), ' ')
            elif (len(format_input_string) < len(event_name)):
                format_input_string.ljust(len(format_input_string), ' ')
            
            # calculates the levenshtein value between the current event name string and the user input string
            # the levenshtein value and the event id are put in a dictionary and appended to an array
            levenshtein_value = levenshtein(input_string, event_name)
            
            levenshtein_array.append({"levenshtein_value" : levenshtein_value,
                                    "event_id": event_id})
        
    # sorts the array in ascending order using the levenshtein value
    # NOTE: the lower the levenshtein value the more "similar" the strings are
  
    levenshtein_array.sort(key = lambda i: i['levenshtein_value'], reverse = False)
   
    event_id_array = event_id_array + [i["event_id"] for i in levenshtein_array]
    return event_id_array[0:20 + counter]

