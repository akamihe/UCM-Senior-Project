const API_URL = 'http://localhost:8443'

export const USER_NAME_SESSION_ATTRIBUTE_NAME = 'authenticatedUser'
export const USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME = 'gameUser'

export default class ApiCallerService {
    static getHeader(authOveride=false) {
        var ret =  {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            //'Host': 'TODO'
        };
        if(!authOveride) {
            let user = JSON.parse(sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME));
            ret['token'] = user.awt_token;
            ret['userId'] = user.userId;
        }  
        return ret;
    }
    static fetchCall(endpoint, type, data, authOveride=false) {
        return fetch(`${API_URL}/${endpoint}`,
            {
                method: type,
                headers: this.getHeader(authOveride),
                body: JSON.stringify(data)
            },
        );
    }
    static get(endpoint, data) {
        return this.fetchCall(endpoint, 'get', data);
    }
    static post(endpoint,data) {
        return this.fetchCall(endpoint, 'post', data);
    }
    static postNoAuth(endpoint, data) {
        return this.fetchCall(endpoint, 'post', data, true);
    }
    static put(endpoint, data) {
        return this.fetchCall(endpoint, 'put', data);
    }
    static delete(endpoint, data) {
        return this.fetchCall(endpoint, 'delete', data);
    }
}
