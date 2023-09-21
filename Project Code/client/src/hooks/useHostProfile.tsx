import { useEffect } from "react";
import { useQuery } from "react-query";
import { getRootURL } from "../utils/utils";

interface IHostResponse {
  email: string;
  first_name: string;
  last_name: string;
  avg_rating: number;
}

export default function useHostProfile(id: number) {
  // Fetch text data for event
  async function fetchHostProfile() {
    console.log(id)
    const resp = await fetch(`${getRootURL()}host/view?id=${id}`).then(
      (response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return Promise.reject(`Error 404: Host with id '${id}' does not exist`);
        } else {
          return Promise.reject("Uncaught critical error: " + response.status);
        }
      }
    );
      
    return resp;
  }

  const { data: hostData, status: hostDataStatus, refetch: refetchUserData } = useQuery<IHostResponse>(
    ["hostDetails", id],
    fetchHostProfile,
    {
      refetchOnWindowFocus: false
    });
  return { hostData, hostDataStatus, refetchUserData, ...hostData };
}
