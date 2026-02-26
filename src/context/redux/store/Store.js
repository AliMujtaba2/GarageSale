import {configureStore} from '@reduxjs/toolkit';
import ThemeReducer from '../slice/ThemeSlice';

const Store = configureStore({
    reducer: {
        theme: ThemeReducer,
    },
});

export default Store;