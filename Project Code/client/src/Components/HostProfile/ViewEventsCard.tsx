import useEvent from "../../hooks/useEvent";
import { getRootURL } from "../../utils/utils";
import dateFormat from "dateformat";
import { useNavigate } from "react-router-dom";

interface IProps {
  id?: number;
}

function ViewEventsCards({ id }: IProps) {
  const navigate = useNavigate();

  const {
    eventDataStatus,
    thumbnail,
    event_name,
    event_start,
    capacity,
  } = useEvent(id);

  function goEvent() {
    navigate(`/event/view?id=${id}`);
  }

  return <>
    {
      eventDataStatus === "success" &&
      <div className="dashboard-events">
        <img className="dashboard-events-thumbnail" src={`${getRootURL()}images/get?id=${thumbnail}`}></img>
        <div className="dashboard-events-info" onClick={() => goEvent()}>
          <h4>{event_name}</h4>
          <p>{dateFormat(event_start, "h:MM TT")},{" "}
          {dateFormat(event_start, "mmmm d yyyy")}</p>
        </div>
        <div className="dashboard-events-info" onClick={() => goEvent()}>
          <p>Tickets Sold</p>
          <p>0/{capacity}</p>
        </div>
      </div> 
    }
  </>
}

export default ViewEventsCards;