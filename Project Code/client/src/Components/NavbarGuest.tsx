import React from 'react';
import '../css/Navbar.scss';

import {
  Link,
  useNavigate,
} from 'react-router-dom';
import Logo from './Logo';
import { Button, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Search from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';

import { getRootURL } from '../utils/utils';
import { useQuery } from 'react-query';

function NavbarGuest() {
  const [authed, setAuthed] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const navigate = useNavigate();
  const [admin, setAdmin] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');

  // checks if user is an admin account
  const isAdmin = async () => {
    
    if (localStorage.getItem('token') !== null) {

      try {

        const response =  (await fetch(`${getRootURL()}isadmin/?token=${localStorage.getItem('token')}`))
        return response.json()
  
      } catch (err) {
        console.log(err); 
      }

    }
    
  }

  const {data, status } = useQuery("isAdmin", isAdmin);

  React.useEffect(() => {

    if (localStorage.getItem("token") != null) {
      setAuthed(true);

      if (status === 'success') {
        try {
          setAdmin(data.results)
        } catch {
          console.log("error"); 
        }
        
      }
        
    }
    else {
      setAuthed(false);
    }
  },[authed]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  // navigates to dashboard page
  function goDashboard(tab: string) {
    setAnchorEl(null);
    navigate(`/dashboard/${tab}`);
    window.scrollTo(0, 0);
  };

  // navigates to create event page
  function goCreateEvent() {
    setAnchorEl(null);
    navigate('/CreateEvent');
    window.scroll(0,0);
  }

  // logs the user out
  function logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setAuthed(false);
    navigate('/');
    window.location.reload();
    window.scroll(0, 0);
  }

  // navigates to search results page
  function search() {
    navigate(`/SearchResults/?search=${searchInput}`);
  }

  // navigates to search results page when user presses enter
  function onKeyPress(e: any) {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate(`/SearchResults/?search=${searchInput}`);
    }
  }

  // scrolls down to filter categories
  function scrollToFilter() {
    navigate("/");
    const rect = document.getElementById("filter").getBoundingClientRect();
    window.scroll(0, rect.top + window.pageYOffset - 80);
  }

  // changes navbar depending on if user is logged in or logged out
  let navRight;
  if (authed) {
    navRight = 
    <div className='navbar-right'>
        <Link className='navbar-right-create' to='/CreateEvent' onClick={() => goCreateEvent()}>Create an event</Link>
        <div className="navbar-profile">
          {admin ? 
            <Button
              id="basic-button"
              className="navbar-dropdown"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              startIcon={<SecurityIcon style={{color: '#ff1f48'}}/>}
              endIcon={<ArrowDropDownIcon/>}
              onClick={handleClick}>
              {localStorage.getItem("email")}
            </Button> 
            :
            <Button
              id="basic-button"
              className="navbar-dropdown"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              startIcon={<AccountCircleIcon />}
              endIcon={<ArrowDropDownIcon />}
              onClick={handleClick}>
              {localStorage.getItem("email")}
            </Button>
          }
          

          {/* Shows when screen size shrinks */}
          <Button
            id="basic-button"
            className="navbar-dropdown-hidden"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}>
            <AccountCircleIcon fontSize='large'/>
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <MenuItem style={{color: "var(--accent)"}} onClick={() => goCreateEvent()}>Create an Event</MenuItem>
            <MenuItem onClick={() => goDashboard("profile")}>Profile</MenuItem>
            <MenuItem onClick={() => goDashboard("payment")}>Payment Details</MenuItem>
            <MenuItem onClick={() => goDashboard("events")}>Manage Events</MenuItem>
            <MenuItem onClick={() => goDashboard("reviews")}>Customer Reviews</MenuItem>
            <MenuItem onClick={() => goDashboard("tickets")}>View Tickets</MenuItem>
            <MenuItem onClick={() => goDashboard("loyalty")}>Loyalty</MenuItem>
            <MenuItem style={{color: "red"}} onClick={() => logout()}>Logout</MenuItem>
          </Menu>
        </div>
        
    </div>
  }
  else {
    navRight =
    <div className='navbar-right'>
      <Link className='navbar-right-create' to='/CreateEvent' onClick={() => {window.scroll(0,0)}}>Create An Event</Link>
      <Link className='navbar-right-login' to='/Login'>Login</Link>
      <Link className='navbar-right-register' to='/Register'>Register</Link>
    </div>
  }

  return <>
    <nav className='navbar-main'>
      <div className='navbar-left'>
        <Link className='navbar-left-logo' to='/'><Logo /></Link>
        <TextField
          placeholder="Search for events"
          size="small"
          type="search"
          fullWidth
          sx={{
            maxWidth: "500px",
          }}
          InputProps={{
            endAdornment: 
              <InputAdornment 
                position="end">
                  <SearchIcon 
                    className="search-button"
                    onClick={() => {search()}}/>
              </InputAdornment>,
          }}
          onChange={(e) => {setSearchInput(e.target.value)}}
          onKeyPress={(e) => {onKeyPress(e)}}
        />
        <div className="filterButton">
          <Button style={{textTransform: "none", fontSize: "1rem"}} onClick={() => {scrollToFilter()}}>Filter by Categories</Button>
        </div>
      </div>
      {navRight}
    </nav>
  </>
}

export default NavbarGuest;