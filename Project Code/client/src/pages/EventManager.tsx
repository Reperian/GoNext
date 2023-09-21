import NavbarGuest from "../Components/NavbarGuest";
import { SyntheticEvent, useEffect, useState } from 'react';
import '../css/Dashboard.scss';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Tab } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import EditEvent from "./EditEvent";
import Footer from "../Components/Footer";
import EventOverview from "../Components/EventManager/EventOverview";
import SendMessage from "../Components/EventManager/SendMessage";
import Button from "react-bootstrap/esm/Button";
import restAPI from '../http-common';


interface IEventManagerProps {
  tab: string;
}

export default function EventManager({ tab }: IEventManagerProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState(tab);
  const [params] = useSearchParams();
  const id = Number(params.get("id"));


  // Handles changing of tabs
  const handleChange = (event: SyntheticEvent, newValue: string) => {
    navigate(`/Host/manage/${newValue}?id=${id}`);
    setValue(newValue);
  }

  // deletes event from database
  async function cancelEvent() {
    try {
      await restAPI.delete(`/user/hostingevents/cancel?token=${localStorage.getItem("token")}&event_id=${id}`)
      alert("Event has been cancelled")
      navigate("/")

    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => {
    console.log(params);

  }, [params])

  return (<>
    <NavbarGuest />
    <div className='h-full w-full'>
      <div className='tabs-container'>
        <h1>
          Event Manager
        </h1>
      </div>
      <Box className="w-full h-full">
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              arial-label='Tabs'
              onChange={handleChange}
              centered
            >
              <Tab label="Event Overview" value='overview' />
              <Tab label="Broadcast" value='broadcast' />
              <Tab label="Edit Event" value='edit' />
              <Tab label="Cancel Event" value='cancel' />
            </TabList>
          </Box>
          <TabPanel value='edit'>
            <EditEvent />
          </TabPanel>
          <TabPanel value='cancel'>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "20px"}}>
              <h4> Are you sure you want to cancel this event? </h4>
              <Button className="button" variant="" size="lg" type="button" onClick={cancelEvent}>
                Confirm Cancellation
              </Button>
            </div>

          </TabPanel>
          <TabPanel value='tickets'>
          </TabPanel>
          <TabPanel value='broadcast'>
            <SendMessage />
          </TabPanel>
          <TabPanel value='overview'>
            <EventOverview id={id} />
          </TabPanel>
        </TabContext>
      </Box>

    </div>
    <Footer />
  </>)
}