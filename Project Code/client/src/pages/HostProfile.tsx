import { useSearchParams } from "react-router-dom";
import useHostProfile from "../hooks/useHostProfile";

import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import { useNavigate } from "react-router-dom";
import ViewEvents from '../Components/HostProfile/ViewEvents';

import '../css/HostProfile.scss';

import { Box, Tab, Rating } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import Reviews from "../Components/HostProfile/Reviews";

interface IProps {
    tab?: string;
}

export default function Event({ tab }: IProps) {

    // get user_id of host from parameters
    let [params] = useSearchParams();
    const id = Number(params.get("id"));

    const navigate = useNavigate();
    const [value, setValue] = React.useState('events');

    // handles tab selection
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    }

    const {
        hostDataStatus,
        email,
        first_name,
        last_name,
        avg_rating,
    } = useHostProfile(id);

    React.useEffect(() => {

        if (tab !== "") {
            setValue(tab);
        } else {
            setValue('events');
        }

    }, [tab]);

    return <>

        <NavBarGuest />
        <div className='background'>
            {(hostDataStatus === "success") &&
                <div className='tabs-container'>
                    {/* capitalising first name and last name */}
                    <h1>
                        {first_name[0].toUpperCase() + first_name.substring(1)} {last_name[0].toUpperCase() + last_name.substring(1)} 
                    </h1>
                    <p className='email'>
                        {email}
                    </p>
                    <div className='rating'>
                        {avg_rating !== null ?
                            <p style={{ fontWeight: "bold" }}> {avg_rating.toFixed(1)} </p> // rounding to 1 dp
                            :
                            <p> No reviews yet</p>
                        }
                        <Rating size="large" name="read-only" value={avg_rating} precision={0.1} readOnly />
                    </div>

                    <Box sx={{ width: '100%' }}>
                        <TabContext value={value}>
                            {/* tab controller */}
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList
                                    arial-label='Tabs'
                                    onChange={handleChange}
                                    centered
                                >
                                    <Tab label="Events" value='events' />
                                    <Tab label="Reviews" value='reviews' />
                                </TabList>
                            </Box>
                            <TabPanel value='events'>
                                <ViewEvents firstName={first_name} lastName={last_name} hostId={id} />
                            </TabPanel>
                            <TabPanel value='reviews'>
                                <Reviews firstName={first_name} lastName={last_name} hostId={id} />
                            </TabPanel>
                        </TabContext>
                    </Box>


                </div>
            }
        </div>
    </>
}