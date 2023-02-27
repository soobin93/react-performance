// Starting point for the Recoil Extra Credit
// 💯 use recoil (exercise)
// http://localhost:3000/isolated/exercise/06.extra-4.js

import React, { createContext, useContext, useReducer } from 'react';
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
} from '../utils';

import { RecoilRoot, useRecoilState, useRecoilCallback, atomFamily } from 'recoil';

const AppStateContext = createContext()

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
);

const cellAtoms = atomFamily({
  key: 'cells',
  default: ({ row, column }) => initialGrid[row][column]
});

const useUpdateGrid = () => {
  return useRecoilCallback(({ set }) => ({ rows, columns }) => {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        if (Math.random() > 0.7) {
          set(cellAtoms({ row, column }), Math.random() * 100);
        }
      }
    }
  });
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return {...state, dogName: action.dogName}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    dogName: '',
  });
  const value = [state, dispatch];
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppProvider');
  }
  return context;
};

const Grid = () => {
  const [rows, setRows] = useDebouncedState(50);
  const [columns, setColumns] = useDebouncedState(50);

  const updateGrid = useUpdateGrid();

  return (
    <AppGrid
      onUpdateGrid={() => updateGrid({ rows, columns })}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  );
};

const Cell = ({ row, column }) => {
  const [cell, setCell] = useRecoilState(cellAtoms({ row, column }));
  const handleClick = () => setCell(Math.random() * 100);

  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
};

const DogNameInput = () => {
  const [state, dispatch] = useAppState()
  const {dogName} = state

  const handleChange = (event) => {
    const newDogName = event.target.value;
    dispatch({ type: 'TYPED_IN_DOG_INPUT', dogName: newDogName });
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={dogName}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {dogName ? (
        <div>
          <strong>{dogName}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  );
};

const App = () => {
  const forceRerender = useForceRerender();
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <RecoilRoot>
        <AppProvider>
          <div>
            <DogNameInput />
            <Grid />
          </div>
        </AppProvider>
      </RecoilRoot>
    </div>
  );
};

export default App;

/*
eslint
  no-func-assign: 0,
*/
