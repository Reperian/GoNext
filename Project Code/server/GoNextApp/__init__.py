from .database.database import *
from .database.load_sample_data import *

db_drop_schema()
db_load_schema()
db_load_functions()

db_load_sample_data()
load_sample_data()