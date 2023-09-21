import { useEffect } from "react";
import { useQuery } from "react-query";
import { getRootURL } from "../utils/utils";

interface IEventResponse {
  host_id: number;
  host_first_name: string;
  host_last_name: string;
  event_id: number;
  event_name: string;
  event_description: string;
  event_start: string;
  cost: number;
  location: string;
  longitude: number;
  latitude: number;
  is_seated: boolean;
  capacity: number;
  genre: string[];
  gallery: string[];
  sub_events: any[];
  thumbnail: string;
  venue_map: string;
}

export default function useEvent(id: number) {
  // Fetch data for event
  async function fetchEvent() {
    const resp = await fetch(`${getRootURL()}events/view?id=${id}`).then(
      (response) => {
        if (response.ok) {
          return response.json();
        }
         // Error Handling
        else if (response.status === 404) {
          return Promise.reject(
            `Error 404: Event with id '${id}' does not exist`
          );
        }
        else {
          return Promise.reject("Uncaught critical error: " + response.status);
        }
      }
    );

    return resp;
  }

  const { data: eventData, status: eventDataStatus } = useQuery<IEventResponse>(
    ["eventDetails", id],
    fetchEvent,
    {
      refetchOnWindowFocus: false,
    }
  );
  return { eventData, eventDataStatus, ...eventData };
}
