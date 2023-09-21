import React, { createContext, useEffect } from "react";
import NavbarGuest from "../Components/NavbarGuest";
import "../css/CreateEvent.scss";
import restAPI from "../http-common";
import { useNavigate } from "react-router-dom";

import CategoryChips from "../Components/CreateEvent/CategoryChips";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import PlacePredictDropdown from "../Components/CreateEvent/PlacePredictDropdown";
import SeatingCheckbox from "../Components/CreateEvent/SeatingCheckbox";
import EventActivities from "../Components/CreateEvent/EventActivities";
import InputThumbnail from "../Components/CreateEvent/InputThumbnail";
import InputGallery from "../Components/CreateEvent/InputGallery";
import { Button, Checkbox } from "@mui/material";

import { propTypes } from "react-bootstrap/esm/Image";
import { Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState } from "react";
import "../css/SeatingPlanCreateModal.scss";

import { useQuery } from "react-query";
import SeatingPlanTool from "../Components/SeatingPlan/SeatingPlanTool";
import { useSeatPlannerGroupingCache, useSeatPlannerState } from "../zustand/zustand";
import { CELL } from "../Components/SeatingPlan/SeatingGrid";
import { getSeatMapDimensions, numToCharCode } from "../utils/utils";

export const capacityContext = createContext(0);

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function CreateEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [cost, setCost] = React.useState(0);
  const [capacity, setCapacity] = React.useState("");
  const [selectedChip, setSelectedChip] = React.useState([]);
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [seated, setSeated] = React.useState(false);
  const [activities, setActivities] = React.useState([]);
  const [thumbnail, setThumbnail] = React.useState(null);
  const [images, setImages] = React.useState([]);

  const [validated, setValidated] = React.useState(false);
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const [locationError, setLocationError] = React.useState(null);

  const [capacityInvalid, setCapacityInvalid] = React.useState(false);

  // Checkboxes
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(false);

  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  // For smooth scrolling
  const capacityFieldRef = React.useRef<Element>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const seatMapGroups = useSeatPlannerGroupingCache((state: any) => state.groups);
  const resetCache = useSeatPlannerGroupingCache((state: any) => state.resetAll);
  const resetTool = useSeatPlannerState((state: any) => state.resetGroupSeat);
  const seatMapImage = useSeatPlannerGroupingCache((state: any) => state.activeImage);
  const { refetch: fetchGeocode } = useQuery(["geocode"], getGeocode, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: false,
  });
  React.useEffect(() => {
    resetCache()
    resetTool()
    if (!localStorage.getItem("token")) {
      navigate("/Login");
    }
  }, []);

  async function getGeocode() {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.REACT_APP_GOOGLE}`
    );
    return resp.json();
  }

  // This function prepares the seatmap in a concise manner before sending it to be backend
  function prepareSeatMapGroups() {
    const {rows, cols} = getSeatMapDimensions();
    const result: Record<string, string[]> = {};
    for(let group of seatMapGroups) {
      const seats = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (group[1].grid[i][j] === CELL.SEAT) {
            seats.push(`${numToCharCode(i)}-${j + 1}`);
          }   
        }
      }
      const groupName = group[0];
      result[groupName] = seats;
    }
    return result;
  }

  async function onSubmit(e: any) {
    const form: HTMLFormElement = e.currentTarget;
    e.preventDefault();
    console.log(seated);
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
      return;
    }
    try {
      const resp = await fetchGeocode();
      if (resp.data.status !== "OK") {
        setLocationError("An invalid location has been inputted");
        setValidated(true);
        return;
      }
      const latlng = resp.data.results[0].geometry.location;
      setLocationError(null);

      

      const data = {
        token: localStorage.getItem("token"),
        name: title,
        description: description,
        cost: cost,
        capacity: capacity,
        category: selectedChip,
        location: location,
        longitude: latlng.lng,
        latitude: latlng.lat,
        date: date,
        time: time,
        is_seated: seated,
        activities: activities,
        thumbnail: thumbnail,
        gallery: images,
        venue_map: seatMapImage,
        seating: prepareSeatMapGroups(),
      };
      console.log(data);
      await restAPI.post(`/events/create/`, data);
      alert("Event created!");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  function handleOpenSeatingTool() {
    if (!capacity) {
      console.log(capacityFieldRef.current);
      capacityFieldRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
      setCapacityInvalid(true);
      return;
    }
    setCapacityInvalid(false);
    setIsPlannerOpen(true);
  }

  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: process.env.REACT_APP_GOOGLE,
    debounce: 1000,
  });

  // autocomplete location
  function setPlace(place: string) {
    setLocation(place);
    const input: any = document.getElementById("location");
    input.value = place;
    setDropdownVisible(false);
  }

  function changeSeated(isSeated: boolean) {
    setSeated(isSeated);
    setChecked1(isSeated);
  }

  return (
    <>
      <NavbarGuest />
      <div className="CE-container">
        <Form noValidate validated={validated} onSubmit={onSubmit}>
          <div className="CE-basicInfo">
            <h3 style={{ paddingBottom: "50px" }}>
              Let's create an{" "}
              <span style={{ color: "var(--primary)" }}>event</span>...
            </h3>

            {/* Event thumbnail input */}
            <h4>Event Thumbnail</h4>
            <InputThumbnail thumbnail={thumbnail} setThumbnail={setThumbnail} />

            {/* Event name input */}
            <Form.Group className="mb-3" controlId="formEventTitle">
              <h4>Event Name</h4>
              <Form.Control
                required
                type="text"
                placeholder="Enter event name"
                onChange={(e) => setTitle(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter an event title.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Event description input */}
            <Form.Group className="mb-3" controlId="formEventDescription">
              <h4>Event description</h4>
              <Form.Control
                ref={descriptionRef}
                type="text"
                as="textarea"
                placeholder="Enter event description"
                onInput={() => {
                  descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
                }}
                onChange={(e) => setDescription(e.target.value)}
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
                    type="text"
                    defaultValue= {0}
                    onChange={(e) => setCost(Number(e.target.value))}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a cost.
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              {/* Event capacity input */}
              <Form.Group
                as={Col}
                className="mb-3"
                controlId="formEventTime"
                ref={capacityFieldRef}
              >
                <h4>Capacity</h4>
                <Form.Control
                  required
                  type="number"
                  onChange={(e) => setCapacity(e.target.value)}
                  isInvalid={capacityInvalid}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a capacity.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Event categories input */}
            <Form.Group className="mb-3" controlId="formCategory">
              <h4>Categories</h4>
              <CategoryChips
                selectedChip={selectedChip}
                setSelectedChip={setSelectedChip}
              />
            </Form.Group>
          </div>

          <div className="CE-basicInfo">
            {/* Event location input */}
            <Form.Group className="mb-3">
              <h4>Location</h4>
              <Form.Control
                isInvalid={!!locationError}
                required
                id="location"
                type="text"
                placeholder="Enter event location"
                onChange={(e) => {
                  getPlacePredictions({
                    input: e.target.value,
                  });
                  setLocation(e.target.value);
                  setDropdownVisible(true);
                }}
              />
              <PlacePredictDropdown
                predictions={placePredictions}
                visible={dropdownVisible}
                onClick={(e: string) => setPlace(e)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a location.
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          <div className="CE-basicInfo">
            {/* Event date input */}
            <Row className="mb-3">
              <Form.Group as={Col} className="mb-3" controlId="formEventDate">
                <h4>Start Date</h4>
                <Form.Control
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
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
                  type="time"
                  onChange={(e) => setTime(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a time.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <capacityContext.Provider value={Number(capacity)}>
              {/* Event seating input */}
              {/* <SeatingCheckbox seated={seated} setSeated={setSeated} /> */}
              <div className="CE-checkbox mb-8">
                <h4>Is your event a seated event?</h4>
                <Checkbox
                  sx={{
                    color: "var(--primary)",
                    "&.Mui-checked": {
                      color: "var(--primary)",
                    },
                  }}
                  onChange={() => changeSeated(!seated)}
                />
              </div>
              {checked1 && (
                <div className="CE-checkbox">
                  <h4>Will seating be managed at the venue?</h4>
                  <Checkbox
                    sx={{
                      color: "var(--primary)",
                      "&.Mui-checked": {
                        color: "var(--primary)",
                      },
                    }}
                    checked={checked2}
                    onChange={(e) => setChecked2(e.target.checked)}
                  />
                </div>
              )}
              {checked1 && (
                <div className="CE-seatingbutton">
                  <Button
                    variant="contained"
                    size="large"
                    disabled={checked2}
                    sx={{
                      backgroundColor: "var(--primary)",
                      "&:hover": { backgroundColor: "var(--primary)" },
                    }}
                    onClick={handleOpenSeatingTool}
                  >
                    Use our seating manager!
                  </Button>
                </div>
              )}

              <Dialog
                fullScreen
                open={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                TransitionComponent={Transition}
              >
                <SeatingPlanTool handleClose={() => setIsPlannerOpen(false)} />
              </Dialog>
            </capacityContext.Provider>
            {/* Event activities input */}
            <h4>Add Event Activities</h4>
            <EventActivities
              activities={activities}
              setActivities={setActivities}
            />

            {/* Event gallery input */}
            <h4>Add Pictures to Showcase</h4>
            <InputGallery images={images} setImages={setImages} />

            <Button
              variant="contained"
              size="large"
              type="submit"
              sx={{
                backgroundColor: "var(--primary)",
                width: "100%",
                "&:hover": { backgroundColor: "var(--primary)" },
              }}
            >
              Create Event
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default CreateEvent;
