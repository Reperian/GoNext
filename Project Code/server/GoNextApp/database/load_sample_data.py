from concurrent.futures import Future, ThreadPoolExecutor, wait
from ..controllers.events_controller import *
from ..testing_utils.test_utils import *
from random import Random

def random_user_creation_threads(executor: ThreadPoolExecutor, num_users:int):
    rand_user = Random()
    rand_user.seed(num_users)
    # Determine users per thread with one thread dedicated as creating the remainder of users
    num_workers = max(1, executor._max_workers - 1)
    users_per_full_group = int(num_users / num_workers)
    remainder_users = num_users % num_workers
    # Run each thread
    promises = []
    for i in range(num_workers):
        promise:Future = executor.submit(create_many_users, users_per_full_group, rand_user.randrange(0,100000))
        promises.append(promise)
    # Run for remainder
    promise:Future = executor.submit(create_many_users, remainder_users, rand_user.randrange(0,100000))
    promises.append(promise)
    # Sync up
    wait(promises)

def random_event_creation_threads(executor: ThreadPoolExecutor, num_hosts, avg_events_per_host, deviation):
    rand = Random()
    rand.seed(0)
    # Determine events per thread with one thread dedicated as creating the remainder of events
    num_workers = max(1, executor._max_workers - 1)
    
    promises = []
    # for each host
    for host in range(2, num_hosts + 1):
        rand_host = Random()
        rand_host.seed(host)
        # Calculate number events they will host [0, infinity)
        num_events = int(max(0, rand.gauss(avg_events_per_host, deviation)))
        
        events_per_full_group = int(num_events / num_workers)
        remainder_events = num_events % num_workers
        
        # Submit tasks the the thread pool
        for i in range(num_workers):
            promise:Future = executor.submit(host_create_many_events, host, events_per_full_group, rand_host.randrange(0,100000))
            promises.append(promise)
        promise:Future = executor.submit(host_create_many_events, host, remainder_events, rand_host.randrange(0,100000))
        promises.append(promise)
    # sync up
    wait(promises)

def load_sample_data():
    new_users = 10
    mean_events = 15
    deviation = 5
    
    workers = min(25, mean_events )
    
    executor = ThreadPoolExecutor(max_workers=workers)
    
    upload_default_images()
    random_user_creation_threads(executor, new_users)
    random_event_creation_threads(executor, new_users, mean_events, deviation)
    
    db_add_event_thumbnail(1, "__DEFAULT_ROUNDHOUSE_2.jpg")
    db_add_event_thumbnail(2, "__DEFAULT_UNSW1.png")
    db_add_event_thumbnail(3, "__DEFAULT_FIFA.jpeg")
    executor.shutdown(wait=True) 