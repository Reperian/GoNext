import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import EditProfile from '../Components/Dashboard/EditProfile';
import LoyaltyProfile from '../Components/Dashboard/LoyaltyProfile';
import '../css/Dashboard.scss';
import { useNavigate } from "react-router-dom";
import { getRootURL } from '../utils/utils';
import { useQuery } from 'react-query';

import { Box, Tab } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import ManageEvents from '../Components/Dashboard/ManageEvents';
import ManageTickets from '../Components/Dashboard/ManageTickets';
import ViewReviews from '../Components/Dashboard/ViewReviews';
import PaymentDetails from '../Components/Dashboard/PaymentDetails';

import SecurityIcon from '@mui/icons-material/Security';


interface IProps {
  tab?: string;
}

function Dashboard({ tab }: IProps) {

  const navigate = useNavigate();

  // states
  const [value, setValue] = React.useState(tab);
  const [admin, setAdmin] = React.useState(true);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(`/dashboard/${newValue}`);
    setValue(newValue);
  }

  // checks if user is an admin, used for admin specific formatting and functionality
  const isAdmin = async () => {

    try {

      const response = (await fetch(`${getRootURL()}isadmin/?token=${localStorage.getItem('token')}`))
      return response.json()

    } catch (err) {
      console.log(err);
    }

  }

  const { data, status } = useQuery("isAdmin", isAdmin);

  React.useEffect(() => {

    setValue(tab);

    if (status === "success") {
      setAdmin(data.results)

    }

  }, [tab]);

  return <>

    <NavBarGuest />
    <div className='background'>
      <div className='tabs-container'>
        {/* conditional styling for admins */}
        {admin ?
          <h1 style={{ display: 'flex', alignItems: 'center', color: '#ff1f48' }}>
            <SecurityIcon style={{ transform: 'scale(1.5)', color: '#ff1f48', marginRight: '15px' }} /> Admin Dashboard
          </h1>
          :
          <h1>
            Dashboard
          </h1>
        }


        <Box sx={{ width: '100%' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList
                arial-label='Tabs'
                onChange={handleChange}
                centered
              >
                <Tab label="Profile" value='profile' />
                <Tab label="Payment Details" value='payment' />
                <Tab label="Manage Events" value='events' />
                <Tab label="Customer Reviews" value='reviews' />
                <Tab label="View Tickets" value='tickets' />
                <Tab label="Loyalty Program" value='loyalty' />
              </TabList>
            </Box>
            <TabPanel value='profile'>
              <EditProfile />
            </TabPanel>
            <TabPanel value='payment'>
              <PaymentDetails />
            </TabPanel>
            <TabPanel value='events'>
              <ManageEvents isAdmin={admin} />
            </TabPanel>
            <TabPanel value='reviews'>
              <ViewReviews hostId={parseInt(localStorage.getItem("id"))} />
            </TabPanel>
            <TabPanel value='tickets'>
              <ManageTickets />
            </TabPanel>
            <TabPanel value='loyalty'>
              <LoyaltyProfile />
            </TabPanel>
          </TabContext>
        </Box>


      </div>
    </div>
  </>
}

export default Dashboard;