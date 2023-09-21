import axios from "axios";
import { getRootURL } from "./utils/utils";

export default axios.create({
  baseURL: getRootURL(),
  // headers: {
  //   "Content-type": "application/json",
  // },
});