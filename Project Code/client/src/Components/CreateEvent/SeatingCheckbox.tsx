import { Button, Checkbox } from "@mui/material";
import React from "react";
import { Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState } from "react";
import "../../css/SeatingPlanCreateModal.scss";
import SeatingPlanTool from "../SeatingPlan/SeatingPlanTool";


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface props {
  seated: boolean;
  setSeated: Function;
}




function SeatingCheckbox({ ...props }: props) {
  const [checked1, setChecked1] = React.useState(props.seated);
  const [checked2, setChecked2] = React.useState(true);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  React.useEffect(() => {
    setChecked1(props.seated);
  }, [props.seated]);

  function showCheckbox() {
    setChecked1(!checked1);
    setChecked2(true);
    props.setSeated(!props.seated);
  }

  function showButton() {
    setChecked2(!checked2);
  }

  return (
    <>
      <div className="CE-checkbox">
        <h4>Is your event a seated event?</h4>
        <Checkbox
          sx={{
            color: "var(--primary)",
            "&.Mui-checked": {
              color: "var(--primary)",
            },
          }}
          checked={checked1}
          onChange={() => showCheckbox()}
        />
      </div>
      {checked1 && (
        <div className="CE-checkbox">
          <h4>Will seating be managed at the venue?</h4>
          <Checkbox
            defaultChecked
            sx={{
              color: "var(--primary)",
              "&.Mui-checked": {
                color: "var(--primary)",
              },
            }}
            onChange={() => showButton()}
          />
        </div>
      )}
      {checked2 && (
        <div className="CE-seatingbutton">
          <Button
            disabled
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "var(--primary)",
              "&:hover": { backgroundColor: "var(--primary)" },
            }}
          >
            Use our seating manager!
          </Button>
        </div>
      )}
      {!checked2 && checked1 && (
        <div className="CE-seatingbutton">
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "var(--primary)",
              "&:hover": { backgroundColor: "var(--primary)" },
            }}
            onClick={() => setIsPlannerOpen(true)}
          >
            Use our seating manager!
          </Button>
        </div>
      )}

      <Dialog
        fullScreen
        open={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        TransitionComponent={Transition}
      >
        <SeatingPlanTool handleClose={() => setIsPlannerOpen(false)} />
      </Dialog>
    </>
  );
}

export default SeatingCheckbox;
