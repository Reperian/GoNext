import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button } from '@mui/material';

interface props {
  tickets: number;
  setTickets: Function;
  price: number,
}


function TicketCard({...props}: props) {
  
  function addTicket() {
    props.setTickets(props.tickets + 1);
  }

  function removeTicket() {
    if (props.tickets > 0) {
      props.setTickets(props.tickets - 1);
    }
  }

  return <>
    <div className="BT-ticket">
      <div className="BT-price">
        <h4>Entry Ticket</h4>
        <h4>${props.price}</h4>
      </div>
      <div className="BT-ticketAdd">
        {
          props.tickets === 0 
          ?      
          <Button variant="contained" disabled size="small">
            <RemoveIcon />
          </Button>
          :
          <Button variant="contained" color="error" size="small" onClick={() => removeTicket()}>
            <RemoveIcon />
          </Button>
        }
      <h4>{props.tickets}</h4>
      <Button variant="contained" size="small" onClick={() => addTicket()}>
        <AddIcon />
      </Button>
      </div>
    </div>
  </>
}

export default TicketCard;