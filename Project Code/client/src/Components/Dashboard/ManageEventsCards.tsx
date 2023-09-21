import { IconButton } from "@mui/material";
import useEvent from "../../hooks/useEvent";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { getRootURL } from "../../utils/utils";
import dateFormat from "dateformat";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import React from "react";

interface IProps {
  id?: number;
  onDelete: Function;
}

function ManageEventsCards({ id, onDelete }: IProps) {
  const navigate = useNavigate();

  const { eventDataStatus, thumbnail, event_name, event_start, capacity } =
    useEvent(id);

  const fetchTickets = async () => {
    const resp = await fetch(
      `${getRootURL()}events/numticketsbooked?event_id=${id}`
    );
    return resp.json();
  };
  const { data, status, refetch } = useQuery(
    ["ticketsBought", id],
    fetchTickets
  );

  React.useEffect(() => {
    refetch();
  }, [data]);

  function goEvent() {
    navigate(`/Host/manage/overview?id=${id}`);
  }

  function editEvent() {
    navigate(`/Host/manage/edit?id=${id}`);
  }

  function deleteEvent() {
    navigate(`/Host/manage/delete?id=${id}`);
  }

  return (
    <>
      {eventDataStatus === "success" && (
        <div className="dashboard-events">
          <img
            className="dashboard-events-thumbnail"
            src={`${getRootURL()}images/get?id=${thumbnail}`}
          ></img>
          <div className="dashboard-events-info" onClick={() => goEvent()}>
            <h4>{event_name}</h4>
            <p>
              {dateFormat(event_start, "h:MM TT")},{" "}
              {dateFormat(event_start, "mmmm d yyyy")}
            </p>
          </div>
          <div className="dashboard-events-info" onClick={() => goEvent()}>
            <p>Tickets Sold</p>
            {status === "success" ? (
              <p>
                {data.num_booked}/{capacity}
              </p>
            ) : (
              <p>0/{capacity}</p>
            )}
          </div>
          <IconButton
            className="dashboard-events-edit"
            onClick={() => editEvent()}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            className="dashboard-events-delete"
            aria-label="delete"
            onClick={() => deleteEvent()}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )}
    </>
  );
}

export default ManageEventsCards;
