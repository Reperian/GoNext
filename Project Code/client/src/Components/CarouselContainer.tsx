
import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useQuery } from 'react-query';
import '../css/Main.scss';
import { getRootURL } from '../utils/utils';
import CarouselItem from './CarouselItem';

function CarouselContainer() {
  
  const getEvents = async () => {
    const resp = await fetch(`${getRootURL()}events/upcoming/`)
    return resp.json();
  }
  const {data, status, refetch } = useQuery("carousel", getEvents);

  React.useEffect(() => {
    refetch();
  }, [data])
  
  return <>
    {
      (status === "success") &&
      <Carousel fade className='main-carousel'>
        <Carousel.Item>
          <CarouselItem id={data[0]}/>
        </Carousel.Item>
        <Carousel.Item>
          <CarouselItem id={data[1]}/>
        </Carousel.Item>
        <Carousel.Item>
          <CarouselItem id={data[2]}/>
        </Carousel.Item>
      </Carousel>
    }
  </>
}

export default CarouselContainer;