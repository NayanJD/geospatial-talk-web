import React, { useRef, useEffect, useState } from "react";
import Select from "react-select";

export const FactoryForm = ({ factoryObj, handleChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);

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

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: 150,
    }),
  };

  return (
    <Select
      styles={customStyles}
      value={selectedOption}
      onChange={handleChangeInternal}
      options={options}
    />
  );
};
