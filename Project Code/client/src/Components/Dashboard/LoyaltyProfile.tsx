import React from 'react';
import "../../css/LoyaltyProfile.scss";
import { useQuery } from 'react-query';
import { getRootURL } from '../../utils/utils'
import { LinearProgress, Card, CardContent, CardHeader, Collapse, IconButton, Container } from '@mui/material';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function LoyaltyProfile() {

  const [points, setPoints] = React.useState(0)
  const [tier, setTier] = React.useState('none')
  const [openFaq1, setOpenFaq1] = React.useState(false)
  const [openFaq2, setOpenFaq2] = React.useState(false)
  const [openFaq3, setOpenFaq3] = React.useState(false)

  // calculates the loyalty tier of the user
  function calculateLoyaltyTier() {

    if (points < 250) {
      return 'bronze'
    } else if (points < 750) {
      return 'silver'
    } else if (points < 2000) {
      return 'gold'
    } else if (points > 2000) {
      return 'platinum'
    } else {
      return 'none'
    }

  }

  // formats progress bar for loyalty tier
  function progressBar() {

    if (tier === 'bronze') {

      return <LinearProgress
        variant='determinate'
        value={(points / 250) * 100}
        sx={{
          radius: '16px', width: "100%", height: "10px", backgroundColor: '#D7D7D7',
          "& .MuiLinearProgress-bar": {
            backgroundColor: '#967444',
          }
        }}
      />
    } else if (tier === 'silver') {
      return <LinearProgress
        variant='determinate'
        value={((points - 250) / (750 - 250)) * 100}
        sx={{
          radius: '16px', width: "100%", height: "10px", backgroundColor: '#D7D7D7',
          "& .MuiLinearProgress-bar": {
            backgroundColor: 'gray',
          }
        }}
      />
    } else if (tier === 'gold') {

      return <LinearProgress
        variant='determinate'
        value={((points - 750) / (2000 - 750)) * 100}
        sx={{
          radius: '16px', width: "100%", height: "10px", backgroundColor: '#D7D7D7',
          "& .MuiLinearProgress-bar": {
            backgroundColor: '#E6C700',
          }
        }}
      />
    } else if (tier === 'platinum') {
      return <LinearProgress
        variant='determinate'
        value={100}
        sx={{
          radius: '16px', width: "100%", height: "10px", backgroundColor: '#D7D7D7',
          "& .MuiLinearProgress-bar": {
            backgroundColor: '#00E1AB',
          }
        }}
      />
    } else {
      return <LinearProgress
        variant='determinate'
        value={0}
        sx={{
          radius: '16px', width: "100%", height: "10px", backgroundColor: '#D7D7D7',
          "& .MuiLinearProgress-bar": {
            backgroundColor: '#D7D7D7',
          }
        }}
      />
    }

  }

  // gets user information from database
  const getUserInfo = async () => {

    try {

      const response = (await fetch(`${getRootURL()}user/getpoints/?token=${localStorage.getItem('token')}`))
      return response.json()

    } catch (err) {
      console.log(err);
    }

  }

  const { data, status } = useQuery("userDetails", getUserInfo);

  React.useEffect(() => {
    if (status === "success") {
      setPoints(parseInt(data.points))

    }

    setTier(calculateLoyaltyTier())

  }, [data, points]);


  return <>

    <div className='background'>
      <div className='custom-container'>

        <h5> Points </h5>
        <p className='pointCount'> {points}</p>
        <h3> {tier[0].toUpperCase() + tier.substring(1)} Tier</h3>
        <div className='progressContainer'>
          <div className='progressBar'> {progressBar()} </div>
        </div>


        <div className='tier-container'>

          <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: '10px', minWidth: 230, minHeight: 200, background: '#967444' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className='tier-text'>
                <h2 > Bronze Tier </h2>
                <p > 0 - 249 points </p>
              </div>

              <div className='perks'>

                <p> No discounts </p>

              </div>
            </CardContent>
          </Card>

          <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '10px', minWidth: 230, minHeight: 200, background: 'gray' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className='tier-text'>
                <h2 > Silver Tier </h2>
                <p > 250 - 749 points </p>
              </div>

              <div className='perks'>

                <p> 5% off all tickets </p>

              </div>
            </CardContent>
          </Card>

          <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '10px', minWidth: 230, minHeight: 200, background: '#E6C700' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className='tier-text'>
                <h2 > Gold Tier </h2>
                <p > 750 - 1999 points </p>
              </div>

              <div className='perks'>

                <p> 10% off all tickets </p>

              </div>
            </CardContent>
          </Card>

          <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: '10px', minWidth: 230, minHeight: 200, background: '#00E1AB' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className='tier-text'>
                <h2 > Platinum Tier </h2>
                <p > 2000+ points </p>
              </div>

              <div className='perks'>

                <p> 15% off all tickets </p>

              </div>
            </CardContent>
          </Card>

        </div>
        <div className='faq'>
          <Card sx={{ backgroundColor: '#ff1f48', minWidth: "100%", marginBottom: '10px' }}>
            <CardHeader
              title="How do I earn points?"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: '#ff9fb1',
                  transition: '0.3s',
                  cursor: 'pointer'
                }
              }}
              onClick={() => setOpenFaq1(!openFaq1)}
              action={
                <IconButton
                  onClick={() => setOpenFaq1(!openFaq1)}
                  aria-label="expand"
                  size="small"
                >
                  {openFaq1 ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              }
            >
            </CardHeader>
            <div style={{ backgroundColor: 'white' }}>
              <Collapse in={openFaq1} timeout="auto" unmountOnExit>
                <CardContent>
                  <Container sx={{ height: 36, lineHeight: 2 }}>Every dollar spent on 'GoNext!' (not including fees) earns you 1 point!</Container>
                </CardContent>
              </Collapse>
            </div>
          </Card>

          <Card sx={{ backgroundColor: '#ff1f48', minWidth: "100%", marginBottom: '10px' }}>
            <CardHeader
              title="Do my points expire?"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: '#ff9fb1',
                  transition: '0.3s',
                  cursor: 'pointer'
                }
              }}
              onClick={() => setOpenFaq2(!openFaq2)}
              action={
                <IconButton
                  onClick={() => setOpenFaq2(!openFaq2)}
                  aria-label="expand"
                  size="small"
                >
                  {openFaq2 ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              }
            >
            </CardHeader>
            <div style={{ backgroundColor: 'white' }}>
              <Collapse in={openFaq2} timeout="auto" unmountOnExit>
                <CardContent>
                  <Container sx={{ height: 36, lineHeight: 2 }}>No! Your points never expire, so enjoy your benefits indefinitely!</Container>
                </CardContent>
              </Collapse>
            </div>
          </Card>

          <Card sx={{ backgroundColor: '#ff1f48', minWidth: "100%", marginBottom: '10px' }}>
            <CardHeader
              title="Do I lose my points if I refund tickets?"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: '#ff9fb1',
                  transition: '0.3s',
                  cursor: 'pointer'
                }
              }}
              onClick={() => setOpenFaq3(!openFaq3)}
              action={
                <IconButton
                  onClick={() => setOpenFaq3(!openFaq3)}
                  aria-label="expand"
                  size="small"
                >
                  {openFaq3 ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              }
            >
            </CardHeader>
            <div style={{ backgroundColor: 'white' }}>
              <Collapse in={openFaq3} timeout="auto" unmountOnExit>
                <CardContent>
                  <Container sx={{ height: 36, lineHeight: 2 }}>Unfortunately you will lose any points accrued from tickets that you refund. </Container>
                </CardContent>
              </Collapse>
            </div>
          </Card>
        </div>

      </div>
    </div>
  </>
}

export default LoyaltyProfile