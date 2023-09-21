import { Chip } from "@mui/material";
import React from "react";

interface ChipData {
  key: number;
  label: string;
  variant: string;
  sx: any;
}

interface props {
  selectedChip: Array<any>;
  setSelectedChip: Function;
}

function CategoryChips({ ...props }: props) {
  const [selected, setSelected] = React.useState([]);
  const [chipData, setChipData] = React.useState<ChipData[]>([
    { key: 0, label: "Music", variant: "outlined", sx: "" },
    { key: 1, label: "Food", variant: "outlined", sx: "" },
    { key: 2, label: "Sports", variant: "outlined", sx: "" },
    { key: 3, label: "Drinks", variant: "outlined", sx: "" },
    { key: 4, label: "Fashion", variant: "outlined", sx: "" },
    { key: 5, label: "Games", variant: "outlined", sx: "" },
    { key: 6, label: "Media", variant: "outlined", sx: "" },
    { key: 7, label: "Art", variant: "outlined", sx: "" },
    { key: 8, label: "Science", variant: "outlined", sx: "" },
    { key: 9, label: "Community", variant: "outlined", sx: "" },
    { key: 10, label: "Conference", variant: "outlined", sx: "" },
    { key: 11, label: "Expo", variant: "outlined", sx: "" },
    { key: 12, label: "Festival", variant: "outlined", sx: "" },
    { key: 13, label: "Other", variant: "outlined", sx: "" },
  ]);

  // Loads all chips upon mount
  React.useEffect(() => {
    props.selectedChip.map((category: string, index: number) => {
      const result = chipData.filter((chip) => {
        return chip.label.toLowerCase() === category.toLowerCase();
      });
      if (!selected.includes(result[0])) {
        result[0].sx = { backgroundColor: "var(--primary)", color: "white" };
        result[0].variant = "";
        setSelected([...selected, result[0]]);
      }
    });
  }, [selected, props.selectedChip]);

  function addChip(chip: any) {
    // set style
    if (!selected.includes(chip)) {
      chip.sx = { backgroundColor: "var(--primary)", color: "white" };
      chip.variant = "";
      props.setSelectedChip([...props.selectedChip, chip.label]);
      setSelected([...selected, chip]);
    }
  }

  function removeChip(chip: any) {
    // remove styles
    chip.sx = "";
    chip.variant = "outlined";
    setSelected((chips: any[]) =>
      chips.filter((selectedChip) => selectedChip !== chip)
    );
    props.setSelectedChip((chips: any[]) =>
      chips.filter(
        (selectedChip) => selectedChip.toLowerCase() !== chip.label.toLowerCase()
      )
    );
  }

  return (
    <>
      <div className="CE-selectedchips">
        {selected != null &&
          selected.map((data: any, index: number) => {
            return (
              <Chip
                key={data.key}
                label={data.label}
                variant={data.variant}
                sx={data.sx}
                onDelete={() => removeChip(data)}
              />
            );
          })}
      </div>
      <div className="CE-chips">
        {chipData.map((data: any) => {
          return (
            <Chip
              clickable
              key={data.key}
              label={data.label}
              variant={data.variant}
              sx={data.sx}
              onClick={() => addChip(data)}
            />
          );
        })}
      </div>
    </>
  );
}

export default CategoryChips;
