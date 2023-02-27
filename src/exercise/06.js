// Fix "perf death by a thousand cuts"
// http://localhost:3000/isolated/exercise/06.js

import React, { createContext, forwardRef, memo, useContext, useReducer } from 'react';
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils';

const AppStateContext = createContext();
const AppDispatchContext = createContext();
const DogContext = createContext();

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
);

const appReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_GRID_CELL': {
      return { ...state, grid: updateGridCellState(state.grid, action) };
    }
    case 'UPDATE_GRID': {
      return { ...state, grid: updateGridState(state.grid) };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

const dogReducer = (state, action) => {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return { ...state, dogName: action.dogName };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    grid: initialGrid,
  });

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

const DogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dogReducer, {
    dogName: '',
  });

  return (
    <DogContext.Provider value={[state, dispatch]}>
      {children}
    </DogContext.Provider>
  )
};

const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppProvider');
  }
  return context;
};

const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within the AppProvider');
  }
  return context;
};

const useDogState = () => {
  const context = useContext(DogContext);
  if (!context) {
    throw new Error('useDogState must be used within the DogProvider');
  }
  return context;
};

const Grid = memo(() => {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useDebouncedState(50);
  const [columns, setColumns] = useDebouncedState(50);
  const updateGridData = () => dispatch({ type: 'UPDATE_GRID' });
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  );
});

const withStateSlice = (Component, slice) => {
  const MemoComponent = memo(Component);

  const Wrapper = (props, ref) => {
    const state = useAppState();
    return <MemoComponent ref={ref} state={slice(state, props)} {...props} />
  };

  Wrapper.displayName = `withStateSlice(${Component.displayName || Component.name})`;
  return memo(forwardRef(Wrapper));
};

let Cell = ({ state: cell, row, column }) => {
  const dispatch = useAppDispatch();
  const handleClick = () => dispatch({ type: 'UPDATE_GRID_CELL', row, column });
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
  );
};

Cell = withStateSlice(Cell, (state, { row, column }) => state.grid[row][column]);

const DogNameInput = () => {
  const [state, dispatch] = useDogState();
  const { dogName } = state;

  const handleChange = (event) => {
    const newDogName = event.target.value;
    dispatch({ type: 'TYPED_IN_DOG_INPUT', dogName: newDogName });
  };

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
      <div>
        <DogProvider>
          <DogNameInput />
        </DogProvider>

        <AppProvider>
          <Grid />
        </AppProvider>
      </div>
    </div>
  );
};

export default App;

/*
eslint
  no-func-assign: 0,
*/
