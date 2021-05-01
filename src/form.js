import React, { useRef, useEffect, useState } from "react";
import Select from "react-select";
import Toggle from "react-toggle";
import { Form, Field } from "react-final-form";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import styled from "styled-components";

// const WhiteBorderTextField = styled(TextField)`
//   & label.Mui-focused {
//     color: white;
//   }
//   & .MuiOutlinedInput-root {
//     &.Mui-focused fieldset {
//       border-color: white;
//       color: white;
//     }
//   }
// `;

const CssTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "white",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "white",
    },
    "& .MuiInputBase-root": {
      color: "white",
    },
    "& .MuiOutlinedInput-root": {
      color: "white",
      "& fieldset": {
        borderColor: "white",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
    "& .MuiFormLabel-root": {
      color: "white",
    },
  },
})(TextField);
export const FactoryForm = ({
  factoryObj,
  handleChange,
  handleSubscribeChange,
  handleAllPointsChange,
  handleDistanceChange,
  handleResetPoints,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [shouldSubscribe, setShouldSubscribe] = useState(false);
  const [shouldShowAllPoints, setShouldShowAllPoints] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const newOptions = [];
    if (factoryObj) {
      for (let factoryId of Object.keys(factoryObj)) {
        newOptions.push({
          value: factoryId,
          label: factoryObj[factoryId].name,
        });
      }
      setOptions(newOptions);
    }
  }, [factoryObj]);

  const handleChangeInternal = (selectedOption) => {
    setSelectedOption(selectedOption);
    handleChange(factoryObj[selectedOption.value]);
  };

  const handleSubscribeChangeInternal = (event) => {
    setShouldSubscribe(event.target.checked);
    handleSubscribeChange(event.target.checked);
  };

  const handleAllPointsChangeInternal = (event) => {
    setShouldShowAllPoints(event.target.checked);
    handleAllPointsChange(event.target.checked);
  };

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: 250,
    }),
  };

  // console.log("shouldSubscribe:: ", shouldSubscribe);
  return (
    <>
      <Select
        styles={customStyles}
        value={selectedOption}
        onChange={handleChangeInternal}
        options={options}
      />
      <div style={{ margin: 5, padding: 2 }}>
        <Toggle
          id="subscribe-toggle"
          defaultChecked={shouldSubscribe}
          onChange={handleSubscribeChangeInternal}
        />
        <label htmlFor="cheese-status">Inside points</label>
      </div>
      <div style={{ margin: 5, padding: 2 }}>
        <Toggle
          id="all-points-toggle"
          defaultChecked={shouldShowAllPoints}
          onChange={handleAllPointsChangeInternal}
        />
        <label htmlFor="cheese-status">All Points</label>
      </div>
      <div>
        <CssTextField
          type="number"
          label="Distance"
          id="outlined-size-normal"
          defaultValue="Normal"
          variant="outlined"
          onChange={(event) => setDistance(parseInt(event.target.value))}
        />
        <Button
          variant="contained"
          style={{ marginLeft: 10 }}
          onClick={() => handleDistanceChange(distance)}
        >
          Apply
        </Button>
      </div>
      <div style={{ margin: 5, padding: 2 }}>
        <Button
          variant="contained"
          style={{ marginLeft: 10 }}
          onClick={() => handleResetPoints()}
        >
          clear all points
        </Button>
      </div>
    </>
  );
};
