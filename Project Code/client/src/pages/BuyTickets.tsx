import { Button } from "@mui/material";
import React from "react";
import TicketCard from "../Components/TicketCard";
import "../css/BuyTickets.scss";
import { getRootURL } from "../utils/utils";
import restAPI from "../http-common";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import useEvent from "../hooks/useEvent";
import SeatedTicketCard from "./../Components/SeatedTicketCard";
import { useSeatSelectCache } from "../zustand/zustand";

interface ITickets {
  seat: number | null;
  no_discount_price: number | null;
}

// Simple card for displaying tickets and pricing summary
function SelectedItem({
  name,
  cost,
  quantity,
}: {
  name: string;
  cost: number;
  quantity: number;
}) {
  return (
    <>
      <div className="BT-summary-price">
        <p>
          {quantity} x {name} Tickets
        </p>
        <p>${Math.round(quantity * cost * 100) / 100}</p>
      </div>
    </>
  );
}


function BuyTickets({ event_id }: { event_id: number }) {
  const navigate = useNavigate();
  const { event_name, cost: price, thumbnail, venue_map } = useEvent(event_id);
  const [numtickets, setNumTickets] = React.useState(0);
  const selectedSeats = useSeatSelectCache(
    (state) => state.groupsSelectedSeats
  );
  const { data: groups, status } = useQuery(
    ["buy-seating-group", event_id],
    getGroups
  );

  // Gets each seating group details from the server
  async function getGroups() {
    // Get each seating group
    const groups = await fetch(
      `${getRootURL()}booking/getseatgroups?event_id=${event_id}`
    );
    const groupsData = await groups.json();
    // Gets details about each seating group
    const seatPromises = groupsData.map(async (val: any) => {
      return fetch(
        `${getRootURL()}booking/getseatsingroup?group_id=${val.id}`
      )
        .then((resp) => resp.json())
        .then((json) => {
          // Format response
          return { ...val, groupSeatData: json };
        });
    });
    // Awaits all requests to complete
    const seats = await Promise.all(seatPromises);
    return seats;
  }

  // Calculates discount for a given amount of seats picked
  const fetchDiscount = async () => {
    let total = 0
    for (let [groupID, selected] of selectedSeats) {
      total += selected.size;
    }
    const resp = await fetch(`${getRootURL()}booking/getdiscounts?token=${localStorage.getItem('token')}&numTicks=${numtickets + total}&event_id=${event_id}`)
    return resp.json();
  }
  const {data: discount, status: status2, refetch } = useQuery("discount", fetchDiscount);

  // Refetch on stale data for discount
  React.useEffect(() => {
    refetch();
  }, [numtickets, selectedSeats])

  // Sends post request to purchase tickets
  async function buyTickets() {
    const tickets: ITickets[] = [];

    // Create tickets for each basic ticket
    for (let i = 0; i < numtickets; i++) {
      const ticket: ITickets = {
        seat: null,
        no_discount_price: null,
      };

      tickets.push(ticket);
    }
    // Create tickets for each seated ticket
    // For each seating group
    for (let [groupID, selected] of selectedSeats) {
      const seats = groups.find((group)=> {return group.id === groupID});
      // Gets each seat ID from selected "seat name"
      for (let seat of seats.groupSeatData.seats) {
        if (selected.has(seat.seat_name)) {
          const ticket: ITickets = {
            seat: seat.id,
            no_discount_price: null,
          };
          tickets.push(ticket);
        }
      }
    }

    const data = {
      token: localStorage.getItem("token"),
      tickets: tickets,
      event_id: event_id,
    };
    try {
      await restAPI.post(`/booking/createtickets`, data);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }  
  // Calculates the undiscounted cost of cart
  function calculateCost() {
    let cost = numtickets * price;
    for (let [_, seats] of selectedSeats) {
      cost += seats.size * price;
    }
    return cost
  }


  if (status !== "success") {
    return <></>;
  }

  return (
    <>
      <div className="BT-container">
        {!!venue_map && (
          <div className="BT-left h-full w-full relative overflow-hidden">
            <img
              className="w-full h-full object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              src={`${getRootURL()}images/get?id=${venue_map}`}
              alt="Thumbnail"
            ></img>
          </div>
        )}
        <div className="BT-center-right-wrapper">
          <div className="BT-center">
            <div className="BT-info">
              <h4>{event_name}</h4>
            </div>
            <div className="BT-tickets overflow-y-scroll h-full">
              <TicketCard
                tickets={numtickets}
                setTickets={setNumTickets}
                price={price}
              />
              {groups.map((group: any) => (
                <SeatedTicketCard
                  key={group.id}
                  id={group.id}
                  groupName={group.name}
                  seats={group.groupSeatData}
                  price={price}
                />
              ))}
            </div>
          </div>

          <div className="BT-right overflow-y-scroll min-h-full">
            <div className="BT-thumbnail flex justify-center item-center max-h-96">
              <img
                className="max-w-full"
                src={`${getRootURL()}images/get?id=${thumbnail}`}
                alt="thumbnail"
              ></img>
            </div>
            <div className="BT-summary-container">
              {(numtickets > 0 || selectedSeats.size > 0) && (
                <div className="BT-summary">
                  <h5>Order summary</h5>
                  {numtickets > 0 && (
                    <div className="BT-summary-price">
                      <p>{numtickets} x Entry Tickets</p>
                      <p>${Math.round(numtickets * price * 100) / 100}</p>
                    </div>
                  )}

                  {groups.map((group) => {
                    if (selectedSeats.has(group.id)) {
                      if (selectedSeats.get(group.id).size > 0) {
                        return (
                          <SelectedItem
                            key={group.id}
                            name={group.name}
                            cost={price}
                            quantity={selectedSeats.get(group.id).size}
                          />
                        );
                      }
                    }
                    return null;
                  })}

                  <div className="BT-summary-divs">
                    <div className="BT-summary-price">
                      <p>Subtotal</p>
                      <p>${calculateCost().toFixed(2)}</p>
                    </div>
                    <div className="BT-summary-price">
                      {
                        (status2 === "success" && discount.loyaltyDiscountAmount != 0) &&
                        <p>Loyalty Discount (-{discount.loyaltyDiscountPercent}%)</p>
                      }
                      {
                        (status2 === "success" && discount.loyaltyDiscountAmount != 0) &&
                        <p>-${discount.loyaltyDiscountAmount}</p>
                      }
                    </div>
                    <div className="BT-summary-price">
                      {
                        (status2 === "success" && discount.bulkDiscountAmount != 0) &&
                        <p>Bulk Discount (-{discount.bulkDiscountPercent}%)</p>
                      }
                      {
                        (status2 === "success" && discount.bulkDiscountAmount != 0) &&
                        <p>-${discount.bulkDiscountAmount}</p>
                      }
                    </div>
                  </div>
                  <div>
                    <div className="BT-summary-price">
                      <h3>Total</h3>
                      <h3>
                        ${(calculateCost() - discount.bulkDiscountAmount - discount.loyaltyDiscountAmount).toFixed(2)}
                      </h3>
                    </div>
                  </div>
                </div>
              )}
              <div className="BT-checkout">
                <Button
                  disabled={numtickets === 0 && selectedSeats.size === 0}
                  variant="contained"
                  size="small"
                  sx={{
                    background: "var(--primary)",
                    "&:hover": { backgroundColor: "var(--primary)" },
                  }}
                  onClick={() => buyTickets()}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BuyTickets;
