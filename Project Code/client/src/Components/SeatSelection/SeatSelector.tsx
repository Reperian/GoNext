import { SyntheticEvent, useEffect, useRef,  } from "react";
import { charCodetoNum } from "../../utils/utils";
import "../../css/SeatingGrid.scss";
import { useSeatSelectCache } from "../../zustand/zustand";
const rows = 32;
const cols = 32;

const cellSize = 30;

const gridRowTemplate = new Array(cols + 1).fill(0)
const gridColTemplate = new Array(rows).fill(0)


interface ISeatSelectorProps {
  groupID: number;
  seats: {id:number, seat_name: string}[],
  occupied: {id:number, seat_name: string}[]
}

export default function SeatSelector({groupID, seats, occupied}: ISeatSelectorProps) {
  const seatIDMap = useRef(new Map<string, number>());
  const setSeatsSelected = useSeatSelectCache(state => state.setSelectedSeats)
  const selectedSeats = useSeatSelectCache(state => state.groupsSelectedSeats)
  const selected = useRef<Set<string>>(new Set<string>(selectedSeats.get(groupID)))

  // Changes the classname of div to change if it displays a seat or not.
  // This is to prevent unnecessary rerendering
  function highlightPosition(position: {row:number, col: number}, value: "seating-grid-occupied" | "seating-grid-selected" | "seating-grid-empty" | "seating-grid-seated") {
    const target = document.getElementById(
      `seating-select-${position.row}-${position.col}`
    );
    target.children.item(0).className = `seating-cell ${value}`;
  }
  // Converts a seat name to a set of row and column number
  function seatToRowCol(seat: string) {
    const [row, col] = seat.split('-');
    return {row: charCodetoNum(row), col: Number(col) - 1}
  }
    
  const seatsCoords = seats.map(s => seatToRowCol(s.seat_name));
  const seatsOccupiedCoords = occupied.map(s => seatToRowCol(s.seat_name));
  useEffect(()=> {
    for (let seat of seats) {
      seatIDMap.current.set(seat.seat_name, seat.id);
    }
    
    for (let {row, col} of seatsCoords) {
      highlightPosition({row, col}, "seating-grid-seated")
    }
    for (let {row, col} of seatsOccupiedCoords) {
      highlightPosition({row, col}, "seating-grid-occupied")
    }

    for (let seat of selected.current) {
      highlightPosition(seatToRowCol(seat), "seating-grid-selected")
    }
  }, [])

  // Function to convert a number to a multi character code eg. 1 => A, 2 => B, 28 => AB
  // https://stackoverflow.com/questions/8240637/convert-numbers-to-letters-beyond-the-26-character-alphabet
  function numToCharCode(n: number) {
    var ordA = "A".charCodeAt(0);
    var ordZ = "Z".charCodeAt(0);
    var len = ordZ - ordA + 1;

    var s = "";
    while (n >= 0) {
      s = String.fromCharCode((n % len) + ordA) + s;
      n = Math.floor(n / len) - 1;
    }
    return s;
  }

  function handleMouseDown(event: SyntheticEvent) {
    const [_, __, row, col ] = event.currentTarget.id.split("-");

    const position = {row: Number(row), col: Number(col)}
    const seatCode =`${numToCharCode(position.row)}-${position.col + 1}`
    if (!seatIDMap.current.has(seatCode)) {
      return;
    }
    // Cannot select occupied seats
    if (occupied.find((e) => e.seat_name === seatCode)) {
      return;
    }
    // Toggle between seated and unseated
    if (!selected.current.has(seatCode)) {
      highlightPosition(position, "seating-grid-selected")
      selected.current.add(seatCode);
    }
    else {
      highlightPosition(position, "seating-grid-seated")
      selected.current.delete(seatCode);
    }
    setSeatsSelected(groupID, selected.current)
  }

  return <>
    <div className="seating-grid">
      <table className="seating-cell-table">
        <tbody>
          <tr
            style={{
              position: "relative",
            }}
            className="seating-cell-row "
          >
            {gridRowTemplate.map((_, i) => {
              if (i === 0) {
                return (
                  <th
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      zIndex: "1000 !important",
                    }}
                    key={i}
                    className="seating-cell-wrapper sticky top-0 seat-label"
                  ></th>
                );
              }
              return (
                <th
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                  }}
                  key={i}
                  className="seating-cell-wrapper sticky top-0 seat-label"
                >
                  {i}
                </th>
              );
            })}
          </tr>
          {gridColTemplate.map((row, i) => (
            <tr key={i} className="seating-cell-row">
              <td
                className="seating-cell-wrapper sticky left-0 seat-label"
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              >
                {numToCharCode(i)}
              </td>
              {gridColTemplate.map((col, j) => {
                return (
                  <td
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                    }}
                    key={j}
                    onClick={handleMouseDown}
                    id={`seating-select-${i}-${j}`}
                    className="seating-cell-wrapper "
                    draggable={false}
                  >
                    <div className="seating-cell seating-grid-empty"></div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
}