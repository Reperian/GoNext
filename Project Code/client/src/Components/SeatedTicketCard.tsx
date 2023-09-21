import { Button, Dialog } from '@mui/material';
import { useState } from 'react';
import SeatSelector from './SeatSelection/SeatSelector';

interface props {
  id:number
  seats: {occupied:{id:number, seat_name: string}[], seats: {id:number, seat_name: string}[]}
  groupName: string;
  price: number,
}


function SeatedTicketCard(props: props) {
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false)
  }

  return <>
    <div className="BT-ticket">
      <div className="BT-price">
        <h4>{props.groupName}</h4>
        <h4>${props.price}</h4>
      </div>
      <div className="BT-ticketAdd">
        {
          <Button variant="contained" size="small" onClick={() => {setOpen(true);}}>
            <p>Select Seats</p>
          </Button>
        }
      </div>
    </div>

    <Dialog
      fullScreen
      open={open}
      onClose={() => {setOpen(false);}}>
        <div className="seat-selector-screen">
          <h2 className='mt-8'> {props.groupName}</h2>
          <div className="seat-selector-wrapper">
            <SeatSelector groupID={props.id} seats={props.seats.seats} occupied={props.seats.occupied}></SeatSelector>  
          </div>
          <Button variant="contained" sx={{width: "350px"}} onClick={handleClose}>Submit</Button>
        </div>
    </Dialog>
  </>
}

export default SeatedTicketCard;