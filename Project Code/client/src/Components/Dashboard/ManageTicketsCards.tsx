import { IconButton } from "@mui/material";
import useEvent from "../../hooks/useEvent";
import { getRootURL } from "../../utils/utils";
import restAPI from '../../http-common';
import dateFormat from "dateformat";
import { useNavigate } from "react-router-dom";

interface IProps {
  event_id: number;
  ticket_id: number,
  onDelete: Function,
}

function ManageTicketsCards({ event_id, ticket_id, onDelete }: IProps) {
  const navigate = useNavigate();
  const {
    eventDataStatus,
    thumbnail,
    event_name,
    event_start,
    capacity,
  } = useEvent(event_id);

  async function deleteTicket() {
    try {
      const res = await restAPI.delete(`/user/attendingevents/cancel?token=${localStorage.getItem("token")}&event_id=${event_id}&ticket_id=${ticket_id}`)

      const result = {
        status: res.status + "-" + res.statusText,
        headers: res.headers,
        data: res.data,
      };
      console.log(result);
      onDelete();
    } catch (err) {
      console.log(err);
    }
  }

  function goEvent() {
    navigate(`/event/view?id=${event_id}`);
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
        <div className="dashboard-events-info">
        </div>
        <IconButton 
          className="dashboard-events-delete" 
          aria-label="delete"
          onClick={() => {deleteTicket()}}
          >
          <p style={{color: "red"}}>Refund</p>
      </IconButton>
      </div> 
    }
  </>
}

export default ManageTicketsCards;