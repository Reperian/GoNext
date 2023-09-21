create or replace function Get_Event_Details(event_id integer)
returns table (
    host_id integer,
    host_first_name text,
    host_last_name text,
    event_id integer,
    event_name text,
    event_description text,
    event_start timestamp,
    cost decimal,
    location text,
    longitude decimal,
    latitude decimal,
    is_seated boolean,
    capacity integer,
    genre varchar[],
	gallery varchar[],
	sub_events varchar[],
	thumbnail varchar,
	venue_map varchar
	)
	
as $$
SELECT
	p.id as host,
	p.first_name as host_first_name,
	p.last_name as host_last_name,
	e.id,
	e.name,
	e.description,
	e.event_start,
	e.cost,
	e.location,
	e.longitude,
	e.latitude,
	e.is_seated,
	e.capacity,
	(select array_agg(e_ge.genre)as genre from data.event_genre e_ge where e_ge.event = event_id),
	(select array_agg(e_ga.image_id)as gallery from data.Event_Gallery e_ga where e_ga.event = event_id),
	(select array_agg(array[se.name, se.time::varchar])as sub_events from data.sub_events se where se.event = event_id),
	(select et.image_id from data.Event_Thumbnail et where et.event = event_id),
	(select evm.image_id from data.Event_Venue_Map evm where evm.event = event_id)
	FROM data.Events e
	JOIN data.People p
	on e.id = event_id and p.id = e.host
;
$$ language SQL;


-- Implementation of the inverse Haversine formula to calculate the distance on a greater sphere
-- https://en.wikipedia.org/wiki/Haversine_formula
-- https://stackoverflow.com/questions/27708490/haversine-formula-definition-for-sql
create or replace function Haversine(Lat1 decimal, Lng1 decimal, Lat2 decimal, Lng2 decimal)
    returns decimal
	as $$
	select 2 * 6335 * sqrt(
		pow(sin((radians(Lat2) - radians(Lat1)) / 2), 2)
		+ cos(radians(Lat1))
		* cos(radians(Lat2))
		* pow(sin((radians(Lng2) - radians(Lng1)) / 2), 2)
	);
$$ language SQL;

create or replace function Get_Events_In_Range(lat decimal, lng decimal, max_range decimal)
returns table (event_id decimal, distance decimal)
as $$
	SELECT id as event_id, data.Haversine(lat, lng, e.latitude, e.longitude)
	FROM data.Events e
	where data.Haversine(lat, lng, e.latitude, e.longitude) < max_range
	order by data.Haversine(lat, lng, e.latitude, e.longitude) asc;
;
$$ language SQL;