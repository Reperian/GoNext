import { Link } from 'react-router-dom';
import '../css/EventCard.scss';

interface props {
  id: number,
  image: any
  name: string
  date: string
  location: string
  cost: string
}
function EventCard({ ...props }: props) {
  return <>
    <Link style={{textDecoration: 'none', color: 'black'}} to={`/Event/view?id=${props.id}`}>
      <div className='card-container'>
        <img className='card-img' src={props.image}></img>
        <div className='card-description'>
          <h4>{props.name}</h4>
          <div className='card-time-location'>
            <p>{props.date}</p>
            <p>{props.location}</p>
          </div>
          <div className='card-price'>
            <h1>${props.cost}</h1>
          </div>
        </div>
      </div>
    </Link>
  </>
}

export default EventCard;