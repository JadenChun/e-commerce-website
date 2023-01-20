import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

const LOGIN_URL = 'http://localhost:8800/login';

const getLoginLocalStorage = () => {
    let item = localStorage.getItem('isLoggedIn')
    if (item) {
        return JSON.parse(localStorage.getItem('isLoggedIn'))
    } else {
        return null;
    }
}

const getUserLocalStorage = () => {
    let item = localStorage.getItem('userDetails')
    if (item) {
        return JSON.parse(localStorage.getItem('userDetails'))
    } else {
        return {name:''};
    }
}

const initialState = {
    showPopUp: false,
    isLoggedIn: getLoginLocalStorage(),
    showWarning: false,
    userDetails: getUserLocalStorage(),
}

export const loginPost = createAsyncThunk('login',async (loginCredential)=>{
    try{
        const response = await axios.post(LOGIN_URL,{
            username: loginCredential.username,
            password: loginCredential.password,
        })
        return response.data;
    }catch (err) {
        return err.message;
    }
})

export const checkUsernamePost = createAsyncThunk('checkUsername',async(username)=>{
    try{
        const response = await axios.post('http://localhost:8800/checkUsername',{
            username : username,
        })
        return response.data;
    }catch (err) {
        return err.message;
    }
})

export const registerPost = createAsyncThunk('register',async(registrationData)=>{
    try{
        const response = await axios.post('http://localhost:8800/register',{
            ...registrationData
        })
        return response.data;
    }catch (err) {
        return err.message;
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        showLoginPopUp: (state) => {
            return {...state, showPopUp: true}
        },
        hideLoginPopUp: (state) => {
            return {...state, showPopUp: false}
        },
        logout: (state) => {
            return {isLoggedIn: false, showWarning: false, userDetails: {name:''} }
        },
        showLogoutWarning: (state)=>{
            return {...state, showWarning: true}
        },
        hideLogoutWarning: (state)=> {
            return {...state, showWarning: false}
        },
        checkUser: (state)=>{
            return {...state}
        }
    },
    extraReducers(builder) {
        builder
            .addCase(loginPost.fulfilled, (state, action)=>{
                if (action.payload.status === 'logged in'){
                    const result = action.payload;
                    var tempUser;
                    switch (result.role){
                        case 'customer':
                            tempUser = {
                                name: result.username,
                                role: result.role,
                                mobile: result.mobile,
                                shipping: result.shipping,
                                state: result.state,
                            }
                            break;
                        case 'merchant':
                            tempUser = {
                                name: result.username,
                                role: result.role,
                                mobile: result.mobile,
                            }
                            break;
                        default:
                            tempUser = null;
                            break;
                    }
                    return { isLoggedIn: true, userID: result.username, userDetails: tempUser};
                }
                return {...state, loginStatus: action.payload.status};
            })
            .addCase(registerPost.fulfilled, (state, action)=>{
                return action
            })
            .addCase(checkUsernamePost.fulfilled, (state, action)=>{
                return action
            })
    }
})

export const {showLoginPopUp, hideLoginPopUp, logout, showLogoutWarning, hideLogoutWarning, checkUser} = userSlice.actions;
export default userSlice.reducer;