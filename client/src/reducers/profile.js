import {
    PROFILE_ERROR,
    GET_PROFILE
} from '../actions/types';

initialstate = {
    profile: null,
    profiles: [],
    errors: {},
    repos: [],
    loading: true
}

export default function(state = initialState, action){
    const {type, payload} = action;

    switch (type){
        case GET_PROFILE:
            return{
                ...state,
                profile: payload,
                loading: false
            };
        case PROFILE_ERROR:
            return {
                ...state,
                errors: payload,
                loading: false
            };
        default:
            return state;
    }
}