import { useState, useEffect, useContext, useCallback } from "react";
import { getRootURL } from "../../utils/utils";
import ImageDropZone from "../ImageDropZone";
import "../../css/SeatingPlanCreateModal.scss";
import { Box, Button, Fade, IconButton, Modal } from "@mui/material";
import { Form } from "react-bootstrap";
import SeatingGrid from "./SeatingGrid";
import {
  useSeatPlannerGroupingCache,
  useSeatPlannerState,
} from "../../zustand/zustand";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { CELL } from "./SeatingGrid";
import { capacityContext } from "../../pages/CreateEvent";



// Default style for the modal box
const styleBox1 = {
  position: "absolute",
  width: "90%",
  height: "100vh",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
  opacity: 1,
  backgroundColor: "white",
  p: 4,
};

// Keeps track of how many seats have been placed and how many seats are available to be placed
// Element extracted to reduce cost or rerendering the DOM
function GroupSeatCounter() {
  const groupSeatCount = useSeatPlannerState((state) => state.groupSeat);
  const totalSeatsAllocated = useSeatPlannerGroupingCache((state) => state.getTotalSeated);
  const seatsBeforeEdit = useSeatPlannerState((state) => state.seatsBeforeEdit);
  const capacity = useContext(capacityContext);
  return (
    <>
      <h3 className="mt-2" style={{ gridColumn: "1/5" }}>
        {groupSeatCount} Seats Placed
      </h3>
      <h3 className="mt-2" style={{ gridColumn: "5/9" }}>
        {capacity - totalSeatsAllocated() - groupSeatCount + seatsBeforeEdit} / {capacity} Seats Remaining
      </h3>
    </>
  );
}

// The total number of seats that have been allocated across all groups
// Element extracted to reduce cost or rerendering the DOM
function TotalAllocationCounter() {
  const context = useContext(capacityContext)
  const getTotalSeated = useSeatPlannerGroupingCache((state) => state.getTotalSeated);
  return <h3 className="mt-2 h-32 bg-gray-100 w-full flex items-center pl-8 rounded-3xl">{getTotalSeated()} / {context} of Total Capacity Seated</h3>;
}


interface ICardProps {
  id: string;
}
// Card that displays each of the groups that have been created
function Card({ id }: ICardProps) {
  const [open, setOpen] = useState(false);
  const [seats, setSeats] = useState(0);
  const group = useSeatPlannerGroupingCache((state) => state.groups);
  const removeGroup = useSeatPlannerGroupingCache((state) => state.removeGroup);

  // Keeps track of number of seats allocated to this group
  const setNumSeats = useCallback(() => {
    const numSeats = group.get(id).grid
      .reduce(
        (previousValue, currentValue) =>
          previousValue + currentValue.reduce((p, c) => p + c, 0),
        0
      );
      setSeats(numSeats);
  }, []);

  // On mount update number of seats
  useEffect(()=> {
    setNumSeats()
  }, []);

  function handleEdit() {
    setNumSeats();
    setOpen(true);
  }

  function handleRemove() {
    removeGroup(id);
  }
  return (<>
    <div>
      <li className="w-full bg-gray-100 h-16 rounded-xl border grid items-center pl-8 pr-8 grid-cols-3">
        <span>Seating group: {id}</span>
        <span className="justify-self-center">Capacity: {seats}</span>
        <div className="flex justify-self-end">
          <IconButton aria-label="edit" size="medium" onClick={handleEdit}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="delete" size="medium" onClick={handleRemove}>
            <DeleteForeverIcon />
          </IconButton>
        </div>
      </li>
    </div>
    <SeatingPlanTool id={id} open={open} edit handleClose={()=>{setOpen(false)}} handleSubmit={()=>{setOpen(false)}}/>
    </>
  );
}


interface ISeatingPlanToolProps {
  id?:string;
  open: boolean;
  edit?: boolean;
  handleSubmit: () => void;
  handleClose: () => void;
}


function SeatingPlanTool({
  id = null,
  open = false,
  edit = false,
  handleSubmit,
  handleClose,
}: ISeatingPlanToolProps) {
  const setGridData = useSeatPlannerGroupingCache((state) => state.setGroup);
  const groups = useSeatPlannerGroupingCache((state) => state.groups);
  const deleteGroup = useSeatPlannerGroupingCache((state) => state.removeGroup);
  const [validated, setValidated] = useState(false);
  const [groupName, setGroupName] = useState(!!id ? id : "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Check if a non duplicate group name exists
  function checkFormErrors() {
    const newErrors: { [key: string]: string } = {};
    // Check empty groupname
    if (groupName.length === 0) {
      newErrors.groupName = "Please enter your group name";
    }
    // Name collision
    if (!edit && groups.has(groupName)) {
      newErrors.groupName = "Group name already exists";
    }
    return newErrors;
  }

  function handleFormSubmit(grid: CELL[][]) {
    // Validate form
    const formErrors = checkFormErrors();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    // Reset
    if (edit) {
      // Trick to emulate replacment the original group with this new group
      deleteGroup(id);
    }
    // If not editing reset group name
    else {
      setGroupName("")
    }
    setGridData(groupName, grid);
    // Cleanup
    setErrors({});
    setValidated(false);
    handleSubmit();
  }

  function handleFormClose() {
    // Reset
    setErrors({});
    // Set group name back to original name if editing
    if (edit) {
      setGroupName(id);
    }
    
    // Cleanup

    setValidated(false);
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleFormClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={styleBox1}>
        <Fade in={open}>
          <Form
            className="seat-draw-wrapper grid-container"
            noValidate
            validated={validated}
          >
            <Form.Group
              className="mb-3 grid-1-9"
              controlId="formBasicSeatingName"
            >
              <Form.Label>Seating Group</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Seating Group"
                isInvalid={!!errors.groupName}
                onChange={(e) => setGroupName(e.target.value)}
                value={groupName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.groupName}
              </Form.Control.Feedback>
            </Form.Group>

            <SeatingGrid
              id={id}
              className="grid-container grid-1-9"
              handleSubmit={handleFormSubmit}
            ></SeatingGrid>
            <GroupSeatCounter></GroupSeatCounter>
          </Form>
        </Fade>
      </Box>
    </Modal>
  );
}



interface ISeatingPlanToolRoot {
  handleClose: () => void;
}

export default function SeatingPlanToolRoot({ handleClose }: ISeatingPlanToolRoot) {
  const [isToolOpen, setIsToolOpen] = useState(false);
  const groups = useSeatPlannerGroupingCache((state) => state.groups);
  const seatMapImage = useSeatPlannerGroupingCache((state) => state.activeImage);
  const setSeatMapImage = useSeatPlannerGroupingCache((state) => state.setActiveImage)
  function uploadSeatMapImage(file: string) {
    setSeatMapImage(file);
  }

  function deleteSeatMapImage() {
    setSeatMapImage(null);
  }

  // Clicking the submit button
  function handleClickSubmitGroupBtn() {
    setIsToolOpen(false);
  }

  // Clicking outside of modal or hitting esc
  function handleCloseTool() {
    setIsToolOpen(false);
  }

  function getCards() {
    const cards: JSX.Element[] = [];
    groups.forEach((value, key) => {
      cards.push(<Card id={key} key={key} />);
    });
    return cards;
  }
  return (
    <>
      <div
        className="grid-container p-4 p-md-2"
        style={{
          margin: "auto auto",
          height: "90vh",
          gridTemplateRows: "1fr 15fr",
        }}
      >
        <div className="grid-1-9">
          <h1 className="m-auto">GO NEXT SEATING PLAN TOOL</h1>
        </div>

        <div className="grid-1-9 flex gap-5 w-full flex-col flex-md-row">
          <div className="flex flex-column w-full" style={{minHeight: "50%"}}>
            <div className="m-0 h-full overflow-hidden">
              {seatMapImage === null && (
                <ImageDropZone
                  title="Add venue map"
                  addImageUrl={uploadSeatMapImage}
                />
              )}
              {seatMapImage !== null && (
                <div className="h-full w-full relative rounded-3xl overflow-hidden">
                  {/* <img
                    src={`${getRootURL()}images/get?id=${seatMapImage}`}
                    className="w-full h-full absolute blur-xl opacity-30"
                    alt=""
                  ></img> */}
                  <img
                    className="w-full h-full object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    src={`${getRootURL()}images/get?id=${seatMapImage}`}
                    alt="Thumbnail"
                  ></img>
                  <div
                    className="event-banner deletable"
                    onClick={deleteSeatMapImage}
                  ></div>
                </div>
              )}
            </div>
            <div className="flex mt-2 h-32 gap-2 item">
              <TotalAllocationCounter />

            </div>
          </div>
          <div className="overflow-y-scroll w-full">
            <ul className="w-full flex flex-column gap-2 h-full">
              {getCards()}
              <li className="w-full h-12 flex gap-4">
                <Button
                  variant="contained"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setIsToolOpen(true);
                  }}
                >
                  Add Group
                </Button>
              </li>
              <li className="w-full h-28 flex gap-2 mt-auto">
                <Button variant="contained" className="w-full rounded-xl" onClick={handleClose}>
                  <span className="font-bold text-center">Save and Close</span>
                </Button>

              </li>
            </ul>
            <SeatingPlanTool
              open={isToolOpen}
              handleSubmit={handleClickSubmitGroupBtn}
              handleClose={handleCloseTool}
            />
          </div>
        </div>
      </div>
    </>
  );
}
