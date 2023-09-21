import { useQuery } from "react-query";
import { getRootURL } from "../../utils/utils";
import ManageTicketsCards from "./ManageTicketsCards";

function ManageTickets() {
  const fetchTickets = async () => {
    const resp = await fetch(`${getRootURL()}booking/getactivetickets?token=${localStorage.getItem('token')}`)
    return resp.json();
  }
  const {data, status, refetch } = useQuery("tickets", fetchTickets);

  console.table(data);
  
  return <>
    <div className="dashboard-container">
      <h4>Your Tickets</h4>
      {
        (status === "success") &&
        data.map((event: any, index: number) => {
          return (
            <ManageTicketsCards key={index} event_id={event.event} ticket_id={event.id} onDelete={refetch}/>
          )
        })
      }
    </div>
  </>
}

export default ManageTickets;