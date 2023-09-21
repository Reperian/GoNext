import React, { useRef } from "react";
import useEvent from "../hooks/useEvent";
import NavbarGuest from '../Components/NavbarGuest';
import '../css/CreateEvent.scss';
import restAPI from '../http-common'
import {
  useNavigate, useSearchParams,
} from 'react-router-dom';

import CategoryChips from '../Components/CreateEvent/CategoryChips'

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import PlacePredictDropdown from '../Components/CreateEvent/PlacePredictDropdown';
import EventActivities from '../Components/CreateEvent/EventActivities';
import InputThumbnail from '../Components/CreateEvent/InputThumbnail';
import InputGallery from '../Components/CreateEvent/InputGallery';
import { Button, Checkbox } from "@mui/material";
import { useQuery } from "react-query";

function EditEvent() {
  let [params] = useSearchParams();
  const id = Number(params.get("id"));
  const navigate = useNavigate();

  const {
    host_id,
    eventDataStatus,
    host_first_name,
    host_last_name,
    event_name,
    event_description,
    event_start,
    cost,
    location,
    is_seated,
    gallery,
    thumbnail,
    sub_events,
    longitude,
    latitude,
    capacity,
    genre,
    eventData,
  } = useEvent(id);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [event_cost, setEventCost] = React.useState<number>();
  const [event_capacity, setEventCapacity] = React.useState<number>();
  const [selectedChip, setSelectedChip] = React.useState([]);
  const [event_location, setEventLocation] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [seated, setSeated] = React.useState(false);
  const [activities, setActivities] = React.useState<any[] | null>([]);
  const [event_thumbnail, setEventThumbnail] = React.useState<string | null>('');
  const [images, setImages] = React.useState<string[] | null>([])

  const [validated, setValidated] = React.useState(false);
  const [dropdownVisible, setDropdownVisible] = React.useState(false);

  const descriptionRef = useRef<HTMLTextAreaElement>();

  React.useEffect(() => {
    if (!eventData) {
      return
    }
    setTitle(event_name);
    setDescription(event_description);
    setEventCost(cost);
    setEventCapacity(capacity);
    setEventLocation(location);
    setSeated(is_seated);
    setDate(event_start.split("T")[0]);
    setTime(event_start.split("T")[1]);

    if (genre !== null) {
      setSelectedChip([...selectedChip, ...genre]);
    }

    if (sub_events !== null) {
      const acts = sub_events.map((activity: any) => {
        return {
          name: activity[0],
          time: activity[1],
        }
      })
      setActivities(acts);
    }

    if (thumbnail !== null) {
      setEventThumbnail(thumbnail);
    }

    if (gallery !== null) {
      setImages(gallery);
    }
  },
    [host_id,
      eventDataStatus,
      host_first_name,
      host_last_name,
      event_name,
      event_description,
      event_start,
      cost,
      location,
      is_seated,
      gallery,
      thumbnail,
      sub_events,
      longitude,
      latitude,
      capacity,])


  async function getGeocode() {
    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.REACT_APP_GOOGLE}`)
    return resp.json();
  }
  const { data, status, refetch: fetchGeocode } = useQuery(["geocode", id], getGeocode, { refetchOnMount: false, refetchOnReconnect: false, refetchOnWindowFocus: false, enabled: false });

  async function onSubmit(e: any) {
    e.preventDefault();
    const geoCode = await fetchGeocode();
    const latlng = geoCode.data.results[0].geometry.location
    const form = e.target;

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      // return
    }

    setValidated(true);
    const data = {
      token: localStorage.getItem('token'),
      id: id,
      name: title,
      description: description,
      cost: event_cost,
      capacity: event_capacity,
      category: selectedChip,
      location: event_location,
      longitude: latlng.lng,
      latitude: latlng.lat,
      date: date,
      time: time,
      is_seated: seated,
      activities: activities,
      thumbnail: event_thumbnail,
      gallery: images,
    };

    try {
      const response = await restAPI.post(`/user/hostingevents/update`, data);
      const respData = response.data;

      // TODO: ERROR HANDLING
      navigate(`/host/manage/overview?id=${id}`);
    } catch (err) {
      console.log(err);
    }
  }

  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: process.env.REACT_APP_GOOGLE,
    debounce: 1000
  });

  function setPlace(place: string) {
    setEventLocation(place);
    const input: any = document.getElementById("location");
    input.value = place;
    setDropdownVisible(false);
  }

  return <>
    {/* <NavbarGuest /> */}
    <div className='CE-container pt-4 h-full'>
      <Form
        noValidate
        validated={validated}
        onSubmit={onSubmit}>
        <div className='CE-basicInfo'>

          {/* Event thumbnail input */}
          <h4>Event Thumbnail</h4>
          <InputThumbnail thumbnail={event_thumbnail} setThumbnail={setEventThumbnail} />

          {/* Event name input */}
          <Form.Group className="mb-3" controlId="formEventTitle">
            <h4>Event Name</h4>
            <Form.Control
              required
              type="text"
              placeholder="Enter event name"
              defaultValue={event_name}
              onChange={e => setTitle(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please enter an event title.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Event description input */}
          <Form.Group className="mb-3" controlId="formEventDescription">
            <h4>Event Description</h4>
            <Form.Control
              ref={descriptionRef}
              onInput={() => { descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px` }}
              type="text"
              as='textarea'
              rows={10}
              placeholder="Enter event description"
              defaultValue={event_description}
              onChange={e => setDescription(e.target.value)}
            />
          </Form.Group>

          <Row className="mb-3">
            {/* Event cost input */}
            <Form.Group className="w-50" controlId="formEventTime">
              <h4>Cost</h4>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">$</InputGroup.Text>
                <Form.Control
                  required
                  disabled
                  type="number"
                  defaultValue={event_cost}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a cost.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Event capacity input */}
            <Form.Group as={Col} className="mb-3" controlId="formEventTime">
              <h4>Capacity</h4>
              <Form.Control
                required
                type="number"
                defaultValue={event_capacity}
                disabled
              />
              <Form.Control.Feedback type="invalid">
                Please enter a capacity.
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          {/* Event categories input */}
          <Form.Group className="mb-3" controlId="formCategory">
            <h4>Categories</h4>
            <CategoryChips selectedChip={selectedChip} setSelectedChip={setSelectedChip} />
          </Form.Group>
        </div>

        <div className='CE-basicInfo'>
          {/* Event location input */}
          <Form.Group className="mb-3">
            <h4>Location</h4>
            <Form.Control
              required
              id='location'
              type="text"
              placeholder="Enter event location"
              defaultValue={location}
              onChange={e => {
                getPlacePredictions({
                  input: e.target.value,
                });
                console.table(placePredictions);
                setEventLocation(e.target.value);
                setDropdownVisible(true);
              }}
            />
            <PlacePredictDropdown predictions={placePredictions} visible={dropdownVisible} onClick={(e: string) => setPlace(e)} />
            <Form.Control.Feedback type="invalid">
              Please enter a location.
            </Form.Control.Feedback>
          </Form.Group>
        </div>

        <div className='CE-basicInfo'>
          {/* Event date input */}
          <Row className="mb-3">
            <Form.Group as={Col} className="mb-3" controlId="formEventDate">
              <h4>Start Date</h4>
              <Form.Control
                required
                type='date'
                defaultValue={date}
                onChange={e => setDate(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a date.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Event time input */}
            <Form.Group as={Col} className="mb-3" controlId="formEventTime">
              <h4>Start Time</h4>
              <Form.Control
                required
                type='time'
                defaultValue={time}
                onChange={e => setTime(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a time.
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          {/* Event seating input */}

          <div className="CE-checkbox mb-8">
            <h4>Is your event a seated event?</h4>
            <Checkbox
              disabled
              checked={seated}
            />
          </div>

          {/* Event activities input */}
          <h4>Add Event Activities</h4>
          <EventActivities activities={activities} setActivities={setActivities} />

          {/* Event gallery input */}
          <h4>Add Pictures to Showcase</h4>
          <InputGallery images={images} setImages={setImages} />

          <Button
            variant="contained"
            size="large"
            type="submit"
            sx={{ backgroundColor: "var(--primary)", width: "100%", '&:hover': { backgroundColor: "var(--primary)" } }}
          >
            Save
          </Button>
        </div>

      </Form>
    </div>
  </>
}

export default EditEvent;