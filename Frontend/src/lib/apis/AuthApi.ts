import axios from "axios";
import type { LoginFormData, SignupFormData } from "../../types/auth";
import { BASE_URL } from "../constants";
import { getSession, setSession } from "../utils/Session";

const base_url: string = BASE_URL;

export const signupAPI = async (formData: SignupFormData) => {
  try {
    const response = await axios.post(base_url + "/auth/signup", formData);
    if (response.status === 200) {
      let res = {
        status: 200,
        msg: response.data.message,
      };
      return res;
    } else {
      let res = {
        status: response.status,
        msg: response.data.message,
      };
      return res;
    }
  } catch (error: any) {
    let res = {
      status: error.status,
      msg: error.response.data.message,
    };
    return res;
  }
};

export const loginAPI = async (formData: LoginFormData) => {
  try {
    const response = await axios.post(base_url + "/auth/login", formData);
    if (response.status === 200) {
      await setSession("token", response.data.token);
      console.log(response.data.token);
      let res = {
        status: 200,
        msg: response.data.message,
      };
      return res;
    } else {
      let res = {
        status: response.status,
        msg: response.data.message,
      };
      return res;
    }
  } catch (error: any) {
    let res = {
      status: error.status,
      msg: error.response.data.message,
    };
    return res;
  }
};

export const verifyToken = async () => {
  try {
    const token = getSession("token");
    if (!token)
      return {
        loginStatus: false,
        status: 403,
        msg: "Token not found!",
        user: null,
      };

    const response = await axios.post(BASE_URL + "/auth/verify/token", null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      let res = {
        status: 200,
        loginStatus: true,
        msg: response.data.message,
        user: response.data.user,
      };
      return res;
    } else {
      let res = {
        loginStatus: false,
        status: response.status,
        msg: response.data.message,
        user: null,
      };
      return res;
    }
  } catch (error: any) {
    let res = {
      loginStatus: false,
      status: error.status,
      msg: error.response.data.message,
      user: null,
    };
    return res;
  }
};

export const isLoggedIn = async () => {
  const res = await verifyToken();
  if (res.status === 200 && res.loginStatus) {
    return true;
  } else return false;
};
