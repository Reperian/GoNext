// Heavily based of MUI example which is covered under MIT Licsence.
// https://mui.com/x/introduction/licensing/
// https://mui.com/material-ui/react-table/

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Input } from "@mui/material";
import restAPI from "../../http-common";
import { Fragment, useState } from "react";
import { getRootURL } from "../../utils/utils";
import { useQuery } from "react-query";
import { useEffect } from "react";

interface IBudgetAttribs {
  id: number;
  name: string;
  allocation: number;
  sub_budget: ISubBudgetAttribs[];
}

interface ISubBudgetAttribs {
  id: number;
  date: string;
  name: string;
  price: number;
}

function SubBudgetRow({
  id,
  parentID,
  date,
  name,
  price,
  editSubBudget,
  deleteSubBudget,
}: ISubBudgetAttribs & { editSubBudget: Function; deleteSubBudget: Function, parentID: number; }) {
  const [_date, setDate] = useState(date);
  const [_item, setItem] = useState(name);
  const [_price, setPrice] = useState(price);

  return (
    <TableRow>
      <TableCell component="th" scope="row" align="left">
        <Input
          disableUnderline={true}
          type="date"
          onChange={(e) => setDate(e.currentTarget.value)}
          inputProps={{
            maxLength: 13,
            step: "0.01",
            min: 0,
          }}
          value={_date}
          onBlur={() => {
            editSubBudget(id, parentID,_date, _item, _price);
          }}
        />
      </TableCell>
      <TableCell align="left">
        <Input
          placeholder="Item Name"
          disableUnderline={true}
          value={_item}
          onChange={(e) => setItem(e.currentTarget.value)}
          onBlur={()=>{editSubBudget(id, parentID, _date, _item, _price)}}
        />
      </TableCell>
      <TableCell align="right">
        <Input
          disableUnderline={true}
          onChange={(e) => setPrice(Number(e.currentTarget.value))}
          type="number"
          inputProps={{
            maxLength: 13,
            step: "0.01",
            min: 0,
          }}
          placeholder="Allocation ($)"
          value={_price}
          sx={{
            "& > input": { textAlign: "end" },
            width: "100px",
          }}
          onBlur={() => {
            editSubBudget(id, parentID, _date, _item, _price);
          }}
        />
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={() => deleteSubBudget(id, parentID)}>
          <DeleteOutlineIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

interface IBudgetProps {
  budget: IBudgetAttribs;
  deleteBudget: Function;
  editBudget: Function;
  addSubBudget: Function;
  editSubBudget: Function;
  deleteSubBudget: Function;
}

function Budget({
  budget,
  editBudget,
  deleteBudget,
  addSubBudget,
  editSubBudget,
  deleteSubBudget,
}: IBudgetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(budget.name);
  const [allocation, setAllocation] = useState(budget.allocation);
  // Calculates the total cost of all the sub budgets for a given budget
  function calcTotalCost() {
    let total = 0;
    for (let sub of budget.sub_budget) {
      total += sub.price;
    }
    return total
  }
  return (
    <Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Input
            placeholder="Budget Category"
            disableUnderline={true}
            value={name}
            onBlur={() => editBudget(budget.id, name, allocation)}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </TableCell>
        <TableCell align="right">
          <Input
            onBlur={() => editBudget(budget.id, name, allocation)}
            disableUnderline={true}
            type="number"
            inputProps={{
              maxLength: 13,
              step: "0.01",
              min: 0,
            }}
            onChange={(e) => setAllocation(Number(e.currentTarget.value))}
            value={allocation}
            placeholder="Allocation ($)"
            sx={{ "& > input": { textAlign: "end" }, width: "100px"}}
          />
        </TableCell>
        <TableCell align="right">{calcTotalCost()}</TableCell>
        <TableCell align="right">{budget.allocation - calcTotalCost()}</TableCell>
        <TableCell align="right">
          <IconButton size="small" onClick={() => deleteBudget(budget.id)}>
            <DeleteOutlineIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Purchases
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="left">Item</TableCell>
                    <TableCell align="right">Price ($)</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          addSubBudget(budget.id);
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!!budget.sub_budget &&
                    budget.sub_budget.map((subBudget) => (
                      <SubBudgetRow
                        id={subBudget.id}
                        parentID={budget.id}
                        date={subBudget.date}
                        name={subBudget.name}
                        price={subBudget.price}
                        deleteSubBudget={deleteSubBudget}
                        editSubBudget={editSubBudget}
                        key={subBudget.id}
                      ></SubBudgetRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default function CollapsibleTable({ eventID, setBudgets, budgets }: { eventID: number, setBudgets:React.Dispatch<React.SetStateAction<IBudgetAttribs[]>>, budgets:IBudgetAttribs[] }) {
  
  const { data, status } = useQuery(["budgets", eventID], getBudgets);


  // Makes sure to set correct data on component mount
  useEffect(() => {
    if (!!data) {
      setBudgets(data);
    }
  }, [data]);

  if (status !== "success") {
    return <h4>Loading...</h4>;
  }
  // Gets all the budgets for this table
  async function getBudgets() {
    const response = await fetch(
      `${getRootURL()}events/manage/budget/get?event_id=${eventID}`
    );
    return response.json();
  }

  // Adds a budget
  async function addBudget() {
    // Await for the id of budget
    const response = await restAPI.post("events/manage/budget/create", {
      event_id: eventID,
      budget_name: "",
      budget_allocation: 0,
    });

    const data: IBudgetAttribs = {
      id: response.data.result,
      name: "",
      allocation: 0,
      sub_budget: [],
    };
    // Refresh the stale data
    setBudgets((old) => [...old, data]);
  }
  // Edits a budget
  async function editBudget(id: number, name: string, allocation: number) {
    await restAPI.post("events/manage/budget/edit", {
      budget_id: id,
      budget_name: name,
      budget_allocation: allocation,
    });
    // Clone stale data
    const newData = [...budgets];
    // Finds the index where budget is updated
    const index = newData.findIndex((val) => val.id === id);
    // Sets the correct new data
    newData[index] = {
      id,
      name,
      allocation,
      sub_budget: newData[index].sub_budget,
    };
    setBudgets(newData);
  }

  // Deletes a budget
  async function deleteBudget(id: number) {
    await restAPI.delete(`events/manage/budget/delete?budget_id=${id}`);
    setBudgets((old) => [...old.filter((val) => val.id !== id)]);
  }

  async function addSubBudget(budgetID: number) {
    const date = new Date().toISOString().split("T")[0];
    // Await for the id of sub budget
    const response = await restAPI.post("events/manage/subbudget/create", {
      budget_id: budgetID,
      sub_budget_date: new Date().toISOString().split("T")[0],
      sub_budget_name: "",
      sub_budget_cost: 0,
    });

    const data: ISubBudgetAttribs = {
      id: response.data.result,
      name: "",
      date: date,
      price: 0,
    };
    // Add in sub budget
    const newData = [...budgets];
    console.log(newData);
    newData.find((item) => item.id === budgetID).sub_budget.push(data);

    setBudgets(newData);
  }


  async function editSubBudget(id: number, parentID: number, date:string, item: string, price: number) {
    await restAPI.post("events/manage/subbudget/edit", {
      sub_budget_id: id,
      sub_budget_date: date,
      sub_budget_name: item,
      sub_budget_cost: price,
    });

    // Clone stale data
    const newData = [...budgets];
    // Finds the index in parent where sub budget is updated
    const index = newData.findIndex((val) => val.id === parentID);
    // Updates stale data
    newData[index].sub_budget = newData[index].sub_budget.map((val) => {
      if (val.id !== id) {
        return val
      }
      return {
        id,
        date,
        name: item,
        price
      }
    })
    setBudgets(newData);
  }

  // Deletes A sub budget
  async function deleteSubBudget(id: number, parentID: number) {
    await restAPI.delete(`events/manage/subbudget/delete?sub_budget=${id}`);
    const newData = [...budgets];
    const index = newData.findIndex((val) => val.id === parentID);
    newData[index].sub_budget = newData[index].sub_budget.filter((val) => val.id !== id);
    setBudgets(newData);
  }

  return (
    <TableContainer
      sx={{
        "input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button":
          {
            WebkitAppearance: "none",
            margin: "0",
          },
        "input[type=number]": {
          MozAppearance: "textfield",
        },
      }}
      id="budget-table"
      component={Paper}
    >
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell sx={{ fontWeight: "600" }}>Category</TableCell>
            <TableCell sx={{ fontWeight: "600" }} align="right">
              Allocated ($)
            </TableCell>
            <TableCell sx={{ fontWeight: "600" }} align="right">
              Spent ($)
            </TableCell>
            <TableCell sx={{ fontWeight: "600" }} align="right">
              Remaining ($)
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => addBudget()}>
                <AddIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {budgets.map((budget) => (
            <Budget
              key={budget.id}
              budget={budget}
              deleteBudget={deleteBudget}
              editBudget={editBudget}
              addSubBudget={addSubBudget}
              editSubBudget={editSubBudget}
              deleteSubBudget={deleteSubBudget}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
