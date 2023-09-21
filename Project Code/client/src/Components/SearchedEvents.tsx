import useEvent from "../hooks/useEvent";
import { getRootURL } from "../utils/utils";
import dateFormat from "dateformat";
import { useNavigate } from "react-router-dom";
import '../css/Dashboard.scss';

interface IProps {
  id?: number;
}

function SearchedEvents({ id }: IProps) {
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

  function editEvent() {
    navigate(`/event/edit?id=${id}`)
  }

  return <>
    {
      eventDataStatus === "success" &&
      <div className="dashboard-events" onClick={() => goEvent()}>
        <img className="dashboard-events-thumbnail" src={`${getRootURL()}images/get?id=${thumbnail}`}></img>
        <div className="dashboard-events-info">
          <h4>{event_name}</h4>
          <p>{dateFormat(event_start, "h:MM TT")},{" "}
          {dateFormat(event_start, "mmmm d yyyy")}</p>
        </div>
        <div className="dashboard-events-info">
          <p>Tickets Sold</p>
          <p>0/{capacity}</p>
        </div>
      </div> 
    }
  </>
}

export default SearchedEvents;