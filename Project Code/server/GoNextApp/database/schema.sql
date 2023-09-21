create domain genre_type as varchar(64)
   check(lower(value) in ('music',
    'food',
    'sports',
    'drinks',
    'fashion',
    'games',
    'media',
    'art',
    'science',
    'community',
    'conference',
    'expo',
    'festival',
    'other'));

create table if not exists People (
   id serial,
   first_name text not null,
   last_name text not null,
   date_of_birth date not null,
   password text not null,
   email text not null unique,
   money_spent decimal not null default 0,
   primary key (id)
);

create table if not exists payment_details (
   id serial,
   person integer references People not null,
   name_on_card text not null,
   card_number text not null,
   expiry_month text not null,
   expiry_year text not null,
   cvc text not null,
   primary key(id)
);

create table if not exists Events (
   id serial,
   host integer references People not null,
   name text not null,
   description text not null, 

   event_start timestamp not null,

   cost decimal not null,

   location text not null,
   longitude decimal not null,
   latitude decimal not null,
   
   is_seated boolean not null,
   capacity integer,

   primary key (id)
);

create table if not exists Sub_Events (
   id serial,
   event integer references Events on delete cascade not null,
   time time not null,
   name varchar(50) not null,
   primary key (id)
);

create table if not exists Likes_Genre (
   genre genre_type not null,
   person integer references People not null,
   primary key (person, genre)
);
create table if not exists Seat_Groups (
   id serial, 
   event integer references Events on delete cascade not null,
   name text not null,
   num_seats integer not null,
   primary key(id)
);

create table if not exists Seats (
   id serial,
   group_id integer references Seat_Groups on delete cascade not null,
   seat_name varchar(10),
   occupied boolean DEFAULT false,
   primary key (id)
);

create table if not exists Booking (
   id serial,
   event integer references Events not null,
   booked_by integer references People not null,
   booking_date timestamp not null,
   primary key (id)
);

create table if not exists Attending (
   id serial,
   booking_id integer references Booking not null,
   seat integer references Seats,
   amount_paid decimal not null,
   primary key(id)
); 

create table if not exists Event_Genre (
   event integer references Events on delete cascade not null,
   genre genre_type not null,
   primary key(event, genre)
);


create table Images (
   id varchar(64) not null unique,
   primary key (id)
);

create table Event_Gallery (
   id serial,
   event integer references events on delete cascade not null ,
   image_id varchar(64) references Images on delete cascade  not null,
   primary key (id)
);

create table Event_Thumbnail (
   id serial,
   event integer references events on delete cascade not null,
   image_id varchar(64) references Images on delete cascade not null,
   primary key (id)
);

create table Event_Venue_Map (
   id serial,
   event integer references events on delete cascade not null,
   image_id varchar(64) references Images on delete cascade not null,
   primary key (id)
);

create table if not exists password_reset (
   person integer references People(id) not null,
   code text not null,
   primary key (person, code)
);

create table if not exists Review (
   id serial,
   person integer references People(id) not null,
   event integer references events on delete cascade not null,
   title varchar(65),
   description varchar(2000),
   rating integer not null,
   posted timestamp,
   reply varchar(2000),
   replied timestamp,
   primary key (id) 
);

create table if not exists todo (
   id serial,
   event_id integer references Events(id) not null,
   name text,
   primary key (id)
);

create table if not exists sub_todo (
   id serial,
   todo_id integer references todo(id) on delete cascade not null,
   description text,
   completed boolean default false,
   primary key (id)
);

create table if not exists budget (
   id serial,
   event_id integer references Events(id) not null,
   name text,
   allocation float,
   primary key (id)
);

create table if not exists sub_budget (
   id serial,
   budget_id integer references budget(id) on delete cascade not null,
   date date,
   name text,
   cost float,
   primary key (id)
);
