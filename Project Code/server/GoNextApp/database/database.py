from asyncio import run_coroutine_threadsafe
from unittest import result
from xml.dom.minidom import Identified
from django.db import connections
from pathlib import Path
from django.db import models
from ..Email import send_mail

from ..exceptions import *

# given a cursor,
def get_column_names(cursor):
    return [desc[0] for desc in cursor.description]


# Create your models here.

# Drops the database schema


def db_drop_schema():
    print("DROPPING DATABASE")
    with connections['data'].cursor() as cursor:
        cursor.execute(
            '''DROP SCHEMA IF EXISTS data CASCADE; CREATE SCHEMA data;''')

# Loads the database schema


def db_load_schema():
    with connections['data'].cursor() as cursor:
        path = Path(__file__).parent / "schema.sql"
        with open(path, 'r') as f:
            cursor.execute(f.read())

# loads the database functions


def db_load_functions():
    with connections['data'].cursor() as cursor:
        path = Path(__file__).parent / "functions.sql"
        with open(path, 'r') as f:
            cursor.execute(f.read())

# loads sample data


def db_load_sample_data():
    with connections['data'].cursor() as cursor:
        path = Path(__file__).parent / "sample_data.sql"
        with open(path, 'r') as f:
            cursor.execute(f.read())


##############################  
#          Images            #
##############################

# Inserts an image record into the images table


def db_upload_image(image_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into images(id) values (%s);''', [image_id,])


##############################  
#          Events            #
##############################

# Inserts a record into the events table


def db_create_event(
    host, name, description, start, cost,
    location, longitude, latitude, is_seated, capacity):
    with connections['data'].cursor() as cursor:
        cursor.execute('''Insert into EVENTS (
            host,
            name,
            description,
            event_start,
            cost,
            location,
            longitude,
            latitude,
            is_seated,
            capacity) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) returning id;''',
            [
                host,
                name,
                description,
                start,
                cost,
                location,
                longitude,
                latitude,
                is_seated,
                capacity,])
        # return the event id
        return cursor.fetchone()[0]

# Inserts a record into the Event_Thumbnail table


def db_add_event_thumbnail(event_id, image_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into Event_Thumbnail(event, image_id) values (%s, %s);''', [event_id,image_id,])

# Updates a record in the Event_Thumbnail table

        
def db_update_event_thumbnail(event_id, image_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE Event_Thumbnail set image_id = (%s) where event = (%s);''', [image_id,event_id])

# Inserts a record into the Event_Gallery Table
 
 
def db_add_event_venue_map(event_id, image_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into Event_Venue_Map(event, image_id) values (%s, %s);''', [event_id,image_id])
    
# Inserts records into the event_gallery    
    
    
def db_add_event_gallery(event_id, image_id_arr):
    with connections['data'].cursor() as cursor:
        # prepare data
        data = [(event_id, image_id,) for image_id in image_id_arr]
        stmt = '''INSERT into Event_Gallery(event, image_id) values (%s, %s);'''
        cursor.executemany(stmt, data)

# Removes a record from the Event_Gallery table


def dp_remove_event_gallery(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM event_gallery WHERE event = (%s)''', [event_id])
        
# Inserts a record into the Event_Genre table        
        
        
def db_add_event_categories(event_id, catagories):
    with connections['data'].cursor() as cursor:
        # prepare data
        data = [(event_id, category,) for category in catagories]
        stmt = '''INSERT into Event_Genre(event, genre) values (%s, %s);'''
        cursor.executemany(stmt, data)

# Removes a record from the sub_events table


def db_remove_event_subevents(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE from sub_events where event = (%s)''', [event_id])
        
# Inserts a record into the Sub_Events table        
        
        
def db_add_event_subevents(event_id, subevents):
    with connections['data'].cursor() as cursor:
        # prepare data
        data = [(event_id, sub.get('time'), sub.get('name')) for sub in subevents]
        stmt = '''INSERT into Sub_Events(event, time, name) values (%s, %s, %s);'''
        cursor.executemany(stmt, data)
        
# Gets capacity field from the event table
def db_get_event_capacity(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT capacity from EVENTS where id = (%s)''', [event_id])
        curr_event_cap = cursor.fetchone()
        return curr_event_cap

# Updates an entry in the event table


def db_update_event_details(event_id, name, description, capacity, location):
    
    updated_details = {}
        
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE EVENTS 
                        SET name = (%s), description = (%s), capacity = (%s),
                        location = (%s)
                        WHERE id = (%s)''', [ name, description, capacity, location, event_id])
       
        
        updated_details = db_get_event(event_id)
        
    return {
        "isSuccess": True,
        "Updated_Details": updated_details
    }
    

       
# deletes all categories related to an event


def db_delete_event_from_category(event_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''DELETE FROM Event_Genre WHERE event = (%s)''', [event_id])
        pass



# Gets the ids of all the events in the database and returns then all in a list


def db_get_all_events():
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id FROM EVENTS''')
        results = [res[0] for res in cursor.fetchall()]
        return results
    
# Gets the id of the events in the database and returns them in a list of dictionaries


def db_get_all_events_as_dic():
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id FROM EVENTS''')
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Gets the name of all the events and returns them in a list of dictionaries


def db_get_name_of_all_events():
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id, name FROM Events''')
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results
    
# Gets a record in the event table and returns it as a dictionary


def db_get_event(id: int):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT * FROM Get_Event_Details(%s)''', [id])
        result = cursor.fetchone()
        
        if result is None: raise DoesNotExistError('Event', id)
        return dict(zip(get_column_names(cursor), result))


# Gets the price of a seat given attending_id


def db_get_price_seat(attending_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT amount_paid FROM Attending where id = (%s)''', [attending_id])
        result = cursor.fetchone()
        return result[0]
    


# Gets the start time of an event


def db_get_start_time_event(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT event_start FROM EVENTS where id = (%s)''', [event_id])
        return cursor.fetchone()


# Gets the cost field from the event table


def db_get_cost_event(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT cost FROM EVENTS where id = (%s)''', [event_id])
        return cursor.fetchone()
    
# Removes an entry from the event table


def db_cancel_event(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM EVENTS WHERE id = (%s)''', [event_id])
        return True
    
# Gets how many tickets have been booked for an event


def db_get_tickets_booked_for_event(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT COUNT(a.seat) FROM attending as a join booking as b 
                       on a.booking_id = b.id
                       where b.event = (%s)''', [event_id])
        return cursor.fetchone()
    
# Gets the emails of users who have booked tickets for an event


def db_get_user_emails_attending_event(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT p.email from booking as b join people as p on b.booked_by = p.id where b.event = (%s)''', [event_id])
        return cursor.fetchall()

# Gets bookingid from attendingid


def db_get_booking_id_from_attending_record(attending_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT booking_id from attending where id = (%s)''', [attending_id])
        data = cursor.fetchone()
        return data[0]

# Gets booking id for an email and event


def db_get_booking_id_from_email_and_event(user_id, event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id from Booking where event = (%s) and booked_by = (%s)''',[event_id, user_id])
        data = cursor.fetchone()
        return data[0]

# Gets all the attending records for a booking


def db_get_attending_for_booking(booking_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT * from attending where booking_id = (%s)''', [booking_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Gets the number of attending records for a booking


def db_get_amount_attending_for_booking(booking_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT count(*) from attending where booking_id = (%s)''', [booking_id])
        data = cursor.fetchone()
        return data[0]
    
# Deletes a record from the attending table


def delete_from_attending(booking_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM ATTENDING WHERE booking_id = (%s)''', [booking_id])  
        return True
    
    
# Gets the total amount of money a user has spent on tickets for an event


def get_total_price_of_tickets_purchased_by_user(booking_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT SUM(amount_paid) from attending where booking_id = (%s)''', [booking_id])
        data = cursor.fetchone()
        return data[0]

# Deteles an entry from the seats table


def db_delete_from_seats(seat_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE from seats where id = (%s)''', [seat_id])
        return True

# Deletes all seats listed for an event


def delete_seats_for_event(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE from seats where event = (%s)''', [event_id])
        return True

# Gets records from the todo table and returns them as a list of dictionaries


def db_get_todo(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id, name FROM todo where event_id = (%s)''', [event_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Gets records from the sub_todo table and returns them as a list of dictionaries


def db_get_sub_todo(todo_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id, description, completed FROM sub_todo where todo_id = (%s)''', [todo_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Gets records from the budget table and returns them as a list of dictionaries

    
def db_get_budget_and_sub_budgets(event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT *, (select array_agg(array[sb.id::varchar, sb.name::varchar, sb.date::varchar, sb.cost::varchar]) as sub_budget from sub_budget sb where sb.budget_id = b.id)
                       FROM budget b 
                       where b.event_id = (%s)''', [event_id])
        budgets = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return budgets
    
# Gets records from the sub_todo table and returns them as a list of dictionaries   
    
    
def db_get_sub_budget(budget_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id, name, cost FROM sub_budget where budget_id = (%s)''', [budget_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results
    
# Inserts a record into the todo table



def db_create_todo(event_id, name):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into TODO (event_id, name) values (%s, %s) returning id''', [event_id, name])
        return cursor.fetchone()[0]

# Inserts a record into the sub-todo table


def db_create_sub_todo(todo_id, description):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into SUB_TODO (todo_id, description) values (%s, %s) returning id''', [todo_id, description])
        return cursor.fetchone()[0]

# Inserts a record into the budget table


def db_create_budget(event_id, name, allocation):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into BUDGET (event_id, name, allocation) values (%s, %s, %s) returning id''', [event_id, name, allocation])
        return cursor.fetchone()[0]

# Inserts a record into the sub-budget table


def db_create_sub_budget(budget_id, date, name, cost):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into SUB_BUDGET (budget_id, name, date, cost) values (%s, %s, %s, %s) returning id''', [budget_id, name, date, cost])
        return cursor.fetchone()[0]

# Deletes a record from the todo table


def db_delete_todo(todo_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM TODO where id = (%s)''', [todo_id])
        return True

# Deletes a record from the sub todo table


def db_delete_sub_todo(sub_todo_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM SUB_TODO where id = (%s)''', [sub_todo_id])
        return True

# Deletes a record from the budget table


def db_delete_budget(budget_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM BUDGET where id = (%s)''', [budget_id])
        return True

# Deletes a record from the sub budget


def db_delete_sub_budget(sub_budget_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM SUB_BUDGET where id = (%s)''', [sub_budget_id])
        return True

# Deletes a record from the todo table


def db_update_todo(todo_id, todo_name):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE todo set name = (%s) where id = (%s)''', [todo_name, todo_id])
        return True
    
# Updates record from the sub todo table


def db_update_sub_todo(sub_todo_id, sub_todo_desc, completed):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE sub_todo set description = (%s), completed = (%s) where id = (%s)''', 
                       [sub_todo_desc, completed, sub_todo_id])
        return True
    
# Updates a record from the budget table


def db_update_budget(budget_id, budget_name, budget_allocation):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE budget set name = (%s), allocation = (%s) where id = (%s)''', 
                       [budget_name, budget_allocation, budget_id])
        return True
    
# Updates a record from the sub budget table
def db_update_sub_budget(sub_budget_id, sub_budget_date, sub_budget_name, sub_budget_cost):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE sub_budget set date = (%s), name = (%s), cost = (%s) where id = (%s)''', 
                       [sub_budget_date, sub_budget_name, sub_budget_cost, sub_budget_id])
        return True
     
##############################  
#          Users             #
##############################

# Inserts an entry into the people table returns the u_id


def db_create_user(firstName, lastName, Dob, passwordInput, emailInput):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into PEOPLE (first_name, last_name, date_of_birth, password, email) 
                       VALUES (%s, %s, %s, %s, %s) returning id;''', [firstName, lastName, Dob, passwordInput, emailInput,])
        return cursor.fetchone()[0]

# Gets the email of user given u_id


def db_get_email_from_uid(uid):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT email from people where id = (%s)''', [uid])
        data = cursor.fetchone()
        return data[0]
  
# Gets a record from the people table and returns it as a dictionary


def db_find_user(uid):
    with connections['data'].cursor() as cursor:
      
        cursor.execute('''SELECT first_name, last_name, date_of_birth, email, id FROM PEOPLE WHERE id = (%s);''', [uid])
        return dict(zip(get_column_names(cursor), cursor.fetchone()))

# Returns the userID given the email of the user


def db_get_id_from_email(email):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id from PEOPLE where email = (%s)''', [email])
        data = cursor.fetchone()
        return data[0]

    
# Updates the money_spent field for a record in the people table


def db_update_money_spent(email, amount):
    with connections['data'].cursor() as cursor:
        uid = db_get_id_from_email(email)
        money_spent = db_get_user_money_spent(uid)[0]
        updated_money_spent = float(money_spent) + float(amount)
        cursor.execute('''UPDATE people set money_spent = (%s) where email = (%s)''', [updated_money_spent, email])
        return True

# Gets a user email given a user id


def db_get_email_from_id(u_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT email from PEOPLE where id = (%s)''', [u_id])
        data = cursor.fetchone()
        return data[0]

# Updates an entry in the people table


def db_update_user_profile(firstName, lastName, Dob, email, passwordInput):
    if passwordInput == None:
        with connections['data'].cursor() as cursor:
            cursor.execute('''SELECT PASSWORD FROM PEOPLE WHERE email = (%s)''', [email] )
            passwordInput = cursor.fetchone()
        
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE PEOPLE 
                       SET first_name = (%s), last_name = (%s), date_of_birth = (%s), password = (%s)
                       WHERE email = (%s)''', [firstName, lastName, Dob, passwordInput, email])
        return True
    
# Returns all the events hosted by a user from the event table and returns them in a list of dictionaries


def db_get_events_hosted_by_user(email):
    with connections['data'].cursor() as cursor:
        id = db_get_id_from_email(email)
        
        cursor.execute('''SELECT * from EVENTS where host = (%s)''', [id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Returns all the events user is attending from the event table and returns them in a list of dictionaries


def db_get_events_user_attending(email):
    with connections['data'].cursor() as cursor:
        id = db_get_id_from_email(email)

        cursor.execute('''SELECT e.* from people as p join booking as b on p.id = b.booked_by join events as e on e.id = b.event 
                       WHERE p.email = (%s)''', [email])
        
        
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results  

# Gets the seat id for an attending record


def db_get_seat_id_from_attending(attending_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT seat from ATTENDING where id = (%s)''', [attending_id])
        return cursor.fetchone()
    
# Removes an entry in the attending table 


def db_user_cancelling_ticket(attending_id):
    with connections['data'].cursor() as cursor:
        # cursor.execute('''DELETE FROM Seats where id = (Select seat from ATTENDING where id = (%s))''', [attending_id])
        cursor.execute('''DELETE FROM ATTENDING where id = (%s)''', [attending_id])
        return True

# Updates the occupied for a seat record
def db_update_seat_occupied(seat_id, status):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE Seats set occupied = (%s) where id = (%s)''', [status, seat_id])
        return True

# Deletes a record from the booking table


def db_user_remove_booking(booking_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''DELETE FROM Booking where id = (%s)''', [booking_id])
        return True

# Returns all the events that are occuring from current date to the end of next month


def db_get_upcoming_events():
    with connections['data'].cursor() as cursor:
        
        # Get the current datetime
        cursor.execute('''SELECT (date_trunc('day', now()))''')
        curr_time_stamp = cursor.fetchone()
       
        # Gets the datetime at the end of next month
        cursor.execute('''SELECT (date_trunc('month', now()) + interval '2 month - 1 day')''')
        end_of_next_month_time_stamp = cursor.fetchone()

        
        cursor.execute('''SELECT id FROM EVENTS WHERE event_start BETWEEN (%s) and (%s) order by event_start''', [curr_time_stamp[0], end_of_next_month_time_stamp[0]])
        
        results = [event[0] for event in cursor.fetchall()]
        return results

# Updates the password field for a record in the people table


def db_update_password(password, email):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE PEOPLE set password = (%s) WHERE email = (%s)''', [password, email])
        return True
      
# Inserts a record into the password_reset table


def db_add_reset_password_code(email, code):  
    with connections['data'].cursor() as cursor:
        id = db_get_id_from_email(email)
        cursor.execute('''INSERT into PASSWORD_RESET (person, code) 
                       VALUES (%s, %s)''', [id, code])
        return True
    
# Returns a record in the password_reset table 

   
def db_retrieve_password_reset_code(email, code):  
    with connections['data'].cursor() as cursor:
        id = db_get_id_from_email(email)
        cursor.execute('''SELECT * from PASSWORD_RESET where person = (%s) and code = (%s)''', [id, code])
        return cursor.fetchone()
   
# Deletes a record into the password_reset table  

  
def db_remove_password_reset_code(email):  
    with connections['data'].cursor() as cursor:
        id = db_get_id_from_email(email)
        cursor.execute('''DELETE FROM PASSWORD_RESET where person = (%s)''', [id])
        return True

# Gets money spent for a user id


def db_get_user_money_spent(u_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT money_spent FROM PEOPLE WHERE id = (%s);''', [u_id])
        return cursor.fetchone()

# Finds an email and its respective password reset code


def db_find_login(email, password):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT id FROM PEOPLE WHERE (email = (%s) AND password = (%s));''', [email, password])
        return cursor.fetchone()

# Gets all the details of any events that match a category and returns them in a list of dictionaries


def db_get_events_in_cats(categories):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT e.id, count(*)
                        FROM Events e
                        INNER JOIN Event_Genre eg on eg.event = e.id
                        WHERE genre::text in %s
                        GROUP BY e.id
                        ''', [tuple(categories)])
        print("DB")
        # print(cursor.fetchall())
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Gets events near the user within a user specified radius


def db_get_events_near_user(lat, lng, radius):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT event_id from Get_Events_In_Range(%s,%s,%s)''', [lat, lng, radius])
        result = [res[0] for res in cursor.fetchall()]
        return result
    
# Inserts a record into the payment details table


def db_add_payment_detail(u_id, name_on_card, card_number, expiry_month, expiry_year, cvc):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''INSERT INTO payment_details (person, name_on_card, card_number, expiry_month, expiry_year, cvc)
                        VALUES (%s, %s, %s, %s, %s, %s)''', [u_id, name_on_card, card_number, expiry_month, expiry_year, cvc])
        return True
    
# Updates a record into the payment details table


def db_update_payment_detail(u_id, name_on_card, card_number, expiry_month, expiry_year, cvc):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''UPDATE payment_details set name_on_card = (%s), card_number = (%s), 
                        expiry_month = (%s), expiry_year = (%s), cvc = (%s)
                        where person = (%s)''', [name_on_card, card_number, expiry_month, expiry_year, cvc, u_id])
        return True
    
# Removes a record from the payemnt details table


def db_remove_payment_detail(u_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''DELETE FROM payment_details where person = (%s)''', [u_id])
        return True

# Gets a payment detail record given u_id


def db_get_payment_detail(u_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT * from payment_details where person = (%s)''', [u_id])
        return cursor.fetchone()



##############################  
#          Booking           #
##############################

# Creates a booking in the bookings table, returns its id


def db_create_booking(u_id, event_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into Booking (event, booked_by, booking_date) 
                       VALUES (%s, %s, current_timestamp+ interval '11 hours') RETURNING id;''', [event_id, u_id])  
        return cursor.fetchone()[0]

# Gets the event id of the event assoicated with a booking


def db_get_booking_event_id(booking_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT event FROM Booking WHERE id = (%s)''',[booking_id])
        return cursor.fetchone()

# Gets the person id of the person assoicated with a booking


def db_get_booking_user_id(booking_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT booked_by FROM Booking WHERE id = (%s)''',[booking_id])
        return cursor.fetchone()


# Adds attending record for ticket


def db_add_attending(booking_id,seat_id, amount_paid):
    with connections['data'].cursor() as cursor:
        booking_id  =cursor.execute('''INSERT into Attending (booking_id, seat, amount_paid) 
                       VALUES (%s, %s,%s);''', [booking_id, seat_id, amount_paid])  
    return True

# Returns attendence info for an attending id


def db_get_attending_info(a_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT * from ATTENDING where id = (%s)''', [a_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Returns booking info for an booking id


def db_get_booking_info(b_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT * from BOOKING where id = (%s)''', [b_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Returns all bookings associated with a user id 


def db_get_user_bookings(u_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT * from BOOKING where booked_by = (%s)''', [u_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

# Returns all attending associated with a booking id


def db_get_booking_attending(b_id):
    with connections['data'].cursor() as cursor:
        cursor.execute('''SELECT * from ATTENDING where booking_id = (%s)''', [b_id])
        results = [dict(zip(get_column_names(cursor), value))
                   for value in cursor.fetchall()]
        return results

def db_get_active_tickets(u_id):
    with connections['data'].cursor() as cursor:    
            cursor.execute('''SELECT Booking.booking_date,Booking.event,Attending.seat,Attending.amount_paid,Attending.id 
                            FROM Attending
                            INNER JOIN Booking ON Attending.booking_id = Booking.id
                            WHERE Booking.booked_by = (%s)''', [u_id])
            results = [dict(zip(get_column_names(cursor), value))
                    for value in cursor.fetchall()]
            return results

##############################  
#          Seats             #
##############################

#creates a seat group
def db_create_seat_group(name, event_id, num_seats):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into Seat_Groups (event, name, num_seats) 
            VALUES (%s, %s,%s) RETURNING id;''', [event_id,name,num_seats])
        return cursor.fetchone()[0]

#creates a seat in an existing seat group
def db_create_seats(group_id, seats):
    with connections['data'].cursor() as cursor:
        data = [(group_id,seat) for seat in seats]
        statement = '''INSERT into Seats(group_id, seat_name) VALUES (%s,%s)'''
        cursor.executemany(statement,data)
        return True

#gets all the seat groups for an event
def db_get_seat_groups(event_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT id, name, num_seats
                        FROM Seat_Groups
                        WHERE event = (%s)''', [event_id])
        results = [dict(zip(get_column_names(cursor), value))
                for value in cursor.fetchall()]
        return results

#occupies an existing seat
def db_occupy_seat(seats):
    with connections['data'].cursor() as cursor:  
        data = [(seat_id,) for seat_id in seats]
        stmt = '''UPDATE Seats SET occupied = true
                        WHERE id = %s;'''
        cursor.executemany(stmt, data)  
        return True

#gets the group id given an event and name of group
def db_get_group_id(group_name,event_id):
 with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT id
                        FROM Seat_Groups
                        WHERE event = (%s) AND name = (%s)''', [event_id, group_name])
        results = cursor.fetchone()
        return results[0]

#gets  all occupied seats in a group
def db_get_occupied_seats(group_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT id, seat_name
                        FROM Seats
                        WHERE group_id = (%s) AND occupied = true
                        ORDER BY id
                        ''', [group_id])
        results = [dict(zip(get_column_names(cursor), value))
                for value in cursor.fetchall()]
        return results

#gets all seat occupied and unoccupied in a seat group
def db_get_all_seats(group_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT id, seat_name
                        FROM Seats
                        WHERE group_id = (%s)
                        ORDER BY id
                        ''', [group_id])
        results = [dict(zip(get_column_names(cursor), value))
                for value in cursor.fetchall()]
        return results

#gets the number of tickets already booked for an event
def db_get_num_tickets_booked(event_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT count(*)
                        FROM Attending a
                        INNER JOIN Booking b ON a.booking_id = b.id
                        WHERE b.event = (%s);
                        ''', [event_id])
        results = cursor.fetchone()
        return results[0]

##############################  
#          Reviews           #
##############################

#adds a review record for a review
def db_add_review(u_id,event_id, title, description, rating):
    with connections['data'].cursor() as cursor:
        cursor.execute('''INSERT into Review (person, event, title, description, rating, posted) 
                       VALUES (%s, %s,%s,%s,%s, current_timestamp + interval '11 hours');''', [u_id, event_id, title, description, rating])  
    return True

# Adds a host reply to an existing review


def db_add_review_reply(review_id, description):
    with connections['data'].cursor() as cursor:
        cursor.execute('''UPDATE Review SET reply = (%s), replied = current_timestamp + interval '11 hours'
                        WHERE id = %s;''', [description, review_id])  
    return True


# Returns all reviews for an event 


def db_get_event_reviews(event_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT p.first_name, p.last_name, r.*
                        FROM Review r
                        INNER JOIN People p ON r.person = p.id
                        WHERE r.event = (%s)
                        ORDER BY r.posted DESC
                        ''', [event_id])
        results = [dict(zip(get_column_names(cursor), value))
                for value in cursor.fetchall()]
        return results

#returns all reviews for for events by a host 


def db_get_host_reviews(host_id):
     with connections['data'].cursor() as cursor:    
            cursor.execute('''SELECT p.first_name, p.last_name, r.*
                            FROM Review r
                            INNER JOIN People p ON r.person = p.id
                            INNER JOIN Events e ON r.event = e.id
                            WHERE e.host = (%s)
                            ORDER BY r.posted DESC
                            ''', [host_id])
            results = [dict(zip(get_column_names(cursor), value))
                    for value in cursor.fetchall()]
     return results

#gets the average review rating for a host
def db_get_avg_rating(host_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT AVG(r.rating)
                        FROM Review r
                        INNER JOIN Events e ON r.event = e.id
                        WHERE e.host = (%s);
                        ''', [host_id])
        data = cursor.fetchone()
        
        if data == None:
            return None
        else:
            return data[0]

#gets the average review rating for an event
def db_get_avg_rating_event(event_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT AVG(r.rating)
                        FROM Review r
                        INNER JOIN Events e ON r.event = e.id
                        WHERE e.id = (%s);
                        ''', [event_id])
        data = cursor.fetchone()
        
        if data == None:
            return None
        else:
            return data[0]
    
def db_get_host_profile(host_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT first_name, last_name, email
                        FROM People p
                        WHERE id = (%s)
                        ''', [host_id])
        results = [dict(zip(get_column_names(cursor), value))
                for value in cursor.fetchall()]
        return results

#gets required info for a review based on its id
def db_get_review(review_id):
    with connections['data'].cursor() as cursor:    
            cursor.execute('''SELECT p.first_name, p.last_name, e.name, r.*, h.first_name as host_first_name, h.last_name as host_last_name
                            FROM Review r
                            INNER JOIN People p ON r.person = p.id
                            INNER JOIN Events e ON r.event =  e.id
                            INNER JOIN People h ON e.host =  h.id
                            WHERE r.id = (%s)
                            ORDER BY r.posted DESC
                            ''', [review_id])
            #results = [dict(zip(get_column_names(cursor), value))
            #        for value in cursor.fetchall()]
            result = cursor.fetchone()
        
            if result is None: raise DoesNotExistError('Review', id)
    
    return dict(zip(get_column_names(cursor), result))

def db_get_review_status(u_id, event_id):
    with connections['data'].cursor() as cursor:    
        cursor.execute('''SELECT id
                        FROM Review
                        WHERE person = (%s) AND event = (%s)
                        ''', [u_id, event_id])
        return cursor.fetchone()

##############################  
#      Reccomendations       #
##############################

#returns all the genres that a user has previously booked
#events relating to 
def db_liked_genres(uid):
    with connections['data'].cursor() as cursor:    
            cursor.execute('''SELECT eg.genre
                            FROM Booking b
                            INNER JOIN Events e ON b.event =  e.id
                            INNER JOIN Event_Genre eg ON eg.event = e.id
                            WHERE b.booked_by = (%s) 
                            GROUP BY eg.genre
                            ''', [uid])
            result = cursor.fetchall()
            return result

#returns 8 events that are reccomended for a user based on their liked genres 
def db_8_rec_events(liked_genres):
     with connections['data'].cursor() as cursor:    
            cursor.execute('''SELECT DISTINCT e.id, min(Random()) as r
                            FROM Events e
                            INNER JOIN Event_Genre eg ON eg.event = e.id
                            WHERE eg.genre::text in %s AND e.event_start > current_timestamp
                            GROUP BY e.id, eg.event,eg.genre
                            ORDER BY r
                            LIMIT 8
                            ''', [tuple(liked_genres)])
            print(tuple(liked_genres))
            print("test")
            return [dict(zip(get_column_names(cursor), value)) for value in cursor.fetchall()]

#returns 8 random events in the case the user does not have any previously booked events
def db_8_rand_events():
     with connections['data'].cursor() as cursor:    
            cursor.execute('''SELECT DISTINCT e.id, min(Random()) as r
                            FROM Events e
                            WHERE e.event_start > current_timestamp + interval '11 hours'
                            GROUP BY e.id
                            ORDER BY r
                            LIMIT 8
                            ''')
    
            return [dict(zip(get_column_names(cursor), value)) for value in cursor.fetchall()]


  