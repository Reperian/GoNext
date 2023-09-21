import { QueryClient, QueryClientProvider } from 'react-query';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import './App.css';
import Main from './pages/Main';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent'
import EditProfile from './Components/Dashboard/EditProfile';
import Login from './pages/Login';
import Event from './pages/Event';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import EditEvent from './pages/EditEvent';
import HostProfile from './pages/HostProfile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AddReview from './pages/AddReview';
import EventReviews from './pages/EventReviews';
import EventManager from './pages/EventManager';
import SearchResults from './pages/SearchResults';
const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff1f48',
    },
  }
});


function App() {
  return (
    <QueryClientProvider  client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path='/CreateEvent' element={<CreateEvent />} />
            <Route path='/Event' element={<Event />} />
            <Route path='/Register' element={<Register />} />
            <Route path='/Login' element={<Login />} />
            <Route path='/EditProfile' element={<EditProfile />} />
            <Route path='/event/view' element={<Event />} />
            <Route path='/event/edit' element={<EditEvent />} />
            <Route path='/event/reviews' element={<EventReviews />} />
            <Route path='/ResetPassword' element={<ResetPassword />} />
            <Route path='/Dashboard/profile' element={<Dashboard tab="profile"/>} />
            <Route path='/Dashboard/payment' element={<Dashboard tab="payment"/>} />
            <Route path='/Dashboard/events' element={<Dashboard tab="events"/>} />
            <Route path='/Dashboard/tickets' element={<Dashboard tab="tickets"/>} />
            <Route path='/Dashboard/loyalty' element={<Dashboard tab="loyalty"/>} />
            <Route path='/Dashboard/reviews' element={<Dashboard tab="reviews"/>} />
            <Route path='/PaymentDetails' element={<Payment/>} />
            <Route path='/Host/manage/edit' element={<EventManager tab="edit"/>} />
            <Route path='/Host/manage/overview' element={<EventManager tab="overview"/>} />
            <Route path='/Host/manage/planning' element={<EventManager tab="planning"/>} />
            <Route path='/Host/manage/broadcast' element={<EventManager tab="broadcast"/>} />
            <Route path='/Host/manage/cancel' element={<EventManager tab="cancel"/>} />
            <Route path='/SearchResults' element={<SearchResults />} />
            <Route path='/host/view' element={<HostProfile tab="events"/>} />
            <Route path='/review/add' element={<AddReview />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
