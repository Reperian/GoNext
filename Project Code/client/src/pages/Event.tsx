import "../css/Event.scss";
import "../css/HorizontalActivitiesTimeline.scss";
import Navbar from "../Components/NavbarGuest";
import Footer from "../Components/Footer";
import ImagesGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { useEffect, useState } from "react";
import BuyTickets from "./BuyTickets";
import { Button as BootstrapButton } from "react-bootstrap";
import useEvent from "../hooks/useEvent";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import dateFormat from "dateformat";
import { getRootURL } from "../utils/utils";
import { EventTimeline, EventTimelineItem } from "../Components/Activities";
import CardGridContainer from "../Components/CardGridContainer";
import { Chip, Rating } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import Button from "@mui/material/Button";
import { useQuery } from "react-query";
import { useSeatSelectCache } from "../zustand/zustand";

export default function Event() {
  const navigate = useNavigate();
  let [params] = useSearchParams();
  const id = Number(params.get("id"));
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [galleryLinks, setGalleryLinks] = useState<
  { original: string; thumbnail: string }[]
  >([]);
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
    genre,
  } = useEvent(id);
  const resetSelectedSeats = useSeatSelectCache((state) => state.resetAll);
  // Fetches all events from an organiser
  async function getMoreFromOrganiser() {
    const resp = await fetch(
      `${getRootURL()}eventshostedbyhost?host_id=${host_id}`
    );
    return resp.json().then((val) => val.map((v: any) => v.id));
  }
  // Fetches all average ratings
  const fetchAvgRating = async () => {
    const resp = await fetch(`${getRootURL()}events/avgreview?event_id=${id}`);
    return resp.json();
  };
  
  const {
    data: avgRatingData,
    status: avgRatingStatus,
  } = useQuery("avgRating", fetchAvgRating);
  // Fetches all gallery information
  useEffect(() => {
    if (!gallery) return;
    setGalleryLinks(
      gallery.map((item) => ({
        original: `${getRootURL()}images/get?id=${item}`,
        thumbnail: `${getRootURL()}images/get?id=${item}`,
      }))
      );
    }, [gallery, eventDataStatus]);
    
    // Resets the seat selector upon mounts to prevent bug where user selects seats for wrong events
    useEffect(() => {
    resetSelectedSeats();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Open modal to buy tickets
  const handleBuyTicketsOpen = (e: any) => {
    if (localStorage.getItem("token") === null) {
      navigate('/Login')
    }
    e.preventDefault();
    setOpen(true);
  };

  // Redirects to event review page
  function handleViewReviews() {
    navigate(`/event/reviews?event_id=${id}`);
  }

  if (eventDataStatus !== "success") {
    return <></>;
  }

  // handles the clicking of share events
  function shareEvent(string: string) {
    if (string === "facebook") {
      window.open("https://www.facebook.com/");
    } else if (string === "twitter") {
      window.open("https://twitter.com/home?lang=en");
    } else {
      navigator.clipboard.writeText(window.location.href);

      alert("Copied link to this event");
    }
  }

  return (
    <>
      <div id="event-page">
        <div className="background">
          <div
            className="background-inner"
            style={{
              backgroundImage: `url(${getRootURL()}images/get?id=${thumbnail})`,
            }}
          ></div>
        </div>
        <Navbar />
        <div className="grid-container lr-padded-1">
          <div className="event-banner-wrapper">
            <img
              className="event-banner"
              src={`${getRootURL()}images/get?id=${thumbnail}`}
              alt="thumbnail"
            />
          </div>
          <div className="event-container-left">
            <h1 id="event-page-title" className="section">
              {event_name}
            </h1>
            <div id="event-detail-map-wrapper">
              <div id="event-details" className="section">
                <div className="event-detail-pair">
                  <div className="event-detail">
                    <h3>Venue:</h3>
                    <h3>{location}</h3>
                  </div>
                  <div className="event-detail">
                    <h3>Time:</h3>
                    <h3>
                      {dateFormat(event_start, "h:MM TT")},{" "}
                      {dateFormat(event_start, "mmmm d yyyy")}
                    </h3>
                  </div>
                </div>
                <div className="event-detail-pair">
                  <div className="event-detail">
                    <h3>Organised By: </h3>
                    <Link
                      style={{ textDecoration: "none" }}
                      to={`/host/view?id=${host_id}`}
                    >
                      <h3 style={{ color: "black" }}>
                        {" "}
                        {host_first_name} {host_last_name}{" "}
                      </h3>
                    </Link>
                  </div>
                  <div className="event-detail event-seating-detail">
                    <h3>This event is:</h3>
                    <h3>{is_seated ? "" : "NOT"} Seated</h3>
                  </div>
                </div>
              </div>
              <iframe
                title="event-page-map"
                id="event-page-map"
                className="section mb-4"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude}%2C${latitude}%2C${longitude}%2C${latitude}&layer=mapnik&marker=${latitude}%2C${longitude}`}
              />
            </div>
            <h2 style={{ marginTop: "20px" }}>Categories</h2>
            <div id="event-page-catagories">
              {genre &&
                genre.map((category: string, index: number) => {
                  const label =
                    category[0].toUpperCase() + category.substring(1);
                  return (
                    <Chip
                      key={index}
                      label={label}
                      sx={{ backgroundColor: "var(--primary)", color: "white" }}
                      variant="filled"
                      size="medium"
                    />
                  );
                })}
            </div>
            <div id="event-page-about" className="section">
              <h2 className="mb-4">About this event</h2>
              <p>{event_description}</p>
            </div>
            {sub_events && (
              <div id="event-page-activities" className="section">
                <h2 className="mb-4">Activities</h2>
                <EventTimeline>
                  {sub_events.map((v, i) => (
                    <EventTimelineItem name={v[0]} time={v[1]} key={i} />
                  ))}
                </EventTimeline>
              </div>
            )}
            {galleryLinks.length !== 0 && (
              <div id="event-gallery" className="section">
                <h2>Gallery</h2>
                <ImagesGallery
                  autoPlay
                  slideInterval={5000}
                  slideDuration={400}
                  items={galleryLinks}
                  thumbnailPosition="bottom"
                />
              </div>
            )}
          </div>

          <div className="event-container-right">
            <div className="event-buy-ticket">
              <h4>Buy ticket</h4>
              <h5>${cost}</h5>
              <BootstrapButton
                className="btn-buy-ticket"
                onClick={handleBuyTicketsOpen}
              >
                Buy Tickets
              </BootstrapButton>
            </div>
          </div>
        </div>
        <div
          className="event-container-more"
          id="more-from-organiser-container"
        >
          <div className="event-line"></div>
          <h2>Reviews</h2>
          <div className="view-reviews">
            {avgRatingStatus === "success" && avgRatingData > 0 ? (
              <>
                <p style={{ fontWeight: "bold" }}>
                  {" "}
                  {avgRatingData.toFixed(1)}{" "}
                </p>
                <Rating
                  size="large"
                  name="read-only"
                  value={avgRatingData}
                  precision={0.1}
                  readOnly
                />
              </>
            ) : (
              <>
                <p> No reviews yet</p>
                <Rating
                  size="large"
                  name="read-only"
                  value={0}
                  precision={0.1}
                  readOnly
                />
              </>
            )}

            <BootstrapButton
              className="button"
              variant=""
              size="lg"
              type="button"
              onClick={handleViewReviews}
            >
              View Reviews!
            </BootstrapButton>
          </div>

          <div className="event-line"></div>

          <h2>Share This Event</h2>
          <div className="share-event">
            <Button
              size="large"
              onClick={() => {
                shareEvent("facebook");
              }}
            >
              <FacebookIcon fontSize="large" />
            </Button>
            <Button
              size="large"
              onClick={() => {
                shareEvent("twitter");
              }}
            >
              <TwitterIcon fontSize="large" />
            </Button>
            <Button
              size="large"
              onClick={() => {
                shareEvent("link");
              }}
            >
              <LinkIcon fontSize="large" />
            </Button>
          </div>
          <h2>More From this Organiser</h2>
          <CardGridContainer
            id={["more-from-organiser", host_id]}
            queryFunction={getMoreFromOrganiser}
          />
        </div>

        <Footer />
      </div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        className="BT-wrapper-modal"
      >
        <Fade in={open}>
          <Box className="BT-wrapper">
            <BuyTickets event_id={id} />
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
