// React.memo for reducing unnecessary re-renders
// http://localhost:3000/isolated/exercise/03.js

import React, { memo, useEffect, useState } from 'react';
import { useCombobox } from '../use-combobox';
import { getItems } from '../workerized-filter-cities';
import { useAsync, useForceRerender } from '../utils';

const Menu = memo(({
  items,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  selectedItem,
}) => (
  <ul {...getMenuProps()}>
    {items.map((item, index) => (
      <ListItem
        key={item.id}
        getItemProps={getItemProps}
        item={item}
        index={index}
        isSelected={selectedItem?.id === item.id}
        isHighlighted={highlightedIndex === index}
      >
        {item.name}
      </ListItem>
    ))}
  </ul>
));

const ListItem = memo(({
  getItemProps,
  item,
  index,
  isSelected,
  isHighlighted,
  ...props
}) => (
  <li
    {...getItemProps({
      index,
      item,
      style: {
        fontWeight: isSelected ? 'bold' : 'normal',
        backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
      },
      ...props,
    })}
  />
));

const App = () => {
  const forceRerender = useForceRerender();
  const [inputValue, setInputValue] = useState('');

  const {data: allItems, run} = useAsync({data: [], status: 'pending'})

  useEffect(() => {
    run(getItems(inputValue))
  }, [inputValue, run]);

  const items = allItems.slice(0, 100);

  const {
    selectedItem,
    highlightedIndex,
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    selectItem,
  } = useCombobox({
    items,
    inputValue,
    onInputValueChange: ({inputValue: newValue}) => setInputValue(newValue),
    onSelectedItemChange: ({selectedItem}) =>
      alert(
        selectedItem
          ? `You selected ${selectedItem.name}`
          : 'Selection Cleared',
      ),
    itemToString: item => (item ? item.name : ''),
  });

  return (
    <div className="city-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <label {...getLabelProps()}>Find a city</label>
        <div {...getComboboxProps()}>
          <input {...getInputProps({type: 'text'})} />
          <button onClick={() => selectItem(null)} aria-label="toggle menu">
            &#10005;
          </button>
        </div>

        <Menu
          items={items}
          getMenuProps={getMenuProps}
          getItemProps={getItemProps}
          highlightedIndex={highlightedIndex}
          selectedItem={selectedItem}
        />
      </div>
    </div>
  );
};

export default App;

/*
eslint
  no-func-assign: 0,
*/
