import {
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import ZoomOutOutlinedIcon from "@mui/icons-material/ZoomOutOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import PersonRemoveAltOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import "../../css/SeatingGrid.scss";

enum CELL {
  EMPTY,
  SEAT,
}

interface IProps {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleChangeOperation: (
    event: React.MouseEvent<HTMLElement>,
    value: CELL
  ) => void;
  handleClearBoard: () => void;
  handleSubmit: () => void; 
  operation: number;
}

export default function SeatingToolToolbar({
  operation,
  handleZoomIn,
  handleZoomOut,
  handleChangeOperation,
  handleClearBoard,
  handleSubmit
}: IProps ) {
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical"
  );

  useEffect(() => {
    const controller = new AbortController();
    setOrientation(window.innerWidth < 768 ? "horizontal" : "vertical");
    window.addEventListener(
      "resize",
      () => {
        setOrientation(window.innerWidth < 768 ? "horizontal" : "vertical");
      },
      { signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Toolbar
      disableGutters
      sx={{
        padding: "0 0.5rem 0 0.5rem",
      }}
      className="seating-plan-toolbar"
    >
      <ToggleButtonGroup
        orientation={orientation}
        size="large"
        value={operation}
        onChange={handleChangeOperation}
        exclusive={true}
        aria-label="Large sizes"
        className="btn-grp-sep"
      >
        <ToggleButton
          color="info"
          value={CELL.SEAT}
          key="addSeat"
          className="mui-toolbar-button"
        >
          <PersonAddAltOutlinedIcon />
        </ToggleButton>
        <ToggleButton
          color="info"
          value={CELL.EMPTY}
          key="removeSeat"
          className="mui-toolbar-button"
        >
          <PersonRemoveAltOutlinedIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <ButtonGroup orientation={orientation} className="btn-grp-sep">
        <Button
          variant="outlined"
          color="info"
          onClick={handleZoomIn}
          className="mui-toolbar-button"
        >
          <ZoomInOutlinedIcon />
        </Button>
        <Button
          variant="outlined"
          color="info"
          onClick={handleZoomOut}
          className="mui-toolbar-button"
        >
          <ZoomOutOutlinedIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup orientation={orientation} className="btn-grp-sep">
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearBoard}
          className="mui-toolbar-button"
        >
          <DeleteForeverOutlinedIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup orientation={orientation} className="btn-grp-sep">
        <Button
          variant="contained"
          size="medium"
          className="mui-toolbar-button"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </ButtonGroup>
    </Toolbar>
  );
}
