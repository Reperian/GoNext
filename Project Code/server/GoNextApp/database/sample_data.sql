insert into
    people (
        first_name,
        last_name,
        date_of_birth,
        password,
        email
    )
values
    (
        'admin',
        'admin',
        '1999-01-08',
        '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',
        'admin@mail.com'
    );

insert into
    people (
        first_name,
        last_name,
        date_of_birth,
        password,
        email
    )
values
    (
        'Joe',
        'Willock',
        '1999-01-08',
        '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',
        'joewillock@mail.com'
    );

insert into
    people (
        first_name,
        last_name,
        date_of_birth,
        password,
        email
    )
values
    (
        'Sam',
        'Kerr',
        '1999-01-08',
        '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',
        'samkerr@mail.com'
    );

insert into
    events(
        host,
        name,
        description,
        event_start,
        cost,
        location,
        latitude,
        longitude,
        is_seated,        
        capacity    )
values
(
    1,
    'End of Term Celebration!',
    'Celebrate the end of Term 3 with a party at the Roundhouse!',
    '2022-11-18 11:00:00-00',
    20.50,
    'The Roundhouse, UNSW, Sydney, NSW',
    -33.916670143385, 
    151.22698219761,
    false,
    50
);

insert into
    events(
        host,
        name,
        description,
        event_start,
        cost,
        location,
        latitude,
        longitude,
        is_seated,        
        capacity    )
values
(
    2,
    'COMP3900 - Final Demo',
    'COMP3900 Final Demo',
    '2022-11-13 12:00:00-00',
    200.00,
    'Clavier Lab Physics Undercroft',
    -33.91820109890865, 
    151.22982049475053,
    false,
    24
);

insert into
    events(
        host,
        name,
        description,
        event_start,
        cost,
        location,
        latitude,
        longitude,
        is_seated,        
        capacity    )
values
(
    3,
    'World Cup Final Viewing',
    'Watch the FIFA World Cup Final between Argentina and Brazil with us at the Opera House!',
    '2022-12-19 02:00:00-00',
    215.99,
    'Sydney Opera House',
    -33.85, 
    151.21,
    false,
    2000
);

insert into
    review (
        person,
        event,
        title,
        description,
        rating,
        posted,
        reply,
        replied
    )
values
    (
        3,
        2,
        'Really interesting!',
        'GoNext! was super dooper interesting. I especially enjoyed their demo of their seating functionality!',
        5,
        '2022-11-13 12:15:14',
        'Thanks for the feedback!',
        '2022-11-13 12:20:23'
    );

insert into
    review (
        person,
        event,
        title,
        description,
        rating,
        posted,
        reply,
        replied
    )
values
    (
        2,
        2,
        'Couldve been better',
        'I didnt really enjoy it. I wish i was on holidays instead of watching this demo',
        3,
        '2022-11-13 12:13:44',
        null,
        null
    );

    insert into
        review (
            person,
            event,
            title,
            description,
            rating,
            posted,
            reply,
            replied
        )
    values
        (
            2,
            2,
            '',
            '',
            4,
            '2022-11-13 12:08:41',
            null,
            null
        );