import datetime
from pathlib import Path
from random import Random
from os import listdir
from os.path import isfile, join
from ..database.database import db_upload_image
import hashlib

from GoNextApp.controllers.events_controller import create_event
from ..controllers.user_controller import *

__TIME_NOW = datetime.datetime.utcnow()

__LOCATIONS = (
    ('Batemans Bay, NSW, Australia', -35.708057, 150.174438),
    ('Byron Bay, NSW, Australia', -28.643057, 153.615005),
    ('Lakemba, NSW, Australia', -33.931667, 151.085281),
    ('Collingwood Park, Queensland, Australia', -27.616667, 152.850006),
    ('Hurstville, NSW, Australia', -33.968109, 151.104080),
    ('Bowraville, NSW, Australia', -30.614943, 152.852127),
    ('Mullaway, NSW, Australia', -30.076935, 153.200333),
    ('Kirrawee, NSW, Australia', -34.033749, 151.071198),
    ('Nyngan, NSW, Australia', -31.561621, 147.196548),
    ('Bellingen, NSW, Australia', -30.452242, 152.897964),
    ('Singleton, NSW, Australia', -32.569473, 151.178818),
    ('Constitution Hill, NSW, Australia', -33.794498, 150.976501),
    ('Uralla, NSW, Australia', -30.640720, 151.500702),
    ('Swansea, NSW, Australia', -33.084999, 151.634995),
    ('Macquarie Park, NSW, Australia', -33.777199, 151.124115),
    ('Kooragang, NSW, Australia', -32.887379, 151.773697),
    ('Kiama, NSW, Australia', -34.673820, 150.844376),
    ('Wagga Wagga NSW, Australia', -35.117275, 147.356522),
    ('Huskisson, NSW, Australia', -35.041840, 150.671326),
    ('Wollombi, NSW, Australia', -32.932522, 151.133011),
    ('Mardi, NSW, Australia', -33.290001, 151.410004),
    ('Tweed Heads, NSW, Australia', -28.175995, 153.541672),
    ('Shellharbour, NSW, Australia', -34.583332, 150.866669),
    ('Gloucester, NSW, Australia', -32.023331, 151.958755),
    ('Helensburgh, NSW, Australia', -34.194366, 150.980682),
    ('Brewongle, NSW, Australia', -33.485867, 149.667435),
    ('Kooringal, Wagga Wagga, NSW, Australia', -35.129501, 147.366943),
    ('Macquarie Fields, NSW, Australia', -33.994339, 150.887573),
    ('Lavington, NSW, Australia', -36.047432, 146.938705),
    ('Bermagui, NSW, Australia', -36.443371, 150.061356),
    ('Blacktown, NSW, Sydney, Australia', -33.771000, 150.906296),
    ('South Coogee, NSW, Australia', -33.932999, 151.259003),
    ('Adaminaby, NSW, Australia', -35.996113, 148.773895),
    ('Kurri Kurri, NSW, Australia', -32.817352, 151.483017),
    ('Muswellbrook, NSW, Australia', -32.284847, 150.904968),
    ('Elderslie, NSW, Australia', -34.055004, 150.705734),
    ('Glenwood, NSW, Australia', -33.735165, 150.935883),
    ('Tomalla, NSW, Australia', -31.829828, 151.482224),
    ('Corindi, Corindi Beach, NSW, Australia', -30.030916, 153.198669),
    ('Mooney Mooney, NSW, Australia', -33.527641, 151.200882),
    ('Grafton, NSW, Australia', -29.706245, 152.939987),
    ('Kingsgrove, NSW, Australia', -33.942173, 151.101456),
    ('Tamworth, NSW, Australia', -31.083332, 150.916672),
    ('Queanbeyan, NSW, Australia', -35.353333, 149.234161),
    ('Penrith, NSW, Australia', -33.758011, 150.705444),
    ('Newcastle, NSW, Australia', -32.916668, 151.750000),
    ('Liverpool, NSW, Australia', -33.920921, 150.923141),
    ('Lithgow, NSW, Australia', -33.483334, 150.149994),
    ('Goulburn, NSW, Australia', -34.754723, 149.618607),
    ('Dubbo, NSW, Australia', -32.256943, 148.601105),
    ('Cessnock NSW, Australia', -32.834167, 151.355499),
    ('Campbelltown, NSW, Australia', -34.064999, 150.814163),
    ('Broken Hill, NSW, Australia', -31.956667, 141.467773),
    ('Blue Mountains, NSW, Australia', -33.700001, 150.300003),
    ('Bathurst, NSW, Australia', -33.419998, 149.577774),
    ('Armidale, NSW, Australia', -30.500000, 151.649994),
    ('Coffs Harbour, NSW, Australia', -30.296276, 153.114136),
    ('Orange, NSW, Australia', -33.283577, 149.101273),
    ('Albury, NSW, Australia', -36.080780, 146.916473),
    ('Wollongong, NSW, Australia', -34.425072, 150.893143),
    ('Terrey Hills, NSW, Australia', -33.683212, 151.224396),
    ('Bankstown NSW, Australia', -33.917290, 151.035889),
    ('Westmead, NSW, Australia', -33.807690, 150.987274),
    ('Gosford, NSW, Australia', -33.425018, 151.342224),
    ('Sydney, NSW, Australia', -33.865143, 151.209900))

__GENRES = ('music',
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
            'other')

__EVENT_ADJECTIVE = ('alien', 'alluring', 'bizarre', 'colorful', 'curious', 'different', 'fascinating', 'glamorous', 'peculiar', 'romantic', 'strange', 'unfamiliar', 'unusual', 'weird', 'avant-garde',
                     'enticing', 'external', 'extraneous', 'extraordinary', 'extrinsic', 'far-out', 'foreign', 'imported', 'introduced', 'outlandish', 'outside', 'peregrine', 'striking', 'way-out',)

__EVENT_THEME = ('bachelor', 'costume', 'pyjama', 'bake', 'clambake', 'cocktail', 'hen', 'house',
                 'housewarming', 'masquerade', 'meet and greet', 'mixer', 'salon', 'tea')

__EVENT_TYPE = ('benefit', 'fund-raiser', 'ball', 'dance',
                'formal', 'prom', 'celebration', 'gala', 'social')

__SUBEVENT_ADJECTIVE = ('Apocalyptic', 'Equilibrium', 'Mitigate', 'Serpentine', 'amboozled', 'Exquisite', 'Nefarious', 'Silhouette', 'izarre', 'Flippant', 'Onomatopoeia', 'Sinister', 'lasphemy', 'Gerrymandering', 'Persnickety', 'Statuesque', 'umblebee', 'Hyperbolic', 'Phosphorous', 'Stoicism', 'apricious', 'Hypnosis', 'Picturesque', 'Synergistic', 'landestine', 'Incognito', 'Plebeian', 'Tectonic', 'ognizant', 'Indigo', 'Quadrinomial',
                        'Totalitarian', 'onundrum', 'Insidious', 'Quintessential', 'Trapezoid', 'Corrosion', 'Kaleidoscope', 'Rambunctious', 'Ubiquitous', 'Crestfallen', 'Kleptomania', 'Reptilian', 'Vermillion', 'Dastardly', 'Languish', 'Sabotage', 'Villainous', 'Diabolical', 'Luminescence', 'Sanctimonious', 'Whimsical', 'Dwindling', 'Melancholy', 'Scrupulous', 'Wizardry', 'Effervescent', 'Mercurial', 'Serendipity', 'Zigzag')
__SUBEVENT_EVENT = ('run', 'jump', 'whisper', 'crawl', 'hop', 'leap', 'crunch', 'swap', 'rattle', 'snap', 'crack', 'pop', 'laugh', 'roll', 'duck', 'hide', 'seek', 'find', 'tap', 'creep', 'imagine', 'create', 'sneak', 'draw', 'color', 'pick', 'guess', 'ponder', 'prance', 'dance', 'swing', 'rock', 'flick', 'throw', 'twirl', 'whirl',
                    'spin', 'twiddle', 'doddle', 'giggle', 'share', 'trot', 'strut', 'gallop', 'choose', 'collect', 'narrate', 'celebrate', 'tell', 'tumble', 'socialize', 'move', 'gather', 'replace', 'wander', 'sing', 'write', 'touch', 'feel', 'taste', 'observe', 'see', 'discover', 'wiggle', 'scribble', 'trace', 'follow', 'predict')

__SEATING_PATTERNS = [['A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6', 'A-7', 'A-8', 'B-1', 'B-2', 'B-3', 'B-4', 'B-5', 'B-6', 'B-7', 'B-8', 'C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6', 'C-7', 'C-8', 'D-1', 'D-2', 'D-3', 'D-4', 'D-5', 'D-6', 'D-7', 'D-8', 'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'F-1', 'F-2', 'F-3', 'F-4', 'F-5', 'F-6', 'F-7', 'F-8', 'G-1', 'G-2', 'G-3']]


def get_event_name(seed=0):
    rand = Random()
    rand.seed(seed)

    return f'{rand.choice(__EVENT_ADJECTIVE).title()} {rand.choice(__EVENT_THEME).title()} {rand.choice(__EVENT_TYPE).title()}'


def get_image_list():
    path = Path(__file__).parent / "../image-cache"
    images = [f for f in listdir(path) if isfile(join(path, f))]
    images.remove('__DEFAULT_NO_IMAGE_PLACEHOLDER.png')
    return images


def upload_default_images():
    print(get_image_list())
    for f in get_image_list():
        print(f'Added Image {f}')
        db_upload_image(f)


def create_event_seating(seed=1):
    rand = Random()
    rand.seed(seed)
    groups = {}
    for i in range(0, rand.randrange(1, 4)):
        seating_plan = __SEATING_PATTERNS[0]
        name = f"Group {i}"
        groups[name] = seating_plan
    return groups


def create_gallery(seed=0):
    rand = Random()
    rand.seed(seed)
    images = get_image_list()
    indexes = [rand.randrange(0, len(images))
               for i in range(rand.randrange(0, len(images) + 1))]
    return [images[i] for i in indexes][:rand.randrange(0, 10):]


def create_thumbnail(seed=0):
    rand = Random()
    rand.seed(seed)
    images = get_image_list()
    return images[rand.randrange(0, len(images))]


def create_catagories(seed=0):
    rand = Random()
    rand.seed(seed)
    return [genre for genre in __GENRES if rand.random() < 0.3]


def create_test_event(host=1, seed=1):
    rand = Random()
    rand.seed(seed)
    # Generate sample data
    name = get_event_name(seed)
    start = __TIME_NOW + datetime.timedelta(seconds=rand.randrange(0, 60), minutes=rand.randrange(
        0, 60), hours=rand.randrange(0, 24), days=rand.randrange(0, 7), weeks=rand.randrange(0, 52))
    description = get_lorem(rand.randrange(40, 150), seed)
    is_seated = rand.random() > 0.5

    activities = [create_random_subevent(
        i * rand.randrange(0, 100000)) for i in range(0, rand.randrange(0, 10))]
    gallery = create_gallery(seed)
    thumbnail = create_thumbnail(seed)

    location_latlong = __LOCATIONS[rand.randrange(0, len(__LOCATIONS))]
    location = location_latlong[0]
    latitude = location_latlong[1]
    longitude = location_latlong[2]

    cost = round(rand.random() * 100, 2)
    capacity = rand.randrange(0, 1000)

    categories = create_catagories(seed)
    
    venue_map = "__DEFAULT_VENUE1.jpg" if rand.random() > 0.5 else "__DEFAULT_VENUE2.png"
    seating_group = create_event_seating(seed) if is_seated else None
    # Create the event
    try:
        id = create_event(host, name, description, cost, capacity, categories, location,
                          longitude, latitude, start.strftime('%Y-%m-%d'), start.strftime('%H:%M-07'), is_seated, activities, thumbnail, gallery, venue_map if is_seated else None, seating_group)
    except Exception as err:
        print(err)
    print(
        f'Created Sample Event: {id} for Host: {host}')


def create_test_user(seed=0):
    #Generate Sample data
    rand = Random()
    rand.seed(seed)
    name = get_name(seed)
    dob = __TIME_NOW - \
        datetime.timedelta(days=rand.randrange(18 * 365, 60 * 365))
    password = hashlib.sha256(b"123456789").hexdigest()
    email = create_email(name[0], name[1])

    # create the user
    id = create_user(name[0], name[1], dob, password, '0000', email)
    print(f'Created User: {id}')


# Returns the approximate words of an ipsum lorem text file
def get_lorem(words, seed=0):
    rand = Random()
    rand.seed(seed)
    offset = Random.randint(rand, a=0, b=100)
    AVG_WORD_LENGTH = 5
    try:
        return get_lorem.lorem[offset*AVG_WORD_LENGTH:offset*AVG_WORD_LENGTH+words*AVG_WORD_LENGTH:1]
    except:
        path = Path(__file__).parent / "lorem.txt"
        with open(path, 'r') as lorem:
            get_lorem.lorem = getattr(get_lorem, 'lorem', lorem.read())
            return get_lorem.lorem[offset*AVG_WORD_LENGTH:offset*AVG_WORD_LENGTH+words*AVG_WORD_LENGTH:1]

# Generates a random name
def get_name(seed=1):
    rand = Random()
    rand.seed(seed)
    try:
        return (get_name.names[rand.randrange(0, len(get_name.names))], get_name.names[rand.randrange(0, len(get_name.names))])
    except:
        path = Path(__file__).parent / "people_names.txt"
        with open(path, 'r') as names:
            get_name.index = getattr(get_name, 'index', 1)
            get_name.names = getattr(get_name, 'names', names.read().split())
        return (get_name.names[rand.randrange(0, len(get_name.names))], get_name.names[rand.randrange(0, len(get_name.names))])

# generates an email based of name
def create_email(first_name, last_name, email='mail.com'):
    return f'{first_name}{last_name}@{email}'

# generates a random sub event
def create_random_subevent(seed=0):
    rand = Random()
    rand.seed(seed)

    name = f'{rand.choice(__SUBEVENT_ADJECTIVE)} {rand.choice(__SUBEVENT_EVENT)}'

    time = datetime.time(minute=rand.randrange(0, 60),
                         hour=rand.randrange(0, 24))
    return {'name': name, 'time': time.strftime('%H:%M-07')}

# generates many events for a given host
def host_create_many_events(host=1, num_events=20, seed=0):
    rand = Random()
    rand.seed(seed)
    for _ in range(num_events):
        create_test_event(host, rand.randrange(0, 1000000))

# generates many users
def create_many_users(num_users=20, seed=0):
    rand = Random()
    rand.seed(seed)
    for _ in range(num_users):
        create_test_user(rand.randrange(0, 1000000))
