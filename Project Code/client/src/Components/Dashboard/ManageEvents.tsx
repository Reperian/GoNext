import React from "react";
import { getRootURL } from "../../utils/utils";
import { useQuery } from "react-query";
import ManageEventsCards from "./ManageEventsCards";
import SecurityIcon from '@mui/icons-material/Security';

interface IProps {
  isAdmin?: boolean;
}

function ManageEvents({ isAdmin }: IProps){

  const [admin, setAdmin] = React.useState(isAdmin)

  //gets all the user's created events
  const fetchEvents = async () => {
    const resp = await fetch(`${getRootURL()}user/hostingevents?token=${localStorage.getItem('token')}`)
    return resp.json();
  }
  const {data, status, refetch } = useQuery("events", fetchEvents);

  return <>
    <div className="dashboard-container">
      {admin ? 
        <h4 style={{display: 'flex', alignItems: 'center', color: '#ff1f48'}}>
          <SecurityIcon style={{transform: 'scale(1.5)', color: '#ff1f48', marginRight: '15px'}}/> All Events 
        </h4>
        :
        <h4>Your Events</h4>
        
      }
      
      {
        (status === "success") &&
        data.map((event: any, index: number) => {
          return (
            <ManageEventsCards key={index} id={event.id} onDelete={refetch}/>
          )
        })
      }
    </div>
  </>
}

export default ManageEvents;