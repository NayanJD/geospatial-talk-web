import React, { useRef, useEffect, useState } from "react";
import Select from "react-select";
import Toggle from "react-toggle";

export const FactoryForm = ({
  factoryObj,
  handleChange,
  handleSubscribeChange,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [shouldSubscribe, setShouldSubscribe] = useState(false);

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

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: 300,
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
          id="cheese-status"
          defaultChecked={shouldSubscribe}
          onChange={handleSubscribeChangeInternal}
        />
        <label htmlFor="cheese-status">Show only inside points</label>
      </div>
    </>
  );
};
