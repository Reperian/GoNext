import { Button, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { Col, Form } from "react-bootstrap";

interface activity {
  name: string
  time: string
}

interface props {
  activities: Array<activity>
  setActivities: Function
}

function EventActivities({...props}: props) {
  // Add blank activity template
  function addActivity() {
    const activity = {
      name: "",
      time: "",
    }

    props.setActivities([...props.activities, activity])
  }

  function changeName(name: string, index: number) {
    props.activities[index].name = name;
  }

  function changeTime(time: string, index: number) {
    props.activities[index].time = time;
  }

  function deleteActivity(index: number) {
    props.setActivities([
      ...props.activities.slice(0, index),
      ...props.activities.slice(index + 1)
    ]);
  }

  return <>
    <div className="CE-AddActivities">
    {
      props.activities.map((activity: any, index: number) => {
        return (
          <div key={index} className="CE-Activity">
            <Form.Group as={Col} controlId="formEventDate">
              <p>Activity {index + 1}</p>
              <Form.Control
                required
                type='text'
                defaultValue={activity.name}
                onChange={(e) => changeName(e.target.value, index)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a name.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} controlId="formEventTime">
              <p>Time</p>
              <Form.Control
                required
                className="CE-Time"
                type='time'
                defaultValue={activity.time}
                onChange={(e) => changeTime(e.target.value, index)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a time.
              </Form.Control.Feedback>
            </Form.Group>
            <IconButton 
              className="CE-deleteActivity" 
              aria-label="delete"
              onClick={() => deleteActivity(index)}>
              <DeleteIcon />
            </IconButton>
          </div>
        )
      })
    }
    </div>

    <div className="CE-seatingbutton">
        <Button 
          variant="contained"
          size="large"
          sx={{backgroundColor: "var(--primary)", '&:hover': {backgroundColor: "var(--primary)"}}}
          onClick={() => addActivity()}>
          Add Activity
        </Button>
      </div>
  </>
}

export default EventActivities;