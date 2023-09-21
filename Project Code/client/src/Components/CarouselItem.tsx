
import { Button, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useEvent from "../hooks/useEvent";
import { getRootURL } from "../utils/utils";

interface IProps {
  id: number
}

function CarouselItem({ id }: IProps) {
  const navigate = useNavigate();
  
  const {
    thumbnail,
    event_name,
  } = useEvent(id);

  function goEvent() {
    navigate(`/event/view?id=${id}`);
  }
  
  return <>
      <img
        className="carousel-img"
        src={`${getRootURL()}images/get?id=${thumbnail}`}
        alt="carousel-img"
      />
      <Carousel.Caption>
        <h2 style={{marginBottom: "20px"}}>{event_name}</h2>
        <Button style={{marginBottom: "20px"}} className="card-buy-btn card-bold" onClick={() => {goEvent()}}>View Event</Button>
      </Carousel.Caption>
  </>
}

export default CarouselItem;