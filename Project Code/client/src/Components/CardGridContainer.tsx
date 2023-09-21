import EventCard from "./EventCard";
import "../css/CardGridContainer.scss";
import { QueryFunction, useQuery } from "react-query";
import { useEffect, useRef, useState } from "react";
import EventCardSkeleton from "./EventCardSkeleton";
// import { Button } from "react-bootstrap";
import Button from '@mui/material/Button';

interface IProps {
  queryFunction: QueryFunction<any, any>;
  id: string | any[];
  infiniteScroll?: boolean;
  initialRows?: number;
  loadMore?: boolean;
  rowsPerLoad?: number;
  dependancies?: any[]; 
}
const __MEDIA_WIDTHS = {large: 1250, medium: 850, small:600}

export default function CardGridContainer({
  queryFunction,
  id,
  rowsPerLoad = 3,
  loadMore = false,
  initialRows = 1,
  infiniteScroll = false,
  dependancies = []
}: IProps) {
  const [cards, setCards] = useState([]);
  const cardsArrIndex = useRef(0);
  const loadedAdditional = useRef(false);
  const shownAllCards = useRef(false);
  const [skeletons ] = useState(new Array(initialRows * calculateCardsPerRow()).fill(0));
  const { data, status, refetch } = useQuery<number[]>(id, queryFunction, {
    refetchOnWindowFocus: false,
  });
  const containerRef = useRef<HTMLDivElement>();

  // Pseudo media query hack
  function calculateCardsPerRow() {
    const width = window.innerWidth
    if (width > __MEDIA_WIDTHS.large) {
      return 4;
    }
    else if (width > __MEDIA_WIDTHS.medium) {
      return 3;
    }
    else if (width > __MEDIA_WIDTHS.small) {
      return 4;
    }
    else {
      return 3;
    }
  }
  // Fetch all cards on mount
  useEffect(()=>{
    refetch()
    setCards([]);
    cardsArrIndex.current = 0;
    loadedAdditional.current =false ;
    shownAllCards.current = false;
  }, [dependancies.length, refetch])
  
  // Continously load cards until no more ids left
  function loadMoreCards(e: any) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!data || shownAllCards.current) return;
    if (!loadedAdditional.current) {
      loadedAdditional.current = true;
    }
    // Calculate number of cards to show
    const rowsToLoad = calculateCardsPerRow() * rowsPerLoad;
    // Continously set cards to be displayed
    setCards((cur)=>[...cur,...data.slice(cardsArrIndex.current, cardsArrIndex.current + rowsToLoad)])
    cardsArrIndex.current += rowsToLoad
    shownAllCards.current = cardsArrIndex.current > data.length
  }
  useEffect(() => {
    // Scroll handler that auto calls load more when the bottom of contain passes threshold on page
    function handleScroll(e: any) {
      containerRef.current.getClientRects()
      if (containerRef.current.getClientRects().item(0).bottom - window.innerHeight < -200) {
        loadMoreCards(e)
      }
    }
    // Resize handler that prevents the card from overflowing into new grid row
    function handleResize() {
      if (loadedAdditional.current) return;
      calculateCardsPerRow()
      cardsArrIndex.current = calculateCardsPerRow() * initialRows
      setCards(()=>data.slice(0, cardsArrIndex.current))
    }

    if (!data) return;
    const controller = new AbortController()
    window.addEventListener('resize', handleResize, {signal: controller.signal})
    if (infiniteScroll) window.addEventListener('scroll', handleScroll, {signal: controller.signal})
    cardsArrIndex.current = calculateCardsPerRow() * initialRows
    setCards(()=>data.slice(0, cardsArrIndex.current))
    return () => {
      controller.abort()
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, initialRows, infiniteScroll])

  return (
    <>
      <div className="grid-card-container grid-container grid-1-9 z-0 relative" ref={containerRef}>
        {status !== "success" &&
          skeletons.map((id: number, index: number) => (
            <EventCardSkeleton key={index} />
          ))}
        {status === "success" &&
          cards.map((id: number, index: number) => (
            <EventCard id={id} key={index} />
          ))}

        {!infiniteScroll && !shownAllCards.current && <div className="grid-card-button-wrapper">
          <Button variant="contained" sx={{backgroundColor: "var(--accent)", '&:hover': {backgroundColor: "var(--accent)"}}} onClick={loadMoreCards}>Load More</Button>
        </div>}
      </div>
    </>
  );
}
