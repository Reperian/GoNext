import { getRootURL } from "../../utils/utils";
import { useQuery } from "react-query";
import ViewEventsCards from "./ViewEventsCard";

interface IProps {
    firstName?: string
    lastName?: string
    hostId?: number
}

function ViewEvents({ firstName, lastName, hostId }: IProps){

  const fetchEvents = async () => {
    const resp = await fetch(`${getRootURL()}host/viewevents?host_id=${hostId}`)
    return resp.json();
  }
  const {data, status } = useQuery("events", fetchEvents);

  return <>
    <div className="dashboard-container">
        <h4>{firstName[0].toUpperCase()+firstName.substring(1)} {lastName[0].toUpperCase()+lastName.substring(1)}'s Events</h4>
      
      {
        (status === "success") &&
        data.map((event: any, index: number) => {
          return (
            <ViewEventsCards key={index} id={event.id}/>
          )
        })
      }
    </div>
  </>
}

export default ViewEvents;