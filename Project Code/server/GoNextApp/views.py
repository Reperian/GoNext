from difflib import diff_bytes
import re
from sre_constants import SUCCESS
from urllib import request, response
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound
from django.db.utils import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from io import BytesIO

from .controllers.image_controller import get_image, save_image
from .controllers.events_controller import *
from .controllers.auth_controller import gen_token, valid_login, decode_token
from .controllers.user_controller import *
from .controllers.booking_controller import *
from .controllers.seats_controller import *
from .controllers.review_controller import *

from .database.database import *
from .Email import send_mail
from .exceptions import *

import json
import random
import string
import os
import hashlib
import datetime
import uuid
import base64

from PIL import Image


# Allows user to upload an image


@api_view(['POST'])
def api_upload_image(request):
    try:
        image_id = save_image(request.data.get("file"))
        return Response({'success': True, 'image_id': image_id})
    except (InputError):
        return Response({'success': False, 'image_id': None})

# Gets an image


@api_view(['GET'])
def api_get_image(request):
    params = request.query_params
    try:
        image = get_image(params['id'])
        return HttpResponse(image.get('data'), content_type=f"image/{image.get('content_type')}")
    except (DoesNotExistError):
        image = get_image('__DEFAULT_NO_IMAGE_PLACEHOLDER.png')
        return HttpResponse(image.get('data'), content_type=f"image/{image.get('content_type')}")


# Allows users to log in


@api_view(['POST'])
def api_login(request):
    data = request.data

    uid = valid_login(data['user_email'], data['user_password'])

    if uid is not None:
        return Response({'token': gen_token(uid[0]), 'id': uid, 'success': True})
    else:
        return Response({'success': False})


##############################
#          Events            #
##############################

# Creates an Event


@api_view(['POST'])
def api_create_event(request):
    data = request.data
    try:
        host_id = decode_token(data['token'])
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)
    event_id = create_event(host_id, data['name'], data['description'], data['cost'], data['capacity'], data['category'], data['location'],
                            data['longitude'], data['latitude'], data['date'], data['time'], data['is_seated'], data['activities'], data['thumbnail'], data['gallery'], data['venue_map'], data['seating'])
    return Response({'success': True, 'event_id': event_id})

# Gets an event


@api_view(['GET'])
def api_get_event(request):
    params = request.query_params

    try:
        event_details = get_event(params['id'])
        event_details['success'] = True
        return Response(event_details)
    except InputError:
        return HttpResponse('Invalid event id: ' + params['id'], status=404)



# Gets all events


@api_view(['GET'])
def api_all_event(request):
    resp = db_get_all_events()
    return Response(resp)

# Updates the details of an event


@api_view(['POST'])
def api_update_event_detail(request):
    dic = request.data

    event_id = dic.get('id')
    name = dic.get('name')
    description = dic.get('description')
    capacity = dic.get('capacity')
    category = dic.get('category')
    location = dic.get('location')
    thumbnail = dic.get('thumbnail')
    gallery = dic.get('gallery')
    subevents = dic.get('activities')

    resp = update_event_detail(event_id, name, description,
                               capacity, category, location, thumbnail, gallery, subevents)
    return Response(resp)

# Cancels an event


@api_view(['DELETE'])
def api_cancel_event(request):
    dic = request.query_params

    event_id = dic.get('event_id')

    event_details = db_get_event(event_id)

    event_name = event_details.get('event_name')

    try:
        resp = cancel_event(event_id, event_name)
    except DoesNotExistError:
        return HttpResponse('event already cancelled', status=403)

    return Response(resp)

# Gets all events that are occuring from current date to the end of next month


@api_view(['GET'])
def api_get_upcoming_events(request):
    resp = get_upcoming_events()

    return Response(resp)

# Sends a message to all the attendees of an event


@api_view(['POST'])
def api_send_message_to_attendees(request):
    dic = request.data

    event_id = dic.get('event_id')
    message = dic.get('message')

    resp = {}
    resp['isSuccess'] = send_message_to_attendees(message, event_id)
    return Response(resp)

# gets all events with all events in category


@api_view(['GET'])
def get_events_in_cats(request):
    dic = request.query_params
    categories = dic.get('categories')

    resp = controller_get_events_in_cats(categories)

    return Response(resp)

# gets the details neccessary for the budget


@api_view(['GET'])
def api_get_event_budget_details(request):
    dic = request.query_params
    event_id = dic.get('event_id')

    result = get_event_budget_details(event_id)
    return Response(result)


# gets the budget of an event


@api_view(['GET'])
def api_get_budget(request):
    dic = request.query_params
    event_id = dic.get('event_id')
    result = get_budget(event_id)
    return Response(result)


# creates a budget
@api_view(['POST'])
def api_create_budget(request):
    dic = request.data

    event_id = dic.get('event_id')
    budget_name = dic.get('budget_name')
    budget_allocation = dic.get('budget_allocation')

    resp = {}

    resp['result'] = create_budget(event_id, budget_name, budget_allocation)
    return Response(resp)

# adds a sub budget to a budget


@api_view(['POST'])
def api_create_sub_budget(request):
    dic = request.data

    budget_id = dic.get('budget_id')
    sub_budget_date = dic.get('sub_budget_date')
    sub_budget_name = dic.get('sub_budget_name')
    sub_budget_cost = dic.get('sub_budget_cost')

    resp = {}

    resp['result'] = create_sub_budget(
        budget_id, sub_budget_date, sub_budget_name, sub_budget_cost)
    return Response(resp)


# removes a budget
@api_view(['DELETE'])
def api_delete_budget(request):
    dic = request.query_params
    budget_id = dic.get('budget_id')

    resp = {}
    resp['isSuccess'] = delete_budget(budget_id)
    return Response(resp)

# removes a sub budget from a budget


@api_view(['DELETE'])
def api_delete_sub_budget(request):
    dic = request.query_params
    sub_budget = dic.get('sub_budget')

    resp = {}
    resp['isSuccess'] = delete_sub_budget(sub_budget)
    return Response(resp)


# updates a budget
@api_view(['POST'])
def api_update_budget(request):
    dic = request.data
    budget_id = dic.get('budget_id')
    budget_name = dic.get('budget_name')
    budget_allocation = dic.get('budget_allocation')

    resp = {}
    resp['isSuccess'] = update_budget(
        budget_id, budget_name, budget_allocation)
    return Response(resp)

# updates a sub budget


@api_view(['POST'])
def api_update_sub_budget(request):
    dic = request.data
    sub_budget_id = dic.get('sub_budget_id')
    sub_budget_date = dic.get('sub_budget_date')
    sub_budget_name = dic.get('sub_budget_name')
    sub_budget_cost = dic.get('sub_budget_cost')

    resp = {}
    resp['isSuccess'] = update_sub_budget(
        sub_budget_id, sub_budget_date, sub_budget_name, sub_budget_cost)
    return Response(resp)

# searches for an event using a user inputted string
# returns a list of the top 20 events whose name is most similar
# to the user inputted string


@api_view(['GET'])
def api_search_for_event(request):
    dic = request.query_params
    input_string = dic.get('input_string')

    resp = {}

    resp['result'] = search_for_events(input_string)

    return Response(resp)


##############################
#          Users             #
##############################

# Creates a new user


@api_view(['POST'])
def create_user(request):
    dic = request.data

    email = dic.get('user_email')
    firstName = dic.get('user_firstName')
    lastName = dic.get('user_lastName')
    Dob = dic.get('user_dob')
    password = dic.get('user_password')
    resp = {}

    try:
        resp['isSuccess'] = db_create_user(
            firstName, lastName, Dob, password, email)
        return Response(resp)
    except IntegrityError:
        resp['isSuccess'] = False
        return HttpResponse('Email already exists', status=403)

# Gets the detail of a user


@api_view(['GET'])
def api_get_user_detail(request):

    dic = request.query_params
    token = dic.get('token')

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = {}
    resp['results'] = get_user_detail(u_id)

    return Response(resp)

# Checks if user is an admin given a token


@api_view(['GET'])
def api_is_user_admin(request):
    dic = request.query_params
    token = dic.get('token')
    id = decode_token(token)
    resp = {}
    resp['results'] = is_user_admin(id)
    return Response(resp)

# Gets all the events hosted by the user


@api_view(['GET'])
def api_get_events_hosted_by_user(request):
    dic = request.query_params
    token = dic.get('token')

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = get_events_hosted_by_user(u_id)

    return Response(resp)

# Gets all events hosted by another user given their id


@api_view(['GET'])
def api_get_events_hosted_by_another_user(request):
    dic = request.query_params
    host_id = dic.get('host_id')

    resp = get_events_hosted_by_user(host_id)

    return Response(resp)

# Gets all the events a user has booked tickets to


@api_view(['GET'])
def api_get_events_user_attending(request):
    dic = request.query_params
    token = dic.get('token')

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = get_get_events_user_attending(u_id)

    return Response(resp)

# Cancels a users ticket to an event


@api_view(['DELETE'])
def api_user_cancelling_ticket(request):
    dic = request.query_params

    token = dic['token']

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    event_id = dic['event_id']
    attending_id = dic['ticket_id']
    resp = {}

    try:
        resp['results'] = user_cancel_tickets(u_id, attending_id, event_id)
    except:
        return HttpResponse('ticket already cancelled', status=403)

    return Response(resp)

# Updates the detail of a user


@api_view(['POST'])
def api_update_user_detail(request):
    dic = request.data
    token = dic.get('token')

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    updated_firstName = dic.get('user_firstname')
    updated_lastName = dic.get('user_lastname')
    updated_Dob = dic.get('user_dob')
    updated_password = dic.get('user_password', None)

    resp = update_user_profile(u_id,
                               updated_firstName, updated_lastName, updated_Dob, updated_password)

    return Response(resp)

# Emails the user a password reset code


@api_view(['POST'])
def api_user_password_reset_request(request):
    dic = request.data
    resp = {}
    email = dic.get('user_email')

    resp = {}

    resp['isSuccess'] = get_user_password_reset_request(email)
    return Response(resp)

# Checks if reset code and email pair are correct


@api_view(['DELETE'])
def api_user_check_reset_code(request):
    dic = request.data
    resp = {}

    email = dic.get('user_email')
    code = dic.get('password_reset_code')

    resp['isSuccess'] = user_check_reset_code(email, code)

    return Response(resp)

# updates password of a user


@api_view(['DELETE'])
def api_user_update_password(request):
    dic = request.data
    resp = {}

    email = dic.get('user_email')
    new_pass = dic.get('new_password')

    resp['isSuccess'] = user_update_password(email, new_pass)

    return Response(resp)

# Gets events near the user within a user specified radius


@api_view(['GET'])
def api_get_events_near_user(request):
    dic = request.query_params

    lat = dic.get('latitude')
    lng = dic.get('longitude')
    radius = dic.get('radius')

    resp = get_events_near_user(lat, lng, radius)
    return Response(resp)

# Allows user to add payment details when signing up


@api_view(['POST'])
def api_add_payment_detail_on_sign_up(request):
    dic = request.data

    email = dic.get('email')
    name_on_card = dic.get('name')
    card_number = dic.get('number')
    expiry_month = dic.get('expiry_month')
    expiry_year = dic.get('expiry_year')
    cvc = dic.get('cvc')

    resp = {}
    resp['isSuccess'] = add_payment_details(
        email, name_on_card, card_number, expiry_month, expiry_year, cvc)
    return Response(resp)

# Allows user to add payment details after signing up


@api_view(['POST'])
def api_add_payment_detail_not_on_sign_up(request):
    dic = request.data

    token = dic.get('token')
    u_id = decode_token(token)

    name_on_card = dic.get('name')
    card_number = dic.get('number')
    expiry_month = dic.get('expiry_month')
    expiry_year = dic.get('expiry_year')
    cvc = dic.get('cvc')

    resp = {}
    resp['isSuccess'] = add_payment_details(
        u_id, name_on_card, card_number, expiry_month, expiry_year, cvc)
    return Response(resp)

# Allows user to update their payment details


@api_view(['POST'])
def api_update_payment_detail(request):
    dic = request.data

    token = dic.get('token')
    u_id = decode_token(token)

    name_on_card = dic.get('name')
    card_number = dic.get('number')
    expiry_month = dic.get('expiry_month')
    expiry_year = dic.get('expiry_year')
    cvc = dic.get('cvc')
    resp = {}

    resp['isSuccess'] = update_payment_detail(
        u_id, name_on_card, card_number, expiry_month, expiry_year, cvc)
    return Response(resp)

# Allows user to remove their payment details


@api_view(['DELETE'])
def api_remove_payment_detail(request):
    dic = request.query_params

    token = dic.get('token')
    u_id = decode_token(token)

    resp = {}
    resp['isSuccess'] = remove_payment_detail(u_id)
    return Response(resp)

# Gets the last 4 digits a users card number


@api_view(['GET'])
def api_get_last_4_digits_card_number(request):
    dic = request.query_params

    token = dic.get('token')
    u_id = decode_token(token)

    resp = {}
    resp['result'] = get_last_4_digits_card_number(u_id)

    return Response(resp)

##############################
#          Booking           #
##############################


# still needs seat functionality
@api_view(['POST'])
def api_create_tickets(request):
    dic = request.data
    resp = {}

    token = dic['token']
    tickets = dic['tickets']
    event_id = dic['event_id']

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    # tickets should be an array of objects containing seat_id and no_discount_price
    # can set both to None if there is no seating or the seat is the base
    # put the price of the seat without taking into account discounts (discounts are calculated in the
    # backend)

    controller_make_booking(u_id, event_id, tickets)

    resp['isSuccess'] = True

    return Response(resp)


# get loyalty point value
@api_view(['GET'])
def api_get_points(request):
    dic = request.query_params
    token = dic.get('token')

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = {}

    user_money = get_user_money_spent(u_id)

    resp['isSuccess'] = True
    resp['points'] = user_money

    return Response(resp)

# gets any relevant discounts that should be applied to a purchase
# note loyalty discount should be applied before bulk discount
# no need to store dicounted price for each individual ticket, this
# is calculated in the backend when added, just apply these discounts to the total cost


@api_view(['GET'])
def api_get_discounts(request):
    dic = request.query_params
    token = dic.get('token')
    num_tix = dic.get('numTicks')
    event_id = dic.get('event_id')

    try:
        u_id = decode_token(token)
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = {}

    discounts = get_user_discounts(u_id, num_tix,event_id)
    resp['isSuccess'] = True
    resp['loyaltyDiscountPercent'] = discounts[0]
    resp['bulkDiscountPercent'] = discounts[1]
    resp['loyaltyDiscountAmount'] = discounts[2]
    resp['bulkDiscountAmount'] = discounts[3]

    return Response(resp)


@api_view(['GET'])
def api_get_active_tickets(request):
    dic = request.query_params
    token = dic['token']

    try:
        u_id = decode_token(token)

    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = get_active_tickets(u_id)

    return Response(resp)


@api_view(['GET'])
def api_get_num_tickets_booked(request):
    dic = request.query_params

    event_id = dic['event_id']

    resp = {}
    resp['num_booked'] = controller_get_num_tickets_booked(event_id)

    return Response(resp)


##############################
#          Seats             #
##############################

# get info of occupied seats associated with a seat group
@api_view(['GET'])
def api_get_seats_in_group(request):
    dic = request.query_params

    group_id = dic['group_id']

    resp = controller_get_all_seats(group_id)

    return Response(resp)

# get all seat groups in associated with an event


@api_view(['GET'])
def api_get_seat_groups(request):
    dic = request.query_params

    event_id = dic['event_id']

    resp = controller_get_seat_groups(event_id)

    return Response(resp)

# create a record to show that a seat is occupied


@api_view(['POST'])
def api_occupy_seats(request):
    dic = request.data
    resp = {}

    seats = dic['seats']

    controller_occupy_seats(seats)

    resp['isSuccess'] = True

    return Response(resp)


##############################
#          Reviews           #
##############################

# create a review
@api_view(['POST'])
def api_post_review(request):
    dic = request.data
    resp = {}

    token = dic.get('token')
    event_id = dic.get('event_id')
    title = dic.get('title')
    description = dic.get('description')
    rating = dic.get('rating')

    try:
        u_id = str(decode_token(token))
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    controller_add_review(u_id, event_id, title, description, rating)

    resp['isSuccess'] = True

    return Response(resp)

# add a host reply to an exising review


@api_view(['POST'])
def api_post_reply(request):
    dic = request.data
    resp = {}

    review_id = dic.get('review_id')
    description = dic.get('description')

    controller_add_review_reply(review_id, description)

    resp['isSuccess'] = True

    return Response(resp)

# get all reviews from an existing event sorted by posted date


@api_view(['GET'])
def api_get_reviews(request):
    dic = request.query_params

    event_id = dic['event_id']

    resp = controller_get_event_reviews(event_id)

    return Response(resp)

# gets hosts profile info


@api_view(['GET'])
def api_get_host_profile(request):
    dic = request.query_params

    host_id = int(dic.get('id'))

    resp = {}

    returned_profile = controller_get_host_profile(host_id)

    if returned_profile == None:
        resp['is_success'] = False
    else:
        resp = returned_profile
        resp['is_success'] = True

    return Response(resp)

#gets all reviews for a host
@api_view(['GET'])
def api_get_host_reviews(request):
    dic = request.query_params

    host_id = dic['host_id']

    resp = controller_get_host_reviews(host_id)

    return Response(resp)

# gets a review by it's id
@api_view(['GET'])
def api_get_review(request):
    dic = request.query_params

    review_id = dic.get('review_id')

    resp = controller_get_review(review_id)

    return Response(resp)

# check if a user has already made a review for an event
@api_view(['GET'])
def api_get_review_status(request):
    dic = request.query_params

    event_id = dic.get('event_id')

    token = dic['token']

    try:
        u_id = decode_token(token)

    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = controller_get_review_status(u_id, event_id)

    return Response(resp)


@api_view(['GET'])
def api_get_avg_rating_event(request):
    dic = request.query_params

    event_id = dic.get('event_id')

    resp = controller_get_avg_rating_event(event_id)

    if resp == None:
        return Response(0)
    else:
        return Response(resp)


@api_view(['GET'])
def api_8_rec_events(request):
    dic = request.query_params
    token = dic.get('token')
    try:
        u_id = str(decode_token(token))
    except InvalidTokenError:
        return HttpResponse('Invalid Token', status=401)

    resp = controller_8_rec_events(u_id)

    return Response(resp)
