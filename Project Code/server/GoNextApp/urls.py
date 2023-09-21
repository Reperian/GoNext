from django.urls import path
from . import views

urlpatterns = [
    path('images/get', views.api_get_image),
    path('images/upload', views.api_upload_image),

    path('events/create/', views.api_create_event),
    path('events/view/', views.api_get_event),
    path('events/upcoming/', views.api_get_upcoming_events),
    path('events/all/', views.api_all_event),
    path('events/avgreview', views.api_get_avg_rating_event),
    path('register/', views.create_user),
    path('user/details/', views.api_get_user_detail),
    path('login/', views.api_login),
    path('user/update/', views.api_update_user_detail),
    path('events/filtergenre', views.get_events_in_cats),

    path('register/addpayment/', views.api_add_payment_detail_on_sign_up),
    path('user/addpayment/', views.api_add_payment_detail_not_on_sign_up),
    path('user/removepayment/', views.api_remove_payment_detail),
    path('user/updatepayment/', views.api_update_payment_detail),
    path('user/getpaymentdigits/', views.api_get_last_4_digits_card_number),

    path('eventshostedbyhost/', views.api_get_events_hosted_by_another_user),
    path('host/viewevents', views.api_get_events_hosted_by_another_user),
 
    path('isadmin/', views.api_is_user_admin),
    path('upcomingevents/', views.api_get_upcoming_events),
    path('searchforevent/', views.api_search_for_event),

    path('user/hostingevents', views.api_get_events_hosted_by_user),
    path('user/hostingevents/update', views.api_update_event_detail),
    path('user/hostingevents/cancel', views.api_cancel_event),
    path('user/hostingevents/messageattendees',
         views.api_send_message_to_attendees),
    path('user/hostingevents/budget', views.api_get_event_budget_details),

    path('user/hostingevents/getbudget', views.api_get_budget),

    path('user/hostingevents/createbudget', views.api_create_budget),
    path('user/hostingevents/createsubbudget', views.api_create_sub_budget),
    

    path('user/hostingevents/deletebudget', views.api_delete_budget),
    path('user/hostingevents/deletesubbudget', views.api_delete_sub_budget),
    

    path('user/hostingevents/editbudget', views.api_update_budget),
    path('user/hostingevents/editsubbudget', views.api_update_sub_budget),
    
    
    path('user/attendingevents', views.api_get_events_user_attending),
    path('user/attendingevents/cancel', views.api_user_cancelling_ticket),

    path('user/details/resetpassword/', views.api_user_password_reset_request),
    path('user/details/updatepassword/',  views.api_user_update_password),
    path('user/details/checkresetcode', views.api_user_check_reset_code),
    path('user/recevents', views.api_8_rec_events),
    path('user/getpoints/', views.api_get_points),
    path('user/reviewstatus', views.api_get_review_status),
 

    path('eventsnearuser/', views.api_get_events_near_user),

    path('booking/createtickets', views.api_create_tickets),
    path('booking/getdiscounts', views.api_get_discounts),
    path('booking/getactivetickets', views.api_get_active_tickets),
    path('booking/occupyseats', views.api_occupy_seats),
    path('booking/getseatgroups', views.api_get_seat_groups), 
    path('booking/getseatsingroup', views.api_get_seats_in_group),

    path('review/add', views.api_post_review),
    path('review/reply', views.api_post_reply),
    path('review/geteventreviews', views.api_get_reviews), #gets all reviews linked to an event id
    path('review/getreview', views.api_get_review), #gets one review based on review id
    path('review/gethostreviews', views.api_get_host_reviews),

    path('host/view', views.api_get_host_profile),
    
    path('events/manage/budget/get', views.api_get_budget),
    path('events/manage/budget/create', views.api_create_budget),
    path('events/manage/budget/edit', views.api_update_budget),
    path('events/manage/budget/delete', views.api_delete_budget),
    path('events/manage/subbudget/create', views.api_create_sub_budget),
    path('events/numticketsbooked', views.api_get_num_tickets_booked),
    path('events/manage/subbudget/edit', views.api_update_sub_budget),
    path('events/manage/subbudget/delete', views.api_delete_sub_budget),

    path('host/view', views.api_get_host_profile),
]
