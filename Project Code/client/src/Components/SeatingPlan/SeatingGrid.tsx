import { SyntheticEvent, useContext, useEffect, useRef, useState } from "react";
import "../../css/SeatingGrid.scss";
import { useSeatPlannerGroupingCache, useSeatPlannerState } from "../../zustand/zustand";
import SeatingToolToolbar from "./SeatingToolToolbar";
import { capacityContext } from "../../pages/CreateEvent";
const rows = 32;
const cols = 32;
const minSize = 30;

interface ICell {
  row: number;
  col: number;
}

interface IProps {
  className: string;
  handleSubmit: (grid: CELL[][]) => void;
  id?: string;
}
export enum CELL {
  EMPTY,
  SEAT,
  OCCUPIED,
}

export default function SeatingGrid({ id = null, className = '', handleSubmit }: IProps) {
  // Zustand State Management
  const addGroupSeat = useSeatPlannerState((state) => state.addGroupSeat);
  const removeGroupSeat = useSeatPlannerState((state) => state.removeGroupSeat)
  const resetGroupSeat = useSeatPlannerState((state) => state.resetGroupSeat)
  const setNumSeats = useSeatPlannerState(state => state.setNumSeats)
  const setSeatsBeforeEdit = useSeatPlannerState(state => state.setSeatsBeforeEdit)

  const seatsAllocated = useSeatPlannerGroupingCache((state) => state.getTotalSeated);
  const getGroups = useSeatPlannerGroupingCache((state) => state.getGroup);

  const grid = useRef(init());

  const mouseState = useRef({
    mouseDown: false,
    lastValidPosition: null,
    isDragging: false,
  });

  const [operation, setOperation] = useState(CELL.SEAT);
  const [cellSize, setCellSize] = useState(32);
  const [cursor, setCursor] = useState("pointer");

  const capacity = useContext(capacityContext);

  const numSeatsDrawn = useRef(0);
  const seatsAllocatedRef = useRef(seatsAllocated())

  // Sets the grid to a 2d array of Cells initiated to EMPTY
  function init() {
    const grid = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(CELL.EMPTY)
      }
      grid.push(row);
    }
    return grid;
  }

  // On mounted effects
  useEffect(() => {
    // Check if this is an edit
    if (!!id) {
      let groupSeatCount = 0;
      const initialGrid = getGroups(id).grid;
      // Load the saved data in to the group
      for (let i = 0; i < initialGrid.length; i++) {
        for (let j = 0; j < initialGrid[i].length; j++) {
          if (initialGrid[i][j] === CELL.SEAT) {
            const position = { row: i, col: j };
            grid.current[i][j] = CELL.SEAT;
            highlightPosition(position, CELL.SEAT)
            groupSeatCount++;
          }
        }
      }
      // Set current number of seats for the current tool instance.
      setNumSeats(groupSeatCount);
      // Keeps track of the amount of seats before editing this group
      setSeatsBeforeEdit(groupSeatCount);
    }
    // New Group
    else {
      resetGroupSeat();
      setSeatsBeforeEdit(0);
    }
  }, [resetGroupSeat])

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

  // Switching between drawing and erasing seats.
  function handleChangeOperation(
    event: React.MouseEvent<HTMLElement>,
    newOperation: CELL
  ) {
    if (newOperation !== null) {
      setOperation(newOperation);
    }
  }

  // Clears the whole board
  function handleClearBoard() {
    for (let row = 0; row < grid.current.length; row++) {
      for (let col = 0; col < grid.current[row].length; col++) {
        if (grid.current[row][col] === CELL.EMPTY) continue;
        setCell({ row, col }, CELL.EMPTY);
      }
    }
  }

  // Increases cell size which is the equivalent of zooming in
  function handleZoomIn() {
    setCellSize((v) => Math.max(minSize, v + 4));
  }
  // Decreases cell size which is the equivalent of zooming out
  function handleZoomOut() {
    setCellSize((v) => Math.max(minSize, v - 4));
  }
  // Given 
  function getCellFromId(id: string): ICell {
    const segments = id.split("-");
    return { row: Number(segments[1]), col: Number(segments[2]) };
  }

  // Sets the position on the grid to the specified value (EMPTY or SEAT)
  function setCell(position: ICell, value: CELL) {
    // Operation must be Empty -> Seat or Seat -> Empty
    if (value === grid.current[position.row][position.col]) return;

    if (value === CELL.SEAT) {
      // Check if we can add more seats.
      if (numSeatsDrawn.current + seatsAllocatedRef.current < capacity) {
        addGroupSeat();
        numSeatsDrawn.current++;
        grid.current[position.row][position.col] = value;
        highlightPosition(position, value);
      }
    }
    // Remove a seat
    else {
      removeGroupSeat();
      numSeatsDrawn.current--;
      grid.current[position.row][position.col] = value;
      highlightPosition(position, value);
    }

  }

  // Left mouse button down handler
  function handleMouseDown(event: SyntheticEvent) {
    event.preventDefault();
    const mouseEvent = event as unknown as MouseEvent;
    const target = event.target as HTMLElement;
    mouseState.current.mouseDown = true;
    // Returns if not left click
    if (mouseEvent.buttons !== 1) return;
    // Get cell position
    const position = getCellFromId(target.id);
    // Sets the cursor style based on operation and if the cell clicked was seated or empty
    if (operation === CELL.EMPTY) {
      setCursor("pointer");
    }
    else if (grid.current[position.row][position.col] !== CELL.EMPTY) {
      setCursor("grabbing");
    }
    // Clicked on a seat to begin drag
    if (grid.current[position.row][position.col] !== CELL.EMPTY &&
      operation !== CELL.EMPTY
    ) {
      mouseState.current.lastValidPosition = position;
    }
    // Set the cell to the operation
    else {
      setCell(position, operation);
    }
    // Start the dragging state.
    mouseState.current.isDragging = true;
  }
  // Mouse entering a cell handler. Helps 
  function handleMouseEnter(event: SyntheticEvent) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const position = getCellFromId(target.id);
    // Set cursor style
    if (operation === CELL.EMPTY) {
      setCursor("pointer");
    }
    else if (mouseState.current.lastValidPosition !== null) {
      setCursor("grabbing");
    }
    else if (grid.current[position.row][position.col] !== CELL.EMPTY &&
      !mouseState.current.mouseDown
    ) {
      setCursor("grab");
    } else {
      setCursor("pointer");
    }

    // Return early if not dragging
    if (!mouseState.current.isDragging) return;

    // Dragging of element
    if (mouseState.current.lastValidPosition !== null) {
      // Drag onto empty square
      if (grid.current[position.row][position.col] === CELL.EMPTY) {
        setCell(mouseState.current.lastValidPosition, CELL.EMPTY);
        setCell(position, CELL.SEAT);
        mouseState.current.lastValidPosition = position;
      }
    }
    // Drag and draw
    else {
      setCell(position, operation);
    }
  }

  // Handles the letting go of mouse left click
  function handleMouseUp(event: SyntheticEvent) {
    event.preventDefault();
    const target = event.target as HTMLElement;

    // Resets the mouse state
    const position = getCellFromId(target.id);
    mouseState.current.isDragging = false;
    mouseState.current.lastValidPosition = null;
    mouseState.current.mouseDown = false;

    // Set cursor style
    if (grid.current[position.row][position.col] !== CELL.EMPTY) {
      setCursor("grab");
    } else {
      setCursor("pointer");
    }
  }

  // Changes the classname of div to change if it displays a seat or not.
  // This is to prevent unnecessary rerendering
  function highlightPosition(position: ICell, value: CELL) {
    const className =
      value === CELL.EMPTY ? "seating-grid-empty" : "seating-grid-seated";
    const target = document.getElementById(
      `seating-${position.row}-${position.col}`
    );
    target.children.item(0).className = `seating-cell ${className}`;
  }

  return (
    <>
      <div className="seating-tool-wrapper">
        <div className="seating-grid">
          <table className="seating-cell-table" style={{ cursor: cursor }}>
            <tbody>
              <tr
                style={{
                  position: "relative",
                }}
                className="seating-cell-row "
              >
                {new Array(cols + 1).fill(0).map((_, i) => {
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
              {grid.current.map((row, i) => (
                <tr key={i} className="seating-cell-row">
                  <td
                    className="seating-cell-wrapper sticky left-0 seat-label"
                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  >
                    {numToCharCode(i)}
                  </td>
                  {row.map((col, j) => {
                    return (
                      <td
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                        }}
                        key={j}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                        onMouseUp={handleMouseUp}
                        id={`seating-${i}-${j}`}
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
        <SeatingToolToolbar
          operation={operation}
          handleChangeOperation={handleChangeOperation}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleClearBoard={handleClearBoard}
          handleSubmit={() => handleSubmit(grid.current)}
        />
      </div>
    </>
  );
}
