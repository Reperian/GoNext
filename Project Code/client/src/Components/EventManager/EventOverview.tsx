import "../../css/EventOverview.scss";
import useEvent from "../../hooks/useEvent";

import ListAltIcon from "@mui/icons-material/ListAlt";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import Budget from "./Budget";
import { useQuery } from "react-query";
import { getRootURL } from "../../utils/utils";
import { Chart } from "react-google-charts";
import { useState } from "react";
import dateFormat from "dateformat";
interface ISubBudgetAttribs {
  id: number;
  date: string;
  name: string;
  price: number;
}
interface IBudgetAttribs {
  id: number;
  name: string;
  allocation: number;
  sub_budget: ISubBudgetAttribs[];
}
const options = {
  title: "",
  pieHole: 0.4,
  is3D: false,
};

export default function EventOverview({ id }: { id: number }) {
  const { event_name, event_start, is_seated, cost, capacity, location } =
    useEvent(id);
  const [budgets, setBudgets] = useState<IBudgetAttribs[]>([]);
  async function getOccupiedSeats() {
    const resp = await fetch(
      `${getRootURL()}events/numticketsbooked?event_id=${id}`
    );
    return resp.json().then((val) => val.num_booked);
  }
  const { data: occupiedSeats } = useQuery(
    ["occupied", id],
    getOccupiedSeats
  );

  const attendanceData = [
    ["Seats Status", "Count"],
    ["Occupied", occupiedSeats],
    ["Vacant", capacity - occupiedSeats],
  ];

  function getBudgetGraphData() {
    let totalAllocation = 0;
    let totalSpent = 0
    function calcTotalCost(sub_budgets:any) {
      let total = 0;
      for (let sub of sub_budgets) {
        total += sub.price;
      }
      return total
    }

    const budgetGraph: any[] = [["Category", "Allocation"]]

    for (let budget of budgets) {
      totalAllocation += budget.allocation;

      let subBudgetCost = calcTotalCost(budget.sub_budget)
      totalSpent += subBudgetCost
      const item = [budget.name, Math.min(budget.allocation, subBudgetCost)]
      budgetGraph.push(item)
    }
    budgetGraph.push(["Remaining Balance", Math.max(totalAllocation - totalSpent, 0)])
    return budgetGraph
  }


  function getProfitGraphData() {
    let budgetAllocate = 0;
    for (let budget of budgets) {
      budgetAllocate += budget.allocation;
    }
    return [
      ["Seats Status", "Count"],
      ["Profits", occupiedSeats * cost],
      ["Budget", budgetAllocate],
      ["Potential Profit", (capacity - occupiedSeats) * cost],
    ];
  }

  return (
    <div className="grid-container">
      <div className="grid-1-9">
        <div className="overview-details-group-wrapper">
          <ul className="overview-details-group">
            <li className="overview-details overview-details-header">
              <ListAltIcon color="inherit" />
              <span>Details</span>
            </li>
            <li className="overview-details">
              <span className="flex w-100">Name</span>
              <span className="flex w-100 justify-end">{event_name}</span>
            </li>
            <li className="overview-details">
              <span className="flex w-100">Location</span>
              <span className="flex w-100 justify-end">{location}</span>
            </li>
            <li className="overview-details">
              <span className="flex w-100">Start Date</span>
              <span className="flex w-100 justify-end">{dateFormat(event_start, "h:MM TT")},{" "} {dateFormat(event_start, "mmmm d yyyy")}</span>
            </li>
          </ul>
          <ul className="overview-details-group">
            <li className="overview-details overview-details-header">
              <FormatListBulletedIcon color="inherit" />
              <span>More</span>
            </li>
            <li className="overview-details">
              <span className="flex w-100">Seated</span>
              <span className="flex w-100 justify-end">
                {is_seated ? "Yes" : "No"}
              </span>
            </li>
            <li className="overview-details">
              <span className="flex w-100">Ticket Price</span>
              <span className="flex w-100 justify-end">${cost}</span>
            </li>
            <li className="overview-details">
              <span className="flex w-100">Capacity</span>
              <span className="flex w-100 justify-end">{capacity}</span>
            </li>
          </ul>
        </div>
        <div
          style={{ border: "1px solid lightgray" }}
          className="w-full mt-4 flex justify-between p-2"
        >
          <div className="basic-graph">
            <div className="basic-graph-section flex flex-col">
              <h3>Attendance</h3>
              <div className="graph-wrapper">
                <Chart
                  chartType="PieChart"
                  data={attendanceData}
                  options={options}
                  className="basic-graph"
                />
              </div>
            </div>
            <div className="basic-graph-section flex flex-col">
              <h3>Profits</h3>
              <div className="graph-wrapper">
                <Chart
                  chartType="PieChart"
                  data={getProfitGraphData()}
                  options={options}
                  className="basic-graph"
                />
              </div>
            </div>
            <div className="basic-graph-section flex flex-col">
              <h3>Budgets</h3>
              <div className="graph-wrapper">
                <Chart
                  chartType="PieChart"
                  data={getBudgetGraphData()}
                  options={options}
                  className="basic-graph"
                />
              </div>
            </div>
          </div>
        </div>
        <h2 className="mt-8">Budgets</h2>
        <div className="w-full">
          <Budget eventID={id} budgets={budgets} setBudgets={setBudgets}></Budget>
        </div>
      </div>
    </div>
  );
}
