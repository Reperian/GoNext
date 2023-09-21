from ..database.database import *

# Creates a seating group


def controller_create_seat_groups(event_id, groups):
    for group in groups:
        group_id = db_create_seat_group(group, event_id, len(groups[group]))
        db_create_seats(group_id, groups[group])


# Gets all seats for a group


def controller_get_all_seats(group_id):
    dic = {}
    dic['seats'] = db_get_all_seats(group_id)
    dic['occupied'] = db_get_occupied_seats(group_id)

    return dic

# Gets seats groups for an event


def controller_get_seat_groups(event_id):
    return db_get_seat_groups(event_id)

# Changes the status of a seat to be occupied


def controller_occupy_seats(seats):
    db_occupy_seat(seats)
    return True 


   