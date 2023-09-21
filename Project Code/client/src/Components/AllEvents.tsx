import EventCard from './EventCard';
import '../css/Main.scss';
import { useQuery } from 'react-query';
import { getRootURL } from '../utils/utils'


function AllEvents() {

  const fetchEvents = async () => {
    const resp = await fetch(`${getRootURL()}events/all/`)
    return resp.json();
  }
  const {data, status } = useQuery("events", fetchEvents);

  return <>
    <div className='main-popular'>
      <h1>All Events</h1>
      <div className='grid-container'>
        {
          (status === "success") &&
          data.map((event: any, index: number) => {
            return (
              <EventCard id={event.id} key={index}/>
            )
          })
        }
      </div>
    </div>
  </>
}

export default AllEvents;