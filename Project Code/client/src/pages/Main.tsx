import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import CarouselContainer from '../Components/CarouselContainer';
import '../css/Main.scss';
import Footer from '../Components/Footer';
import CategoryChips from '../Components/CreateEvent/CategoryChips';
import CardGridContainer from '../Components/CardGridContainer';
import { getRootURL } from '../utils/utils';

function Main() {
  const [categories, setCategories] = React.useState([]);
  const [latitude, setLatitude] = React.useState(-33.9173);
  const [longitude, setLongitude] = React.useState(151.2313);
  async function fetchUpcomingEvents() {
    const resp = await fetch(`${getRootURL()}events/upcoming/`)
    return resp.json();
  }
  async function fetchEventsNearMe() {
    navigator.geolocation.getCurrentPosition(showPosition);

  function showPosition(position: any) {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
  }
    const resp = await fetch(`${getRootURL()}eventsnearuser/?latitude=${latitude}&longitude=${longitude}&radius=200`);
    return resp.json();
  }

  async function fetchRecommendedEvents() {
    const resp = await fetch(`${getRootURL()}user/recevents?token=${localStorage.getItem("token")}`);
    return resp.json();
  }
  async function fetchFilteredEvents() {
    let param = ''
    for (let i = 0; i < categories.length; i++) {
      if (i !== categories.length - 1) {
        param += `${categories[i]},`
      }
      else {
        param += `${categories[i]}`
      }
    }
    const resp = await fetch(`${getRootURL()}events/filtergenre?categories=${param}`)
    // console.log(resp.json());
    return resp.json();
  } 

  return <>
    <NavBarGuest />
    <div className='main-container grid-container lr-padded-1'>
      <CarouselContainer />
      <h2>Events Recommended For You</h2>
      {
        (localStorage.getItem("token") != null) ?
        <CardGridContainer id='__EVENTS_RECOMMENDED' queryFunction={fetchRecommendedEvents} />
        : <h4 style={{color: "gray"}}>Sign in to personalise your recommendations</h4>

      }
      <h2>Events Near You</h2>
      <CardGridContainer id='__EVENTS_NEAR_ME' queryFunction={fetchEventsNearMe} />
      <h2>Upcoming Events</h2>
      <CardGridContainer id='__MAIN_PAGE_UPCOMING' queryFunction={fetchUpcomingEvents} />
      <h2 style={{marginTop: "40px"}} id="filter">Filter By Categories</h2>
      <CategoryChips selectedChip={categories} setSelectedChip={setCategories}/>
      {
        (categories.length !== 0) 
        ? <h2>Filtered Events</h2>
        : <h2>All Events</h2>
      }
      <CardGridContainer id='__MAIN_PAGE_INFINITE_SCROLL' queryFunction={fetchFilteredEvents} dependancies={categories} infiniteScroll={true}/>
    </div>
    

    <Footer></Footer>
  </>
}

export default Main;