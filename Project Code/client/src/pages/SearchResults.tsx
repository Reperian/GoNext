import React from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import NavbarGuest from "../Components/NavbarGuest";
import SearchedEvents from "../Components/SearchedEvents";
import '../css/Dashboard.scss'
import { getRootURL } from "../utils/utils";

function SearchResults() {
  const [params] = useSearchParams();
  const searchInput = params.get("search");

  // Searches for events via backend
  async function searchEvents() {
    try {
      const response =  (await fetch(`${getRootURL()}searchforevent/?input_string=${searchInput}`))
      return response.json()
    } catch (err) {
      console.log(err); 
    }
  }
  const {data, status, refetch } = useQuery("SearchResults", searchEvents);

  React.useEffect(() => {
    refetch();
  }, [searchInput, data])
  

  return <>
    <NavbarGuest />
    <div className="flex-container">
      <h4 style={{marginTop: "20px"}}>Search Results</h4>
      {
        (status === "success") &&
        data.result.map((event: any, index: number) => {
          return (
            <SearchedEvents key={index} id={event}/>
          )
        })
      }
      {
        console.log(data)
      }
    </div>
  </>
}

export default SearchResults;